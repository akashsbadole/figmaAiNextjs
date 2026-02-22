import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserCredits } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const credits = await getUserCredits()
    
    if (!credits) {
      return NextResponse.json(
        { error: 'Failed to get credits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      credits
    })
  } catch (error) {
    console.error('Error getting credit balance:', error)
    return NextResponse.json(
      { error: 'Failed to get credit balance' },
      { status: 500 }
    )
  }
}