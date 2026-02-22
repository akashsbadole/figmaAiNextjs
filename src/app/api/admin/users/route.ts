import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build where clause
    const where: Prisma.UserWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { clerkId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    // Get users with pagination
    const users = await db.user.findMany({
      where,
      include: {
        subscription: {
          include: { plan: true }
        },
        _count: {
          select: {
            designSystems: true,
            creditTransactions: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    })

    // Get total count
    const total = await db.user.count({ where })

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        status: user.status,
        statusReason: user.statusReason,
        statusUpdatedAt: user.statusUpdatedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        subscription: user.subscription ? {
          id: user.subscription.id,
          status: user.subscription.status,
          planName: user.subscription.plan.displayName,
          creditsRemaining: user.subscription.creditsRemaining,
          creditsUsed: user.subscription.creditsUsed,
          currentPeriodEnd: user.subscription.currentPeriodEnd
        } : null,
        stats: {
          designSystems: user._count.designSystems,
          creditTransactions: user._count.creditTransactions
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Bulk operations
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { action, userIds } = body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'export':
        const users = await db.user.findMany({
          where: { id: { in: userIds } },
          include: {
            subscription: { include: { plan: true } }
          }
        })
        return NextResponse.json({
          success: true,
          users: users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            status: u.status,
            createdAt: u.createdAt,
            subscription: u.subscription?.plan?.displayName || 'Free'
          }))
        })

      case 'suspend':
        await db.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            status: 'suspended',
            statusReason: 'Bulk suspension by admin',
            statusUpdatedAt: new Date()
          }
        })
        return NextResponse.json({ success: true, message: 'Users suspended' })

      case 'activate':
        await db.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            status: 'active',
            statusReason: null,
            statusUpdatedAt: new Date()
          }
        })
        return NextResponse.json({ success: true, message: 'Users activated' })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform operation' },
      { status: 500 }
    )
  }
}