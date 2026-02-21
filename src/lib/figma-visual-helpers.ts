/**
 * Figma Visual Helpers Module
 * 
 * Provides utilities for creating visual representations of design tokens
 * within the Figma JSON format constraints (containers with text children only).
 * 
 * Key features:
 * - Contrast calculation for accessibility
 * - Visual color swatch generation
 * - Typography sample generation
 * - Component example generation
 * - Spacing indicator generation
 */

import {
    FigmaJsonContainer,
    FigmaJsonTextChild,
    createTextChild,
    createContainer,
    normalizeHexColor
} from './figma-json-format'

// ============================================
// Type Definitions
// ============================================

export interface ColorSwatchOptions {
    colorValue: string
    shadeName: string
    width?: number
    height?: number
    showLabel?: boolean
}

export interface TypographySampleOptions {
    text: string
    fontSize: number
    fontWeight?: string
    tokenName: string
}

export interface SpacingIndicatorOptions {
    spacingValue: number
    tokenName: string
    orientation?: 'horizontal' | 'vertical'
}

export interface VisualContainerOptions {
    backgroundColor: string
    width?: number
    height?: number
    padding?: number
    cornerRadius?: number
    textColor?: string
}

// ============================================
// Color Utilities
// ============================================

/**
 * Validates a hex color string
 * @param hexColor - Hex color string (e.g., "#EFF6FF" or "EFF6FF")
 * @returns True if valid hex color
 */
export function isValidHexColor(hexColor: string): boolean {
    const hexRegex = /^#?[0-9A-Fa-f]{6}$/
    const shortHexRegex = /^#?[0-9A-Fa-f]{3}$/
    return hexRegex.test(hexColor) || shortHexRegex.test(hexColor)
}

/**
 * Normalizes a hex color to 6-digit format with #
 * @param hexColor - Input hex color
 * @returns Normalized hex color
 */
export function normalizeColor(hexColor: string): string {
    return normalizeHexColor(hexColor)
}

/**
 * Calculates relative luminance of a color (WCAG 2.1 formula)
 * @param hexColor - Hex color string
 * @returns Luminance value between 0 (black) and 1 (white)
 */
export function calculateLuminance(hexColor: string): number {
    try {
        const normalized = normalizeColor(hexColor)
        const hex = normalized.startsWith('#') ? normalized.slice(1) : normalized

        // Convert hex to RGB
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255

        // Apply gamma correction
        const rGamma = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
        const gGamma = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
        const bGamma = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

        // Calculate relative luminance
        return 0.2126 * rGamma + 0.7152 * gGamma + 0.0722 * bGamma
    } catch (error) {
        // Return default luminance for invalid colors
        return 0.5
    }
}

/**
 * Calculates contrast ratio between two colors (WCAG 2.1 formula)
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (minimum 1:1, maximum 21:1)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
    const l1 = calculateLuminance(color1)
    const l2 = calculateLuminance(color2)

    // Ensure l1 is the lighter color
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    // Calculate contrast ratio
    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determines appropriate text color based on background luminance
 * @param backgroundColor - Background hex color
 * @returns "#000000" (black) for light backgrounds, "#FFFFFF" (white) for dark backgrounds
 */
export function getContrastingTextColor(backgroundColor: string): string {
    try {
        const luminance = calculateLuminance(backgroundColor)

        // Use white text for dark backgrounds (luminance < 0.5)
        // Use black text for light backgrounds (luminance >= 0.5)
        return luminance < 0.5 ? '#FFFFFF' : '#000000'
    } catch (error) {
        // Fallback to black text
        return '#000000'
    }
}

/**
 * Gets WCAG-compliant text color with minimum contrast ratio
 * @param backgroundColor - Background hex color
 * @param minContrastRatio - Minimum contrast ratio (default: 4.5 for AA)
 * @returns Text color that meets contrast requirements
 */
export function getAccessibleTextColor(
    backgroundColor: string,
    minContrastRatio: number = 4.5
): string {
    const black = '#000000'
    const white = '#FFFFFF'

    const contrastWithBlack = calculateContrastRatio(backgroundColor, black)
    const contrastWithWhite = calculateContrastRatio(backgroundColor, white)

    // Choose the color with better contrast
    if (contrastWithBlack >= minContrastRatio && contrastWithWhite >= minContrastRatio) {
        // Both meet requirements, choose the one with higher contrast
        return contrastWithBlack > contrastWithWhite ? black : white
    } else if (contrastWithBlack >= minContrastRatio) {
        return black
    } else if (contrastWithWhite >= minContrastRatio) {
        return white
    } else {
        // Neither meets requirements, choose the one with better contrast
        return contrastWithBlack > contrastWithWhite ? black : white
    }
}

// ============================================
// Visual Element Generators
// ============================================

/**
 * Creates a visual color swatch container
 * @param options - Color swatch configuration
 * @returns Figma container with color swatch visualization
 */
export function createColorSwatch(options: ColorSwatchOptions): FigmaJsonContainer {
    const {
        colorValue,
        shadeName,
        width = 120,
        height = 80,
        showLabel = true
    } = options

    const normalizedColor = normalizeColor(colorValue)
    const textColor = getContrastingTextColor(normalizedColor)

    const children: FigmaJsonTextChild[] = []

    if (showLabel) {
        children.push(
            createTextChild(shadeName, 14, textColor, 'Medium'),
            createTextChild(normalizedColor, 12, textColor, 'Regular')
        )
    }

    return createContainer(
        `Color Swatch: ${shadeName}`,
        children,
        {
            backgroundColor: normalizedColor,
            padding: 12,
            cornerRadius: 8
        }
    )
}

/**
 * Creates a typography sample container
 * @param options - Typography sample configuration
 * @returns Figma container with typography sample
 */
export function createTypographySample(options: TypographySampleOptions): FigmaJsonContainer {
    const {
        text,
        fontSize,
        fontWeight = 'Regular',
        tokenName
    } = options

    const sampleText = `${tokenName}: ${text}`

    return createContainer(
        `Typography Sample: ${tokenName}`,
        [
            createTextChild(sampleText, fontSize, '#000000', fontWeight as any)
        ],
        {
            backgroundColor: '#FFFFFF',
            padding: 16,
            cornerRadius: 8
        }
    )
}

/**
 * Creates a spacing indicator container
 * @param options - Spacing indicator configuration
 * @returns Figma container with spacing visualization
 */
export function createSpacingIndicator(options: SpacingIndicatorOptions): FigmaJsonContainer {
    const {
        spacingValue,
        tokenName,
        orientation = 'horizontal'
    } = options

    const isHorizontal = orientation === 'horizontal'
    const width = isHorizontal ? spacingValue : 40
    const height = isHorizontal ? 40 : spacingValue

    const children: FigmaJsonTextChild[] = [
        createTextChild(tokenName, 12, '#FFFFFF', 'Medium'),
        createTextChild(`${spacingValue}px`, 10, '#FFFFFF', 'Regular')
    ]

    return createContainer(
        `Spacing: ${tokenName}`,
        children,
        {
            backgroundColor: '#3B82F6', // Distinct blue for spacing indicators
            padding: 8,
            cornerRadius: 4
        }
    )
}

/**
 * Creates a component example container
 * @param componentName - Name of the component
 * @param componentData - Component styling data
 * @param designSystem - Full design system for reference
 * @returns Figma container with component example
 */
export function createComponentExample(
    componentName: string,
    componentData: any,
    designSystem: any
): FigmaJsonContainer {
    const backgroundColor = componentData.backgroundColor || '#3B82F6'
    const textColor = componentData.textColor || '#FFFFFF'
    const padding = componentData.padding || 16
    const borderRadius = componentData.borderRadius || 8

    const children: FigmaJsonTextChild[] = []

    // Add component name
    children.push(
        createTextChild(componentName, 16, textColor, 'Bold')
    )

    // Add sample text
    if (componentData.sampleText) {
        children.push(
            createTextChild(componentData.sampleText, 14, textColor, 'Regular')
        )
    } else {
        // Default sample text based on component type
        if (componentName.toLowerCase().includes('button')) {
            children.push(
                createTextChild('Click me', 14, textColor, 'Medium')
            )
        } else if (componentName.toLowerCase().includes('card')) {
            children.push(
                createTextChild('Card content goes here', 14, textColor, 'Regular')
            )
        } else if (componentName.toLowerCase().includes('input')) {
            children.push(
                createTextChild('Enter text...', 14, textColor, 'Regular')
            )
        }
    }

    return createContainer(
        `Component: ${componentName}`,
        children,
        {
            backgroundColor,
            padding,
            cornerRadius: borderRadius
        }
    )
}

/**
 * Creates a nested container structure
 * @param parentOptions - Parent container options
 * @param childContainers - Child containers to nest
 * @returns Parent container with nested children
 */
export function createNestedContainer(
    parentOptions: VisualContainerOptions,
    childContainers: FigmaJsonContainer[]
): FigmaJsonContainer {
    const {
        backgroundColor,
        width,
        height,
        padding = 24,
        cornerRadius = 12,
        textColor = '#000000'
    } = parentOptions

    // Convert child containers to text children for display
    const children: FigmaJsonTextChild[] = childContainers.map((child, index) => {
        return createTextChild(
            `Child ${index + 1}: ${child.name}`,
            12,
            textColor,
            'Regular'
        )
    })

    return createContainer(
        'Nested Container',
        children,
        {
            backgroundColor,
            padding,
            cornerRadius
        }
    )
}

/**
 * Validates that Figma JSON only contains container and text types
 * @param figmaJson - Figma JSON to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateFigmaJsonFormat(figmaJson: any): string[] {
    const errors: string[] = []

    if (!Array.isArray(figmaJson)) {
        errors.push('Root must be an array')
        return errors
    }

    figmaJson.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
            errors.push(`Item ${index}: Must be an object`)
            return
        }

        if (item.type !== 'container') {
            errors.push(`Item ${index}: Type must be 'container', got '${item.type}'`)
        }

        if (!Array.isArray(item.children)) {
            errors.push(`Item ${index}: Children must be an array`)
        } else {
            item.children.forEach((child: any, childIndex: number) => {
                if (!child || typeof child !== 'object') {
                    errors.push(`Item ${index}, Child ${childIndex}: Must be an object`)
                    return
                }

                if (child.type !== 'text') {
                    errors.push(`Item ${index}, Child ${childIndex}: Type must be 'text', got '${child.type}'`)
                }
            })
        }
    })

    return errors
}

// ============================================
// Export Functions
// ============================================

export default {
    // Color utilities
    isValidHexColor,
    normalizeColor,
    calculateLuminance,
    calculateContrastRatio,
    getContrastingTextColor,
    getAccessibleTextColor,

    // Visual element generators
    createColorSwatch,
    createTypographySample,
    createSpacingIndicator,
    createComponentExample,
    createNestedContainer,

    // Validation
    validateFigmaJsonFormat
}