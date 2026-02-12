// System Design Generator - Figma Plugin
// Fetches design system from your app and creates Figma elements

figma.showUI(ui.html, { width: 360, height: 480 });

// Store fetched design data
let designData = null;

// UI Communication
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-design') {
    await importDesign(msg.apiUrl, msg.designId);
  } else if (msg.type === 'load-sample') {
    await loadSampleDesign();
  } else if (msg.type === 'create-colors') {
    await createColorStyles();
  } else if (msg.type === 'create-typography') {
    await createTypographyStyles();
  } else if (msg.type === 'create-components') {
    await createComponentFrames();
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Fetch and import design system
async function importDesign(apiUrl, designId) {
  updateStatus('loading', 'Fetching design system...');
  
  try {
    const url = `${apiUrl}/api/design-systems/${designId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    designData = await response.json();
    
    showPreview(designData);
    updateStatus('success', `Design "${designData.name}" loaded successfully!`);
    
    // Auto-create everything
    await createAllElements();
    
  } catch (error) {
    updateStatus('error', `Error: ${error.message}`);
  }
}

// Load sample design for demo
async function loadSampleDesign() {
  designData = generateSampleDesign();
  showPreview(designData);
  updateStatus('success', 'Sample design loaded!');
  await createAllElements();
}

// Generate sample design data
function generateSampleDesign() {
  return {
    name: "Sample Design System",
    colors: {
      primary: {
        50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa",
        500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a"
      },
      secondary: {
        50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8",
        500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a"
      }
    },
    typography: {
      fontFamily: { sans: ["Inter", "system-ui"], serif: ["Merriweather"], mono: ["JetBrains Mono"] },
      fontSize: { xs: "12px", sm: "14px", base: "16px", lg: "18px", xl: "20px", "2xl": "24px", "3xl": "30px", "4xl": "36px" },
      fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 }
    },
    borderRadius: { sm: "4px", md: "8px", lg: "12px", xl: "16px", full: "9999px" }
  };
}

// Create all design elements
async function createAllElements() {
  if (!designData) return;
  
  updateProgress('create-colors', 'Creating color styles...');
  await createColorStyles();
  
  updateProgress('create-typography', 'Creating typography styles...');
  await createTypographyStyles();
  
  updateProgress('create-components', 'Creating component frames...');
  await createComponentFrames();
  
  updateStatus('success', 'Design imported successfully!');
  
  // Zoom to fit
  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
}

// Create color styles in Figma
async function createColorStyles() {
  if (!designData?.colors) return;
  
  const colorTypes = ['FILL', 'STROKE'];
  
  for (const [colorName, colorScale] of Object.entries(designData.colors)) {
    for (const [shade, hex] of Object.entries(colorScale)) {
      const styleName = `colors/${colorName}/${shade}`;
      
      try {
        const style = figma.createStyle();
        style.name = styleName;
        style.description = `${colorName} color at ${shade} shade`;
        
        // Parse hex to RGB
        const rgb = hexToRgb(hex);
        style.paints = [{
          type: 'SOLID',
          color: { r: rgb.r, g: rgb.g, b: rgb.b },
          opacity: 1,
          visible: true
        }];
        
        await figma.currentPage.appendChild(style);
        
      } catch (e) {
        console.log(`Style "${styleName}" may already exist`);
      }
    }
  }
}

// Create typography styles
async function createTypographyStyles() {
  if (!designData?.typography) return;
  
  const { fontFamily, fontSize, fontWeight } = designData.typography;
  
  for (const [sizeName, sizeValue] of Object.entries(fontSize)) {
    for (const [weightName, weightValue] of Object.entries(fontWeight)) {
      const styleName = `typography/${sizeName}/${weightName}`;
      
      try {
        const style = figma.createStyle();
        style.name = styleName;
        style.styleType = 'TEXT';
        style.description = `${sizeName} text with ${weightName} weight`;
        
        // Create text node to set style properties
        const text = figma.createText();
        await figma.currentPage.appendChild(text);
        
        text.fontName = { family: fontFamily.sans[0] || 'Inter', style: 'Regular' };
        text.fontSize = parseInt(sizeValue) || 16;
        text.fontWeight = Number(weightValue) || 400;
        text.characters = `${sizeName} ${weightName}`;
        
        // Load font if needed
        try {
          await figma.loadFontAsync({ family: fontFamily.sans[0] || 'Inter', style: 'Regular' });
        } catch (e) {
          await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        }
        
        // Set the text style on the style
        style.fontSize = parseInt(sizeValue) || 16;
        style.fontWeight = Number(weightValue) || 400;
        style.fontFamily = fontFamily.sans[0] || 'Inter';
        style.textAlignHorizontal = 'LEFT';
        
        text.remove();
        
      } catch (e) {
        console.log(`Typography style "${styleName}" error:`, e.message);
      }
    }
  }
}

// Create component frames
async function createComponentFrames() {
  if (!designData?.colors) return;
  
  const page = figma.currentPage;
  
  // Create color palette frame
  const colorFrame = figma.createFrame();
  colorFrame.name = "Color Palette";
  colorFrame.x = 0;
  colorFrame.y = 0;
  colorFrame.layoutMode = "VERTICAL";
  colorFrame.itemSpacing = 16;
  colorFrame.padding = { top: 24, right: 24, bottom: 24, left: 24 };
  colorFrame.backgrounds = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }];
  
  await page.appendChild(colorFrame);
  
  for (const [colorName, colorScale] of Object.entries(designData.colors)) {
    const colorRow = figma.createFrame();
    colorRow.name = colorName;
    colorRow.layoutMode = "HORIZONTAL";
    colorRow.itemSpacing = 8;
    colorRow.counterAxisSizingMode = "FIXED";
    colorRow.counterAxisAlignItems = "CENTER";
    
    const label = figma.createText();
    label.characters = colorName.charAt(0).toUpperCase() + colorName.slice(1);
    label.fontSize = 14;
    label.fontWeight = 600;
    try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); } catch(e) {}
    colorRow.appendChild(label);
    
    for (const [shade, hex] of Object.entries(colorScale)) {
      const swatch = figma.createRectangle();
      swatch.name = `${colorName}-${shade}`;
      swatch.resize(40, 40);
      swatch.cornerRadius = 4;
      swatch.fills = [{ type: 'SOLID', color: hexToRgb(hex), visible: true }];
      swatch.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 }, visible: true }];
      swatch.strokeWeight = 1;
      colorRow.appendChild(swatch);
    }
    
    colorFrame.appendChild(colorRow);
  }
  
  // Create typography frame
  const typeFrame = figma.createFrame();
  typeFrame.name = "Typography";
  typeFrame.x = 0;
  typeFrame.y = colorFrame.height + 100;
  typeFrame.layoutMode = "VERTICAL";
  typeFrame.itemSpacing = 16;
  typeFrame.padding = { top: 24, right: 24, bottom: 24, left: 24 };
  typeFrame.backgrounds = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }];
  
  await page.appendChild(typeFrame);
  
  const { fontSize, fontWeight } = designData.typography;
  
  for (const [sizeName, sizeValue] of Object.entries(fontSize)) {
    const typeRow = figma.createText();
    typeRow.characters = `${sizeName}: The quick brown fox jumps over the lazy dog`;
    typeRow.fontSize = parseInt(sizeValue) || 16;
    typeRow.fontWeight = fontWeight.normal || 400;
    typeRow.name = `typography-${sizeName}`;
    typeRow.textAlignHorizontal = "LEFT";
    
    try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); } catch(e) {}
    typeFrame.appendChild(typeRow);
  }
  
  // Create button examples
  const buttonFrame = figma.createFrame();
  buttonFrame.name = "Buttons";
  buttonFrame.x = 0;
  buttonFrame.y = colorFrame.height + typeFrame.height + 200;
  buttonFrame.layoutMode = "HORIZONTAL";
  buttonFrame.itemSpacing = 12;
  buttonFrame.padding = { top: 24, right: 24, bottom: 24, left: 24 };
  buttonFrame.backgrounds = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }];
  
  await page.appendChild(buttonFrame);
  
  const primaryColor = designData.colors.primary?.[500] || "#3b82f6";
  const rgb = hexToRgb(primaryColor);
  
  const primaryBtn = figma.createFrame();
  primaryBtn.name = "Primary Button";
  primaryBtn.resize(120, 40);
  primaryBtn.cornerRadius = 8;
  primaryBtn.fills = [{ type: 'SOLID', color: rgb, visible: true }];
  primaryBtn.layoutMode = "CENTER";
  
  const btnText = figma.createText();
  btnText.characters = "Primary";
  btnText.fontSize = 14;
  btnText.fontWeight = 600;
  btnText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }];
  try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); } catch(e) {}
  primaryBtn.appendChild(btnText);
  buttonFrame.appendChild(primaryBtn);
  
  const secondaryBtn = figma.createFrame();
  secondaryBtn.name = "Secondary Button";
  secondaryBtn.resize(120, 40);
  secondaryBtn.cornerRadius = 8;
  secondaryBtn.strokes = [{ type: 'SOLID', color: rgb, visible: true }];
  secondaryBtn.strokeWeight = 2;
  secondaryBtn.layoutMode = "CENTER";
  
  const secBtnText = figma.createText();
  secBtnText.characters = "Secondary";
  secBtnText.fontSize = 14;
  secBtnText.fontWeight = 600;
  secBtnText.fills = [{ type: 'SOLID', color: rgb, visible: true }];
  try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); } catch(e) {}
  secondaryBtn.appendChild(secBtnText);
  buttonFrame.appendChild(secondaryBtn);
}

// Helper: Hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

// UI Helper functions
function updateStatus(type, message) {
  figma.ui.postMessage({ type: 'update-status', status: type, message });
}

function updateProgress(step, message) {
  figma.ui.postMessage({ type: 'update-progress', step, message });
}

function showPreview(data) {
  const preview = {
    name: data.name,
    colorCount: Object.keys(data.colors || {}).reduce((acc, k) => acc + Object.keys(data.colors[k]).length, 0),
    typeScaleCount: Object.keys(data.typography?.fontSize || {}).length
  };
  figma.ui.postMessage({ type: 'show-preview', preview });
}
