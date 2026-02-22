'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Share2, Download, Copy, Check, Layout, Type, Layers, Box, Maximize2, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface VisualWorkbenchProps {
  designSystem: any
  isLoading?: boolean
}

export function VisualWorkbench({ designSystem, isLoading }: VisualWorkbenchProps) {
  const [activeTab, setActiveTab] = useState('foundation')
  const [selectedToken, setSelectedToken] = useState<any>(null)

  if (!designSystem && !isLoading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
         <div className="p-10 bg-white/[0.02] rounded-full mb-8">
            <Layout className="h-16 w-16 text-muted-foreground/20" />
         </div>
         <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px]">Awaiting Synthesis Protocol</p>
      </div>
    )
  }

  const colors = designSystem?.colors || {}
  const typography = designSystem?.typography || {}
  const spacing = designSystem?.spacing?.values || {}
  const components = designSystem?.components || {}

  return (
    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-background/20 backdrop-blur-3xl border border-white/5 selection:bg-primary/20 min-h-[800px] flex flex-col">
      <CardHeader className="p-10 border-b border-white/5 bg-background/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <Box className="h-6 w-6 text-primary" />
             </div>
             <div>
                <CardTitle className="text-2xl font-black tracking-tight">{designSystem?.name || 'Synthesized Architecture'}</CardTitle>
                <CardDescription className="text-[9px] font-black uppercase tracking-widest opacity-40">Visual System Workbench v2.0</CardDescription>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-white/10 font-black uppercase tracking-widest text-[10px]">
                <Share2 className="h-4 w-4" />
                Live Inspect
             </Button>
             <Button className="rounded-xl h-12 px-6 gap-2 font-black uppercase tracking-widest text-[10px]">
                <Download className="h-4 w-4" />
                Bundle Assets
             </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-24 border-r border-white/5 bg-black/20 flex flex-col items-center py-10 gap-8">
            {[
                { id: 'foundation', icon: Palette, label: 'Tokens' },
                { id: 'typography', icon: Type, label: 'Type' },
                { id: 'components', icon: Layers, label: 'Blocks' },
                { id: 'layout', icon: Maximize2, label: 'Shell' }
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                        "flex flex-col items-center gap-2 group transition-all",
                        activeTab === item.id ? "text-primary scale-110" : "text-muted-foreground/40 hover:text-white"
                    )}
                >
                    <div className={cn("p-4 rounded-2xl transition-all", activeTab === item.id ? "bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10" : "bg-white/[0.02] border border-transparent group-hover:bg-white/5")}>
                        <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
            ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-12 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12 relative z-10"
                >
                    {activeTab === 'foundation' && (
                        <div className="space-y-16">
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Chromatic Engine</h3>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {Object.entries(colors).map(([name, shades]: [string, any]) => (
                                        <div key={name} className="space-y-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{name}</span>
                                            <div className="grid grid-cols-5 gap-1">
                                                {Object.entries(shades).slice(0, 5).map(([shade, hex]: [string, any]) => (
                                                    <div 
                                                        key={shade} 
                                                        className="group relative h-12 w-full rounded-lg cursor-pointer transition-transform hover:scale-110 hover:z-20 shadow-xl"
                                                        style={{ backgroundColor: hex }}
                                                        onClick={() => setSelectedToken({ type: 'color', name: `${name}-${shade}`, value: hex })}
                                                    >
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg flex items-center justify-center">
                                                            <span className="text-[8px] font-bold text-white uppercase">{shade}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Atomic Spacing</h3>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    {Object.entries(spacing).map(([name, value]: [string, any]) => (
                                        <div key={name} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 min-w-[120px]">
                                            <div className="h-8 bg-primary/20 border border-primary/40 rounded flex items-center justify-center p-2" style={{ width: value }}>
                                                <Move className="h-3 w-3 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground/40">{name}</span>
                                                <span className="text-xs font-bold">{value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'typography' && (
                        <div className="space-y-12">
                             <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Typography Engine</h3>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                             </div>
                             <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[2.5rem] space-y-12">
                                {Object.entries(typography.fontSize || {}).map(([name, size]: [string, any]) => (
                                    <div key={name} className="flex items-baseline justify-between border-b border-white/[0.03] pb-8 last:border-0">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">{name} - {size}</span>
                                            <p 
                                                className="text-white hover:text-primary transition-colors cursor-default"
                                                style={{ fontSize: size, fontWeight: typography.fontWeight?.[name] || '400' }}
                                            >
                                                Neural Synthesis Protocol
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-40 border-white/5">{typography.fontFamily?.sans?.[0] || 'Inter'}</Badge>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {activeTab === 'components' && (
                        <div className="space-y-12">
                             <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Component Blueprints</h3>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                             </div>
                             <div className="grid md:grid-cols-2 gap-8">
                                {Object.entries(components).map(([name, config]: [string, any]) => (
                                    <Card key={name} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group hover:border-primary/20 transition-all">
                                        <CardHeader className="p-6 border-b border-white/5">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-black uppercase tracking-widest">{name}</CardTitle>
                                                <div className="flex gap-1">
                                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-10 flex flex-col items-center justify-center min-h-[160px]">
                                            {/* Render primitive component based on name */}
                                            {name.toLowerCase().includes('button') ? (
                                                <button 
                                                    className="px-8 py-3 rounded-lg font-bold text-sm shadow-xl transition-all hover:scale-105"
                                                    style={{ 
                                                        backgroundColor: config.backgroundColor || colors.primary?.['500'],
                                                        color: config.textColor || '#FFFFFF',
                                                        borderRadius: `${config.borderRadius || 8}px`
                                                    }}
                                                >
                                                    Protocol Action
                                                </button>
                                            ) : name.toLowerCase().includes('input') ? (
                                                <div className="w-full max-w-[200px] space-y-2">
                                                    <div className="h-2 w-12 bg-white/10 rounded" />
                                                    <div className="w-full h-10 bg-white/5 border border-white/10 rounded-lg" />
                                                </div>
                                            ) : (
                                                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl w-full">
                                                    <div className="space-y-3">
                                                        <div className="h-2 w-1/2 bg-white/20 rounded" />
                                                        <div className="h-2 w-full bg-white/10 rounded" />
                                                        <div className="h-2 w-2/3 bg-white/5 rounded" />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                             </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </main>

        {/* Inspector Panel */}
        <aside className="w-[320px] border-l border-white/5 bg-black/40 p-8 flex flex-col gap-10">
            <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Inspector</span>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    {selectedToken ? (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black tracking-tight">{selectedToken.name}</span>
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] font-black uppercase">{selectedToken.type}</Badge>
                            </div>
                            <div className="space-y-4">
                                <div className="h-24 w-full rounded-2xl shadow-inner border border-white/5" style={{ backgroundColor: selectedToken.value }} />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-black/40 rounded-xl space-y-1">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground/40">HEX</span>
                                        <span className="text-[10px] font-mono font-bold block">{selectedToken.value}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-full rounded-xl hover:bg-white/5" onClick={() => navigator.clipboard.writeText(selectedToken.value)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center space-y-4">
                            <Layers className="h-8 w-8 text-muted-foreground/10 mx-auto" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">Select token to inspect</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Architectural Note</span>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl italic text-[11px] text-primary/80 leading-relaxed font-medium">
                    "The visual system uses high-density grids and 8-point vertical rhythm for optimal synthesis."
                </div>
            </div>
        </aside>
      </div>
    </Card>
  )
}
