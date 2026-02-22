import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { addCredits, logUserActivity } from '@/lib/subscription'

// PayPal API base URL
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get pending transaction
    const transaction = await db.transaction.findFirst({
      where: { 
        paypalOrderId: orderId,
        status: 'pending'
      },
      include: { user: true }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Capture the PayPal order
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json()
      console.error('PayPal capture failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to capture payment' },
        { status: 500 }
      )
    }

    const captureData = await captureResponse.json()
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id
    const payerId = captureData.payer?.payer_id

    // Get plan from reference_id
    const planId = captureData.purchase_units?.[0]?.reference_id
    
    if (planId) {
      const plan = await db.subscriptionPlan.findUnique({
        where: { id: planId }
      })

      if (plan) {
        // Calculate subscription period
        const now = new Date()
        const periodEnd = new Date(now)
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        // Check if user already has subscription
        const existingSubscription = await db.subscription.findUnique({
          where: { userId: transaction.userId }
        })

        if (existingSubscription) {
          // Update existing subscription
          await db.subscription.update({
            where: { userId: transaction.userId },
            data: {
              planId: plan.id,
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              creditsRemaining: plan.credits,
              creditsUsed: 0,
              paypalSubscriptionId: orderId,
              cancelAtPeriodEnd: false,
              cancelledAt: null
            }
          })
        } else {
          // Create new subscription
          await db.subscription.create({
            data: {
              userId: transaction.userId,
              planId: plan.id,
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              creditsRemaining: plan.credits,
              creditsUsed: 0,
              paypalSubscriptionId: orderId
            }
          })
        }

        // Add credits to user
        await addCredits(
          transaction.userId,
          plan.credits,
          'subscription',
          `${plan.displayName} Plan Subscription`
        )

        // Log activity
        await logUserActivity(
          transaction.userId,
          'subscription_created',
          'subscription',
          undefined,
          { planName: plan.name, planId: plan.id }
        )
      }
    }

    // Update transaction
    await db.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'completed',
        paypalCaptureId: captureId,
        paypalPayerId: payerId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully'
    })
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    )
  }
}