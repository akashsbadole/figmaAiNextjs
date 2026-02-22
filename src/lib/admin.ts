import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export type AdminRole = 'admin' | 'super_admin'

export interface AdminUser {
  id: string
  clerkId: string
  email: string
  name: string | null
  imageUrl: string | null
  role: AdminRole
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    const role = user.publicMetadata?.role as string | undefined
    return role === 'admin' || role === 'super_admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get the current admin user with role information
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    
    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'admin' && role !== 'super_admin') return null

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) return null

    return {
      id: user.id,
      clerkId: userId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      role: role as AdminRole
    }
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

/**
 * Check if the current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    const role = user.publicMetadata?.role as string | undefined
    return role === 'super_admin'
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

/**
 * Set a user's admin role (super admin only)
 */
export async function setUserAdminRole(clerkId: string, role: AdminRole | null): Promise<boolean> {
  try {
    const isSuper = await isSuperAdmin()
    if (!isSuper) return false

    const client = await clerkClient()
    await client.users.updateUser(clerkId, {
      publicMetadata: { role }
    })
    
    return true
  } catch (error) {
    console.error('Error setting admin role:', error)
    return false
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
  return admin
}

/**
 * Require super admin access - throws error if not super admin
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    throw new Error('Unauthorized: Super admin access required')
  }
  return admin
}