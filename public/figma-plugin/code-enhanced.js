// Enhanced System Design Generator - Figma Plugin
// Features: Sync to Figma, AI Generation, Real-time Updates

figma.showUI(__html__, { width: 400, height: 650, themeColors: true });

// Store state
let designData = null;
let apiUrl = 'http://localhost:3000';
let authToken = null;
let syncEnabled = false;

// UI Communication
figma.ui.onmessage = async (msg) => {
    console.log('Message received:', msg.type);

    switch (msg.type) {
        case 'import-design':
            apiUrl = msg.apiUrl || apiUrl;
            await importDesign(msg.apiUrl, msg.designId);
            break;
        case 'sync-to-figma':
            await syncToFigma(msg.designSystemId);
            break;
        case 'ai-generate':
            await aiGenerate(msg.prompt, msg.options);
            break;
        case 'load-sample':
            await loadSampleDesign();
            break;
        case 'create-colors':
            await createColorTokens(designData && designData.colors ? designData.colors : {});
            break;
        case 'create-typography':
            await createTypographyTokens(designData && designData.typography ? designData.typography : {});
            break;
        case 'create-components':
            if (designData && designData.components) {
                await createComponentsPage(designData);
            }
            break;
        case 'export-selection':
            await exportSelectionToJSON();
            break;
        case 'set-auth':
            authToken = msg.token;
            updateStatus('success', 'Authentication set');
            break;
        case 'set-api-url':
            apiUrl = msg.url;
            console.log('API URL updated to:', apiUrl);
            break;
        case 'enable-sync':
            syncEnabled = msg.enabled;
            break;
        case 'close':
            figma.closePlugin();
            break;
    }
};

// ============================================
// IMPORT FUNCTIONALITY
// ============================================

async function importDesign(apiUrl, designId) {
    console.log('=== IMPORT DESIGN STARTED ===');
    console.log('API URL:', apiUrl);
    console.log('Design ID:', designId);

    updateStatus('loading', 'Importing design system...');

    try {
        const url = apiUrl + '/api/design-systems/' + designId;
        console.log('Fetching from:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error('Failed to fetch: ' + response.status);
        }

        designData = await response.json();
        console.log('Design data received:', designData);

        updateStatus('success', 'Imported "' + designData.name + '" successfully!');
        showPreview(designData);

        // Automatically create Figma structure after import
        console.log('Creating Figma structure...');
        updateStatus('loading', 'Creating Figma structure...');
        await createFigmaFileStructure(designData);
        console.log('Figma structure created!');
        updateStatus('success', 'Design system created in Figma!');

    } catch (error) {
        console.error('=== IMPORT ERROR ===');
        console.error('Error details:', error);
        updateStatus('error', 'Import error: ' + error.message);
    }
}

async function loadSampleDesign() {
    updateStatus('loading', 'Loading sample design...');

    // Sample design system data
    designData = {
        name: "Sample Design System",
        description: "A modern design system example",
        colors: {
            primary: {
                "50": "#eff6ff",
                "100": "#dbeafe",
                "500": "#3b82f6",
                "900": "#1e3a8a"
            },
            secondary: {
                "50": "#faf5ff",
                "100": "#f3e8ff",
                "500": "#a855f7",
                "900": "#581c87"
            }
        },
        typography: {
            fontSize: {
                xs: "12px",
                sm: "14px",
                base: "16px",
                lg: "18px",
                xl: "20px"
            },
            fontWeight: {
                normal: 400,
                medium: 500,
                bold: 700
            }
        },
        spacing: {
            xs: "4px",
            sm: "8px",
            md: "16px",
            lg: "24px",
            xl: "32px"
        },
        components: {
            button: {
                description: "Primary button component"
            },
            card: {
                description: "Card container component"
            }
        }
    };

    updateStatus('success', 'Sample design loaded!');
    showPreview(designData);
}

// Export selection to JSON
async function exportSelectionToJSON() {
    updateStatus('loading', 'Exporting selection...');

    try {
        const selection = figma.currentPage.selection;

        if (selection.length === 0) {
            updateStatus('error', 'Please select elements to export');
            return;
        }

        const exportData = {
            name: figma.currentPage.name,
            elements: selection.map(node => serializeNode(node)),
            exportedAt: new Date().toISOString()
        };

        figma.ui.postMessage({ type: 'export-json', json: exportData });
        updateStatus('success', 'Exported ' + selection.length + ' element(s)');

    } catch (error) {
        updateStatus('error', 'Export error: ' + error.message);
    }
}

// Serialize Figma node to JSON
function serializeNode(node) {
    const baseData = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height
    };

    // Add type-specific properties
    if (node.type === 'TEXT') {
        return Object.assign({}, baseData, {
            characters: node.characters,
            fontSize: node.fontSize,
            fontName: node.fontName,
            fills: node.fills
        });
    }

    if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
        return Object.assign({}, baseData, {
            fills: node.fills,
            strokes: node.strokes,
            cornerRadius: node.cornerRadius
        });
    }

    if ('children' in node) {
        return Object.assign({}, baseData, {
            children: node.children.map(child => serializeNode(child))
        });
    }

    return baseData;
}

// ============================================
// SYNC TO FIGMA FUNCTIONALITY
// ============================================

async function syncToFigma(designSystemId) {
    console.log('=== SYNC TO FIGMA STARTED ===');
    console.log('Design System ID:', designSystemId);
    console.log('API URL:', apiUrl);

    updateStatus('loading', 'Syncing design system to Figma...');

    try {
        // Fetch design system from API
        const url = apiUrl + '/api/design-systems/' + designSystemId;
        console.log('Fetching from:', url);

        const headers = authToken ? { 'Authorization': 'Bearer ' + authToken } : {};

        const response = await fetch(url, { headers: headers });
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error('Failed to fetch: ' + response.status + ' - ' + errorText);
        }

        designData = await response.json();
        console.log('Design data received:', designData.name);

        // Create Figma file structure
        await createFigmaFileStructure(designData);

        // Update API with Figma file key
        const figmaFileKey = figma.fileKey;
        console.log('Figma file key:', figmaFileKey);
        await updateDesignSystemWithFigmaKey(designSystemId, figmaFileKey);

        updateStatus('success', 'Synced "' + designData.name + '" to Figma successfully!');
        showPreview(designData);

        console.log('=== SYNC COMPLETED ===');

    } catch (error) {
        console.error('=== SYNC ERROR ===');
        console.error('Error details:', error);
        updateStatus('error', 'Sync error: ' + error.message);
    }
}

// Create complete Figma file structure
async function createFigmaFileStructure(data) {
    updateProgress('sync-start', 'Creating Figma structure...');

    // Create main pages
    const coverPage = await createCoverPage(data);
    await createTokensPage(data);
    await createComponentsPage(data);
    await createExamplesPage(data);

    updateProgress('sync-complete', 'Figma structure created!');

    // Zoom to cover page
    figma.currentPage = coverPage;
    figma.viewport.scrollAndZoomIntoView([coverPage]);
}

// Create cover page
async function createCoverPage(data) {
    const page = figma.createPage();
    page.name = "📖 Cover";

    const frame = figma.createFrame();
    frame.name = "Cover";
    frame.resize(1200, 800);
    frame.x = 0;
    frame.y = 0;

    // Background gradient
    frame.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientTransform: [[1, 0, 0], [0, 1, 0]],
        gradientStops: [
            { position: 0, color: { r: 0.23, g: 0.51, b: 0.96, a: 1 } },
            { position: 1, color: { r: 0.54, g: 0.36, b: 0.96, a: 1 } }
        ]
    }];

    // Title
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = data.name || 'Design System';
    title.fontSize = 64;
    title.fontWeight = 700;
    title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    title.x = 100;
    title.y = 300;
    frame.appendChild(title);

    // Description
    const desc = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    desc.characters = data.description || 'Generated with AI';
    desc.fontSize = 24;
    desc.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 1 } }];
    desc.x = 100;
    desc.y = 400;
    frame.appendChild(desc);

    // Metadata
    const meta = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    meta.characters = 'Created: ' + new Date().toLocaleDateString() + '\nColors: ' + Object.keys(data.colors || {}).length + '\nComponents: ' + Object.keys(data.components || {}).length;
    meta.fontSize = 16;
    meta.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.9 } }];
    meta.x = 100;
    meta.y = 500;
    frame.appendChild(meta);

    page.appendChild(frame);
    return page;
}

// Create tokens page
async function createTokensPage(data) {
    const page = figma.createPage();
    page.name = "🎨 Design Tokens";

    let yOffset = 0;

    // Colors section
    if (data.colors) {
        const colorFrame = await createColorTokens(data.colors);
        colorFrame.y = yOffset;
        colorFrame.x = 0;
        page.appendChild(colorFrame);
        yOffset += colorFrame.height + 100;
    }

    // Typography section
    if (data.typography) {
        const typeFrame = await createTypographyTokens(data.typography);
        typeFrame.y = yOffset;
        typeFrame.x = 0;
        page.appendChild(typeFrame);
        yOffset += typeFrame.height + 100;
    }

    // Spacing section
    if (data.spacing) {
        const spacingFrame = await createSpacingTokens(data.spacing);
        spacingFrame.y = yOffset;
        spacingFrame.x = 0;
        page.appendChild(spacingFrame);
    }

    return page;
}

// Create components page
async function createComponentsPage(data) {
    const page = figma.createPage();
    page.name = "🧩 Components";

    let yOffset = 0;

    // Create component examples
    if (data.components) {
        for (const [componentName, componentData] of Object.entries(data.components)) {
            const componentFrame = await createComponentExample(componentName, componentData);
            componentFrame.y = yOffset;
            page.appendChild(componentFrame);
            yOffset += componentFrame.height + 100;
        }
    }

    return page;
}

// Create examples page
async function createExamplesPage(data) {
    const page = figma.createPage();
    page.name = "📱 Examples";

    // Create example screens using the design system
    const loginScreen = await createLoginExample(data);
    loginScreen.x = 0;
    loginScreen.y = 0;
    page.appendChild(loginScreen);

    const dashboardScreen = await createDashboardExample(data);
    dashboardScreen.x = 500;
    dashboardScreen.y = 0;
    page.appendChild(dashboardScreen);

    return page;
}

// ============================================
// AI GENERATION FUNCTIONALITY
// ============================================

async function aiGenerate(prompt, options = {}) {
    updateStatus('loading', 'AI is generating your design...');

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (authToken) {
            headers['Authorization'] = 'Bearer ' + authToken;
        }

        const response = await fetch(apiUrl + '/api/figma/generate', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                prompt: prompt,
                type: options.type || 'component',
                style: options.style || 'modern',
                platform: options.platform || 'web'
            })
        });

        if (!response.ok) {
            throw new Error('AI generation failed: ' + response.status);
        }

        const result = await response.json();
        designData = result.designData;

        // Create the generated design in Figma
        await createAIGeneratedDesign(designData);

        updateStatus('success', 'AI design generated successfully!');
        showPreview(designData);

    } catch (error) {
        updateStatus('error', 'AI generation error: ' + error.message);
    }
}

// Create AI-generated design in Figma
async function createAIGeneratedDesign(data) {
    updateProgress('ai-create', 'Creating AI-generated design...');

    if (data.frames && Array.isArray(data.frames)) {
        for (const frameData of data.frames) {
            await createFrameFromData(frameData);
        }
    }

    if (data.components) {
        if (Array.isArray(data.components)) {
            for (const componentData of data.components) {
                await createElementFromData(componentData);
            }
        } else if (typeof data.components === 'object') {
            for (const [name, componentData] of Object.entries(data.components)) {
                await createComponentExample(name, componentData);
            }
        }
    }

    updateProgress('ai-complete', 'AI design created!');
    figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
}

// Create frame from AI data
async function createFrameFromData(frameData) {
    const frame = figma.createFrame();
    frame.name = frameData.name || 'Frame';
    frame.resize(frameData.width || 375, frameData.height || 812);

    if (frameData.background) {
        frame.fills = [{ type: 'SOLID', color: hexToRgb(frameData.background) }];
    }

    if (frameData.children && Array.isArray(frameData.children)) {
        for (const childData of frameData.children) {
            const child = await createElementFromData(childData);
            if (child) {
                child.x = childData.x || 0;
                child.y = childData.y || 0;
                frame.appendChild(child);
            }
        }
    }

    figma.currentPage.appendChild(frame);
    return frame;
}

// Create element from AI data
async function createElementFromData(elementData) {
    switch (elementData.type) {
        case 'TEXT':
            return await createTextFromData(elementData);
        case 'RECTANGLE':
            return createRectangleFromData(elementData);
        case 'GROUP':
        case 'FRAME':
            return await createFrameFromData(elementData);
        default:
            return null;
    }
}

// Create text from data
async function createTextFromData(textData) {
    const text = figma.createText();

    try {
        await figma.loadFontAsync({
            family: textData.fontFamily || 'Inter',
            style: 'Regular'
        });
    } catch (e) {
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    }

    text.characters = textData.content || textData.text || '';
    text.fontSize = textData.fontSize || 16;

    if (textData.color) {
        text.fills = [{ type: 'SOLID', color: hexToRgb(textData.color) }];
    }

    if (textData.fontWeight) {
        text.fontWeight = textData.fontWeight;
    }

    return text;
}

// Create rectangle from data
function createRectangleFromData(rectData) {
    const rect = figma.createRectangle();
    rect.resize(rectData.width || 100, rectData.height || 100);

    if (rectData.background || rectData.color) {
        rect.fills = [{ type: 'SOLID', color: hexToRgb(rectData.background || rectData.color) }];
    }

    if (rectData.borderRadius || rectData.cornerRadius) {
        rect.cornerRadius = rectData.borderRadius || rectData.cornerRadius || 0;
    }

    if (rectData.border) {
        rect.strokes = [{ type: 'SOLID', color: hexToRgb(rectData.border.color) }];
        rect.strokeWeight = rectData.border.width || 1;
    }

    return rect;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Update design system with Figma file key
async function updateDesignSystemWithFigmaKey(designSystemId, figmaFileKey) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (authToken) {
            headers['Authorization'] = 'Bearer ' + authToken;
        }

        await fetch(apiUrl + '/api/design-systems/' + designSystemId, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({
                figmaFileKey: figmaFileKey,
                lastSyncedAt: new Date().toISOString(),
                syncStatus: 'synced'
            })
        });
    } catch (error) {
        console.error('Failed to update design system:', error);
    }
}

// Create color tokens
async function createColorTokens(colors) {
    console.log('=== CREATE COLOR TOKENS ===');
    console.log('Colors data:', colors);

    const frame = figma.createFrame();
    frame.name = "Colors";
    frame.layoutMode = "VERTICAL";
    frame.itemSpacing = 24;
    frame.paddingTop = 32;
    frame.paddingRight = 32;
    frame.paddingBottom = 32;
    frame.paddingLeft = 32;
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    // Title
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = "Color Palette";
    title.fontSize = 24;
    title.fontWeight = 700;
    frame.appendChild(title);

    // Color rows
    for (const colorName in colors) {
        if (!colors.hasOwnProperty(colorName)) continue;

        const colorScale = colors[colorName];
        console.log('Processing color:', colorName, colorScale);

        const colorRow = figma.createFrame();
        colorRow.name = colorName;
        colorRow.layoutMode = "HORIZONTAL";
        colorRow.itemSpacing = 12;
        colorRow.counterAxisSizingMode = "AUTO";

        // Label
        const label = figma.createText();
        await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
        label.characters = colorName.charAt(0).toUpperCase() + colorName.slice(1);
        label.fontSize = 16;
        label.fontWeight = 500;
        colorRow.appendChild(label);

        // Swatches
        if (typeof colorScale === 'object' && colorScale !== null) {
            for (const shade in colorScale) {
                if (!colorScale.hasOwnProperty(shade)) continue;

                const hex = colorScale[shade];
                console.log('Creating swatch:', colorName, shade, hex);

                const swatch = figma.createRectangle();
                swatch.name = colorName + '-' + shade;
                swatch.resize(60, 60);
                swatch.cornerRadius = 8;

                try {
                    const rgbColor = hexToRgb(hex);
                    console.log('RGB color:', rgbColor);
                    swatch.fills = [{ type: 'SOLID', color: rgbColor }];
                } catch (e) {
                    console.error('Failed to convert hex to RGB:', hex, e);
                    swatch.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                }

                swatch.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
                swatch.strokeWeight = 1;
                colorRow.appendChild(swatch);
            }
        }

        frame.appendChild(colorRow);
    }

    console.log('Color tokens frame created');
    return frame;
}

// Create typography tokens
async function createTypographyTokens(typography) {
    console.log('=== CREATE TYPOGRAPHY TOKENS ===');
    console.log('Typography data:', typography);

    const frame = figma.createFrame();
    frame.name = "Typography";
    frame.layoutMode = "VERTICAL";
    frame.itemSpacing = 16;
    frame.paddingTop = 32;
    frame.paddingRight = 32;
    frame.paddingBottom = 32;
    frame.paddingLeft = 32;
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    // Title
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = "Typography Scale";
    title.fontSize = 24;
    title.fontWeight = 700;
    frame.appendChild(title);

    // Type samples
    const fontSize = typography.fontSize || {};
    const fontWeight = typography.fontWeight || {};

    console.log('Font sizes:', fontSize);
    console.log('Font weights:', fontWeight);

    for (const sizeName in fontSize) {
        if (!fontSize.hasOwnProperty(sizeName)) continue;

        const sizeValue = fontSize[sizeName];
        console.log('Creating typography sample:', sizeName, sizeValue);

        const sample = figma.createText();
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        sample.characters = sizeName + ': The quick brown fox jumps over the lazy dog';

        // Parse size value (handle rem, px, etc.)
        let parsedSize = 16;
        if (typeof sizeValue === 'string') {
            if (sizeValue.includes('rem')) {
                parsedSize = parseFloat(sizeValue) * 16;
            } else if (sizeValue.includes('px')) {
                parsedSize = parseFloat(sizeValue);
            } else {
                parsedSize = parseFloat(sizeValue) || 16;
            }
        } else {
            parsedSize = parseInt(sizeValue) || 16;
        }

        console.log('Parsed font size:', parsedSize);
        sample.fontSize = parsedSize;
        sample.fontWeight = fontWeight && fontWeight.normal ? parseInt(fontWeight.normal) || 400 : 400;
        frame.appendChild(sample);
    }

    console.log('Typography tokens frame created');
    return frame;
}

// Create spacing tokens
async function createSpacingTokens(spacing) {
    const frame = figma.createFrame();
    frame.name = "Spacing";
    frame.layoutMode = "VERTICAL";
    frame.itemSpacing = 16;
    frame.paddingTop = 32;
    frame.paddingRight = 32;
    frame.paddingBottom = 32;
    frame.paddingLeft = 32;
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    // Title
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = "Spacing Scale";
    title.fontSize = 24;
    title.fontWeight = 700;
    frame.appendChild(title);

    // Spacing samples
    for (const [spaceName, spaceValue] of Object.entries(spacing)) {
        const row = figma.createFrame();
        row.layoutMode = "HORIZONTAL";
        row.itemSpacing = 16;
        row.counterAxisSizingMode = "AUTO";

        const label = figma.createText();
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        label.characters = spaceName + ': ' + spaceValue;
        label.fontSize = 14;
        row.appendChild(label);

        const spacer = figma.createRectangle();
        spacer.resize(parseInt(spaceValue) || 8, 24);
        spacer.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }];
        row.appendChild(spacer);

        frame.appendChild(row);
    }

    return frame;
}

// Create component example
async function createComponentExample(name, componentData) {
    const frame = figma.createFrame();
    frame.name = name;
    frame.layoutMode = "VERTICAL";
    frame.itemSpacing = 16;
    frame.paddingTop = 24;
    frame.paddingRight = 24;
    frame.paddingBottom = 24;
    frame.paddingLeft = 24;
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    // Component title
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = name.charAt(0).toUpperCase() + name.slice(1);
    title.fontSize = 20;
    title.fontWeight = 700;
    frame.appendChild(title);

    // Create component variants based on data
    if (componentData && typeof componentData === 'object') {
        // Add component description if available
        if (componentData.description) {
            const desc = figma.createText();
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            desc.characters = componentData.description;
            desc.fontSize = 14;
            frame.appendChild(desc);
        }
    }

    return frame;
}

// Create login example
async function createLoginExample(designData) {
    const frame = figma.createFrame();
    frame.name = "Login Screen";
    frame.resize(375, 812);

    // Use primary color from design system if available
    const bgColor = designData && designData.colors && designData.colors.primary && designData.colors.primary['50']
        ? hexToRgb(designData.colors.primary['50'])
        : { r: 0.98, g: 0.98, b: 0.98 };
    frame.fills = [{ type: 'SOLID', color: bgColor }];

    // Add title
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = "Welcome Back";
    title.fontSize = 32;
    title.fontWeight = 700;
    title.x = 32;
    title.y = 100;
    frame.appendChild(title);

    return frame;
}

// Create dashboard example
async function createDashboardExample(designData) {
    const frame = figma.createFrame();
    frame.name = "Dashboard";
    frame.resize(1440, 900);

    // Use background color from design system if available
    const bgColor = designData && designData.colors && designData.colors.neutral && designData.colors.neutral['50']
        ? hexToRgb(designData.colors.neutral['50'])
        : { r: 0.98, g: 0.98, b: 0.98 };
    frame.fills = [{ type: 'SOLID', color: bgColor }];

    // Add header
    const header = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    header.characters = "Dashboard";
    header.fontSize = 40;
    header.fontWeight = 700;
    header.x = 48;
    header.y = 48;
    frame.appendChild(header);

    return frame;
}

// Hex to RGB converter
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle 3-digit hex
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
        console.error('Invalid hex color:', hex);
        return { r: 0, g: 0, b: 0 };
    }

    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    };
}

// UI Helper functions
function updateStatus(type, message) {
    try {
        figma.ui.postMessage({ type: 'update-status', status: type, message });
    } catch (error) {
        console.error('Failed to update status:', error);
    }
}

function updateProgress(step, message) {
    try {
        figma.ui.postMessage({ type: 'update-progress', step, message });
    } catch (error) {
        console.error('Failed to update progress:', error);
    }
}

function showPreview(data) {
    try {
        const preview = {
            name: data.name,
            colorCount: Object.keys(data.colors || {}).reduce(function (acc, k) {
                return acc + Object.keys(data.colors[k]).length;
            }, 0),
            typeScaleCount: Object.keys((data.typography && data.typography.fontSize) || {}).length,
            componentCount: Object.keys(data.components || {}).length
        };
        figma.ui.postMessage({ type: 'show-preview', preview });
    } catch (error) {
        console.error('Failed to show preview:', error);
    }
}
