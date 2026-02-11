import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json'

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

    // Get design
    const design = await db.figmaDesign.findUnique({
      where: { id: params.id }
    })

    if (!design || (design.userId !== user.id && !design.isPublic)) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    const designData = JSON.parse(design.designData)

    if (format === 'json') {
      return new NextResponse(JSON.stringify(designData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${design.name.replace(/\s+/g, '-').toLowerCase()}.figma.json"`,
        },
      })
    } else if (format === 'figma-plugin') {
      // Format for Figma Tokens plugin
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
      { error: 'Invalid format. Use: json or figma-plugin' },
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
