'use client'

import { MousePointer2, Square, Type, Paintbrush, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CanvasTool } from '@/lib/canvas-types'

interface CanvasToolbarProps {
  activeTool: CanvasTool
  fillColor: string
  gridVisible: boolean
  canUndo: boolean
  canRedo: boolean
  onToolChange: (tool: CanvasTool) => void
  onFillColorChange: (color: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleGrid: () => void
}

const tools: { id: CanvasTool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'fill', icon: Paintbrush, label: 'Fill (F)' },
]

export default function CanvasToolbar({
  activeTool, fillColor, gridVisible,
  canUndo, canRedo,
  onToolChange, onFillColorChange,
  onZoomIn, onZoomOut, onFitView,
  onUndo, onRedo, onToggleGrid,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-full shrink-0">
      {/* Drawing Tools */}
      {tools.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant={activeTool === id ? 'default' : 'ghost'}
          size="icon"
          className={cn(
            'h-10 w-10 rounded-xl transition-all',
            activeTool === id 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          )}
          onClick={() => onToolChange(id)}
          title={label}
        >
          <Icon className="h-4.5 w-4.5" />
        </Button>
      ))}

      <div className="w-8 border-t border-slate-200 my-1" />

      {/* Color Picker */}
      <div className="relative" title="Fill Color">
        <input
          type="color"
          value={fillColor}
          onChange={(e) => onFillColorChange(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer shadow-sm border-2 border-white ring-1 ring-slate-200 overflow-hidden"
          style={{ padding: 0 }}
        />
      </div>

      <div className="w-8 border-t border-slate-200 my-1" />

      {/* Zoom Controls */}
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={onZoomIn} title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={onZoomOut} title="Zoom Out">
        <ZoomOut className="h-4.5 w-4.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={onFitView} title="Fit View">
        <Maximize2 className="h-4.5 w-4.5" />
      </Button>

      <div className="w-8 border-t border-slate-200 my-1" />

      {/* Undo/Redo */}
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40" onClick={onUndo} disabled={!canUndo} title="Undo">
        <Undo2 className="h-4.5 w-4.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40" onClick={onRedo} disabled={!canRedo} title="Redo">
        <Redo2 className="h-4.5 w-4.5" />
      </Button>

      <div className="w-8 border-t border-slate-200 my-1" />

      {/* Grid Toggle */}
      <Button
        variant={gridVisible ? 'default' : 'ghost'}
        size="icon"
        className={cn(
          'h-10 w-10 rounded-xl transition-all',
          gridVisible 
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        )}
        onClick={onToggleGrid}
        title="Toggle Grid"
      >
        <Grid3X3 className="h-4.5 w-4.5" />
      </Button>
    </div>
  )
}
