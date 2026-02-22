'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Paintbrush, FileJson, Share2, Copy, Check, Monitor, Smartphone, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CanvasToolbar from './CanvasToolbar'
import DesignPromptPanel from './DesignPromptPanel'
import FigmaExportPanel from './FigmaExportPanel'
import DesignGuidelines, { type CanvasPreset } from './DesignGuidelines'
import {
  renderScene,
  screenToWorld,
  hitTest,
  hitTestHandle,
} from '@/lib/canvas-renderer'
import {
  type CanvasElement,
  type CanvasViewport,
  type CanvasTool,
  type CanvasHistoryEntry,
  generateId,
  createCanvasElement,
  createDefaultViewport,
} from '@/lib/canvas-types'
import { generateCanvasElements } from '@/lib/component-to-canvas'

interface CanvasEditorProps {
  designSystem: any
  selectedComponents: string[]
  onBack: () => void
  slug?: string
}

export default function CanvasEditor({
  designSystem,
  selectedComponents,
  onBack,
  slug: initialSlug,
}: CanvasEditorProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewport, setViewport] = useState<CanvasViewport>(createDefaultViewport())
  const [activeTool, setActiveTool] = useState<CanvasTool>('select')
  const [fillColor, setFillColor] = useState('#3B82F6')
  const [gridVisible, setGridVisible] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ width: 1440, height: 800 })
  const [deviceType, setDeviceType] = useState<CanvasPreset>('desktop')
  const [slug, setSlug] = useState(initialSlug || '')
  const [copiedSlug, setCopiedSlug] = useState(false)
  const [showSlugInput, setShowSlugInput] = useState(false)

  // Interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [drawingElement, setDrawingElement] = useState<CanvasElement | null>(null)

  // History for undo/redo
  const [history, setHistory] = useState<CanvasHistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const hasAutoFitted = useRef(false)

  // Canvas preset configurations
  const canvasPresets: Record<CanvasPreset, { width: number; height: number }> = {
    desktop: { width: 1440, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  }

  // Generate unique slug
  const generateSlug = useCallback(() => {
    const newSlug = `design-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    setSlug(newSlug)
    setShowSlugInput(true)
  }, [])

  // Initialize canvas with generated components
  useEffect(() => {
    if (designSystem && selectedComponents.length > 0 && elements.length === 0) {
      const initialElements = generateCanvasElements(selectedComponents, designSystem)
      setElements(initialElements)
      pushHistory(initialElements, 'Initial generation')

      // Auto-fit view after a short delay to let canvas size settle
      setTimeout(() => {
        if (hasAutoFitted.current) return
        hasAutoFitted.current = true
        const container = containerRef.current
        if (!container || initialElements.length === 0) return

        const rect = container.getBoundingClientRect()
        const minX = Math.min(...initialElements.map(e => e.x))
        const minY = Math.min(...initialElements.map(e => e.y))
        const maxX = Math.max(...initialElements.map(e => e.x + e.width))
        const maxY = Math.max(...initialElements.map(e => e.y + e.height))
        const contentW = maxX - minX + 100
        const contentH = maxY - minY + 100
        const zoom = Math.min(rect.width / contentW, rect.height / contentH, 1.5)

        setViewport({
          zoom,
          offsetX: (rect.width - contentW * zoom) / 2 - minX * zoom + 50 * zoom,
          offsetY: (rect.height - contentH * zoom) / 2 - minY * zoom + 50 * zoom,
        })
      }, 100)
    }
  }, [designSystem, selectedComponents]) // eslint-disable-line react-hooks/exhaustive-deps

  // History management
  const pushHistory = useCallback((newElements: CanvasElement[], description: string) => {
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1)
      return [...truncated, { elements: JSON.parse(JSON.stringify(newElements)), description }]
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setElements(JSON.parse(JSON.stringify(history[newIndex].elements)))
      setSelectedIds([])
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setElements(JSON.parse(JSON.stringify(history[newIndex].elements)))
      setSelectedIds([])
    }
  }, [historyIndex, history])

  // Apply canvas preset
  const handleApplyPreset = useCallback((preset: CanvasPreset) => {
    const size = canvasPresets[preset]
    setCanvasSize(size)
    setDeviceType(preset)
    setElements(prev => {
      pushHistory(prev, `Switch to ${preset} preset`)
      return prev
    })
  }, [canvasPresets, pushHistory])

  // Copy slug to clipboard
  const copySlug = useCallback(() => {
    const url = `${window.location.origin}/design/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 2000)
  }, [slug])

  // Canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    renderScene(ctx, elements, selectedIds, viewport, w, h, gridVisible)
  }, [elements, selectedIds, viewport, gridVisible])

  // Get the selected element object
  const selectedElement = selectedIds.length === 1
    ? elements.find(el => el.id === selectedIds[0]) || null
    : null

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const world = screenToWorld(screenX, screenY, viewport)

    // Middle mouse for panning
    if (e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setDragOffset({ x: viewport.offsetX, y: viewport.offsetY })
      return
    }

    if (activeTool === 'select') {
      // Check resize handles on selected element
      if (selectedElement) {
        const handle = hitTestHandle(world.x, world.y, selectedElement)
        if (handle) {
          setResizeHandle(handle)
          setIsDragging(true)
          setDragStart({ x: world.x, y: world.y })
          return
        }
      }

      // Hit test for elements
      const hit = hitTest(world.x, world.y, elements)
      if (hit) {
        setSelectedIds([hit.id])
        setIsDragging(true)
        setDragStart({ x: world.x, y: world.y })
        setDragOffset({ x: hit.x, y: hit.y })
      } else {
        setSelectedIds([])
      }
    } else if (activeTool === 'rectangle') {
      const newEl = createCanvasElement({
        id: generateId(),
        label: 'Rectangle',
        type: 'rectangle',
        x: world.x,
        y: world.y,
        width: 1,
        height: 1,
        fill: fillColor,
        stroke: 'transparent',
        strokeWidth: 0,
        cornerRadius: 8,
      })
      setDrawingElement(newEl)
      setDragStart({ x: world.x, y: world.y })
      setIsDragging(true)
    } else if (activeTool === 'text') {
      const newEl = createCanvasElement({
        id: generateId(),
        label: 'Text',
        type: 'text',
        x: world.x,
        y: world.y,
        width: 200,
        height: 24,
        fill: '#111827',
        stroke: 'transparent',
        strokeWidth: 0,
        cornerRadius: 0,
        text: 'Double-click to edit',
        fontSize: 16,
        fontWeight: '400',
        textColor: '#111827',
        textAlign: 'left',
      })
      setElements(prev => {
        const next = [...prev, newEl]
        pushHistory(next, 'Add text')
        return next
      })
      setSelectedIds([newEl.id])
      setActiveTool('select')
    } else if (activeTool === 'fill') {
      const hit = hitTest(world.x, world.y, elements)
      if (hit) {
        setElements(prev => {
          const next = prev.map(el => el.id === hit.id ? { ...el, fill: fillColor } : el)
          pushHistory(next, 'Fill color')
          return next
        })
      }
    }
  }, [activeTool, elements, fillColor, pushHistory, selectedElement, viewport])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (isPanning) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setViewport(v => ({
        ...v,
        offsetX: dragOffset.x + dx,
        offsetY: dragOffset.y + dy,
      }))
      return
    }

    if (!isDragging) return

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const world = screenToWorld(screenX, screenY, viewport)

    if (activeTool === 'select') {
      if (resizeHandle && selectedIds.length === 1) {
        // Resize
        setElements(prev => prev.map(el => {
          if (el.id !== selectedIds[0]) return el
          const updated = { ...el }
          const dx = world.x - dragStart.x
          const dy = world.y - dragStart.y

          if (resizeHandle.includes('e')) { updated.width = Math.max(10, el.width + dx) }
          if (resizeHandle.includes('w')) { updated.x = el.x + dx; updated.width = Math.max(10, el.width - dx) }
          if (resizeHandle.includes('s')) { updated.height = Math.max(10, el.height + dy) }
          if (resizeHandle.includes('n')) { updated.y = el.y + dy; updated.height = Math.max(10, el.height - dy) }

          return updated
        }))
        setDragStart({ x: world.x, y: world.y })
      } else if (selectedIds.length === 1) {
        // Move
        const dx = world.x - dragStart.x
        const dy = world.y - dragStart.y
        setElements(prev => prev.map(el =>
          el.id === selectedIds[0]
            ? { ...el, x: dragOffset.x + dx, y: dragOffset.y + dy }
            : el
        ))
      }
    } else if (activeTool === 'rectangle' && drawingElement) {
      const w = world.x - dragStart.x
      const h = world.y - dragStart.y
      setDrawingElement(prev => prev ? {
        ...prev,
        x: w >= 0 ? dragStart.x : world.x,
        y: h >= 0 ? dragStart.y : world.y,
        width: Math.abs(w),
        height: Math.abs(h),
      } : null)
      // Temporarily add drawing element to render
      setElements(prev => {
        const filtered = prev.filter(el => el.id !== drawingElement.id)
        return [...filtered, { ...drawingElement, x: w >= 0 ? dragStart.x : world.x, y: h >= 0 ? dragStart.y : world.y, width: Math.abs(w), height: Math.abs(h) }]
      })
    }
  }, [activeTool, dragOffset, dragStart, drawingElement, isDragging, isPanning, resizeHandle, selectedIds, viewport])

  const handleMouseUp = useCallback(() => {
    if (isDragging && activeTool === 'select') {
      pushHistory(elements, resizeHandle ? 'Resize' : 'Move')
    }
    if (drawingElement && activeTool === 'rectangle') {
      pushHistory(elements, 'Draw rectangle')
      setSelectedIds([drawingElement.id])
      setActiveTool('select')
    }
    setIsDragging(false)
    setIsPanning(false)
    setResizeHandle(null)
    setDrawingElement(null)
  }, [activeTool, drawingElement, elements, isDragging, pushHistory, resizeHandle])

  // Scroll to zoom — use native listener with { passive: false } so preventDefault works
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setViewport(v => ({
        ...v,
        zoom: Math.max(0.1, Math.min(5, v.zoom * delta)),
      }))
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'v' || e.key === 'V') setActiveTool('select')
      else if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle')
      else if (e.key === 't' || e.key === 'T') setActiveTool('text')
      else if (e.key === 'f' || e.key === 'F') setActiveTool('fill')
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          setElements(prev => {
            const next = prev.filter(el => !selectedIds.includes(el.id))
            pushHistory(next, 'Delete')
            return next
          })
          setSelectedIds([])
        }
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIds, pushHistory, undo, redo])

  // Element operations
  const handleAddElements = useCallback((newElements: CanvasElement[]) => {
    setElements(prev => {
      const next = [...prev, ...newElements]
      pushHistory(next, 'Add elements')
      return next
    })
  }, [pushHistory])

  const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, ...updates } : el)
      pushHistory(next, 'Update element')
      return next
    })
  }, [pushHistory])

  const handleDeleteElement = useCallback((id: string) => {
    setElements(prev => {
      const next = prev.filter(el => el.id !== id)
      pushHistory(next, 'Delete element')
      return next
    })
    setSelectedIds(prev => prev.filter(sid => sid !== id))
  }, [pushHistory])

  const handleDuplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const newEl = { ...JSON.parse(JSON.stringify(el)), id: generateId(), x: el.x + 20, y: el.y + 20 }
    setElements(prev => {
      const next = [...prev, newEl]
      pushHistory(next, 'Duplicate')
      return next
    })
    setSelectedIds([newEl.id])
  }, [elements, pushHistory])

  // Zoom controls
  const zoomIn = () => setViewport(v => ({ ...v, zoom: Math.min(5, v.zoom * 1.2) }))
  const zoomOut = () => setViewport(v => ({ ...v, zoom: Math.max(0.1, v.zoom / 1.2) }))
  const fitView = () => {
    if (elements.length === 0) return
    const minX = Math.min(...elements.map(e => e.x))
    const minY = Math.min(...elements.map(e => e.y))
    const maxX = Math.max(...elements.map(e => e.x + e.width))
    const maxY = Math.max(...elements.map(e => e.y + e.height))

    const canvas = canvasRef.current
    if (!canvas) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()

    const contentW = maxX - minX + 80
    const contentH = maxY - minY + 80
    const zoom = Math.min(rect.width / contentW, rect.height / contentH, 2)

    setViewport({
      zoom,
      offsetX: (rect.width - contentW * zoom) / 2 - minX * zoom + 40 * zoom,
      offsetY: (rect.height - contentH * zoom) / 2 - minY * zoom + 40 * zoom,
    })
  }

  // Cursor
  const getCursor = () => {
    if (isPanning) return 'grabbing'
    if (activeTool === 'rectangle') return 'crosshair'
    if (activeTool === 'text') return 'text'
    if (activeTool === 'fill') return 'pointer'
    if (activeTool === 'select') return isDragging ? 'grabbing' : 'default'
    return 'default'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 font-sans tracking-tight">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white/95 backdrop-blur z-10 shadow-sm">
        <Button variant="ghost" size="sm" className="gap-2 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </Button>
        <div className="flex-1 text-center text-sm font-medium text-slate-700">
          Canvas Editor — {elements.length} elements
        </div>
        
        {/* Device/Canvas Size Selector */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 border border-slate-200 shadow-inner">
          <Button
            variant={deviceType === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-3 text-xs rounded-full transition-all ${deviceType === 'desktop' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            onClick={() => handleApplyPreset('desktop')}
          >
            <Monitor className="h-3.5 w-3.5 mr-1.5" />
            {canvasSize.width}px
          </Button>
          <Button
            variant={deviceType === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-3 text-xs rounded-full transition-all ${deviceType === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            onClick={() => handleApplyPreset('mobile')}
          >
            <Smartphone className="h-3.5 w-3.5 mr-1.5" />
            {canvasSize.width}px
          </Button>
        </div>

        {/* Share/Slug Button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 text-slate-700 border-slate-300 hover:bg-slate-100 rounded-full"
          onClick={generateSlug}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        
        <div className="text-xs text-slate-500 font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full cursor-default">
          {Math.round(viewport.zoom * 100)}%
        </div>
      </div>

      {/* Slug Display */}
      {slug && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/80 border-b border-blue-100 text-sm">
          <span className="text-xs text-blue-700 font-medium">Share URL:</span>
          <code className="flex-1 text-xs font-mono text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-md">
            {window.location.origin}/design/{slug}
          </code>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 rounded-full text-blue-700 hover:text-blue-800 hover:bg-blue-100"
            onClick={copySlug}
          >
            {copiedSlug ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedSlug ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="bg-white border-r border-slate-200 shadow-sm z-10 w-14 flex flex-col items-center py-2">
          <CanvasToolbar
          activeTool={activeTool}
          fillColor={fillColor}
          gridVisible={gridVisible}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onToolChange={setActiveTool}
          onFillColorChange={setFillColor}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={fitView}
          onUndo={undo}
          onRedo={redo}
          onToggleGrid={() => setGridVisible(v => !v)}
        />
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 overflow-hidden relative bg-[#F8F9FA]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ cursor: getCursor() }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-slate-200 bg-white shrink-0 flex flex-col overflow-hidden shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] z-10">
          <Tabs defaultValue="design" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-3 mt-3 grid grid-cols-3 h-10 bg-slate-100/80 p-1 rounded-lg">
              <TabsTrigger value="design" className="text-[11px] font-medium gap-1.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all">
                <Paintbrush className="h-3.5 w-3.5" />
                Design
              </TabsTrigger>
              <TabsTrigger value="guidelines" className="text-[11px] font-medium gap-1.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all">
                <BookOpen className="h-3.5 w-3.5" />
                Guide
              </TabsTrigger>
              <TabsTrigger value="export" className="text-[11px] font-medium gap-1.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 transition-all">
                <FileJson className="h-3.5 w-3.5" />
                Export
              </TabsTrigger>
            </TabsList>
            <TabsContent value="design" className="flex-1 overflow-y-auto mt-0">
              <DesignPromptPanel
                selectedElement={selectedElement}
                fillColor={fillColor}
                onAddElements={handleAddElements}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
              />
            </TabsContent>
            <TabsContent value="guidelines" className="flex-1 overflow-y-auto mt-0">
              <DesignGuidelines onApplyPreset={handleApplyPreset} />
            </TabsContent>
            <TabsContent value="export" className="flex-1 overflow-y-auto mt-0">
              <FigmaExportPanel elements={elements} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
