'use client'

import { useState } from 'react'
import { Copy, Download, Check, FileJson, Code, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CanvasElement } from '@/lib/canvas-types'
import {
  createContainer,
  createTextChild,
  type FigmaJsonRoot,
  type FigmaJsonTextChild,
} from '@/lib/figma-json-format'

interface FigmaExportPanelProps {
  elements: CanvasElement[]
}

function canvasElementToFigmaJson(el: CanvasElement): ReturnType<typeof createContainer> {
  const children: FigmaJsonTextChild[] = []

  // Add text if present
  if (el.text) {
    children.push(
      createTextChild(
        el.text,
        el.fontSize || 14,
        el.textColor || el.fill || '#000000',
        (el.fontWeight === '700' || el.fontWeight === 'Bold') ? 'Bold' :
        (el.fontWeight === '600' || el.fontWeight === 'SemiBold') ? 'SemiBold' :
        (el.fontWeight === '500' || el.fontWeight === 'Medium') ? 'Medium' :
        'Regular'
      )
    )
  }

  // Add label as metadata
  if (el.label && el.label !== el.text) {
    children.push(
      createTextChild(`[${el.label}]`, 10, '#999999', 'Regular')
    )
  }

  // Process children for component groups
  if (el.children && el.children.length > 0) {
    for (const child of el.children) {
      const childContainer = canvasElementToFigmaJson(child)
      // Flatten child containers into text children
      if (childContainer.children) {
        children.push(...childContainer.children)
      }
    }
  }

  // Ensure at least one child
  if (children.length === 0) {
    children.push(createTextChild(el.label || 'Element', 12, '#666666', 'Regular'))
  }

  return createContainer(
    el.label || `${el.type}-${el.id}`,
    children,
    {
      backgroundColor: el.fill || '#FFFFFF',
      padding: Math.round(Math.min(el.width, el.height) * 0.1) || 8,
      cornerRadius: el.cornerRadius || 0,
    }
  )
}

export default function FigmaExportPanel({ elements }: FigmaExportPanelProps) {
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const generateFigmaJson = (): FigmaJsonRoot => {
    return elements
      .filter(el => el.visible)
      .map(el => canvasElementToFigmaJson(el))
  }

  const figmaJson = generateFigmaJson()
  const jsonString = JSON.stringify(figmaJson, null, 2)

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'figma-design-system.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleGenerateCode = async () => {
    const visibleElements = elements.filter(e => e.visible)
    if (visibleElements.length === 0) return

    try {
      setIsGeneratingCode(true)
      const response = await fetch('/api/generate/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: visibleElements }),
      })

      if (!response.ok) throw new Error('Failed to generate code')

      const data = await response.json()
      setCode(data.code)
    } catch (error) {
      console.error(error)
      alert('Error generating code. Please try again.')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleCopyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full text-slate-800 bg-white">
      
      {/* Code Export Section */}
      <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Code className="h-4 w-4 text-indigo-500" />
          React / Tailwind Export
        </Label>

        <div className="text-xs text-slate-500">
          Transform your canvas layout into clean, production-ready React code.
        </div>

        {code ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm" onClick={handleCopyCode}>
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button size="sm" variant="outline" className="h-9 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl" onClick={() => setCode(null)}>
                Clear
              </Button>
            </div>
            <pre className="p-3 bg-white border border-slate-200 shadow-inner text-xs rounded-xl overflow-auto max-h-[250px] font-mono leading-relaxed text-slate-700 select-all">
              {code}
            </pre>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-9 rounded-xl shadow-sm"
            onClick={handleGenerateCode}
            disabled={isGeneratingCode || elements.length === 0}
          >
            {isGeneratingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code className="h-4 w-4" />}
            {isGeneratingCode ? 'Generating Code...' : 'Generate React Code'}
          </Button>
        )}
      </div>

      {/* Figma JSON Section */}
      <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <FileJson className="h-4 w-4 text-orange-500" />
          Figma JSON Export
        </Label>

        {/* Summary */}
        <div className="flex items-center gap-2 p-2.5 bg-blue-50/50 rounded-xl text-xs border border-blue-100 shadow-sm">
          <FileJson className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-blue-800 font-medium">{elements.filter(e => e.visible).length} elements • {(jsonString.length / 1024).toFixed(1)}KB</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 h-9 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl" onClick={handleCopyJson}>
            {copiedJson ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copiedJson ? 'Copied' : 'Copy JSON'}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-9 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl" onClick={handleDownloadJson}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        {/* JSON Preview */}
        <div className="space-y-1 mt-2">
          <label className="text-xs text-slate-400">Preview</label>
          <pre className="p-3 bg-white shadow-inner border border-slate-200 text-xs rounded-xl overflow-auto max-h-[150px] font-mono leading-relaxed select-all text-slate-600">
            {jsonString}
          </pre>
        </div>
      </div>

    </div>
  )
}
