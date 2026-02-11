import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // For now, get all public systems or systems by the default user
    const designSystems = await db.designSystem.findMany({
      where: {
        OR: [
          { isPublic: true },
          { user: { email: 'default@designai.com' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const total = await db.designSystem.count({
      where: {
        OR: [
          { isPublic: true },
          { user: { email: 'default@designai.com' } }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      designSystems: designSystems.map(ds => ({
        id: ds.id,
        name: ds.name,
        description: ds.description,
        industry: ds.industry,
        isPublic: ds.isPublic,
        shareSlug: ds.shareSlug,
        version: ds.version,
        createdAt: ds.createdAt,
        updatedAt: ds.updatedAt,
        user: ds.user
      })),
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching design systems:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch design systems',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
