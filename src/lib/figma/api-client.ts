/**
 * Figma API Client
 * 
 * A comprehensive client for interacting with the Figma REST API.
 * Supports OAuth2 authentication, file operations, component extraction,
 * style management, and team workspace operations.
 * 
 * @module figma/api-client
 */

// In-memory rate limit store for Figma API
const figmaRateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

/**
 * Simple in-memory rate limiter for Figma API requests
 */
function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = figmaRateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    figmaRateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetTime: now + config.windowMs };
  }

  if (record.count >= config.max) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  figmaRateLimitStore.set(key, record);
  return { allowed: true, remaining: config.max - record.count, resetTime: record.resetTime };
}

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Figma API configuration options
 */
export interface FigmaClientConfig {
  /** OAuth2 access token */
  accessToken?: string;
  /** Personal access token (alternative to OAuth) */
  personalAccessToken?: string;
  /** Rate limiting window in milliseconds */
  rateLimitWindowMs?: number;
  /** Maximum requests per rate limit window */
  maxRequestsPerWindow?: number;
  /** Base URL for Figma API (for testing) */
  baseUrl?: string;
  /** Timeout for requests in milliseconds */
  timeout?: number;
}

/**
 * Figma API response wrapper
 */
export interface FigmaApiResponse<T> {
  /** Response data */
  data: T | null;
  /** Error object if request failed */
  error: FigmaApiError | null;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Rate limit information */
  rateLimit: RateLimitInfo;
}

/**
 * Rate limit information from Figma API response
 */
export interface RateLimitInfo {
  /** Maximum requests allowed */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Reset time for rate limit window */
  resetAt: Date;
}

/**
 * Figma API error details
 */
export interface FigmaApiError {
  /** Error message */
  message: string;
  /** Error status code */
  status: number;
  /** Error code (e.g., 'ERR_RATE_LIMITED') */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Figma user account information
 */
export interface FigmaUser {
  /** User ID */
  id: string;
  /** User's email */
  email: string;
  /** User's display name */
  handle: string;
  /** URL to user's avatar image */
  imgUrl: string;
}

/**
 * Figma file information
 */
export interface FigmaFileInfo {
  /** File key (unique identifier) */
  key: string;
  /** File name */
  name: string;
  /** File thumbnail URL */
  thumbnailUrl: string;
  /** Last modified timestamp */
  lastModified: string;
  /** File version */
  version: string;
  /** File owner's user info */
  owner?: FigmaUser;
  /** Team info if file is in a team */
  team?: {
    id: string;
    name: string;
  };
}

/**
 * Figma component definition
 */
export interface FigmaComponent {
  /** Component key (unique identifier) */
  key: string;
  /** Component name */
  name: string;
  /** Component description */
  description: string;
  /** Documentation links */
  documentationLinks?: string[];
  /** Component's containing page */
  containingPage?: {
    id: string;
    name: string;
  };
  /** Component's containing frame */
  containingFrame?: {
    id: string;
    name: string;
  };
  /** Date component was created */
  createdAt: string;
  /** Date component was last updated */
  updatedAt: string;
}

/**
 * Figma style definition
 */
export interface FigmaStyle {
  /** Style key (unique identifier) */
  key: string;
  /** Style name */
  name: string;
  /** Style type */
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  /** Style description */
  description: string;
  /** Date style was created */
  createdAt: string;
  /** Date style was last updated */
  updatedAt: string;
}

/**
 * Figma team information
 */
export interface FigmaTeam {
  /** Team ID */
  id: string;
  /** Team name */
  name: string;
}

/**
 * Figma project within a team
 */
export interface FigmaProject {
  /** Project ID */
  id: string;
  /** Project name */
  name: string;
  /** Team ID */
  teamId: string;
}

/**
 * Figma comment
 */
export interface FigmaComment {
  /** Comment ID */
  id: string;
  /** Comment message */
  message: string;
  /** User who created the comment */
  user: FigmaUser;
  /** Timestamp of comment creation */
  createdAt: string;
  /** Timestamp of last edit */
  updatedAt: string;
  /** File key this comment belongs to */
  fileKey: string;
  /** Parent comment ID (for replies) */
  parentId?: string;
  /** Resolved status */
  resolved: boolean;
  /** Position on canvas (x, y) */
  clientMeta?: {
    x: number;
    y: number;
  };
}

/**
 * Figma webhook event payload
 */
export interface FigmaWebhookPayload {
  /** Event type */
  eventType: string;
  /** Timestamp of event */
  timestamp: string;
  /** Webhook configuration ID */
  webhookId: string;
  /** Pass-through parameter from webhook setup */
  passcode: string;
  /** File information */
  file?: {
    key: string;
    name: string;
    thumbnailUrl: string;
  };
  /** User who triggered the event */
  triggeredBy?: FigmaUser;
}

/**
 * Figma webhook configuration
 */
export interface FigmaWebhook {
  /** Webhook ID */
  id: string;
  /** Webhook event types */
  eventType: string;
  /** Webhook endpoint URL */
  endpoint: string;
  /** Pass-through parameter */
  passcode: string;
  /** Webhook status */
  active: boolean;
}

/**
 * Figma file version
 */
export interface FigmaVersion {
  /** Version ID */
  id: string;
  /** Version label (e.g., "1.2.0") */
  label: string;
  /** Description of changes */
  description: string;
  /** User who created the version */
  user: FigmaUser;
  /** Timestamp of version creation */
  createdAt: string;
  /** File size at this version */
  size: number;
}

// ============================================================================
// Figma API Client Class
// ============================================================================

/**
 * Figma API Client
 * 
 * Provides methods for interacting with the Figma REST API including:
 * - Authentication (OAuth2 and personal access tokens)
 * - File operations (get, update, delete)
 * - Component and style extraction
 * - Team and project management
 * - Comments and collaboration
 * - Webhook management
 * 
 * @example
 * ```typescript
 * const figma = new FigmaApiClient({
 *   personalAccessToken: process.env.FIGMA_ACCESS_TOKEN
 * });
 * 
 * const file = await figma.getFile('abc123xyz');
 * console.log(file.data.name);
 * ```
 */
export class FigmaApiClient {
  private accessToken: string | null = null;
  private personalAccessToken: string | null = null;
  private baseUrl: string;
  private timeout: number;
  private async checkRateLimit(): Promise<boolean> {
    const result = checkRateLimit('figma-api', this.rateLimitConfig);
    this.rateLimitInfo.remaining = result.remaining;
    this.rateLimitInfo.resetAt = new Date(result.resetTime);
    return result.allowed;
  }
  private rateLimitInfo: RateLimitInfo;
  private rateLimitConfig: RateLimitConfig;

  /**
   * Create a new Figma API client
   * 
   * @param config - Client configuration options
   */
  constructor(config: FigmaClientConfig = {}) {
    this.accessToken = config.accessToken || null;
    this.personalAccessToken = config.personalAccessToken || null;
    this.baseUrl = config.baseUrl || 'https://api.figma.com/v1';
    this.timeout = config.timeout || 30000;
    
    this.rateLimitConfig = {
      windowMs: config.rateLimitWindowMs || 60 * 1000, // 1 minute
      max: config.maxRequestsPerWindow || 120 // Figma's limit
    };
    
    this.rateLimitInfo = {
      limit: this.rateLimitConfig.max,
      remaining: this.rateLimitConfig.max,
      resetAt: new Date(Date.now() + this.rateLimitConfig.windowMs)
    };
  }

  // =========================================================================
  // Authentication Methods
  // =========================================================================

  /**
   * Set OAuth2 access token
   * 
   * @param token - OAuth2 access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Set personal access token
   * 
   * @param token - Personal access token
   */
  setPersonalAccessToken(token: string): void {
    this.personalAccessToken = token;
  }

  /**
   * Get authorization URL for OAuth2 flow
   * 
   * @param redirectUri - URI to redirect after authorization
   * @param state - State parameter for CSRF protection
   * @param scope - OAuth2 scopes (comma-separated)
   * @returns Authorization URL
   */
  getAuthorizationUrl(
    redirectUri: string,
    state: string,
    scope: string = 'file_read'
  ): string {
    const clientId = process.env.FIGMA_CLIENT_ID;
    if (!clientId) {
      throw new Error('FIGMA_CLIENT_ID not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      response_type: 'code'
    });

    return `https://www.figma.com/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * 
   * @param code - Authorization code from OAuth callback
   * @returns OAuth2 token response
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const clientId = process.env.FIGMA_CLIENT_ID;
    const clientSecret = process.env.FIGMA_CLIENT_SECRET;
    const redirectUri = process.env.FIGMA_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Figma OAuth credentials not configured');
    }

    const response = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to exchange code: ${error.error_description || error.error}`);
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   * 
   * @param refreshToken - Refresh token from original OAuth response
   * @returns New OAuth2 token response
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const clientId = process.env.FIGMA_CLIENT_ID;
    const clientSecret = process.env.FIGMA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Figma OAuth credentials not configured');
    }

    const response = await fetch('https://www.figma.com/api/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${error.error_description || error.error}`);
    }

    return response.json();
  }

  // =========================================================================
  // File Operations
  // =========================================================================

  /**
   * Get file information
   * 
   * @param fileKey - Figma file key
   * @param options - Options for what to include in response
   * @returns Figma file data
   */
  async getFile(
    fileKey: string,
    options: {
      version?: string;
      ids?: string[];
      depth?: number;
      geometry?: 'paths' | 'none';
    } = {}
  ): Promise<FigmaApiResponse<FigmaFileInfo>> {
    const params = new URLSearchParams();
    
    if (options.version) params.set('version', options.version);
    if (options.ids?.length) params.set('ids', options.ids.join(','));
    if (options.depth) params.set('depth', options.depth.toString());
    if (options.geometry) params.set('geometry', options.geometry);

    return this.request<FigmaFileInfo>(`/files/${fileKey}?${params.toString()}`);
  }

  /**
   * Get file nodes (specific parts of a file)
   * 
   * @param fileKey - Figma file key
   * @param nodeIds - Array of node IDs to retrieve
   * @returns Node data for requested IDs
   */
  async getFileNodes(
    fileKey: string,
    nodeIds: string[]
  ): Promise<FigmaApiResponse<Record<string, unknown>>> {
    const params = new URLSearchParams();
    params.set('ids', nodeIds.join(','));

    return this.request<Record<string, unknown>>(`/files/${fileKey}/nodes?${params.toString()}`);
  }

  /**
   * Get images for file nodes
   * 
   * @param fileKey - Figma file key
   * @param nodeIds - Array of node IDs to render
   * @param options - Image rendering options
   * @returns URLs and metadata for rendered images
   */
  async getImages(
    fileKey: string,
    nodeIds: string[],
    options: {
      scale?: number;
      format?: 'jpg' | 'png' | 'svg' | 'pdf';
      contentsOnly?: boolean;
      useAbsoluteBounds?: boolean;
    } = {}
  ): Promise<FigmaApiResponse<Record<string, string>>> {
    const params = new URLSearchParams();
    params.set('ids', nodeIds.join(','));
    
    if (options.scale) params.set('scale', options.scale.toString());
    if (options.format) params.set('format', options.format);
    if (options.contentsOnly) params.set('contents_only', 'true');
    if (options.useAbsoluteBounds) params.set('use_absolute_bounds', 'true');

    return this.request<Record<string, string>>(`/images/${fileKey}?${params.toString()}`);
  }

  /**
   * Get image fills (get image URLs used as fills)
   * 
   * @param fileKey - Figma file key
   * @returns URLs for images used as fills
   */
  async getImageFills(
    fileKey: string
  ): Promise<FigmaApiResponse<Record<string, string>>> {
    return this.request<Record<string, string>>(`/files/${fileKey}/images`);
  }

  /**
   * Get file versions
   * 
   * @param fileKey - Figma file key
   * @returns List of file versions
   */
  async getFileVersions(
    fileKey: string
  ): Promise<FigmaApiResponse<{ versions: FigmaVersion[] }>> {
    return this.request<{ versions: FigmaVersion[] }>(`/files/${fileKey}/versions`);
  }

  // =========================================================================
  // Component Operations
  // =========================================================================

  /**
   * Get components from a file
   * 
   * @param fileKey - Figma file key
   * @returns Components in the file
   */
  async getFileComponents(
    fileKey: string
  ): Promise<FigmaApiResponse<{ meta: { components: FigmaComponent[] } }>> {
    return this.request<{ meta: { components: FigmaComponent[] } }>(`/files/${fileKey}/components`);
  }

  /**
   * Get component sets from a file (for variants)
   * 
   * @param fileKey - Figma file key
   * @returns Component sets in the file
   */
  async getFileComponentSets(
    fileKey: string
  ): Promise<FigmaApiResponse<{ meta: { component_sets: FigmaComponent[] } }>> {
    return this.request<{ meta: { component_sets: FigmaComponent[] } }>(`/files/${fileKey}/component_sets`);
  }

  /**
   * Get a specific component
   * 
   * @param componentKey - Component key
   * @returns Component data
   */
  async getComponent(
    componentKey: string
  ): Promise<FigmaApiResponse<FigmaComponent>> {
    return this.request<FigmaComponent>(`/components/${componentKey}`);
  }

  /**
   * Get component set (variants)
   * 
   * @param componentSetKey - Component set key
   * @returns Component set with variants
   */
  async getComponentSet(
    componentSetKey: string
  ): Promise<FigmaApiResponse<{
    meta: {
      component_set: FigmaComponent;
      components: Array<{
        key: string;
        name: string;
        description: string;
        properties: Record<string, unknown>;
      }>;
    };
  }>> {
    return this.request(`/component_sets/${componentSetKey}`);
  }

  // =========================================================================
  // Style Operations
  // =========================================================================

  /**
   * Get styles from a file
   * 
   * @param fileKey - Figma file key
   * @returns Styles in the file
   */
  async getFileStyles(
    fileKey: string
  ): Promise<FigmaApiResponse<{ meta: { styles: FigmaStyle[] } }>> {
    return this.request<{ meta: { styles: FigmaStyle[] } }>(`/files/${fileKey}/styles`);
  }

  /**
   * Get a specific style
   * 
   * @param styleKey - Style key
   * @returns Style data
   */
  async getStyle(
    styleKey: string
  ): Promise<FigmaApiResponse<FigmaStyle>> {
    return this.request<FigmaStyle>(`/styles/${styleKey}`);
  }

  // =========================================================================
  // Team Operations
  // =========================================================================

  /**
   * Get current user info
   * 
   * @returns Current authenticated user
   */
  async getMe(): Promise<FigmaApiResponse<FigmaUser>> {
    return this.request<FigmaUser>('/me');
  }

  /**
   * Get user's team list
   * 
   * @returns Teams the user belongs to
   */
  async getTeams(): Promise<FigmaApiResponse<{ teams: FigmaTeam[] }>> {
    return this.request<{ teams: FigmaTeam[] }>('/teams');
  }

  /**
   * Get projects in a team
   * 
   * @param teamId - Team ID
   * @returns Projects in the team
   */
  async getTeamProjects(
    teamId: string
  ): Promise<FigmaApiResponse<{ projects: FigmaProject[] }>> {
    return this.request<{ projects: FigmaProject[] }>(`/teams/${teamId}/projects`);
  }

  /**
   * Get files in a project
   * 
   * @param projectId - Project ID
   * @returns Files in the project
   */
  async getProjectFiles(
    projectId: string
  ): Promise<FigmaApiResponse<{ files: FigmaFileInfo[] }>> {
    return this.request<{ files: FigmaFileInfo[] }>(`/projects/${projectId}/files`);
  }

  // =========================================================================
  // Comment Operations
  // =========================================================================

  /**
   * Get comments on a file
   * 
   * @param fileKey - Figma file key
   * @returns Comments on the file
   */
  async getComments(
    fileKey: string
  ): Promise<FigmaApiResponse<{ comments: FigmaComment[] }>> {
    return this.request<{ comments: FigmaComment[] }>(`/files/${fileKey}/comments`);
  }

  /**
   * Post a comment on a file
   * 
   * @param fileKey - Figma file key
   * @param message - Comment message
   * @param position - Position on canvas (optional)
   * @param clientMeta - Additional metadata (optional)
   * @returns Created comment
   */
  async postComment(
    fileKey: string,
    message: string,
    position?: { x: number; y: number },
    clientMeta?: Record<string, unknown>
  ): Promise<FigmaApiResponse<FigmaComment>> {
    const body: Record<string, unknown> = { message };
    
    if (position) {
      body.client_meta = { x: position.x, y: position.y };
    } else if (clientMeta) {
      body.client_meta = clientMeta;
    }

    return this.request<FigmaComment>(`/files/${fileKey}/comments`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Delete a comment
   * 
   * @param fileKey - Figma file key
   * @param commentId - Comment ID to delete
   * @returns Success response
   */
  async deleteComment(
    fileKey: string,
    commentId: string
  ): Promise<FigmaApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/files/${fileKey}/comments/${commentId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Resolve a comment
   * 
   * @param fileKey - Figma file key
   * @param commentId - Comment ID to resolve
   * @returns Updated comment
   */
  async resolveComment(
    fileKey: string,
    commentId: string
  ): Promise<FigmaApiResponse<FigmaComment>> {
    return this.request<FigmaComment>(`/files/${fileKey}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ resolved: true })
    });
  }

  // =========================================================================
  // Webhook Operations
  // =========================================================================

  /**
   * List webhooks for a team
   * 
   * @param teamId - Team ID
   * @returns Webhook configurations
   */
  async getWebhooks(
    teamId: string
  ): Promise<FigmaApiResponse<{ webhooks: FigmaWebhook[] }>> {
    return this.request<{ webhooks: FigmaWebhook[] }>(`/v2/webhooks`, {
      headers: {
        'X-Figma-Team-Id': teamId
      }
    });
  }

  /**
   * Register a new webhook
   * 
   * @param teamId - Team ID
   * @param eventType - Event type to listen for
   * @param endpoint - Webhook endpoint URL
   * @param passcode - Pass-through parameter
   * @returns Created webhook
   */
  async registerWebhook(
    teamId: string,
    eventType: string,
    endpoint: string,
    passcode: string
  ): Promise<FigmaApiResponse<FigmaWebhook>> {
    return this.request<FigmaWebhook>('/v2/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        event_type: eventType,
        endpoint,
        passcode,
        team_id: teamId
      })
    });
  }

  /**
   * Update a webhook
   * 
   * @param webhookId - Webhook ID
   * @param updates - Updates to apply
   * @returns Updated webhook
   */
  async updateWebhook(
    webhookId: string,
    updates: {
      eventType?: string;
      endpoint?: string;
      passcode?: string;
      active?: boolean;
    }
  ): Promise<FigmaApiResponse<FigmaWebhook>> {
    return this.request<FigmaWebhook>(`/v2/webhooks/${webhookId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete a webhook
   * 
   * @param webhookId - Webhook ID
   * @returns Success response
   */
  async deleteWebhook(
    webhookId: string
  ): Promise<FigmaApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/v2/webhooks/${webhookId}`, {
      method: 'DELETE'
    });
  }

  // =========================================================================
  // Utility Methods
  // =========================================================================

  /**
   * Check webhook signature for authenticity
   * 
   * @param payload - Raw request body
   * @param signature - X-Signature header
   * @param webhookSecret - Webhook secret
   * @returns Whether signature is valid
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    // Figma uses HMAC SHA-256 for webhook signatures
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Parse webhook event payload
   * 
   * @param body - Raw webhook body
   * @returns Parsed webhook payload
   */
  parseWebhookPayload(body: string): FigmaWebhookPayload {
    return JSON.parse(body) as FigmaWebhookPayload;
  }

  // =========================================================================
  // Private Methods
  // =========================================================================

  /**
   * Make authenticated request to Figma API
   * 
   * @param endpoint - API endpoint (with leading slash)
   * @param options - Fetch options
   * @returns API response
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<FigmaApiResponse<T>> {
    // Apply rate limiting
    const allowed = await this.checkRateLimit();
    if (!allowed) {
      return {
        data: null,
        error: {
          message: 'Rate limit exceeded',
          status: 429,
          code: 'ERR_RATE_LIMITED'
        },
        status: 429,
        headers: {},
        rateLimit: this.rateLimitInfo
      };
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    // Add authentication header
    if (this.personalAccessToken) {
      headers['X-Figma-Token'] = this.personalAccessToken;
    } else if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else {
      return {
        data: null,
        error: {
          message: 'Authentication required. Set accessToken or personalAccessToken.',
          status: 401,
          code: 'ERR_UNAUTHORIZED'
        },
        status: 401,
        headers: {},
        rateLimit: this.rateLimitInfo
      };
    }

    // Build request
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Update rate limit info
      this.updateRateLimitInfo(response);

      // Parse response
      if (response.ok) {
        const data = await response.json().catch(() => null);
        return {
          data,
          error: null,
          status: response.status,
          headers: this.extractHeaders(response),
          rateLimit: this.rateLimitInfo
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error: {
            message: errorData.err || errorData.message || 'Unknown error',
            status: response.status,
            code: errorData.code,
            details: errorData
          },
          status: response.status,
          headers: this.extractHeaders(response),
          rateLimit: this.rateLimitInfo
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: {
            message: 'Request timeout',
            status: 408,
            code: 'ERR_TIMEOUT'
          },
          status: 408,
          headers: {},
          rateLimit: this.rateLimitInfo
        };
      }

      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          status: 500,
          code: 'ERR_NETWORK'
        },
        status: 500,
        headers: {},
        rateLimit: this.rateLimitInfo
      };
    }
  }

  /**
   * Update rate limit info from response headers
   * 
   * @param response - Fetch response
   */
  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt = response.headers.get('X-RateLimit-Reset');

    if (limit) {
      this.rateLimitInfo.limit = parseInt(limit, 10);
    }
    if (remaining) {
      this.rateLimitInfo.remaining = parseInt(remaining, 10);
    }
    if (resetAt) {
      this.rateLimitInfo.resetAt = new Date(parseInt(resetAt, 10) * 1000);
    }
  }

  /**
   * Extract headers from response
   * 
   * @param response - Fetch response
   * @returns Headers object
   */
  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }
}

// ============================================================================
// Export
// ============================================================================

/**
 * Create a default Figma API client instance
 * 
 * @returns Configured FigmaApiClient instance
 */
export function createFigmaClient(): FigmaApiClient {
  return new FigmaApiClient({
    personalAccessToken: process.env.FIGMA_ACCESS_TOKEN || undefined
  });
}

// Export the class for direct use
export { FigmaApiClient as default };
