'use client'

import { useState, useRef } from 'react'
import { Sparkles, Trash2, Lock, Unlock, Eye, EyeOff, Copy, Image as ImageIcon, X, Loader2, Zap, Beaker } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CanvasElement } from '@/lib/canvas-types'

interface DesignPromptPanelProps {
  selectedElement: CanvasElement | null
  fillColor: string
  onAddElements: (elements: CanvasElement[]) => void
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  onDeleteElement: (id: string) => void
  onDuplicateElement: (id: string) => void
}

export default function DesignPromptPanel({
  selectedElement,
  fillColor, // keeping it in props in case we need it later
  onAddElements,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}: DesignPromptPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<'standard' | 'experimental'>('standard')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImageBase64(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePromptSubmit = async () => {
    if (!prompt.trim() && !imageBase64) return
    setIsProcessing(true)

    try {
      const response = await fetch('/api/generate/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image: imageBase64,
          mode,
          existingElements: selectedElement ? [selectedElement] : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate UI')
      }

      const data = await response.json()

      if (data.elements && Array.isArray(data.elements)) {
        if (selectedElement) {
          // If editing an existing element, we expect the AI may have returned the updated element
          const updatedElement = data.elements.find((e: any) => e.id === selectedElement.id)
          if (updatedElement) {
            onUpdateElement(selectedElement.id, updatedElement)
          } else {
            // Or it just generated new nested/adjacent elements
            onAddElements(data.elements)
          }
        } else {
          onAddElements(data.elements)
        }
      }

      setPrompt('')
      clearImage()
    } catch (error) {
      console.error(error)
      alert('Error generating UI. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full text-slate-800 bg-white">
      {/* AI Generator Panel */}
      <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          AI UI Generator
        </Label>

        {/* Mode Toggle */}
        <div className="flex border border-slate-200 rounded-xl overflow-hidden p-1 bg-slate-100/50">
          <button
            onClick={() => setMode('standard')}
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 rounded-lg transition-all ${mode === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <Zap className="h-3.5 w-3.5" />
            Standard
          </button>
          <button
            onClick={() => setMode('experimental')}
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 rounded-lg transition-all ${mode === 'experimental' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <Beaker className="h-3.5 w-3.5" />
            Experimental
          </button>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          {imageBase64 ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center shadow-inner">
              <img src={imageBase64} alt="Upload preview" className="max-h-full max-w-full object-contain" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-white/80 text-slate-700 p-1.5 rounded-full hover:bg-white shadow-sm backdrop-blur"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5 h-9 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 text-slate-400" />
                Upload Sketch/Reference
              </Button>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={imageFile ? "Describe how to convert this image..." : selectedElement ? "Describe changes to selected element..." : "e.g. Create a dark mode login form with email, password inputs..."}
          className="min-h-[90px] text-sm resize-none bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl shadow-sm focus-visible:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handlePromptSubmit()
            }
          }}
        />

        <Button
          size="sm"
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 shadow-sm"
          onClick={handlePromptSubmit}
          disabled={(!prompt.trim() && !imageBase64) || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isProcessing ? 'Generating...' : selectedElement ? 'Modify Selected' : 'Generate UI'}
        </Button>
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Properties</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">
              {selectedElement.type}
            </span>
          </Label>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Label/Name</label>
            <input
              type="text"
              value={selectedElement.label || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { label: e.target.value })}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdateElement(selectedElement.id, { height: Number(e.target.value) })}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Fill</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.fill || '#ffffff'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { fill: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-white shadow-sm p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={selectedElement.fill || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { fill: e.target.value })}
                  className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Stroke</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.stroke || '#000000'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { stroke: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-white shadow-sm p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={selectedElement.stroke || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { stroke: e.target.value })}
                  className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Corner Radius */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Corner Radius</label>
            <input
              type="number"
              min={0}
              value={selectedElement.cornerRadius || 0}
              onChange={(e) => onUpdateElement(selectedElement.id, { cornerRadius: Number(e.target.value) })}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Text Content */}
          {(selectedElement.type === 'text' || selectedElement.text !== undefined) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Text Content</label>
              <Textarea
                value={selectedElement.text || ''}
                onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
                className="w-full text-xs min-h-[60px] bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg shadow-sm focus-visible:ring-blue-500"
              />
            </div>
          )}

          {/* Font Size */}
          {(selectedElement.type === 'text' || selectedElement.fontSize !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Font Size</label>
                <input
                  type="number"
                  min={8}
                  value={selectedElement.fontSize || 14}
                  onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.textColor || '#000000'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { textColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-white shadow-sm p-0 overflow-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Opacity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 flex justify-between">
              <span>Opacity</span>
              <span className="text-slate-500">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedElement.opacity ?? 1}
              onChange={(e) => onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              onClick={() => onDuplicateElement(selectedElement.id)}
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              onClick={() => onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })}
            >
              {selectedElement.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {selectedElement.locked ? 'Unlock' : 'Lock'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              onClick={() => onUpdateElement(selectedElement.id, { visible: !selectedElement.visible })}
            >
              {selectedElement.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {selectedElement.visible ? 'Hide' : 'Show'}
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-9 text-xs gap-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm"
            onClick={() => onDeleteElement(selectedElement.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Element
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!selectedElement && (
        <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400 space-y-2">
          <p className="font-medium text-slate-500">No element selected</p>
          <p>Click an element on the canvas to see its properties.</p>
        </div>
      )}
    </div>
  )
}
