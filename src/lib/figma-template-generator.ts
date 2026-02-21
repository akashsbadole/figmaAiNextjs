/**
 * Figma Template Generator
 * 
 * Generates comprehensive Figma-compatible JSON templates
 * that can be imported into Figma for design system creation
 */

import {
    FigmaJsonRoot,
    FigmaJsonContainer,
    FigmaJsonTextChild,
    createTextChild,
    createContainer,
    normalizeHexColor
} from './figma-json-format'

import {
    createColorSwatch,
    createTypographySample,
    createSpacingIndicator,
    createComponentExample,
    getContrastingTextColor,
    isValidHexColor,
    normalizeColor
} from './figma-visual-helpers'

// ============================================
// Extended Figma Types for Full Design System
// ============================================

export interface FigmaDesignToken {
    name: string
    value: string
    type: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius'
    category?: string
}

export interface FigmaComponent {
    name: string
    type: 'button' | 'card' | 'input' | 'modal' | 'navigation' | 'form' | 'list' | 'custom'
    variants?: string[]
    tokens: {
        backgroundColor?: string
        textColor?: string
        borderColor?: string
        padding?: number
        borderRadius?: number
        fontSize?: number
        fontWeight?: string
    }
}

export interface FigmaPage {
    name: string
    containers: FigmaJsonContainer[]
}

export interface FigmaDesignSystemTemplate {
    name: string
    description: string
    version: string
    pages: FigmaPage[]
    tokens: FigmaDesignToken[]
    components: FigmaComponent[]
}

// ============================================
// Template Generation Functions
// ============================================

/**
 * Generates a color palette page with visual color swatches
 */
export function generateColorPalettePage(designSystem: any): FigmaPage {
    const colors = designSystem.colors || {}
    const containers: FigmaJsonContainer[] = []

    // Helper function to create a color family section
    const createColorFamilySection = (familyName: string, shades: Record<string, string>) => {
        if (!shades || Object.keys(shades).length === 0) {
            return null
        }

        // Sort shades by numeric value (50, 100, 200, ..., 900, 950)
        const sortedShades = Object.entries(shades)
            .sort(([shadeA], [shadeB]) => {
                const numA = parseInt(shadeA) || 0
                const numB = parseInt(shadeB) || 0
                return numA - numB
            })

        // Create color swatches for this family
        const swatchContainers: FigmaJsonContainer[] = []

        sortedShades.forEach(([shade, colorValue]) => {
            if (isValidHexColor(colorValue)) {
                const swatch = createColorSwatch({
                    colorValue,
                    shadeName: shade,
                    width: 100,
                    height: 60,
                    showLabel: true
                })
                swatchContainers.push(swatch)
            } else {
                // Create a placeholder for invalid colors
                const placeholder = createContainer(
                    `Invalid Color: ${shade}`,
                    [
                        createTextChild(`${shade}: Invalid color`, 12, '#FF0000', 'Regular'),
                        createTextChild(`Value: ${colorValue}`, 10, '#666666', 'Regular')
                    ],
                    {
                        backgroundColor: '#FFCCCC',
                        padding: 8,
                        cornerRadius: 4
                    }
                )
                swatchContainers.push(placeholder)
            }
        })

        // Create family header
        const familyHeader = createContainer(
            `${familyName} Colors`,
            [
                createTextChild(`${familyName} Colors`, 20, '#000000', 'Bold'),
                createTextChild(`${sortedShades.length} shades`, 14, '#666666', 'Regular')
            ],
            {
                backgroundColor: '#F8F9FA',
                padding: 16,
                cornerRadius: 12
            }
        )

        // Create family container with all swatches
        const familyContainer = createContainer(
            `${familyName} Palette`,
            [
                // Convert swatch containers to text children for display in the family container
                createTextChild(`${familyName} Color Swatches`, 16, '#333333', 'Medium'),
                ...swatchContainers.map((swatch, index) =>
                    createTextChild(`Swatch ${index + 1}: ${swatch.name}`, 12, '#666666', 'Regular')
                )
            ],
            {
                backgroundColor: '#FFFFFF',
                padding: 20,
                cornerRadius: 16
            }
        )

        return { familyHeader, swatchContainers, familyContainer }
    }

    // Process each color family
    const colorFamilies = [
        { name: 'Primary', data: colors.primary },
        { name: 'Secondary', data: colors.secondary },
        { name: 'Accent', data: colors.accent },
        { name: 'Neutral', data: colors.neutral || colors.gray }
    ]

    colorFamilies.forEach(({ name, data }) => {
        if (data && Object.keys(data).length > 0) {
            const section = createColorFamilySection(name, data)
            if (section) {
                containers.push(section.familyHeader)
                containers.push(...section.swatchContainers)
                containers.push(section.familyContainer)
            }
        }
    })

    // If no colors were found, create a placeholder
    if (containers.length === 0) {
        containers.push(
            createContainer('No Colors Found', [
                createTextChild('No color data available', 16, '#666666', 'Regular'),
                createTextChild('Add color tokens to your design system', 14, '#999999', 'Regular')
            ], {
                backgroundColor: '#F8F9FA',
                padding: 24,
                cornerRadius: 16
            })
        )
    }

    return {
        name: 'Color Palette',
        containers
    }
}

/**
 * Generates a typography page with visual samples
 */
export function generateTypographyPage(designSystem: any): FigmaPage {
    const typography = designSystem.typography || {}
    const containers: FigmaJsonContainer[] = []

    // Helper function to parse font size values
    const parseFontSize = (size: any): number => {
        if (typeof size === 'number') return size
        if (typeof size === 'string') {
            // Remove 'px' suffix if present
            const cleaned = size.replace('px', '').trim()
            const parsed = parseFloat(cleaned)
            return isNaN(parsed) ? 16 : parsed
        }
        return 16 // Default fallback
    }

    // Helper function to create typography section
    const createTypographySection = (sectionName: string, samples: FigmaJsonContainer[]) => {
        if (samples.length === 0) return null

        // Create section header
        const sectionHeader = createContainer(
            `${sectionName} Section`,
            [
                createTextChild(sectionName, 24, '#000000', 'Bold'),
                createTextChild(`${samples.length} samples`, 14, '#666666', 'Regular')
            ],
            {
                backgroundColor: '#F8F9FA',
                padding: 20,
                cornerRadius: 12
            }
        )

        // Create section container
        const sectionContainer = createContainer(
            `${sectionName} Samples`,
            [
                createTextChild(`${sectionName} Examples`, 18, '#333333', 'Medium'),
                ...samples.map((sample, index) =>
                    createTextChild(`Sample ${index + 1}: ${sample.name}`, 12, '#666666', 'Regular')
                )
            ],
            {
                backgroundColor: '#FFFFFF',
                padding: 24,
                cornerRadius: 16
            }
        )

        return { sectionHeader, samples, sectionContainer }
    }

    // Font Families section
    if (typography.fontFamily) {
        const families = typography.fontFamily
        const children: FigmaJsonTextChild[] = [
            createTextChild('Font Families', 24, '#000000', 'Bold')
        ]

        if (families.sans) {
            children.push(
                createTextChild(`Sans: ${families.sans.join(', ')}`, 16, '#333333', 'Regular')
            )
        }
        if (families.serif) {
            children.push(
                createTextChild(`Serif: ${families.serif.join(', ')}`, 16, '#333333', 'Regular')
            )
        }
        if (families.mono) {
            children.push(
                createTextChild(`Mono: ${families.mono.join(', ')}`, 16, '#333333', 'Regular')
            )
        }

        containers.push(
            createContainer('Font Families', children, {
                backgroundColor: '#FFFFFF',
                padding: 24,
                cornerRadius: 16
            })
        )
    }

    // Font Sizes with visual samples
    if (typography.fontSize) {
        const sizes = Object.entries(typography.fontSize)
        const sampleContainers: FigmaJsonContainer[] = []

        // Default sample text
        const sampleText = 'The quick brown fox jumps over the lazy dog'

        sizes.forEach(([tokenName, sizeValue]) => {
            const fontSize = parseFontSize(sizeValue)

            // Create visual typography sample
            const sample = createTypographySample({
                text: sampleText,
                fontSize,
                fontWeight: 'Regular',
                tokenName
            })

            sampleContainers.push(sample)
        })

        // Create font size section
        const fontSizeSection = createTypographySection('Font Sizes', sampleContainers)
        if (fontSizeSection) {
            containers.push(fontSizeSection.sectionHeader)
            containers.push(...fontSizeSection.samples)
            containers.push(fontSizeSection.sectionContainer)
        }
    }

    // Font Weights with visual samples
    if (typography.fontWeight) {
        const weights = Object.entries(typography.fontWeight)
        const sampleContainers: FigmaJsonContainer[] = []

        // Default sample text and size
        const sampleText = 'Font Weight Sample'
        const sampleSize = 16

        weights.forEach(([tokenName, weightValue]) => {
            // Create visual typography sample for each weight
            const sample = createTypographySample({
                text: sampleText,
                fontSize: sampleSize,
                fontWeight: weightValue as string,
                tokenName
            })

            sampleContainers.push(sample)
        })

        // Create font weight section
        const fontWeightSection = createTypographySection('Font Weights', sampleContainers)
        if (fontWeightSection) {
            containers.push(fontWeightSection.sectionHeader)
            containers.push(...fontWeightSection.samples)
            containers.push(fontWeightSection.sectionContainer)
        }
    }

    // If no typography data was found, create a placeholder
    if (containers.length === 0) {
        containers.push(
            createContainer('No Typography Found', [
                createTextChild('No typography data available', 16, '#666666', 'Regular'),
                createTextChild('Add typography tokens to your design system', 14, '#999999', 'Regular')
            ], {
                backgroundColor: '#F8F9FA',
                padding: 24,
                cornerRadius: 16
            })
        )
    }

    return {
        name: 'Typography',
        containers
    }
}

/**
 * Generates a components page with visual examples
 */
export function generateComponentsPage(designSystem: any): FigmaPage {
    const components = designSystem.components || {}
    const colors = designSystem.colors || {}
    const containers: FigmaJsonContainer[] = []

    const primaryColor = colors.primary?.['500'] || '#18A0FB'
    const textColor = colors.neutral?.['900'] || '#000000'
    const bgColor = colors.neutral?.['50'] || '#FFFFFF'

    // Helper function to create component section
    const createComponentSection = (componentName: string, componentExamples: FigmaJsonContainer[]) => {
        if (componentExamples.length === 0) return null

        // Create component header
        const componentHeader = createContainer(
            `${componentName} Component`,
            [
                createTextChild(`${componentName} Component`, 24, '#000000', 'Bold'),
                createTextChild(`${componentExamples.length} examples`, 14, '#666666', 'Regular')
            ],
            {
                backgroundColor: '#F8F9FA',
                padding: 20,
                cornerRadius: 12
            }
        )

        // Create component container
        const componentContainer = createContainer(
            `${componentName} Examples`,
            [
                createTextChild(`${componentName} Variants`, 18, '#333333', 'Medium'),
                ...componentExamples.map((example, index) =>
                    createTextChild(`Example ${index + 1}: ${example.name}`, 12, '#666666', 'Regular')
                )
            ],
            {
                backgroundColor: '#FFFFFF',
                padding: 24,
                cornerRadius: 16
            }
        )

        return { componentHeader, componentExamples, componentContainer }
    }

    // Process each component
    Object.entries(components).forEach(([componentName, componentData]: [string, any]) => {
        const componentExamples: FigmaJsonContainer[] = []

        // Check if component has variants
        if (componentData.variants && typeof componentData.variants === 'object') {
            // Process each variant
            Object.entries(componentData.variants).forEach(([variantName, variantData]: [string, any]) => {
                // Create component example for this variant
                const example = createComponentExample(
                    `${componentName} - ${variantName}`,
                    variantData,
                    designSystem
                )
                componentExamples.push(example)
            })
        } else if (componentData.sizes && typeof componentData.sizes === 'object') {
            // Process each size variant
            Object.entries(componentData.sizes).forEach(([sizeName, sizeData]: [string, any]) => {
                // Create component example for this size
                const example = createComponentExample(
                    `${componentName} - ${sizeName}`,
                    sizeData,
                    designSystem
                )
                componentExamples.push(example)
            })
        } else {
            // Create single component example
            const example = createComponentExample(
                componentName,
                componentData,
                designSystem
            )
            componentExamples.push(example)
        }

        // Create component section
        const componentSection = createComponentSection(componentName, componentExamples)
        if (componentSection) {
            containers.push(componentSection.componentHeader)
            containers.push(...componentSection.componentExamples)
            containers.push(componentSection.componentContainer)
        }
    })

    // If no components were found, create a placeholder
    if (containers.length === 0) {
        containers.push(
            createContainer('No Components Found', [
                createTextChild('No component data available', 16, '#666666', 'Regular'),
                createTextChild('Add component definitions to your design system', 14, '#999999', 'Regular')
            ], {
                backgroundColor: '#F8F9FA',
                padding: 24,
                cornerRadius: 16
            })
        )
    }

    return {
        name: 'Components',
        containers
    }
}

/**
 * Generates a spacing system page
 */
export function generateSpacingPage(designSystem: any): FigmaPage {
    const spacing = designSystem.spacing || {}
    const containers: FigmaJsonContainer[] = []

    if (spacing.values) {
        const values = Object.entries(spacing.values)
        const children: FigmaJsonTextChild[] = [
            createTextChild('Spacing Scale', 24, '#000000', 'Bold')
        ]

        values.forEach(([name, value]) => {
            children.push(
                createTextChild(`${name}: ${value}`, 16, '#333333', 'Regular')
            )
        })

        containers.push(
            createContainer('Spacing System', children, {
                backgroundColor: '#FFFFFF',
                padding: 24,
                cornerRadius: 16
            })
        )
    }

    return {
        name: 'Spacing',
        containers
    }
}

/**
 * Generates a complete Figma design system template
 */
export function generateFigmaDesignSystemTemplate(designSystem: any): FigmaDesignSystemTemplate {
    const pages: FigmaPage[] = []
    const tokens: FigmaDesignToken[] = []
    const components: FigmaComponent[] = []

    // Generate pages
    pages.push(generateColorPalettePage(designSystem))
    pages.push(generateTypographyPage(designSystem))
    pages.push(generateComponentsPage(designSystem))
    pages.push(generateSpacingPage(designSystem))

    // Extract tokens
    if (designSystem.colors) {
        Object.entries(designSystem.colors).forEach(([category, shades]: [string, any]) => {
            if (typeof shades === 'object') {
                Object.entries(shades).forEach(([shade, value]) => {
                    tokens.push({
                        name: `color-${category}-${shade}`,
                        value: value as string,
                        type: 'color',
                        category
                    })
                })
            }
        })
    }

    // Extract components
    if (designSystem.components) {
        Object.entries(designSystem.components).forEach(([name, config]: [string, any]) => {
            components.push({
                name,
                type: name as any,
                tokens: {
                    backgroundColor: config.backgroundColor,
                    textColor: config.textColor,
                    borderColor: config.borderColor,
                    padding: config.padding,
                    borderRadius: config.borderRadius,
                    fontSize: config.fontSize,
                    fontWeight: config.fontWeight
                }
            })
        })
    }

    return {
        name: designSystem.name || 'Design System',
        description: designSystem.description || 'Generated design system',
        version: '1.0.0',
        pages,
        tokens,
        components
    }
}

/**
 * Converts design system template to flat Figma JSON format
 */
export function templateToFigmaJson(template: FigmaDesignSystemTemplate): FigmaJsonRoot {
    const allContainers: FigmaJsonContainer[] = []

    // Add a header container
    allContainers.push(
        createContainer('Design System Header', [
            createTextChild(template.name, 32, '#000000', 'Bold'),
            createTextChild(template.description, 16, '#666666', 'Regular'),
            createTextChild(`Version: ${template.version}`, 14, '#999999', 'Regular')
        ], {
            backgroundColor: '#F8F9FA',
            padding: 32,
            cornerRadius: 16
        })
    )

    // Add all page containers
    template.pages.forEach(page => {
        // Add page header
        allContainers.push(
            createContainer(`${page.name} Section`, [
                createTextChild(page.name, 28, '#000000', 'Bold')
            ], {
                backgroundColor: '#E9ECEF',
                padding: 20,
                cornerRadius: 12
            })
        )

        // Add page containers
        allContainers.push(...page.containers)
    })

    return allContainers
}

/**
 * Main function to generate Figma JSON from design system
 */
export function generateFigmaJsonFromDesignSystem(designSystem: any): FigmaJsonRoot {
    const template = generateFigmaDesignSystemTemplate(designSystem)
    return templateToFigmaJson(template)
}

// ============================================
// Export Functions
// ============================================

export default {
    generateColorPalettePage,
    generateTypographyPage,
    generateComponentsPage,
    generateSpacingPage,
    generateFigmaDesignSystemTemplate,
    templateToFigmaJson,
    generateFigmaJsonFromDesignSystem
}
