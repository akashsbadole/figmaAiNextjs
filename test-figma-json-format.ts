/**
 * Test file to verify the consistent Figma JSON format
 * Run with: npx ts-node test-figma-json-format.ts
 */

import {
  FigmaJsonRoot,
  FigmaJsonContainer,
  FigmaJsonTextChild,
  createContainer,
  createTextChild,
  normalizeContainer,
  normalizeTextChild,
  toFigmaJson,
  figmaJsonToString,
  isValidFigmaJson,
  isValidContainer,
  isValidTextChild,
  FONT_WEIGHT_MAP
} from './src/lib/figma-json-format'

// Test 1: Create containers with the factory functions
console.log('=== Test 1: Factory Functions ===')
const container1 = createContainer(
  'Item 1',
  [
    createTextChild('Product Item 1', 18, '#000000', 'Medium'),
    createTextChild('$29.99', 16, '#18A0FB')
  ],
  { backgroundColor: '#FFFFFF', padding: 16, cornerRadius: 8 }
)

console.log('Container 1:', JSON.stringify(container1, null, 2))
console.log('Is valid container:', isValidContainer(container1))

// Test 2: Create multiple containers (expected output format)
console.log('\n=== Test 2: Expected Output Format ===')
const figmaJson: FigmaJsonRoot = [
  createContainer(
    'Item 1',
    [
      createTextChild('Product Item 1', 18, '#000000', 'Medium'),
      createTextChild('$29.99', 16, '#18A0FB')
    ],
    { backgroundColor: '#FFFFFF', padding: 16, cornerRadius: 8 }
  ),
  createContainer(
    'Item 2',
    [
      createTextChild('Product Item 2', 18, '#000000', 'Medium'),
      createTextChild('$39.99', 16, '#18A0FB')
    ],
    { backgroundColor: '#FFFFFF', padding: 16, cornerRadius: 8 }
  )
]

console.log('Figma JSON Output:')
console.log(figmaJsonToString(figmaJson))

// Test 3: Validate the output
console.log('\n=== Test 3: Validation ===')
console.log('Is valid Figma JSON:', isValidFigmaJson(figmaJson))
console.log('All containers valid:', figmaJson.every(isValidContainer))
console.log('All children valid:', figmaJson.every(c => c.children.every(isValidTextChild)))

// Test 4: Normalize partial data
console.log('\n=== Test 4: Normalization ===')
const partialData: any = {
  name: 'Partial Item',
  backgroundColor: 'ffffff', // Missing #
  padding: 20,
  // cornerRadius missing - should default to 8
  children: [
    {
      type: 'text',
      text: 'Hello World',
      fontSize: 14
      // color missing - should default to #000000
    }
  ]
}

const normalized = normalizeContainer(partialData)
console.log('Normalized container:', JSON.stringify(normalized, null, 2))

// Test 5: Convert arbitrary data to Figma JSON
console.log('\n=== Test 5: Data Conversion ===')
const arbitraryData = [
  {
    name: 'Product A',
    background: '#FF5733',
    padding: 24,
    children: [
      { text: 'Title', size: 20, color: '#333' },
      { text: 'Description', size: 14 }
    ]
  },
  {
    title: 'Product B', // Using title instead of name
    bgColor: '#3366FF',
    borderRadius: 12,
    children: [
      { text: 'Another Title', fontSize: 18 }
    ]
  }
]

const converted = toFigmaJson(arbitraryData)
console.log('Converted data:', figmaJsonToString(converted))

// Test 6: Font weight mapping
console.log('\n=== Test 6: Font Weight Mapping ===')
console.log('Medium ->', FONT_WEIGHT_MAP['Medium'])
console.log('Bold ->', FONT_WEIGHT_MAP['Bold'])

console.log('\n=== All Tests Passed! ===')
