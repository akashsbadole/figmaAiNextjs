import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { 
  convertDesignSystemToFigma, 
  downloadFigmaFile, 
  generateFigmaPluginTokens,
  FigmaFile 
} from '@/lib/figma-generator'
import { 
  createTokensStudioExport,
  convertToTokensStudio 
} from '@/lib/figmagic-exporter'

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
    const format = searchParams.get('format') || 'figma-json'
    const includeComponents = searchParams.get('includeComponents') !== 'false'

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

    // Get design system
    const designSystem = await db.designSystem.findUnique({
      where: { id: params.id }
    })

    if (!designSystem || (designSystem.userId !== user.id && !designSystem.isPublic)) {
      return NextResponse.json(
        { error: 'Design system not found' },
        { status: 404 }
      )
    }

    // Generate Figma file based on format
    if (format === 'tokens-studio') {
      // Generate Tokens Studio (Figmagic) format for Figma import
      const tokensData = createTokensStudioExport(designSystem)
      
      return new NextResponse(JSON.stringify(tokensData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-tokens-studio.json"`,
        },
      })
    }

    if (format === 'figma-plugin') {
      // Generate Figma Tokens plugin format
      const tokensData = generateFigmaPluginTokens(designSystem)
      
      return new NextResponse(JSON.stringify(tokensData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${designSystem.name.replace(/\s+/g, '-').toLowerCase()}-tokens.json"`,
        },
      })
    }

    // Default: Generate Figma JSON format
    const figmaFile: FigmaFile = convertDesignSystemToFigma(designSystem, includeComponents)
    
    return new NextResponse(JSON.stringify(figmaFile, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${designSystem.name.replace(/\s+/g, '-').toLowerCase()}.figma.json"`,
      },
    })

  } catch (error) {
    console.error('Error exporting to Figma:', error)
    return NextResponse.json(
      {
        error: 'Failed to export design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
