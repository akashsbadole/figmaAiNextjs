import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
            hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        },
        versions: {
            node: process.version,
            platform: process.platform,
        }
    })
}
