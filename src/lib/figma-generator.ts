import { DesignSystem } from '@prisma/client'
import {
  FigmaJsonRoot,
  FigmaJsonContainer,
  FigmaJsonTextChild,
  createContainer,
  createTextChild,
  normalizeContainer,
  normalizeTextChild,
  figmaJsonToString,
  figmaJsonToBlob,
  designSystemToFigmaJson,
  FONT_WEIGHT_MAP
} from './figma-json-format'

// Re-export the Figma JSON format types for backward compatibility
export type { FigmaJsonRoot, FigmaJsonContainer, FigmaJsonTextChild } from './figma-json-format'

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

/**
 * Generates the consistent Figma JSON format array
 * This is the primary function for generating Figma-compatible JSON
 * 
 * @returns FigmaJsonRoot array with product items
 */
export function generateFigmaJsonFormat(): FigmaJsonRoot {
  return [
    createContainer(
      'Item 1',
      [
        createTextChild('Product Item 1', 18, '#000000', 'Medium'),
        createTextChild('$29.99', 16, '#18A0FB')
      ],
      { backgroundColor: '#FFFFFF', padding: 16, cornerRadius: 8 }
    ),
    createContainer(
      'Item 2',
      [
        createTextChild('Product Item 2', 18, '#000000', 'Medium'),
        createTextChild('$39.99', 16, '#18A0FB')
      ],
      { backgroundColor: '#FFFFFF', padding: 16, cornerRadius: 8 }
    ),
    createContainer(
      'Item 3',
      [
        createTextChild('Product Item 3', 18, '#000000', 'Medium'),
        createTextChild('$49.99', 16, '#18A0FB')
      ],
      { backgroundColor: '#FFFFFF', padding: 16, cornerRadius: 8 }
    )
  ]
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

  // Use the consistent Figma JSON format for product items
  const productItemsData = generateFigmaJsonFormat()

  const mainFrame = createFigmaFrame(
    name,
    1440,
    900,
    '#f8fafc',
    []
  )

  let yPosition = 48

  productItemsData.forEach((item, index) => {
    if (item.type === 'container') {
      const containerWidth = 320
      const containerHeight = 120

      const container = createFigmaCard(
        item.name,
        48 + (index * (containerWidth + 24)),
        yPosition,
        containerWidth,
        containerHeight,
        item.backgroundColor || '#ffffff',
        item.cornerRadius || 8,
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      )

      // Add padding to container
      const padding = item.padding || 16
      let childY = padding

      if (item.children) {
        item.children.forEach((child) => {
          if (child.type === 'text') {
            const fontWeight = FONT_WEIGHT_MAP[child.fontWeight || 'Regular'] || 400
            const fontSize = child.fontSize || 14
            const color = child.color || '#000000'

            const textNode = createFigmaText(
              `Text ${index}`,
              child.text,
              padding,
              childY,
              fontSize,
              'Inter',
              fontWeight,
              color
            )

            container.children = container.children || []
            container.children.push(textNode)

            childY += fontSize * 1.5
          }
        })
      }

      mainFrame.children = mainFrame.children || []
      mainFrame.children.push(container)
    }
  })

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

export function convertDataToFigmaFile(data: any[]): FigmaFile {
  const figmaFrame = createFigmaFrame(
    'Product Items',
    1440,
    900,
    '#f8fafc',
    []
  )

  let yPosition = 48

  // Normalize data to FigmaJsonRoot format first
  const normalizedData: FigmaJsonRoot = data.map(item => normalizeContainer(item))

  normalizedData.forEach((item, index) => {
    if (item.type === 'container') {
      const containerWidth = 320
      const containerHeight = 120

      const container = createFigmaCard(
        item.name,
        48 + (index * (containerWidth + 24)),
        yPosition,
        containerWidth,
        containerHeight,
        item.backgroundColor || '#ffffff',
        item.cornerRadius || 8,
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      )

      // Add padding to container
      const padding = item.padding || 16
      let childY = padding

      if (item.children) {
        item.children.forEach((child) => {
          if (child.type === 'text') {
            const fontWeight = FONT_WEIGHT_MAP[child.fontWeight || 'Regular'] || 400
            const fontSize = child.fontSize || 14
            const color = child.color || '#000000'

            const textNode = createFigmaText(
              `Text ${index}`,
              child.text,
              padding,
              childY,
              fontSize,
              'Inter',
              fontWeight,
              color
            )

            container.children = container.children || []
            container.children.push(textNode)

            childY += fontSize * 1.5
          }
        })
      }

      figmaFrame.children = figmaFrame.children || []
      figmaFrame.children.push(container)
    }
  })

  return {
    name: 'Product Items Design',
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
          children: [figmaFrame]
        }
      ]
    },
    components: {},
    styles: {}
  }
}

/**
 * Converts data array to the consistent Figma JSON format
 * This is the primary function for generating Figma-compatible JSON output
 * 
 * @param data - Array of items to convert
 * @returns FigmaJsonRoot array with consistent format
 */
export function convertDataToFigmaJson(data: any[]): FigmaJsonRoot {
  if (!Array.isArray(data)) {
    return []
  }
  
  return data.map(item => normalizeContainer(item))
}

/**
 * Generates Figma JSON format from a DesignSystem
 * Uses the consistent format across the application
 * 
 * @param designSystem - DesignSystem from database
 * @returns FigmaJsonRoot array
 */
export function convertDesignSystemToFigmaJson(designSystem: DesignSystem): FigmaJsonRoot {
  const colors = JSON.parse(designSystem.colors || '{}')
  const typography = JSON.parse(designSystem.typography || '{}')
  const spacing = JSON.parse(designSystem.spacing || '{}')
  const borderRadius = JSON.parse(designSystem.borderRadius || '{}')
  const shadows = JSON.parse(designSystem.shadows || '{}')
  const components = JSON.parse(designSystem.components || '{}')

  return designSystemToFigmaJson({
    name: designSystem.name,
    description: designSystem.description || undefined,
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

/**
 * Downloads FigmaJsonRoot as a JSON file
 * Uses the consistent format across the application
 * 
 * @param figmaJson - FigmaJsonRoot data
 * @returns Blob for download
 */
export function downloadFigmaJsonFile(figmaJson: FigmaJsonRoot): Blob {
  return figmaJsonToBlob(figmaJson)
}

/**
 * Gets the consistent Figma JSON format as a string
 * 
 * @param figmaJson - FigmaJsonRoot data
 * @returns JSON string
 */
export function getFigmaJsonString(figmaJson: FigmaJsonRoot): string {
  return figmaJsonToString(figmaJson)
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
