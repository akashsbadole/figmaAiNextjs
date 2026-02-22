import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const authorized = await isAdmin()
    
    return NextResponse.json({
      isAuthorized: authorized
    })
  } catch (error) {
    console.error('Error checking admin auth:', error)
    return NextResponse.json({
      isAuthorized: false
    })
  }
}