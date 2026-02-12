/**
 * Figmagic Exporter - Tokens Studio Format
 * Converts design system to Tokens Studio / Figmagic compatible JSON format
 * https://www.figma.com/community/file/821094451476848226
 */

import { DesignSystem } from '@prisma/client'

// Types for Tokens Studio format
export interface TokensStudioColor {
  value: string
  type: 'color'
  description?: string
}

export interface TokensStudioTypography {
  fontFamily: {
    value: string
    type: 'fontFamily'
  }
  fontWeight: {
    value: string | number
    type: 'fontWeight'
  }
  fontSize: {
    value: string | number
    type: 'fontSize'
  }
  lineHeight?: {
    value: string | number
    type: 'lineHeight'
  }
  letterSpacing?: {
    value: string | number
    type: 'letterSpacing'
  }
  textDecoration?: {
    value: string
    type: 'textDecoration'
  }
  textCase?: {
    value: string
    type: 'textCase'
  }
}

export interface TokensStudioToken {
  value: string | number
  type: string
  description?: string
}

export interface TokensStudioFormat {
  global: {
    colors: Record<string, TokensStudioColor>
    typography: Record<string, TokensStudioTypography>
    spacing: Record<string, TokensStudioToken>
    borderRadius: Record<string, TokensStudioToken>
    shadows: Record<string, TokensStudioToken & { type: 'boxShadow' }>
    opacity?: Record<string, TokensStudioToken>
  }
}

/**
 * Convert design system to Tokens Studio format
 */
export function convertToTokensStudio(designSystem: DesignSystem): TokensStudioFormat {
  const colors = JSON.parse(designSystem.colors || '{}')
  const typography = JSON.parse(designSystem.typography || '{}')
  const spacing = JSON.parse(designSystem.spacing || '{}')
  const borderRadius = JSON.parse(designSystem.borderRadius || '{}')
  const shadows = JSON.parse(designSystem.shadows || '{}')

  return {
    global: {
      colors: convertColors(colors),
      typography: convertTypography(typography),
      spacing: convertSpacing(spacing),
      borderRadius: convertBorderRadius(borderRadius),
      shadows: convertShadows(shadows),
    }
  }
}

/**
 * Convert color scales to Tokens Studio format
 */
function convertColors(colors: Record<string, Record<string, string>>): Record<string, TokensStudioColor> {
  const result: Record<string, TokensStudioColor> = {}

  for (const [colorName, colorScale] of Object.entries(colors)) {
    for (const [shade, hex] of Object.entries(colorScale)) {
      const tokenName = shade === '500' || (colorName === 'neutral' && shade === '500')
        ? colorName
        : `${colorName}-${shade}`
      
      result[tokenName] = {
        value: hex,
        type: 'color',
        description: `${colorName} color at ${shade} shade`
      }
    }
  }

  return result
}

/**
 * Convert typography to Tokens Studio format
 */
function convertTypography(typography: {
  fontFamily: Record<string, string[]>
  fontSize: Record<string, string>
  fontWeight: Record<string, string | number>
  lineHeight: Record<string, string>
  letterSpacing: Record<string, string>
}): Record<string, TokensStudioTypography> {
  const result: Record<string, TokensStudioTypography> = {}

  // Convert font sizes to typography styles
  for (const [sizeName, sizeValue] of Object.entries(typography.fontSize)) {
    const weight = typography.fontWeight[sizeName] || typography.fontWeight['regular'] || 400
    
    // Determine line height and letter spacing based on size
    const lineHeight = typography.lineHeight[sizeName] || `${Math.round(parseInt(sizeValue) * 1.5)}px`
    const letterSpacing = typography.letterSpacing[sizeName] || '0px'

    result[sizeName] = {
      fontFamily: {
        value: typography.fontFamily.sans?.[0] || 'Inter',
        type: 'fontFamily'
      },
      fontWeight: {
        value: weight,
        type: 'fontWeight'
      },
      fontSize: {
        value: parseInt(sizeValue) || sizeValue,
        type: 'fontSize'
      },
      lineHeight: {
        value: parseInt(lineHeight) || lineHeight,
        type: 'lineHeight'
      },
      letterSpacing: {
        value: parseFloat(letterSpacing) || letterSpacing,
        type: 'letterSpacing'
      }
    }
  }

  // Add heading styles
  result['heading-xl'] = {
    fontFamily: {
      value: typography.fontFamily.sans?.[0] || 'Inter',
      type: 'fontFamily'
    },
    fontWeight: {
      value: typography.fontWeight['bold'] || 700,
      type: 'fontWeight'
    },
    fontSize: {
      value: 48,
      type: 'fontSize'
    },
    lineHeight: {
      value: 56,
      type: 'lineHeight'
    }
  }

  result['heading-lg'] = {
    fontFamily: {
      value: typography.fontFamily.sans?.[0] || 'Inter',
      type: 'fontFamily'
    },
    fontWeight: {
      value: typography.fontWeight['bold'] || 700,
      type: 'fontWeight'
    },
    fontSize: {
      value: 36,
      type: 'fontSize'
    },
    lineHeight: {
      value: 44,
      type: 'lineHeight'
    }
  }

  result['heading-md'] = {
    fontFamily: {
      value: typography.fontFamily.sans?.[0] || 'Inter',
      type: 'fontFamily'
    },
    fontWeight: {
      value: typography.fontWeight['bold'] || 700,
      type: 'fontWeight'
    },
    fontSize: {
      value: 24,
      type: 'fontSize'
    },
    lineHeight: {
      value: 32,
      type: 'lineHeight'
    }
  }

  result['body'] = {
    fontFamily: {
      value: typography.fontFamily.sans?.[0] || 'Inter',
      type: 'fontFamily'
    },
    fontWeight: {
      value: typography.fontWeight['regular'] || 400,
      type: 'fontWeight'
    },
    fontSize: {
      value: 16,
      type: 'fontSize'
    },
    lineHeight: {
      value: 24,
      type: 'lineHeight'
    }
  }

  return result
}

/**
 * Convert spacing to Tokens Studio format
 */
function convertSpacing(spacing: { scale: number; values: Record<string, string> }): Record<string, TokensStudioToken> {
  const result: Record<string, TokensStudioToken> = {}

  for (const [name, value] of Object.entries(spacing.values)) {
    result[name] = {
      value: value,
      type: 'spacing',
      description: `${name} spacing token`
    }
  }

  return result
}

/**
 * Convert border radius to Tokens Studio format
 */
function convertBorderRadius(borderRadius: Record<string, string>): Record<string, TokensStudioToken> {
  const result: Record<string, TokensStudioToken> = {}

  for (const [name, value] of Object.entries(borderRadius)) {
    result[name] = {
      value: value,
      type: 'borderRadius',
      description: `${name} border radius`
    }
  }

  return result
}

/**
 * Convert shadows to Tokens Studio format
 */
function convertShadows(shadows: Record<string, string>): Record<string, TokensStudioToken & { type: 'boxShadow' }> {
  const result: Record<string, TokensStudioToken & { type: 'boxShadow' }> = {}

  for (const [name, value] of Object.entries(shadows)) {
    result[name] = {
      value: value,
      type: 'boxShadow',
      description: `${name} shadow`
    }
  }

  return result
}

/**
 * Generate Tokens Studio metadata
 */
export function generateTokensStudioMeta(designSystem: DesignSystem): object {
  return {
    meta: {
      name: designSystem.name,
      description: designSystem.description || '',
      version: designSystem.version || '1.0.0',
      createdAt: designSystem.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: designSystem.updatedAt?.toISOString() || new Date().toISOString(),
      format: 'tokens-studio'
    }
  }
}

/**
 * Create complete Tokens Studio JSON export
 */
export function createTokensStudioExport(designSystem: DesignSystem): object {
  return {
    ...generateTokensStudioMeta(designSystem),
    ...convertToTokensStudio(designSystem)
  }
}
