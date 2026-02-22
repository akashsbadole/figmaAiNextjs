'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CreditCard,
  Sparkles,
  Check,
  X,
  Loader2,
  Zap,
  Crown,
  Building2
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  displayName: string
  description: string
  price: number
  credits: number
  features: string[]
  maxProjects: number
  maxTeamMembers: number
  prioritySupport: boolean
}

interface CreditInfo {
  total: number
  used: number
  remaining: number
  planName: string
  planId: string | null
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansRes, creditsRes] = await Promise.all([
        fetch('/api/subscriptions/plans'),
        fetch('/api/credits/balance')
      ])

      const plansData = await plansRes.json()
      const creditsData = await creditsRes.json()

      if (plansData.success) setPlans(plansData.plans)
      if (creditsData.success) setCredits(creditsData.credits)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true)
    setSelectedPlan(planId)

    try {
      // Create PayPal order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()

      if (data.success && data.approveUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.approveUrl
      } else {
        alert('Failed to create order. Please try again.')
        setIsProcessing(false)
        setSelectedPlan(null)
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('An error occurred. Please try again.')
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  const getPlanIcon = (name: string) => {
    switch (name) {
      case 'basic':
        return <Zap className="h-6 w-6" />
      case 'pro':
        return <Crown className="h-6 w-6" />
      case 'enterprise':
        return <Building2 className="h-6 w-6" />
      default:
        return <Sparkles className="h-6 w-6" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Subscription</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Current Plan */}
          {credits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your subscription and credit usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold">{credits.planName}</span>
                      {credits.planId && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {credits.remaining} credits remaining of {credits.total}
                    </p>
                    <Progress 
                      value={(credits.remaining / credits.total) * 100} 
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {credits.used} credits used this period
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{credits.remaining}</div>
                      <div className="text-sm text-muted-foreground">Credits Left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{credits.used}</div>
                      <div className="text-sm text-muted-foreground">Used</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Choose a Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.name === 'pro' ? 'border-primary' : ''}`}
                >
                  {plan.name === 'pro' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getPlanIcon(plan.name)}
                      </div>
                      <div>
                        <CardTitle>{plan.displayName}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.credits} AI credits per month
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.name === 'pro' ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : credits?.planId === plan.id ? (
                        'Current Plan'
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">What are AI credits?</h3>
                <p className="text-sm text-muted-foreground">
                  AI credits are used when generating design systems, Figma exports, and other AI-powered features. Each operation consumes a certain number of credits.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Do credits roll over?</h3>
                <p className="text-sm text-muted-foreground">
                  No, credits reset at the beginning of each billing cycle. Unused credits do not carry over.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Can I upgrade or downgrade?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-medium">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept PayPal for all subscription payments. This provides a secure and trusted payment experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}