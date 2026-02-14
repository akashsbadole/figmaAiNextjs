/**
 * Multi-Model AI Router
 * Routes requests to appropriate AI models based on task type
 */

import { GeminiAI } from '../gemini';
import { GenerativeModel } from '@google/generative-ai';

export type ModelType = 'flash' | 'pro' | 'vision';

export interface ModelConfig {
  name: ModelType;
  displayName: string;
  description: string;
  strengths: string[];
  maxTokens: number;
  costTier: 'low' | 'medium' | 'high';
}

export const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  flash: {
    name: 'flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast and efficient for simple conversational tasks',
    strengths: ['chat', 'simple-queries', 'quick-summaries'],
    maxTokens: 8192,
    costTier: 'low'
  },
  pro: {
    name: 'pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Advanced reasoning for complex analysis and code generation',
    strengths: ['complex-reasoning', 'code-generation', 'design-analysis', 'detailed-writing'],
    maxTokens: 32768,
    costTier: 'high'
  },
  vision: {
    name: 'vision',
    displayName: 'Gemini 2.5 Pro Vision',
    description: 'Image analysis and understanding',
    strengths: ['image-analysis', 'design-review', 'screenshot-to-code', 'token-extraction'],
    maxTokens: 16384,
    costTier: 'medium'
  }
};

export interface AIRequest {
  type: 'chat' | 'text-generation' | 'json-generation' | 'image-analysis' | 'code-generation' | 'design-analysis';
  prompt: string;
  systemPrompt?: string;
  context?: Record<string, any>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: ModelType;
  };
}

export interface AIRouter {
  route(request: AIRequest): Promise<any>;
  getRecommendedModel(requestType: AIRequest['type']): ModelType;
  getModelStatus(): Promise<Record<ModelType, boolean>>;
}

class AIModelRouter implements AIRouter {
  private models: Map<ModelType, GeminiAI> = new Map();
  private defaultModel: ModelType = 'flash';
  
  constructor() {
    this.initializeModels();
  }
  
  private initializeModels(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('GEMINI_API_KEY not configured - AI services will not be available');
      return;
    }
    
    // Initialize Flash model (default)
    this.models.set('flash', new GeminiAI('gemini-2.5-flash'));
    
    // Initialize Pro model
    this.models.set('pro', new GeminiAI('gemini-2.5-pro'));
    
    // Vision uses the same models but with image input
    this.models.set('vision', new GeminiAI('gemini-2.5-pro'));
  }
  
  getRecommendedModel(requestType: AIRequest['type']): ModelType {
    const modelMapping: Record<AIRequest['type'], ModelType> = {
      'chat': 'flash',
      'text-generation': 'flash',
      'json-generation': 'pro',
      'code-generation': 'pro',
      'design-analysis': 'pro',
      'image-analysis': 'vision'
    };
    
    return modelMapping[requestType] || 'flash';
  }
  
  async route(request: AIRequest): Promise<any> {
    const modelType = request.options?.model || this.getRecommendedModel(request.type);
    const model = this.models.get(modelType);
    
    if (!model) {
      throw new Error(`Model ${modelType} not initialized. Check GEMINI_API_KEY configuration.`);
    }
    
    const config = MODEL_CONFIGS[modelType];
    const maxTokens = request.options?.maxTokens || config.maxTokens;
    
    try {
      switch (request.type) {
        case 'chat':
          return await this.handleChat(request, model);
        
        case 'json-generation':
          return await this.handleJSONGeneration(request, model);
        
        case 'code-generation':
          return await this.handleCodeGeneration(request, model);
        
        case 'design-analysis':
          return await this.handleDesignAnalysis(request, model);
        
        case 'image-analysis':
          return await this.handleImageAnalysis(request, model);
        
        default:
          return await this.handleTextGeneration(request, model);
      }
    } catch (error) {
      console.error(`AI routing error for ${request.type}:`, error);
      
      // Fallback to flash model if pro fails
      if (modelType === 'pro' || modelType === 'vision') {
        console.log('Falling back to flash model...');
        return this.route({ ...request, options: { ...request.options, model: 'flash' } });
      }
      
      throw error;
    }
  }
  
  private async handleChat(request: AIRequest, model: GeminiAI): Promise<string> {
    const messages = request.context?.messages || [
      { role: 'user', content: request.prompt }
    ];
    
    return await model.chat(messages, request.systemPrompt);
  }
  
  private async handleJSONGeneration<T>(request: AIRequest, model: GeminiAI): Promise<T> {
    return await model.generateJSON<T>(request.prompt, request.systemPrompt);
  }
  
  private async handleCodeGeneration(request: AIRequest, model: GeminiAI): Promise<string> {
    const systemPrompt = request.systemPrompt || `You are an expert UI/UX developer. Generate clean, accessible, and modern code.`;
    
    return await model.generateText(
      `${systemPrompt}\n\nGenerate code for:\n${request.prompt}`,
      undefined
    );
  }
  
  private async handleDesignAnalysis(request: AIRequest, model: GeminiAI): Promise<any> {
    const systemPrompt = request.systemPrompt || `You are an expert UX/UI designer. Analyze designs for accessibility, consistency, and best practices.`;
    
    return await model.generateJSON(request.prompt, systemPrompt);
  }
  
  private async handleImageAnalysis(request: AIRequest, model: GeminiAI): Promise<any> {
    // This would handle image inputs when supported by the Gemini SDK
    throw new Error('Image analysis requires additional implementation with vision API');
  }
  
  private async handleTextGeneration(request: AIRequest, model: GeminiAI): Promise<string> {
    return await model.generateText(request.prompt, request.systemPrompt);
  }
  
  async getModelStatus(): Promise<Record<ModelType, boolean>> {
    const status: Record<ModelType, boolean> = {
      flash: false,
      pro: false,
      vision: false
    };
    
    for (const [type, model] of this.models) {
      if (model) {
        status[type] = true;
      }
    }
    
    return status;
  }
}

// Singleton instance
let routerInstance: AIModelRouter | null = null;

export const getAIModelRouter = (): AIModelRouter => {
  if (!routerInstance) {
    routerInstance = new AIModelRouter();
  }
  return routerInstance;
};

export const resetAIModelRouter = (): void => {
  routerInstance = null;
};
