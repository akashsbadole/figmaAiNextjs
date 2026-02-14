/**
 * Standardized API Response Types
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
  rateLimit?: RateLimitMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RateLimitMeta {
  limit: number;
  remaining: number;
  resetAt: string;
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>
): APIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

// Error response helper
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
  requestId?: string
): APIResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId
    }
  };
}

// Pagination helper
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): APIResponse<T[]> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  };
}

// Common error codes
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  
  // AI errors
  AI_GENERATION_ERROR: 'AI_GENERATION_ERROR',
  AI_MODEL_UNAVAILABLE: 'AI_MODEL_UNAVAILABLE',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED'
} as const;

// HTTP status mapping
export const HTTP_STATUS_MAP: Record<string, number> = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.INVALID_REQUEST]: 400,
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.AI_GENERATION_ERROR]: 500,
  [ERROR_CODES.AI_MODEL_UNAVAILABLE]: 503,
  [ERROR_CODES.AI_QUOTA_EXCEEDED]: 429
};
