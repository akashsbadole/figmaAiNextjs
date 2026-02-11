import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designSystem = await db.designSystem.findUnique({
      where: { id: params.id }
    })

    if (!designSystem) {
      return NextResponse.json(
        { error: 'Design system not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching design system:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch design system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designSystem = await db.designSystem.findUnique({
      where: { id: params.id }
    })

    if (!designSystem) {
      return NextResponse.json(
        { error: 'Design system not found' },
        { status: 404 }
      )
    }

    await db.designSystem.delete({
      where: { id: params.id }
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
