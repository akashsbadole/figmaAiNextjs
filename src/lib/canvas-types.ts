/**
 * Canvas Types
 * Type definitions for the canvas editor system
 */

export interface CanvasElement {
  id: string
  type: 'rectangle' | 'text' | 'component-group'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  opacity: number
  // Text-specific
  text?: string
  fontSize?: number
  fontWeight?: string
  textColor?: string
  textAlign?: 'left' | 'center' | 'right'
  // Group-specific
  children?: CanvasElement[]
  // Metadata
  label: string
  locked: boolean
  visible: boolean
  componentType?: string // e.g., 'button', 'card', 'input'
}

export interface CanvasViewport {
  offsetX: number
  offsetY: number
  zoom: number
}

export type CanvasTool = 'select' | 'move' | 'rectangle' | 'text' | 'fill'

export interface CanvasState {
  elements: CanvasElement[]
  selectedIds: string[]
  viewport: CanvasViewport
  activeTool: CanvasTool
  fillColor: string
  strokeColor: string
  gridVisible: boolean
}

export interface CanvasHistoryEntry {
  elements: CanvasElement[]
  description: string
}

export interface CanvasHistory {
  entries: CanvasHistoryEntry[]
  currentIndex: number
}

// Factory helpers
export function createCanvasElement(
  overrides: Partial<CanvasElement> & { id: string; label: string }
): CanvasElement {
  return {
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    locked: false,
    visible: true,
    ...overrides,
  }
}

export function createDefaultViewport(): CanvasViewport {
  return { offsetX: 0, offsetY: 0, zoom: 1 }
}

export function createDefaultState(): CanvasState {
  return {
    elements: [],
    selectedIds: [],
    viewport: createDefaultViewport(),
    activeTool: 'select',
    fillColor: '#3B82F6',
    strokeColor: '#1E40AF',
    gridVisible: true,
  }
}

export function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
