import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const designSystem = await db.designSystem.findUnique({
      where: { id }
    })

    if (!designSystem) {
      return NextResponse.json(
        { error: 'Design system not found' },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    // Parse JSON fields - use type assertion to bypass TypeScript check until Prisma is regenerated
    const responseData: any = {
      id: designSystem.id,
      name: designSystem.name,
      description: designSystem.description,
      prompt: designSystem.prompt,
      colors: JSON.parse(designSystem.colors),
      typography: JSON.parse(designSystem.typography),
      spacing: JSON.parse(designSystem.spacing),
      borderRadius: JSON.parse(designSystem.borderRadius),
      shadows: JSON.parse(designSystem.shadows),
      components: JSON.parse(designSystem.components),
      industry: designSystem.industry,
      version: designSystem.version,
      isPublic: designSystem.isPublic,
      shareSlug: designSystem.shareSlug,
      createdAt: designSystem.createdAt,
      updatedAt: designSystem.updatedAt
    }
    
    // Add advanced options if they exist
    if ((designSystem as any).designPreferences) {
      responseData.designPreferences = JSON.parse((designSystem as any).designPreferences)
    }
    if ((designSystem as any).selectedComponents) {
      responseData.selectedComponents = JSON.parse((designSystem as any).selectedComponents)
    }
    if ((designSystem as any).customTokens) {
      responseData.customTokens = JSON.parse((designSystem as any).customTokens)
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Error fetching design system:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const designSystem = await db.designSystem.findUnique({
      where: { id }
    })

    if (!designSystem) {
      return NextResponse.json(
        { error: 'Design system not found' },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    // Update design system with Figma sync data
    const updated = await db.designSystem.update({
      where: { id },
      data: {
        figmaFileKey: body.figmaFileKey,
        lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt) : undefined,
        syncStatus: body.syncStatus,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Design system updated successfully',
      data: {
        id: updated.id,
        figmaFileKey: updated.figmaFileKey,
        lastSyncedAt: updated.lastSyncedAt,
        syncStatus: updated.syncStatus
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Error updating design system:', error)
    return NextResponse.json(
      {
        error: 'Failed to update design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const designSystem = await db.designSystem.findUnique({
      where: { id }
    })

    if (!designSystem) {
      return NextResponse.json(
        { error: 'Design system not found' },
        { status: 404 }
      )
    }

    await db.designSystem.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Design system deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting design system:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
