/**
 * Rate Limiting Middleware
 * Uses in-memory storage for development, Redis for production
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  keyGenerator?: (request: NextRequest) => string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.'
};

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const mergedConfig = { ...defaultConfig, ...config };

  return async function rateLimiter(request: NextRequest): Promise<NextResponse | null> {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : getClientIdentifier(request);

    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // New or expired window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + mergedConfig.windowMs
      });
      return null;
    }

    if (record.count >= mergedConfig.max) {
      // Rate limit exceeded
      const remainingTime = Math.ceil((record.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: mergedConfig.message,
          retryAfter: remainingTime
        },
        {
          status: 429,
          headers: {
            'Retry-After': remainingTime.toString(),
            'X-RateLimit-Limit': mergedConfig.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString()
          }
        }
      );
    }

    // Increment counter
    record.count++;
    rateLimitStore.set(key, record);

    return null;
  };
}

// Different rate limiters for different API routes
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute
  message: 'AI request limit exceeded. Please try again later.'
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: 'Upload limit exceeded. Please try again later.'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 auth attempts per minute
  message: 'Too many authentication attempts. Please try again later.'
});

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxy setups)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to IP from connection
  return 'unknown';
}

// Utility to apply rate limiting to API routes
export function withRateLimit(
  request: NextRequest,
  limiter: typeof apiRateLimiter
): Promise<NextResponse | null> {
  return limiter(request);
}
