/**
 * Figma Component Extractor
 * 
 * Extracts components, design tokens, variants, and states from Figma files.
 * Generates component documentation and Figma-to-code mappings.
 * 
 * @module figma/component-extractor
 */

import FigmaApiClient, {
  FigmaApiResponse,
  FigmaComponent,
  FigmaStyle,
  FigmaFileInfo
} from './api-client';

/**
 * Extended Figma file info with document
 */
interface FigmaFileWithDocument extends FigmaFileInfo {
  /** Full document tree */
  document: {
    id: string;
    name: string;
    type: string;
    children?: unknown[];
  };
}

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Component variant definition
 */
export interface ComponentVariant {
  /** Variant name */
  name: string;
  /** Variant key in Figma */
  key: string;
  /** Properties/attributes for this variant */
  properties: Record<string, string>;
  /** Node data for the variant */
  node?: FigmaNodeData;
}

/**
 * Component state definition
 */
export interface ComponentState {
  /** State name (e.g., 'default', 'hover', 'active', 'disabled') */
  name: string;
  /** Whether this is the default state */
  isDefault: boolean;
  /** Node data for the state */
  node?: FigmaNodeData;
}

/**
 * Design token extracted from component
 */
export interface ExtractedToken {
  /** Token name */
  name: string;
  /** Token category */
  category: 'color' | 'typography' | 'spacing' | 'effect' | 'dimension' | 'border';
  /** Token value */
  value: string | number | Record<string, unknown>;
  /** Token description */
  description?: string;
  /** CSS variable name */
  cssVariable?: string;
  /** Token metadata */
  meta?: {
    /** Source node ID */
    nodeId: string;
    /** Source path in Figma */
    path: string;
    /** Original Figma value */
    originalValue: unknown;
  };
}

/**
 * Design token category summary
 */
export interface TokenCategory {
  /** Category name */
  name: string;
  /** Tokens in this category */
  tokens: ExtractedToken[];
  /** Token count */
  count: number;
}

/**
 * Extracted component data
 */
export interface ExtractedComponent {
  /** Component key */
  key: string;
  /** Component name */
  name: string;
  /** Component description */
  description: string;
  /** Documentation links */
  documentationLinks?: string[];
  /** Component category */
  category: string;
  /** Tags for filtering */
  tags: string[];
  /** Main component node */
  mainNode?: FigmaNodeData;
  /** Component variants */
  variants: ComponentVariant[];
  /** Component states */
  states: ComponentState[];
  /** Extracted design tokens */
  tokens: ExtractedToken[];
  /** Token categories */
  tokenCategories: TokenCategory[];
  /** Figma-to-code mappings */
  mappings: FigmaCodeMapping[];
  /** Image URL */
  thumbnailUrl?: string;
  /** Last updated */
  updatedAt: string;
  /** Component metadata */
  meta: {
    /** Containing page name */
    pageName?: string;
    /** Containing frame name */
    frameName?: string;
    /** Created timestamp */
    createdAt: string;
    /** Updated timestamp */
    updatedAt: string;
  };
}

/**
 * Figma node data structure
 */
export interface FigmaNodeData {
  /** Node ID */
  id: string;
  /** Node name */
  name: string;
  /** Node type */
  type: string;
  /** Visible status */
  visible?: boolean;
  /** Locked status */
  locked?: boolean;
  /** Bounding box */
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Fills (colors/gradients) */
  fills?: FigmaFill[];
  /** Strokes (borders) */
  strokes?: FigmaStroke[];
  /** Stroke weight */
  strokeWeight?: number;
  /** Corner radius */
  cornerRadius?: number;
  /** Effects (shadows, blurs) */
  effects?: FigmaEffect[];
  /** Children nodes */
  children?: FigmaNodeData[];
  /** Text properties (if text node) */
  characters?: string;
  style?: FigmaTextStyle;
  /** Component properties */
  componentProperties?: Record<string, unknown>;
}

/**
 * Figma fill (color/gradient)
 */
export interface FigmaFill {
  /** Fill type */
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  /** Visibility */
  visible: boolean;
  /** Opacity */
  opacity?: number;
  /** Color data */
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

/**
 * Figma stroke (border)
 */
export interface FigmaStroke {
  /** Stroke type */
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
  /** Visibility */
  visible: boolean;
  /** Opacity */
  opacity?: number;
  /** Color data */
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

/**
 * Figma effect (shadow, blur)
 */
export interface FigmaEffect {
  /** Effect type */
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  /** Visibility */
  visible: boolean;
  /** Effect radius */
  radius: number;
  /** Color */
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  /** Offset */
  offset?: {
    x: number;
    y: number;
  };
  /** Spread */
  spread?: number;
}

/**
 * Figma text style
 */
export interface FigmaTextStyle {
  /** Font family */
  fontFamily: string;
  /** Font weight */
  fontWeight: number;
  /** Font size */
  fontSize: number;
  /** Text align horizontal */
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  /** Text align vertical */
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  /** Letter spacing */
  letterSpacing: number;
  /** Line height */
  lineHeightPx: number;
}

/**
 * Figma to code mapping
 */
export interface FigmaCodeMapping {
  /** Figma property name */
  figmaProperty: string;
  /** Code property name */
  codeProperty: string;
  /** Mapping type */
  mappingType: 'direct' | 'transform' | 'token' | 'computed';
  /** Transform function if applicable */
  transform?: string;
  /** Token reference if token-based */
  token?: string;
  /** Description */
  description?: string;
}

/**
 * Component documentation
 */
export interface ComponentDocumentation {
  /** Component name */
  name: string;
  /** Component description */
  description: string;
  /** Usage examples */
  usage: string[];
  /** Props interface */
  props: {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }[];
  /** Variants documentation */
  variants: {
    name: string;
    description: string;
    props: Record<string, string>;
  }[];
  /** Design tokens used */
  tokens: {
    category: string;
    tokens: {
      name: string;
      value: string;
      cssVariable: string;
    }[];
  }[];
  /** Accessibility notes */
  accessibility?: string[];
  /** Changelog */
  changelog?: {
    version: string;
    changes: string[];
    date: string;
  }[];
}

/**
 * Extraction options
 */
export interface ExtractionOptions {
  /** Include component metadata */
  includeMetadata: boolean;
  /** Include design tokens */
  includeTokens: boolean;
  /** Include variants */
  includeVariants: boolean;
  /** Include states */
  includeStates: boolean;
  /** Include mappings */
  includeMappings: boolean;
  /** Generate documentation */
  generateDocs: boolean;
  /** Extract nested components */
  extractNested: boolean;
  /** Token naming strategy */
  tokenNaming: 'kebab' | 'camel' | 'snake' | 'pascal';
}

// ============================================================================
// Figma Component Extractor Class
// ============================================================================

/**
 * Figma Component Extractor
 * 
 * Extracts components, design tokens, variants, and states from Figma files.
 * Generates comprehensive documentation and code mappings.
 * 
 * @example
 * ```typescript
 * const extractor = new FigmaComponentExtractor(figmaClient);
 * 
 * // Extract all components from a file
 * const components = await extractor.extractComponents('abc123xyz');
 * 
 * // Generate documentation for a component
 * const docs = await extractor.generateDocumentation('component-key');
 * ```
 */
export class FigmaComponentExtractor {
  private figmaClient: FigmaApiClient;
  private options: ExtractionOptions;

  /**
   * Create a new Figma Component Extractor
   * 
   * @param figmaClient - Figma API client instance
   * @param options - Default extraction options
   */
  constructor(figmaClient?: FigmaApiClient, options?: Partial<ExtractionOptions>) {
    this.figmaClient = figmaClient || new FigmaApiClient();
    this.options = {
      includeMetadata: true,
      includeTokens: true,
      includeVariants: true,
      includeStates: true,
      includeMappings: true,
      generateDocs: true,
      extractNested: true,
      tokenNaming: 'kebab',
      ...options
    };
  }

  // =========================================================================
  // Component Extraction
  // =========================================================================

  /**
   * Extract all components from a Figma file
   * 
   * @param fileKey - Figma file key
   * @param options - Override extraction options
   * @returns Array of extracted components
   */
  async extractComponents(
    fileKey: string,
    options?: Partial<ExtractionOptions>
  ): Promise<ExtractedComponent[]> {
    const opts = { ...this.options, ...options };

    // Get file info and components
    const [fileResponse, componentsResponse, componentSetsResponse] = await Promise.all([
      this.figmaClient.getFile(fileKey),
      this.figmaClient.getFileComponents(fileKey),
      this.figmaClient.getFileComponentSets(fileKey)
    ]);

    if (fileResponse.error) {
      throw new Error(`Failed to get file: ${fileResponse.error.message}`);
    }

    const components: ExtractedComponent[] = [];
    const fileData = fileResponse.data as FigmaFileWithDocument | null;

    // Extract components
    if (componentsResponse.data?.meta?.components) {
      for (const component of componentsResponse.data.meta.components) {
        const extracted = await this.extractComponent(
          fileKey,
          component,
          fileData?.document,
          opts
        );
        components.push(extracted);
      }
    }

    // Extract component sets (variants)
    if (componentSetsResponse.data?.meta?.component_sets) {
      for (const componentSet of componentSetsResponse.data.meta.component_sets) {
        const extracted = await this.extractComponentSet(
          fileKey,
          componentSet,
          fileData?.document,
          opts
        );
        components.push(extracted);
      }
    }

    return components;
  }

  /**
   * Extract a single component
   * 
   * @param fileKey - Figma file key
   * @param component - Figma component data
   * @param document - File document node
   * @param options - Extraction options
   * @returns Extracted component data
   */
  async extractComponent(
    fileKey: string,
    component: FigmaComponent,
    document?: { id: string; name: string; type: string; children?: unknown[] },
    options?: Partial<ExtractionOptions>
  ): Promise<ExtractedComponent> {
    const opts = { ...this.options, ...options };

    // Find component node in document
    const nodeData = this.findComponentNode(document, component.key);

    // Extract tokens
    const tokens = opts.includeTokens && nodeData
      ? this.extractTokensFromNode(nodeData)
      : [];

    // Extract mappings
    const mappings = opts.includeMappings && nodeData
      ? this.generateMappings(nodeData)
      : [];

    // Categorize tokens
    const tokenCategories = this.categorizeTokens(tokens);

    return {
      key: component.key,
      name: component.name,
      description: component.description,
      documentationLinks: component.documentationLinks,
      category: this.inferCategory(component.name),
      tags: this.generateTags(component.name),
      mainNode: nodeData || undefined,
      variants: [],
      states: nodeData ? this.extractStates(nodeData) : [],
      tokens,
      tokenCategories,
      mappings,
      thumbnailUrl: undefined, // Would need separate API call
      updatedAt: component.updatedAt,
      meta: {
        pageName: component.containingPage?.name,
        frameName: component.containingFrame?.name,
        createdAt: component.createdAt,
        updatedAt: component.updatedAt
      }
    };
  }

  /**
   * Extract a component set (variants)
   * 
   * @param fileKey - Figma file key
   * @param componentSet - Figma component set data
   * @param document - File document node
   * @param options - Extraction options
   * @returns Extracted component with variants
   */
  async extractComponentSet(
    fileKey: string,
    componentSet: FigmaComponent,
    document?: { id: string; name: string; type: string; children?: unknown[] },
    options?: Partial<ExtractionOptions>
  ): Promise<ExtractedComponent> {
    const opts = { ...this.options, ...options };

    // Get component set details with variants
    const setResponse = await this.figmaClient.getComponentSet(componentSet.key);

    // Find component set node
    const nodeData = this.findComponentNode(document, componentSet.key);

    // Extract variants
    const variants: ComponentVariant[] = [];
    if (setResponse.data?.meta?.components) {
      for (const variant of setResponse.data.meta.components) {
        const variantNode = this.findComponentNode(document, variant.key);
        variants.push({
          name: variant.name,
          key: variant.key,
          properties: variant.properties as Record<string, string>,
          node: variantNode || undefined
        });
      }
    }

    // Extract tokens
    const tokens = opts.includeTokens && nodeData
      ? this.extractTokensFromNode(nodeData)
      : [];

    // Categorize tokens
    const tokenCategories = this.categorizeTokens(tokens);

    return {
      key: componentSet.key,
      name: componentSet.name,
      description: componentSet.description,
      documentationLinks: componentSet.documentationLinks,
      category: this.inferCategory(componentSet.name),
      tags: this.generateTags(componentSet.name),
      mainNode: nodeData || undefined,
      variants,
      states: [],
      tokens,
      tokenCategories,
      mappings: [],
      thumbnailUrl: undefined,
      updatedAt: componentSet.updatedAt,
      meta: {
        pageName: componentSet.containingPage?.name,
        frameName: componentSet.containingFrame?.name,
        createdAt: componentSet.createdAt,
        updatedAt: componentSet.updatedAt
      }
    };
  }

  // =========================================================================
  // Token Extraction
  // =========================================================================

  /**
   * Extract design tokens from a Figma node
   * 
   * @param node - Figma node data
   * @returns Array of extracted tokens
   */
  extractTokensFromNode(node: FigmaNodeData): ExtractedToken[] {
    const tokens: ExtractedToken[] = [];

    // Extract color tokens from fills
    if (node.fills?.length) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.color) {
          const colorToken = this.extractColorToken(fill, node);
          if (colorToken) tokens.push(colorToken);
        }
      }
    }

    // Extract typography tokens from text nodes
    if (node.type === 'TEXT' && node.style) {
      const typographyToken = this.extractTypographyToken(node);
      if (typographyToken) tokens.push(typographyToken);
    }

    // Extract spacing/dimension tokens
    if (node.absoluteBoundingBox) {
      const spacingToken = this.extractSpacingToken(node);
      if (spacingToken) tokens.push(spacingToken);
    }

    // Extract effect tokens
    if (node.effects?.length) {
      for (const effect of node.effects) {
        const effectToken = this.extractEffectToken(effect, node);
        if (effectToken) tokens.push(effectToken);
      }
    }

    // Extract border tokens
    if (node.strokes?.length && node.strokeWeight) {
      const borderToken = this.extractBorderToken(node);
      if (borderToken) tokens.push(borderToken);
    }

    // Extract corner radius tokens
    if (node.cornerRadius) {
      const radiusToken = this.extractRadiusToken(node);
      if (radiusToken) tokens.push(radiusToken);
    }

    // Process children recursively
    if (node.children?.length) {
      for (const child of node.children) {
        const childTokens = this.extractTokensFromNode(child);
        tokens.push(...childTokens);
      }
    }

    return tokens;
  }

  /**
   * Extract color token
   */
  private extractColorToken(fill: FigmaFill, node: FigmaNodeData): ExtractedToken | null {
    if (!fill.color) return null;

    const color = fill.color;
    const hex = this.rgbaToHex(color.r, color.g, color.b, color.a);
    const name = this.generateTokenName(node.name, 'color');

    return {
      name,
      category: 'color',
      value: hex,
      description: `Color token extracted from ${node.name}`,
      cssVariable: `--${this.options.tokenNaming === 'kebab' ? name : name.toLowerCase()}`,
      meta: {
        nodeId: node.id,
        path: node.name,
        originalValue: color
      }
    };
  }

  /**
   * Extract typography token
   */
  private extractTypographyToken(node: FigmaNodeData): ExtractedToken | null {
    if (!node.style) return null;

    const style = node.style;
    const name = this.generateTokenName(node.name, 'typography');
    const lineHeight = style.lineHeightPx / style.fontSize;

    return {
      name,
      category: 'typography',
      value: {
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        fontWeight: style.fontWeight,
        lineHeight: `${lineHeight.toFixed(2)}`,
        letterSpacing: `${style.letterSpacing}px`
      },
      description: `Typography token extracted from ${node.name}`,
      cssVariable: `--${this.options.tokenNaming === 'kebab' ? name : name.toLowerCase()}`,
      meta: {
        nodeId: node.id,
        path: node.name,
        originalValue: style
      }
    };
  }

  /**
   * Extract spacing token
   */
  private extractSpacingToken(node: FigmaNodeData): ExtractedToken | null {
    if (!node.absoluteBoundingBox) return null;

    const name = this.generateTokenName(node.name, 'spacing');

    return {
      name,
      category: 'spacing',
      value: {
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height
      },
      description: `Spacing/dimension token extracted from ${node.name}`,
      cssVariable: `--${this.options.tokenNaming === 'kebab' ? name : name.toLowerCase()}`,
      meta: {
        nodeId: node.id,
        path: node.name,
        originalValue: node.absoluteBoundingBox
      }
    };
  }

  /**
   * Extract effect token
   */
  private extractEffectToken(effect: FigmaEffect, node: FigmaNodeData): ExtractedToken | null {
    const name = this.generateTokenName(node.name, 'effect');

    return {
      name,
      category: 'effect',
      value: {
        type: effect.type.toLowerCase().replace('_', '-'),
        radius: effect.radius,
        color: effect.color
          ? this.rgbaToHex(effect.color.r, effect.color.g, effect.color.b, effect.color.a)
          : undefined,
        offset: effect.offset,
        spread: effect.spread
      },
      description: `${effect.type} token extracted from ${node.name}`,
      cssVariable: `--${this.options.tokenNaming === 'kebab' ? name : name.toLowerCase()}`,
      meta: {
        nodeId: node.id,
        path: node.name,
        originalValue: effect
      }
    };
  }

  /**
   * Extract border token
   */
  private extractBorderToken(node: FigmaNodeData): ExtractedToken | null {
    const stroke = node.strokes?.[0];
    if (!stroke?.color || !node.strokeWeight) return null;

    const name = this.generateTokenName(node.name, 'border');

    return {
      name,
      category: 'border',
      value: {
        width: node.strokeWeight,
        color: this.rgbaToHex(stroke.color.r, stroke.color.g, stroke.color.b, stroke.color.a),
        style: 'solid'
      },
      description: `Border token extracted from ${node.name}`,
      cssVariable: `--${this.options.tokenNaming === 'kebab' ? name : name.toLowerCase()}`,
      meta: {
        nodeId: node.id,
        path: node.name,
        originalValue: { weight: node.strokeWeight, color: stroke.color }
      }
    };
  }

  /**
   * Extract corner radius token
   */
  private extractRadiusToken(node: FigmaNodeData): ExtractedToken | null {
    if (node.cornerRadius === undefined) return null;

    const name = this.generateTokenName(node.name, 'radius');

    return {
      name,
      category: 'dimension',
      value: node.cornerRadius,
      description: `Corner radius token extracted from ${node.name}`,
      cssVariable: `--${this.options.tokenNaming === 'kebab' ? name : name.toLowerCase()}`,
      meta: {
        nodeId: node.id,
        path: node.name,
        originalValue: node.cornerRadius
      }
    };
  }

  /**
   * Categorize extracted tokens
   */
  categorizeTokens(tokens: ExtractedToken[]): TokenCategory[] {
    const categories: Map<string, TokenCategory> = new Map();

    for (const token of tokens) {
      const existing = categories.get(token.category);
      if (existing) {
        existing.tokens.push(token);
        existing.count++;
      } else {
        categories.set(token.category, {
          name: token.category,
          tokens: [token],
          count: 1
        });
      }
    }

    return Array.from(categories.values());
  }

  // =========================================================================
  // Mapping Generation
  // =========================================================================

  /**
   * Generate Figma-to-code mappings for a node
   * 
   * @param node - Figma node data
   * @returns Array of mappings
   */
  generateMappings(node: FigmaNodeData): FigmaCodeMapping[] {
    const mappings: FigmaCodeMapping[] = [];

    // Width mapping
    if (node.absoluteBoundingBox?.width) {
      mappings.push({
        figmaProperty: 'width',
        codeProperty: 'width',
        mappingType: 'direct',
        description: 'Component width in pixels'
      });
    }

    // Height mapping
    if (node.absoluteBoundingBox?.height) {
      mappings.push({
        figmaProperty: 'height',
        codeProperty: 'height',
        mappingType: 'direct',
        description: 'Component height in pixels'
      });
    }

    // Corner radius mapping
    if (node.cornerRadius) {
      mappings.push({
        figmaProperty: 'cornerRadius',
        codeProperty: 'borderRadius',
        mappingType: 'token',
        token: 'border-radius',
        description: 'Corner radius for rounded corners'
      });
    }

    // Background color mapping
    if (node.fills?.[0]?.type === 'SOLID') {
      mappings.push({
        figmaProperty: 'fills[0].color',
        codeProperty: 'backgroundColor',
        mappingType: 'token',
        token: 'background-color',
        description: 'Background fill color'
      });
    }

    // Text style mappings
    if (node.type === 'TEXT' && node.style) {
      mappings.push(
        {
          figmaProperty: 'style.fontFamily',
          codeProperty: 'fontFamily',
          mappingType: 'direct',
          description: 'Font family name'
        },
        {
          figmaProperty: 'style.fontSize',
          codeProperty: 'fontSize',
          mappingType: 'transform',
          transform: 'pxToRem',
          description: 'Font size in pixels (converted to rem)'
        },
        {
          figmaProperty: 'style.fontWeight',
          codeProperty: 'fontWeight',
          mappingType: 'direct',
          description: 'Font weight (number)'
        },
        {
          figmaProperty: 'style.lineHeightPx',
          codeProperty: 'lineHeight',
          mappingType: 'transform',
          transform: 'pxToUnitless',
          description: 'Line height (converted to unitless)'
        }
      );
    }

    return mappings;
  }

  // =========================================================================
  // Documentation Generation
  // =========================================================================

  /**
   * Generate documentation for a component
   * 
   * @param component - Extracted component
   * @returns Component documentation
   */
  generateDocumentation(component: ExtractedComponent): ComponentDocumentation {
    return {
      name: component.name,
      description: component.description,
      usage: [
        `import { ${this.toPascalCase(component.name)} } from '@/components/${this.toKebabCase(component.name)}';`,
        '',
        `// Usage example`,
        `<${this.toPascalCase(component.name)} />`
      ],
      props: this.generatePropsDoc(component),
      variants: component.variants.map((v) => ({
        name: v.name,
        description: `Variant: ${Object.entries(v.properties).map(([k, val]) => `${k}=${val}`).join(', ')}`,
        props: v.properties
      })),
      tokens: component.tokenCategories.map((cat) => ({
        category: cat.name,
        tokens: cat.tokens.map((t) => ({
          name: t.name,
          value: typeof t.value === 'string' ? t.value : JSON.stringify(t.value),
          cssVariable: t.cssVariable || ''
        }))
      })),
      accessibility: [
        'Ensure sufficient color contrast for text',
        'Include focus states for keyboard navigation',
        'Provide descriptive alt text for images'
      ]
    };
  }

  /**
   * Generate props documentation
   */
  private generatePropsDoc(component: ExtractedComponent): ComponentDocumentation['props'] {
    const props: ComponentDocumentation['props'] = [];

    // Common props
    props.push({
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS classes'
    });

    // Variant prop if component has variants
    if (component.variants.length > 0) {
      props.push({
        name: 'variant',
        type: component.variants.map((v) => `'${v.name}'`).join(' | '),
        required: false,
        default: component.variants[0]?.name || 'default',
        description: 'Visual variant of the component'
      });
    }

    // State props if component has states
    if (component.states.length > 0) {
      props.push({
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disables the component'
      });
    }

    return props;
  }

  // =========================================================================
  // Utility Methods
  // =========================================================================

  /**
   * Find component node in document tree
   */
  private findComponentNode(document: unknown, componentKey: string): FigmaNodeData | null {
    if (!document) return null;

    const doc = document as { children?: unknown[] };
    
    if (!doc.children) return null;

    const findInChildren = (nodes: unknown[]): FigmaNodeData | null => {
      for (const node of nodes) {
        const n = node as { id?: string; children?: unknown[] };
        if (n.id === componentKey) {
          return n as FigmaNodeData;
        }
        if (n.children) {
          const found = findInChildren(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInChildren(doc.children);
  }

  /**
   * Extract states from component node
   */
  private extractStates(node: FigmaNodeData | undefined): ComponentState[] {
    if (!node) return [];

    const states: ComponentState[] = [
      { name: 'default', isDefault: true, node }
    ];

    // Look for state indicators in name (e.g., "Button/Hover", "Button/Disabled")
    if (node.children) {
      for (const child of node.children) {
        const c = child as { name?: string; id?: string };
        if (c.name) {
          const stateName = this.parseStateFromName(c.name);
          if (stateName && stateName !== 'default') {
            states.push({
              name: stateName,
              isDefault: false,
              node: c as FigmaNodeData
            });
          }
        }
      }
    }

    return states;
  }

  /**
   * Parse state name from Figma layer name
   */
  private parseStateFromName(name: string): string | null {
    const stateMatch = name.match(/\/(:hover|:active|:focus|:disabled|:pressed)/i);
    if (stateMatch) {
      return stateMatch[1].substring(1).toLowerCase();
    }

    // Check for common state naming patterns
    const lowerName = name.toLowerCase();
    if (lowerName.includes('hover')) return 'hover';
    if (lowerName.includes('active')) return 'active';
    if (lowerName.includes('focus')) return 'focus';
    if (lowerName.includes('disabled')) return 'disabled';
    if (lowerName.includes('pressed')) return 'pressed';

    return null;
  }

  /**
   * Infer component category from name
   */
  private inferCategory(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('button')) return 'Buttons';
    if (lowerName.includes('input') || lowerName.includes('field')) return 'Forms';
    if (lowerName.includes('card')) return 'Cards';
    if (lowerName.includes('modal') || lowerName.includes('dialog')) return 'Overlays';
    if (lowerName.includes('nav') || lowerName.includes('menu')) return 'Navigation';
    if (lowerName.includes('table')) return 'Data Display';
    if (lowerName.includes('icon')) return 'Icons';
    if (lowerName.includes('avatar')) return 'Avatars';
    if (lowerName.includes('badge') || lowerName.includes('tag')) return 'Badges';
    if (lowerName.includes('alert') || lowerName.includes('toast')) return 'Feedback';
    if (lowerName.includes('tooltip')) return 'Tooltips';
    
    return 'Components';
  }

  /**
   * Generate tags for component
   */
  private generateTags(name: string): string[] {
    const tags: string[] = [];
    const lowerName = name.toLowerCase();

    // State-based tags
    if (lowerName.includes('hover')) tags.push('interactive');
    if (lowerName.includes('disabled')) tags.push('disabled');

    // Category-based tags
    if (lowerName.includes('button')) tags.push('interactive', 'cta');
    if (lowerName.includes('input')) tags.push('form', 'interactive');
    if (lowerName.includes('card')) tags.push('container');

    return tags;
  }

  /**
   * Generate token name from node path
   */
  private generateTokenName(nodePath: string, category: string): string {
    const baseName = nodePath.split('/').pop() || nodePath;
    const sanitized = baseName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${category}-${sanitized}`;
  }

  /**
   * Convert RGBA to Hex
   */
  private rgbaToHex(r: number, g: number, b: number, a: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a < 1 ? `${hex}${toHex(a)}` : hex;
  }

  /**
   * Convert to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase();
  }
}

// ============================================================================
// Export
// ============================================================================

/**
 * Create a default Figma Component Extractor instance
 * 
 * @param figmaClient - Optional Figma API client
 * @param options - Optional extraction options
 * @returns Configured FigmaComponentExtractor instance
 */
export function createFigmaComponentExtractor(
  figmaClient?: FigmaApiClient,
  options?: Partial<ExtractionOptions>
): FigmaComponentExtractor {
  return new FigmaComponentExtractor(figmaClient, options);
}

// Export the class for direct use
export { FigmaComponentExtractor as default };
