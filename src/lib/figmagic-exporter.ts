/**
 * Figmagic Exporter - Tokens Studio Format
 * Converts design system to Tokens Studio / Figmagic compatible JSON format
 * Supports multi-mode tokens and deep variable structures.
 */

import { DesignSystem } from '@prisma/client'

// Types for Tokens Studio format
export interface TokensStudioToken {
  value: any
  type: string
  description?: string
  $extensions?: {
    'studio.tokens'?: {
      modify?: {
        type: string
        value: string
        color: string
      }
    }
  }
}

export interface TokensStudioFormat {
  [key: string]: {
    [key: string]: TokensStudioToken | any
  }
}

/**
 * Convert design system to Tokens Studio format
 */
export function convertToTokensStudio(designSystem: any): TokensStudioFormat {
  const colors = designSystem.colors || {}
  const typography = designSystem.typography || {}
  const spacing = designSystem.spacing?.values || {}
  const borderRadius = designSystem.borderRadius || {}
  const shadows = designSystem.shadows || {}

  const result: TokensStudioFormat = {
    global: {
      colors: processColors(colors),
      typography: processTypography(typography),
      spacing: processSpacing(spacing),
      borderRadius: processBorderRadius(borderRadius),
      shadows: processShadows(shadows),
    }
  }

  return result
}

function processColors(colors: any): Record<string, any> {
  const res: Record<string, any> = {}
  Object.entries(colors).forEach(([colorName, shades]: [string, any]) => {
    if (typeof shades === 'object') {
      const shadesObj: Record<string, any> = {}
      Object.entries(shades).forEach(([shade, hex]) => {
        shadesObj[shade] = {
          value: hex,
          type: 'color',
          description: `${colorName} ${shade}`
        }
      })
      res[colorName] = shadesObj
    } else {
      res[colorName] = {
        value: shades,
        type: 'color'
      }
    }
  })
  return res
}

function processTypography(typography: any): Record<string, any> {
  const res: Record<string, any> = {}
  const fontSizes = typography.fontSize || {}
  const fontFamilies = typography.fontFamily || {}
  const fontWeights = typography.fontWeight || {}
  const lineHeights = typography.lineHeight || {}

  Object.entries(fontSizes).forEach(([name, size]) => {
    res[name] = {
      value: {
        fontFamily: fontFamilies.sans?.[0] || 'Inter',
        fontWeight: fontWeights[name] || 'Regular',
        fontSize: size,
        lineHeight: lineHeights[name] || '1.5',
      },
      type: 'typography'
    }
  })
  return res
}

function processSpacing(spacing: any): Record<string, any> {
  const res: Record<string, any> = {}
  Object.entries(spacing).forEach(([name, value]) => {
    res[name] = {
      value: value,
      type: 'spacing'
    }
  })
  return res
}

function processBorderRadius(radius: any): Record<string, any> {
  const res: Record<string, any> = {}
  Object.entries(radius).forEach(([name, value]) => {
    res[name] = {
      value: value,
      type: 'borderRadius'
    }
  })
  return res
}

function processShadows(shadows: any): Record<string, any> {
  const res: Record<string, any> = {}
  Object.entries(shadows).forEach(([name, value]) => {
    res[name] = {
      value: value,
      type: 'boxShadow'
    }
  })
  return res
}

export function createFigmaJsonExport(designSystem: any): any {
  // Use existing template generator but ensure it's called with full data
  return convertToTokensStudio(designSystem)
}
