/**
 * Request Validation Schemas using Zod
 */

import { z } from 'zod';

// ============ Design System Schemas ============

export const createDesignSystemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(10).max(5000),
  category: z.string().optional(),
  industry: z.string().optional(),
  colors: z.record(z.string(), z.string()).optional(),
  typography: z.record(z.string(), z.any()).optional(),
  spacing: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  borderRadius: z.record(z.string(), z.number()).optional(),
  shadows: z.record(z.string(), z.string()).optional(),
  components: z.record(z.string(), z.any()).optional()
});

export const updateDesignSystemSchema = createDesignSystemSchema.partial();

export type CreateDesignSystemInput = z.infer<typeof createDesignSystemSchema>;
export type UpdateDesignSystemInput = z.infer<typeof updateDesignSystemSchema>;

// ============ Figma Schemas ============

export const figmaImportSchema = z.object({
  figmaFileUrl: z.string().url(),
  accessToken: z.string().optional()
});

export const figmaExportSchema = z.object({
  format: z.enum(['json', 'figma', 'figmagic']).default('json'),
  includeComponents: z.boolean().default(true)
});

export type FigmaImportInput = z.infer<typeof figmaImportSchema>;
export type FigmaExportInput = z.infer<typeof figmaExportSchema>;

// ============ AI Chat Schemas ============

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  systemPrompt: z.string().optional(),
  type: z.enum(['ui-ux', 'system-design', 'figma']).default('ui-ux')
});

export const designAnalysisSchema = z.object({
  designSystemId: z.string(),
  analysisType: z.enum(['accessibility', 'consistency', 'patterns', 'performance', 'comprehensive']).default('comprehensive')
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type DesignAnalysisInput = z.infer<typeof designAnalysisSchema>;

// ============ Version Control Schemas ============

export const createBranchSchema = z.object({
  name: z.string().min(1).max(100),
  baseCommitHash: z.string().optional()
});

export const createCommitSchema = z.object({
  message: z.string().min(1).max(500),
  tags: z.array(z.string()).optional()
});

export const mergeBranchSchema = z.object({
  sourceBranchId: z.string(),
  targetBranchId: z.string(),
  mergeStrategy: z.enum(['auto', 'manual']).default('auto')
});

export const rollbackSchema = z.object({
  commitHash: z.string(),
  createBranch: z.boolean().default(false),
  branchName: z.string().optional()
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type CreateCommitInput = z.infer<typeof createCommitSchema>;
export type MergeBranchInput = z.infer<typeof mergeBranchSchema>;
export type RollbackInput = z.infer<typeof rollbackSchema>;

// ============ Marketplace Schemas ============

export const publishComponentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  category: z.string(),
  framework: z.enum(['react', 'vue', 'svelte', 'html']),
  sourceCode: z.string(),
  designData: z.record(z.string(), z.any()),
  dependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export const searchComponentsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  framework: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['popularity', 'rating', 'newest']).default('popularity'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

export const componentReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(10).max(2000)
});

export type PublishComponentInput = z.infer<typeof publishComponentSchema>;
export type SearchComponentsInput = z.infer<typeof searchComponentsSchema>;
export type ComponentReviewInput = z.infer<typeof componentReviewSchema>;

// ============ A/B Testing Schemas ============

export const createABTestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  designSystemId: z.string(),
  controlVariantId: z.string(),
  variantIds: z.array(z.string()).min(1),
  trafficAllocation: z.record(z.string(), z.number().min(0).max(1)).optional(),
  targetAudience: z.record(z.string(), z.any()).optional(),
  primaryMetric: z.string(),
  secondaryMetrics: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

export const abTestVariantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  designSystemData: z.record(z.string(), z.any())
});

export type CreateABTestInput = z.infer<typeof createABTestSchema>;
export type ABTestVariantInput = z.infer<typeof abTestVariantSchema>;

// ============ Collaboration Schemas ============

export const createSessionSchema = z.object({
  designSystemId: z.string(),
  name: z.string().min(1).max(100),
  maxParticipants: z.number().min(2).max(50).default(10)
});

export const joinSessionSchema = z.object({
  sessionId: z.string()
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;

// ============ Utility Functions ============

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return errors;
}
