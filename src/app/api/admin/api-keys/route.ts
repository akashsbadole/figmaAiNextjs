import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Simple encryption for API keys (use a proper key management system in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function GET() {
  try {
    await requireAdmin()

    const apiKeys = await db.aPIKey.findMany({
      orderBy: [
        { provider: 'asc' },
        { isPrimary: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map(key => ({
        id: key.id,
        provider: key.provider,
        name: key.name,
        isActive: key.isActive,
        isPrimary: key.isPrimary,
        rateLimitRpm: key.rateLimitRpm,
        rateLimitTpm: key.rateLimitTpm,
        totalCost: key.totalCost,
        monthlyCost: key.monthlyCost,
        costLimit: key.costLimit,
        totalRequests: key.totalRequests,
        lastUsedAt: key.lastUsedAt,
        version: key.version,
        rotatedAt: key.rotatedAt,
        createdAt: key.createdAt,
        // Don't return the actual key
        keyPreview: '••••••••' + (key.key.length > 8 ? key.key.slice(-4) : '')
      }))
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { provider, name, key, rateLimitRpm, rateLimitTpm, costLimit, isPrimary } = body

    if (!provider || !name || !key) {
      return NextResponse.json(
        { error: 'Provider, name, and key are required' },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders = ['google', 'openai', 'anthropic']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: google, openai, anthropic' },
        { status: 400 }
      )
    }

    // Encrypt the key
    const encryptedKey = encrypt(key)

    // If this is set as primary, unset other primary keys for this provider
    if (isPrimary) {
      await db.aPIKey.updateMany({
        where: { provider, isPrimary: true },
        data: { isPrimary: false }
      })
    }

    const apiKey = await db.aPIKey.create({
      data: {
        provider,
        name,
        key: encryptedKey,
        rateLimitRpm,
        rateLimitTpm,
        costLimit,
        isPrimary: isPrimary || false
      }
    })

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        provider: apiKey.provider,
        name: apiKey.name,
        isActive: apiKey.isActive,
        isPrimary: apiKey.isPrimary
      }
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, isActive, isPrimary, rateLimitRpm, rateLimitTpm, costLimit } = body

    if (!id) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary keys for this provider
    if (isPrimary) {
      const existingKey = await db.aPIKey.findUnique({ where: { id } })
      if (existingKey) {
        await db.aPIKey.updateMany({
          where: { provider: existingKey.provider, isPrimary: true },
          data: { isPrimary: false }
        })
      }
    }

    const apiKey = await db.aPIKey.update({
      where: { id },
      data: {
        isActive,
        isPrimary,
        rateLimitRpm,
        rateLimitTpm,
        costLimit
      }
    })

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        provider: apiKey.provider,
        name: apiKey.name,
        isActive: apiKey.isActive,
        isPrimary: apiKey.isPrimary
      }
    })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    await db.aPIKey.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'API key deleted'
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}

// Export decrypt function for internal use
export { decrypt }