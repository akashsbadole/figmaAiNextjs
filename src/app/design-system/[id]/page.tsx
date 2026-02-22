'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDesignSystemStore, type ButtonComponentStyles, type ButtonSizesStyles } from '@/store/useDesignSystemStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Palette,
  Type,
  Layout,
  Box,
  Copy,
  Download,
  Share2,
  ArrowLeft,
  Loader2,
  Check,
  Layers,
  Grid3x3,
  RotateCcw,
  FileJson,
  Code2,
  Wind,
  FileCode,
  Figma,
  ExternalLink,
  Settings,
  Component,
  Palette as PaletteIcon,
  Eye,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  ChevronRight,
  X,
  Maximize2,
  FileText,
  Braces,
  ListCollapse
} from 'lucide-react'

interface ColorScale {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string
}

interface Colors {
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  neutral: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
}

interface Typography {
  fontFamily: { sans: string[]; serif: string[]; mono: string[] }
  fontSize: Record<string, string>
  fontWeight: Record<string, string>
  lineHeight: Record<string, string>
  letterSpacing: Record<string, string>
}

interface Spacing {
  scale: number
  values: Record<string, string>
}

interface BorderRadius {
  sm: string; md: string; lg: string; xl: string; '2xl': string; full: string
}

interface Shadows {
  sm: string; md: string; lg: string; xl: string; '2xl': string; inner: string
}

interface Components {
  button?: {
    variants?: Record<string, ButtonComponentStyles>
    sizes?: Record<string, ButtonSizesStyles>
    borderRadius?: string
  }
  card?: any
  input?: any
  modal?: any
  [key: string]: any
}

interface DesignSystem {
  id: string
  name: string
  description: string
  prompt: string
  colors: Colors
  typography: Typography
  spacing: Spacing
  borderRadius: BorderRadius
  shadows: Shadows
  components: Components
  industry: string | null
  shareSlug: string
  createdAt?: string
  updatedAt?: string
}

export default function DesignSystemPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [componentJsonView, setComponentJsonView] = useState<string | null>(null)
  const [canvasPreview, setCanvasPreview] = useState(false)
  const [canvasDevice, setCanvasDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copiedComponent, setCopiedComponent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('colors')
  
  // All 46 Components List - Matching user's exact list
  const ALL_COMPONENTS = [
    { id: 'buttons', name: 'Buttons', category: 'Basic Components', description: 'Primary, secondary, ghost variants' },
    { id: 'inputs', name: 'Inputs', category: 'Basic Components', description: 'Text, email, password inputs' },
    { id: 'cards', name: 'Cards', category: 'Basic Components', description: 'Content containers with header, body, footer' },
    { id: 'typography', name: 'Typography', category: 'Foundations', description: 'Font families, sizes, weights' },
    { id: 'colors', name: 'Colors', category: 'Foundations', description: 'Primary, secondary, semantic colors' },
    { id: 'spacing', name: 'Spacing', category: 'Foundations', description: 'Margin, padding system' },
    { id: 'elevation', name: 'Elevation', category: 'Foundations', description: 'Shadow depths, z-index' },
    { id: 'borders', name: 'Borders', category: 'Foundations', description: 'Border styles, corner radius' },
    { id: 'icons', name: 'Icons', category: 'Foundations', description: 'Icon library and guidelines' },
    { id: 'checkboxes', name: 'Checkboxes', category: 'Basic Components', description: 'Selection controls' },
    { id: 'toggles', name: 'Toggles', category: 'Basic Components', description: 'On/off switch controls' },
    { id: 'badges', name: 'Badges', category: 'Basic Components', description: 'Status indicators' },
    { id: 'avatars', name: 'Avatars', category: 'Basic Components', description: 'User profile images' },
    { id: 'links', name: 'Links', category: 'Basic Components', description: 'Text links with states' },
    { id: 'alerts', name: 'Alerts', category: 'Feedback & Overlays', description: 'Success, warning, error messages' },
    { id: 'modals', name: 'Modals', category: 'Feedback & Overlays', description: 'Pop-up dialogs' },
    { id: 'tooltips', name: 'Tooltips', category: 'Feedback & Overlays', description: 'Hover information' },
    { id: 'loaders', name: 'Loaders', category: 'Feedback & Overlays', description: 'Spinners, progress' },
    { id: 'toasts', name: 'Toasts', category: 'Feedback & Overlays', description: 'Temporary notifications' },
    { id: 'popovers', name: 'Popovers', category: 'Feedback & Overlays', description: 'Contextual overlays' },
    { id: 'menus', name: 'Menus', category: 'Navigation', description: 'Navigation menus' },
    { id: 'breadcrumbs', name: 'Breadcrumbs', category: 'Navigation', description: 'Path navigation' },
    { id: 'tabs', name: 'Tabs', category: 'Navigation', description: 'Content switching' },
    { id: 'pagination', name: 'Pagination', category: 'Navigation', description: 'Page navigation' },
    { id: 'accordion', name: 'Accordion', category: 'Navigation', description: 'Expandable sections' },
    { id: 'navbar', name: 'Navbar', category: 'Navigation', description: 'Top navigation bar' },
    { id: 'sidebar', name: 'Sidebar', category: 'Navigation', description: 'Side panel navigation' },
    { id: 'tables', name: 'Tables', category: 'Data Display', description: 'Data tables' },
    { id: 'lists', name: 'Lists', category: 'Data Display', description: 'Ordered and unordered lists' },
    { id: 'stats', name: 'Stats', category: 'Data Display', description: 'Metric displays' },
    { id: 'charts', name: 'Charts', category: 'Data Display', description: 'Data visualization' },
    { id: 'timeline', name: 'Timeline', category: 'Data Display', description: 'Chronological events' },
    { id: 'tree', name: 'Tree', category: 'Data Display', description: 'Hierarchical data' },
    { id: 'forms', name: 'Forms', category: 'Forms & Input', description: 'Form layouts' },
    { id: 'textarea', name: 'Textarea', category: 'Forms & Input', description: 'Multi-line text input' },
    { id: 'select', name: 'Select', category: 'Forms & Input', description: 'Option selection' },
    { id: 'datepicker', name: 'Datepicker', category: 'Forms & Input', description: 'Calendar selection' },
    { id: 'slider', name: 'Slider', category: 'Forms & Input', description: 'Range selection' },
    { id: 'fileupload', name: 'Fileupload', category: 'Forms & Input', description: 'Drag-drop file input' },
    { id: 'multiselect', name: 'Multiselect', category: 'Forms & Input', description: 'Tag-based selection' },
    { id: 'grid', name: 'Grid', category: 'Layout & Structure', description: '12-column grid' },
    { id: 'containers', name: 'Containers', category: 'Layout & Structure', description: 'Content wrappers' },
    { id: 'dividers', name: 'Dividers', category: 'Layout & Structure', description: 'Section separators' },
    { id: 'aspectratio', name: 'Aspectratio', category: 'Layout & Structure', description: 'Responsive containers' },
    { id: 'carousel', name: 'Carousel', category: 'Layout & Structure', description: 'Image/content slider' },
    { id: 'emptystate', name: 'Emptystate', category: 'Layout & Structure', description: 'No data displays' },
  ]
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  const componentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const listContainerRef = useRef<HTMLDivElement>(null)
  const { currentDesignSystem, isLoadingSingle, singleError, fetchDesignSystemById, exportDesignSystem, clearCurrentDesignSystem } = useDesignSystemStore()
  const id = params.id as string

  useEffect(() => {
    if (id) {
      fetchDesignSystemById(id)
    }

    return () => {
      clearCurrentDesignSystem()
    }
  }, [id, fetchDesignSystemById, clearCurrentDesignSystem])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'component-json') return
      
      if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault()
        scrollToNextComponent('down')
      } else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault()
        scrollToNextComponent('up')
      } else if (e.key === 'Home') {
        e.preventDefault()
        listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (e.key === 'End') {
        e.preventDefault()
        listContainerRef.current?.scrollTo({ top: listContainerRef.current.scrollHeight, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, activeComponent])

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(label)
    setTimeout(() => setCopiedValue(null), 2000)
  }

  const handleShare = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopiedValue('link')
    setTimeout(() => setCopiedValue(null), 2000)
  }

  const handleExport = async (format: 'json' | 'css' | 'tailwind' | 'scss' | 'figma' | 'figma-json' | 'tokens-studio') => {
    await exportDesignSystem(id, format)
  }

  const scrollToComponent = (componentId: string) => {
    const element = componentRefs.current[componentId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveComponent(componentId)
      setTimeout(() => setActiveComponent(null), 2000)
    }
  }

  const scrollToNextComponent = (direction: 'up' | 'down') => {
    const currentIndex = activeComponent 
      ? ALL_COMPONENTS.findIndex(c => c.id === activeComponent)
      : -1
    let nextIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1
    
    if (nextIndex < 0) nextIndex = 0
    if (nextIndex >= ALL_COMPONENTS.length) nextIndex = ALL_COMPONENTS.length - 1
    
    const nextComponent = ALL_COMPONENTS[nextIndex]
    scrollToComponent(nextComponent.id)
  }

  const handleCopyWithScroll = (componentId: string, componentStyles: any) => {
    const json = JSON.stringify(componentStyles, null, 2)
    navigator.clipboard.writeText(json)
    setCopiedComponent(componentId)
    scrollToComponent(componentId)
    setTimeout(() => setCopiedComponent(null), 2000)
  }

  if (isLoadingSingle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading design system...</p>
        </div>
      </div>
    )
  }

  if (singleError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">Error: {singleError}</p>
          <Button onClick={() => fetchDesignSystemById(id)}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!currentDesignSystem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Design system not found</p>
      </div>
    )
  }

  const { colors, typography, spacing, borderRadius, shadows, components } = currentDesignSystem

  // Safe access to button variants with fallbacks
  const buttonVariants = components?.button?.variants || {}
  const buttonSizes = components?.button?.sizes || {}
  const buttonBorderRadius = components?.button?.borderRadius || '0.375rem'
  const primaryButtonStyle = buttonVariants?.primary || { background: '#3b82f6', color: '#ffffff' }

  // Verify all user components are covered
  const USER_COMPONENTS = [
    'buttons', 'inputs', 'cards', 'typography', 'colors', 'spacing', 'elevation', 'borders', 'icons',
    'checkboxes', 'toggles', 'badges', 'avatars', 'links', 'alerts', 'modals', 'tooltips', 'loaders',
    'toasts', 'popovers', 'menus', 'breadcrumbs', 'tabs', 'pagination', 'accordion', 'navbar', 'sidebar',
    'tables', 'lists', 'stats', 'charts', 'timeline', 'tree', 'forms', 'textarea', 'select', 'datepicker',
    'slider', 'fileupload', 'multiselect', 'grid', 'containers', 'dividers', 'aspectratio', 'carousel', 'emptystate'
  ]

  // Get component styles from design system (handles both singular and plural keys)
  const getComponentStyles = (componentId: string): any => {
    // Try direct match first
    if (components?.[componentId]) return components[componentId]
    // Try plural form (e.g., buttons -> button)
    const singular = componentId.replace(/s$/, '')
    if (components?.[singular]) return components[singular]
    // Try singular to plural (e.g., button -> buttons)
    const plural = componentId + 's'
    if (components?.[plural]) return components[plural]
    // Return null if not found
    return null
  }

  // Component renderer functions
  const renderNavbarPreview = (navbarStyles: any) => {
    const bg = navbarStyles?.background || '#ffffff'
    const borderBottom = navbarStyles?.borderBottom || borderRadius?.md || '#e5e7eb'
    const height = navbarStyles?.height || '64px'
    
    return (
      <div 
        className="w-full flex items-center justify-between px-4"
        style={{ backgroundColor: bg, borderBottom: `1px solid ${borderBottom}`, height, borderRadius: borderRadius?.md }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">DS</span>
          </div>
          <span className="font-semibold" style={{ color: colors?.neutral?.[900] || '#111827' }}>Brand</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Home', 'Products', 'About', 'Contact'].map((item, i) => (
            <span key={i} className="text-sm cursor-pointer hover:text-primary transition-colors" style={{ color: colors?.neutral?.[600] || '#4b5563' }}>
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-3 py-1.5 text-sm rounded-md"
            style={{ backgroundColor: primaryButtonStyle.background, color: primaryButtonStyle.color }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const renderSidebarPreview = (sidebarStyles: any) => {
    const bg = sidebarStyles?.background || '#ffffff'
    const borderRight = sidebarStyles?.borderRight || borderRadius?.md || '#e5e7eb'
    const width = sidebarStyles?.width || '256px'
    
    const itemHover = sidebarStyles?.item?.hover?.background || colors?.neutral?.[100] || '#f3f4f6'
    const itemActive = sidebarStyles?.item?.active?.background || colors?.primary?.[50] || '#eff6ff'
    const itemActiveColor = sidebarStyles?.item?.active?.color || colors?.primary?.[700] || '#1d4ed8'
    
    return (
      <div 
        className="h-full flex flex-col"
        style={{ backgroundColor: bg, borderRight: `1px solid ${borderRight}`, width, borderRadius: `0 ${borderRadius?.md || '0.375rem'} ${borderRadius?.md || '0.375rem'} 0` }}
      >
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: colors?.neutral?.[200] || '#e5e7eb' }}>
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">DS</span>
          </div>
          <span className="font-semibold" style={{ color: colors?.neutral?.[900] || '#111827' }}>Dashboard</span>
        </div>
        <div className="flex-1 p-2 space-y-1">
          {['Overview', 'Analytics', 'Settings', 'Profile'].map((item, i) => (
            <div 
              key={i}
              className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${i === 0 ? '' : ''}`}
              style={{ 
                backgroundColor: i === 0 ? itemActive : 'transparent', 
                color: i === 0 ? itemActiveColor : colors?.neutral?.[600] || '#4b5563'
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderCardPreview = (cardStyles: any) => {
    const bg = cardStyles?.background || '#ffffff'
    const border = cardStyles?.border || colors?.neutral?.[200] || '#e5e7eb'
    const borderRadiusVal = cardStyles?.borderRadius || borderRadius?.lg || '0.5rem'
    const padding = cardStyles?.padding || '1.5rem'
    const shadow = cardStyles?.shadow ? shadows?.[cardStyles.shadow as keyof typeof shadows] || shadows?.md : shadows?.md
    
    return (
      <div 
        className="p-6"
        style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: borderRadiusVal, boxShadow: shadow, padding }}
      >
        <div style={{ padding: cardStyles?.header?.padding || '0 0 1rem 0' }}>
          <h3 style={{ fontSize: cardStyles?.title?.fontSize || '1.5rem', fontWeight: cardStyles?.title?.fontWeight || '600', color: colors?.neutral?.[900] || '#111827' }}>Card Title</h3>
        </div>
        <p style={{ fontSize: cardStyles?.description?.fontSize || '0.875rem', color: cardStyles?.description?.color || colors?.neutral?.[500] || '#6b7280' }}>
          Sample card content with design system styles. This is a preview of your card component.
        </p>
        <div className="mt-4 flex gap-2">
          <button 
            className="px-3 py-1.5 text-sm rounded-md"
            style={{ backgroundColor: primaryButtonStyle.background, color: primaryButtonStyle.color }}
          >
            Action
          </button>
        </div>
      </div>
    )
  }

  const renderInputPreview = (inputStyles: any) => {
    const bg = inputStyles?.background || '#ffffff'
    const border = inputStyles?.border || colors?.neutral?.[300] || '#d1d5db'
    const borderRadiusVal = inputStyles?.borderRadius || borderRadius?.md || '0.375rem'
    const padding = inputStyles?.padding || '0.5rem 0.75rem'
    const fontSize = inputStyles?.fontSize || '1rem'
    const color = inputStyles?.color || colors?.neutral?.[900] || '#1f2937'
    const placeholder = inputStyles?.placeholder || colors?.neutral?.[400] || '#9ca3af'
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: colors?.neutral?.[700] || '#374151' }}>Label</label>
        <input 
          type="text" 
          placeholder="Enter text..."
          className="w-full outline-none transition-colors"
          style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: borderRadiusVal, padding, fontSize, color }} 
        />
        <p className="text-xs" style={{ color: colors?.neutral?.[500] || '#6b7280' }}>Helper text</p>
      </div>
    )
  }

  const renderButtonPreview = (buttonStyles: any) => {
    const variants = buttonStyles?.variants || {}
    const sizes = buttonStyles?.sizes || {}
    const borderRadiusVal = buttonStyles?.borderRadius || borderRadius?.md || '0.375rem'
    
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {Object.entries(variants).map(([variant, styles]: [string, any]) => (
            <button 
              key={variant}
              className="px-4 py-2 rounded-md font-medium capitalize transition-colors"
              style={{ 
                backgroundColor: styles.background, 
                color: styles.color,
                borderRadius: borderRadiusVal
              }}
            >
              {variant}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(sizes).map(([size, styles]: [string, any]) => (
            <button 
              key={size}
              className="rounded-md font-medium capitalize transition-colors"
              style={{ 
                backgroundColor: primaryButtonStyle.background, 
                color: primaryButtonStyle.color, 
                padding: styles.padding,
                fontSize: styles.fontSize,
                borderRadius: borderRadiusVal,
                height: styles.height
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderModalPreview = (modalStyles: any) => {
    const bg = modalStyles?.background || '#ffffff'
    const borderRadiusVal = modalStyles?.borderRadius || borderRadius?.lg || '0.5rem'
    const padding = modalStyles?.padding || '1.5rem'
    const overlayBg = modalStyles?.overlay?.background || 'rgba(0,0,0,0.5)'
    const maxWidth = modalStyles?.maxWidth || '32rem'
    
    return (
      <div className="relative">
        <div className="absolute inset-0" style={{ backgroundColor: overlayBg, borderRadius: borderRadiusVal }} />
        <div 
          className="relative mx-auto"
          style={{ backgroundColor: bg, borderRadius: borderRadiusVal, padding, maxWidth, boxShadow: shadows?.xl || '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: modalStyles?.title?.fontSize || '1.25rem', fontWeight: modalStyles?.title?.fontWeight || '600', color: colors?.neutral?.[900] || '#111827' }}>
              Modal Title
            </h3>
            <button className="p-1 rounded hover:bg-neutral-100">
              <X className="w-4 h-4" style={{ color: colors?.neutral?.[500] || '#6b7280' }} />
            </button>
          </div>
          <p style={{ fontSize: modalStyles?.body?.fontSize || '1rem', color: colors?.neutral?.[600] || '#4b5563', lineHeight: '1.5' }}>
            This is a preview of your modal component. It shows the overlay, header, body, and action buttons.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button className="px-4 py-2 rounded-md text-sm" style={{ color: colors?.neutral?.[600] || '#4b5563' }}>Cancel</button>
            <button 
              className="px-4 py-2 rounded-md text-sm"
              style={{ backgroundColor: primaryButtonStyle.background, color: primaryButtonStyle.color }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderBadgePreview = (badgeStyles: any) => {
    const variants = badgeStyles?.variants || {}
    
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(variants).map(([variant, styles]: [string, any]) => (
          <span 
            key={variant}
            className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium"
            style={{ 
              backgroundColor: styles.background, 
              color: styles.color,
              borderRadius: badgeStyles?.borderRadius || '0.25rem'
            }}
          >
            {variant}
          </span>
        ))}
      </div>
    )
  }

  const renderAlertPreview = (alertStyles: any) => {
    const variants = alertStyles?.variants || {}
    
    return (
      <div className="space-y-3">
        {Object.entries(variants).slice(0, 4).map(([variant, styles]: [string, any]) => (
          <div 
            key={variant}
            className="flex items-start gap-3 p-4 rounded-lg"
            style={{ 
              backgroundColor: styles.background, 
              border: `1px solid ${styles.border}`
            }}
          >
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: styles.iconColor }} />
            <div>
              <h4 className="font-semibold text-sm" style={{ color: colors?.neutral?.[900] || '#111827' }}>Alert Title</h4>
              <p className="text-sm mt-1" style={{ color: colors?.neutral?.[600] || '#4b5563' }}>
                This is an alert message with {variant} variant.
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTabsPreview = (tabsStyles: any) => {
    const variants = tabsStyles?.variants || {}
    const tabStyle = tabsStyles?.tab || {}
    
    return (
      <div className="space-y-4">
        {Object.entries(variants).slice(0, 2).map(([variant, variantStyles]: [string, any]) => (
          <div key={variant}>
            <div className="flex border-b" style={{ borderColor: colors?.neutral?.[200] || '#e5e7eb' }}>
              {['Tab One', 'Tab Two', 'Tab Three'].map((tab, i) => (
                <button
                  key={i}
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{ 
                    color: i === 0 ? (tabStyle?.color || colors?.primary?.[600] || '#2563eb') : (colors?.neutral?.[600] || '#4b5563'),
                    borderBottom: i === 0 ? `2px solid ${tabStyle?.color || colors?.primary?.[600] || '#2563eb'}` : '2px solid transparent'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4 mt-2 border rounded-lg" style={{ borderColor: colors?.neutral?.[200] || '#e5e7eb' }}>
              <p style={{ color: colors?.neutral?.[600] || '#4b5563' }}>Tab content for {variant} variant</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Get the preview for a component - handles both singular and plural
  const getComponentPreview = (componentName: string, componentStyles: any): React.ReactNode => {
    const key = componentName.toLowerCase()
    const singular = key.endsWith('s') ? key.slice(0, -1) : key
    
    // Helper to get color from nested structure
    const getColor = (obj: any): string => {
      if (!obj) return '#000000'
      if (typeof obj === 'string') return obj
      if (obj.color) return obj.color
      return '#000000'
    }
    
    // Helper to get nested value
    const getNested = (obj: any, path: string): any => {
      if (!obj) return null
      return path.split('.').reduce((acc, part) => acc?.[part], obj)
    }

    // Dynamic preview using actual component styles
    const renderButtonPreview = () => {
      const variants = componentStyles?.variants || {}
      const sizes = componentStyles?.sizes || {}
      const borderRadiusVal = getNested(componentStyles, 'variants.primary.radius.value') || '0.375rem'
      
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(variants).slice(0, 4).map(([variant, styles]: [string, any]) => (
              <button 
                key={variant}
                className="px-4 py-2 rounded-md font-medium capitalize transition-colors"
                style={{ 
                  backgroundColor: getColor(getNested(styles, 'background.color')), 
                  color: getColor(getNested(styles, 'foreground.color')),
                  borderRadius: getNested(styles, 'radius.value') || borderRadiusVal,
                  border: getNested(styles, 'border.width') > 0 ? `${getNested(styles, 'border.width')}px ${getNested(styles, 'border.style')} ${getColor(getNested(styles, 'border.color'))}` : 'none'
                }}
              >
                {variant}
              </button>
            ))}
          </div>
          {Object.keys(sizes).length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(sizes).slice(0, 3).map(([size, styles]: [string, any]) => {
                const bgColor = getColor(getNested(variants, 'primary.background.color')) || '#3b82f6'
                const fgColor = getColor(getNested(variants, 'primary.foreground.color')) || '#ffffff'
                return (
                  <button 
                    key={size}
                    className="rounded-md font-medium capitalize transition-colors"
                    style={{ 
                      backgroundColor: bgColor, 
                      color: fgColor, 
                      padding: getNested(styles, 'layout.padding') || '8px 16px',
                      fontSize: getNested(styles, 'typography.fontSize') || '14px',
                      borderRadius: borderRadiusVal,
                      height: getNested(styles, 'layout.height') || '40px'
                    }}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    const renderInputPreview = () => {
      const bg = getColor(getNested(componentStyles, 'background.color')) || '#ffffff'
      const borderColor = getColor(getNested(componentStyles, 'border.color')) || '#d1d5db'
      const borderRadiusVal = getNested(componentStyles, 'border.radius.value') || '0.375rem'
      const padding = getNested(componentStyles, 'layout.padding') || '8px 12px'
      const fontSize = getNested(componentStyles, 'typography.fontSize') || '1rem'
      const color = getColor(getNested(componentStyles, 'typography.color')) || '#1f2937'
      const placeholderColor = getColor(getNested(componentStyles, 'typography.placeholder.color')) || '#9ca3af'
      
      return (
        <div className="w-full max-w-xs space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color }}>Label</label>
            <input 
              type="text" 
              placeholder="Enter text..."
              className="w-full outline-none transition-colors"
              style={{ 
                backgroundColor: bg, 
                border: `1.5px solid ${borderColor}`, 
                borderRadius: borderRadiusVal, 
                padding, 
                fontSize, 
                color 
              }} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#dc2626' }}>Error</label>
            <input 
              type="text" 
              placeholder="Error state"
              className="w-full outline-none"
              style={{ 
                backgroundColor: bg, 
                border: `1.5px solid #ef4444`, 
                borderRadius: borderRadiusVal, 
                padding, 
                fontSize, 
                color: '#dc2626'
              }} 
            />
            <p className="text-xs" style={{ color: '#dc2626', marginTop: '4px' }}>This field is required</p>
          </div>
        </div>
      )
    }

    const renderCardPreview = () => {
      const bg = getColor(getNested(componentStyles, 'background.color')) || '#ffffff'
      const borderColor = getColor(getNested(componentStyles, 'border.color')) || '#e5e7eb'
      const borderRadiusVal = getNested(componentStyles, 'border.radius.value') || '0.5rem'
      const padding = getNested(componentStyles, 'layout.padding') || '24px'
      const shadow = getNested(componentStyles, 'effects.boxShadow') || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      
      return (
        <div 
          className="w-full max-w-xs"
          style={{ backgroundColor: bg, border: `1px solid ${borderColor}`, borderRadius: borderRadiusVal, boxShadow: shadow, padding }}
        >
          <div style={{ padding: getNested(componentStyles, 'sections.header.layout.padding') || '0 0 16px 0' }}>
            <h3 style={{ 
              fontSize: getNested(componentStyles, 'typography.title.fontSize') || '1.5rem', 
              fontWeight: getNested(componentStyles, 'typography.title.fontWeight') || '600',
              color: getColor(getNested(componentStyles, 'typography.title.color')) || '#111827'
            }}>
              Card Title
            </h3>
          </div>
          <p style={{ 
            fontSize: getNested(componentStyles, 'typography.description.fontSize') || '0.875rem', 
            color: getColor(getNested(componentStyles, 'typography.description.color')) || '#6b7280'
          }}>
            Sample card content with design system styles.
          </p>
          <div className="mt-4 flex gap-2">
            <button 
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            >
              Action
            </button>
          </div>
        </div>
      )
    }

    const renderBadgePreview = () => {
      const variants = componentStyles?.variants || {}
      
      return (
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(variants).slice(0, 6).map(([variant, styles]: [string, any]) => (
            <span 
              key={variant}
              className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: getColor(getNested(styles, 'background.color')), 
                color: getColor(getNested(styles, 'foreground.color')),
                borderRadius: getNested(styles, 'layout.borderRadius.value') || '0.25rem'
              }}
            >
              {variant}
            </span>
          ))}
        </div>
      )
    }

    const renderModalPreview = () => {
      const bg = getColor(getNested(componentStyles, 'container.background.color')) || '#ffffff'
      const borderRadiusVal = getNested(componentStyles, 'container.border.radius.value') || '0.5rem'
      const padding = getNested(componentStyles, 'container.layout.padding') || '1.5rem'
      const overlayBg = getColor(getNested(componentStyles, 'overlay.background.color')) || 'rgba(0,0,0,0.5)'
      const maxWidth = getNested(componentStyles, 'container.layout.maxWidth') || '32rem'
      
      return (
        <div className="relative">
          <div className="absolute inset-0" style={{ backgroundColor: overlayBg, borderRadius: borderRadiusVal }} />
          <div 
            className="relative mx-auto"
            style={{ backgroundColor: bg, borderRadius: borderRadiusVal, padding, maxWidth, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ 
                fontSize: getNested(componentStyles, 'sections.header.typography.fontSize') || '1.25rem', 
                fontWeight: getNested(componentStyles, 'sections.header.typography.fontWeight') || '600',
                color: getColor(getNested(componentStyles, 'sections.header.typography.color')) || '#111827'
              }}>
                Modal Title
              </h3>
              <button className="p-1 rounded hover:bg-gray-100" style={{ color: '#6b7280' }}>✕</button>
            </div>
            <p style={{ 
              fontSize: getNested(componentStyles, 'sections.body.typography.fontSize') || '1rem', 
              color: getColor(getNested(componentStyles, 'sections.body.typography.color')) || '#4b5563'
            }}>
              This is a preview of your modal component.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md text-sm" style={{ color: '#4b5563' }}>Cancel</button>
              <button 
                className="px-4 py-2 rounded-md text-sm"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )
    }

    const renderAlertPreview = () => {
      const variants = componentStyles?.variants || {}
      const variantNames = ['info', 'success', 'warning', 'error'].filter(v => variants[v])
      
      return (
        <div className="space-y-3 w-full max-w-md">
          {variantNames.slice(0, 4).map((variant) => {
            const styles = variants[variant] || {}
            return (
              <div 
                key={variant}
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{ 
                  backgroundColor: getColor(getNested(styles, 'background.color')), 
                  border: `1px solid ${getColor(getNested(styles, 'border.color'))}`
                }}
              >
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(getNested(styles, 'iconColor')) }} />
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: '#111827' }}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</h4>
                  <p className="text-sm" style={{ color: '#4b5563' }}>
                    This is an alert message with {variant} variant.
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    const renderTabsPreview = () => {
      const variants = componentStyles?.variants || {}
      const tabStyle = componentStyles?.tab || {}
      const tabColor = getNested(tabStyle, 'states.active.color') || '#2563eb'
      
      return (
        <div className="space-y-4">
          <div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              {['Tab One', 'Tab Two', 'Tab Three'].map((tab, i) => (
                <button
                  key={i}
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{ 
                    color: i === 0 ? tabColor : '#4b5563',
                    borderBottom: i === 0 ? `2px solid ${tabColor}` : '2px solid transparent'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4 mt-2 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <p style={{ color: '#4b5563' }}>Tab content goes here</p>
            </div>
          </div>
        </div>
      )
    }

    const renderNavbarPreview = () => {
      const bg = getColor(getNested(componentStyles, 'background.color')) || '#ffffff'
      const borderColor = getColor(getNested(componentStyles, 'border.color')) || '#e5e7eb'
      const height = getNested(componentStyles, 'layout.height') || '64px'
      
      return (
        <div 
          className="w-full flex items-center justify-between px-4"
          style={{ backgroundColor: bg, borderBottom: `1px solid ${borderColor}`, height, borderRadius: '0' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">DS</span>
            </div>
            <span className="font-semibold" style={{ color: '#111827' }}>Brand</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Home', 'Products', 'About', 'Contact'].map((item, i) => (
              <span key={i} className="text-sm cursor-pointer hover:text-blue-600 transition-colors" style={{ color: '#4b5563' }}>
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 text-sm rounded-md"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            >
              Sign In
            </button>
          </div>
        </div>
      )
    }

    const renderSidebarPreview = () => {
      const bg = getColor(getNested(componentStyles, 'background.color')) || '#ffffff'
      const borderColor = getColor(getNested(componentStyles, 'border.color')) || '#e5e7eb'
      const width = getNested(componentStyles, 'layout.width') || '256px'
      const itemActiveBg = getNested(componentStyles, 'item.states.active.background.color') || '#eff6ff'
      const itemActiveColor = getNested(componentStyles, 'item.states.active.foreground.color') || '#1d4ed8'
      
      return (
        <div 
          className="h-full flex flex-col"
          style={{ backgroundColor: bg, borderRight: `1px solid ${borderColor}`, width }}
        >
          <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">DS</span>
            </div>
            <span className="font-semibold" style={{ color: '#111827' }}>Dashboard</span>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {['Overview', 'Analytics', 'Settings', 'Profile'].map((item, i) => (
              <div 
                key={i}
                className="px-3 py-2 rounded-md cursor-pointer text-sm transition-colors"
                style={{ 
                  backgroundColor: i === 0 ? itemActiveBg : 'transparent', 
                  color: i === 0 ? itemActiveColor : '#4b5563'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Use dynamic previews if we have actual styles, otherwise use static fallbacks
    if (componentStyles && Object.keys(componentStyles).length > 0) {
      switch (singular) {
        case 'button':
          return renderButtonPreview()
        case 'input':
          return renderInputPreview()
        case 'card':
          return renderCardPreview()
        case 'badge':
          return renderBadgePreview()
        case 'modal':
          return renderModalPreview()
        case 'alert':
          return renderAlertPreview()
        case 'tab':
        case 'tabs':
          return renderTabsPreview()
        case 'navbar':
          return renderNavbarPreview()
        case 'sidebar':
          return renderSidebarPreview()
      }
    }
    
    // Static fallback previews for components without styles
    const visualMap: Record<string, React.ReactNode> = {
      button: (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold shadow-sm">Primary</button>
          <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded text-sm font-semibold">Outline</button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-semibold hover:bg-gray-200">Ghost</button>
        </div>
      ),
      input: (
        <div className="w-full max-w-xs space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" placeholder="Enter text..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-red-600 mb-1">Error</label>
            <input className="w-full border-2 border-red-500 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Error state" />
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          </div>
        </div>
      ),
      card: (
        <div className="w-full max-w-xs border-2 border-gray-200 rounded-xl p-5 bg-white shadow-md">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="font-bold text-lg mb-2 text-gray-800">Card Title</div>
          <div className="text-sm text-gray-500 mb-4">Card description with some longer content to show layout.</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Action</button>
            <button className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      ),
      checkbox: (
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-400 rounded" />
            <span className="text-sm text-gray-600">Unchecked</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm text-gray-600">Checked</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-5 h-5 border-2 border-blue-600 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Indeterminate</span>
          </label>
        </div>
      ),
      toggle: (
        <div className="flex gap-6 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-not-allowed">
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </div>
            <span className="text-sm text-gray-500">Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </div>
            <span className="text-sm text-gray-600 font-medium">On</span>
          </div>
        </div>
      ),
      badge: (
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">Default</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Success</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">Warning</span>
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">Error</span>
          <span className="px-3 py-1 bg purple-100 text-purple-700 text-xs rounded-full font-semibold">Info</span>
        </div>
      ),
      avatar: (
        <div className="flex gap-3 justify-center items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">JD</div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <span className="text-sm font-bold">+5</span>
          </div>
        </div>
      ),
      link: (
        <div className="flex flex-col gap-2 items-center">
          <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors">Primary Link →</a>
          <a href="#" className="text-gray-500 hover:text-gray-700 hover:underline text-sm transition-colors">Secondary Link →</a>
        </div>
      ),
      modal: (
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-0 bg-black/50 rounded-lg" />
          <div className="relative mx-3 my-3 bg-white rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-bold text-lg">Modal Title</div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <div className="p-4 text-sm text-gray-600">This is the modal body content. You can add any content here.</div>
            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <button className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100">Cancel</button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      ),
      alert: (
        <div className="space-y-3 w-full max-w-md">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div><div className="font-semibold text-blue-800">Info</div><div className="text-sm text-blue-600">This is an information alert</div></div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div><div className="font-semibold text-green-800">Success</div><div className="text-sm text-green-600">Operation completed successfully</div></div>
          </div>
        </div>
      ),
      tooltip: (
        <div className="relative flex flex-col items-center gap-4 py-6">
          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Hover me</button>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            Tooltip text here
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      ),
      loader: (
        <div className="flex gap-6 items-center justify-center">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-blue-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full" />
          </div>
        </div>
      ),
      toast: (
        <div className="space-y-3 w-full max-w-sm">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex-1"><div className="font-semibold text-sm">Success!</div><div className="text-xs text-gray-500">Changes saved successfully</div></div>
            <button className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      ),
      popover: (
        <div className="relative flex justify-center py-4">
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700">Click me</button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="p-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 rounded-lg cursor-pointer text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>Dashboard</div>
              <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 rounded-lg cursor-pointer text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profile</div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 rounded-lg cursor-pointer text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout</div>
            </div>
          </div>
        </div>
      ),
      menu: (
        <div className="w-48 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-1">
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-blue-50 rounded-lg cursor-pointer text-gray-700">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-blue-50 rounded-lg cursor-pointer text-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-blue-50 rounded-lg cursor-pointer text-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </div>
          <div className="h-px bg-gray-200 my-1" />
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-red-50 rounded-lg cursor-pointer text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </div>
        </div>
      ),
      breadcrumb: (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors">Home</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium transition-colors">Products</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-600 font-medium">Current Page</span>
        </div>
      ),
      tab: (
        <div className="w-full max-w-md">
          <div className="flex border-b-2 border-gray-200">
            <button className="px-5 py-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600 -mb-px">Tab One</button>
            <button className="px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">Tab Two</button>
            <button className="px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">Tab Three</button>
          </div>
          <div className="p-4 text-sm text-gray-600 mt-2">Tab content goes here. This is the content for the active tab.</div>
        </div>
      ),
      pagination: (
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center justify-center">&laquo;</button>
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">&lsaquo;</button>
          <button className="w-10 h-10 border-2 border-blue-600 rounded-lg text-sm font-bold bg-blue-600 text-white">1</button>
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">2</button>
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">3</button>
          <span className="px-2 text-gray-400">...</span>
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">10</button>
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">&rsaquo;</button>
          <button className="w-10 h-10 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">&raquo;</button>
        </div>
      ),
      accordion: (
        <div className="w-full max-w-sm border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer">
            <span className="font-semibold text-gray-800">Section 1 - Expanded</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div className="p-4 text-sm text-gray-600 bg-white">This is the expanded content for section 1. You can put any content here.</div>
          <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200 cursor-pointer hover:bg-gray-50">
            <span className="font-medium text-gray-600">Section 2 - Collapsed</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
          <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200 cursor-pointer hover:bg-gray-50">
            <span className="font-medium text-gray-600">Section 3 - Collapsed</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      ),
      navbar: (
        <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b-2 border-gray-200 rounded-t-xl" style={{ minWidth: '250px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-lg text-gray-800">Brand</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">Home</span>
            <span className="text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">Products</span>
            <span className="text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">About</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Login</button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm">Sign Up</button>
          </div>
        </div>
      ),
      sidebar: (
        <div className="flex h-28 bg-white border-r-2 border-gray-200 rounded-l-xl overflow-hidden">
          <div className="w-16 bg-gray-50 border-r border-gray-200 p-3 space-y-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg mx-auto" />
            <div className="w-10 h-10 bg-gray-200 rounded-lg mx-auto" />
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            <div className="h-3 bg-blue-100 rounded w-20" />
            <div className="h-2 bg-gray-100 rounded w-24" />
            <div className="h-2 bg-gray-100 rounded w-16" />
          </div>
        </div>
      ),
      table: (
        <div className="w-full max-w-md border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="flex bg-gray-100 border-b border-gray-200">
            <div className="flex-1 px-4 py-3 font-bold text-sm text-gray-700">Name</div>
            <div className="flex-1 px-4 py-3 font-bold text-sm text-gray-700">Email</div>
            <div className="flex-1 px-4 py-3 font-bold text-sm text-gray-700">Status</div>
          </div>
          <div className="flex border-b border-gray-100 hover:bg-blue-50">
            <div className="flex-1 px-4 py-3 text-sm">John Doe</div>
            <div className="flex-1 px-4 py-3 text-sm text-gray-500">john@example.com</div>
            <div className="flex-1 px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span></div>
          </div>
          <div className="flex border-b border-gray-100 bg-gray-50 hover:bg-blue-50">
            <div className="flex-1 px-4 py-3 text-sm">Jane Smith</div>
            <div className="flex-1 px-4 py-3 text-sm text-gray-500">jane@example.com</div>
            <div className="flex-1 px-4 py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span></div>
          </div>
          <div className="flex hover:bg-blue-50">
            <div className="flex-1 px-4 py-3 text-sm">Bob Wilson</div>
            <div className="flex-1 px-4 py-3 text-sm text-gray-500">bob@example.com</div>
            <div className="flex-1 px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Inactive</span></div>
          </div>
        </div>
      ),
      list: (
        <div className="w-full max-w-sm border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <div><div className="font-medium text-gray-800">List Item One</div><div className="text-xs text-gray-500">Secondary text</div></div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer bg-gray-50">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">2</div>
            <div><div className="font-medium text-gray-800">List Item Two</div><div className="text-xs text-gray-500">Secondary text</div></div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">3</div>
            <div><div className="font-medium text-gray-800">List Item Three</div><div className="text-xs text-gray-500">Secondary text</div></div>
          </div>
        </div>
      ),
      stat: (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 border-2 border-gray-200 rounded-xl bg-white">
            <div className="text-2xl font-bold text-gray-800">12.5K</div>
            <div className="text-xs text-gray-500 mt-1">Users</div>
            <div className="text-xs text-green-600 font-medium mt-1">↑ 12%</div>
          </div>
          <div className="text-center p-4 border-2 border-gray-200 rounded-xl bg-white">
            <div className="text-2xl font-bold text-green-600">$89K</div>
            <div className="text-xs text-gray-500 mt-1">Revenue</div>
            <div className="text-xs text-green-600 font-medium mt-1">↑ 23%</div>
          </div>
          <div className="text-center p-4 border-2 border-gray-200 rounded-xl bg-white">
            <div className="text-2xl font-bold text-blue-600">94%</div>
            <div className="text-xs text-gray-500 mt-1">Uptime</div>
            <div className="text-xs text-red-600 font-medium mt-1">↓ 2%</div>
          </div>
        </div>
      ),
      chart: (
        <div className="w-full">
          <div className="h-24 flex items-end gap-1">
            {[35, 55, 45, 70, 65, 85, 55, 60, 75, 50, 80, 65].map((height, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      ),
      timeline: (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full ring-4 ring-blue-100" />
              <div className="w-0.5 h-16 bg-gray-200" />
            </div>
            <div className="flex-1 pb-4">
              <div className="font-semibold text-gray-800">Project Started</div>
              <div className="text-sm text-gray-500">January 2024</div>
              <div className="text-xs text-gray-400 mt-1">Initial planning and setup phase completed</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full ring-4 ring-green-100" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">First Milestone</div>
              <div className="text-sm text-gray-500">February 2024</div>
              <div className="text-xs text-gray-400 mt-1">Design phase completed successfully</div>
            </div>
          </div>
        </div>
      ),
      tree: (
        <div className="text-sm">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            Root Folder
          </div>
          <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
              Documents
            </div>
            <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                report.pdf
              </div>
            </div>
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
              Images
            </div>
          </div>
        </div>
      ),
      form: (
        <div className="w-full max-w-sm space-y-4 p-6 border-2 border-gray-200 rounded-xl bg-white">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" placeholder="••••••••" type="password" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600">Remember me</span>
          </div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition-all">Sign In</button>
        </div>
      ),
      textarea: (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
          <textarea className="w-full h-24 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-none" placeholder="Enter your message..." />
          <p className="text-xs text-gray-400 mt-1 text-right">0 / 500 characters</p>
        </div>
      ),
      select: (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
          <div className="relative">
            <select className="w-full appearance-none border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white">
              <option>Select an option</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      ),
      datepicker: (
        <div className="w-56 border-2 border-gray-200 rounded-xl p-3 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">&larr;</button>
            <div className="font-bold text-sm">January 2024</div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">&rarr;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {[...Array(31)].map((_, i) => (
              <div key={i} className={`p-2 rounded-lg cursor-pointer hover:bg-blue-50 ${i + 1 === 15 ? 'bg-blue-600 text-white font-bold' : ''}`}>{i + 1}</div>
            ))}
          </div>
        </div>
      ),
      slider: (
        <div className="w-full max-w-sm py-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
            <span>Min: 0</span>
            <span>Value: 60</span>
            <span>Max: 100</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '60%' }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-md cursor-grab" style={{ left: '60%' }} />
          </div>
        </div>
      ),
      fileupload: (
        <div className="w-full max-w-sm border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div className="font-semibold text-gray-700 mb-1">Drop files here</div>
          <div className="text-sm text-gray-500 mb-3">or click to browse</div>
          <div className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</div>
        </div>
      ),
      multiselect: (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
          <div className="border-2 border-gray-300 rounded-lg p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded flex items-center gap-1">
                React <button className="hover:text-blue-900">×</button>
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded flex items-center gap-1">
                TypeScript <button className="hover:text-green-900">×</button>
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded flex items-center gap-1">
                Next.js <button className="hover:text-purple-900">×</button>
              </span>
            </div>
            <input className="w-full text-sm outline-none bg-transparent" placeholder="Add tag..." />
          </div>
        </div>
      ),
      grid: (
        <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold ${i <= 3 ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>{i}</div>
          ))}
        </div>
      ),
      container: (
        <div className="w-full max-w-md p-6 border-2 border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="text-sm font-semibold text-gray-800 mb-2">Container</div>
          <div className="text-sm text-gray-500">This is a container component for grouping related content.</div>
        </div>
      ),
      divider: (
        <div className="w-full max-w-xs space-y-4 py-2">
          <div className="text-sm text-gray-600">Above content</div>
          <hr className="border-gray-300" />
          <hr className="border-gray-300 border-dashed" />
          <hr className="border-gray-300 border-dotted" />
          <div className="text-sm text-gray-600">Below content</div>
        </div>
      ),
      aspectratio: (
        <div className="flex gap-3 items-end justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">1:1</div>
          <div className="w-20 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">16:9</div>
          <div className="w-12 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">3:4</div>
          <div className="w-20 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">21:9</div>
        </div>
      ),
      carousel: (
        <div className="w-full max-w-md h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Slide Content</span>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white/50 rounded-full" />
            <div className="w-2 h-2 bg-white/50 rounded-full" />
          </div>
          <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">&lt;</button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">&gt;</button>
        </div>
      ),
      emptystate: (
        <div className="w-full max-w-sm text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          <div className="text-lg font-bold text-gray-700 mb-2">No Data Yet</div>
          <div className="text-sm text-gray-500 mb-4">Get started by creating your first item</div>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition-all">Create New</button>
        </div>
      ),
      colors: (
        <div className="flex flex-wrap gap-2 justify-center">
          {['primary', 'secondary', 'accent', 'success', 'warning', 'error'].map((c) => (
            <div key={c} className="flex flex-col items-center">
              <div className="flex">
                {[100, 500, 900].map((shade) => (
                  <div key={shade} className="w-6 h-6" style={{ backgroundColor: colors?.[c]?.[shade] || '#ccc' }} />
                ))}
              </div>
              <span className="text-[8px] mt-1 capitalize">{c}</span>
            </div>
          ))}
        </div>
      ),
      typography: (
        <div className="text-left space-y-2">
          <div><span className="text-2xl font-bold text-gray-900">Bold 24px</span></div>
          <div><span className="text-xl font-semibold text-gray-800">Semibold 20px</span></div>
          <div><span className="text-lg font-medium text-gray-700">Medium 18px</span></div>
          <div><span className="text-base text-gray-600">Regular 16px</span></div>
          <div><span className="text-sm text-gray-500">Small 14px</span></div>
        </div>
      ),
      spacing: (
        <div className="flex items-end gap-3">
          {[4, 8, 12, 16, 24].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <div className="bg-blue-500" style={{ width: size * 1.5, height: size }} />
              <span className="text-xs text-gray-500">{size}px</span>
            </div>
          ))}
        </div>
      ),
      elevation: (
        <div className="flex gap-4 justify-center">
          <div className="w-12 h-12 rounded-lg bg-white shadow-sm" title="shadow-sm" />
          <div className="w-12 h-12 rounded-lg bg-white shadow-md" title="shadow-md" />
          <div className="w-12 h-12 rounded-lg bg-white shadow-lg" title="shadow-lg" />
          <div className="w-12 h-12 rounded-lg bg-white shadow-xl" title="shadow-xl" />
        </div>
      ),
      borders: (
        <div className="flex gap-3 justify-center">
          <div className="w-10 h-10 border-2 border-gray-800 rounded-sm" title="sm" />
          <div className="w-10 h-10 border-2 border-gray-800 rounded" title="md" />
          <div className="w-10 h-10 border-2 border-gray-800 rounded-lg" title="lg" />
          <div className="w-10 h-10 border-2 border-gray-800 rounded-full" title="full" />
        </div>
      ),
      icons: (
        <div className="flex gap-4 justify-center text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
      ),
    }
    
    // Try direct key, then singular form
    if (visualMap[key]) return visualMap[key]
    if (visualMap[singular]) return visualMap[singular]
    
    return null
  }

  const getComponentDescription = (componentName: string): string => {
    const descriptions: Record<string, string> = {
      button: 'Interactive button components with multiple variants and sizes',
      input: 'Text input fields with focus states and validation styles',
      card: 'Content containers with headers, body, and footer sections',
      modal: 'Overlay dialogs for focused interactions',
      checkbox: 'Selection controls for boolean choices',
      radio: 'Single selection from multiple options',
      toggle: 'On/off switch controls',
      badge: 'Status indicators and labels',
      avatar: 'User profile images with fallback initials',
      link: 'Interactive text links with hover states',
      alert: 'Contextual feedback and notification messages',
      tooltip: 'Hover information overlays',
      loader: 'Loading indicators and progress animations',
      progress: 'Visual progress bars and meters',
      toast: 'Temporary notification messages',
      popover: 'Contextual overlay content',
      dropdown: 'Menu dropdown for selections',
      menu: 'Navigation and action menus',
      navbar: 'Top navigation bar with logo and menu',
      sidebar: 'Side navigation panel',
      tabs: 'Content organization with tabbed interface',
      breadcrumb: 'Path navigation for hierarchical content',
      pagination: 'Page navigation controls',
      accordion: 'Expandable content sections',
      table: 'Structured data display',
      list: 'Ordered and unordered content lists',
      avatargroup: 'Multiple avatar stacking',
      stat: 'Statistical metric displays',
      chart: 'Data visualization components',
      timeline: 'Chronological event display',
      form: 'Complete form layouts and structures',
      textarea: 'Multi-line text input',
      select: 'Dropdown option selection',
      datepicker: 'Calendar-based date selection',
      slider: 'Range-based value selection',
      fileupload: 'Drag-and-drop file input',
      multiselect: 'Multiple tag-based selection',
      grid: '12-column responsive grid system',
      container: 'Content wrappers and sections',
      divider: 'Visual content separators',
      aspectratio: 'Responsive aspect ratio containers',
      carousel: 'Image and content sliders',
      emptystate: 'No-data placeholder displays'
    }
    return descriptions[componentName.toLowerCase()] || 'UI component'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{currentDesignSystem.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {currentDesignSystem.industry && (
                    <Badge variant="secondary">{currentDesignSystem.industry}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(currentDesignSystem.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShare}>
                {copiedValue === 'link' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
              <Link href="/generate">
                <Button>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Export Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Design System
            </CardTitle>
            <CardDescription>Download your design tokens in multiple formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button variant="outline" onClick={() => handleExport('json')} className="flex flex-col items-center gap-2 h-auto py-4">
                <FileJson className="h-8 w-8" />
                <span className="font-medium">JSON</span>
              </Button>
              <Button variant="outline" onClick={() => handleExport('css')} className="flex flex-col items-center gap-2 h-auto py-4">
                <Code2 className="h-8 w-8" />
                <span className="font-medium">CSS</span>
              </Button>
              <Button variant="outline" onClick={() => handleExport('tailwind')} className="flex flex-col items-center gap-2 h-auto py-4">
                <Wind className="h-8 w-8" />
                <span className="font-medium">Tailwind</span>
              </Button>
              <Button variant="outline" onClick={() => handleExport('scss')} className="flex flex-col items-center gap-2 h-auto py-4">
                <FileCode className="h-8 w-8" />
                <span className="font-medium">SCSS</span>
              </Button>
              <Button variant="outline" onClick={() => handleExport('figma')} className="flex flex-col items-center gap-2 h-auto py-4">
                <Layers className="h-8 w-8" />
                <span className="font-medium">Figma</span>
              </Button>
              <Button variant="outline" onClick={() => handleExport('tokens-studio')} className="flex flex-col items-center gap-2 h-auto py-4">
                <Figma className="h-8 w-8" />
                <span className="font-medium">Tokens</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="colors" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="colors"><Palette className="h-4 w-4 mr-2" />Colors</TabsTrigger>
            <TabsTrigger value="typography"><Type className="h-4 w-4 mr-2" />Typography</TabsTrigger>
            <TabsTrigger value="spacing"><Layout className="h-4 w-4 mr-2" />Spacing</TabsTrigger>
            <TabsTrigger value="borders"><Box className="h-4 w-4 mr-2" />Borders</TabsTrigger>
            <TabsTrigger value="shadows"><Layers className="h-4 w-4 mr-2" />Shadows</TabsTrigger>
            <TabsTrigger value="components"><Grid3x3 className="h-4 w-4 mr-2" />Components</TabsTrigger>
            <TabsTrigger value="preferences"><Settings className="h-4 w-4 mr-2" />Preferences</TabsTrigger>
            <TabsTrigger value="selected"><Component className="h-4 w-4 mr-2" />Selected</TabsTrigger>
            <TabsTrigger value="tokens"><PaletteIcon className="h-4 w-4 mr-2" />Tokens</TabsTrigger>
            <TabsTrigger value="component-json"><Braces className="h-4 w-4 mr-2" />Component JSON</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>Click any color to copy its hex value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(colors).map(([colorName, colorScale]) => (
                  <div key={colorName} className="space-y-2">
                    <h3 className="text-lg font-semibold capitalize">{colorName}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-11 gap-2">
                      {(Object.entries(colorScale) as [string, string][]).map(([shade, hex]) => (
                        <button
                          key={shade}
                          onClick={() => copyToClipboard(hex, `${colorName}-${shade}`)}
                          className="group relative aspect-square rounded-lg overflow-hidden border-2 hover:scale-110 transition-all"
                          style={{ backgroundColor: hex }}
                          title={`${colorName}-${shade}: ${hex}`}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            {shade}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>Font families, sizes, weights, and spacing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Font Families</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Badge variant="outline">Sans</Badge>
                      <p className="text-sm font-sans">{typography.fontFamily.sans.join(', ')}</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Serif</Badge>
                      <p className="text-sm font-serif">{typography.fontFamily.serif.join(', ')}</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline">Mono</Badge>
                      <p className="text-sm font-mono">{typography.fontFamily.mono.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Font Sizes</h3>
                  <div className="grid gap-2">
                    {Object.entries(typography.fontSize).map(([name, size]) => (
                      <div key={name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <span style={{ fontSize: size }} className="font-medium">{name}</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{size}</code>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(size, `fontSize-${name}`)}>
                            {copiedValue === `fontSize-${name}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spacing System</CardTitle>
                <CardDescription>8pt grid-based spacing scale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(spacing.values).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50">
                      <div className="bg-primary/20 rounded" style={{ width: String(value), height: '24px', minWidth: '16px' }} />
                      <div className="flex-1">
                        <span className="font-medium">spacing-{key}</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded ml-2">{value}</code>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(value, `spacing-${key}`)}>
                        {copiedValue === `spacing-${key}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borders Tab */}
          <TabsContent value="borders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
                <CardDescription>Consistent corner radii</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(borderRadius).map(([name, radius]) => (
                    <div key={name} className="space-y-2">
                      <div className="aspect-square border-2 border-primary bg-primary/10 flex items-center justify-center hover:scale-105 transition-transform" style={{ borderRadius: radius }}>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block text-center">{radius}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shadows Tab */}
          <TabsContent value="shadows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shadows</CardTitle>
                <CardDescription>Elevation and depth tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(shadows).map(([name, shadow]) => (
                    <div key={name} className="space-y-2">
                      <div className="h-24 bg-background rounded-lg border flex items-center justify-center hover:scale-105 transition-transform" style={{ boxShadow: shadow }}>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{shadow}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Buttons */}
            {components?.button && (
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>Button variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(buttonVariants).map(([variant, styles]) => (
                        <button key={variant} className="px-4 py-2 rounded-md font-medium capitalize" style={{ backgroundColor: styles.background, color: styles.color }}>
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Sizes</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {Object.entries(buttonSizes).map(([size, styles]) => (
                        <button key={size} className="rounded-md font-medium capitalize" style={{ backgroundColor: primaryButtonStyle.background, color: primaryButtonStyle.color, padding: styles.padding, fontSize: styles.fontSize, borderRadius: buttonBorderRadius }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cards */}
            {components?.card && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Component</CardTitle>
                  <CardDescription>Container component</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6" style={{ backgroundColor: components.card.background || '#ffffff', borderColor: components.card.border || '#e5e7eb', borderRadius: components.card.borderRadius || '0.5rem', boxShadow: components.card.shadow || '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ padding: components.card.header?.padding || '1.5rem 1.5rem 0' }}>
                      <h3 style={{ fontSize: components.card.title?.fontSize || '1.5rem', fontWeight: components.card.title?.fontWeight || '600' }}>Card Title</h3>
                    </div>
                    <p style={{ fontSize: components.card.description?.fontSize || '0.875rem', color: components.card.description?.color || '#6b7280' }}>
                      Sample card content with design system styles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inputs */}
            {components?.input && (
              <Card>
                <CardHeader>
                  <CardTitle>Input Component</CardTitle>
                  <CardDescription>Text input fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Default Input</label>
                      <input type="text" placeholder="Enter text..." className="w-full border rounded-md outline-none focus:ring-2" style={{ backgroundColor: components.input.background || '#ffffff', borderColor: components.input.border || '#d1d5db', borderRadius: components.input.borderRadius || '0.375rem', padding: components.input.padding || '0.5rem 0.75rem', fontSize: components.input.fontSize || '1rem', color: components.input.color || '#1f2937' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Generated Components with Visual Previews */}
            {components && Object.keys(components).length > 0 && (
              <Card className='overflow-auto'>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Generated Components</CardTitle>
                      <CardDescription>Visual preview of all components in this design system</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCanvasPreview(!canvasPreview)}
                      className="gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      {canvasPreview ? 'Exit Canvas' : 'Canvas Preview'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='overflow-auto'>
                  {canvasPreview ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b">
                        <div className="flex items-center gap-2">
                          <Button
                            variant={canvasDevice === 'desktop' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCanvasDevice('desktop')}
                          >
                            <Monitor className="h-4 w-4 mr-1" /> Desktop
                          </Button>
                          <Button
                            variant={canvasDevice === 'tablet' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCanvasDevice('tablet')}
                          >
                            <Tablet className="h-4 w-4 mr-1" /> Tablet
                          </Button>
                          <Button
                            variant={canvasDevice === 'mobile' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCanvasDevice('mobile')}
                          >
                            <Smartphone className="h-4 w-4 mr-1" /> Mobile
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {canvasDevice === 'desktop' ? 'Full width' : canvasDevice === 'tablet' ? '768px' : '375px'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => {
                              const container = document.getElementById('canvas-preview-container')
                              if (container) container.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                          >
                            ↑ Top
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => {
                              const container = document.getElementById('canvas-preview-container')
                              if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
                            }}
                          >
                            ↓ Bottom
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div 
                          className="border rounded-lg overflow-hidden bg-white shadow-lg"
                          style={{ 
                            width: canvasDevice === 'desktop' ? '100%' : canvasDevice === 'tablet' ? '768px' : '375px',
                            height: canvasDevice === 'mobile' ? '667px' : canvasDevice === 'tablet' ? '1024px' : '800px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="h-full overflow-auto">
                            {/* Canvas Header */}
                            <div className="h-8 bg-muted flex items-center justify-between px-3 border-b">
                              <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                              </div>
                              <div className="text-xs text-muted-foreground">preview.designsystem.com</div>
                              <div className="w-10" />
                            </div>
                            {/* Canvas Content */}
                            <div className="h-[calc(100%-32px)] flex flex-col">
                              {/* Navbar */}
                              {(components as any)?.navbar && renderNavbarPreview((components as any).navbar)}
                              
                              {/* Main Content */}
                              <div className="flex flex-1">
                                {/* Sidebar */}
                                {(components as any)?.sidebar && (
                                  <div className="hidden md:block">
                                    {renderSidebarPreview((components as any).sidebar)}
                                  </div>
                                )}
                                
                                {/* Content Area */}
                                <div className="flex-1 p-6 space-y-6 bg-gray-50">
                                  {/* Hero Card */}
                                  {(components as any)?.card && (
                                    <div className="max-w-2xl">
                                      {renderCardPreview((components as any).card)}
                                    </div>
                                  )}
                                  
                                  {/* Input and Button Section */}
                                  <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                                    {(components as any)?.input && (
                                      <div className="bg-white p-4 rounded-lg border">
                                        {renderInputPreview((components as any).input)}
                                      </div>
                                    )}
                                    {(components as any)?.button && (
                                      <div className="bg-white p-4 rounded-lg border flex flex-col justify-center">
                                        <p className="text-sm font-medium mb-3">Actions</p>
                                        <div className="flex flex-wrap gap-2">
                                          {Object.keys((components as any).button.variants || {}).slice(0, 3).map((variant: string) => (
                                            <button 
                                              key={variant}
                                              className="px-3 py-1.5 rounded-md text-sm"
                                              style={{ 
                                                backgroundColor: (components as any).button.variants?.[variant]?.background || primaryButtonStyle.background, 
                                                color: (components as any).button.variants?.[variant]?.color || primaryButtonStyle.color 
                                              }}
                                            >
                                              {variant}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Stats Grid */}
                                  {(components as any)?.stat && (
                                    <div className="grid grid-cols-3 gap-4 max-w-2xl">
                                      {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white p-4 rounded-lg border">
                                          <p className="text-sm" style={{ color: colors?.neutral?.[500] }}>Metric {i}</p>
                                          <p className="text-2xl font-bold" style={{ color: colors?.neutral?.[900] }}>{(i * 1234).toLocaleString()}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Badge Examples */}
                                  {(components as any)?.badge && (
                                    <div className="bg-white p-4 rounded-lg border max-w-2xl">
                                      <p className="text-sm font-medium mb-3">Status</p>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.keys((components as any).badge.variants || {}).map((variant: string) => (
                                          <span 
                                            key={variant}
                                            className="px-2 py-1 rounded text-xs font-medium"
                                            style={{ 
                                              backgroundColor: (components as any).badge.variants?.[variant]?.background,
                                              color: (components as any).badge.variants?.[variant]?.color
                                            }}
                                          >
                                            {variant}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(components).map(([componentName, componentStyles]) => (
                        <Card key={componentName} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base capitalize">{componentName}</CardTitle>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedComponent(componentName)
                                    setComponentJsonView(JSON.stringify(componentStyles, null, 2))
                                  }}
                                >
                                  <Code className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription className="text-xs">
                              {getComponentDescription(componentName)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="border rounded-lg p-4 bg-white min-h-[120px] flex items-center justify-center">
                              {getComponentPreview(componentName, componentStyles)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          {/* <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>UI/UX Design Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {currentDesignSystem.designPreferences ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(currentDesignSystem.designPreferences).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant="secondary">{String(value)}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No design preferences specified.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Selected Components Tab */}
          <TabsContent value="selected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected Components</CardTitle>
              </CardHeader>
              <CardContent>
                {currentDesignSystem.selectedComponents && currentDesignSystem.selectedComponents.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentDesignSystem.selectedComponents.map((component) => (
                      <Badge key={component} variant="outline" className="text-sm py-1.5 px-3">{component}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No specific components were selected.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Design Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                {currentDesignSystem.customTokens ? (
                  <div className="space-y-4">
                    {(currentDesignSystem.customTokens.primaryColor || currentDesignSystem.customTokens.secondaryColor || currentDesignSystem.customTokens.accentColor) && (
                      <div className="flex flex-wrap gap-4">
                        {currentDesignSystem.customTokens.primaryColor && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded border" style={{ backgroundColor: currentDesignSystem.customTokens.primaryColor }} />
                            <span className="text-sm">Primary: {currentDesignSystem.customTokens.primaryColor}</span>
                          </div>
                        )}
                        {currentDesignSystem.customTokens.secondaryColor && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded border" style={{ backgroundColor: currentDesignSystem.customTokens.secondaryColor }} />
                            <span className="text-sm">Secondary: {currentDesignSystem.customTokens.secondaryColor}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No custom tokens specified.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Component JSON Tab - All 48 Components with JSON and Visual Previews */}
          <TabsContent value="component-json" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Braces className="h-5 w-5" />
                      All Components with JSON & Previews
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">46 components with their JSON configuration and visual design previews</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto flex-shrink-0"
                    onClick={() => {
                      const allComponentsJson = JSON.stringify(components, null, 2)
                      navigator.clipboard.writeText(allComponentsJson)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Copy All JSON</span>
                    <span className="sm:hidden">Copy All</span>
                  </Button>
                </div>
                {/* Quick Navigation */}
                <div className="mt-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Jump to:</span>
                    <select 
                      className="text-sm border rounded-md px-2 py-1.5 bg-background max-w-[200px]"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          scrollToComponent(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="">Select component...</option>
                      {ALL_COMPONENTS.map((comp) => {
                        const compStyles = getComponentStyles(comp.id)
                        const hasStyles = compStyles && Object.keys(compStyles).length > 0
                        return (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} {hasStyles ? '✓' : '✗'}
                          </option>
                        )
                      })}
                    </select>
                    <span className="text-[10px] text-muted-foreground hidden md:inline">(or press /)</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => scrollToNextComponent('up')}
                      title="Previous component (Shift+Up)"
                    >
                      ← Prev
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => scrollToNextComponent('down')}
                      title="Next component (Shift+Down)"
                    >
                      Next →
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      ↑ Top
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => listContainerRef.current?.scrollTo({ top: listContainerRef.current.scrollHeight, behavior: 'smooth' })}
                    >
                      ↓ Bottom
                    </Button>
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-auto hidden lg:inline">
                    ⌨️ Shift+↑/↓ to navigate
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4" ref={listContainerRef}>
                {ALL_COMPONENTS.map((component) => {
                  const componentStyles = getComponentStyles(component.id)
                  const hasStyles = componentStyles && Object.keys(componentStyles).length > 0
                  
                  return (
                    <div 
                      key={component.id} 
                      ref={(el) => { componentRefs.current[component.id] = el }}
                      className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                        activeComponent === component.id 
                          ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.01]' 
                          : ''
                      }`}
                    >
                      {/* Component Header - Responsive */}
                      <div className="bg-muted px-3 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs hidden sm:inline-flex">{component.category}</Badge>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Code className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium text-sm">{component.name}</span>
                          </div>
                          {!hasStyles && <Badge variant="destructive" className="text-xs">Not Generated</Badge>}
                          {hasStyles && <Badge variant="default" className="text-xs bg-green-500">Generated</Badge>}
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          {hasStyles && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                                onClick={() => {
                                  setSelectedComponent(component.name)
                                  setComponentJsonView(JSON.stringify(componentStyles, null, 2))
                                }}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">View JSON</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                                onClick={() => handleCopyWithScroll(component.id, componentStyles)}
                              >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Copy</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Visual Preview - Responsive */}
                      <div className="p-3 sm:p-4 bg-white border-b overflow-x-auto">
                        <p className="text-xs text-muted-foreground mb-2 hidden sm:block">Visual Preview:</p>
                        <div className="min-h-[60px] sm:min-h-[80px] border rounded-lg p-2 sm:p-4 flex items-center justify-center bg-gray-50">
                          {hasStyles ? getComponentPreview(component.id, componentStyles) : (
                            <div className="text-center py-2">
                              <p className="text-xs sm:text-sm text-muted-foreground">Component not generated</p>
                              <p className="text-xs text-muted-foreground mt-1">Add this component to your design to see preview</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* JSON Configuration - With Copy Button */}
                      {hasStyles ? (
                        <div className="bg-background">
                          <div className="flex items-center justify-between px-3 sm:px-4 pt-3">
                            <p className="text-xs text-muted-foreground hidden sm:block">JSON Configuration:</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleCopyWithScroll(component.id, componentStyles)}
                            >
                              {copiedComponent === component.id ? (
                                <>
                                  <Check className="h-3 w-3 mr-1 text-green-500" />
                                  <span className="text-green-500">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy JSON
                                </>
                              )}
                            </Button>
                          </div>
                          <ScrollArea className="h-[120px] sm:h-[200px]">
                            <pre className="text-xs p-2 sm:p-4 overflow-x-auto">
{JSON.stringify(componentStyles, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      ) : (
                        <div className="p-3 sm:p-4 bg-muted/30">
                          <pre className="text-xs text-muted-foreground">{"// No configuration - component not selected or generated"}</pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Full Design System JSON Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Complete Design System JSON
                </CardTitle>
                <CardDescription>Full design system including colors, typography, spacing, and all components</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs p-4 bg-muted rounded-lg">
{JSON.stringify({
  name: currentDesignSystem.name,
  description: currentDesignSystem.description,
  colors: colors,
  typography: typography,
  spacing: spacing,
  borderRadius: borderRadius,
  shadows: shadows,
  components: components,
  designPreferences: currentDesignSystem.designPreferences,
  customTokens: currentDesignSystem.customTokens,
  selectedComponents: currentDesignSystem.selectedComponents
}, null, 2)}
                  </pre>
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const fullJson = JSON.stringify({
                        name: currentDesignSystem.name,
                        description: currentDesignSystem.description,
                        colors: colors,
                        typography: typography,
                        spacing: spacing,
                        borderRadius: borderRadius,
                        shadows: shadows,
                        components: components,
                        designPreferences: currentDesignSystem.designPreferences,
                        customTokens: currentDesignSystem.customTokens,
                        selectedComponents: currentDesignSystem.selectedComponents
                      }, null, 2)
                      navigator.clipboard.writeText(fullJson)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Full JSON
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const fullJson = JSON.stringify({
                        name: currentDesignSystem.name,
                        description: currentDesignSystem.description,
                        colors: colors,
                        typography: typography,
                        spacing: spacing,
                        borderRadius: borderRadius,
                        shadows: shadows,
                        components: components,
                        designPreferences: currentDesignSystem.designPreferences,
                        customTokens: currentDesignSystem.customTokens,
                        selectedComponents: currentDesignSystem.selectedComponents
                      }, null, 2)
                      const blob = new Blob([fullJson], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `${currentDesignSystem.name.replace(/\s+/g, '-').toLowerCase()}-design-system.json`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Component JSON View Dialog - Responsive */}
        <Dialog open={!!componentJsonView} onOpenChange={() => setComponentJsonView(null)}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] sm:max-w-3xl overflow-auto flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Code className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{selectedComponent}</span> 
                <span className="text-muted-foreground font-normal">JSON</span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 min-h-[200px] max-h-[50vh] sm:max-h-[500px]">
              <pre className="text-xs sm:text-sm bg-muted p-3 sm:p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all">
                {componentJsonView}
              </pre>
            </ScrollArea>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => componentJsonView && navigator.clipboard.writeText(componentJsonView)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setComponentJsonView(null)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
