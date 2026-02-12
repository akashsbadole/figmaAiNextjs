'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Palette,
  Type,
  Layout,
  Box,
  Copy,
  Download,
  Share2,
  ArrowLeft,
  Loader2,
  Check,
  Layers,
  Grid3x3,
  RotateCcw,
  FileJson,
  Code2,
  Wind,
  FileCode,
  Figma,
  ExternalLink
} from 'lucide-react'

interface ColorScale {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string
}

interface Colors {
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  neutral: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
}

interface Typography {
  fontFamily: { sans: string[]; serif: string[]; mono: string[] }
  fontSize: Record<string, string>
  fontWeight: Record<string, string>
  lineHeight: Record<string, string>
  letterSpacing: Record<string, string>
}

interface Spacing {
  scale: number
  values: Record<string, string>
}

interface BorderRadius {
  sm: string; md: string; lg: string; xl: string; '2xl': string; full: string
}

interface Shadows {
  sm: string; md: string; lg: string; xl: string; '2xl': string; inner: string
}

interface Components {
  button: any
  card: any
  input: any
  modal: any
}

interface DesignSystem {
  id: string
  name: string
  description: string
  prompt: string
  colors: Colors
  typography: Typography
  spacing: Spacing
  borderRadius: BorderRadius
  shadows: Shadows
  components: Components
  industry: string | null
  shareSlug: string
  createdAt?: string
  updatedAt?: string
}

export default function DesignSystemPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  useEffect(() => {
    const fetchDesignSystem = async () => {
      const id = params.id
      if (!id) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/design-systems/${id}`)
        if (!response.ok) throw new Error('Failed to fetch design system')
        const data = await response.json()
        setDesignSystem(data)
      } catch (error) {
        console.error('Error fetching design system:', error)
        alert('Failed to load design system')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDesignSystem()
  }, [params.id, router])

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(label)
    setTimeout(() => setCopiedValue(null), 2000)
  }

  const handleShare = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopiedValue('link')
    setTimeout(() => setCopiedValue(null), 2000)
  }

  const handleImportToFigma = async () => {
    if (!designSystem) return
    
    try {
      const response = await fetch(`/api/design-systems/${params.id}/export?format=tokens-studio`)
      if (!response.ok) throw new Error('Export failed')
      
      const tokensData = await response.json()
      
      // Open Figma with tokens data (this would use Figma REST API in production)
      // For now, we'll download the tokens and provide instructions
      const blob = new Blob([JSON.stringify(tokensData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-figma-tokens.json`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Open Figma new file URL
      window.open('https://www.figma.com/files', '_blank')
      
      alert('Tokens downloaded! Install Tokens Studio plugin in Figma and import the JSON file.')
    } catch (error) {
      console.error('Figma import error:', error)
      alert('Failed to prepare Figma import')
    }
  }

  const handleExport = async (format: 'json' | 'css' | 'tailwind' | 'scss' | 'figma' | 'figma-json' | 'tokens-studio') => {
    try {
      const response = await fetch(`/api/design-systems/${params.id}/export?format=${format}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export design system')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading design system...</p>
        </div>
      </div>
    )
  }

  if (!designSystem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Design system not found</p>
      </div>
    )
  }

  const { colors, typography, spacing, borderRadius, shadows, components } = designSystem

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{designSystem.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {designSystem.industry && (
                    <Badge variant="secondary">{designSystem.industry}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(designSystem.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShare}>
                {copiedValue === 'link' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <Link href="/generate">
                <Button>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Export Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Design System
            </CardTitle>
            <CardDescription>Download your design tokens in multiple formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Figma Plugin Section */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Figma className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Figma Plugin</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Use our Figma plugin to directly import this design system
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background px-2 py-1 rounded flex-1 font-mono">
                    {designSystem.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(designSystem.id, 'design-id')}
                  >
                    {copiedValue === 'design-id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this ID and use it in the Figma plugin
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <FileJson className="h-8 w-8" />
                <span className="font-medium">JSON</span>
                <span className="text-xs text-muted-foreground">Full system</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('css')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Code2 className="h-8 w-8" />
                <span className="font-medium">CSS Variables</span>
                <span className="text-xs text-muted-foreground">:root tokens</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('tailwind')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Wind className="h-8 w-8" />
                <span className="font-medium">Tailwind</span>
                <span className="text-xs text-muted-foreground">Config file</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('scss')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <FileCode className="h-8 w-8" />
                <span className="font-medium">SCSS</span>
                <span className="text-xs text-muted-foreground">Variables</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('figma')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Layers className="h-8 w-8" />
                <span className="font-medium">Figma</span>
                <span className="text-xs text-muted-foreground">Tokens plugin</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('figma-json')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <FileJson className="h-8 w-8" />
                <span className="font-medium">Figma JSON</span>
                <span className="text-xs text-muted-foreground">Structure file</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('tokens-studio')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Figma className="h-8 w-8" />
                <span className="font-medium">Tokens Studio</span>
                <span className="text-xs text-muted-foreground">For Figma import</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="colors"><Palette className="h-4 w-4 mr-2" />Colors</TabsTrigger>
            <TabsTrigger value="typography"><Type className="h-4 w-4 mr-2" />Typography</TabsTrigger>
            <TabsTrigger value="spacing"><Layout className="h-4 w-4 mr-2" />Spacing</TabsTrigger>
            <TabsTrigger value="borders"><Box className="h-4 w-4 mr-2" />Borders</TabsTrigger>
            <TabsTrigger value="shadows"><Layers className="h-4 w-4 mr-2" />Shadows</TabsTrigger>
            <TabsTrigger value="components"><Grid3x3 className="h-4 w-4 mr-2" />Components</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>Click any color to copy its hex value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(colors).map(([colorName, colorScale]) => (
                  <div key={colorName} className="space-y-2">
                    <h3 className="text-lg font-semibold capitalize">{colorName}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-11 gap-2">                      {(Object.entries(colorScale) as [string, string][]).map(([shade, hex]) => (
                        <button
                          key={shade}
                          onClick={() => copyToClipboard(hex, `${colorName}-${shade}`)}
                          className="group relative aspect-square rounded-lg overflow-hidden border-2 hover:scale-110 transition-all"
                          style={{ backgroundColor: hex }}
                          title={`${colorName}-${shade}: ${hex}`}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            {shade}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>Font families, sizes, weights, and spacing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Font Families */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Font Families</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Badge variant="outline">Sans</Badge>
                      <p className="text-sm font-sans">{typography.fontFamily.sans.join(', ')}</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Serif</Badge>
                      <p className="text-sm font-serif">{typography.fontFamily.serif.join(', ')}</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Mono</Badge>
                      <p className="text-sm font-mono">{typography.fontFamily.mono.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Font Sizes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Font Sizes</h3>
                  <div className="grid gap-2">
                    {Object.entries(typography.fontSize).map(([name, size]) => (
                      <div key={name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <span style={{ fontSize: size }} className="font-medium">
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{size}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(size, `fontSize-${name}`)}
                          >
                            {copiedValue === `fontSize-${name}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Font Weights */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Font Weights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {Object.entries(typography.fontWeight).map(([name, weight]) => (
                      <div key={name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <span style={{ fontWeight: weight }} className="capitalize">
                          {name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(weight, `fontWeight-${name}`)}
                        >
                          {copiedValue === `fontWeight-${name}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spacing System</CardTitle>
                <CardDescription>8pt grid-based spacing scale (base unit: 4px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(spacing.values).map(([key, value]) => {
                    const size = parseInt(String(value)) || 0
                    return (
                      <div key={key} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div
                          className="bg-primary/20 rounded"
                          style={{ width: String(value), height: '24px', minWidth: '16px' }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">spacing-{key}</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{value}</code>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{size}px</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(value, `spacing-${key}`)}
                        >
                          {copiedValue === `spacing-${key}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borders Tab */}
          <TabsContent value="borders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
                <CardDescription>Consistent corner radii for rounded elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(borderRadius).map(([name, radius]) => (
                    <div key={name} className="space-y-2">
                      <div
                        className="aspect-square border-2 border-primary bg-primary/10 flex items-center justify-center hover:scale-105 transition-transform"
                        style={{ borderRadius: radius }}
                      >
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">{radius}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(radius, `borderRadius-${name}`)}
                        >
                          {copiedValue === `borderRadius-${name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shadows Tab */}
          <TabsContent value="shadows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shadows</CardTitle>
                <CardDescription>Elevation and depth tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(shadows).map(([name, shadow]) => (
                    <div key={name} className="space-y-2">
                      <div
                        className="h-24 bg-background rounded-lg border flex items-center justify-center hover:scale-105 transition-transform"
                        style={{ boxShadow: shadow }}
                      >
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">{shadow}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(shadow, `shadow-${name}`)}
                        >
                          {copiedValue === `shadow-${name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Pre-styled button components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(components.button.variants).map(([variant, styles]: [string, any]) => (
                      <button
                        key={variant}
                        className="px-4 py-2 rounded-md font-medium capitalize"
                        style={{
                          backgroundColor: styles.background,
                          color: styles.color,
                        }}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {Object.entries(components.button.sizes).map(([size, styles]: [string, any]) => (
                      <button
                        key={size}
                        className="rounded-md font-medium capitalize"
                        style={{
                          backgroundColor: components.button.variants.primary.background,
                          color: components.button.variants.primary.color,
                          padding: styles.padding,
                          fontSize: styles.fontSize,
                          borderRadius: components.button.borderRadius,
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Card Component</CardTitle>
                <CardDescription>Container component for grouped content</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-lg p-6"
                  style={{
                    backgroundColor: components.card.background,
                    borderColor: components.card.border,
                    borderRadius: components.card.borderRadius,
                    boxShadow: components.card.shadow,
                  }}
                >
                  <div style={{ padding: components.card.header.padding }}>
                    <h3
                      style={{
                        fontSize: components.card.title.fontSize,
                        fontWeight: components.card.title.fontWeight,
                        lineHeight: components.card.title.lineHeight,
                      }}
                    >
                      Card Title
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: components.card.description.fontSize,
                      color: components.card.description.color,
                      lineHeight: components.card.description.lineHeight,
                    }}
                  >
                    This is a sample card component styled with the generated design system.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Input Component</CardTitle>
                <CardDescription>Text input fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Default Input</label>
                    <input
                      type="text"
                      placeholder="Enter text..."
                      className="w-full border rounded-md outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: components.input.background,
                        borderColor: components.input.border,
                        borderRadius: components.input.borderRadius,
                        padding: components.input.padding,
                        fontSize: components.input.fontSize,
                        color: components.input.color,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">With Focus State</label>
                    <input
                      type="text"
                      placeholder="Focus me..."
                      className="w-full border rounded-md outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: components.input.background,
                        borderColor: components.input.border,
                        borderRadius: components.input.borderRadius,
                        padding: components.input.padding,
                        fontSize: components.input.fontSize,
                        color: components.input.color,
                        outlineColor: components.input.focus.ring,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
