const testData = [
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
]

async function testConversion() {
  try {
    console.log('Testing Figma conversion API...')
    
    const response = await fetch('http://localhost:3000/api/figma/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      return
    }

    const figmaFile = await response.json()
    console.log('✅ Conversion successful!')
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
    const fs = require('fs')
    const fileName = 'test-design.figma.json'
    fs.writeFileSync(fileName, JSON.stringify(figmaFile, null, 2))
    console.log(`\n📄 File saved: ${fileName}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testConversion()