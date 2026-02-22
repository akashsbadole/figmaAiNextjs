import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI } from '@/lib/gemini'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

const UI_UX_SYSTEM_PROMPT = `You are an expert UI/UX Design Consultant AI with deep knowledge of:

1. User Interface Design
- Visual hierarchy and layout principles
- Color theory and accessibility (WCAG 2.1)
- Typography best practices
- Responsive and mobile-first design
- Design systems and component libraries
- Micro-interactions and animations

2. User Experience Design
- User research methodologies
- Information architecture
- User journey mapping
- Wireframing and prototyping
- Usability testing
- Conversion rate optimization
- Accessibility standards

3. Industry-Specific Expertise
- Fintech: Trust, security, clear data visualization
- E-commerce: Conversion optimization, product discovery
- Healthtech: Privacy, clarity, accessibility
- Edtech: Engagement, progress tracking, accessibility
- SaaS/B2B: Efficiency, onboarding, data clarity
- And more...

4. Design Tools & Integration
- Figma best practices
- Design tokens and handoff
- Developer handoff processes
- Design system documentation

Your Role:
- Provide actionable, specific design advice
- Suggest improvements with clear rationale
- Recommend best practices based on industry standards
- Help users think through design decisions
- Provide examples and references when helpful
- Consider accessibility in all recommendations
- Balance aesthetics with usability and business goals

Communication Style:
- Professional yet approachable
- Evidence-based recommendations
- Ask clarifying questions when needed
- Provide context and rationale for suggestions
- Be encouraging while being constructively critical

When users ask for specific design advice:
1. Understand the context (industry, audience, goals)
2. Analyze the specific problem
3. Provide actionable recommendations
4. Explain the reasoning behind each suggestion
5. Consider alternatives and trade-offs
6. Suggest next steps or resources`

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { message, conversationId, messages } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
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

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId }
      })

      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
    } else {
      // Create new conversation
      conversation = await db.conversation.create({
        data: {
          userId: user.id,
          type: 'ui-ux',
          title: message.substring(0, 50),
          messages: JSON.stringify([])
        }
      })
    }

    // Prepare message history
    const messageHistory = messages || []

    // Fetch recent design systems to provide context to the AI
    const recentDesignSystems = await db.designSystem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    let enhancedPrompt = UI_UX_SYSTEM_PROMPT
    if (recentDesignSystems.length > 0) {
      enhancedPrompt += `\n\n=== USER'S RECENT DESIGN SYSTEMS ===\n`
      enhancedPrompt += `The user has recently generated the following design systems. Use this context to provide highly tailored and specific advice if it is relevant to their question:\n\n`
      
      recentDesignSystems.forEach((ds, index) => {
        enhancedPrompt += `[Design System ${index + 1}]\n`
        enhancedPrompt += `- Name: ${ds.name}\n`
        if (ds.industry) enhancedPrompt += `- Industry: ${ds.industry}\n`
        if (ds.designPreferences) enhancedPrompt += `- Preferences: ${ds.designPreferences}\n`
        enhancedPrompt += `- Colors: ${ds.colors}\n`
        enhancedPrompt += `- Typography: ${ds.typography}\n`
        enhancedPrompt += `- Prompt Used: ${ds.prompt}\n\n`
      })
      
      enhancedPrompt += `If the user asks about "my design system", "my colors", or something similar, assume they are talking about their most recent design systems listed above. Provide specific color hex codes, font names, or layout suggestions that match their existing tokens where appropriate.`
    }

    // Use Gemini AI to generate response
    const gemini = getGeminiAI()
    const aiResponse = await gemini.chat(
      messageHistory,
      enhancedPrompt
    )

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Update conversation messages
    const updatedMessages = [
      ...messageHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ]

    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: JSON.stringify(updatedMessages),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversation.id
    })

  } catch (error) {
    console.error('Error in agent chat:', error)
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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

    // Get conversations
    const conversations = await db.conversation.findMany({
      where: {
        userId: user.id,
        type: 'ui-ux'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20
    })

    return NextResponse.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        type: conv.type,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: JSON.parse(conv.messages).length
      }))
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
