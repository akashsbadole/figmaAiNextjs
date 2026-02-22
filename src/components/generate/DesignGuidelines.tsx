'use client'

import { Monitor, Smartphone, Grid3X3, Layers, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DesignGuidelinesProps {
  onApplyPreset?: (preset: CanvasPreset) => void
}

export type CanvasPreset = 'desktop' | 'tablet' | 'mobile'

const designGuidelines = {
  desktop: {
    title: 'Desktop',
    width: 1440,
    description: 'Design with a 1440px or 1280px frame width to ensure compatibility with most laptops and desktop monitors.',
    icon: Monitor,
    bestFor: 'Web applications, Admin dashboards, Landing pages',
  },
  mobile: {
    title: 'Mobile',
    width: 375,
    description: 'Start with 375px (standard mobile width) to cover the majority of modern smartphones.',
    icon: Smartphone,
    bestFor: 'Mobile-first designs, Responsive web, Native apps',
  },
  tablet: {
    title: 'Tablet',
    width: 768,
    description: 'Design for 768px width to cover iPads and Android tablets in portrait mode.',
    icon: Monitor,
    bestFor: 'Responsive designs, Tablet-optimized interfaces',
  },
}

const gridGuidelines = {
  title: 'Grid System',
  description: 'Use an 8px grid system for spacing, ensuring all elements align to multiples of 8 for consistency.',
  icon: Grid3X3,
  values: [
    { label: '4px', description: 'Minimal spacing' },
    { label: '8px', description: 'Base unit' },
    { label: '16px', description: 'Standard spacing' },
    { label: '24px', description: 'Section padding' },
    { label: '32px', description: 'Large gaps' },
    { label: '48px', description: 'Section margins' },
  ],
}

const responsiveBreakpoints = [
  { label: 'Mobile', range: '< 640px', description: 'Small phones' },
  { label: 'Tablet', range: '641-1007px', description: 'Tablets, small laptops' },
  { label: 'Desktop', range: '1008px+', description: 'Standard monitors' },
  { label: 'Large Desktop', range: '1440px+', description: 'Wide displays' },
]

export default function DesignGuidelines({ onApplyPreset }: DesignGuidelinesProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full text-slate-800 bg-white">
      <Tabs defaultValue="presets" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-1 grid grid-cols-3 h-10 bg-slate-100/80 p-1 rounded-xl">
          <TabsTrigger value="presets" className="text-xs gap-1.5 h-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all">
            <Monitor className="h-3.5 w-3.5" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="grid" className="text-xs gap-1.5 h-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all">
            <Grid3X3 className="h-3.5 w-3.5" />
            Grid
          </TabsTrigger>
          <TabsTrigger value="breakpoints" className="text-xs gap-1.5 h-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all">
            <Layers className="h-3.5 w-3.5" />
            Breakpoints
          </TabsTrigger>
        </TabsList>

        {/* Canvas Presets */}
        <TabsContent value="presets" className="flex-1 overflow-y-auto mt-4 space-y-4">
          <div className="text-xs text-slate-500 mb-3 px-1">
            Select a canvas preset to apply standard dimensions for your design target.
          </div>
          
          {Object.entries(designGuidelines).map(([key, guideline]) => {
            const Icon = guideline.icon
            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-blue-600 bg-blue-50 p-1 rounded-md" />
                  <span className="font-semibold text-sm text-slate-800">{guideline.title}</span>
                  <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono font-medium">{guideline.width}px</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{guideline.description}</p>
                <p className="text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg mb-3">Best for: {guideline.bestFor}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => onApplyPreset?.(key as CanvasPreset)}
                >
                  Apply {guideline.title} Preset
                </Button>
              </div>
            )
          })}
        </TabsContent>

        {/* Grid System */}
        <TabsContent value="grid" className="flex-1 overflow-y-auto mt-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Grid3X3 className="h-5 w-5 text-indigo-500 bg-indigo-50 p-1 rounded-md" />
              <span className="font-semibold text-sm text-slate-800">{gridGuidelines.title}</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">{gridGuidelines.description}</p>
            
            <div className="space-y-3">
              {gridGuidelines.values.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-xs">
                  <div className="w-14 font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-center">{item.label}</div>
                  <div className="flex-1 h-px bg-slate-100" />
                  <div className="text-slate-600 font-medium">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-600 p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">Tip: Always use multiples of 8 for margins, padding, and element sizes</span>
          </div>
        </TabsContent>

        {/* Responsive Breakpoints */}
        <TabsContent value="breakpoints" className="flex-1 overflow-y-auto mt-4 space-y-3">
          <div className="text-xs text-slate-500 mb-3 px-1">
            Use these breakpoints for responsive design to ensure your design works across all devices.
          </div>
          
          {responsiveBreakpoints.map((bp) => (
            <div
              key={bp.label}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-800">{bp.label}</span>
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {bp.range}
                </span>
              </div>
              <p className="text-xs text-slate-600">{bp.description}</p>
            </div>
          ))}

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm mt-4">
            <h4 className="text-xs font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              Recommended Approach
            </h4>
            <ol className="text-xs text-indigo-800/80 space-y-2 list-decimal list-inside font-medium">
              <li>Start with mobile (375px) design</li>
              <li>Scale up to tablet (768px)</li>
              <li>Finish with desktop (1440px)</li>
              <li>Use fluid spacing between breakpoints</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
            onClick={() => {
              const url = `${window.location.origin}/design/${Date.now()}`
              copyToClipboard(url)
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Share Guidelines
          </Button>
        </div>
      </div>
    </div>
  )
}
