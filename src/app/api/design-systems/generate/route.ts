import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getGeminiAI } from '@/lib/gemini'
import { randomBytes } from 'crypto'
import { auth, currentUser } from '@clerk/nextjs/server'

interface DesignSystemData {
  colors: {
    primary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    secondary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    accent: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    neutral: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string }
    success: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string }
    warning: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string }
    error: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string }
  }
  typography: {
    fontFamily: { sans: string[]; serif: string[]; mono: string[] }
    fontSize: { xs: string; sm: string; base: string; lg: string; xl: string; '2xl': string; '3xl': string; '4xl': string; '5xl': string; '6xl': string }
    fontWeight: { thin: string; extralight: string; light: string; normal: string; medium: string; semibold: string; bold: string; extrabold: string; black: string }
    lineHeight: { none: string; tight: string; snug: string; normal: string; relaxed: string; loose: string }
    letterSpacing: { tighter: string; tight: string; normal: string; wide: string; wider: string; widest: string }
  }
  spacing: { scale: number; values: { 0: string; 1: string; 2: string; 3: string; 4: string; 5: string; 6: string; 8: string; 10: string; 12: string; 16: string; 20: string; 24: string; 32: string; 40: string; 48: string; 56: string; 64: string; 72: string; 80: string; 96: string } }
  borderRadius: { sm: string; md: string; lg: string; xl: string; '2xl': string; full: string }
  shadows: { sm: string; md: string; lg: string; xl: string; '2xl': string; inner: string }
  icons: { library: string; style: string; sizes: { sm: string; md: string; lg: string; xl: string }; strokeWidth: string }
  components: Record<string, any>
}

const SYSTEM_PROMPT = `You are an expert UI/UX designer and design system specialist. Generate a complete design system with ALL components listed below.

CRITICAL: ALL colors must be valid hex codes. Generate full color scales. Ensure WCAG AA compliance.

Generate a complete design system with this structure (include ALL components):
{
  "colors": { "primary": {"50":"#hex",...}, "secondary": {...}, "accent": {...}, "neutral": {...}, "success": {...}, "warning": {...}, "error": {...} },
  "typography": { "fontFamily": {"sans":["Inter","system-ui"],"serif":[],"mono":[]}, "fontSize": {...}, "fontWeight": {...}, "lineHeight": {...}, "letterSpacing": {...} },
  "spacing": {"scale":8,"values":{...}},
  "borderRadius": {"sm":"value","md":"value","lg":"value","xl":"value","2xl":"value","full":"value"},
  "shadows": {"sm":"value","md":"value","lg":"value","xl":"value","2xl":"value","inner":"value"},
  "icons": {"library":"Lucide","style":"outline","sizes":{"sm":"16px","md":"24px","lg":"32px","xl":"48px"},"strokeWidth":"2px"},
  "components": {
    "button": {"variants": {...}, "sizes": {...}, "borderRadius": "value"},
    "input": {...},
    "card": {...},
    "modal": {...},
    "checkbox": {...},
    "radio": {...},
    "toggle": {...},
    "badge": {...},
    "avatar": {...},
    "link": {...},
    "alert": {...},
    "tooltip": {...},
    "loader": {...},
    "progress": {...},
    "toast": {...},
    "popover": {...},
    "dropdown": {...},
    "menu": {...},
    "navbar": {...},
    "sidebar": {...},
    "tabs": {...},
    "breadcrumb": {...},
    "pagination": {...},
    "accordion": {...},
    "table": {...},
    "list": {...},
    "avatarGroup": {...},
    "stat": {...},
    "chart": {...},
    "timeline": {...},
    "form": {...},
    "textarea": {...},
    "select": {...},
    "datepicker": {...},
    "slider": {...},
    "fileupload": {...},
    "multiselect": {...},
    "grid": {...},
    "container": {...},
    "divider": {...},
    "aspectRatio": {...},
    "carousel": {...},
    "emptystate": {...}
  }
}

Industry: Fintech (professional blues), E-commerce (warm colors), Healthtech (calming greens), Edtech (playful), SaaS (modern), Consumer (vibrant), Enterprise (conservative), Agency (bold).

Generate ONLY valid JSON with ALL components above in FIGMA-COMPATIBLE format. Include these properties for each component:
- colors (all hex values)
- typography (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing)
- spacing (padding, margin, gap)
- borders (borderWidth, borderStyle, borderColor, borderRadius)
- effects (boxShadow, opacity, backdropBlur)
- layout (width, height, minWidth, maxWidth, minHeight, maxHeight)
- states (default, hover, active, focus, disabled, pressed)
- children (for nested components)

Include these 46 components: button, input, card, typography, colors, spacing, elevation, borders, icons, checkbox, toggle, badge, avatar, link, alert, modal, tooltip, loader, toast, popover, menu, breadcrumb, tab, pagination, accordion, navbar, sidebar, table, list, stat, chart, timeline, tree, form, textarea, select, datepicker, slider, fileupload, multiselect, grid, container, divider, aspectratio, carousel, emptystate.

Return ONLY valid JSON. Include complete Figma-style design tokens for each component with all visual properties.`

// Helper function to create a fallback design system with ALL components in Figma-compatible format
function createFallbackDesignSystem(): DesignSystemData {
  const primary = { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' }
  const secondary = { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' }
  const accent = { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' }
  const neutral = { 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' }
  const success = { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }
  const warning = { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12' }
  const error = { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' }
  
  // Define borderRadius and shadows before using them in components
  const borderRadius = { sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px' }
  const shadows = { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)', inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' }

  return {
    colors: { primary, secondary, accent, neutral, success, warning, error },
    typography: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], serif: ['Georgia', 'serif'], mono: ['Fira Code', 'monospace'] },
      fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem' },
      fontWeight: { thin: '100', extralight: '200', light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900' },
      lineHeight: { none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' },
      letterSpacing: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' }
    },
    spacing: { scale: 8, values: { 0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem', 32: '8rem', 40: '10rem', 48: '12rem', 56: '14rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem' } },
    borderRadius: { sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px' },
    shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)', inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
    icons: { library: 'Lucide', style: 'outline', sizes: { sm: '16px', md: '24px', lg: '32px', xl: '48px' }, strokeWidth: '2px' },
    components: {
      button: {
        description: 'Interactive button component with multiple variants',
        figmaCompatible: true,
        type: 'component',
        variants: {
          primary: {
            background: { color: primary[500], type: 'solid' },
            foreground: { color: '#ffffff' },
            border: { width: '0px', style: 'none', color: 'transparent' },
            radius: { value: borderRadius.md, type: 'radius' },
            typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', lineHeight: '20px' },
            padding: { left: '16px', right: '16px', top: '8px', bottom: '8px' },
            layout: { width: 'auto', height: '36px', minWidth: '64px' },
            effects: { boxShadow: 'none' },
            states: {
              default: { opacity: 1 },
              hover: { background: { color: primary[600] }, cursor: 'pointer' },
              pressed: { background: { color: primary[700] } },
              disabled: { opacity: 0.5, cursor: 'not-allowed' },
              focus: { outline: { color: primary[300], width: '2px', offset: '2px' } }
            }
          },
          secondary: {
            background: { color: neutral[600] },
            foreground: { color: '#ffffff' },
            border: { width: '0px', style: 'none', color: 'transparent' },
            radius: { value: borderRadius.md, type: 'radius' },
            typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', lineHeight: '20px' },
            padding: { left: '16px', right: '16px', top: '8px', bottom: '8px' },
            layout: { width: 'auto', height: '36px' },
            states: {
              hover: { background: { color: neutral[500] } },
              disabled: { opacity: 0.5 }
            }
          },
          outline: {
            background: { color: 'transparent' },
            foreground: { color: primary[500] },
            border: { width: '1.5px', style: 'solid', color: primary[500] },
            radius: { value: borderRadius.md, type: 'radius' },
            typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px' },
            padding: { left: '16px', right: '16px', top: '8px', bottom: '8px' },
            states: {
              hover: { background: { color: primary[50] } },
              active: { background: { color: primary[100] } }
            }
          },
          ghost: {
            background: { color: 'transparent' },
            foreground: { color: neutral[700] },
            border: { width: '0px', style: 'none', color: 'transparent' },
            radius: { value: borderRadius.md, type: 'radius' },
            typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px' },
            padding: { left: '12px', right: '12px', top: '8px', bottom: '8px' },
            states: {
              hover: { background: { color: neutral[100] } },
              active: { background: { color: neutral[200] } }
            }
          },
          destructive: {
            background: { color: error[500] },
            foreground: { color: '#ffffff' },
            border: { width: '0px', style: 'none', color: 'transparent' },
            radius: { value: borderRadius.md, type: 'radius' },
            typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px' },
            padding: { left: '16px', right: '16px', top: '8px', bottom: '8px' },
            states: {
              hover: { background: { color: error[600] } },
              disabled: { opacity: 0.5 }
            }
          },
          link: {
            background: { color: 'transparent' },
            foreground: { color: primary[500] },
            border: { width: '0px', style: 'none', color: 'transparent' },
            typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', textDecoration: 'underline' },
            padding: { left: '0px', right: '0px', top: '0px', bottom: '0px' },
            states: {
              hover: { foreground: { color: primary[600] } },
              visited: { foreground: { color: primary[700] } }
            }
          }
        },
        sizes: {
          sm: { layout: { height: '32px', padding: '6px 12px' }, typography: { fontSize: '13px' } },
          md: { layout: { height: '40px', padding: '8px 16px' }, typography: { fontSize: '14px' } },
          lg: { layout: { height: '48px', padding: '12px 24px' }, typography: { fontSize: '16px' } },
          xl: { layout: { height: '56px', padding: '16px 32px' }, typography: { fontSize: '18px' } },
          icon: { layout: { width: '40px', height: '40px', padding: '8px' } }
        }
      },
      input: {
        description: 'Text input field component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1.5px', style: 'solid', color: neutral[300], radius: { value: borderRadius.md, type: 'radius' } },
        typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '16px', lineHeight: '24px', color: neutral[900], placeholder: { color: neutral[400] } },
        layout: { width: '100%', height: '40px', padding: '8px 12px' },
        states: {
          default: { border: { color: neutral[300] } },
          focus: { border: { color: primary[500] }, effects: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' } },
          error: { border: { color: error[500] }, foreground: { color: error[500] } },
          disabled: { background: { color: neutral[100] }, foreground: { color: neutral[400] }, cursor: 'not-allowed' },
          hover: { border: { color: neutral[400] } }
        }
      },
      card: {
        description: 'Card container component',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        typography: {
          title: { fontFamily: 'Inter', fontWeight: '600', fontSize: '24px', lineHeight: '32px', color: neutral[900] },
          description: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', lineHeight: '20px', color: neutral[500] }
        },
        layout: { width: '100%', maxWidth: '384px', padding: '24px' },
        effects: { boxShadow: shadows.md },
        sections: {
          header: { layout: { padding: '0 0 16px 0' } },
          body: { layout: { padding: '0' } },
          footer: { layout: { padding: '16px 0 0 0' }, border: { width: '1px 0 0 0', style: 'solid', color: neutral[200] } }
        }
      },
      modal: {
        description: 'Modal dialog overlay',
        figmaCompatible: true,
        type: 'overlay',
        overlay: { background: { color: 'rgba(0, 0, 0, 0.5)' }, effects: { backdropBlur: '4px' } },
        container: {
          background: { color: '#ffffff' },
          border: { width: '0px', style: 'none', color: 'transparent', radius: { value: borderRadius.lg, type: 'radius' } },
          layout: { width: '100%', maxWidth: '512px', padding: '24px' },
          effects: { boxShadow: shadows.xl }
        },
        sections: {
          header: { typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', color: neutral[900] }, layout: { padding: '0 0 16px 0' } },
          body: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '16px', lineHeight: '24px', color: neutral[600] }, layout: { padding: '0 0 24px 0' } },
          footer: { layout: { padding: '0', gap: '12px', direction: 'row', justifyContent: 'flex-end' } }
        }
      },
      checkbox: {
        description: 'Checkbox selection control',
        figmaCompatible: true,
        type: 'component',
        layout: { width: '18px', height: '18px', gap: '8px' },
        border: { width: '2px', style: 'solid', color: neutral[400], radius: { value: '4px', type: 'radius' } },
        background: { color: 'transparent' },
        typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] },
        states: {
          unchecked: { background: { color: 'transparent' }, border: { color: neutral[400] } },
          checked: { background: { color: primary[500] }, border: { color: primary[500] }, icon: { color: '#ffffff', checkmark: true } },
          indeterminate: { background: { color: primary[500] }, border: { color: primary[500] } },
          focus: { effects: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' } },
          disabled: { opacity: 0.5, cursor: 'not-allowed' }
        }
      },
      toggle: {
        description: 'Toggle switch control',
        figmaCompatible: true,
        type: 'component',
        layout: { width: '44px', height: '24px', padding: '2px' },
        thumb: { layout: { width: '20px', height: '20px' }, background: { color: '#ffffff' }, effects: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } },
        track: {
          off: { background: { color: neutral[200] } },
          on: { background: { color: primary[500] } }
        },
        states: {
          off: { thumb: { position: 'left' } },
          on: { thumb: { position: 'right' } },
          disabled: { opacity: 0.5 }
        }
      },
      badge: {
        description: 'Status badge component',
        figmaCompatible: true,
        type: 'component',
        layout: { padding: '2px 8px', borderRadius: { value: '4px', type: 'radius' }, gap: '4px' },
        typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '12px' },
        variants: {
          default: { background: { color: primary[100] }, foreground: { color: primary[800] } },
          primary: { background: { color: primary[500] }, foreground: { color: '#ffffff' } },
          secondary: { background: { color: neutral[100] }, foreground: { color: neutral[800] } },
          success: { background: { color: success[100] }, foreground: { color: success[800] } },
          warning: { background: { color: warning[100] }, foreground: { color: warning[800] } },
          error: { background: { color: error[100] }, foreground: { color: error[800] } },
          outline: { background: { color: 'transparent' }, border: { width: '1px', style: 'solid', color: neutral[300] }, foreground: { color: neutral[700] } }
        }
      },
      avatar: {
        description: 'User avatar component',
        figmaCompatible: true,
        type: 'component',
        layout: { borderRadius: { value: '50%', type: 'circle' }, overflow: 'hidden' },
        sizes: {
          xs: { layout: { width: '24px', height: '24px' }, typography: { fontSize: '10px' } },
          sm: { layout: { width: '32px', height: '32px' }, typography: { fontSize: '12px' } },
          md: { layout: { width: '40px', height: '40px' }, typography: { fontSize: '14px' } },
          lg: { layout: { width: '48px', height: '48px' }, typography: { fontSize: '16px' } },
          xl: { layout: { width: '64px', height: '64px' }, typography: { fontSize: '20px' } }
        },
        fallback: { background: { color: primary[100] }, foreground: { color: primary[600] }, typography: { fontWeight: '600' } },
        placeholder: { background: { color: neutral[200] } },
        group: { overlap: '-8px', ring: { color: '#ffffff', width: '2px' } }
      },
      alert: {
        description: 'Alert notification component',
        figmaCompatible: true,
        type: 'component',
        layout: { padding: '16px', gap: '12px', borderRadius: { value: borderRadius.lg, type: 'radius' }, direction: 'row' },
        border: { width: '1px', style: 'solid' },
        typography: {
          title: { fontFamily: 'Inter', fontWeight: '600', fontSize: '16px' },
          description: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', lineHeight: '20px' }
        },
        icon: { layout: { width: '20px', height: '20px', flexShrink: 0 } },
        variants: {
          default: { background: { color: primary[50] }, border: { color: primary[200] }, iconColor: primary[500] },
          primary: { background: { color: primary[50] }, border: { color: primary[200] }, iconColor: primary[500] },
          success: { background: { color: success[50] }, border: { color: success[200] }, iconColor: success[500] },
          warning: { background: { color: warning[50] }, border: { color: warning[200] }, iconColor: warning[500] },
          error: { background: { color: error[50] }, border: { color: error[200] }, iconColor: error[500] },
          info: { background: { color: '#e0f2fe' }, border: { color: '#bae6fd' }, iconColor: '#0284c7' }
        }
      },
      tooltip: {
        description: 'Tooltip hover information',
        figmaCompatible: true,
        type: 'overlay',
        background: { color: neutral[800] },
        border: { width: '0px', style: 'none', color: 'transparent', radius: { value: borderRadius.md, type: 'radius' } },
        layout: { padding: '8px 12px', maxWidth: '200px' },
        typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '12px', color: '#ffffff' },
        effects: { boxShadow: shadows.lg },
        arrow: { size: '8px', color: neutral[800] }
      },
      navbar: {
        description: 'Top navigation bar',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] },
        layout: { width: '100%', height: '64px', padding: '0 16px' },
        sections: {
          logo: { layout: { height: '32px', gap: '12px' } },
          menu: { layout: { gap: '32px', direction: 'row', display: 'flex' }, typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: neutral[600] } },
          actions: { layout: { gap: '12px', direction: 'row' } }
        },
        responsive: { mobile: { menuButton: { display: 'block' } }, desktop: { menuButton: { display: 'none' } } }
      },
      sidebar: {
        description: 'Side navigation panel',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '0 1px 0 0', style: 'solid', color: neutral[200] },
        layout: { width: '256px', height: '100%', padding: '16px' },
        collapsed: { layout: { width: '64px' } },
        item: {
          layout: { padding: '12px 16px', gap: '12px', borderRadius: { value: borderRadius.md, type: 'radius' } },
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: neutral[600] },
          icon: { layout: { width: '20px', height: '20px' }, color: neutral[500] },
          states: {
            default: { background: { color: 'transparent' } },
            hover: { background: { color: neutral[100] } },
            active: { background: { color: primary[50] }, foreground: { color: primary[700] } }
          }
        },
        separator: { layout: { margin: '8px 0' }, border: { width: '1px 0 0 0', style: 'solid', color: neutral[200] } }
      },
      tabs: {
        description: 'Tabbed navigation component',
        figmaCompatible: true,
        type: 'component',
        layout: { direction: 'row', border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] } },
        tab: {
          layout: { padding: '12px 16px', gap: '8px' },
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px' },
          states: {
            default: { color: neutral[600], border: { width: '0 0 2px 0', style: 'solid', color: 'transparent' } },
            hover: { color: neutral[900] },
            active: { color: primary[600], border: { width: '0 0 2px 0', style: 'solid', color: primary[600] } }
          }
        },
        content: { layout: { padding: '16px 0' }, typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', lineHeight: '20px', color: neutral[600] } },
        variants: {
          default: { background: 'transparent' },
          pills: { background: { color: neutral[100] }, border: { width: '0px', style: 'none', color: 'transparent' }, tab: { borderRadius: { value: borderRadius.md, type: 'radius' } } },
          outline: { background: 'transparent', border: { width: '1px', style: 'solid', color: neutral[200] } }
        }
      },
      table: {
        description: 'Data table component',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { width: '100%', borderCollapse: 'collapse' },
        header: {
          background: { color: neutral[50] },
          typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: neutral[700], textAlign: 'left' },
          layout: { padding: '12px 16px' },
          border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] }
        },
        cell: {
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] },
          layout: { padding: '12px 16px' },
          border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] }
        },
        row: {
          states: {
            default: { background: { color: '#ffffff' } },
            hover: { background: { color: neutral[50] } },
            striped: { background: { color: neutral[50] } }
          }
        }
      },
      form: {
        description: 'Form layout component',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '0px', style: 'none', color: 'transparent', radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { padding: '24px', gap: '16px', direction: 'column' },
        field: {
          layout: { gap: '6px', direction: 'column' },
          label: { typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: neutral[700] } },
          helper: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '12px', color: neutral[500] } },
          error: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '12px', color: error[500] } }
        }
      },
      select: {
        description: 'Dropdown select component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1.5px', style: 'solid', color: neutral[300], radius: { value: borderRadius.md, type: 'radius' } },
        layout: { width: '100%', height: '40px', padding: '8px 32px 8px 12px' },
        typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '16px', color: neutral[900], placeholder: { color: neutral[400] } },
        icon: { layout: { width: '16px', height: '16px', position: { right: '12px' } }, color: neutral[500] },
        dropdown: {
          background: { color: '#ffffff' },
          border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.md, type: 'radius' } },
          effects: { boxShadow: shadows.lg },
          layout: { padding: '4px', maxHeight: '200px' },
          option: {
            layout: { padding: '8px 12px' },
            typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] },
            states: {
              default: { background: { color: 'transparent' } },
              hover: { background: { color: neutral[50] } },
              selected: { background: { color: primary[50] }, foreground: { color: primary[700] } }
            }
          }
        }
      },
      slider: {
        description: 'Range slider component',
        figmaCompatible: true,
        type: 'component',
        layout: { width: '100%', height: '20px', gap: '8px', direction: 'column' },
        track: {
          layout: { height: '4px', borderRadius: { value: '9999px', type: 'circle' } },
          background: { color: neutral[200] },
          fill: { background: { color: primary[500] } }
        },
        thumb: {
          layout: { width: '16px', height: '16px' },
          background: { color: '#ffffff' },
          border: { width: '2px', style: 'solid', color: primary[500] },
          effects: { boxShadow: shadows.sm },
          states: {
            default: { cursor: 'grab' },
            hover: { effects: { transform: 'scale(1.1)' } },
            focus: { effects: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' } },
            disabled: { opacity: 0.5, cursor: 'not-allowed' }
          }
        }
      },
      pagination: {
        description: 'Pagination navigation',
        figmaCompatible: true,
        type: 'component',
        layout: { gap: '4px', direction: 'row' },
        button: {
          layout: { width: 'auto', height: 'auto', minWidth: '32px', padding: '6px 10px' },
          background: { color: '#ffffff' },
          border: { width: '1px', style: 'solid', color: neutral[300], radius: { value: borderRadius.md, type: 'radius' } },
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: neutral[700] },
          states: {
            default: { background: { color: '#ffffff' } },
            hover: { background: { color: neutral[50] } },
            active: { background: { color: primary[500] }, foreground: { color: '#ffffff' }, border: { color: primary[500] } },
            disabled: { opacity: 0.5, cursor: 'not-allowed' }
          }
        },
        sizes: { sm: { button: { layout: { height: '32px' } } }, md: { button: { layout: { height: '40px' } } }, lg: { button: { layout: { height: '48px' } } } }
      },
      stat: {
        description: 'Statistics display component',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { padding: '24px', gap: '8px' },
        label: { typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: neutral[500] } },
        value: { typography: { fontFamily: 'Inter', fontWeight: '700', fontSize: '32px', lineHeight: '40px', color: neutral[900] } },
        change: {
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px' },
          positive: { color: success[500] },
          negative: { color: error[500] },
          icon: { up: 'arrow-up', down: 'arrow-down' }
        }
      },
      divider: {
        description: 'Divider/separator component',
        figmaCompatible: true,
        type: 'component',
        layout: { width: '100%', height: 'auto', padding: '16px 0' },
        border: { width: '1px', style: 'solid', color: neutral[200] },
        variants: {
          solid: { border: { width: '1px', style: 'solid', color: neutral[200] } },
          dashed: { border: { width: '1px', style: 'dashed', color: neutral[200] } },
          dotted: { border: { width: '1px', style: 'dotted', color: neutral[200] } }
        }
      },
      grid: {
        description: 'Grid layout system',
        figmaCompatible: true,
        type: 'layout',
        columns: 12,
        gutter: { sm: '16px', md: '24px', lg: '32px' },
        margin: { sm: '16px', md: '32px', lg: '48px' },
        container: { maxWidth: '1280px', padding: '0 16px' },
        responsive: { mobile: { columns: 4 }, tablet: { columns: 8 }, desktop: { columns: 12 } }
      },
      carousel: {
        description: 'Carousel/slider component',
        figmaCompatible: true,
        type: 'container',
        background: { color: neutral[100] },
        border: { width: '0px', style: 'none', color: 'transparent', radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { width: '100%', aspectRatio: '16/9' },
        slide: { layout: { padding: '16px' }, content: { align: 'center', justify: 'center' } },
        arrow: {
          layout: { width: '40px', height: '40px' },
          background: { color: '#ffffff' },
          border: { width: '0px', style: 'none', color: 'transparent', radius: { value: '50%', type: 'circle' } },
          icon: { color: neutral[700] },
          effects: { boxShadow: shadows.md },
          states: { hover: { background: { color: neutral[50] } } }
        },
        indicator: {
          layout: { gap: '4px' },
          dot: { layout: { width: '8px', height: '8px' } },
          inactive: { background: { color: neutral[300] } },
          active: { background: { color: primary[500] } }
        }
      },
      emptystate: {
        description: 'Empty state component',
        figmaCompatible: true,
        type: 'container',
        background: { color: 'transparent' },
        layout: { padding: '48px', gap: '16px', direction: 'column', align: 'center', justify: 'center' },
        icon: { layout: { width: '64px', height: '64px' }, color: neutral[400] },
        title: { typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', color: neutral[900] } },
        description: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[500], maxWidth: '400px', textAlign: 'center' } },
        action: { layout: { marginTop: '24px' } }
      },
      accordion: {
        description: 'Accordion/expandable component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        item: {
          layout: { padding: '16px' },
          border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] },
          last: { border: { width: '0px', style: 'none', color: 'transparent' } }
        },
        trigger: {
          layout: { gap: '12px', justifyContent: 'space-between' },
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '16px', color: neutral[900] },
          icon: { color: neutral[500], expanded: { transform: 'rotate(180deg)' } }
        },
        content: {
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', lineHeight: '20px', color: neutral[600] },
          layout: { padding: '16px', gap: '8px' }
        }
      },
      breadcrumb: {
        description: 'Breadcrumb navigation',
        figmaCompatible: true,
        type: 'component',
        layout: { gap: '8px', direction: 'row' },
        separator: { typography: { color: neutral[400] }, layout: { margin: '0 4px' } },
        link: {
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px' },
          states: {
            default: { color: primary[500] },
            hover: { color: primary[600], textDecoration: 'underline' },
            current: { color: neutral[600], cursor: 'default' }
          }
        }
      },
      toast: {
        description: 'Toast notification component',
        figmaCompatible: true,
        type: 'overlay',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { padding: '16px', gap: '12px', direction: 'row', align: 'flex-start' },
        effects: { boxShadow: shadows.lg },
        title: { typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: neutral[900] } },
        description: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[600] } },
        icon: { layout: { width: '20px', height: '20px', flexShrink: 0 } },
        action: { typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px' } },
        close: { layout: { width: '20px', height: '20px' }, color: neutral[500], states: { hover: { color: neutral[700] } } },
        variants: {
          default: { background: { color: '#ffffff' }, border: { color: neutral[200] } },
          success: { iconColor: success[500], border: { color: success[200] } },
          warning: { iconColor: warning[500], border: { color: warning[200] } },
          error: { iconColor: error[500], border: { color: error[200] } },
          info: { iconColor: '#0284c7', border: { color: '#bae6fd' } }
        }
      },
      popover: {
        description: 'Popover component',
        figmaCompatible: true,
        type: 'overlay',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { padding: '8px', gap: '4px' },
        effects: { boxShadow: shadows.lg },
        arrow: { size: '8px', color: '#ffffff' },
        content: { layout: { padding: '8px' } },
        header: {
          layout: { padding: '8px', border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] } },
          typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: neutral[900] }
        },
        footer: {
          layout: { padding: '8px', border: { width: '1px 0 0 0', style: 'solid', color: neutral[200] } }
        }
      },
      menu: {
        description: 'Menu/dropdown component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        effects: { boxShadow: shadows.lg },
        layout: { padding: '4px', gap: '2px' },
        item: {
          layout: { padding: '8px 12px', gap: '12px', borderRadius: { value: borderRadius.md, type: 'radius' } },
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] },
          icon: { layout: { width: '16px', height: '16px' }, color: neutral[500] },
          states: {
            default: { background: { color: 'transparent' } },
            hover: { background: { color: neutral[100] } },
            active: { background: { color: primary[50] }, foreground: { color: primary[700] } }
          }
        },
        separator: { layout: { margin: '4px 0' }, border: { width: '1px 0 0 0', style: 'solid', color: neutral[200] } }
      },
      list: {
        description: 'List component',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        item: {
          layout: { padding: '12px 16px', gap: '12px', border: { width: '0 0 1px 0', style: 'solid', color: neutral[200] }, last: { border: { width: '0px', style: 'none', color: 'transparent' } } },
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] },
          icon: { layout: { width: '16px', height: '16px' }, color: neutral[500], margin: { right: '12px' } },
          states: {
            default: { background: { color: '#ffffff' } },
            hover: { background: { color: neutral[50] } }
          }
        }
      },
      chart: {
        description: 'Chart visualization component',
        figmaCompatible: true,
        type: 'visualization',
        colors: [primary[500], success[500], warning[500], error[500], '#8b5cf6', '#ec4899'],
        background: { color: '#ffffff' },
        grid: { color: neutral[200], layout: { display: true, lines: 'horizontal' } },
        axis: {
          label: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '12px', color: neutral[500] } },
          line: { border: { width: '1px', style: 'solid', color: neutral[200] } }
        },
        tooltip: {
          background: { color: neutral[800] },
          border: { width: '0px', style: 'none', color: 'transparent', radius: { value: borderRadius.md, type: 'radius' } },
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '12px', color: '#ffffff' },
          effects: { boxShadow: shadows.lg }
        },
        legend: { position: 'top', typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '12px', color: neutral[600] }, layout: { gap: '16px', direction: 'row' } }
      },
      timeline: {
        description: 'Timeline component',
        figmaCompatible: true,
        type: 'container',
        layout: { gap: '24px', direction: 'column' },
        line: { layout: { width: '2px', position: 'left', margin: { left: '5px' } }, background: { color: neutral[300] } },
        dot: {
          layout: { width: '12px', height: '12px' },
          background: { color: primary[500] },
          border: { width: '2px', style: 'solid', color: '#ffffff' },
          states: { default: { background: { color: primary[500] } }, completed: { background: { color: success[500] } } }
        },
        content: { layout: { padding: '0 0 24px 24px' }, gap: '4px' },
        date: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '12px', color: neutral[500] } },
        title: { typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: neutral[900] } },
        description: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[600], lineHeight: '20px' } }
      },
      tree: {
        description: 'Tree view component',
        figmaCompatible: true,
        type: 'component',
        layout: { gap: '0px', direction: 'column' },
        node: {
          layout: { padding: '4px 8px', gap: '8px' },
          indicator: { layout: { width: '16px', height: '16px' }, color: neutral[400], expanded: { transform: 'rotate(90deg)' } },
          label: { typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: neutral[700] } },
          children: { layout: { margin: { left: '24px' }, border: { width: '0 0 0 1px', style: 'solid', color: neutral[200] }, padding: { left: '8px' } } }
        }
      },
      textarea: {
        description: 'Multi-line text input',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1.5px', style: 'solid', color: neutral[300], radius: { value: borderRadius.md, type: 'radius' } },
        typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '16px', lineHeight: '24px', color: neutral[900], placeholder: { color: neutral[400] } },
        layout: { width: '100%', minHeight: '100px', padding: '12px' },
        resize: { direction: 'vertical' },
        states: {
          default: { border: { color: neutral[300] } },
          focus: { border: { color: primary[500] }, effects: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' } },
          error: { border: { color: error[500] } },
          disabled: { background: { color: neutral[100] }, cursor: 'not-allowed' }
        }
      },
      datepicker: {
        description: 'Date picker component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { padding: '16px', width: '280px' },
        header: {
          background: { color: primary[50] },
          layout: { padding: '12px', gap: '8px', direction: 'row', justifyContent: 'space-between', align: 'center' },
          typography: { fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: neutral[900] },
          navButton: { layout: { width: '24px', height: '24px' }, borderRadius: { value: '4px', type: 'radius' } }
        },
        weekday: { typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '12px', color: neutral[500] }, layout: { padding: '4px', textAlign: 'center' } },
        day: {
          layout: { width: '32px', height: '32px' },
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px' },
          states: {
            default: { color: neutral[900], borderRadius: { value: '4px', type: 'radius' } },
            hover: { background: { color: neutral[100] } },
            selected: { background: { color: primary[500] }, foreground: { color: '#ffffff' } },
            today: { border: { width: '2px', style: 'solid', color: primary[500] } },
            disabled: { color: neutral[300], cursor: 'not-allowed' }
          }
        }
      },
      fileupload: {
        description: 'File upload component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '2px', style: 'dashed', color: neutral[300], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { padding: '32px', gap: '16px', direction: 'column', align: 'center', justify: 'center' },
        icon: { layout: { width: '48px', height: '48px' }, color: neutral[400] },
        text: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[600] }, textAlign: 'center' },
        browseButton: { typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', color: primary[500], textDecoration: 'underline' } },
        states: {
          default: { border: { color: neutral[300] } },
          hover: { border: { color: primary[400] }, background: { color: primary[50] } },
          active: { border: { color: primary[500] }, background: { color: primary[100] } },
          disabled: { opacity: 0.5, cursor: 'not-allowed' }
        },
        file: {
          layout: { padding: '8px', gap: '8px', direction: 'row', align: 'center', background: { color: neutral[50] }, borderRadius: { value: borderRadius.md, type: 'radius' } },
          icon: { layout: { width: '20px', height: '20px' }, color: neutral[500] },
          name: { typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] } },
          remove: { layout: { width: '16px', height: '16px' }, color: error[500], cursor: 'pointer' }
        }
      },
      multiselect: {
        description: 'Multi-select component',
        figmaCompatible: true,
        type: 'component',
        background: { color: '#ffffff' },
        border: { width: '1.5px', style: 'solid', color: neutral[300], radius: { value: borderRadius.md, type: 'radius' } },
        layout: { padding: '4px', gap: '4px', direction: 'row', wrap: true, minHeight: '40px' },
        tag: {
          layout: { padding: '2px 8px', gap: '4px' },
          background: { color: primary[100] },
          border: { width: '0px', style: 'none', color: 'transparent', radius: { value: '4px', type: 'radius' } },
          typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '12px', color: primary[700] },
          remove: { layout: { width: '12px', height: '12px' }, color: neutral[500], cursor: 'pointer' }
        },
        input: {
          layout: { flex: 1, minWidth: '100px', padding: '4px' },
          typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[900], placeholder: { color: neutral[400] } }
        },
        dropdown: {
          background: { color: '#ffffff' },
          border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.md, type: 'radius' } },
          effects: { boxShadow: shadows.lg },
          layout: { padding: '4px', maxHeight: '200px', overflow: 'auto' },
          option: {
            layout: { padding: '8px 12px' },
            typography: { fontFamily: 'Inter', fontWeight: '400', fontSize: '14px', color: neutral[700] },
            states: {
              default: { background: { color: 'transparent' } },
              hover: { background: { color: neutral[50] } },
              selected: { background: { color: primary[50] }, foreground: { color: primary[700] } }
            }
          },
          checkbox: { layout: { width: '16px', height: '16px', margin: { right: '8px' } } }
        }
      },
      container: {
        description: 'Container/wrapper component',
        figmaCompatible: true,
        type: 'container',
        background: { color: '#ffffff' },
        border: { width: '1px', style: 'solid', color: neutral[200], radius: { value: borderRadius.lg, type: 'radius' } },
        layout: { width: '100%', maxWidth: '100%', padding: '24px' },
        effects: { boxShadow: shadows.sm }
      },
      aspectratio: {
        description: 'Aspect ratio container',
        figmaCompatible: true,
        type: 'layout',
        ratios: {
          '1:1': { value: '100%', paddingBottom: '100%' },
          '4:3': { value: '75%', paddingBottom: '75%' },
          '16:9': { value: '56.25%', paddingBottom: '56.25%' },
          '21:9': { value: '42.86%', paddingBottom: '42.86%' },
          '3:2': { value: '66.67%', paddingBottom: '66.67%' },
          '2:3': { value: '150%', paddingBottom: '150%' }
        }
      },
      loader: {
        description: 'Loading indicator',
        figmaCompatible: true,
        type: 'component',
        layout: { gap: '8px', direction: 'row', align: 'center' },
        spinner: { layout: { width: '24px', height: '24px' }, border: { width: '2px', style: 'solid', color: primary[500], borderTop: { color: 'transparent' } }, animation: { spin: true } },
        pulse: { layout: { width: '24px', height: '24px' }, background: { color: primary[200] }, animation: { pulse: true } },
        skeleton: { layout: { width: '100%', height: '20px' }, background: { color: neutral[200] }, animation: { pulse: true } },
        progress: { layout: { width: '100%', height: '8px', borderRadius: { value: '9999px', type: 'circle' } }, background: { color: neutral[200] }, fill: { background: { color: primary[500] }, animation: { progress: true } } },
        sizes: { sm: { layout: { width: '16px', height: '16px' }, typography: { fontSize: '12px' } }, md: { layout: { width: '24px', height: '24px' }, typography: { fontSize: '14px' } }, lg: { layout: { width: '32px', height: '32px' }, typography: { fontSize: '18px' } } }
      },
      link: {
        description: 'Text link component',
        figmaCompatible: true,
        type: 'component',
        typography: { fontFamily: 'Inter', fontWeight: '500', fontSize: '14px', textDecoration: 'none' },
        states: {
          default: { color: primary[500] },
          hover: { color: primary[600], textDecoration: 'underline' },
          active: { color: primary[700] },
          visited: { color: primary[700] },
          disabled: { color: neutral[400], opacity: 0.5, cursor: 'not-allowed' }
        }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Design System Generate] Starting request...')

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json({ error: 'AI service not configured. Please contact support.' }, { status: 500 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured. Please contact support.' }, { status: 500 })
    }

    let clerkUserId: string | null = null
    try {
      const authResult = await auth()
      clerkUserId = authResult.userId
    } catch (authError) {
      return NextResponse.json({ error: 'Authentication failed. Please sign in again.' }, { status: 401 })
    }

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Authentication required. Please sign in first.' }, { status: 401 })
    }

    let clerkUser: Awaited<ReturnType<typeof currentUser>> | null = null
    try {
      clerkUser = await currentUser()
    } catch (clerkError) {
      return NextResponse.json({ error: 'Failed to retrieve user information. Please try again.' }, { status: 500 })
    }

    let prompt: string
    let industry: string | undefined
    let designPreferences: any = undefined
    let selectedComponents: string[] | undefined = undefined
    let customTokens: any = undefined

    try {
      const body = await request.json()
      prompt = body.prompt
      industry = body.industry
      designPreferences = body.designPreferences
      selectedComponents = body.selectedComponents
      customTokens = body.customTokens
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid request body. Please check your input.' }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 })
    }

    let user: Awaited<ReturnType<typeof db.user.findUnique>> | Awaited<ReturnType<typeof db.user.create>>
    try {
      await db.$connect()
      user = await db.user.findUnique({ where: { clerkId: clerkUserId } })

      if (!user) {
        const email = clerkUser?.emailAddresses[0]?.emailAddress || `user-${clerkUserId}@designai.com`
        const name = clerkUser?.fullName || clerkUser?.firstName || 'User'
        const imageUrl = clerkUser?.imageUrl
        user = await db.user.create({ data: { clerkId: clerkUserId, email, name, imageUrl } })
      }
    } catch (dbError) {
      return NextResponse.json({ error: 'Database error. Please try again later.' }, { status: 500 })
    }

    const shareSlug = randomBytes(8).toString('hex').slice(0, 8)

    let userPrompt = `Generate a complete design system based on this description: "${prompt}"`
    if (industry && industry !== 'none') {
      userPrompt += `\n\nIndustry context: ${industry}.`
    }
    userPrompt += `\n\nGenerate a complete design system with ALL components (button, input, card, modal, checkbox, radio, toggle, badge, avatar, link, alert, tooltip, loader, progress, toast, popover, dropdown, menu, navbar, sidebar, tabs, breadcrumb, pagination, accordion, table, list, avatarGroup, stat, chart, timeline, form, textarea, select, datepicker, slider, fileupload, multiselect, grid, container, divider, aspectRatio, carousel, emptystate). Ensure WCAG AA accessibility. Return ONLY valid JSON.`

    let designSystem: DesignSystemData

    try {
      const gemini = getGeminiAI()
      const aiResponse = await gemini.generateText(userPrompt, SYSTEM_PROMPT)

      if (!aiResponse) {
        designSystem = createFallbackDesignSystem()
      } else {
        try {
          const cleanedResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
          designSystem = JSON.parse(cleanedResponse)
          
          // Ensure all components exist
          const fallback = createFallbackDesignSystem()
          designSystem.components = { ...fallback.components, ...designSystem.components }
          designSystem.icons = designSystem.icons || fallback.icons
        } catch (parseError) {
          designSystem = createFallbackDesignSystem()
        }
      }
    } catch (aiError) {
      designSystem = createFallbackDesignSystem()
    }

    const nameMatch = prompt.match(/Create a (.+?) design system/i) || prompt.match(/Design a (.+?) design system/i) || prompt.match(/Generate a (.+?) design system/i)
    const name = nameMatch ? nameMatch[1].trim() : 'Custom Design System'

    try {
      const data: any = {
        name,
        description: prompt.substring(0, 200),
        prompt,
        userId: user.id,
        colors: JSON.stringify(designSystem.colors),
        typography: JSON.stringify(designSystem.typography),
        spacing: JSON.stringify(designSystem.spacing),
        borderRadius: JSON.stringify(designSystem.borderRadius),
        shadows: JSON.stringify(designSystem.shadows),
        components: JSON.stringify(designSystem.components),
        industry: industry && industry !== 'none' ? industry : null,
        isPublic: false,
        shareSlug
      }

      if (designPreferences) data.designPreferences = JSON.stringify(designPreferences)
      if (selectedComponents) data.selectedComponents = JSON.stringify(selectedComponents)
      if (customTokens) data.customTokens = JSON.stringify(customTokens)

      const savedSystem = await db.designSystem.create({ data })

      try {
        await db.designHistory.create({
          data: { userId: user.id, designSystemId: savedSystem.id, name: savedSystem.name, description: savedSystem.description, prompt: prompt, type: 'design-system' }
        })
      } catch (historyError) {}

      return NextResponse.json({ success: true, id: savedSystem.id, shareSlug: savedSystem.shareSlug, name: savedSystem.name })
    } catch (dbError) {
      return NextResponse.json({ error: 'Failed to save design system. Please try again.' }, { status: 500 })
    }

  } catch (error) {
    console.error('[Design System Generate] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
