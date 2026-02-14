/**
 * Figma JSON Format - Shared Utility
 * 
 * This module provides a consistent JSON format for Figma compatibility
 * across the entire web application.
 * 
 * Required JSON Output Structure:
 * - Root must be an array of items
 * - Each item must have: name, type, backgroundColor, padding, cornerRadius, children
 * - Child elements must have: type, text, fontSize, fontWeight (optional), color
 */

// ============================================
// Type Definitions
// ============================================

/**
 * Text child element for containers
 */
export interface FigmaJsonTextChild {
  type: 'text'
  text: string
  fontSize: number
  fontWeight?: 'Light' | 'Regular' | 'Medium' | 'SemiBold' | 'Bold' | 'ExtraBold'
  color: string
}

/**
 * Container item in the Figma JSON format
 */
export interface FigmaJsonContainer {
  name: string
  type: 'container'
  backgroundColor: string
  padding: number
  cornerRadius: number
  children: FigmaJsonTextChild[]
}

/**
 * Root type for Figma JSON format - array of containers
 */
export type FigmaJsonRoot = FigmaJsonContainer[]

/**
 * Font weight mapping from string to numeric values
 */
export const FONT_WEIGHT_MAP: Record<string, number> = {
  'Light': 300,
  'Regular': 400,
  'Medium': 500,
  'SemiBold': 600,
  'Bold': 700,
  'ExtraBold': 800
}

/**
 * Reverse mapping from numeric to string font weights
 */
export const NUMERIC_TO_FONT_WEIGHT: Record<number, string> = {
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold'
}

// ============================================
// Factory Functions
// ============================================

/**
 * Creates a text child element
 * 
 * @param text - The text content
 * @param fontSize - Font size in pixels
 * @param color - Hex color string
 * @param fontWeight - Optional font weight (defaults to 'Regular')
 * @returns A FigmaJsonTextChild object
 */
export function createTextChild(
  text: string,
  fontSize: number = 14,
  color: string = '#000000',
  fontWeight: FigmaJsonTextChild['fontWeight'] = 'Regular'
): FigmaJsonTextChild {
  return {
    type: 'text',
    text,
    fontSize,
    fontWeight,
    color
  }
}

/**
 * Creates a container item with children
 * 
 * @param name - Container name
 * @param children - Array of text children
 * @param options - Optional configuration
 * @returns A FigmaJsonContainer object
 */
export function createContainer(
  name: string,
  children: FigmaJsonTextChild[] = [],
  options: {
    backgroundColor?: string
    padding?: number
    cornerRadius?: number
  } = {}
): FigmaJsonContainer {
  return {
    name,
    type: 'container',
    backgroundColor: options.backgroundColor || '#FFFFFF',
    padding: options.padding ?? 16,
    cornerRadius: options.cornerRadius ?? 8,
    children
  }
}

/**
 * Creates an empty Figma JSON root array
 * 
 * @returns An empty FigmaJsonRoot array
 */
export function createEmptyFigmaJson(): FigmaJsonRoot {
  return []
}

// ============================================
// Conversion Functions
// ============================================

/**
 * Converts a numeric font weight to string representation
 * 
 * @param weight - Numeric font weight (300-800)
 * @returns String font weight or 'Regular' as default
 */
export function numericToFontWeight(weight: number): FigmaJsonTextChild['fontWeight'] {
  return (NUMERIC_TO_FONT_WEIGHT[weight] || 'Regular') as FigmaJsonTextChild['fontWeight']
}

/**
 * Converts a string font weight to numeric value
 * 
 * @param weight - String font weight
 * @returns Numeric font weight (defaults to 400)
 */
export function fontWeightToNumeric(weight: string | undefined): number {
  if (!weight) return 400
  return FONT_WEIGHT_MAP[weight] || 400
}

/**
 * Validates and normalizes a hex color string
 * 
 * @param color - Input color string
 * @returns Normalized hex color (defaults to '#000000')
 */
export function normalizeHexColor(color: string | undefined): string {
  if (!color) return '#000000'
  
  // If already a valid hex color, return it
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase()
  }
  
  // If hex without #, add it
  if (/^[0-9A-Fa-f]{6}$/.test(color)) {
    return `#${color.toUpperCase()}`
  }
  
  // If 3-character hex, expand to 6
  if (/^[0-9A-Fa-f]{3}$/.test(color)) {
    const expanded = color.split('').map(c => c + c).join('')
    return `#${expanded.toUpperCase()}`
  }
  
  // If hex without # and 3 chars, expand and add #
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    const hex = color.slice(1)
    const expanded = hex.split('').map(c => c + c).join('')
    return `#${expanded.toUpperCase()}`
  }
  
  return '#000000'
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validates a FigmaJsonTextChild object
 * 
 * @param child - Object to validate
 * @returns True if valid, false otherwise
 */
export function isValidTextChild(child: any): child is FigmaJsonTextChild {
  if (!child || typeof child !== 'object') return false
  if (child.type !== 'text') return false
  if (typeof child.text !== 'string') return false
  if (typeof child.fontSize !== 'number') return false
  if (typeof child.color !== 'string') return false
  
  // Validate optional fontWeight
  if (child.fontWeight !== undefined) {
    const validWeights = ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']
    if (!validWeights.includes(child.fontWeight)) return false
  }
  
  return true
}

/**
 * Validates a FigmaJsonContainer object
 * 
 * @param container - Object to validate
 * @returns True if valid, false otherwise
 */
export function isValidContainer(container: any): container is FigmaJsonContainer {
  if (!container || typeof container !== 'object') return false
  if (container.type !== 'container') return false
  if (typeof container.name !== 'string') return false
  if (typeof container.backgroundColor !== 'string') return false
  if (typeof container.padding !== 'number') return false
  if (typeof container.cornerRadius !== 'number') return false
  if (!Array.isArray(container.children)) return false
  
  // Validate all children
  return container.children.every(isValidTextChild)
}

/**
 * Validates a FigmaJsonRoot array
 * 
 * @param root - Array to validate
 * @returns True if valid, false otherwise
 */
export function isValidFigmaJson(root: any): root is FigmaJsonRoot {
  if (!Array.isArray(root)) return false
  return root.every(isValidContainer)
}

// ============================================
// Transformation Functions
// ============================================

/**
 * Normalizes a container to ensure all fields have valid values
 * 
 * @param container - Container to normalize
 * @returns Normalized container
 */
export function normalizeContainer(container: Partial<FigmaJsonContainer>): FigmaJsonContainer {
  return {
    name: container.name || 'Unnamed Container',
    type: 'container',
    backgroundColor: normalizeHexColor(container.backgroundColor),
    padding: typeof container.padding === 'number' ? container.padding : 16,
    cornerRadius: typeof container.cornerRadius === 'number' ? container.cornerRadius : 8,
    children: Array.isArray(container.children) 
      ? container.children.map(normalizeTextChild) 
      : []
  }
}

/**
 * Normalizes a text child to ensure all fields have valid values
 * 
 * @param child - Text child to normalize
 * @returns Normalized text child
 */
export function normalizeTextChild(child: Partial<FigmaJsonTextChild>): FigmaJsonTextChild {
  return {
    type: 'text',
    text: child.text || '',
    fontSize: typeof child.fontSize === 'number' ? child.fontSize : 14,
    fontWeight: child.fontWeight || 'Regular',
    color: normalizeHexColor(child.color)
  }
}

/**
 * Converts any data to Figma JSON format
 * Handles edge cases gracefully
 * 
 * @param data - Input data to convert
 * @returns FigmaJsonRoot array
 */
export function toFigmaJson(data: any): FigmaJsonRoot {
  // If already valid Figma JSON, return as-is
  if (isValidFigmaJson(data)) {
    return data
  }
  
  // If it's an array, try to convert each item
  if (Array.isArray(data)) {
    return data.map(item => {
      // If it's already a valid container, normalize it
      if (isValidContainer(item)) {
        return normalizeContainer(item)
      }
      
      // Try to extract container-like data
      return normalizeContainer({
        name: item.name || item.title || 'Item',
        backgroundColor: item.backgroundColor || item.background || item.bgColor,
        padding: item.padding,
        cornerRadius: item.cornerRadius || item.borderRadius || item.radius,
        children: Array.isArray(item.children) 
          ? item.children.map((child: any) => normalizeTextChild({
              type: 'text',
              text: child.text || child.content || child.value || '',
              fontSize: child.fontSize || child.size,
              fontWeight: child.fontWeight || child.weight,
              color: child.color || child.textColor
            }))
          : []
      })
    })
  }
  
  // If it's an object with items/containers property
  if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) {
      return toFigmaJson(data.items)
    }
    if (Array.isArray(data.containers)) {
      return toFigmaJson(data.containers)
    }
    if (Array.isArray(data.children)) {
      return toFigmaJson(data.children)
    }
  }
  
  // Return empty array for invalid data
  return []
}

// ============================================
// Export Functions
// ============================================

/**
 * Converts FigmaJsonRoot to a JSON string
 * 
 * @param data - FigmaJsonRoot data
 * @param pretty - Whether to pretty-print (default: true)
 * @returns JSON string
 */
export function figmaJsonToString(data: FigmaJsonRoot, pretty: boolean = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0)
}

/**
 * Creates a downloadable Blob from FigmaJsonRoot
 * 
 * @param data - FigmaJsonRoot data
 * @returns Blob object for download
 */
export function figmaJsonToBlob(data: FigmaJsonRoot): Blob {
  const json = figmaJsonToString(data)
  return new Blob([json], { type: 'application/json' })
}

/**
 * Triggers a download of the Figma JSON file
 * 
 * @param data - FigmaJsonRoot data
 * @param filename - Name for the downloaded file
 */
export function downloadFigmaJson(data: FigmaJsonRoot, filename: string = 'figma-design.json'): void {
  if (typeof window === 'undefined') return
  
  const blob = figmaJsonToBlob(data)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// ============================================
// Design System Conversion
// ============================================

interface DesignSystemColors {
  primary?: Record<string, string>
  secondary?: Record<string, string>
  accent?: Record<string, string>
  neutral?: Record<string, string>
  [key: string]: any
}

interface DesignSystemTypography {
  fontFamily?: {
    sans?: string[]
    serif?: string[]
    mono?: string[]
  }
  fontSize?: Record<string, string | number>
  fontWeight?: Record<string, string | number>
  [key: string]: any
}

interface DesignSystemData {
  name?: string
  description?: string
  colors?: DesignSystemColors
  typography?: DesignSystemTypography
  spacing?: any
  borderRadius?: Record<string, string | number>
  shadows?: Record<string, string>
  components?: any
}

/**
 * Converts a design system to Figma JSON format
 * Creates sample containers showcasing the design tokens
 * 
 * @param designSystem - Design system data
 * @returns FigmaJsonRoot array
 */
export function designSystemToFigmaJson(designSystem: DesignSystemData): FigmaJsonRoot {
  const colors = designSystem.colors || {}
  const typography = designSystem.typography || {}
  
  // Get primary color for accent
  const primaryColor = colors.primary?.['500'] || colors.primary?.['DEFAULT'] || '#18A0FB'
  const neutralColor = colors.neutral?.['900'] || colors.neutral?.['800'] || '#000000'
  const backgroundColor = colors.neutral?.['50'] || '#FFFFFF'
  
  // Get font sizes
  const fontSizes = typography.fontSize || {}
  const headingSize = typeof fontSizes['2xl'] === 'number' ? fontSizes['2xl'] : 24
  const bodySize = typeof fontSizes['base'] === 'number' ? fontSizes['base'] : 16
  
  // Create sample containers
  const containers: FigmaJsonContainer[] = [
    createContainer(
      'Primary Colors',
      [
        createTextChild('Primary Color Palette', headingSize, neutralColor, 'Bold'),
        createTextChild(`Primary: ${primaryColor}`, bodySize, primaryColor, 'Medium')
      ],
      { backgroundColor, padding: 20, cornerRadius: 12 }
    ),
    createContainer(
      'Typography Sample',
      [
        createTextChild('Heading Text', headingSize, neutralColor, 'Bold'),
        createTextChild('Body text sample with regular weight', bodySize, neutralColor, 'Regular')
      ],
      { backgroundColor, padding: 20, cornerRadius: 12 }
    ),
    createContainer(
      'Design System Info',
      [
        createTextChild(designSystem.name || 'Design System', headingSize, neutralColor, 'Bold'),
        createTextChild(designSystem.description || 'Generated design system', bodySize, primaryColor, 'Regular')
      ],
      { backgroundColor, padding: 20, cornerRadius: 12 }
    )
  ]
  
  return containers
}

// ============================================
// Default Export
// ============================================

export default {
  // Types
  FigmaJsonRoot: {} as FigmaJsonRoot,
  FigmaJsonContainer: {} as FigmaJsonContainer,
  FigmaJsonTextChild: {} as FigmaJsonTextChild,
  
  // Constants
  FONT_WEIGHT_MAP,
  NUMERIC_TO_FONT_WEIGHT,
  
  // Factory functions
  createTextChild,
  createContainer,
  createEmptyFigmaJson,
  
  // Conversion functions
  numericToFontWeight,
  fontWeightToNumeric,
  normalizeHexColor,
  
  // Validation functions
  isValidTextChild,
  isValidContainer,
  isValidFigmaJson,
  
  // Transformation functions
  normalizeContainer,
  normalizeTextChild,
  toFigmaJson,
  
  // Export functions
  figmaJsonToString,
  figmaJsonToBlob,
  downloadFigmaJson,
  
  // Design system conversion
  designSystemToFigmaJson
}
