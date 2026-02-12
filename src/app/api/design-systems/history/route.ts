import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

const db = prisma as any

// GET - Fetch design history for user
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    // Find user
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch design history
    const history = await db.designHistory.findMany({
      where: {
        userId: user.id,
        ...(type && { type })
      },
      take: limit
    })

    return NextResponse.json({ history })

  } catch (error) {
    console.error('Error fetching design history:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch design history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Add new entry to design history
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { designSystemId, name, description, prompt, type } = body

    // Find user
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create history entry
    const history = await db.designHistory.create({
      data: {
        userId: user.id,
        designSystemId,
        name,
        description,
        prompt,
        type: type || 'design-system'
      }
    })

    return NextResponse.json({ history })

  } catch (error) {
    console.error('Error creating design history:', error)
    return NextResponse.json(
      {
        error: 'Failed to create design history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Clear design history
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete all history entries for user
    await db.designHistory.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error clearing design history:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear design history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
