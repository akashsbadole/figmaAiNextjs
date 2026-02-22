/**
 * Canvas Renderer
 * Pure rendering functions for drawing canvas elements
 */

import type { CanvasElement, CanvasViewport } from './canvas-types'

const HANDLE_SIZE = 8
const GRID_SIZE = 20

// ============================
// Grid Rendering
// ============================

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  viewport: CanvasViewport,
  canvasWidth: number,
  canvasHeight: number
) {
  const { offsetX, offsetY, zoom } = viewport
  const gridSize = GRID_SIZE * zoom

  if (gridSize < 8) return // Too small to render

  ctx.fillStyle = '#334155'  // slate-700 dots on dark bg
  const startX = (offsetX % gridSize + gridSize) % gridSize
  const startY = (offsetY % gridSize + gridSize) % gridSize

  for (let x = startX; x < canvasWidth; x += gridSize) {
    for (let y = startY; y < canvasHeight; y += gridSize) {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// ============================
// Element Rendering
// ============================

function applyTransform(
  ctx: CanvasRenderingContext2D,
  viewport: CanvasViewport
) {
  ctx.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.offsetX, viewport.offsetY)
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function renderElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement
) {
  if (!el.visible) return

  ctx.save()
  ctx.globalAlpha = el.opacity

  if (el.type === 'rectangle') {
    renderRectangle(ctx, el)
  } else if (el.type === 'text') {
    renderTextElement(ctx, el)
  } else if (el.type === 'component-group') {
    renderComponentGroup(ctx, el)
  }

  ctx.restore()
}

function renderRectangle(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  drawRoundedRect(ctx, el.x, el.y, el.width, el.height, el.cornerRadius)

  if (el.fill && el.fill !== 'transparent') {
    ctx.fillStyle = el.fill
    ctx.fill()
  }

  if (el.stroke && el.strokeWidth > 0) {
    ctx.strokeStyle = el.stroke
    ctx.lineWidth = el.strokeWidth
    ctx.stroke()
  }

  // Draw label inside
  if (el.text) {
    ctx.fillStyle = el.textColor || '#000000'
    ctx.font = `${el.fontWeight || '500'} ${el.fontSize || 14}px Inter, system-ui, sans-serif`
    ctx.textAlign = (el.textAlign as CanvasTextAlign) || 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      el.text,
      el.x + el.width / 2,
      el.y + el.height / 2,
      el.width - 16
    )
  }
}

function renderTextElement(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  const fontSize = el.fontSize || 16
  const fontWeight = el.fontWeight || '400'
  ctx.fillStyle = el.textColor || el.fill || '#000000'
  ctx.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
  ctx.textAlign = (el.textAlign as CanvasTextAlign) || 'left'
  ctx.textBaseline = 'top'

  const text = el.text || el.label
  const lines = wrapText(ctx, text, el.width || 300)
  const lineHeight = fontSize * 1.4

  lines.forEach((line, i) => {
    let textX = el.x
    if (el.textAlign === 'center') textX = el.x + (el.width || 300) / 2
    else if (el.textAlign === 'right') textX = el.x + (el.width || 300)
    ctx.fillText(line, textX, el.y + i * lineHeight)
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function renderComponentGroup(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  // Draw background container
  drawRoundedRect(ctx, el.x, el.y, el.width, el.height, el.cornerRadius)
  if (el.fill) {
    ctx.fillStyle = el.fill
    ctx.fill()
  }
  if (el.stroke && el.strokeWidth > 0) {
    ctx.strokeStyle = el.stroke
    ctx.lineWidth = el.strokeWidth
    ctx.stroke()
  }

  // Draw component label at top
  ctx.fillStyle = '#94A3B8'
  ctx.font = '500 10px Inter, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(el.label.toUpperCase(), el.x + 8, el.y + 6)

  // Draw children
  if (el.children) {
    for (const child of el.children) {
      renderElement(ctx, child)
    }
  }
}

// ============================
// Selection Rendering
// ============================

export function renderSelectionHandles(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement
) {
  const { x, y, width: w, height: h } = el

  // Selection border
  ctx.strokeStyle = '#3B82F6'
  ctx.lineWidth = 2
  ctx.setLineDash([])
  ctx.strokeRect(x - 1, y - 1, w + 2, h + 2)

  // Resize handles
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#3B82F6'
  ctx.lineWidth = 1.5

  const positions = [
    [x, y], [x + w / 2, y], [x + w, y],
    [x, y + h / 2], [x + w, y + h / 2],
    [x, y + h], [x + w / 2, y + h], [x + w, y + h],
  ]

  for (const [px, py] of positions) {
    ctx.fillRect(px - HANDLE_SIZE / 2, py - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
    ctx.strokeRect(px - HANDLE_SIZE / 2, py - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
  }
}

// ============================
// Hit Testing
// ============================

export function hitTest(
  worldX: number,
  worldY: number,
  elements: CanvasElement[]
): CanvasElement | null {
  // Iterate in reverse so top-most elements are hit first
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]
    if (!el.visible || el.locked) continue
    if (
      worldX >= el.x &&
      worldX <= el.x + el.width &&
      worldY >= el.y &&
      worldY <= el.y + el.height
    ) {
      return el
    }
  }
  return null
}

export function hitTestHandle(
  worldX: number,
  worldY: number,
  el: CanvasElement
): string | null {
  const { x, y, width: w, height: h } = el
  const hs = HANDLE_SIZE / 2 + 2

  const handles: [number, number, string][] = [
    [x, y, 'nw'], [x + w / 2, y, 'n'], [x + w, y, 'ne'],
    [x, y + h / 2, 'w'], [x + w, y + h / 2, 'e'],
    [x, y + h, 'sw'], [x + w / 2, y + h, 's'], [x + w, y + h, 'se'],
  ]

  for (const [hx, hy, name] of handles) {
    if (Math.abs(worldX - hx) <= hs && Math.abs(worldY - hy) <= hs) {
      return name
    }
  }
  return null
}

// ============================
// Full Scene Render
// ============================

export function renderScene(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  selectedIds: string[],
  viewport: CanvasViewport,
  canvasWidth: number,
  canvasHeight: number,
  gridVisible: boolean
) {
  // Clear
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Background
  ctx.fillStyle = '#0F172A'  // slate-900 dark background
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Grid
  if (gridVisible) {
    renderGrid(ctx, viewport, canvasWidth, canvasHeight)
  }

  // Apply viewport transform
  applyTransform(ctx, viewport)

  // Draw elements
  for (const el of elements) {
    renderElement(ctx, el)
  }

  // Draw selection
  for (const el of elements) {
    if (selectedIds.includes(el.id)) {
      renderSelectionHandles(ctx, el)
    }
  }

  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

// Convert screen coords to world coords
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: CanvasViewport
): { x: number; y: number } {
  return {
    x: (screenX - viewport.offsetX) / viewport.zoom,
    y: (screenY - viewport.offsetY) / viewport.zoom,
  }
}
