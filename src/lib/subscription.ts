import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// Default credit costs for different operations
export const CREDIT_COSTS = {
  design_system_generate: 5,
  figma_generate: 3,
  system_design_generate: 4,
  conversation_message: 1,
  agent_task: 2,
} as const

export type CreditOperation = keyof typeof CREDIT_COSTS

export interface UserCredits {
  total: number
  used: number
  remaining: number
  planName: string
  planId: string | null
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId?: string): Promise<UserCredits | null> {
  try {
    let targetUserId = userId
    
    if (!targetUserId) {
      const { userId: clerkId } = await auth()
      if (!clerkId) return null
      targetUserId = clerkId
    }

    const user = await db.user.findUnique({
      where: targetUserId.includes('user_') || targetUserId.length > 20 
        ? { clerkId: targetUserId } 
        : { id: targetUserId },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    })

    if (!user?.subscription) {
      // Default free tier - 10 credits
      return {
        total: 10,
        used: 0,
        remaining: 10,
        planName: 'Free',
        planId: null
      }
    }

    return {
      total: user.subscription.plan.credits,
      used: user.subscription.creditsUsed,
      remaining: user.subscription.creditsRemaining,
      planName: user.subscription.plan.displayName,
      planId: user.subscription.planId
    }
  } catch (error) {
    console.error('Error getting user credits:', error)
    return null
  }
}

/**
 * Check if user has enough credits for an operation
 */
export async function hasEnoughCredits(
  operation: CreditOperation,
  userId?: string
): Promise<{ hasCredits: boolean; required: number; available: number }> {
  const credits = await getUserCredits(userId)
  const required = CREDIT_COSTS[operation]
  
  if (!credits) {
    return { hasCredits: false, required, available: 0 }
  }
  
  return {
    hasCredits: credits.remaining >= required,
    required,
    available: credits.remaining
  }
}

/**
 * Deduct credits for an operation
 */
export async function deductCredits(
  operation: CreditOperation,
  userId: string,
  relatedEntityId?: string,
  relatedEntityType?: string
): Promise<{ success: boolean; newBalance: number; deducted: number }> {
  const cost = CREDIT_COSTS[operation]
  
  try {
    // Get user with subscription
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Check if user has enough credits
    const creditsInfo = await getUserCredits(userId)
    if (!creditsInfo || creditsInfo.remaining < cost) {
      return { success: false, newBalance: creditsInfo?.remaining ?? 0, deducted: 0 }
    }

    // Update subscription credits if exists
    let newBalance = creditsInfo.remaining - cost
    
    if (user.subscription) {
      await db.subscription.update({
        where: { userId },
        data: {
          creditsRemaining: newBalance,
          creditsUsed: { increment: cost }
        }
      })
    }

    // Create credit transaction
    await db.creditTransaction.create({
      data: {
        userId,
        amount: -cost,
        balance: newBalance,
        type: 'usage',
        description: `Credits used for ${operation.replace(/_/g, ' ')}`,
        relatedEntityId,
        relatedEntityType
      }
    })

    return { success: true, newBalance, deducted: cost }
  } catch (error) {
    console.error('Error deducting credits:', error)
    throw error
  }
}

/**
 * Add credits to a user's account
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'subscription' | 'admin_adjustment' | 'refund',
  description?: string,
  adminId?: string,
  adminReason?: string
): Promise<{ success: boolean; newBalance: number }> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentCredits = await getUserCredits(userId)
    const newBalance = (currentCredits?.remaining ?? 0) + amount

    // Update subscription credits if exists
    if (user.subscription) {
      await db.subscription.update({
        where: { userId },
        data: {
          creditsRemaining: newBalance
        }
      })
    }

    // Create credit transaction
    await db.creditTransaction.create({
      data: {
        userId,
        amount,
        balance: newBalance,
        type,
        description,
        adminId,
        adminReason
      }
    })

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error adding credits:', error)
    throw error
  }
}

/**
 * Log user activity
 */
export async function logUserActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await db.userActivityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Error logging user activity:', error)
  }
}