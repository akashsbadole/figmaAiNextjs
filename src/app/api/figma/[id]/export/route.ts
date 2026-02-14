import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { 
  convertDesignSystemToFigmaJson,
  convertDataToFigmaJson
} from '@/lib/figma-generator'
import { 
  figmaJsonToString,
  createContainer,
  createTextChild,
  FigmaJsonRoot
} from '@/lib/figma-json-format'
import { createFigmaJsonExport } from '@/lib/figmagic-exporter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'figma-json'

    // Find user
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Try to find as FigmaDesign first
    let design = await db.figmaDesign.findUnique({
      where: { id }
    })

    // If not found, try DesignSystem
    if (!design) {
      const designSystem = await db.designSystem.findUnique({
        where: { id }
      })

      if (designSystem && (designSystem.userId === user.id || designSystem.isPublic)) {
        // Use the consistent Figma JSON format
        if (format === 'figma-json') {
          const figmaJson = createFigmaJsonExport(designSystem)
          
          return new NextResponse(figmaJsonToString(figmaJson), {
            headers: {
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="${designSystem.name.replace(/\s+/g, '-').toLowerCase()}.figma.json"`,
            },
          })
        } else if (format === 'json') {
          // Full design system data
          const colors = JSON.parse(designSystem.colors)
          const typography = JSON.parse(designSystem.typography)
          const spacing = JSON.parse(designSystem.spacing)
          const borderRadius = JSON.parse(designSystem.borderRadius)
          const shadows = JSON.parse(designSystem.shadows)

          const designData = {
            name: designSystem.name,
            description: designSystem.description,
            styles: {
              colors,
              typography,
              spacing,
              borderRadius,
              shadows
            }
          }

          return new NextResponse(JSON.stringify(designData, null, 2), {
            headers: {
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="${designSystem.name.replace(/\s+/g, '-').toLowerCase()}.json"`,
            },
          })
        } else if (format === 'figma-plugin') {
          // Figma plugin tokens format
          const colors = JSON.parse(designSystem.colors)
          const typography = JSON.parse(designSystem.typography)
          const spacing = JSON.parse(designSystem.spacing)
          const borderRadius = JSON.parse(designSystem.borderRadius)
          const shadows = JSON.parse(designSystem.shadows)

          const tokensData = {
            global: {
              colors,
              typography,
              spacing,
              borderRadius,
              shadows
            },
            meta: {
              name: designSystem.name,
              description: designSystem.description,
              createdAt: designSystem.createdAt
            }
          }

          return new NextResponse(JSON.stringify(tokensData, null, 2), {
            headers: {
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-tokens.json"`,
            },
          })
        }
      }

      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    // Check access for FigmaDesign
    if (design.userId !== user.id && !design.isPublic) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    const designData = JSON.parse(design.designData)

    if (format === 'figma-json') {
      // Convert to consistent Figma JSON format
      const figmaJson = convertDataToFigmaJson(Array.isArray(designData) ? designData : [designData])
      
      return new NextResponse(figmaJsonToString(figmaJson), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${design.name.replace(/\s+/g, '-').toLowerCase()}.figma.json"`,
        },
      })
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(designData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${design.name.replace(/\s+/g, '-').toLowerCase()}.json"`,
        },
      })
    } else if (format === 'figma-plugin') {
      const tokensData = {
        global: designData.styles || {},
        meta: {
          name: design.name,
          description: design.description,
          createdAt: design.createdAt
        }
      }

      return new NextResponse(JSON.stringify(tokensData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${design.name.replace(/\s+/g, '-').toLowerCase()}-tokens.json"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format. Use: figma-json, json, or figma-plugin' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting Figma design:', error)
    return NextResponse.json(
      {
        error: 'Failed to export design',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
