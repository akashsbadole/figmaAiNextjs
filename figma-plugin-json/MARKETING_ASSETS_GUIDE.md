# Marketing Assets Specifications

Create these visual assets for publishing your plugin.

## 1. Plugin Icon (REQUIRED)

**Specifications:**
- Size: 128x128 pixels
- Format: PNG
- Background: Transparent OR solid color
- File size: < 500KB

**Design Guidelines:**
- Simple, recognizable at small sizes
- Use Figma brand color: #18A0FB (blue)
- Avoid text (except maybe "{}" symbol)
- High contrast, clear shapes
- Matches Figma's design language

**Design Concept Ideas:**

### Option A: JSON Brackets Icon
```
┌────────────┐
│            │
│    { }     │
│            │
└────────────┘
```
- Blue rounded square background (#18A0FB)
- White curly brackets "{}" centered
- Simple, clean, immediately recognizable

### Option B: Transformation Icon
```
┌────────────┐
│            │
│  { → □ }   │
│            │
└────────────┘
```
- JSON brackets transforming to Figma frame
- Arrow showing conversion
- Gradient or two-tone color

### Option C: Layers Icon
```
┌────────────┐
│  ┌──┐      │
│  │{}│      │
│  └──┘      │
│   ▼        │
└────────────┘
```
- Stacked layers representing design system
- Code converting to visual layers

**Figma Template:**
Create a 128x128 frame in Figma with your icon design, then export as PNG @2x

---

## 2. Cover Image (REQUIRED)

**Specifications:**
- Size: 1920x960 pixels
- Format: JPG or PNG
- Aspect ratio: 2:1
- File size: < 2MB

**Layout Structure:**

```
┌────────────────────────────────────────────────┐
│                                                │
│  Left Panel (40%)     │  Right Panel (60%)    │
│                       │                        │
│  • Plugin Name        │  • Screenshot/Demo    │
│  • Tagline            │  • Before/After       │
│  • Key Features       │  • Visual Example     │
│  • Call to Action     │  • Generated Design   │
│                       │                        │
└────────────────────────────────────────────────┘
```

**Content Elements:**

**Left Side:**
- **Title**: "JSON to Figma"
  - Font: Bold, 72-96px
  - Color: #000000 or #18A0FB
  
- **Subtitle**: "System Design Generator"
  - Font: Medium, 36-48px
  - Color: #666666

- **Tagline**: "Transform JSON into beautiful Figma designs instantly"
  - Font: Regular, 24-32px
  - Color: #333333

- **Features List**:
  ```
  ✓ Generate system designs
  ✓ Create UI templates
  ✓ Build forms & dashboards
  ✓ Auto-layout support
  ```

**Right Side:**
- Show plugin in action
- Before (JSON code) → After (Figma design)
- Use actual screenshots
- Add subtle shadows/depth

**Color Palette:**
- Primary: #18A0FB (Figma blue)
- Secondary: #FFFFFF (White)
- Accent: #F24822 (Figma red - use sparingly)
- Background: #F5F5F5 or gradient
- Text: #000000, #666666, #999999

**Typography:**
- Use Inter font (Figma's standard)
- Or similar: Roboto, SF Pro, Helvetica

---

## 3. Screenshots (REQUIRED - Minimum 2)

**Specifications:**
- Size: Any, but recommend 1600x900 or 1920x1080
- Format: PNG or JPG
- Quantity: 2-5 screenshots
- File size: < 2MB each

### Screenshot 1: Plugin Interface
**What to show:**
- Plugin UI with JSON input field
- Example JSON loaded in textarea
- Visible "Convert to Figma" button
- Show built-in examples section

**How to capture:**
1. Open plugin in Figma
2. Load a simple example
3. Take screenshot of entire plugin window
4. Crop to show only plugin (no Figma chrome)

**Optional annotations:**
- Arrow pointing to JSON input: "Paste your JSON here"
- Arrow pointing to examples: "Use built-in templates"
- Circle convert button: "Click to generate"

---

### Screenshot 2: Simple Example Result
**What to show:**
- Split screen: JSON code on left, result on right
- Simple card design created from JSON
- Show Figma layers panel
- Highlight the generated frame

**Setup:**
1. Use simple card JSON example
2. Convert to Figma
3. Show both code and result
4. Capture wide screenshot

**Example layout:**
```
┌──────────────────────┬──────────────────────┐
│  JSON Code           │  Figma Canvas        │
│                      │                      │
│  {                   │  ┌────────────┐     │
│    "type": ...       │  │ Card       │     │
│    "text": ...       │  │ ✓ Generated│     │
│  }                   │  └────────────┘     │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

---

### Screenshot 3: Complex System Design
**What to show:**
- Full dashboard or form layout
- Multiple elements created
- Professional, polished result
- Show component variety

**Use cases:**
- Login form with inputs and buttons
- Pricing cards comparison table
- Dashboard with stats and charts
- Mobile app screen layout

---

### Screenshot 4: Templates Gallery
**What to show:**
- Multiple generated designs
- Different styles and use cases
- Variety of components
- Grid or gallery layout

**Examples to include:**
- Profile card
- Button set
- Navigation menu
- Notification cards
- Product cards

---

### Screenshot 5: Auto-Layout Feature
**What to show:**
- Auto-layout in action
- Responsive design elements
- Spacing and padding visual
- Layer structure in sidebar

**Highlight:**
- Auto-layout icon in layers
- Spacing between elements
- Responsive behavior

---

## 4. Demo Video (OPTIONAL but RECOMMENDED)

**Specifications:**
- Length: 30 seconds - 3 minutes
- Format: MP4 or YouTube link
- Resolution: 1920x1080 (Full HD)
- Aspect ratio: 16:9

**Video Structure:**

**0:00-0:10 - Hook**
- "Transform JSON into Figma designs in seconds"
- Show final impressive result

**0:10-0:30 - Problem**
- "Tired of manually creating repetitive designs?"
- Show slow manual process

**0:30-1:30 - Solution**
- Open plugin
- Paste JSON
- Click convert
- Show instant result

**1:30-2:30 - Features**
- Show different examples
- Highlight auto-layout
- Show templates
- Quick transformations

**2:30-3:00 - Call to Action**
- "Install JSON to Figma today"
- Show plugin in Figma Community

**Tools for Creating:**
- Screen recording: Loom, QuickTime, OBS
- Editing: iMovie, DaVinci Resolve, Premiere
- Music: Epidemic Sound, Artlist (royalty-free)

---

## 5. Promotional Graphics (OPTIONAL)

### Social Media Sizes

**Twitter/X Post (1200x675):**
- Plugin name + key feature
- Screenshot or demo GIF
- "Available now in Figma Community"

**LinkedIn Post (1200x627):**
- Professional design
- Focus on productivity benefits
- Link to plugin

**Instagram Post (1080x1080):**
- Square format
- Eye-catching design
- Plugin showcase

**Facebook Post (1200x630):**
- Similar to Twitter
- Clear value proposition

---

## Asset Creation Tools

### Design Tools:
- **Figma** (obviously!) - For all graphics
- **Canva** - Quick social graphics
- **Adobe Illustrator** - Vector graphics
- **Photoshop** - Photo editing

### Screenshot Tools:
- **macOS**: Cmd+Shift+4 (native)
- **Windows**: Snipping Tool, Snip & Sketch
- **CleanShot X** (Mac) - Professional screenshots
- **Lightshot** - Cross-platform

### Screen Recording:
- **Loom** - Easy, cloud-based
- **QuickTime** (Mac) - Built-in
- **OBS Studio** - Professional, free
- **ScreenFlow** (Mac) - Advanced editing

### GIF Creation:
- **Gifox** (Mac) - Screen recording to GIF
- **LICEcap** - Cross-platform
- **CloudApp** - Record and share

---

## Quick Creation Checklist

### Day 1: Icon
- [ ] Design 3 concepts
- [ ] Get feedback
- [ ] Finalize design
- [ ] Export at 128x128px @2x
- [ ] Test at small size

### Day 2: Cover Image
- [ ] Layout structure
- [ ] Add text content
- [ ] Add screenshots
- [ ] Visual polish
- [ ] Export at 1920x960px

### Day 3: Screenshots
- [ ] Prepare example JSON
- [ ] Screenshot 1: UI
- [ ] Screenshot 2: Simple result
- [ ] Screenshot 3: Complex design
- [ ] Screenshot 4: Templates
- [ ] Screenshot 5: Feature highlight

### Day 4: Video (Optional)
- [ ] Write script
- [ ] Record screen
- [ ] Edit footage
- [ ] Add music/voiceover
- [ ] Export and upload

### Day 5: Social Graphics
- [ ] Twitter graphic
- [ ] LinkedIn graphic
- [ ] Create demo GIF
- [ ] Prepare launch posts

---

## Asset Templates

Download these Figma templates (create links):

1. **Icon Template** - 128x128 frame with guides
2. **Cover Template** - 1920x960 with layout grid
3. **Screenshot Template** - Consistent styling
4. **Social Media Kit** - All sizes pre-made

---

## Quality Checklist

Before uploading:

**Icon:**
- [ ] Exactly 128x128px
- [ ] Transparent background (if applicable)
- [ ] Looks good at 32x32px (thumbnail)
- [ ] Matches Figma design language
- [ ] File size under 500KB

**Cover Image:**
- [ ] Exactly 1920x960px
- [ ] Text is readable
- [ ] No blurry images
- [ ] Professional quality
- [ ] File size under 2MB

**Screenshots:**
- [ ] High resolution (1600x900+)
- [ ] Clear, not blurry
- [ ] Shows actual plugin
- [ ] Variety of examples
- [ ] Each under 2MB

**Video (if included):**
- [ ] 1080p or higher
- [ ] Clear audio (if voiceover)
- [ ] Demonstrates value quickly
- [ ] Under 5 minutes
- [ ] Uploaded or linked

---

## Example Asset Package Structure

```
plugin-assets/
├── icon/
│   ├── icon-128.png (required)
│   ├── icon-256.png (backup)
│   └── icon-source.fig
├── cover/
│   ├── cover-1920x960.png (required)
│   └── cover-source.fig
├── screenshots/
│   ├── 01-interface.png
│   ├── 02-simple-example.png
│   ├── 03-complex-design.png
│   ├── 04-templates.png
│   └── 05-auto-layout.png
├── video/
│   ├── demo-video.mp4
│   └── demo-thumbnail.png
└── social/
    ├── twitter-1200x675.png
    ├── linkedin-1200x627.png
    └── demo-gif.gif
```

---

## Need Help?

**Hire a Designer:**
- Fiverr (budget-friendly)
- Upwork (professional)
- Dribbble (high-end)

**DIY Resources:**
- Figma Community (free templates)
- Unsplash (free stock photos)
- Flaticon (free icons)

**Budget:**
- DIY: $0
- Fiverr: $20-100
- Professional: $200-500+

---

Ready to create amazing marketing assets! 🎨
