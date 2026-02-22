'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Zap, Download, Share2, Code, Layers, Rocket, Shield, Sparkles, MessageSquare, Server, FileCode, Play, Check, Clock, TrendingUp, Users, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isSignedIn, router])

  const faqs = [
    { question: "How does the AI generate design systems?", answer: "Our AI analyzes your brand requirements, industry standards, and design preferences to generate comprehensive design tokens, color palettes, typography scales, and component structures." },
    { question: "What formats can I export my design system?", answer: "You can export in JSON, CSS Variables, Tailwind Config, SCSS, and Figma Tokens plugin format. We're constantly adding more export options." },
    { question: "Is it really free to get started?", answer: "Yes! You get 3 free generations per month with no credit card required. Our free tier is perfect for trying out the tool and small projects." },
    { question: "Can I customize the generated design system?", answer: "Absolutely! You can modify colors, typography, spacing, and components after generation. The AI provides a solid starting point that you can fully customize." },
    { question: "Does it work with Figma?", answer: "Yes! You can export to Figma Tokens format or generate JSON structures compatible with Figma's design token workflows." },
  ]

  const testimonials = [
    { name: "Sarah Chen", role: "Design Lead at TechCorp", content: "This tool saved us weeks of work. Our design system went from concept to production in just a few hours.", avatar: "SC" },
    { name: "Michael Rodriguez", role: "Frontend Developer", content: "The export to Tailwind config is flawless. It's become an essential part of our development workflow.", avatar: "MR" },
    { name: "Emily Watson", role: "Startup Founder", content: "As a non-designer, I was able to create a professional brand identity in minutes. Truly game-changing.", avatar: "EW" },
  ]

  const logos = ["Google", "Microsoft", "Amazon", "Stripe", "Notion", "Figma", "Slack", "Zoom"]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-sky-50/95 backdrop-blur supports-[backdrop-filter]:bg-sky-50/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-sky-500" />
           <Link href='/'> <span className="text-2xl font-bold">DesignAI</span></Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-sky-700 hover:text-sky-500 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-sky-700 hover:text-sky-500 transition-colors">How it works</a>
            <a href="#templates" className="text-sm font-medium text-sky-700 hover:text-sky-500 transition-colors">Templates</a>
            <a href="#price" className="text-sm font-medium text-sky-700 hover:text-sky-500 transition-colors">Price</a>
            <a href="#faq" className="text-sm font-medium text-sky-700 hover:text-sky-500 transition-colors">FAQ</a>
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
                <Button variant="ghost" className="text-sky-700 hover:text-sky-500">Generate</Button>
              </Link>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-sky-700 hover:text-sky-500">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">Get started Free</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Design System Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-sky-900">
            Transform Your Design Vision
            <span className="block text-sky-500">Into Production Systems</span>
          </h1>
          
          <p className="text-xl text-sky-700/80 max-w-3xl mx-auto">
            Create professional, brand-aligned design systems in minutes. 
            Just describe what you need, and our AI generates colors, typography, spacing, and components—ready for export.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/generate">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-sky-500 hover:bg-sky-600">
                <Zap className="mr-2 h-5 w-5" />
                Generate Your First System
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-sky-300 text-sky-700 hover:bg-sky-50">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-900">10k+</div>
              <div className="text-sm text-sky-600">Systems Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-900">50+</div>
              <div className="text-sm text-sky-600">Industries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-900">100%</div>
              <div className="text-sm text-sky-600">Free to Start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Flow */}
      <section className="py-12 px-4 bg-sky-50">
        <div className="container mx-auto">
          <p className="text-center text-sm font-medium text-sky-600 mb-8">TRUSTED BY TEAMS AT</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {logos.map((logo, index) => (
              <div key={index} className="text-xl font-bold text-sky-300 hover:text-sky-400 transition-colors cursor-default">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything You Need (Features) */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">Everything You Need</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              From prompt to production, we've got you covered with all the tools to create professional design systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-sky-100 hover:border-sky-300 transition-colors bg-sky-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-900">AI-Powered Generation</CardTitle>
                <CardDescription className="text-sky-700">
                  Describe your vision in plain English. Our AI understands industry-specific patterns and creates tailored systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-sky-100 hover:border-sky-300 transition-colors bg-sky-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-900">UI/UX Design Agent</CardTitle>
                <CardDescription className="text-sky-700">
                  Chat with an expert AI design consultant. Get personalized advice on UX, accessibility, and design best practices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-sky-100 hover:border-sky-300 transition-colors bg-sky-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <FileCode className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-900">Figma Design Generator</CardTitle>
                <CardDescription className="text-sky-700">
                  Generate Figma-compatible design structures. Export to JSON or Figma Tokens plugin format.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-sky-100 hover:border-sky-300 transition-colors bg-sky-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-900">System Design Assistant</CardTitle>
                <CardDescription className="text-sky-700">
                  Create comprehensive system architectures. Get recommendations on databases, scaling, security, and deployment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-sky-100 hover:border-sky-300 transition-colors bg-sky-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-900">Complete Design Tokens</CardTitle>
                <CardDescription className="text-sky-700">
                  Color palettes, typography scales, spacing systems, border radii, and shadows—all generated automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-sky-100 hover:border-sky-300 transition-colors bg-sky-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-900">Multiple Export Formats</CardTitle>
                <CardDescription className="text-sky-700">
                  JSON, CSS Variables, Tailwind Config, SCSS, and Figma Tokens—export in your preferred format.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-sky-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">How It Works</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              Three simple steps to your perfect design system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold text-sky-900">Describe Your Vision</h3>
              <p className="text-sky-700">
                Tell us about your brand, industry, and design preferences. Be as specific or as creative as you like.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold text-sky-900">AI Generates System</h3>
              <p className="text-sky-700">
                Our AI creates a complete design system with tokens, components, and variations in seconds.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold text-sky-900">Export & Use</h3>
              <p className="text-sky-700">
                Preview, customize, and export in your preferred format. Copy tokens directly to your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Efficiency Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">Work Smarter, Not Harder</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              Our platform enhances every aspect of your design workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
              <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-sky-900 mb-2">Save Time</h3>
              <p className="text-sky-700 text-sm">Generate complete design systems in seconds instead of weeks of manual work.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
              <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-sky-900 mb-2">Enhancing Quality</h3>
              <p className="text-sky-700 text-sm">AI-powered suggestions ensure consistent, professional design decisions.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
              <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-sky-900 mb-2">Resource Efficient</h3>
              <p className="text-sky-700 text-sm">Reduce design resources by up to 70% with automated system generation.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
              <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-sky-900 mb-2">Work Better</h3>
              <p className="text-sky-700 text-sm">Collaborate seamlessly with your team using standardized design tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 px-4 bg-sky-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">Ready-to-Use Templates</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              Start with professionally crafted templates tailored for different industries
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-sky-200 hover:border-sky-400 transition-colors bg-white">
              <div className="h-40 bg-gradient-to-br from-sky-100 to-sky-200 rounded-t-lg flex items-center justify-center">
                <Layers className="h-16 w-16 text-sky-400" />
              </div>
              <CardHeader>
                <CardTitle className="text-sky-900">SaaS Dashboard</CardTitle>
                <CardDescription className="text-sky-700">
                  Complete design system for SaaS applications with data tables, charts, and user management components.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-sky-500 hover:bg-sky-600">Use Template</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 hover:border-sky-400 transition-colors bg-white">
              <div className="h-40 bg-gradient-to-br from-sky-100 to-sky-200 rounded-t-lg flex items-center justify-center">
                <Rocket className="h-16 w-16 text-sky-400" />
              </div>
              <CardHeader>
                <CardTitle className="text-sky-900">E-Commerce</CardTitle>
                <CardDescription className="text-sky-700">
                  Full e-commerce design system with product cards, checkout flows, and shopping cart components.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-sky-500 hover:bg-sky-600">Use Template</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 hover:border-sky-400 transition-colors bg-white">
              <div className="h-40 bg-gradient-to-br from-sky-100 to-sky-200 rounded-t-lg flex items-center justify-center">
                <Shield className="h-16 w-16 text-sky-400" />
              </div>
              <CardHeader>
                <CardTitle className="text-sky-900">FinTech</CardTitle>
                <CardDescription className="text-sky-700">
                  Professional financial design system with banking components, charts, and security-focused UI patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-sky-500 hover:bg-sky-600">Use Template</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">Loved by Designers</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-xl bg-sky-50 border border-sky-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sky-900">{testimonial.name}</div>
                    <div className="text-sm text-sky-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sky-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorial Video Section */}
      <section className="py-20 px-4 bg-sky-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">How To Use Our Design System Feature</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              Learn how to create your first design system in minutes
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-sky-900 aspect-video flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-sky-800"></div>
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
              <p className="text-white text-lg font-medium">Watch the Tutorial</p>
              <p className="text-sky-200 text-sm">3:45 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="price" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">Simple, Transparent Pricing</h2>
            <p className="text-xl text-sky-700/80 max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-sky-200 bg-sky-50/50">
              <CardHeader className="text-center">
                <CardTitle className="text-sky-900 text-xl">Free</CardTitle>
                <div className="text-4xl font-bold text-sky-900 mt-4">$0</div>
                <p className="text-sky-600">Forever free</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>3 generations per month</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Basic export formats</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Community support</span>
                </div>
                <Button className="w-full mt-6 bg-sky-200 text-sky-800 hover:bg-sky-300">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-500 bg-white shadow-xl scale-105">
              <CardHeader className="text-center">
                <div className="text-sm font-medium text-sky-500 mb-2">MOST POPULAR</div>
                <CardTitle className="text-sky-900 text-xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-sky-900">$19</div>
                <p className="text-sky-600">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Unlimited generations</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>All export formats</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Custom templates</span>
                </div>
                <Button className="w-full mt-6 bg-sky-500 hover:bg-sky-600">Start Free Trial</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 bg-sky-50/50">
              <CardHeader className="text-center">
                <CardTitle className="text-sky-900 text-xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-sky-900">Custom</div>
                <p className="text-sky-600">Contact us</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-center gap-2 text-sky-700">
                  <Check className="h-5 w-5 text-sky-500" />
                  <span>SSO & security</span>
                </div>
                <Button className="w-full mt-6 bg-sky-200 text-sky-800 hover:bg-sky-300">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-sky-50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-sky-900">Frequently Asked Questions</h2>
            <p className="text-xl text-sky-700/80">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-sky-200 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-sky-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-sky-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-sky-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-sky-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-sky-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-sky-500 text-white">
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
      <footer className="border-t bg-sky-50 py-16 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-8 w-8 text-sky-500" />
                <span className="text-2xl font-bold">DesignAI</span>
              </div>
              <p className="text-sm text-sky-700/80 mb-6 max-w-xs">
                Transform your design vision into production-ready systems with AI-powered tools.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-300 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-300 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-300 transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sky-900">Product</h4>
              <ul className="space-y-3 text-sm text-sky-700">
                <li><a href="#features" className="hover:text-sky-500 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-sky-500 transition-colors">How it works</a></li>
                <li><a href="#templates" className="hover:text-sky-500 transition-colors">Templates</a></li>
                <li><a href="#price" className="hover:text-sky-500 transition-colors">Price</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sky-900">Resources</h4>
              <ul className="space-y-3 text-sm text-sky-700">
                <li><a href="#" className="hover:text-sky-500 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sky-900">Company</h4>
              <ul className="space-y-3 text-sm text-sky-700">
                <li><a href="#" className="hover:text-sky-500 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-sky-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sky-200 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-sky-700/80">
                &copy; 2025 DesignAI. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-sky-700/80">
                <a href="#" className="hover:text-sky-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-sky-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-sky-500 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
