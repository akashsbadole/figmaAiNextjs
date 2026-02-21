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
import { Palette, ArrowLeft, Sparkles, Loader2, Copy, Download, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { generateFigmaJsonFromDesignSystem } from '@/lib/figma-template-generator'
import type { FigmaJsonRoot } from '@/lib/figma-json-format'

const EXAMPLE_PROMPTS = [
  "Create a fintech dashboard design system with modern blue theme, professional, minimal, accessibility friendly.",
  "Design an e-commerce fashion brand design system with elegant typography, warm color palette, and modern aesthetics.",
  "Generate a healthtech app design system with calming green tones, clean medical-grade design, and high contrast for accessibility.",
  "Build an edtech platform design system with playful colors, friendly rounded shapes, and engaging visual hierarchy.",
]

export default function GeneratePage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [systemName, setSystemName] = useState('')
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
  const [showComponentSelection, setShowComponentSelection] = useState(false)
  const [showCustomTokens, setShowCustomTokens] = useState(false)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([
    'buttons', 'inputs', 'cards', 'typography', 'colors', 'spacing'
  ])

  // Custom Design Tokens
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')
  const [accentColor, setAccentColor] = useState('#10b981')
  const [errorColor, setErrorColor] = useState('#ef4444')
  const [warningColor, setWarningColor] = useState('#f59e0b')
  const [successColor, setSuccessColor] = useState('#22c55e')
  const [fontFamily, setFontFamily] = useState('')
  const [headingFont, setHeadingFont] = useState('')
  const [baseFontSize, setBaseFontSize] = useState('16')
  const [baseSpacing, setBaseSpacing] = useState('8')
  const [borderRadius, setBorderRadius] = useState('8')
  const [buttonHeight, setButtonHeight] = useState('40')
  const [inputHeight, setInputHeight] = useState('40')
  const [generatedDesignSystem, setGeneratedDesignSystem] = useState<any>(null)
  const [figmaJson, setFigmaJson] = useState<FigmaJsonRoot | null>(null)
  const [copied, setCopied] = useState(false)
  const { isCreating, createDesignSystem, currentDesignSystem, fetchDesignSystemById } = useDesignSystemStore()

  // Component categories for selection
  const componentCategories = {
    'Foundations': [
      { id: 'colors', name: 'Color Palette', description: 'Primary, secondary, semantic colors' },
      { id: 'typography', name: 'Typography', description: 'Font families, sizes, weights' },
      { id: 'spacing', name: 'Spacing Scale', description: 'Margin, padding system' },
      { id: 'elevation', name: 'Elevation & Shadows', description: 'Shadow depths, z-index' },
      { id: 'borders', name: 'Borders & Radius', description: 'Border styles, corner radius' },
      { id: 'icons', name: 'Icon System', description: 'Icon library and guidelines' },
    ],
    'Basic Components': [
      { id: 'buttons', name: 'Buttons', description: 'Primary, secondary, ghost variants' },
      { id: 'inputs', name: 'Input Fields', description: 'Text, email, password inputs' },
      { id: 'checkboxes', name: 'Checkboxes & Radio', description: 'Selection controls' },
      { id: 'toggles', name: 'Toggles & Switches', description: 'On/off controls' },
      { id: 'badges', name: 'Badges & Tags', description: 'Status indicators, labels' },
      { id: 'avatars', name: 'Avatars', description: 'User profile images' },
      { id: 'links', name: 'Links', description: 'Text links with states' },
    ],
    'Feedback & Overlays': [
      { id: 'alerts', name: 'Alerts & Banners', description: 'Success, warning, error messages' },
      { id: 'modals', name: 'Modals & Dialogs', description: 'Pop-up windows' },
      { id: 'tooltips', name: 'Tooltips', description: 'Hover information' },
      { id: 'loaders', name: 'Loaders & Progress', description: 'Spinners, progress bars' },
      { id: 'toasts', name: 'Toasts & Snackbars', description: 'Temporary notifications' },
      { id: 'popovers', name: 'Popovers', description: 'Contextual overlays' },
    ],
    'Navigation': [
      { id: 'menus', name: 'Menus & Dropdowns', description: 'Navigation menus' },
      { id: 'breadcrumbs', name: 'Breadcrumbs', description: 'Path navigation' },
      { id: 'tabs', name: 'Tabs', description: 'Content switching' },
      { id: 'pagination', name: 'Pagination', description: 'Page navigation' },
      { id: 'accordion', name: 'Accordion', description: 'Expandable sections' },
      { id: 'navbar', name: 'Navigation Bar', description: 'Top/side navigation' },
      { id: 'sidebar', name: 'Sidebar', description: 'Side panel navigation' },
    ],
    'Data Display': [
      { id: 'cards', name: 'Cards', description: 'Content containers' },
      { id: 'tables', name: 'Data Tables', description: 'Sortable, filterable tables' },
      { id: 'lists', name: 'Lists', description: 'Ordered and unordered lists' },
      { id: 'stats', name: 'Stats & KPIs', description: 'Metric displays' },
      { id: 'charts', name: 'Charts & Graphs', description: 'Data visualization' },
      { id: 'timeline', name: 'Timeline', description: 'Chronological events' },
      { id: 'tree', name: 'Tree View', description: 'Hierarchical data' },
    ],
    'Forms & Input': [
      { id: 'forms', name: 'Form Layouts', description: 'Complete form structures' },
      { id: 'textarea', name: 'Text Area', description: 'Multi-line text input' },
      { id: 'select', name: 'Select Dropdowns', description: 'Option selection' },
      { id: 'datepicker', name: 'Date Picker', description: 'Calendar selection' },
      { id: 'slider', name: 'Sliders', description: 'Range selection' },
      { id: 'fileupload', name: 'File Upload', description: 'Drag-drop file input' },
      { id: 'multiselect', name: 'Multi-Select', description: 'Tag-based selection' },
    ],
    'Layout & Structure': [
      { id: 'grid', name: 'Grid System', description: '12-column responsive grid' },
      { id: 'containers', name: 'Containers', description: 'Content wrappers' },
      { id: 'dividers', name: 'Dividers', description: 'Section separators' },
      { id: 'aspectratio', name: 'Aspect Ratio', description: 'Responsive containers' },
      { id: 'carousel', name: 'Carousel', description: 'Image/content slider' },
      { id: 'emptystate', name: 'Empty States', description: 'No data displays' },
    ],
  }

  const toggleComponent = (componentId: string) => {
    setSelectedComponents(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  const selectAllInCategory = (category: string) => {
    const categoryComponents = componentCategories[category as keyof typeof componentCategories].map(c => c.id)
    setSelectedComponents(prev => {
      const allSelected = categoryComponents.every(id => prev.includes(id))
      if (allSelected) {
        return prev.filter(id => !categoryComponents.includes(id))
      } else {
        return [...new Set([...prev, ...categoryComponents])]
      }
    })
  }

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  // Auto-generate Figma JSON when design system is loaded
  useEffect(() => {
    if (currentDesignSystem && generatedDesignSystem && !figmaJson) {
      const figmaData = generateFigmaJsonFromDesignSystem(currentDesignSystem)
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

    // Generate default system name if not provided
    let finalSystemName = systemName.trim()
    if (!finalSystemName) {
      // Create default name from industry or prompt
      if (industry && industry !== 'none') {
        finalSystemName = `${industry.charAt(0).toUpperCase() + industry.slice(1)} Design System`
      } else {
        // Extract first few words from prompt
        const words = prompt.trim().split(' ').slice(0, 3).join(' ')
        finalSystemName = `${words} Design System`
      }
    }

    // Build enhanced prompt with all selections
    let enhancedPrompt = `Design System Name: ${finalSystemName}. ${prompt}`

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

    // Add custom design tokens if provided
    const customTokens: string[] = []
    if (primaryColor !== '#3b82f6') customTokens.push(`Primary color: ${primaryColor}`)
    if (secondaryColor !== '#8b5cf6') customTokens.push(`Secondary color: ${secondaryColor}`)
    if (accentColor !== '#10b981') customTokens.push(`Accent color: ${accentColor}`)
    if (errorColor !== '#ef4444') customTokens.push(`Error color: ${errorColor}`)
    if (warningColor !== '#f59e0b') customTokens.push(`Warning color: ${warningColor}`)
    if (successColor !== '#22c55e') customTokens.push(`Success color: ${successColor}`)
    if (fontFamily) customTokens.push(`Body font: ${fontFamily}`)
    if (headingFont) customTokens.push(`Heading font: ${headingFont}`)
    if (baseFontSize !== '16') customTokens.push(`Base font size: ${baseFontSize}px`)
    if (baseSpacing !== '8') customTokens.push(`Base spacing: ${baseSpacing}px`)
    if (borderRadius !== '8') customTokens.push(`Border radius: ${borderRadius}px`)
    if (buttonHeight !== '40') customTokens.push(`Button height: ${buttonHeight}px`)
    if (inputHeight !== '40') customTokens.push(`Input height: ${inputHeight}px`)

    if (customTokens.length > 0) {
      enhancedPrompt += ` Custom design tokens: ${customTokens.join(', ')}.`
    }

    if (selectedComponents.length > 0) {
      const componentNames = selectedComponents.map(id => {
        for (const category of Object.values(componentCategories)) {
          const component = category.find(c => c.id === id)
          if (component) return component.name
        }
        return id
      }).join(', ')
      enhancedPrompt += ` Include these components: ${componentNames}.`
    }

    try {
      // Prepare advanced options
      const designPreferences = {
        colorScheme: colorScheme || undefined,
        designStyle: designStyle || undefined,
        targetPlatform: targetPlatform || undefined,
        accessibility: accessibility || undefined,
        brandPersonality: brandPersonality || undefined,
        componentStyle: componentStyle || undefined,
        layoutSystem: layoutSystem || undefined,
        typographyScale: typographyScale || undefined,
        spacingSystem: spacingSystem || undefined,
        animationStyle: animationStyle || undefined,
        iconStyle: iconStyle || undefined,
        shadowDepth: shadowDepth || undefined,
        borderStyle: borderStyle || undefined,
      }

      const customTokens = {
        primaryColor: primaryColor !== '#3b82f6' ? primaryColor : undefined,
        secondaryColor: secondaryColor !== '#8b5cf6' ? secondaryColor : undefined,
        accentColor: accentColor !== '#10b981' ? accentColor : undefined,
        errorColor: errorColor !== '#ef4444' ? errorColor : undefined,
        warningColor: warningColor !== '#f59e0b' ? warningColor : undefined,
        successColor: successColor !== '#22c55e' ? successColor : undefined,
        fontFamily: fontFamily || undefined,
        headingFont: headingFont || undefined,
        baseFontSize: baseFontSize !== '16' ? baseFontSize : undefined,
        baseSpacing: baseSpacing !== '8' ? baseSpacing : undefined,
        borderRadius: borderRadius !== '8' ? borderRadius : undefined,
        buttonHeight: buttonHeight !== '40' ? buttonHeight : undefined,
        inputHeight: inputHeight !== '40' ? inputHeight : undefined,
      }

      const result = await createDesignSystem({ 
        prompt: enhancedPrompt, 
        industry,
        designPreferences: Object.values(designPreferences).some(v => v !== undefined) ? designPreferences : undefined,
        selectedComponents: selectedComponents.length > 0 ? selectedComponents : undefined,
        customTokens: Object.values(customTokens).some(v => v !== undefined) ? customTokens : undefined,
      })
      if (result && result.id) {
        // Fetch the full design system to get all the data
        await fetchDesignSystemById(result.id)
        setGeneratedDesignSystem(result)

        // Auto-generate Figma JSON after successful generation
        setTimeout(() => {
          if (currentDesignSystem) {
            const figmaData = generateFigmaJsonFromDesignSystem(currentDesignSystem)
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
      const figmaData = generateFigmaJsonFromDesignSystem(currentDesignSystem)
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
            <UserButton />
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
              {/* System Name Input */}
              <div className="space-y-2">
                <Label htmlFor="systemName">Design System Name (Optional)</Label>
                <input
                  id="systemName"
                  type="text"
                  placeholder="e.g., Acme Design System, MyBrand UI Kit (leave empty for auto-generated name)"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-3 py-2 text-base rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-sm text-muted-foreground">
                  {systemName.trim()
                    ? `Your system will be named: "${systemName.trim()}"`
                    : industry && industry !== 'none'
                      ? `Default name will be: "${industry.charAt(0).toUpperCase() + industry.slice(1)} Design System"`
                      : 'A name will be auto-generated from your prompt'}
                </p>
              </div>

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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="universal">Universal</SelectItem>
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
                          <SelectItem value="standard">Standard</SelectItem>
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
                        <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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
                          <SelectItem value="auto">Auto-detect</SelectItem>
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

              {/* Component Selection Toggle */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowComponentSelection(!showComponentSelection)}
                  className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Component Selection</h3>
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                        {selectedComponents.length} selected
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Choose which components to include in your design system</p>
                  </div>
                  {showComponentSelection ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  )}
                </button>
              </div>

              {/* Component Selection Content */}
              {showComponentSelection && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border max-h-[600px] overflow-y-auto">
                  {Object.entries(componentCategories).map(([category, components]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between sticky top-0 bg-muted/30 py-2 z-10">
                        <h4 className="font-semibold text-sm">{category}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => selectAllInCategory(category)}
                          className="h-7 text-xs"
                        >
                          {components.every(c => selectedComponents.includes(c.id)) ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {components.map((component) => (
                          <label
                            key={component.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedComponents.includes(component.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedComponents.includes(component.id)}
                              onChange={() => toggleComponent(component.id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{component.name}</div>
                              <div className="text-xs text-muted-foreground">{component.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Design Tokens Toggle */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomTokens(!showCustomTokens)}
                  className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Custom Design Tokens</h3>
                      {(primaryColor !== '#3b82f6' || secondaryColor !== '#8b5cf6' || fontFamily || baseFontSize !== '16' || baseSpacing !== '8') && (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          Custom values set
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Specify exact colors, fonts, sizes, and spacing values</p>
                  </div>
                  {showCustomTokens ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  )}
                </button>
              </div>

              {/* Custom Design Tokens Content */}
              {showCustomTokens && (
                <div className="space-y-6 p-4 bg-muted/30 rounded-lg border">
                  {/* Color Palette */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Color Palette</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor" className="flex items-center gap-2">
                          Primary Color
                          <div className="w-6 h-6 rounded border-2 border-white shadow-sm" style={{ backgroundColor: primaryColor }} />
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="primaryColor"
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor" className="flex items-center gap-2">
                          Secondary Color
                          <div className="w-6 h-6 rounded border-2 border-white shadow-sm" style={{ backgroundColor: secondaryColor }} />
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="secondaryColor"
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="#8b5cf6"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accentColor" className="flex items-center gap-2">
                          Accent Color
                          <div className="w-6 h-6 rounded border-2 border-white shadow-sm" style={{ backgroundColor: accentColor }} />
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="accentColor"
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="#10b981"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="successColor" className="flex items-center gap-2">
                          Success Color
                          <div className="w-6 h-6 rounded border-2 border-white shadow-sm" style={{ backgroundColor: successColor }} />
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="successColor"
                            type="color"
                            value={successColor}
                            onChange={(e) => setSuccessColor(e.target.value)}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={successColor}
                            onChange={(e) => setSuccessColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="#22c55e"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="warningColor" className="flex items-center gap-2">
                          Warning Color
                          <div className="w-6 h-6 rounded border-2 border-white shadow-sm" style={{ backgroundColor: warningColor }} />
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="warningColor"
                            type="color"
                            value={warningColor}
                            onChange={(e) => setWarningColor(e.target.value)}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={warningColor}
                            onChange={(e) => setWarningColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="errorColor" className="flex items-center gap-2">
                          Error Color
                          <div className="w-6 h-6 rounded border-2 border-white shadow-sm" style={{ backgroundColor: errorColor }} />
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="errorColor"
                            type="color"
                            value={errorColor}
                            onChange={(e) => setErrorColor(e.target.value)}
                            className="h-10 w-16 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={errorColor}
                            onChange={(e) => setErrorColor(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                            placeholder="#ef4444"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Typography</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">Body Font Family</Label>
                        <input
                          id="fontFamily"
                          type="text"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="e.g., Inter, Roboto, system-ui"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="headingFont">Heading Font Family</Label>
                        <input
                          id="headingFont"
                          type="text"
                          value={headingFont}
                          onChange={(e) => setHeadingFont(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="e.g., Poppins, Montserrat (leave empty to use body font)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="baseFontSize">Base Font Size (px)</Label>
                        <input
                          id="baseFontSize"
                          type="number"
                          min="12"
                          max="24"
                          value={baseFontSize}
                          onChange={(e) => setBaseFontSize(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="16"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Spacing & Sizing */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Spacing & Sizing</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="baseSpacing">Base Spacing Unit (px)</Label>
                        <input
                          id="baseSpacing"
                          type="number"
                          min="4"
                          max="16"
                          step="4"
                          value={baseSpacing}
                          onChange={(e) => setBaseSpacing(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="8"
                        />
                        <p className="text-xs text-muted-foreground">All spacing will be multiples of this value</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="borderRadius">Border Radius (px)</Label>
                        <input
                          id="borderRadius"
                          type="number"
                          min="0"
                          max="24"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="8"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buttonHeight">Button Height (px)</Label>
                        <input
                          id="buttonHeight"
                          type="number"
                          min="32"
                          max="56"
                          value={buttonHeight}
                          onChange={(e) => setButtonHeight(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="40"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inputHeight">Input Field Height (px)</Label>
                        <input
                          id="inputHeight"
                          type="number"
                          min="32"
                          max="56"
                          value={inputHeight}
                          onChange={(e) => setInputHeight(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPrimaryColor('#3b82f6')
                        setSecondaryColor('#8b5cf6')
                        setAccentColor('#10b981')
                        setErrorColor('#ef4444')
                        setWarningColor('#f59e0b')
                        setSuccessColor('#22c55e')
                        setFontFamily('')
                        setHeadingFont('')
                        setBaseFontSize('16')
                        setBaseSpacing('8')
                        setBorderRadius('8')
                        setButtonHeight('40')
                        setInputHeight('40')
                      }}
                    >
                      Reset to Defaults
                    </Button>
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
