'use client'

import React, { useState } from 'react'
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
  Box,
  Copy,
  Check,
  History,
  Clock,
  Trash2
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
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/figma')
        if (response.ok) {
          const data = await response.json()
          setHistory(data)
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoadingHistory(false)
      }
    }
    if (isSignedIn) {
      fetchHistory()
    }
  }, [isSignedIn])

  const loadHistoryItem = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/figma/${id}`)
      if (response.ok) {
        const data = await response.json()
        setGeneratedDesign(JSON.parse(data.designData))
        setDesignId(data.id)
        setPrompt(data.prompt)
      } else {
        throw new Error('Failed to load')
      }
    } catch (error) {
      console.error('Failed to load design:', error)
      alert('Failed to load design')
    } finally {
      setLoading(false)
    }
  }

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this design?')) return
    
    try {
      const response = await fetch(`/api/figma/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id))
        if (designId === id) {
          setGeneratedDesign(null)
          setDesignId(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleCopyJson = async () => {
    if (!designId) return
    try {
      const response = await fetch(`/api/figma/${designId}/export?format=figma-json`)
      if (!response.ok) throw new Error('Failed to fetch compatible JSON')
      
      const text = await response.text()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      alert('Failed to copy compatible JSON')
    }
  }

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

      // Prepend to history
      setHistory(prev => [{
        id: data.id,
        name: data.designData.name || 'Generated Design',
        prompt: prompt,
        createdAt: new Date().toISOString()
      }, ...prev])
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans tracking-tight text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 shadow-inner">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none mb-1">Figma Design Generator</h1>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">AI-Powered Design Creation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* History Section */}
          <div className="lg:col-span-3 space-y-6 flex flex-col h-[calc(100vh-120px)] sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <div className="bg-slate-200/50 p-1.5 rounded-lg">
                  <History className="h-4 w-4 text-slate-600" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">Generation History</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 px-4 text-slate-500 text-sm">
                    No designs generated yet.
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => loadHistoryItem(item.id)}
                      className={`p-3 rounded-2xl cursor-pointer border transition-all group ${
                        designId === item.id 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className={`text-sm font-bold line-clamp-1 ${designId === item.id ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.name || 'Untitled Design'}
                        </h3>
                        <button 
                          onClick={(e) => deleteHistoryItem(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Generator Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  Generate Figma Design
                </h2>
                <p className="text-sm text-slate-500">
                  Describe the design you want to create and AI will generate a Figma-compatible structure
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="designType" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Design Type (Optional)</Label>
                  <Select value={designType} onValueChange={setDesignType}>
                    <SelectTrigger id="designType" className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-800 focus:ring-blue-500 shadow-sm">
                      <SelectValue placeholder="Select a design type for better results" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                      {DESIGN_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="rounded-lg focus:bg-slate-100">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="prompt" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Design Description</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the Figma design you want to create. Include details about layout, components, colors, style, and purpose..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[160px] text-sm resize-none rounded-2xl bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 shadow-sm p-4 leading-relaxed"
                  />
                  <p className="text-xs text-slate-500 pl-1">
                    Be specific about components, layout, colors, and any specific requirements.
                  </p>
                </div>

                <div className="space-y-3 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <Label className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    Try these examples
                  </Label>
                  <div className="space-y-2">
                    {EXAMPLE_PROMPTS.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="w-full text-left p-3.5 rounded-xl border border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-sm text-slate-600 hover:text-slate-900 leading-relaxed active:scale-[0.99] duration-200"
                      >
                       <span className="opacity-60 text-indigo-600 font-serif text-lg leading-none mr-1">"</span>{example}<span className="opacity-60 text-indigo-600 font-serif text-lg leading-none ml-1">"</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 text-sm font-semibold transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Design...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Figma Design
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5 space-y-6">
            {generatedDesign ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                    <div className="bg-emerald-100 p-1.5 rounded-lg">
                      <Box className="h-4 w-4 text-emerald-600" />
                    </div>
                    {generatedDesign.name || 'Generated Design'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Figma-compatible design structure
                  </p>
                </div>
                <div className="p-6 space-y-6 flex-1 flex flex-col">
                  {/* Export & Action Options */}
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleCopyJson}
                      className="flex flex-col items-center justify-center gap-3 h-28 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm group"
                    >
                      <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                        {copied ? (
                           <Check className="h-6 w-6 text-green-500" />
                        ) : (
                           <Copy className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                        )}
                      </div>
                      <div className="text-center">
                        <span className="font-semibold block text-sm">{copied ? 'Copied!' : 'Copy JSON'}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5 block">Template Ready</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('json')}
                      className="flex flex-col items-center justify-center gap-3 h-28 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm group"
                    >
                      <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <FileCode className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold block text-sm">JSON Format</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5 block">Download</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('figma-plugin')}
                      className="flex flex-col items-center justify-center gap-3 h-28 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm group"
                    >
                      <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Download className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold block text-sm">Figma Plugin</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5 block">Download</span>
                      </div>
                    </Button>
                  </div>

                  {/* Design Info */}
                  <div className="space-y-4 pt-6 mt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Design Structure Overview</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Frames</span>
                        <span className="text-sm font-bold text-slate-800">{generatedDesign.frames?.length || 0}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Box className="h-3.5 w-3.5" /> Components</span>
                        <span className="text-sm font-bold text-slate-800">{generatedDesign.components?.length || 0}</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-1.5">Color Styles</span>
                        <span className="text-sm font-bold text-blue-900">{Object.keys(generatedDesign.styles?.colors || {}).length}</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-1.5">Text Styles</span>
                        <span className="text-sm font-bold text-blue-900">{Object.keys(generatedDesign.styles?.textStyles || {}).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview JSON */}
                  <div className="pt-6 mt-auto border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Raw JSON Preview</h3>
                    <pre className="bg-[#1e293b] p-4 rounded-2xl overflow-auto max-h-[300px] text-[11px] font-mono text-slate-300 leading-relaxed shadow-inner">
                      {JSON.stringify(generatedDesign, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center h-full min-h-[600px]">
                <div className="text-center space-y-5 p-8 max-w-sm">
                  <div className="bg-blue-50 border border-blue-100 rounded-full p-5 mx-auto w-fit shadow-sm">
                    <Layers className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">No Design Generated Yet</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Describe your desired design on the left and click generate to create a Figma-compatible structure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
