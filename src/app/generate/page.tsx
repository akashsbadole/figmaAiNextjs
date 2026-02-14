'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { useDesignSystemStore } from '@/store/useDesignSystemStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, ArrowLeft, Sparkles, Loader2, Copy, Download, Check, Code2, ChevronDown, ChevronUp } from 'lucide-react'

// Figma format JSON structure type
interface FigmaTextChild {
  type: 'text'
  text: string
  fontSize: number
  fontWeight?: string
  color: string
}

interface FigmaContainer {
  name: string
  type: 'container'
  backgroundColor: string
  padding: number
  cornerRadius: number
  children: FigmaTextChild[]
}

type FigmaFormatItem = FigmaContainer

// Helper function to extract numeric value from string (e.g., "16px" -> 16)
function parseNumericValue(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''))
  return isNaN(parsed) ? defaultValue : parsed
}

// Helper function to get color from design system color scale
function getColorFromScale(colorScale: Record<string, string> | undefined, shade: string, fallback: string): string {
  if (!colorScale) return fallback
  return colorScale[shade] || colorScale['DEFAULT'] || fallback
}

// Helper function to get font weight string from design system
function getFontWeight(typography: any, weightKey: string): string {
  const weights = typography?.fontWeight || {}
  const weightValue = weights[weightKey] || weights['medium'] || '500'
  // Convert weight value to readable name
  const weightMap: Record<string, string> = {
    '100': 'Thin',
    '200': 'ExtraLight',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'SemiBold',
    '700': 'Bold',
    '800': 'ExtraBold',
    '900': 'Black',
  }
  return weightMap[weightValue] || weightValue || 'Medium'
}

// Helper function to get font size from design system
function getFontSize(typography: any, sizeKey: string, defaultSize: number): number {
  const sizes = typography?.fontSize || {}
  const sizeValue = sizes[sizeKey] || sizes['base']
  return parseNumericValue(sizeValue, defaultSize)
}

// Helper function to get padding from design system spacing
function getPadding(spacing: any, key: string, defaultPadding: number): number {
  const values = spacing?.values || {}
  const paddingValue = values[key] || values['4']
  return parseNumericValue(paddingValue, defaultPadding)
}

// Helper function to get border radius from design system
function getCornerRadius(borderRadius: any, key: string, defaultRadius: number): number {
  if (!borderRadius) return defaultRadius
  const radiusValue = borderRadius[key] || borderRadius['md']
  return parseNumericValue(radiusValue, defaultRadius)
}

// Function to generate Figma format JSON from design system
function generateFigmaFormatJson(designSystem: any): FigmaFormatItem[] {
  // Extract design system properties with fallbacks
  const colors = designSystem.colors || {}
  const typography = designSystem.typography || {}
  const spacing = designSystem.spacing || {}
  const borderRadius = designSystem.borderRadius || {}
  const components = designSystem.components || {}
  const industry = designSystem.industry || 'general'

  // Extract colors
  const primaryColor = getColorFromScale(colors.primary, '500', '#18A0FB')
  const secondaryColor = getColorFromScale(colors.secondary, '500', '#6B7280')
  const accentColor = getColorFromScale(colors.accent, '500', '#F59E0B')
  const textColor = getColorFromScale(colors.neutral, '900', '#000000')
  const textMutedColor = getColorFromScale(colors.neutral, '600', '#6B7280')
  const backgroundColor = getColorFromScale(colors.neutral, '50', '#FFFFFF')
  const cardBackground = components.card?.background || '#FFFFFF'

  // Extract typography values
  const titleFontSize = getFontSize(typography, 'xl', 18)
  const bodyFontSize = getFontSize(typography, 'base', 16)
  const titleFontWeight = getFontWeight(typography, 'medium')

  // Extract spacing and border radius
  const paddingValue = getPadding(spacing, '4', 16)
  const cornerRadiusValue = getCornerRadius(borderRadius, 'md', 8)

  // Generate content based on industry
  const getIndustryContent = (industry: string) => {
    const contentMap: Record<string, { items: Array<{ title: string; subtitle: string }> }> = {
      fintech: {
        items: [
          { title: 'Premium Account', subtitle: '$29.99/mo' },
          { title: 'Investment Portfolio', subtitle: '$39.99/mo' },
          { title: 'Wealth Management', subtitle: '$49.99/mo' },
        ]
      },
      ecommerce: {
        items: [
          { title: 'Product Item 1', subtitle: '$29.99' },
          { title: 'Product Item 2', subtitle: '$39.99' },
          { title: 'Product Item 3', subtitle: '$49.99' },
        ]
      },
      healthtech: {
        items: [
          { title: 'Health Checkup', subtitle: '$29.99' },
          { title: 'Wellness Plan', subtitle: '$39.99' },
          { title: 'Premium Care', subtitle: '$49.99' },
        ]
      },
      edtech: {
        items: [
          { title: 'Basic Course', subtitle: '$29.99' },
          { title: 'Pro Course', subtitle: '$39.99' },
          { title: 'Expert Bundle', subtitle: '$49.99' },
        ]
      },
      saas: {
        items: [
          { title: 'Starter Plan', subtitle: '$29.99/mo' },
          { title: 'Professional', subtitle: '$39.99/mo' },
          { title: 'Enterprise', subtitle: '$49.99/mo' },
        ]
      },
      consumer: {
        items: [
          { title: 'Basic Tier', subtitle: '$29.99' },
          { title: 'Plus Tier', subtitle: '$39.99' },
          { title: 'Premium Tier', subtitle: '$49.99' },
        ]
      },
      enterprise: {
        items: [
          { title: 'Team License', subtitle: '$29.99/user' },
          { title: 'Business Suite', subtitle: '$39.99/user' },
          { title: 'Enterprise Pro', subtitle: '$49.99/user' },
        ]
      },
      agency: {
        items: [
          { title: 'Brand Package', subtitle: '$29.99' },
          { title: 'Design Sprint', subtitle: '$39.99' },
          { title: 'Full Service', subtitle: '$49.99' },
        ]
      },
      general: {
        items: [
          { title: 'Item 1', subtitle: '$29.99' },
          { title: 'Item 2', subtitle: '$39.99' },
          { title: 'Item 3', subtitle: '$49.99' },
        ]
      }
    }
    return contentMap[industry] || contentMap.general
  }

  const content = getIndustryContent(industry)

  // Generate items dynamically based on design system
  return content.items.map((item, index) => ({
    name: `Item ${index + 1}`,
    type: "container",
    backgroundColor: cardBackground,
    padding: paddingValue,
    cornerRadius: cornerRadiusValue,
    children: [
      {
        type: "text",
        text: item.title,
        fontSize: titleFontSize,
        fontWeight: titleFontWeight,
        color: textColor
      },
      {
        type: "text",
        text: item.subtitle,
        fontSize: bodyFontSize,
        color: primaryColor
      }
    ]
  }))
}

const EXAMPLE_PROMPTS = [
  "Create a fintech dashboard design system with modern blue theme, professional, minimal, accessibility friendly.",
  "Design an e-commerce fashion brand design system with elegant typography, warm color palette, and modern aesthetics.",
  "Generate a healthtech app design system with calming green tones, clean medical-grade design, and high contrast for accessibility.",
  "Build an edtech platform design system with playful colors, friendly rounded shapes, and engaging visual hierarchy.",
]

export default function GeneratePage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [prompt, setPrompt] = useState('')
  const [industry, setIndustry] = useState('')
  const [colorScheme, setColorScheme] = useState('')
  const [designStyle, setDesignStyle] = useState('')
  const [targetPlatform, setTargetPlatform] = useState('')
  const [accessibility, setAccessibility] = useState('')
  const [brandPersonality, setBrandPersonality] = useState('')
  const [componentStyle, setComponentStyle] = useState('')
  const [layoutSystem, setLayoutSystem] = useState('')
  const [typographyScale, setTypographyScale] = useState('')
  const [spacingSystem, setSpacingSystem] = useState('')
  const [animationStyle, setAnimationStyle] = useState('')
  const [iconStyle, setIconStyle] = useState('')
  const [shadowDepth, setShadowDepth] = useState('')
  const [borderStyle, setBorderStyle] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showUIPreferences, setShowUIPreferences] = useState(false)
  const [generatedDesignSystem, setGeneratedDesignSystem] = useState<any>(null)
  const [figmaJson, setFigmaJson] = useState<FigmaFormatItem[] | null>(null)
  const [copied, setCopied] = useState(false)
  const { isCreating, createDesignSystem, currentDesignSystem, fetchDesignSystemById } = useDesignSystemStore()

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  // Auto-generate Figma JSON when design system is loaded
  useEffect(() => {
    if (currentDesignSystem && generatedDesignSystem && !figmaJson) {
      const figmaData = generateFigmaFormatJson(currentDesignSystem)
      setFigmaJson(figmaData)
    }
  }, [currentDesignSystem, generatedDesignSystem, figmaJson])

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render anything if not signed in (will redirect)
  if (!isSignedIn) {
    return null
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // Build enhanced prompt with all selections
    let enhancedPrompt = prompt

    if (colorScheme) {
      enhancedPrompt += ` Use a ${colorScheme} color scheme.`
    }
    if (designStyle) {
      enhancedPrompt += ` Design style should be ${designStyle}.`
    }
    if (targetPlatform) {
      enhancedPrompt += ` Optimized for ${targetPlatform}.`
    }
    if (accessibility) {
      enhancedPrompt += ` Accessibility level: ${accessibility}.`
    }
    if (brandPersonality) {
      enhancedPrompt += ` Brand personality: ${brandPersonality}.`
    }
    if (componentStyle) {
      enhancedPrompt += ` Component style: ${componentStyle}.`
    }
    if (layoutSystem) {
      enhancedPrompt += ` Layout system: ${layoutSystem}.`
    }
    if (typographyScale) {
      enhancedPrompt += ` Typography scale: ${typographyScale}.`
    }
    if (spacingSystem) {
      enhancedPrompt += ` Spacing system: ${spacingSystem}.`
    }
    if (animationStyle) {
      enhancedPrompt += ` Animation style: ${animationStyle}.`
    }
    if (iconStyle) {
      enhancedPrompt += ` Icon style: ${iconStyle}.`
    }
    if (shadowDepth) {
      enhancedPrompt += ` Shadow depth: ${shadowDepth}.`
    }
    if (borderStyle) {
      enhancedPrompt += ` Border style: ${borderStyle}.`
    }

    try {
      const result = await createDesignSystem({ prompt: enhancedPrompt, industry })
      if (result && result.id) {
        // Fetch the full design system to get all the data
        await fetchDesignSystemById(result.id)
        setGeneratedDesignSystem(result)

        // Auto-generate Figma JSON after successful generation
        setTimeout(() => {
          if (currentDesignSystem) {
            const figmaData = generateFigmaFormatJson(currentDesignSystem)
            setFigmaJson(figmaData)
          }
        }, 500)
      } else {
        alert('Failed to generate design system. Please try again.')
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('An error occurred while generating the design system.')
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  // Generate Figma JSON when design system is available
  const handleGenerateFigmaJson = () => {
    if (currentDesignSystem) {
      const figmaData = generateFigmaFormatJson(currentDesignSystem)
      setFigmaJson(figmaData)
    }
  }

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    if (figmaJson) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(figmaJson, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  // Download JSON as file
  const handleDownloadJson = () => {
    if (figmaJson) {
      const blob = new Blob([JSON.stringify(figmaJson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'figma-design-system.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  // Navigate to design system detail page
  const handleViewDesignSystem = () => {
    if (generatedDesignSystem) {
      router.push(`/design-system/${generatedDesignSystem.id}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DesignAI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>AI Design System Generator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Describe Your Perfect Design System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell us about your brand, industry, and design preferences. Our AI will create a complete, production-ready design system for you.
            </p>
          </div>

          {/* Generator Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Your System
              </CardTitle>
              <CardDescription>
                Be as specific or as creative as you like. The more details you provide, the better the results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input - Moved to top */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Your Design Vision</Label>
                <Textarea
                  id="prompt"
                  placeholder="Create a modern fintech dashboard with a professional blue color scheme, clean typography, and accessibility-friendly contrast ratios. The design should feel trustworthy and minimal..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] text-base resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Describe colors, typography style, mood, target audience, and any specific requirements.
                </p>
              </div>

              {/* Industry Selection */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry for better results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fintech">Fintech / Finance</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="healthtech">Healthtech / Healthcare</SelectItem>
                    <SelectItem value="edtech">Edtech / Education</SelectItem>
                    <SelectItem value="saas">SaaS / B2B</SelectItem>
                    <SelectItem value="consumer">Consumer App</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="agency">Agency / Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Options Toggle */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Advanced Options</h3>
                      {(colorScheme || designStyle || targetPlatform || accessibility || brandPersonality) && (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          {[colorScheme, designStyle, targetPlatform, accessibility, brandPersonality].filter(Boolean).length} selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Fine-tune your design system with detailed preferences</p>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  )}
                </button>
              </div>

              {/* Advanced Options Content */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Color Scheme */}
                    <div className="space-y-2">
                      <Label htmlFor="colorScheme">Color Scheme</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger id="colorScheme">
                          <SelectValue placeholder="Choose color palette" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="monochromatic">Monochromatic</SelectItem>
                          <SelectItem value="analogous">Analogous</SelectItem>
                          <SelectItem value="complementary">Complementary</SelectItem>
                          <SelectItem value="triadic">Triadic</SelectItem>
                          <SelectItem value="warm">Warm Tones</SelectItem>
                          <SelectItem value="cool">Cool Tones</SelectItem>
                          <SelectItem value="vibrant">Vibrant & Bold</SelectItem>
                          <SelectItem value="pastel">Soft Pastels</SelectItem>
                          <SelectItem value="dark">Dark Mode First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Design Style */}
                    <div className="space-y-2">
                      <Label htmlFor="designStyle">Design Style</Label>
                      <Select value={designStyle} onValueChange={setDesignStyle}>
                        <SelectTrigger id="designStyle">
                          <SelectValue placeholder="Choose design approach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="minimal">Minimal & Clean</SelectItem>
                          <SelectItem value="modern">Modern & Sleek</SelectItem>
                          <SelectItem value="playful">Playful & Fun</SelectItem>
                          <SelectItem value="professional">Professional & Corporate</SelectItem>
                          <SelectItem value="elegant">Elegant & Sophisticated</SelectItem>
                          <SelectItem value="bold">Bold & Expressive</SelectItem>
                          <SelectItem value="organic">Organic & Natural</SelectItem>
                          <SelectItem value="futuristic">Futuristic & Tech</SelectItem>
                          <SelectItem value="retro">Retro & Vintage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target Platform */}
                    <div className="space-y-2">
                      <Label htmlFor="targetPlatform">Target Platform</Label>
                      <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                        <SelectTrigger id="targetPlatform">
                          <SelectValue placeholder="Where will this be used?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Universal</SelectItem>
                          <SelectItem value="web">Web Application</SelectItem>
                          <SelectItem value="mobile">Mobile App (iOS/Android)</SelectItem>
                          <SelectItem value="desktop">Desktop Application</SelectItem>
                          <SelectItem value="responsive">Responsive (All Devices)</SelectItem>
                          <SelectItem value="tablet">Tablet Optimized</SelectItem>
                          <SelectItem value="pwa">Progressive Web App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Accessibility Level */}
                    <div className="space-y-2">
                      <Label htmlFor="accessibility">Accessibility</Label>
                      <Select value={accessibility} onValueChange={setAccessibility}>
                        <SelectTrigger id="accessibility">
                          <SelectValue placeholder="Accessibility requirements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Standard</SelectItem>
                          <SelectItem value="wcag-aa">WCAG 2.1 AA Compliant</SelectItem>
                          <SelectItem value="wcag-aaa">WCAG 2.1 AAA Compliant</SelectItem>
                          <SelectItem value="high-contrast">High Contrast Mode</SelectItem>
                          <SelectItem value="colorblind">Colorblind Friendly</SelectItem>
                          <SelectItem value="screen-reader">Screen Reader Optimized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Brand Personality - Full Width */}
                  <div className="space-y-2">
                    <Label htmlFor="brandPersonality">Brand Personality</Label>
                    <Select value={brandPersonality} onValueChange={setBrandPersonality}>
                      <SelectTrigger id="brandPersonality">
                        <SelectValue placeholder="How should your brand feel?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Auto-detect</SelectItem>
                        <SelectItem value="trustworthy">Trustworthy & Reliable</SelectItem>
                        <SelectItem value="innovative">Innovative & Cutting-edge</SelectItem>
                        <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                        <SelectItem value="luxurious">Luxurious & Premium</SelectItem>
                        <SelectItem value="energetic">Energetic & Dynamic</SelectItem>
                        <SelectItem value="calm">Calm & Peaceful</SelectItem>
                        <SelectItem value="authoritative">Authoritative & Expert</SelectItem>
                        <SelectItem value="creative">Creative & Artistic</SelectItem>
                        <SelectItem value="sustainable">Sustainable & Eco-friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* UI/UX Preferences Toggle */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowUIPreferences(!showUIPreferences)}
                  className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">UI/UX Design Preferences</h3>
                      {(componentStyle || layoutSystem || typographyScale || spacingSystem || animationStyle || iconStyle || shadowDepth || borderStyle) && (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          {[componentStyle, layoutSystem, typographyScale, spacingSystem, animationStyle, iconStyle, shadowDepth, borderStyle].filter(Boolean).length} selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Customize components, layout, typography, and visual elements</p>
                  </div>
                  {showUIPreferences ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  )}
                </button>
              </div>

              {/* UI/UX Preferences Content */}
              {showUIPreferences && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Component Style */}
                    <div className="space-y-2">
                      <Label htmlFor="componentStyle">Component Style</Label>
                      <Select value={componentStyle} onValueChange={setComponentStyle}>
                        <SelectTrigger id="componentStyle">
                          <SelectValue placeholder="Choose component design" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="flat">Flat Design</SelectItem>
                          <SelectItem value="neumorphic">Neumorphic (Soft UI)</SelectItem>
                          <SelectItem value="glassmorphic">Glassmorphic (Frosted Glass)</SelectItem>
                          <SelectItem value="material">Material Design</SelectItem>
                          <SelectItem value="ios">iOS Native Style</SelectItem>
                          <SelectItem value="fluent">Fluent Design</SelectItem>
                          <SelectItem value="brutalist">Brutalist</SelectItem>
                          <SelectItem value="skeuomorphic">Skeuomorphic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Layout System */}
                    <div className="space-y-2">
                      <Label htmlFor="layoutSystem">Layout System</Label>
                      <Select value={layoutSystem} onValueChange={setLayoutSystem}>
                        <SelectTrigger id="layoutSystem">
                          <SelectValue placeholder="Choose layout approach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="12-column">12 Column Grid</SelectItem>
                          <SelectItem value="8-point">8-Point Grid System</SelectItem>
                          <SelectItem value="4-point">4-Point Grid System</SelectItem>
                          <SelectItem value="flexbox">Flexbox Based</SelectItem>
                          <SelectItem value="css-grid">CSS Grid Based</SelectItem>
                          <SelectItem value="container-queries">Container Queries</SelectItem>
                          <SelectItem value="fluid">Fluid/Responsive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Typography Scale */}
                    <div className="space-y-2">
                      <Label htmlFor="typographyScale">Typography Scale</Label>
                      <Select value={typographyScale} onValueChange={setTypographyScale}>
                        <SelectTrigger id="typographyScale">
                          <SelectValue placeholder="Choose type scale" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="minor-second">Minor Second (1.067)</SelectItem>
                          <SelectItem value="major-second">Major Second (1.125)</SelectItem>
                          <SelectItem value="minor-third">Minor Third (1.200)</SelectItem>
                          <SelectItem value="major-third">Major Third (1.250)</SelectItem>
                          <SelectItem value="perfect-fourth">Perfect Fourth (1.333)</SelectItem>
                          <SelectItem value="golden-ratio">Golden Ratio (1.618)</SelectItem>
                          <SelectItem value="custom-large">Large Scale (Headings)</SelectItem>
                          <SelectItem value="custom-small">Compact Scale (Dense UI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Spacing System */}
                    <div className="space-y-2">
                      <Label htmlFor="spacingSystem">Spacing System</Label>
                      <Select value={spacingSystem} onValueChange={setSpacingSystem}>
                        <SelectTrigger id="spacingSystem">
                          <SelectValue placeholder="Choose spacing scale" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="4px">4px Base (Tight)</SelectItem>
                          <SelectItem value="8px">8px Base (Standard)</SelectItem>
                          <SelectItem value="16px">16px Base (Spacious)</SelectItem>
                          <SelectItem value="fibonacci">Fibonacci Sequence</SelectItem>
                          <SelectItem value="t-shirt">T-Shirt Sizes (XS-XL)</SelectItem>
                          <SelectItem value="semantic">Semantic (Compact/Cozy/Comfortable)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Animation Style */}
                    <div className="space-y-2">
                      <Label htmlFor="animationStyle">Animation Style</Label>
                      <Select value={animationStyle} onValueChange={setAnimationStyle}>
                        <SelectTrigger id="animationStyle">
                          <SelectValue placeholder="Choose animation approach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="none">No Animations</SelectItem>
                          <SelectItem value="subtle">Subtle & Minimal</SelectItem>
                          <SelectItem value="smooth">Smooth & Fluid</SelectItem>
                          <SelectItem value="bouncy">Bouncy & Playful</SelectItem>
                          <SelectItem value="snappy">Snappy & Quick</SelectItem>
                          <SelectItem value="elastic">Elastic & Dynamic</SelectItem>
                          <SelectItem value="spring">Spring Physics</SelectItem>
                          <SelectItem value="reduced-motion">Reduced Motion (A11y)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Icon Style */}
                    <div className="space-y-2">
                      <Label htmlFor="iconStyle">Icon Style</Label>
                      <Select value={iconStyle} onValueChange={setIconStyle}>
                        <SelectTrigger id="iconStyle">
                          <SelectValue placeholder="Choose icon design" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="outline">Outline/Stroke</SelectItem>
                          <SelectItem value="filled">Filled/Solid</SelectItem>
                          <SelectItem value="duotone">Duotone</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="sharp">Sharp/Angular</SelectItem>
                          <SelectItem value="hand-drawn">Hand-drawn</SelectItem>
                          <SelectItem value="3d">3D/Isometric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Shadow Depth */}
                    <div className="space-y-2">
                      <Label htmlFor="shadowDepth">Shadow & Elevation</Label>
                      <Select value={shadowDepth} onValueChange={setShadowDepth}>
                        <SelectTrigger id="shadowDepth">
                          <SelectValue placeholder="Choose shadow style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="none">No Shadows (Flat)</SelectItem>
                          <SelectItem value="subtle">Subtle Shadows</SelectItem>
                          <SelectItem value="medium">Medium Depth</SelectItem>
                          <SelectItem value="deep">Deep Shadows</SelectItem>
                          <SelectItem value="dramatic">Dramatic Elevation</SelectItem>
                          <SelectItem value="inner">Inner Shadows</SelectItem>
                          <SelectItem value="colored">Colored Shadows</SelectItem>
                          <SelectItem value="layered">Layered/Multiple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Border Style */}
                    <div className="space-y-2">
                      <Label htmlFor="borderStyle">Border Style</Label>
                      <Select value={borderStyle} onValueChange={setBorderStyle}>
                        <SelectTrigger id="borderStyle">
                          <SelectValue placeholder="Choose border approach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto-detect</SelectItem>
                          <SelectItem value="none">No Borders</SelectItem>
                          <SelectItem value="subtle">Subtle Borders</SelectItem>
                          <SelectItem value="prominent">Prominent Borders</SelectItem>
                          <SelectItem value="rounded">Rounded Corners</SelectItem>
                          <SelectItem value="pill">Pill Shaped</SelectItem>
                          <SelectItem value="sharp">Sharp/Square</SelectItem>
                          <SelectItem value="mixed">Mixed Radius</SelectItem>
                          <SelectItem value="outlined">Outlined Style</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Example Prompts */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Try these examples:</Label>
                <div className="space-y-2">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isCreating}
                size="lg"
                className="w-full text-lg py-6"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Your Design System...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Design System
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Free tier: 3 generations per month • Pro: Unlimited</p>
              </div>
            </CardContent>
          </Card>

          {/* Figma JSON Output Section */}
          {(generatedDesignSystem || isCreating) && (
            <Card className="border-2 shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      Generating Your Design System...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      Design System Generated Successfully!
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {isCreating
                    ? 'Please wait while we create your custom design system...'
                    : 'Your design system is ready! View the Figma-compatible JSON below or explore the full system.'
                  }
                </CardDescription>
              </CardHeader>
              {!isCreating && generatedDesignSystem && (
                <CardContent className="space-y-4">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleGenerateFigmaJson}
                      variant="outline"
                      className="gap-2"
                      disabled={!currentDesignSystem}
                    >
                      <Sparkles className="h-4 w-4" />
                      Regenerate Figma JSON
                    </Button>
                    <Button
                      onClick={handleCopyJson}
                      variant="outline"
                      className="gap-2"
                      disabled={!figmaJson}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadJson}
                      variant="outline"
                      className="gap-2"
                      disabled={!figmaJson}
                    >
                      <Download className="h-4 w-4" />
                      Download JSON
                    </Button>
                    <Button
                      onClick={handleViewDesignSystem}
                      variant="default"
                      className="gap-2 ml-auto"
                    >
                      View Full Design System
                    </Button>
                  </div>

                  {/* JSON Preview */}
                  {figmaJson ? (
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-[400px] text-sm font-mono">
                        {JSON.stringify(figmaJson, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed rounded-lg text-center">
                      <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-primary" />
                      <p className="text-muted-foreground">Generating Figma JSON...</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🎨 Complete Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Colors, typography, spacing, borders, shadows—all organized and ready to use.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🧩 Pre-built Components</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Buttons, cards, inputs, modals—styled and ready for your project.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">📦 Export Anywhere</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  JSON, CSS, Tailwind, SCSS, Figma—use with any tech stack.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-6 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DesignAI. AI Design System Generator for modern teams.</p>
        </div>
      </footer>
    </div>
  )
}
