'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Zap, Download, Share2, Code, Layers, Rocket, Shield, Sparkles, MessageSquare, Server, FileCode } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DesignAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
          </nav>
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/generate">
                <Button variant="ghost">Generate</Button>
              </Link>
              <SignInButton>
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Get Started Free</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Design System Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform Your Design Vision
            <span className="block text-primary">Into Production Systems</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create professional, brand-aligned design systems in minutes. 
            Just describe what you need, and our AI generates colors, typography, spacing, and components—ready for export.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/generate">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                <Zap className="mr-2 h-5 w-5" />
                Generate Your First System
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-sm text-muted-foreground">Systems Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">Industries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Free to Start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From prompt to production, we've got you covered with all the tools to create professional design systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Generation</CardTitle>
                <CardDescription>
                  Describe your vision in plain English. Our AI understands industry-specific patterns and creates tailored systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>UI/UX Design Agent</CardTitle>
                <CardDescription>
                  Chat with an expert AI design consultant. Get personalized advice on UX, accessibility, and design best practices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Figma Design Generator</CardTitle>
                <CardDescription>
                  Generate Figma-compatible design structures. Export to JSON or Figma Tokens plugin format.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>System Design Assistant</CardTitle>
                <CardDescription>
                  Create comprehensive system architectures. Get recommendations on databases, scaling, security, and deployment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Complete Design Tokens</CardTitle>
                <CardDescription>
                  Color palettes, typography scales, spacing systems, border radii, and shadows—all generated automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multiple Export Formats</CardTitle>
                <CardDescription>
                  JSON, CSS Variables, Tailwind Config, SCSS, and Figma Tokens—export in your preferred format.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to your perfect design system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold">Describe Your Vision</h3>
              <p className="text-muted-foreground">
                Tell us about your brand, industry, and design preferences. Be as specific or as creative as you like.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold">AI Generates System</h3>
              <p className="text-muted-foreground">
                Our AI creates a complete design system with tokens, components, and variations in seconds.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold">Export & Use</h3>
              <p className="text-muted-foreground">
                Preview, customize, and export in your preferred format. Copy tokens directly to your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Transform Your Workflow?</h2>
          <p className="text-xl opacity-90">
            Join thousands of designers and developers creating beautiful design systems with AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/generate">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6">
                <Rocket className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
            </Link>
          </div>
          <p className="text-sm opacity-75">
            3 free generations per month • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">DesignAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The AI Design System Engine for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/generate" className="hover:text-primary transition-colors">Generate</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 DesignAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
