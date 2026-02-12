# System Design Generator - Figma Plugin

This plugin allows you to directly create Figma designs from your generated system design.

## Installation

### Option 1: Development Mode (Recommended)

1. Open Figma Desktop App
2. Go to **Menu → Plugins → Development → New Plugin...**
3. Click **Choose a manifest.json** button
4. Select this folder: `public/figma-plugin/`
5. Click **Save**
6. The plugin will open in Figma

### Option 2: Publish to Figma (Coming Soon)

## How to Use

1. **Generate a Design System**
   - Go to your app and generate a design system
   - Copy the Design System ID from the URL

2. **Open the Plugin**
   - In Figma: **Menu → Plugins → System Design Generator**
   - Or use keyboard shortcut: `Cmd/Ctrl + Option/Alt + P`

3. **Import Your Design**
   - Enter your app URL (e.g., `http://localhost:3000`)
   - Enter the Design System ID
   - Click **Import & Create Design**

4. **What Gets Created**
   - Color Palette with all color tokens as named styles
   - Typography section with all font sizes and weights
   - Button examples (primary and secondary)
   - All organized in frames on the current page

## Features

- ✅ Fetches design system from your Next.js app
- ✅ Creates color styles automatically
- ✅ Creates typography styles
- ✅ Creates component examples (buttons, color swatches)
- ✅ Sample design for demo purposes

## API Requirements

Your Next.js app needs:
- An endpoint at `/api/design-systems/[id]` that returns the design system JSON
- Public read access or authentication support

## File Structure

```
public/figma-plugin/
├── manifest.json    # Figma plugin configuration
├── code.js         # Main plugin logic
├── ui.html         # Plugin UI (injected in Figma)
└── README.md       # This file
```

## Troubleshooting

**Plugin won't load?**
- Make sure you're using Figma Desktop App
- Check that manifest.json is in the correct folder

**Can't fetch design?**
- Ensure your dev server is running
- Check CORS settings on your API
- Verify the Design System ID is correct

## Development

To modify the plugin:
1. Edit `code.js` for plugin logic
2. Edit `ui.html` for the plugin interface
3. Save files and reload the plugin in Figma
