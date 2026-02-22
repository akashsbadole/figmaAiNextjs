/**
 * Component to Canvas Converter
 * Converts selected design system components into CanvasElement[] for the canvas editor
 */

import type { CanvasElement } from './canvas-types'
import { generateId, createCanvasElement } from './canvas-types'

interface DesignTokens {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  errorColor: string
  warningColor: string
  successColor: string
  textColor: string
  bgColor: string
  borderColor: string
  borderRadius: number
  fontSize: number
  fontFamily: string
}

function extractTokens(designSystem: any): DesignTokens {
  const colors = designSystem?.colors || {}
  return {
    primaryColor: colors.primary?.['500'] || '#3B82F6',
    secondaryColor: colors.secondary?.['500'] || '#8B5CF6',
    accentColor: colors.accent?.['500'] || '#10B981',
    errorColor: colors.error?.['500'] || '#EF4444',
    warningColor: colors.warning?.['500'] || '#F59E0B',
    successColor: colors.success?.['500'] || '#22C55E',
    textColor: colors.neutral?.['900'] || '#111827',
    bgColor: colors.neutral?.['50'] || '#F9FAFB',
    borderColor: colors.neutral?.['200'] || '#E5E7EB',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: designSystem?.typography?.fontFamily?.sans?.[0] || 'Inter',
  }
}

function getContrastText(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// ============================================
// Component Generators
// ============================================

function createButton(
  t: DesignTokens,
  variant: string,
  x: number,
  y: number
): CanvasElement {
  const colors: Record<string, { bg: string; text: string; stroke: string }> = {
    primary: { bg: t.primaryColor, text: getContrastText(t.primaryColor), stroke: 'transparent' },
    secondary: { bg: t.secondaryColor, text: getContrastText(t.secondaryColor), stroke: 'transparent' },
    outline: { bg: 'transparent', text: t.primaryColor, stroke: t.primaryColor },
    ghost: { bg: 'transparent', text: t.textColor, stroke: 'transparent' },
    destructive: { bg: t.errorColor, text: '#FFFFFF', stroke: 'transparent' },
  }
  const c = colors[variant] || colors.primary
  return createCanvasElement({
    id: generateId(), label: `Button (${variant})`, type: 'rectangle',
    x, y, width: 140, height: 40,
    fill: c.bg, stroke: c.stroke, strokeWidth: c.stroke === 'transparent' ? 0 : 2,
    cornerRadius: t.borderRadius,
    text: variant.charAt(0).toUpperCase() + variant.slice(1), fontSize: 14, fontWeight: '600',
    textColor: c.text, componentType: 'button',
  })
}

function createInputField(t: DesignTokens, x: number, y: number): CanvasElement {
  return createCanvasElement({
    id: generateId(), label: 'Input Field', type: 'component-group',
    x, y, width: 280, height: 70,
    fill: '#FFFFFF', stroke: t.borderColor, strokeWidth: 0,
    cornerRadius: 0, componentType: 'input',
    children: [
      createCanvasElement({
        id: generateId(), label: 'Label', type: 'text',
        x: x, y: y + 2, width: 280, height: 18,
        fill: t.textColor, stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 0, text: 'Label', fontSize: 13, fontWeight: '500',
        textColor: t.textColor, textAlign: 'left',
      }),
      createCanvasElement({
        id: generateId(), label: 'Input Box', type: 'rectangle',
        x: x, y: y + 24, width: 280, height: 40,
        fill: '#FFFFFF', stroke: t.borderColor, strokeWidth: 1,
        cornerRadius: t.borderRadius,
        text: 'Placeholder text...', fontSize: 14, fontWeight: '400',
        textColor: '#9CA3AF', componentType: 'input',
      }),
    ],
  })
}

function createCard(t: DesignTokens, x: number, y: number): CanvasElement {
  return createCanvasElement({
    id: generateId(), label: 'Card', type: 'component-group',
    x, y, width: 300, height: 180,
    fill: '#FFFFFF', stroke: t.borderColor, strokeWidth: 1,
    cornerRadius: t.borderRadius + 4, componentType: 'card',
    children: [
      createCanvasElement({
        id: generateId(), label: 'Card Title', type: 'text',
        x: x + 20, y: y + 20, width: 260, height: 24,
        fill: t.textColor, stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 0, text: 'Card Title', fontSize: 18, fontWeight: '600',
        textColor: t.textColor, textAlign: 'left',
      }),
      createCanvasElement({
        id: generateId(), label: 'Card Description', type: 'text',
        x: x + 20, y: y + 52, width: 260, height: 40,
        fill: '#6B7280', stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 0, text: 'This is a card description with some helpful information.',
        fontSize: 14, fontWeight: '400', textColor: '#6B7280', textAlign: 'left',
      }),
      createCanvasElement({
        id: generateId(), label: 'Card Button', type: 'rectangle',
        x: x + 20, y: y + 120, width: 100, height: 36,
        fill: t.primaryColor, stroke: 'transparent', strokeWidth: 0,
        cornerRadius: t.borderRadius,
        text: 'Action', fontSize: 13, fontWeight: '600',
        textColor: getContrastText(t.primaryColor), componentType: 'button',
      }),
    ],
  })
}

function createBadge(t: DesignTokens, variant: string, x: number, y: number): CanvasElement {
  const colors: Record<string, { bg: string; text: string }> = {
    default: { bg: t.primaryColor + '20', text: t.primaryColor },
    success: { bg: t.successColor + '20', text: t.successColor },
    warning: { bg: t.warningColor + '20', text: t.warningColor },
    error: { bg: t.errorColor + '20', text: t.errorColor },
  }
  const c = colors[variant] || colors.default
  return createCanvasElement({
    id: generateId(), label: `Badge (${variant})`, type: 'rectangle',
    x, y, width: 80, height: 26,
    fill: c.bg, stroke: 'transparent', strokeWidth: 0,
    cornerRadius: 999,
    text: variant.charAt(0).toUpperCase() + variant.slice(1), fontSize: 12, fontWeight: '500',
    textColor: c.text, componentType: 'badge',
  })
}

function createToggle(t: DesignTokens, on: boolean, x: number, y: number): CanvasElement {
  return createCanvasElement({
    id: generateId(), label: `Toggle (${on ? 'On' : 'Off'})`, type: 'component-group',
    x, y, width: 48, height: 26,
    fill: on ? t.primaryColor : '#D1D5DB', stroke: 'transparent', strokeWidth: 0,
    cornerRadius: 999, componentType: 'toggle',
    children: [
      createCanvasElement({
        id: generateId(), label: 'Toggle Knob', type: 'rectangle',
        x: on ? x + 24 : x + 2, y: y + 2, width: 22, height: 22,
        fill: '#FFFFFF', stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 999,
      }),
    ],
  })
}

function createAvatar(t: DesignTokens, x: number, y: number): CanvasElement {
  return createCanvasElement({
    id: generateId(), label: 'Avatar', type: 'rectangle',
    x, y, width: 40, height: 40,
    fill: t.primaryColor, stroke: 'transparent', strokeWidth: 0,
    cornerRadius: 999,
    text: 'JD', fontSize: 14, fontWeight: '600',
    textColor: getContrastText(t.primaryColor), componentType: 'avatar',
  })
}

function createAlert(t: DesignTokens, variant: string, x: number, y: number): CanvasElement {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    info: { bg: t.primaryColor + '10', border: t.primaryColor, text: t.primaryColor },
    success: { bg: t.successColor + '10', border: t.successColor, text: t.successColor },
    warning: { bg: t.warningColor + '10', border: t.warningColor, text: t.warningColor },
    error: { bg: t.errorColor + '10', border: t.errorColor, text: t.errorColor },
  }
  const c = colors[variant] || colors.info
  return createCanvasElement({
    id: generateId(), label: `Alert (${variant})`, type: 'rectangle',
    x, y, width: 300, height: 50,
    fill: c.bg, stroke: c.border, strokeWidth: 1,
    cornerRadius: t.borderRadius,
    text: `This is a ${variant} alert message.`, fontSize: 13, fontWeight: '500',
    textColor: c.text, componentType: 'alert',
  })
}

function createNavbar(t: DesignTokens, x: number, y: number): CanvasElement {
  return createCanvasElement({
    id: generateId(), label: 'Navigation Bar', type: 'component-group',
    x, y, width: 600, height: 56,
    fill: '#FFFFFF', stroke: t.borderColor, strokeWidth: 1,
    cornerRadius: 0, componentType: 'navbar',
    children: [
      createCanvasElement({
        id: generateId(), label: 'Logo', type: 'text',
        x: x + 20, y: y + 16, width: 120, height: 24,
        fill: t.primaryColor, stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 0, text: 'DesignAI', fontSize: 18, fontWeight: '700',
        textColor: t.primaryColor, textAlign: 'left',
      }),
      ...['Home', 'About', 'Contact'].map((item, i) =>
        createCanvasElement({
          id: generateId(), label: `Nav ${item}`, type: 'text',
          x: x + 200 + i * 90, y: y + 18, width: 80, height: 20,
          fill: t.textColor, stroke: 'transparent', strokeWidth: 0,
          cornerRadius: 0, text: item, fontSize: 14, fontWeight: '500',
          textColor: t.textColor, textAlign: 'center',
        })
      ),
    ],
  })
}

function createColorPalette(t: DesignTokens, x: number, y: number): CanvasElement {
  const paletteColors = [
    { name: 'Primary', color: t.primaryColor },
    { name: 'Secondary', color: t.secondaryColor },
    { name: 'Accent', color: t.accentColor },
    { name: 'Error', color: t.errorColor },
    { name: 'Warning', color: t.warningColor },
    { name: 'Success', color: t.successColor },
  ]
  return createCanvasElement({
    id: generateId(), label: 'Color Palette', type: 'component-group',
    x, y, width: paletteColors.length * 70, height: 80,
    fill: 'transparent', stroke: 'transparent', strokeWidth: 0,
    cornerRadius: 0, componentType: 'colors',
    children: paletteColors.map((c, i) =>
      createCanvasElement({
        id: generateId(), label: c.name, type: 'rectangle',
        x: x + i * 70, y: y + 20, width: 60, height: 60,
        fill: c.color, stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 8,
        text: c.name, fontSize: 9, fontWeight: '500',
        textColor: getContrastText(c.color),
      })
    ),
  })
}

function createTypographySamples(t: DesignTokens, x: number, y: number): CanvasElement {
  const samples = [
    { text: 'Heading 1', size: 32, weight: '700' },
    { text: 'Heading 2', size: 24, weight: '600' },
    { text: 'Heading 3', size: 20, weight: '600' },
    { text: 'Body text — The quick brown fox jumps over the lazy dog.', size: 14, weight: '400' },
    { text: 'Caption text', size: 12, weight: '400' },
  ]
  return createCanvasElement({
    id: generateId(), label: 'Typography', type: 'component-group',
    x, y, width: 400, height: samples.length * 44 + 20,
    fill: 'transparent', stroke: 'transparent', strokeWidth: 0,
    cornerRadius: 0, componentType: 'typography',
    children: samples.map((s, i) =>
      createCanvasElement({
        id: generateId(), label: s.text.split(' — ')[0], type: 'text',
        x: x, y: y + 20 + i * 44, width: 400, height: s.size + 10,
        fill: t.textColor, stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 0, text: s.text, fontSize: s.size, fontWeight: s.weight,
        textColor: t.textColor, textAlign: 'left',
      })
    ),
  })
}

function createSpacingScale(t: DesignTokens, x: number, y: number): CanvasElement {
  const spacings = [4, 8, 12, 16, 24, 32, 48]
  return createCanvasElement({
    id: generateId(), label: 'Spacing Scale', type: 'component-group',
    x, y, width: 300, height: spacings.length * 30 + 20,
    fill: 'transparent', stroke: 'transparent', strokeWidth: 0,
    cornerRadius: 0, componentType: 'spacing',
    children: spacings.map((s, i) =>
      createCanvasElement({
        id: generateId(), label: `${s}px`, type: 'rectangle',
        x: x, y: y + 20 + i * 30, width: s * 4, height: 20,
        fill: t.primaryColor + '40', stroke: 'transparent', strokeWidth: 0,
        cornerRadius: 2,
        text: `${s}px`, fontSize: 10, fontWeight: '500',
        textColor: t.textColor,
      })
    ),
  })
}

function createTablePreview(t: DesignTokens, x: number, y: number): CanvasElement {
  return createCanvasElement({
    id: generateId(), label: 'Data Table', type: 'component-group',
    x, y, width: 400, height: 160,
    fill: '#FFFFFF', stroke: t.borderColor, strokeWidth: 1,
    cornerRadius: t.borderRadius, componentType: 'table',
    children: [
      // Header row
      createCanvasElement({
        id: generateId(), label: 'Table Header', type: 'rectangle',
        x, y, width: 400, height: 40,
        fill: t.bgColor, stroke: t.borderColor, strokeWidth: 1,
        cornerRadius: 0,
        text: 'Name          Email               Status', fontSize: 12, fontWeight: '600',
        textColor: t.textColor,
      }),
      // Rows
      ...[1, 2, 3].map((row) =>
        createCanvasElement({
          id: generateId(), label: `Row ${row}`, type: 'rectangle',
          x, y: y + 40 * row, width: 400, height: 40,
          fill: '#FFFFFF', stroke: t.borderColor, strokeWidth: 0.5,
          cornerRadius: 0,
          text: `User ${row}       user${row}@email.com   Active`, fontSize: 12, fontWeight: '400',
          textColor: '#6B7280',
        })
      ),
    ],
  })
}

// ============================================
// Main Converter
// ============================================

export function generateCanvasElements(
  selectedComponents: string[],
  designSystem: any
): CanvasElement[] {
  const tokens = extractTokens(designSystem)
  const elements: CanvasElement[] = []

  // Layout configuration
  const COL_WIDTH = 360
  const ROW_GAP = 30
  const COL_GAP = 40
  const START_X = 40
  const START_Y = 40

  // Section header helper
  let currentY = START_Y
  let currentCol = 0

  const addSectionLabel = (text: string, col: number): CanvasElement => {
    return createCanvasElement({
      id: generateId(), label: text, type: 'text',
      x: START_X + col * (COL_WIDTH + COL_GAP), y: currentY,
      width: COL_WIDTH, height: 28,
      fill: '#111827', stroke: 'transparent', strokeWidth: 0,
      cornerRadius: 0, text, fontSize: 20, fontWeight: '700',
      textColor: '#111827', textAlign: 'left',
    })
  }

  // Process each selected component type
  const componentMap: Record<string, () => void> = {
    colors: () => {
      elements.push(addSectionLabel('Color Palette', 0))
      currentY += 36
      elements.push(createColorPalette(tokens, START_X, currentY))
      currentY += 110
    },
    typography: () => {
      elements.push(addSectionLabel('Typography', 0))
      currentY += 36
      elements.push(createTypographySamples(tokens, START_X, currentY))
      currentY += 260
    },
    spacing: () => {
      elements.push(addSectionLabel('Spacing', 0))
      currentY += 36
      elements.push(createSpacingScale(tokens, START_X, currentY))
      currentY += 260
    },
    buttons: () => {
      elements.push(addSectionLabel('Buttons', 0))
      currentY += 36
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive']
      variants.forEach((v, i) => {
        elements.push(createButton(tokens, v, START_X + (i % 3) * 155, currentY + Math.floor(i / 3) * 55))
      })
      currentY += 130
    },
    inputs: () => {
      elements.push(addSectionLabel('Input Fields', 0))
      currentY += 36
      elements.push(createInputField(tokens, START_X, currentY))
      currentY += 100
    },
    cards: () => {
      elements.push(addSectionLabel('Cards', 0))
      currentY += 36
      elements.push(createCard(tokens, START_X, currentY))
      currentY += 210
    },
    badges: () => {
      currentY += 10
      const variants = ['default', 'success', 'warning', 'error']
      variants.forEach((v, i) => {
        elements.push(createBadge(tokens, v, START_X + i * 95, currentY))
      })
      currentY += 50
    },
    toggles: () => {
      currentY += 10
      elements.push(createToggle(tokens, true, START_X, currentY))
      elements.push(createToggle(tokens, false, START_X + 65, currentY))
      currentY += 50
    },
    avatars: () => {
      currentY += 10
      elements.push(createAvatar(tokens, START_X, currentY))
      elements.push(createAvatar(tokens, START_X + 55, currentY))
      elements.push(createAvatar(tokens, START_X + 110, currentY))
      currentY += 60
    },
    alerts: () => {
      elements.push(addSectionLabel('Alerts', 0))
      currentY += 36
      const variants = ['info', 'success', 'warning', 'error']
      variants.forEach((v, i) => {
        elements.push(createAlert(tokens, v, START_X, currentY + i * 62))
      })
      currentY += 260
    },
    navbar: () => {
      elements.push(addSectionLabel('Navigation Bar', 0))
      currentY += 36
      elements.push(createNavbar(tokens, START_X, currentY))
      currentY += 80
    },
    tables: () => {
      elements.push(addSectionLabel('Data Table', 0))
      currentY += 36
      elements.push(createTablePreview(tokens, START_X, currentY))
      currentY += 190
    },
    elevation: () => {
      elements.push(addSectionLabel('Elevation & Shadows', 0))
      currentY += 36
      ;[1, 2, 3].forEach((depth, i) => {
        elements.push(createCanvasElement({
          id: generateId(), label: `Shadow Level ${depth}`, type: 'rectangle',
          x: START_X + i * 120, y: currentY, width: 100, height: 60,
          fill: '#FFFFFF', stroke: '#E5E7EB', strokeWidth: 1,
          cornerRadius: tokens.borderRadius,
          text: `Level ${depth}`, fontSize: 12, fontWeight: '500',
          textColor: '#6B7280', componentType: 'elevation',
        }))
      })
      currentY += 90
    },
    borders: () => {
      currentY += 10
      ;[4, 8, 12, 16, 999].forEach((r, i) => {
        elements.push(createCanvasElement({
          id: generateId(), label: `Radius ${r}`, type: 'rectangle',
          x: START_X + i * 70, y: currentY, width: 56, height: 56,
          fill: '#F3F4F6', stroke: tokens.borderColor, strokeWidth: 1,
          cornerRadius: r,
          text: `${r}px`, fontSize: 10, fontWeight: '500',
          textColor: '#6B7280', componentType: 'borders',
        }))
      })
      currentY += 80
    },
  }

  // Add components in logical order
  const orderedComponents = [
    'colors', 'typography', 'spacing', 'buttons', 'inputs', 'cards',
    'badges', 'toggles', 'avatars', 'alerts', 'navbar', 'tables',
    'elevation', 'borders',
    // Simple fallthrough for others
    'checkboxes', 'links', 'modals', 'tooltips', 'loaders', 'toasts',
    'popovers', 'menus', 'breadcrumbs', 'tabs', 'pagination', 'accordion',
    'sidebar', 'lists', 'stats', 'charts', 'timeline', 'tree',
    'forms', 'textarea', 'select', 'datepicker', 'slider', 'fileupload',
    'multiselect', 'grid', 'containers', 'dividers', 'aspectratio',
    'carousel', 'emptystate', 'icons',
  ]

  for (const comp of orderedComponents) {
    if (selectedComponents.includes(comp)) {
      if (componentMap[comp]) {
        componentMap[comp]()
      } else {
        // Generic placeholder for components without dedicated renderers
        elements.push(createCanvasElement({
          id: generateId(), label: comp.charAt(0).toUpperCase() + comp.slice(1), type: 'rectangle',
          x: START_X, y: currentY, width: 200, height: 50,
          fill: '#F9FAFB', stroke: tokens.borderColor, strokeWidth: 1,
          cornerRadius: tokens.borderRadius,
          text: comp.charAt(0).toUpperCase() + comp.slice(1), fontSize: 14, fontWeight: '500',
          textColor: '#6B7280', componentType: comp,
        }))
        currentY += 70
      }
    }
  }

  return elements
}
