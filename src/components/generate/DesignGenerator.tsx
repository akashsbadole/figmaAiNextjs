'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDesignSystemStore } from '@/store/useDesignSystemStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2, Copy, Download, Check, Palette, Layers, Box, Database, ArrowRight } from 'lucide-react'
import { generateFigmaJsonFromDesignSystem } from '@/lib/figma-template-generator'
import type { FigmaJsonRoot } from '@/lib/figma-json-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function DesignGenerator() {
  const router = useRouter()
  const { isCreating, createDesignSystem, currentDesignSystem, fetchDesignSystemById, figmaJson, setFigmaJson } = useDesignSystemStore()
  
  const [systemName, setSystemName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [industry, setIndustry] = useState('')
  const [colorScheme, setColorScheme] = useState('vibrant')
  const [designStyle, setDesignStyle] = useState('modern')
  const [targetPlatform, setTargetPlatform] = useState('web')
  const [accessibility, setAccessibility] = useState('standard')
  const [brandPersonality, setBrandPersonality] = useState('innovative')
  const [componentStyle, setComponentStyle] = useState('rounded')
  const [layoutSystem, setLayoutSystem] = useState('flex')
  const [typographyScale, setTypographyScale] = useState('major-third')
  const [spacingSystem, setSpacingSystem] = useState('8-pixel')
  const [animationStyle, setAnimationStyle] = useState('smooth')
  const [iconStyle, setIconStyle] = useState('outline')
  const [shadowDepth, setShadowDepth] = useState('medium')
  const [borderStyle, setBorderStyle] = useState('solid')
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showUIPreferences, setShowUIPreferences] = useState(false)
  const [showComponentSelection, setShowComponentSelection] = useState(false)
  const [showCustomTokens, setShowCustomTokens] = useState(false)
  
  const [componentDensity, setComponentDensity] = useState('comfortable')
  const [accessibilityStandard, setAccessibilityStandard] = useState('AA')
  const [brandVoice, setBrandVoice] = useState('technical')

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
  const [fontFamily, setFontFamily] = useState('Inter')
  const [headingFont, setHeadingFont] = useState('Inter')
  const [baseFontSize, setBaseFontSize] = useState('16')
  const [baseSpacing, setBaseSpacing] = useState('8')
  const [borderRadius, setBorderRadius] = useState('8')
  const [buttonHeight, setButtonHeight] = useState('40')
  const [inputHeight, setInputHeight] = useState('40')
  
  const [generatedDesignSystem, setGeneratedDesignSystem] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (currentDesignSystem && generatedDesignSystem && !figmaJson) {
      const figmaData = generateFigmaJsonFromDesignSystem(currentDesignSystem)
      setFigmaJson(figmaData)
    }
  }, [currentDesignSystem, generatedDesignSystem, figmaJson])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a design vision')
      return
    }

    let finalSystemName = systemName.trim()
    if (!finalSystemName) {
      finalSystemName = industry !== 'none' ? `${industry} System` : 'New Design System'
    }

    const designPreferences = {
      colorScheme,
      designStyle,
      targetPlatform,
      accessibility,
      brandPersonality,
      componentStyle,
      layoutSystem,
      typographyScale,
      spacingSystem,
      animationStyle,
      iconStyle,
      shadowDepth,
      borderStyle,
      componentDensity,
      accessibilityStandard,
      brandVoice,
    } as any

    const customTokens = {
      primaryColor,
      secondaryColor,
      accentColor,
      errorColor,
      warningColor,
      successColor,
      fontFamily,
      headingFont,
      baseFontSize,
      baseSpacing,
      borderRadius,
      buttonHeight,
      inputHeight,
    }

    try {
      const result = await createDesignSystem({ 
        prompt: `${finalSystemName}: ${prompt}`, 
        industry: industry !== 'none' ? industry : undefined,
        designPreferences,
        selectedComponents,
        customTokens,
      })
      
      if (result && result.id) {
        setGeneratedDesignSystem(result)
        await fetchDesignSystemById(result.id)
        toast.success('Design system generated successfully!')
      }
    } catch (error) {
      toast.error('Failed to generate design system')
    }
  }

  const handleCopyJson = async () => {
    if (figmaJson) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(figmaJson, null, 2))
        setCopied(true)
        toast.success('JSON copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        toast.error('Failed to copy JSON')
      }
    }
  }

  const handleDownloadJson = () => {
    if (figmaJson) {
      const blob = new Blob([JSON.stringify(figmaJson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${systemName || 'design-system'}.figma.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('JSON downloaded successfully')
    }
  }

  const handleViewDesignSystem = () => {
    if (generatedDesignSystem) {
      router.push(`/design-system/${generatedDesignSystem.id}`)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        <Card className="relative border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-background/40 backdrop-blur-3xl border border-white/10 selection:bg-primary/20">
            <CardHeader className="p-10 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary rounded-[1.25rem] shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-black tracking-tight leading-none mb-2">Protocol Generator</CardTitle>
                        <CardDescription className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Architectural Synthesis Input</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-10 space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Design Authority</Label>
                            <input
                                placeholder="e.g., Nova Core_v1"
                                value={systemName}
                                onChange={(e) => setSystemName(e.target.value)}
                                className="w-full h-16 px-6 rounded-2xl bg-black/20 border border-white/5 focus:border-primary/40 focus:bg-black/40 transition-all outline-none text-sm font-black tracking-tight"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Industry Context</Label>
                            <Select value={industry} onValueChange={setIndustry}>
                                <SelectTrigger className="h-16 rounded-2xl bg-black/20 border border-white/5 focus:border-primary/40 focus:ring-0">
                                    <SelectValue placeholder="Neural Context: Saas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl bg-[#0a0a0a] border-white/10">
                                    <SelectItem value="none">Undefined</SelectItem>
                                    <SelectItem value="fintech">Fintech Protocol</SelectItem>
                                    <SelectItem value="ecommerce">Marketplace Engine</SelectItem>
                                    <SelectItem value="saas">SaaS Ecosystem</SelectItem>
                                    <SelectItem value="healthtech">Bio-Nexus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 flex flex-col">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Visual Visionary</Label>
                        <Textarea
                            placeholder="Synthesize your vision... 'A neon-brutalist fintech hub with high-density grids and sharp typography.'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="flex-1 min-h-[160px] rounded-[2rem] bg-black/20 border border-white/5 focus:border-primary/40 focus:bg-black/40 transition-all outline-none p-8 text-sm font-medium leading-relaxed resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={cn("h-16 rounded-2xl gap-3 font-black uppercase tracking-widest text-[9px] border-white/5 transition-all shadow-sm", showAdvanced && "bg-primary/10 border-primary/20 text-primary")}
                    >
                        <Palette className="h-4 w-4" />
                        Aesthetics
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowUIPreferences(!showUIPreferences)}
                        className={cn("h-16 rounded-2xl gap-3 font-black uppercase tracking-widest text-[9px] border-white/5 transition-all shadow-sm", showUIPreferences && "bg-primary/10 border-primary/20 text-primary")}
                    >
                        <Layers className="h-4 w-4" />
                        Ergonomics
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowComponentSelection(!showComponentSelection)}
                        className={cn("h-16 rounded-2xl gap-3 font-black uppercase tracking-widest text-[9px] border-white/5 transition-all shadow-sm", showComponentSelection && "bg-primary/10 border-primary/20 text-primary")}
                    >
                        <Box className="h-4 w-4" />
                        Primitives
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowCustomTokens(!showCustomTokens)}
                        className={cn("h-16 rounded-2xl gap-3 font-black uppercase tracking-widest text-[9px] border-white/5 transition-all shadow-sm", showCustomTokens && "bg-primary/10 border-primary/20 text-primary")}
                    >
                        <Database className="h-4 w-4" />
                        Protocols
                    </Button>
                </div>

                <AnimatePresence>
                    {showUIPreferences && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 grid md:grid-cols-3 gap-8 mb-8">
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Component Density</Label>
                                    <Select value={componentDensity} onValueChange={setComponentDensity}>
                                        <SelectTrigger className="h-12 bg-black/40 border-none rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a0a0a] border-white/10">
                                            <SelectItem value="comfortable">Comfortable (Stitch)</SelectItem>
                                            <SelectItem value="compact">Compact (Nexus)</SelectItem>
                                            <SelectItem value="direct">Direct (Standard)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Compliance Tier</Label>
                                    <Select value={accessibilityStandard} onValueChange={setAccessibilityStandard}>
                                        <SelectTrigger className="h-12 bg-black/40 border-none rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a0a0a] border-white/10">
                                            <SelectItem value="AA">WCAG 2.1 AA</SelectItem>
                                            <SelectItem value="AAA">WCAG 2.1 AAA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Brand Voice</Label>
                                    <Select value={brandVoice} onValueChange={setBrandVoice}>
                                        <SelectTrigger className="h-12 bg-black/40 border-none rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a0a0a] border-white/10">
                                            <SelectItem value="technical">Technical / Precise</SelectItem>
                                            <SelectItem value="playful">Playful / Vibrant</SelectItem>
                                            <SelectItem value="corporate">Institutional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isCreating}
                    className="w-full h-20 rounded-[1.5rem] text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
                >
                    {isCreating ? (
                        <div className="flex items-center gap-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Synthesizing...
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Sparkles className="h-6 w-6" />
                            Initiate Synthesis
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
      </div>

      {(generatedDesignSystem || isCreating) && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/20 backdrop-blur-md border border-white/5 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                        {isCreating ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Check className="h-5 w-5 text-green-500" />}
                        {isCreating ? 'Synthesizing Architecture...' : 'Architecture System Ready'}
                    </CardTitle>
                    <CardDescription className="text-[9px] font-black tracking-widest uppercase opacity-40 mt-1">Generated Foundation Prototypes</CardDescription>
                </div>
                {!isCreating && (
                    <Button onClick={handleViewDesignSystem} className="rounded-2xl h-12 px-6 gap-2 font-black uppercase tracking-widest text-[10px]">
                        Open Workbench
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-10 space-y-8">
               <div className="flex gap-4">
                    <Button variant="outline" onClick={handleCopyJson} className="rounded-xl h-14 flex-1 gap-2 border-white/10 font-black uppercase tracking-widest text-[10px]">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copy Specification
                    </Button>
                    <Button variant="outline" onClick={handleDownloadJson} className="rounded-xl h-14 flex-1 gap-2 border-white/10 font-black uppercase tracking-widest text-[10px]">
                        <Download className="h-4 w-4" />
                        Download Bundle
                    </Button>
               </div>
               {figmaJson && (
                    <pre className="p-6 bg-black/60 rounded-3xl overflow-auto max-h-[300px] text-[10px] font-mono border border-white/5">
                        {JSON.stringify(figmaJson, null, 2)}
                    </pre>
               )}
            </CardContent>
        </Card>
      )}
    </div>
  )
}
