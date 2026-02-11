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
  Database,
  Server,
  Shield,
  Activity,
  Layers,
  Download
} from 'lucide-react'

const SCALE_OPTIONS = [
  { value: 'startup', label: 'Startup (1K-10K users)' },
  { value: 'growth', label: 'Growth (10K-100K users)' },
  { value: 'scale', label: 'Scale (100K-1M users)' },
  { value: 'enterprise', label: 'Enterprise (1M+ users)' },
]

const EXAMPLE_PROMPTS = [
  "Design a real-time chat application like Slack or Discord with support for channels, direct messages, file sharing, and presence indicators.",
  "Create an e-commerce platform with product catalog, shopping cart, payment processing, order management, and inventory tracking.",
  "Build a social media feed application with posts, likes, comments, follows, and a recommendation algorithm for content discovery.",
  "Design a SaaS analytics dashboard with data ingestion, real-time metrics visualization, user management, and reporting capabilities.",
  "Create a video streaming service with content management, adaptive streaming, user profiles, and recommendation engine.",
]

export default function SystemDesignPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [scale, setScale] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<any>(null)
  const [designId, setDesignId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/system-design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          scale
        })
      })

      if (!response.ok) throw new Error('Failed to generate design')

      const data = await response.json()
      setGeneratedDesign(data.designData)
      setDesignId(data.id)
    } catch (error) {
      console.error('Error generating design:', error)
      alert('Failed to generate system design')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!generatedDesign) return

    const blob = new Blob([JSON.stringify(generatedDesign, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedDesign.name?.replace(/\s+/g, '-').toLowerCase() || 'system-design'}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
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
              <Server className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">System Design Assistant</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Architecture Design</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/figma">
              <Button variant="outline" size="sm">
                <Layers className="h-4 w-4 mr-2" />
                Figma
              </Button>
            </Link>
            <Link href="/agent">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                UI/UX Agent
              </Button>
            </Link>
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
                  Generate System Architecture
                </CardTitle>
                <CardDescription>
                  Describe your system requirements and AI will create a comprehensive architecture design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scale">Expected Scale</Label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger id="scale">
                      <SelectValue placeholder="Select expected scale for your system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {SCALE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">System Requirements</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the system you want to design. Include features, requirements, constraints, and any specific technology preferences..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] text-base resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about features, constraints, performance requirements, and business goals.
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
                      Generating Architecture...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate System Design
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
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        {generatedDesign.name || 'System Design'}
                      </CardTitle>
                      <CardDescription>
                        {generatedDesign.description || 'Comprehensive system architecture'}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview */}
                  {generatedDesign.overview && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Overview
                      </h3>
                      <p className="text-sm text-muted-foreground">{generatedDesign.overview}</p>
                    </div>
                  )}

                  {/* Components */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Components ({generatedDesign.components?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {generatedDesign.components?.map((comp: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{comp.type}</Badge>
                            <span className="font-medium">{comp.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{comp.description}</p>
                          {comp.technologies && comp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {comp.technologies.map((tech: string, tIdx: number) => (
                                <Badge key={tIdx} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Database */}
                  {generatedDesign.database && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Database
                      </h3>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="text-xs">
                            {generatedDesign.database.primary?.type}
                          </Badge>
                          <span className="font-medium">Primary Database</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{generatedDesign.database.primary?.reasoning}</p>
                      </div>
                    </div>
                  )}

                  {/* Security */}
                  {generatedDesign.security && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Authentication:</span>{' '}
                          <span className="font-medium">{generatedDesign.security.authentication}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Authorization:</span>{' '}
                          <span className="font-medium">{generatedDesign.security.authorization}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Encryption:</span>{' '}
                          <span className="font-medium">{generatedDesign.security.encryption}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Considerations */}
                  {generatedDesign.considerations && (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold">Key Considerations</h3>
                      {generatedDesign.considerations.challenges && (
                        <div>
                          <p className="text-sm font-medium mb-1">Challenges:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {generatedDesign.considerations.challenges.map((challenge: string, idx: number) => (
                              <li key={idx}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {generatedDesign.considerations.tradeoffs && (
                        <div>
                          <p className="text-sm font-medium mb-1">Trade-offs:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {generatedDesign.considerations.tradeoffs.map((tradeoff: string, idx: number) => (
                              <li key={idx}>{tradeoff}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-[500px]">
                <CardContent className="text-center space-y-4">
                  <div className="bg-primary/10 rounded-full p-4 mx-auto w-fit">
                    <Server className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No System Design Generated Yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Describe your system requirements on the left and click generate to create a comprehensive architecture design.
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
