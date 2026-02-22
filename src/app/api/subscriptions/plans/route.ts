import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default subscription plans to seed if not exist
const DEFAULT_PLANS = [
  {
    name: 'basic',
    displayName: 'Basic',
    description: 'Perfect for individuals and small projects',
    price: 9.00,
    credits: 100,
    features: JSON.stringify([
      '100 AI credits per month',
      'Basic design system generation',
      'Email support',
      '10 projects max',
      'Standard processing speed'
    ]),
    maxProjects: 10,
    maxTeamMembers: 1,
    prioritySupport: false
  },
  {
    name: 'pro',
    displayName: 'Pro',
    description: 'Ideal for professionals and growing teams',
    price: 29.00,
    credits: 500,
    features: JSON.stringify([
      '500 AI credits per month',
      'Advanced design system generation',
      'Priority email support',
      'Unlimited projects',
      'Fast processing speed',
      'Figma export',
      'Version history'
    ]),
    maxProjects: 50,
    maxTeamMembers: 5,
    prioritySupport: false
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'For large teams with advanced needs',
    price: 99.00,
    credits: 2000,
    features: JSON.stringify([
      '2000 AI credits per month',
      'All AI features unlocked',
      'Dedicated support manager',
      'Unlimited projects',
      'Fastest processing speed',
      'Advanced Figma integration',
      'Team collaboration',
      'Custom branding',
      'API access',
      'SSO integration'
    ]),
    maxProjects: -1, // Unlimited
    maxTeamMembers: 50,
    prioritySupport: true
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get all active plans
    let plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    // Seed default plans if none exist
    if (plans.length === 0) {
      await db.subscriptionPlan.createMany({
        data: DEFAULT_PLANS
      })
      
      plans = await db.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      })
    }

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        credits: plan.credits,
        features: JSON.parse(plan.features),
        maxProjects: plan.maxProjects,
        maxTeamMembers: plan.maxTeamMembers,
        prioritySupport: plan.prioritySupport,
        paypalPlanId: plan.paypalPlanId
      }))
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
}