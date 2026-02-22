'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useDesignSystemStore } from '@/store/useDesignSystemStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Palette,
  Plus,
  Calendar,
  ExternalLink,
  Trash2,
  Loader2,
  Sparkles,
  Share2,
  MessageSquare,
  FileCode,
  Server,
  History
} from 'lucide-react'

interface DesignSystem {
  id: string
  name: string
  description: string
  industry: string | null
  isPublic: boolean
  shareSlug: string
  version: number
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const router = useRouter()
  const { designSystems, totalCount, isLoading, error, fetchDesignSystems, deleteDesignSystem } = useDesignSystemStore()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    if (isSignedIn) {
      fetchDesignSystems({ limit: 50 })
    }
  }, [isLoaded, isSignedIn, router, fetchDesignSystems])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design system?')) return
    await deleteDesignSystem(id)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">DesignAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                {totalCount} design system{totalCount !== 1 ? 's' : ''} created
              </p>
            </div>
            
            <Link href="/generate">
              <Button size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New System
              </Button>
            </Link>
          </div>

          {/* AI Tools Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/agent">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>UI/UX Design Agent</CardTitle>
                  <CardDescription>
                    Chat with AI design consultant for expert advice
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/figma">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileCode className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Design Generator</CardTitle>
                  <CardDescription>
                    Generate Figma-compatible design structures
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/system-design">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Design System</CardTitle>
                  <CardDescription>
                    Create comprehensive system architectures
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Design Systems Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-lg text-muted-foreground">Loading design systems...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Palette className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-xl font-semibold text-destructive mb-2">Error loading design systems</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {error}
                </p>
                <Button onClick={() => fetchDesignSystems({ limit: 50 })}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : designSystems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Palette className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No design systems yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Create your first AI-powered design system by describing your vision.
                </p>
                <Link href="/generate">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Your First System
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designSystems.map((system) => (
                <Card key={system.id} className="group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          <Link href={`/design-system/${system.id}`}>
                            {system.name}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {system.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {system.industry}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            v{system.version}
                          </Badge>
                          {system.isPublic && (
                            <Badge variant="default" className="text-xs">
                              <Share2 className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {system.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {system.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(system.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/design-system/${system.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(system.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
