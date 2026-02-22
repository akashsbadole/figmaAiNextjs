import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomInt } from 'crypto'

// Generate 6-digit OTP
function generateOTP(): string {
  return randomInt(100000, 999999).toString()
}

// Simple email sending (you should use a proper email service like Resend, SendGrid, etc.)
async function sendOTPEmail(email: string, otpCode: string, purpose: string): Promise<boolean> {
  try {
    // In production, use a proper email service
    // For now, we'll log it and return true
    console.log(`[OTP Email] To: ${email}, Code: ${otpCode}, Purpose: ${purpose}`)
    
    // Example using fetch to call an email API:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@designai.com',
    //     to: email,
    //     subject: 'Your Verification Code',
    //     html: `
    //       <h1>Your Verification Code</h1>
    //       <p>Your verification code is: <strong>${otpCode}</strong></p>
    //       <p>This code will expire in 10 minutes.</p>
    //     `
    //   })
    // })
    
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, purpose = 'verify_email', userId } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if there's a recent OTP sent (rate limiting - 1 minute)
    const recentOTP = await db.emailVerificationOTP.findFirst({
      where: {
        email: email.toLowerCase(),
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000) // 1 minute ago
        }
      }
    })

    if (recentOTP) {
      return NextResponse.json(
        { error: 'Please wait before requesting another code' },
        { status: 429 }
      )
    }

    // Generate OTP
    const otpCode = generateOTP()
    
    // Set expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Invalidate any existing unused OTPs for this email and purpose
    await db.emailVerificationOTP.updateMany({
      where: {
        email: email.toLowerCase(),
        purpose,
        isUsed: false
      },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    })

    // Create new OTP
    await db.emailVerificationOTP.create({
      data: {
        email: email.toLowerCase(),
        otpCode,
        purpose,
        expiresAt,
        userId
      }
    })

    // Send email
    const emailSent = await sendOTPEmail(email, otpCode, purpose)

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}