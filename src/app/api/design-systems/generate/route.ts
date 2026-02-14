import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getGeminiAI } from '@/lib/gemini'
import { randomBytes } from 'crypto'
import { auth, currentUser } from '@clerk/nextjs/server'

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
        destructive: { background: string; color: string; hover: string; active: string; disabled: string }
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

// Helper function to create a fallback design system
function createFallbackDesignSystem(): DesignSystemData {
  return {
    colors: {
      primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
      secondary: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
      accent: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
      neutral: { 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' },
      success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
      warning: { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12' },
      error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' }
    },
    typography: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], serif: ['Georgia', 'serif'], mono: ['Fira Code', 'monospace'] },
      fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem' },
      fontWeight: { thin: '100', extralight: '200', light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900' },
      lineHeight: { none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' },
      letterSpacing: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' }
    },
    spacing: { scale: 8, values: { 0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem', 32: '8rem', 40: '10rem', 48: '12rem', 56: '14rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem' } },
    borderRadius: { sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px' },
    shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)', inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
    components: {
      button: {
        variants: {
          primary: { background: '#3b82f6', color: '#ffffff', hover: '#2563eb', active: '#1d4ed8', disabled: '#9ca3af' },
          secondary: { background: '#6b7280', color: '#ffffff', hover: '#4b5563', active: '#374151', disabled: '#9ca3af' },
          outline: { background: 'transparent', color: '#3b82f6', border: '#3b82f6', hover: '#eff6ff', active: '#dbeafe' },
          ghost: { background: 'transparent', color: '#374151', hover: '#f3f4f6', active: '#e5e7eb' },
          destructive: { background: '#ef4444', color: '#ffffff', hover: '#dc2626', active: '#b91c1c', disabled: '#9ca3af' }
        },
        sizes: { sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' }, md: { padding: '0.5rem 1rem', fontSize: '1rem' }, lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' } },
        borderRadius: '0.375rem'
      },
      card: { background: '#ffffff', border: '#e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', header: { padding: '1.5rem 1.5rem 0', fontSize: '1.125rem', fontWeight: '600' }, title: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.25' }, description: { fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' } },
      input: { background: '#ffffff', border: '#d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '1rem', color: '#1f2937', placeholder: '#9ca3af', focus: { border: '#3b82f6', ring: '#3b82f6' }, error: { border: '#ef4444', text: '#ef4444' } },
      modal: { background: '#ffffff', borderRadius: '0.5rem', shadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '1.5rem', maxWidth: '32rem', overlay: { background: 'rgba(0, 0, 0, 0.5)', backdrop: 'blur(4px)' }, header: { padding: '1.5rem', fontSize: '1.125rem', fontWeight: '600' }, title: { fontSize: '1.25rem', fontWeight: '600' }, body: { padding: '1.5rem', fontSize: '1rem', lineHeight: '1.5' } }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in first.' },
        { status: 401 }
      )
    }

    // Get user info from Clerk
    const clerkUser = await currentUser()

    const { prompt, industry } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Find or create user in database
    let user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      // Create new user with Clerk data
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `user-${clerkUserId}@designai.com`
      const name = clerkUser?.fullName || clerkUser?.firstName || 'User'
      const imageUrl = clerkUser?.imageUrl

      user = await db.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          name,
          imageUrl
        }
      })
    }

    // Generate a unique share slug
    const shareSlug = randomBytes(8).toString('hex').slice(0, 8)

    // Build the user prompt with industry context
    let userPrompt = `Generate a complete design system based on this description: "${prompt}"`

    if (industry && industry !== 'none') {
      userPrompt += `\n\nIndustry context: ${industry}. Apply industry-specific design patterns and best practices.`
    }

    userPrompt += `\n\nGenerate a complete, production-ready design system with colors, typography, spacing, borders, shadows, and component styles. Ensure WCAG AA accessibility compliance. Return ONLY valid JSON.`

    // Use Gemini AI to generate design system
    let designSystem: DesignSystemData

    try {
      const gemini = getGeminiAI()
      const aiResponse = await gemini.generateText(userPrompt, SYSTEM_PROMPT)

      if (!aiResponse) {
        console.warn('No response from AI, using fallback design system')
        designSystem = createFallbackDesignSystem()
      } else {
        // Parse the AI response
        try {
          // Clean up the response - remove markdown code blocks if present
          const cleanedResponse = aiResponse
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim()

          designSystem = JSON.parse(cleanedResponse)
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError)
          console.error('AI Response:', aiResponse.substring(0, 500))
          // Use fallback on parse error
          designSystem = createFallbackDesignSystem()
        }
      }
    } catch (aiError) {
      console.error('AI Generation error:', aiError)
      // Use fallback design system on AI error
      designSystem = createFallbackDesignSystem()
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
        industry: industry && industry !== 'none' ? industry : null,
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
    
    // Determine error type and return appropriate message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check for specific error types
    if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      )
    }
    
    if (errorMessage.includes('API key') || errorMessage.includes(' GEMINI')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to generate design system',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred'
      },
      { status: 500 }
    )
  }
}
