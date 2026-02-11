'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

const EXAMPLE_PROMPTS = [
  "Create a fintech dashboard design system with modern blue theme, professional, minimal, accessibility friendly.",
  "Design an e-commerce fashion brand design system with elegant typography, warm color palette, and modern aesthetics.",
  "Generate a healthtech app design system with calming green tones, clean medical-grade design, and high contrast for accessibility.",
  "Build an edtech platform design system with playful colors, friendly rounded shapes, and engaging visual hierarchy.",
]

export default function GeneratePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/design-systems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          industry,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate design system')
      }

      const data = await response.json()
      // Redirect to the preview page with the generated system ID
      router.push(`/design-system/${data.id}`)
    } catch (error) {
      console.error('Error generating design system:', error)
      alert('Failed to generate design system. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
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
              {/* Industry Selection */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
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

              {/* Prompt Input */}
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
                disabled={!prompt.trim() || loading}
                size="lg"
                className="w-full text-lg py-6"
              >
                {loading ? (
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
