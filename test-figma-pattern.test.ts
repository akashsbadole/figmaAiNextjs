import { describe, it, expect } from 'vitest';
import { generateFigmaFile, convertDataToFigmaFile, FigmaFile } from './src/lib/figma-generator';

// Your design data pattern
const designPattern = [
  {
    "name": "Item 1",
    "type": "container",
    "backgroundColor": "#FFFFFF",
    "padding": 16,
    "cornerRadius": 8,
    "children": [
      {
        "type": "text",
        "text": "Product Item 1",
        "fontSize": 18,
        "fontWeight": "Medium",
        "color": "#000000"
      },
      {
        "type": "text",
        "text": "$29.99",
        "fontSize": 16,
        "color": "#18A0FB"
      }
    ]
  },
  {
    "name": "Item 2",
    "type": "container",
    "backgroundColor": "#FFFFFF",
    "padding": 16,
    "cornerRadius": 8,
    "children": [
      {
        "type": "text",
        "text": "Product Item 2",
        "fontSize": 18,
        "fontWeight": "Medium",
        "color": "#000000"
      },
      {
        "type": "text",
        "text": "$39.99",
        "fontSize": 16,
        "color": "#18A0FB"
      }
    ]
  },
  {
    "name": "Item 3",
    "type": "container",
    "backgroundColor": "#FFFFFF",
    "padding": 16,
    "cornerRadius": 8,
    "children": [
      {
        "type": "text",
        "text": "Product Item 3",
        "fontSize": 18,
        "fontWeight": "Medium",
        "color": "#000000"
      },
      {
        "type": "text",
        "text": "$49.99",
        "fontSize": 16,
        "color": "#18A0FB"
      }
    ]
  }
];

describe('Figma Pattern Validation', () => {
  it('convertDataToFigmaFile should follow the design pattern', () => {
    const figmaFile = convertDataToFigmaFile(designPattern);
    
    expect(figmaFile).toBeDefined();
    expect(figmaFile.name).toBe('Product Items Design');
    expect(figmaFile.version).toBe('1.0.0');
    
    // Check structure
    expect(figmaFile.document).toBeDefined();
    expect(figmaFile.document.children).toBeDefined();
    expect(figmaFile.document.children.length).toBeGreaterThan(0);
    
    const page = figmaFile.document.children[0];
    expect(page.type).toBe('CANVAS');
    expect(page.children).toBeDefined();
    
    const frame = page.children[0];
    expect(frame.type).toBe('FRAME');
    expect(frame.children).toBeDefined();
    expect(frame.children.length).toBe(3); // Should have 3 containers
    
    // Verify each container follows the pattern
    frame.children.forEach((container, index) => {
      const expectedName = `Item ${index + 1}`;
      expect(container.name).toBe(expectedName);
      expect(container.type).toBe('FRAME');
      expect(container.cornerRadius).toBe(8);
      
      // Check container has children
      expect(container.children).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
      
      // Check text nodes
      container.children.forEach((child) => {
        if (child.type === 'TEXT') {
          expect(child.style).toBeDefined();
          expect(['Product Item', '$'].some(pattern => child.characters.includes(pattern))).toBe(true);
        }
      });
    });
    
    console.log('✅ convertDataToFigmaFile follows the design pattern!');
  });

  it('generateFigmaFile should follow the design pattern', () => {
    const mockDesignSystem = {
      colors: {
        primary: '#18A0FB',
        secondary: '#000000',
        white: '#FFFFFF'
      },
      typography: {
        heading: {
          fontSize: 18,
          fontWeight: 500
        },
        body: {
          fontSize: 16,
          fontWeight: 400
        }
      },
      spacing: {
        small: 8,
        medium: 16,
        large: 24
      },
      borderRadius: {
        small: 8,
        medium: 12
      },
      shadows: {
        small: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      components: {}
    };
    
    const figmaFile = generateFigmaFile('Test Design System', mockDesignSystem);
    
    expect(figmaFile).toBeDefined();
    expect(figmaFile.name).toBe('Test Design System');
    expect(figmaFile.version).toBe('1.0.0');
    
    // Check structure
    expect(figmaFile.document).toBeDefined();
    expect(figmaFile.document.children).toBeDefined();
    expect(figmaFile.document.children.length).toBeGreaterThan(0);
    
    const page = figmaFile.document.children[0];
    expect(page.type).toBe('CANVAS');
    expect(page.children).toBeDefined();
    
    const frame = page.children[0];
    expect(frame.type).toBe('FRAME');
    expect(frame.children).toBeDefined();
    expect(frame.children.length).toBe(3); // Should have 3 containers
    
    // Verify each container follows the pattern
    frame.children.forEach((container, index) => {
      const expectedName = `Item ${index + 1}`;
      expect(container.name).toBe(expectedName);
      expect(container.type).toBe('FRAME');
      expect(container.cornerRadius).toBe(8);
      
      // Check container has children
      expect(container.children).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
      
      // Check text nodes
      container.children.forEach((child) => {
        if (child.type === 'TEXT') {
          expect(child.style).toBeDefined();
          expect(['Product Item', '$'].some(pattern => child.characters.includes(pattern))).toBe(true);
        }
      });
    });
    
    console.log('✅ generateFigmaFile follows the design pattern!');
  });
});