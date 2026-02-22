'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, RefreshCw, Smartphone, Monitor, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FigmaSyncPanelProps {
  figmaJson: any
  isGenerating?: boolean
  systemName?: string
}

export function FigmaSyncPanel({ figmaJson, isGenerating, systemName }: FigmaSyncPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!figmaJson) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(figmaJson, null, 2))
      setCopied(true)
      toast.success('Figma JSON copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    if (!figmaJson) return
    const blob = new Blob([JSON.stringify(figmaJson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${systemName || 'design-system'}.figma.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Figma template downloaded')
  }

  return (
    <Card className="border-none bg-black/5 shadow-none rounded-none h-full flex flex-col">
      <CardHeader className="p-6 border-b bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-2">
              <RefreshCw className={cn("h-5 w-5 text-primary", isGenerating && "animate-spin")} />
              Figma Sync
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-widest opacity-50">
              {isGenerating ? 'Synthesizing Protocol...' : 'Protocol Ready'}
            </CardDescription>
          </div>
          <Badge variant={figmaJson ? "default" : "outline"} className="rounded-full px-4 py-1 font-black uppercase tracking-widest text-[9px]">
            {figmaJson ? 'Figma-Ready' : 'Pending Synthesis'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Sync Controls */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Sync Actions</span>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              disabled={!figmaJson || isGenerating}
              onClick={handleCopy}
              className="h-14 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
            <Button 
              variant="outline"
              disabled={!figmaJson || isGenerating}
              onClick={handleDownload}
              className="h-14 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/5 transition-all"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Compatibility Check</span>
          <div className="space-y-2">
             {[
               { label: 'Color Tokens', status: !!figmaJson?.colors, icon: Shield },
               { label: 'Typography Engine', status: !!figmaJson?.typography, icon: Zap },
               { label: 'Component Blueprints', status: !!figmaJson?.components, icon: Smartphone }
             ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-white/5 backdrop-blur-xl">
                   <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", item.status ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted-foreground")}>
                         <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground">{item.label}</span>
                   </div>
                   {item.status ? (
                      <Check className="h-4 w-4 text-green-500" />
                   ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/20 animate-pulse" />
                   )}
                </div>
             ))}
          </div>
        </div>

        {/* Live Code Preview */}
        {figmaJson && (
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">JSON Protocol Snippet</span>
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <pre className="relative bg-black/80 rounded-3xl p-6 text-[10px] font-mono text-primary/80 overflow-auto max-h-[300px] border border-white/5 selection:bg-primary/20">
                    {JSON.stringify(figmaJson, null, 2)}
                </pre>
            </div>
          </div>
        )}
      </CardContent>

      <div className="p-6 border-t bg-background/50 backdrop-blur-md">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 text-center">
          Apex Layer Sync Protocol v2.4.0
        </p>
      </div>
    </Card>
  )
}
