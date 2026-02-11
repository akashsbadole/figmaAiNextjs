import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI } from '@/lib/gemini'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'

const FIGMA_SYSTEM_PROMPT = `You are an expert Figma Design Generator AI with deep knowledge of:

1. Figma Design Structure
- Frames, components, instances
- Auto-layout and constraints
- Styles and design tokens
- Component properties and variants
- Layer hierarchy and organization

2. UI Component Design
- Buttons, cards, inputs, modals
- Navigation elements
- Data displays (tables, lists, grids)
- Forms and interactive elements
- Responsive layouts

3. Design Principles
- Visual hierarchy and spacing
- Color theory and contrast
- Typography best practices
- Alignment and grid systems
- Consistency and scalability

4. Industry-Specific Patterns
- Fintech: Data visualization, secure forms, dashboards
- E-commerce: Product cards, checkout flows, filters
- Healthtech: Medical forms, appointment scheduling, data privacy
- Edtech: Course cards, progress tracking, interactive elements
- SaaS: Onboarding flows, analytics dashboards, settings

Your Task:
Generate a complete Figma-compatible design structure based on the user's description. The output should be a JSON structure that can be converted to a Figma file or used as a reference for manual Figma creation.

Design Structure Format:
{
  "name": "Design Name",
  "description": "Brief description",
  "frames": [
    {
      "name": "Frame Name",
      "type": "FRAME",
      "width": number,
      "height": number,
      "background": "#hex",
      "children": [
        {
          "name": "Element Name",
          "type": "RECTANGLE" | "TEXT" | "GROUP" | "COMPONENT",
          "x": number,
          "y": number,
          "width": number,
          "height": number,
          "background": "#hex" | null,
          "color": "#hex" | null,
          "fontSize": number | null,
          "fontFamily": string | null,
          "fontWeight": string | null,
          "borderRadius": number | null,
          "border": {
            "color": "#hex",
            "width": number
          } | null,
          "shadow": string | null,
          "children": [] | null
        }
      ]
    }
  ],
  "components": [
    {
      "name": "Component Name",
      "type": "COMPONENT",
      "variants": [
        {
          "name": "Variant Name",
          "properties": { ... }
        }
      ]
    }
  ],
  "styles": {
    "colors": {
      "name": "#hex"
    },
    "textStyles": {
      "name": {
        "fontFamily": string,
        "fontSize": number,
        "fontWeight": string,
        "lineHeight": number
      }
    },
    "effects": {
      "name": "box-shadow value"
    }
  }
}

Guidelines:
- Use proper Figma coordinate system (top-left origin)
- Provide precise pixel values
- Include proper layer hierarchy
- Define reusable components
- Create consistent styles
- Consider responsive design principles
- Ensure proper contrast and accessibility
- Use meaningful layer names

Respond with valid JSON only. No markdown, no explanations.`

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { prompt, type } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
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

    // Build the user prompt
    let userPrompt = `Generate a complete Figma-compatible design structure based on this description: "${prompt}"`

    if (type) {
      userPrompt += `\n\nDesign type: ${type}. Apply specific patterns and best practices for this type of design.`
    }

    userPrompt += `\n\nGenerate a detailed, Figma-compatible JSON design structure with frames, components, and styles. Ensure proper layer hierarchy, precise positioning, and reusable components. Return ONLY valid JSON.`

    // Use Gemini AI to generate design
    const gemini = getGeminiAI()
    const aiResponse = await gemini.generateText(userPrompt, FIGMA_SYSTEM_PROMPT)

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the AI response
    let designData
    try {
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()

      designData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', aiResponse)
      throw new Error('Failed to parse design from AI response')
    }

    // Generate a name
    const name = designData.name || 'Figma Design'

    // Generate unique share slug
    const shareSlug = randomBytes(8).toString('hex').slice(0, 8)

    // Save to database
    const savedDesign = await db.figmaDesign.create({
      data: {
        name,
        description: prompt.substring(0, 200),
        prompt,
        userId: user.id,
        designData: JSON.stringify(designData),
        isPublic: false,
        shareSlug
      }
    })

    return NextResponse.json({
      success: true,
      id: savedDesign.id,
      shareSlug: savedDesign.shareSlug,
      name: savedDesign.name,
      designData
    })

  } catch (error) {
    console.error('Error generating Figma design:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate Figma design',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
