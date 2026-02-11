import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getGeminiAI } from '@/lib/gemini'
import { randomBytes } from 'crypto'
import { auth } from '@clerk/nextjs/server'

interface DesignSystemData {
  colors: {
    primary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    secondary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    accent: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    neutral: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    success: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string }
    warning: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string }
    error: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string }
  }
  typography: {
    fontFamily: {
      sans: string[]
      serif: string[]
      mono: string[]
    }
    fontSize: {
      xs: string; sm: string; base: string; lg: string; xl: string; '2xl': string; '3xl': string; '4xl': string; '5xl': string; '6xl': string
    }
    fontWeight: {
      thin: string; extralight: string; light: string; normal: string; medium: string; semibold: string; bold: string; extrabold: string; black: string
    }
    lineHeight: {
      none: string; tight: string; snug: string; normal: string; relaxed: string; loose: string
    }
    letterSpacing: {
      tighter: string; tight: string; normal: string; wide: string; wider: string; widest: string
    }
  }
  spacing: {
    scale: number
    values: {
      0: string; 1: string; 2: string; 3: string; 4: string; 5: string; 6: string; 8: string; 10: string; 12: string; 16: string; 20: string; 24: string; 32: string; 40: string; 48: string; 56: string; 64: string; 72: string; 80: string; 96: string
    }
  }
  borderRadius: {
    sm: string; md: string; lg: string; xl: string; '2xl': string; full: string
  }
  shadows: {
    sm: string; md: string; lg: string; xl: string; '2xl': string; inner: string
  }
  components: {
    button: {
      variants: {
        primary: { background: string; color: string; hover: string; active: string; disabled: string }
        secondary: { background: string; color: string; hover: string; active: string; disabled: string }
        outline: { background: string; color: string; border: string; hover: string; active: string }
        ghost: { background: string; color: string; hover: string; active: string }
        destructive: { background: string; color: string; hover: string; active: string }
      }
      sizes: {
        sm: { padding: string; fontSize: string }
        md: { padding: string; fontSize: string }
        lg: { padding: string; fontSize: string }
      }
      borderRadius: string
    }
    card: {
      background: string
      border: string
      borderRadius: string
      padding: string
      shadow: string
      header: { padding: string; fontSize: string; fontWeight: string }
      title: { fontSize: string; fontWeight: string; lineHeight: string }
      description: { fontSize: string; color: string; lineHeight: string }
    }
    input: {
      background: string
      border: string
      borderRadius: string
      padding: string
      fontSize: string
      color: string
      placeholder: string
      focus: { border: string; ring: string }
      error: { border: string; text: string }
    }
    modal: {
      background: string
      borderRadius: string
      shadow: string
      padding: string
      maxWidth: string
      overlay: { background: string; backdrop: string }
      header: { padding: string; fontSize: string; fontWeight: string }
      title: { fontSize: string; fontWeight: string }
      body: { padding: string; fontSize: string; lineHeight: string }
    }
  }
}

const SYSTEM_PROMPT = `You are an expert UI/UX designer and design system specialist with deep knowledge of design tokens, accessibility standards (WCAG 2.1), and industry-specific design patterns. Your task is to generate complete, production-ready design systems based on user prompts.

CRITICAL REQUIREMENTS:
1. ALL colors must be valid hex codes (e.g., "#3B82F6", not "blue-500")
2. Generate full color scales from 50-950 for each color family with proper lightness variations
3. Ensure all color combinations meet WCAG AA accessibility standards (minimum 4.5:1 contrast ratio)
4. Typography values must be specific CSS values (e.g., ["Inter", "system-ui", "sans-serif"], "0.875rem", "14px")
5. Spacing should follow an 8pt grid system (base unit = 0.25rem = 4px)
6. Border radius and shadows should use specific CSS values
7. Component styles should reference the generated tokens by name or specific values
8. Respond with VALID JSON ONLY - no markdown, no explanations, no code blocks

Design system structure you must generate:
{
  "colors": {
    "primary": { "50": "#hex", "100": "#hex", ..., "950": "#hex" },
    "secondary": { "50": "#hex", ..., "950": "#hex" },
    "accent": { "50": "#hex", ..., "950": "#hex" },
    "neutral": { "50": "#hex", ..., "950": "#hex" },
    "success": { "50": "#hex", ..., "900": "#hex" },
    "warning": { "50": "#hex", ..., "900": "#hex" },
    "error": { "50": "#hex", ..., "900": "#hex" }
  },
  "typography": {
    "fontFamily": {
      "sans": ["font-name", "fallback", "category"],
      "serif": ["font-name", "fallback", "category"],
      "mono": ["font-name", "fallback", "category"]
    },
    "fontSize": {
      "xs": "value", "sm": "value", "base": "value", "lg": "value",
      "xl": "value", "2xl": "value", "3xl": "value", "4xl": "value",
      "5xl": "value", "6xl": "value"
    },
    "fontWeight": {
      "thin": "value", "extralight": "value", "light": "value", "normal": "value",
      "medium": "value", "semibold": "value", "bold": "value", "extrabold": "value", "black": "value"
    },
    "lineHeight": {
      "none": "value", "tight": "value", "snug": "value", "normal": "value",
      "relaxed": "value", "loose": "value"
    },
    "letterSpacing": {
      "tighter": "value", "tight": "value", "normal": "value",
      "wide": "value", "wider": "value", "widest": "value"
    }
  },
  "spacing": {
    "scale": 8,
    "values": {
      "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem",
      "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem",
      "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem",
      "32": "8rem", "40": "10rem", "48": "12rem", "56": "14rem",
      "64": "16rem", "72": "18rem", "80": "20rem", "96": "24rem"
    }
  },
  "borderRadius": {
    "sm": "value", "md": "value", "lg": "value", "xl": "value", "2xl": "value", "full": "value"
  },
  "shadows": {
    "sm": "value", "md": "value", "lg": "value", "xl": "value", "2xl": "value", "inner": "value"
  },
  "components": {
    "button": {
      "variants": {
        "primary": { "background": "hex/rgb", "color": "hex/rgb", "hover": "hex/rgb", "active": "hex/rgb", "disabled": "hex/rgb" },
        "secondary": { "background": "hex/rgb", "color": "hex/rgb", "hover": "hex/rgb", "active": "hex/rgb", "disabled": "hex/rgb" },
        "outline": { "background": "hex/rgb", "color": "hex/rgb", "border": "hex/rgb", "hover": "hex/rgb", "active": "hex/rgb" },
        "ghost": { "background": "hex/rgb", "color": "hex/rgb", "hover": "hex/rgb", "active": "hex/rgb" },
        "destructive": { "background": "hex/rgb", "color": "hex/rgb", "hover": "hex/rgb", "active": "hex/rgb" }
      },
      "sizes": {
        "sm": { "padding": "value", "fontSize": "value" },
        "md": { "padding": "value", "fontSize": "value" },
        "lg": { "padding": "value", "fontSize": "value" }
      },
      "borderRadius": "value"
    },
    "card": {
      "background": "hex/rgb",
      "border": "hex/rgb",
      "borderRadius": "value",
      "padding": "value",
      "shadow": "value",
      "header": { "padding": "value", "fontSize": "value", "fontWeight": "value" },
      "title": { "fontSize": "value", "fontWeight": "value", "lineHeight": "value" },
      "description": { "fontSize": "value", "color": "hex/rgb", "lineHeight": "value" }
    },
    "input": {
      "background": "hex/rgb",
      "border": "hex/rgb",
      "borderRadius": "value",
      "padding": "value",
      "fontSize": "value",
      "color": "hex/rgb",
      "placeholder": "hex/rgb",
      "focus": { "border": "hex/rgb", "ring": "hex/rgb" },
      "error": { "border": "hex/rgb", "text": "hex/rgb" }
    },
    "modal": {
      "background": "hex/rgb",
      "borderRadius": "value",
      "shadow": "value",
      "padding": "value",
      "maxWidth": "value",
      "overlay": { "background": "hex/rgb", "backdrop": "value" },
      "header": { "padding": "value", "fontSize": "value", "fontWeight": "value" },
      "title": { "fontSize": "value", "fontWeight": "value" },
      "body": { "padding": "value", "fontSize": "value", "lineHeight": "value" }
    }
  }
}

Industry-specific guidelines to apply:
- Fintech: Professional blues/greens, conservative typography, high trust, minimal design, clear hierarchy
- E-commerce: Warm colors, engaging typography, prominent CTAs, product-focused, conversion-optimized
- Healthtech: Calming greens/blues, clean medical aesthetics, high contrast, clarity-focused
- Edtech: Playful colors, friendly rounded shapes, engaging visual hierarchy, approachable
- SaaS/B2B: Professional modern, clear information architecture, productivity-focused
- Consumer: Vibrant, trendy, engaging, mobile-first, delightful interactions
- Enterprise: Conservative, professional, accessible, comprehensive, consistent
- Agency: Creative, bold, innovative, unique, memorable

Generate ONLY valid JSON that matches this exact structure.`

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { prompt, industry } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Find or create user in database
    let user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      const clerkData = await auth()
      user = await db.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkData?.user?.emailAddresses[0]?.emailAddress || `user-${clerkUserId}@designai.com`,
          name: clerkData?.user?.fullName || 'User',
          imageUrl: clerkData?.user?.imageUrl
        }
      })
    }

    // Generate a unique share slug
    const shareSlug = randomBytes(8).toString('hex').slice(0, 8)

    // Build the user prompt with industry context
    let userPrompt = `Generate a complete design system based on this description: "${prompt}"`

    if (industry) {
      userPrompt += `\n\nIndustry context: ${industry}. Apply industry-specific design patterns and best practices.`
    }

    userPrompt += `\n\nGenerate a complete, production-ready design system with colors, typography, spacing, borders, shadows, and component styles. Ensure WCAG AA accessibility compliance. Return ONLY valid JSON.`

    // Use Gemini AI to generate design system
    const gemini = getGeminiAI()
    const aiResponse = await gemini.generateText(userPrompt, SYSTEM_PROMPT)

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the AI response
    let designSystem: DesignSystemData
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()

      designSystem = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', aiResponse)
      throw new Error('Failed to parse design system from AI response')
    }

    // Generate a name for the design system
    const nameMatch = prompt.match(/Create a (.+?) design system/i) ||
                     prompt.match(/Design a (.+?) design system/i) ||
                     prompt.match(/Generate a (.+?) design system/i)
    const name = nameMatch ? nameMatch[1].trim() : 'Custom Design System'

    // Create the design system
    const savedSystem = await db.designSystem.create({
      data: {
        name,
        description: prompt.substring(0, 200),
        prompt,
        userId: user.id,
        colors: JSON.stringify(designSystem.colors),
        typography: JSON.stringify(designSystem.typography),
        spacing: JSON.stringify(designSystem.spacing),
        borderRadius: JSON.stringify(designSystem.borderRadius),
        shadows: JSON.stringify(designSystem.shadows),
        components: JSON.stringify(designSystem.components),
        industry: industry || null,
        isPublic: false,
        shareSlug
      }
    })

    return NextResponse.json({
      success: true,
      id: savedSystem.id,
      shareSlug: savedSystem.shareSlug,
      name: savedSystem.name
    })

  } catch (error) {
    console.error('Error generating design system:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
