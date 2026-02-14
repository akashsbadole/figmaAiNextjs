/**
 * Figma OAuth Connection API Route
 * 
 * Handles OAuth2 authentication flow with Figma.
 * Initiates OAuth flow, exchanges codes for tokens, and manages connections.
 * 
 * @route /api/figma/connect
 */

import { NextRequest, NextResponse } from 'next/server';
import FigmaApiClient from '@/lib/figma/api-client';

// ============================================================================
// Types
// ============================================================================

/**
 * OAuth connection response
 */
interface OAuthResponse {
  /** Authorization URL to redirect user to */
  authUrl?: string;
  /** Connection status */
  connected: boolean;
  /** User info if connected */
  user?: {
    id: string;
    email: string;
    handle: string;
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// GET: Initiate OAuth Flow
// ============================================================================

/**
 * Initiate Figma OAuth2 flow
 * 
 * @param request - Next.js request
 * @returns OAuth authorization URL or error
 */
export async function GET(request: NextRequest): Promise<NextResponse<OAuthResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Create Figma client
    const figma = new FigmaApiClient();

    // Handle different actions
    switch (action) {
      case 'authorize':
        // Generate authorization URL
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/figma/callback`;
        const state = generateState();
        
        const authUrl = figma.getAuthorizationUrl(
          redirectUri,
          state,
          'file_read'
        );

        return NextResponse.json({
          authUrl,
          connected: false
        });

      case 'me':
        // Get current user info
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
          return NextResponse.json({
            connected: false,
            error: 'No access token provided'
          }, { status: 401 });
        }

        figma.setAccessToken(token);
        const userResponse = await figma.getMe();

        if (userResponse.error) {
          return NextResponse.json({
            connected: false,
            error: userResponse.error.message
          }, { status: userResponse.error.status });
        }

        return NextResponse.json({
          connected: true,
          user: userResponse.data ? {
            id: userResponse.data.id,
            email: userResponse.data.email,
            handle: userResponse.data.handle
          } : undefined
        });

      default:
        return NextResponse.json({
          connected: false,
          error: 'Invalid action. Use ?action=authorize or ?action=me'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Figma OAuth error:', error);
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// ============================================================================
// POST: Exchange Code for Token
// ============================================================================

/**
 * Exchange OAuth authorization code for access token
 * 
 * @param request - Next.js request with authorization code
 * @returns Access token response
 */
export async function POST(request: NextRequest): Promise<NextResponse<{
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
}>> {
  try {
    const body = await request.json();
    const { code, refresh_token } = body;

    const figma = new FigmaApiClient();

    // Check if we're refreshing a token or exchanging a code
    if (refresh_token) {
      // Refresh expired token
      const tokenResponse = await figma.refreshAccessToken(refresh_token);
      
      return NextResponse.json({
        success: true,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in
      });
    }

    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Authorization code or refresh token required'
      }, { status: 400 });
    }

    // Exchange code for token
    const tokenResponse = await figma.exchangeCodeForToken(code);

    return NextResponse.json({
      success: true,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to exchange token'
    }, { status: 500 });
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate secure state parameter for OAuth
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// Export
// ============================================================================

export type { OAuthResponse };
