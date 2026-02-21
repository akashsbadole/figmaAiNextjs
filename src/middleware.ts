import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes with proper wildcard patterns
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/generate(.*)',
  '/api/health(.*)',
  '/api/test-db(.*)',
  '/figma(.*)',
  '/_next(.*)',
  '/favicon.ico(.*)',
  '/logo.png(.*)',
  '/robots.txt(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that aren't public
  if (!isPublicRoute(req)) {
    // auth.protect() will redirect to sign-in if not authenticated
    await auth.protect()
  }

  // Add Cross-Origin headers for WebContainer support
  const response = NextResponse.next()

  // These headers are required for SharedArrayBuffer (WebContainer)
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
