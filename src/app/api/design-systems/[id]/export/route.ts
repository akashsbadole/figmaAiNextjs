import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  convertDesignSystemToFigma, 
  generateFigmaPluginTokens,
  FigmaFile 
} from '@/lib/figma-generator'
import { createTokensStudioExport } from '@/lib/figmagic-exporter'

interface ExportOptions {
  format: 'json' | 'css' | 'tailwind' | 'scss' | 'figma' | 'figma-json' | 'tokens-studio'
}

function generateJSON(designSystem: any): string {
  return JSON.stringify({
    name: designSystem.name,
    description: designSystem.description,
    colors: designSystem.colors,
    typography: designSystem.typography,
    spacing: designSystem.spacing,
    borderRadius: designSystem.borderRadius,
    shadows: designSystem.shadows,
    components: designSystem.components
  }, null, 2)
}

function generateCSSVariables(designSystem: any): string {
  const { colors, typography, spacing, borderRadius, shadows } = designSystem
  let css = `:root {\n`
  css += `  /* Colors */\n`

  Object.entries(colors).forEach(([colorName, colorScale]: [string, any]) => {
    Object.entries(colorScale).forEach(([shade, hex]) => {
      css += `  --color-${colorName}-${shade}: ${hex};\n`
    })
  })

  css += `\n  /* Typography */\n`
  css += `  --font-sans: ${typography.fontFamily.sans.join(', ')};\n`
  css += `  --font-serif: ${typography.fontFamily.serif.join(', ')};\n`
  css += `  --font-mono: ${typography.fontFamily.mono.join(', ')};\n`

  Object.entries(typography.fontSize).forEach(([name, size]) => {
    css += `  --font-size-${name}: ${size};\n`
  })

  Object.entries(typography.fontWeight).forEach(([name, weight]) => {
    css += `  --font-weight-${name}: ${weight};\n`
  })

  css += `\n  /* Spacing */\n`
  Object.entries(spacing.values).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`
  })

  css += `\n  /* Border Radius */\n`
  Object.entries(borderRadius).forEach(([name, radius]) => {
    css += `  --radius-${name}: ${radius};\n`
  })

  css += `\n  /* Shadows */\n`
  Object.entries(shadows).forEach(([name, shadow]) => {
    css += `  --shadow-${name}: ${shadow};\n`
  })

  css += `}\n`
  return css
}

function generateTailwindConfig(designSystem: any): string {
  const { colors, typography, spacing, borderRadius, shadows } = designSystem

  const config = {
    theme: {
      extend: {
        colors: {},
        fontFamily: {
          sans: typography.fontFamily.sans,
          serif: typography.fontFamily.serif,
          mono: typography.fontFamily.mono,
        },
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        spacing: spacing.values,
        borderRadius: borderRadius,
        boxShadow: shadows,
      }
    }
  }

  // Transform colors to Tailwind format
  Object.entries(colors).forEach(([colorName, colorScale]: [string, any]) => {
    config.theme.extend.colors[colorName] = colorScale
  })

  return `// tailwind.config.js
module.exports = ${JSON.stringify(config, null, 2)}`
}

function generateSCSS(designSystem: any): string {
  const { colors, typography, spacing, borderRadius, shadows } = designSystem
  let scss = `// Design System Variables\n\n`

  scss += `// Colors\n`
  Object.entries(colors).forEach(([colorName, colorScale]: [string, any]) => {
    scss += `\$${colorName}: (\n`
    Object.entries(colorScale).forEach(([shade, hex]) => {
      scss += `  '${shade}': ${hex},\n`
    })
    scss += `);\n\n`
  })

  scss += `// Typography\n`
  scss += `\$font-sans: '${typography.fontFamily.sans.join("', '")}';\n`
  scss += `\$font-serif: '${typography.fontFamily.serif.join("', '")}';\n`
  scss += `\$font-mono: '${typography.fontFamily.mono.join("', '")}';\n\n`

  scss += `\$font-sizes: (\n`
  Object.entries(typography.fontSize).forEach(([name, size]) => {
    scss += `  '${name}': ${size},\n`
  })
  scss += `);\n\n`

  scss += `\$font-weights: (\n`
  Object.entries(typography.fontWeight).forEach(([name, weight]) => {
    scss += `  '${name}': ${weight},\n`
  })
  scss += `);\n\n`

  scss += `// Spacing\n`
  scss += `\$spacing: (\n`
  Object.entries(spacing.values).forEach(([key, value]) => {
    scss += `  '${key}': ${value},\n`
  })
  scss += `);\n\n`

  scss += `// Border Radius\n`
  scss += `\$border-radius: (\n`
  Object.entries(borderRadius).forEach(([name, radius]) => {
    scss += `  '${name}': ${radius},\n`
  })
  scss += `);\n\n`

  scss += `// Shadows\n`
  scss += `\$shadows: (\n`
  Object.entries(shadows).forEach(([name, shadow]) => {
    scss += `  '${name}': ${shadow},\n`
  })
  scss += `);\n`

  return scss
}

function generateFigmaTokens(designSystem: any): string {
  const { colors, typography, spacing, borderRadius, shadows } = designSystem

  const figmaTokens = {
    global: {
      color: {},
      font: {
        families: {},
        sizes: {},
        weights: {}
      },
      dimension: {
        spacing: {}
      },
      borderRadius: {},
      boxShadow: {}
    }
  }

  // Colors
  Object.entries(colors).forEach(([colorName, colorScale]: [string, any]) => {
    figmaTokens.global.color[colorName] = {}
    Object.entries(colorScale).forEach(([shade, hex]) => {
      figmaTokens.global.color[colorName][shade] = { value: hex }
    })
  })

  // Typography
  figmaTokens.global.font.families = {
    sans: { value: typography.fontFamily.sans.join(', ') },
    serif: { value: typography.fontFamily.serif.join(', ') },
    mono: { value: typography.fontFamily.mono.join(', ') },
  }

  figmaTokens.global.font.sizes = {}
  Object.entries(typography.fontSize).forEach(([name, size]) => {
    figmaTokens.global.font.sizes[name] = { value: size }
  })

  figmaTokens.global.font.weights = {}
  Object.entries(typography.fontWeight).forEach(([name, weight]) => {
    figmaTokens.global.font.weights[name] = { value: parseInt(String(weight), 10) }
  })

  // Spacing
  figmaTokens.global.dimension.spacing = {}
  Object.entries(spacing.values).forEach(([key, value]) => {
    figmaTokens.global.dimension.spacing[key] = { value: value }
  })

  // Border Radius
  figmaTokens.global.borderRadius = {}
  Object.entries(borderRadius).forEach(([name, radius]) => {
    figmaTokens.global.borderRadius[name] = { value: radius }
  })

  // Shadows
  figmaTokens.global.boxShadow = {}
  Object.entries(shadows).forEach(([name, shadow]) => {
    figmaTokens.global.boxShadow[name] = { value: shadow }
  })

  return JSON.stringify(figmaTokens, null, 2)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') as ExportOptions['format']

    if (!format || !['json', 'css', 'tailwind', 'scss', 'figma', 'figma-json', 'tokens-studio'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use: json, css, tailwind, scss, figma, figma-json, or tokens-studio' },
        { status: 400 }
      )
    }

    const designSystem = await db.designSystem.findUnique({
      where: { id }
    })

    if (!designSystem) {
      return NextResponse.json(
        { error: 'Design system not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const systemData = {
      id: designSystem.id,
      name: designSystem.name,
      description: designSystem.description,
      colors: JSON.parse(designSystem.colors),
      typography: JSON.parse(designSystem.typography),
      spacing: JSON.parse(designSystem.spacing),
      borderRadius: JSON.parse(designSystem.borderRadius),
      shadows: JSON.parse(designSystem.shadows),
      components: JSON.parse(designSystem.components)
    }

    let content: string
    let contentType: string
    let filename: string

    switch (format) {
      case 'json':
        content = generateJSON(systemData)
        contentType = 'application/json'
        filename = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-design-system.json`
        break
      case 'css':
        content = generateCSSVariables(systemData)
        contentType = 'text/css'
        filename = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-tokens.css`
        break
      case 'tailwind':
        content = generateTailwindConfig(systemData)
        contentType = 'text/javascript'
        filename = 'tailwind.config.js'
        break
      case 'scss':
        content = generateSCSS(systemData)
        contentType = 'text/x-scss'
        filename = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-tokens.scss`
        break
      case 'figma':
        content = generateFigmaTokens(systemData)
        contentType = 'application/json'
        filename = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-figma-tokens.json`
        break
      case 'figma-json':
        const figmaFile = convertDesignSystemToFigma(designSystem)
        content = JSON.stringify(figmaFile, null, 2)
        contentType = 'application/json'
        filename = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}.figma.json`
        break
      case 'tokens-studio':
        const tokensStudioData = createTokensStudioExport(designSystem)
        content = JSON.stringify(tokensStudioData, null, 2)
        contentType = 'application/json'
        filename = `${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-tokens-studio.json`
        break
      default:
        return NextResponse.json(
          { error: 'Invalid format' },
          { status: 400 }
        )
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting design system:', error)
    return NextResponse.json(
      {
        error: 'Failed to export design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
