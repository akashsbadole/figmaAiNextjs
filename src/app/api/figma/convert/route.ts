import { NextRequest, NextResponse } from 'next/server'
import { convertDataToFigmaFile, convertDataToFigmaJson } from '@/lib/figma-generator'
import { figmaJsonToString, toFigmaJson } from '@/lib/figma-json-format'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Valid design data array is required' },
        { status: 400 }
      )
    }

    // Get the format query parameter
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'figma-json'

    if (format === 'figma-json') {
      // Convert to consistent Figma JSON format (array of containers)
      const figmaJson = convertDataToFigmaJson(data)
      
      return new NextResponse(figmaJsonToString(figmaJson), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="design.figma.json"',
        },
      })
    } else if (format === 'figma-file') {
      // Convert to full Figma file format (for backward compatibility)
      const figmaFile = convertDataToFigmaFile(data)

      return new NextResponse(JSON.stringify(figmaFile, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="design.figma.json"',
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format. Use: figma-json or figma-file' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error converting design data to Figma format:', error)
    return NextResponse.json(
      {
        error: 'Failed to convert design data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}