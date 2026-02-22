import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Verify admin access
    await requireAdmin()

    // Get total users count
    const totalUsers = await db.user.count()

    // Get active subscriptions count
    const activeSubscriptions = await db.subscription.count({
      where: { status: 'active' }
    })

    // Get total revenue (completed transactions)
    const transactions = await db.transaction.findMany({
      where: { status: 'completed' },
      select: { amount: true }
    })
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Get open tickets count
    const openTickets = await db.supportTicket.count({
      where: { status: 'open' }
    })

    // Get active API keys count
    const activeApiKeys = await db.aPIKey.count({
      where: { isActive: true }
    })

    // Get credits used today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const creditTransactions = await db.creditTransaction.findMany({
      where: {
        type: 'usage',
        createdAt: { gte: today }
      },
      select: { amount: true }
    })
    const creditsUsedToday = Math.abs(
      creditTransactions.reduce((sum, t) => sum + t.amount, 0)
    )

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        openTickets,
        activeApiKeys,
        creditsUsedToday
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}