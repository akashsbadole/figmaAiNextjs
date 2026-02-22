import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otpCode, purpose = 'verify_email' } = body

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Find the OTP record
    const otpRecord = await db.emailVerificationOTP.findFirst({
      where: {
        email: email.toLowerCase(),
        otpCode,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await db.emailVerificationOTP.update({
      where: { id: otpRecord.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    })

    // Handle different purposes
    if (purpose === 'verify_email' && otpRecord.userId) {
      const user = await db.user.findUnique({
        where: { id: otpRecord.userId }
      })
      
      if (user) {
        try {
          const client = await clerkClient()
          await client.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
              emailVerified: true,
              emailVerifiedAt: new Date().toISOString()
            }
          })
        } catch (clerkError) {
          console.error('Error updating Clerk metadata:', clerkError)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        verified: true
      })
    }

    if (purpose === 'login') {
      const user = await db.user.findFirst({
        where: {
          email: email.toLowerCase()
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Account not found. Please sign up first.' },
          { status: 404 }
        )
      }

      if (user.status === 'suspended') {
        return NextResponse.json(
          { error: 'Your account has been suspended. Please contact support.' },
          { status: 403 }
        )
      }

      if (user.status === 'banned') {
        return NextResponse.json(
          { error: 'Your account has been banned.' },
          { status: 403 }
        )
      }

      await db.userActivityLog.create({
        data: {
          userId: user.id,
          action: 'otp_login'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        verified: true,
        userId: user.clerkId
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      verified: true
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}