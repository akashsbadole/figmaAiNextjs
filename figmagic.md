## Integration Plan: figmagic for System Design Colors

### Overview
Integrate figmagic to directly extract color tokens from Figma design files and sync them with your system design implementation.

### Current State Analysis
- ✅ You have `src/lib/figma-generator.ts` - creates Figma-compatible structures
- ✅ You have `/api/figma/generate` endpoint for AI-generated designs
- ✅ You have `src/app/figma/page.tsx` - Figma design generator UI
- ✅ You have `src/app/system-design/page.tsx` - System design management

### Proposed Implementation

#### 1. **Install figmagic**
```bash
npm install figmagic
# or
yarn add figmagic
```

#### 2. **Create Figma Token Extraction Service** (`src/lib/figmagic-extractor.ts`)
- Add functions to extract colors, typography, spacing from Figma files
- Convert figmagic token format to your DesignSystem schema
- Support both local Figma files and Figma API integration

#### 3. **Create API Endpoint** (`src/app/api/figmagic/extract/route.ts`)
- Accept Figma file URL or access token
- Extract color tokens using figmagic
- Return standardized color tokens

#### 4. **Update System Design Page**
- Add "Import from Figma" button
- Display imported colors with preview swatches
- Allow editing/overriding extracted colors

#### 5. **Add Figma Token Configuration** (`figmagic.config.js`)
```javascript
module.exports = {
  colors: {
    outputFormat: 'object',
    tokenNameFormat: 'kebab-case'
  },
  typography: {
    outputFormat: 'object'
  }
}
```

### Key Features
- **Extract Color Tokens**: Import colors directly from Figma design files
- **Sync Support**: Update local colors when Figma design changes
- **Token Preview**: Visual preview of imported colors
- **Format Conversion**: Convert figmagic format to your existing schema
- **Batch Import**: Import multiple color palettes at once

### Deliverables
1. `src/lib/figmagic-extractor.ts` - Token extraction library
2. `src/app/api/figmagic/extract/route.ts` - API endpoint
3. `src/app/system-design/page.tsx` - Updated UI with import functionality
4. Documentation for figmagic configuration

---


-----------------------
## Plan: Create Figma Plugin for Direct Design Creation

### Goal
Build a Figma plugin that can fetch your generated system design and directly create design elements (frames, components, colors, typography) in Figma.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Your Next.js   │────▶│   Figma REST    │────▶│   Figma Editor  │
│  Design System  │     │      API        │     │   (New Design)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       ▲
         │                       │
         └───────────────────────┘
                  │
         ┌───────────────────────┐
         │   Figma Plugin       │
         │  - UI for auth/ID    │
         │  - Fetch design      │
         │  - Create elements   │
         └───────────────────────┘
```

### Implementation Plan

#### 1. **Create Figma Plugin Structure**
```
public/figma-plugin/
├── manifest.json          # Plugin configuration
├── code.js               # Plugin logic
├── ui.html               # Plugin UI
├── styles.css            # Plugin styles
└── README.md             # Setup instructions
```

#### 2. **Figma Plugin Features**
- Input design system ID or URL
- Authentication with your Next.js API
- Create color styles from tokens
- Create typography styles
- Create component frames
- Sync all design tokens

#### 3. **Backend API** (`src/app/api/figma-plugin/route.ts`)
- Endpoint to serve design system data to plugin
- Authentication for plugin access

#### 4. **Figma REST API Integration**
- Create new Figma file
- POST to create styles (colors, typography)
- Create frames with components

### Deliverables
1. `public/figma-plugin/` folder with complete plugin
2. `src/app/api/figma-plugin/route.ts` - API endpoint
3. Updated UI to get design system ID

---

Would you like me to implement this? Please **toggle to Act mode** to proceed.