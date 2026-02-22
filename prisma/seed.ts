import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create subscription plans
  const plans = [
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
      maxProjects: -1,
      maxTeamMembers: 50,
      prioritySupport: true
    }
  ]

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { name: plan.name }
    })

    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan })
      console.log(`Created plan: ${plan.displayName}`)
    } else {
      console.log(`Plan already exists: ${plan.displayName}`)
    }
  }

  // Create default system settings
  const settings = [
    { key: 'credit_cost_design_system', value: '5', description: 'Credits required for design system generation' },
    { key: 'credit_cost_figma', value: '3', description: 'Credits required for Figma generation' },
    { key: 'credit_cost_system_design', value: '4', description: 'Credits required for system design generation' },
    { key: 'credit_cost_conversation', value: '1', description: 'Credits required per conversation message' },
    { key: 'credit_cost_agent_task', value: '2', description: 'Credits required per agent task' },
    { key: 'free_tier_credits', value: '10', description: 'Default credits for free tier users' }
  ]

  for (const setting of settings) {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: setting.key }
    })

    if (!existing) {
      await prisma.systemSetting.create({ data: setting })
      console.log(`Created setting: ${setting.key}`)
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })