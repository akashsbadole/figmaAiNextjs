import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// DELETE - Delete a single history item by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Find the history item
    const historyItem = await db.designHistory.findUnique({
      where: { id }
    })

    if (!historyItem) {
      return NextResponse.json(
        { error: 'History item not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (historyItem.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this history item' },
        { status: 403 }
      )
    }

    // Delete the history item
    await db.designHistory.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'History item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting history item:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete history item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH - Rename a history item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name } = body

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Find the history item
    const historyItem = await db.designHistory.findUnique({
      where: { id }
    })

    if (!historyItem) {
      return NextResponse.json(
        { error: 'History item not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (historyItem.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this history item' },
        { status: 403 }
      )
    }

    // Update the history item name
    const updatedItem = await db.designHistory.update({
      where: { id },
      data: {
        name: name.trim()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'History item renamed successfully',
      item: updatedItem
    })

  } catch (error) {
    console.error('Error renaming history item:', error)
    return NextResponse.json(
      {
        error: 'Failed to rename history item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
