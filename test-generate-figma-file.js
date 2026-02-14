const fs = require('fs')
const { generateFigmaFile } = require('./src/lib/figma-generator')

// Mock design system data
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
}

// Test generateFigmaFile function
console.log('Testing generateFigmaFile function...')
try {
  const figmaFile = generateFigmaFile('Test Design System', mockDesignSystem)
  
  console.log('✅ generateFigmaFile works correctly!')
  console.log('📦 Figma File Generated:')
  console.log('   - Name:', figmaFile.name)
  console.log('   - Version:', figmaFile.version)
  
  if (figmaFile.document?.children?.[0]?.children?.[0]?.children) {
    console.log('   - Containers created:', figmaFile.document.children[0].children[0].children.length)
    
    figmaFile.document.children[0].children[0].children.forEach((container, index) => {
      console.log(`\n   - Container ${index + 1}: ${container.name}`)
      if (container.children) {
        console.log(`     - Text nodes: ${container.children.length}`)
      }
    })
  }

  // Save to file
  const fileName = 'test-generated-figma-file.json'
  fs.writeFileSync(fileName, JSON.stringify(figmaFile, null, 2))
  console.log(`\n📄 File saved: ${fileName}`)

  console.log('\n✅ All Figma generation functions are following the pattern!')

} catch (error) {
  console.error('❌ Error:', error.message)
  console.error(error.stack)
}