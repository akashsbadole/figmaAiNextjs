'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Download,
  Layers,
  FileCode,
  Box
} from 'lucide-react'

const DESIGN_TYPES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS Application' },
  { value: 'admin-panel', label: 'Admin Panel' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'blog', label: 'Blog' },
]

const EXAMPLE_PROMPTS = [
  "Create a modern analytics dashboard with charts, KPI cards, and a sidebar navigation. Dark theme with vibrant accent colors.",
  "Design a fintech mobile app onboarding flow with 3 screens explaining key features. Clean, professional design with trust indicators.",
  "Build an e-commerce product detail page with image gallery, size/variant selection, and add to cart section. Mobile-first responsive design.",
  "Generate a SaaS pricing page with 3 tiers, feature comparison table, and clear CTAs. Professional B2B design.",
]

export default function FigmaPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [designType, setDesignType] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<any>(null)
  const [designId, setDesignId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/figma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: designType
        })
      })

      if (!response.ok) throw new Error('Failed to generate design')

      const data = await response.json()
      setGeneratedDesign(data.designData)
      setDesignId(data.id)
    } catch (error) {
      console.error('Error generating design:', error)
      alert('Failed to generate design')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'json' | 'figma-plugin') => {
    if (!designId) return

    try {
      const response = await fetch(`/api/figma/${designId}/export?format=${format}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export.${format}`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export design')
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Figma Design Generator</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Design Creation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generator Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generate Figma Design
                </CardTitle>
                <CardDescription>
                  Describe the design you want to create and AI will generate a Figma-compatible structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="designType">Design Type (Optional)</Label>
                  <Select value={designType} onValueChange={setDesignType}>
                    <SelectTrigger id="designType">
                      <SelectValue placeholder="Select a design type for better results" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Design Description</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the Figma design you want to create. Include details about layout, components, colors, style, and purpose..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] text-base resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about components, layout, colors, and any specific requirements.
                  </p>
                </div>

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

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Design...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Figma Design
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {generatedDesign ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    {generatedDesign.name || 'Generated Design'}
                  </CardTitle>
                  <CardDescription>
                    Figma-compatible design structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Export Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleExport('json')}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <FileCode className="h-8 w-8" />
                      <span className="font-medium">JSON</span>
                      <span className="text-xs text-muted-foreground">Full structure</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('figma-plugin')}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Download className="h-8 w-8" />
                      <span className="font-medium">Figma Plugin</span>
                      <span className="text-xs text-muted-foreground">Tokens format</span>
                    </Button>
                  </div>

                  {/* Design Info */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold">Design Structure</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frames:</span>
                        <span className="font-medium">{generatedDesign.frames?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Components:</span>
                        <span className="font-medium">{generatedDesign.components?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Color Styles:</span>
                        <span className="font-medium">{Object.keys(generatedDesign.styles?.colors || {}).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Text Styles:</span>
                        <span className="font-medium">{Object.keys(generatedDesign.styles?.textStyles || {}).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview JSON */}
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Design Preview</h3>
                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-xs">
                      {JSON.stringify(generatedDesign, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-[500px]">
                <CardContent className="text-center space-y-4">
                  <div className="bg-primary/10 rounded-full p-4 mx-auto w-fit">
                    <Layers className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Design Generated Yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Describe your desired design on the left and click generate to create a Figma-compatible structure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
