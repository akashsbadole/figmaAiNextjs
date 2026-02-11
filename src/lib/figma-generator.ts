import { DesignSystem } from '@prisma/client'

export interface FigmaColor {
  r: number
  g: number
  b: number
  a: number
}

export interface FigmaTextStyle {
  fontFamily: string
  fontWeight: number
  fontSize: number
  lineHeightPx: number
  letterSpacing: number
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  visible: boolean
  radius: number
  color?: FigmaColor
  offset?: { x: number; y: number }
  spread?: number
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  documentationLinks?: string[]
}

export interface FigmaStyle {
  key: string
  name: string
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
  description: string
}

export interface FigmaNode {
  id: string
  name: string
  type: 'DOCUMENT' | 'CANVAS' | 'FRAME' | 'GROUP' | 'VECTOR' | 'BOOLEAN_OPERATION' | 'STAR' | 'LINE' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'RECTANGLE' | 'TEXT' | 'SLICE' | 'COMPONENT' | 'INSTANCE' | 'COMPONENT_SET'
  visible?: boolean
  locked?: boolean
  children?: FigmaNode[]
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  fills?: Array<{
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE'
    visible: boolean
    opacity?: number
    color?: FigmaColor
  }>
  strokes?: Array<{
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL'
    visible: boolean
    opacity?: number
    color?: FigmaColor
  }>
  strokeWeight?: number
  cornerRadius?: number
  rectangleCornerRadii?: [number, number, number, number]
  effects?: FigmaEffect[]
  characters?: string
  style?: {
    fontFamily: string
    fontWeight: number
    fontSize: number
    textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
    textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
    letterSpacing: number
    lineHeightPx: number
  }
}

export interface FigmaFile {
  name: string
  version: string
  document: FigmaNode
  components: Record<string, FigmaComponent>
  styles: Record<string, FigmaStyle>
  componentSets?: Record<string, FigmaComponent>
}

export function hexToFigmaColor(hex: string): FigmaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: 1
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function generateColorStyles(colors: Record<string, string>): Record<string, FigmaStyle> {
  const styles: Record<string, FigmaStyle> = {}

  for (const [name, hex] of Object.entries(colors)) {
    const key = generateUUID()
    styles[key] = {
      key,
      name: `colors/${name}`,
      styleType: 'FILL',
      description: `Color token: ${name}`
    }
  }

  return styles
}

export function generateTypographyStyles(typography: Record<string, any>): Record<string, FigmaStyle> {
  const styles: Record<string, FigmaStyle> = {}

  for (const [name, style] of Object.entries(typography)) {
    const key = generateUUID()
    styles[key] = {
      key,
      name: `typography/${name}`,
      styleType: 'TEXT',
      description: `Text style token: ${name}`
    }
  }

  return styles
}

export function createFigmaFrame(
  name: string,
  width: number,
  height: number,
  background: string,
  children?: FigmaNode[]
): FigmaNode {
  return {
    id: generateUUID(),
    name,
    type: 'FRAME',
    absoluteBoundingBox: {
      x: 0,
      y: 0,
      width,
      height
    },
    fills: [{
      type: 'SOLID' as const,
      visible: true,
      opacity: 1,
      color: hexToFigmaColor(background)
    }],
    children
  }
}

export function createFigmaText(
  name: string,
  characters: string,
  x: number,
  y: number,
  fontSize: number,
  fontFamily: string = 'Inter',
  fontWeight: number = 400,
  color: string = '#000000'
): FigmaNode {
  const lineHeight = fontSize * 1.5

  return {
    id: generateUUID(),
    name,
    type: 'TEXT',
    absoluteBoundingBox: {
      x,
      y,
      width: 200,
      height: lineHeight
    },
    fills: [{
      type: 'SOLID' as const,
      visible: true,
      opacity: 1,
      color: hexToFigmaColor(color)
    }],
    style: {
      fontFamily,
      fontWeight,
      fontSize,
      textAlignHorizontal: 'LEFT' as const,
      textAlignVertical: 'TOP' as const,
      letterSpacing: 0,
      lineHeightPx: lineHeight
    },
    characters
  }
}

export function createFigmaRectangle(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  background?: string,
  borderRadius?: number,
  border?: { color: string; width: number }
): FigmaNode {
  const fills = background ? [{
    type: 'SOLID' as const,
    visible: true,
    opacity: 1,
    color: hexToFigmaColor(background)
  }] : []

  const strokes = border ? [{
    type: 'SOLID' as const,
    visible: true,
    opacity: 1,
    color: hexToFigmaColor(border.color)
  }] : []

  return {
    id: generateUUID(),
    name,
    type: 'RECTANGLE',
    absoluteBoundingBox: {
      x,
      y,
      width,
      height
    },
    fills,
    strokeWeight: border?.width || 0,
    strokes,
    cornerRadius: borderRadius
  }
}

export function createFigmaButton(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  background: string,
  textColor: string = '#ffffff',
  cornerRadius: number = 8
): FigmaNode {
  return {
    id: generateUUID(),
    name,
    type: 'FRAME',
    absoluteBoundingBox: {
      x,
      y,
      width,
      height
    },
    fills: [{
      type: 'SOLID' as const,
      visible: true,
      opacity: 1,
      color: hexToFigmaColor(background)
    }],
    cornerRadius,
    children: [
      createFigmaText('Label', text, 0, 0, 14, 'Inter', 500, textColor)
    ]
  }
}

export function createFigmaCard(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  background: string = '#ffffff',
  borderRadius: number = 12,
  shadow?: string
): FigmaNode {
  const effects: FigmaEffect[] = []

  if (shadow) {
    effects.push({
      type: 'DROP_SHADOW' as const,
      visible: true,
      radius: 10,
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 }
    })
  }

  return {
    id: generateUUID(),
    name,
    type: 'FRAME',
    absoluteBoundingBox: {
      x,
      y,
      width,
      height
    },
    fills: [{
      type: 'SOLID' as const,
      visible: true,
      opacity: 1,
      color: hexToFigmaColor(background)
    }],
    cornerRadius: borderRadius,
    effects
  }
}

export function createFigmaInput(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  placeholder: string,
  borderColor: string = '#e2e8f0',
  background: string = '#ffffff'
): FigmaNode {
  return {
    id: generateUUID(),
    name,
    type: 'FRAME',
    absoluteBoundingBox: {
      x,
      y,
      width,
      height
    },
    fills: [{
      type: 'SOLID' as const,
      visible: true,
      opacity: 1,
      color: hexToFigmaColor(background)
    }],
    cornerRadius: 6,
    strokes: [{
      type: 'SOLID' as const,
      visible: true,
      opacity: 1,
      color: hexToFigmaColor(borderColor)
    }],
    strokeWeight: 1,
    children: [
      createFigmaText('Placeholder', placeholder, 12, 0, 14, 'Inter', 400, '#94a3b8')
    ]
  }
}

export function generateFigmaFile(
  name: string,
  designSystem: {
    colors: Record<string, string>
    typography: Record<string, any>
    spacing: Record<string, string | number>
    borderRadius: Record<string, number>
    shadows: Record<string, string>
    components: Record<string, any>
  }
): FigmaFile {
  const colorStyles = generateColorStyles(designSystem.colors)
  const textStyles = generateTypographyStyles(designSystem.typography)

  const mainFrame = createFigmaFrame(
    name,
    1440,
    900,
    '#f8fafc',
    [
      createFigmaText('Header/Title', name, 48, 48, 32, 'Inter', 700, '#1e293b'),
      createFigmaText('Subtitle/Description', 'Design System Components', 48, 96, 16, 'Inter', 400, '#64748b'),
      createFigmaCard('Sample Card', 48, 160, 320, 200, '#ffffff', 12, '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
      createFigmaButton('Primary Button', 48, 400, 160, 48, 'Click Me', '#3b82f6', '#ffffff', 8),
      createFigmaInput('Text Input', 48, 480, 320, 48, 'Enter text...', '#e2e8f0', '#ffffff')
    ]
  )

  return {
    name,
    version: '1.0.0',
    document: {
      id: generateUUID(),
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: generateUUID(),
          name: 'Page 1',
          type: 'CANVAS',
          children: [mainFrame]
        }
      ]
    },
    components: {},
    styles: {
      ...colorStyles,
      ...textStyles
    }
  }
}

export function convertDesignSystemToFigma(
  designSystem: DesignSystem,
  includeComponents: boolean = true
): FigmaFile {
  const colors = JSON.parse(designSystem.colors || '{}')
  const typography = JSON.parse(designSystem.typography || '{}')
  const spacing = JSON.parse(designSystem.spacing || '{}')
  const borderRadius = JSON.parse(designSystem.borderRadius || '{}')
  const shadows = JSON.parse(designSystem.shadows || '{}')
  const components = JSON.parse(designSystem.components || '{}')

  return generateFigmaFile(designSystem.name, {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    components
  })
}

export function downloadFigmaFile(figmaFile: FigmaFile): Blob {
  const json = JSON.stringify(figmaFile, null, 2)
  return new Blob([json], { type: 'application/json' })
}

export function generateFigmaPluginTokens(designSystem: DesignSystem): object {
  const colors = JSON.parse(designSystem.colors || '{}')
  const typography = JSON.parse(designSystem.typography || '{}')
  const spacing = JSON.parse(designSystem.spacing || '{}')
  const borderRadius = JSON.parse(designSystem.borderRadius || '{}')
  const shadows = JSON.parse(designSystem.shadows || '{}')

  return {
    meta: {
      name: designSystem.name,
      description: designSystem.description || '',
      version: designSystem.version,
      createdAt: designSystem.createdAt.toISOString(),
      updatedAt: designSystem.updatedAt.toISOString()
    },
    global: {
      colors,
      typography,
      spacing,
      borderRadius,
      shadows
    }
  }
}
