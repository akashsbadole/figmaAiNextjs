import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// PayPal API base URL - use sandbox for testing
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

    // Get user from database
    let user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Create user if not exists
      const { currentUser } = await import('@clerk/nextjs/server')
      const clerkUser = await currentUser()
      
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || `user-${userId}@designai.com`,
          name: clerkUser?.fullName || clerkUser?.firstName || 'User',
          imageUrl: clerkUser?.imageUrl
        }
      })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get the plan
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: plan.id,
            description: `${plan.displayName} Plan - ${plan.credits} AI Credits`,
            amount: {
              currency_code: 'USD',
              value: plan.price.toFixed(2)
            }
          }
        ],
        application_context: {
          brand_name: 'DesignAI',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?cancelled=true`
        }
      })
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('PayPal order creation failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      )
    }

    const order = await orderResponse.json()

    // Create pending transaction
    await db.transaction.create({
      data: {
        userId: user.id,
        amount: plan.price,
        currency: 'USD',
        status: 'pending',
        type: 'subscription',
        paypalOrderId: order.id,
        subscriptionId: null,
        description: `${plan.displayName} Plan Subscription`
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approveUrl: order.links?.find((link: any) => link.rel === 'approve')?.href
    })
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}