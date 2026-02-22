'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Palette, Type, Box, Smartphone, Monitor, Plus, Loader2, CheckCircle2, Zap, Shield, Heart, Trophy, Rocket, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface GenerationPromptProps {
  onGenerate: (prompt: string, platform: 'app' | 'web', options?: any) => void
  isLoading?: boolean
}

const personalities = [
  { id: 'professional', label: 'Professional', icon: Shield, color: 'text-blue-500' },
  { id: 'creative', label: 'Creative', icon: ZapCustom, color: 'text-purple-500' },
  { id: 'minimalist', label: 'Minimalist', icon: Globe, color: 'text-gray-400' },
  { id: 'friendly', label: 'Friendly', icon: Heart, color: 'text-pink-500' },
  { id: 'energetic', label: 'Energetic', icon: Rocket, color: 'text-orange-500' },
]

const styles = [
  { id: 'modern', label: 'Modern' },
  { id: 'brutalist', label: 'Neo-Brutalist' },
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'flat', label: 'Flat Design' },
  { id: 'claymorphism', label: 'Claymorphism' },
]

export function GenerationPrompt({ onGenerate, isLoading }: GenerationPromptProps) {
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState<'app' | 'web'>('web')
  const [personality, setPersonality] = useState('professional')
  const [designStyle, setDesignStyle] = useState('modern')
  
  // Loading Steps for "Stitch" experience
  const [loadingStep, setLoadingStep] = useState(0)
  const steps = [
    "Analyzing design prompt...",
    "Synthesizing visual foundations...",
    "Generating component blueprints...",
    "Compiling Figma templates...",
    "Finalizing design system node..."
  ]

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
      }, 3000)
      return () => clearInterval(interval)
    } else {
      setLoadingStep(0)
    }
  }, [isLoading, steps.length])

  const examples = [
    "A dark mode fintech dashboard with neon accents and high-density data visualizations.",
    "A clean, white-space heavy health meditation app with pastel tones and soft shadows.",
    "An e-commerce platform for high-end fashion with bold typography and minimalist layout.",
  ]

  return (
    <div className="max-w-5xl mx-auto w-full space-y-20 py-12 relative">
      {/* Hero Text */}
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4"
        >
          <Zap className="h-3 w-3" />
          Powered by Gemini 1.5 Pro
        </motion.div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Describe Your Vision
        </h1>
        <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto opacity-70">
          Transform raw ideas into production-ready design systems with the power of generative design engines.
        </p>
      </div>

      <div className="flex flex-col items-center gap-16">
        {/* Advanced Selectors Row */}
        <div className="flex flex-wrap justify-center gap-12 w-full">
            {/* Platform */}
            <div className="space-y-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Canvas</span>
                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl">
                    <button
                        onClick={() => setPlatform('app')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            platform === 'app' ? "bg-primary text-white shadow-xl scale-105" : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <Smartphone className="h-4 w-4" />
                        App
                    </button>
                    <button
                        onClick={() => setPlatform('web')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            platform === 'web' ? "bg-primary text-white shadow-xl scale-105" : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <Monitor className="h-4 w-4" />
                        Web
                    </button>
                </div>
            </div>

            {/* Personality */}
            <div className="space-y-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Personality</span>
                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl gap-1">
                    {personalities.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPersonality(p.id)}
                            className={cn(
                                "flex items-center justify-center p-2.5 rounded-xl transition-all",
                                personality === p.id ? "bg-white/[0.08] text-white shadow-inner" : "text-muted-foreground hover:bg-white/5"
                            )}
                            title={p.label}
                        >
                            <p.icon className={cn("h-4 w-4", personality === p.id ? p.color : "opacity-40")} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Style */}
            <div className="space-y-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Visual Style</span>
                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl whitespace-nowrap overflow-x-auto max-w-[300px] no-scrollbar">
                    {styles.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setDesignStyle(s.id)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                designStyle === s.id ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* The Glow Box - Main Input */}
        <div className="relative w-full max-w-4xl group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/40 via-blue-500/20 to-primary/40 rounded-[3.5rem] blur-3xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000 scale-105" />
          <div className="relative bg-[#0A0A0A]/60 backdrop-blur-3xl border-2 border-white/[0.05] rounded-[3.5rem] p-12 focus-within:border-primary/40 focus-within:bg-[#0A0A0A]/80 transition-all duration-500 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What kind of design system should we architect today?"
              className="min-h-[220px] w-full text-3xl font-bold bg-transparent border-none focus-visible:ring-0 resize-none p-0 placeholder:text-white/10 leading-relaxed tracking-tight"
            />
            
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-12 bottom-12 flex flex-col gap-4 pointer-events-none"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="text-sm font-black uppercase tracking-[0.2em] text-white/80">{steps[loadingStep]}</span>
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground">{Math.round(((loadingStep + 1) / steps.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isLoading && (
                <div className="flex items-center justify-between mt-8">
                   <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all group/btn cursor-pointer">
                            <Plus className="h-5 w-5 text-muted-foreground group-hover/btn:text-white transition-colors" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Attach Brand Assets</span>
                   </div>
                   <div className="flex items-center gap-2">
                        {examples.slice(0, 1).map((ex, i) => (
                             <button
                                key={i}
                                onClick={() => setPrompt(ex)}
                                className="text-[10px] font-bold text-primary/40 hover:text-primary transition-colors italic border-b border-primary/20"
                             >
                                 "Try: {ex.slice(0, 30)}..."
                             </button>
                        ))}
                   </div>
                </div>
            )}
          </div>
        </div>

        {/* The Action Button */}
        <motion.div
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           className="w-full max-w-sm"
        >
            <Button
              onClick={() => onGenerate(prompt, platform, { personality, designStyle })}
              disabled={!prompt.trim() || isLoading}
              size="lg"
              className="w-full h-20 rounded-[2.5rem] text-xl font-black shadow-[0_20px_60px_rgba(66,133,244,0.3)] hover:shadow-[0_25px_80px_rgba(66,133,244,0.4)] transition-all bg-primary hover:bg-primary/90 border border-white/10"
            >
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <div className="absolute inset-0 bg-white/20 blur-lg animate-pulse rounded-full" />
                  </div>
                  Synthesizing
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Sparkles className="h-6 w-6" />
                  Initiate Architecht
                </div>
              )}
            </Button>
        </motion.div>

        {/* Examples Section */}
        <div className="w-full max-w-3xl space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 text-center">
                Design Sequences
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {examples.map((example, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ y: -5 }}
                        onClick={() => setPrompt(example)}
                        className="text-left p-6 rounded-[2rem] border border-white/[0.03] bg-white/[0.01] hover:bg-primary/[0.03] hover:border-primary/20 transition-all group relative overflow-hidden h-[180px] flex flex-col justify-between"
                    >
                        <div className="absolute -top-10 -right-10 h-24 w-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors line-clamp-4 leading-relaxed italic">"{example}"</span>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">Sequence {i + 1}</span>
                            <Sparkles className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-110" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

function ZapCustom(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71 12 2l1 10.29L20 9.29 12 22l-1-10.29L4 14.71z" />
    </svg>
  )
}
