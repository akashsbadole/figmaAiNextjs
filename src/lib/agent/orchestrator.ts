import { getAIModelRouter, ModelType } from '../ai/model-router';

export type AgentType = 'planner' | 'coder' | 'debugger' | 'reviewer' | 'tester';

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export interface AgentContext {
  projectFiles: FileTreeNode[];
  openFiles: { path: string; content: string }[];
  terminalOutput: string;
  errorMessages: string[];
  taskHistory: Task[];
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export interface AgentRequest {
  type: AgentType;
  prompt: string;
  context: AgentContext;
  options?: {
    model?: ModelType;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AgentResponse {
  success: boolean;
  result?: string;
  error?: string;
  tasks?: Task[];
  codeChanges?: CodeChange[];
}

export interface CodeChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  content?: string;
}

interface AgentSystemPrompt {
  role: string;
  content: string;
}

const AGENT_PROMPTS: Record<AgentType, AgentSystemPrompt> = {
  planner: {
    role: 'Planning Agent',
    content: `You are a Planning Agent specialized in breaking down complex requirements into actionable tasks.
Your role is to:
1. Analyze user requirements and identify all necessary components
2. Create a structured task list with clear dependencies
3. Identify the tech stack and dependencies needed
4. Determine file structure and organization

When responding, always output a JSON array of tasks in this format:
[
  { "id": "1", "description": "Create package.json with dependencies", "priority": "high" },
  { "id": "2", "description": "Create index.html entry point", "priority": "high" }
]`
  },
  coder: {
    role: 'Coding Agent',
    content: `You are a Coding Agent specialized in generating high-quality code.
Your role is to:
1. Write clean, modern, and maintainable code
2. Follow best practices for the specific framework/language
3. Ensure code is error-free and production-ready
4. Use appropriate TypeScript types when applicable

When outputting code, always use markdown code blocks with the appropriate language identifier.
Provide complete file contents, not partial snippets.`
  },
  debugger: {
    role: 'Debugging Agent',
    content: `You are a Debugging Agent specialized in analyzing and fixing errors.
Your role is to:
1. Analyze error messages and stack traces
2. Identify the root cause of issues
3. Propose specific fixes for the problem
4. Explain what went wrong and how to fix it

When responding, always include:
- The error analysis
- The proposed fix
- The corrected code (if applicable)`
  },
  reviewer: {
    role: 'Code Review Agent',
    content: `You are a Code Review Agent specialized in reviewing code quality.
Your role is to:
1. Check code for best practices and conventions
2. Identify potential bugs or issues
3. Suggest improvements for performance and maintainability
4. Ensure code follows security best practices

When responding, always include:
- Overall code quality assessment
- Specific issues found (if any)
- Recommendations for improvement`
  },
  tester: {
    role: 'Testing Agent',
    content: `You are a Testing Agent specialized in writing tests.
Your role is to:
1. Write comprehensive unit and integration tests
2. Cover edge cases and error scenarios
3. Use appropriate testing frameworks
4. Ensure tests are maintainable

When responding, always include the complete test code with proper imports and assertions.`
  }
};

class AgentOrchestrator {
  private router = getAIModelRouter();
  private maxRetries = 3;
  private retryDelay = 1000;

  async execute(request: AgentRequest): Promise<AgentResponse> {
    const { type, prompt, context, options } = request;
    const agentPrompt = AGENT_PROMPTS[type];

    try {
      const systemPrompt = agentPrompt.content;
      
      const fullPrompt = this.buildPrompt(prompt, context);

      const modelType = options?.model || this.getDefaultModel(type);

      const result = await this.router.route({
        type: 'code-generation',
        prompt: fullPrompt,
        systemPrompt,
        options: {
          model: modelType,
          temperature: options?.temperature ?? this.getDefaultTemperature(type),
          maxTokens: options?.maxTokens ?? this.getDefaultMaxTokens(type),
        }
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error(`Agent ${type} error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildPrompt(prompt: string, context: AgentContext): string {
    let fullPrompt = prompt;

    if (context.projectFiles.length > 0) {
      const fileTree = this.buildFileTreeString(context.projectFiles);
      fullPrompt += `\n\nCurrent project structure:\n${fileTree}`;
    }

    if (context.openFiles.length > 0) {
      const openFilesContent = context.openFiles
        .map(f => `\n--- ${f.path} ---\n${f.content}`)
        .join('\n');
      fullPrompt += `\n\nOpen files:\n${openFilesContent}`;
    }

    if (context.errorMessages.length > 0) {
      fullPrompt += `\n\nError messages:\n${context.errorMessages.join('\n')}`;
    }

    if (context.terminalOutput) {
      fullPrompt += `\n\nTerminal output:\n${context.terminalOutput.slice(-2000)}`;
    }

    return fullPrompt;
  }

  private buildFileTreeString(nodes: FileTreeNode[], depth = 0): string {
    const indent = '  '.repeat(depth);
    let result = '';

    for (const node of nodes) {
      const icon = node.type === 'directory' ? '📁' : '📄';
      result += `${indent}${icon} ${node.name}\n`;
      
      if (node.children) {
        result += this.buildFileTreeString(node.children, depth + 1);
      }
    }

    return result;
  }

  private getDefaultModel(type: AgentType): ModelType {
    switch (type) {
      case 'planner':
      case 'coder':
      case 'reviewer':
        return 'pro';
      case 'debugger':
        return 'pro';
      case 'tester':
        return 'flash';
      default:
        return 'flash';
    }
  }

  private getDefaultTemperature(type: AgentType): number {
    switch (type) {
      case 'planner':
        return 0.3;
      case 'coder':
        return 0.2;
      case 'debugger':
        return 0.1;
      case 'reviewer':
        return 0.4;
      case 'tester':
        return 0.3;
      default:
        return 0.3;
    }
  }

  private getDefaultMaxTokens(type: AgentType): number {
    switch (type) {
      case 'planner':
        return 4096;
      case 'coder':
        return 8192;
      case 'debugger':
        return 4096;
      case 'reviewer':
        return 4096;
      case 'tester':
        return 4096;
      default:
        return 4096;
    }
  }

  async executeWithRetry(
    request: AgentRequest,
    onRetry?: (attempt: number) => void
  ): Promise<AgentResponse> {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const result = await this.execute(request);
      
      if (result.success) {
        return result;
      }

      lastError = result.error;
      
      if (attempt < this.maxRetries) {
        onRetry?.(attempt);
        await this.delay(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: `Max retries (${this.maxRetries}) exceeded: ${lastError}`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  parseCodeChanges(response: string): CodeChange[] {
    const changes: CodeChange[] = [];
    
    const codeBlockRegex = /```(\w+)?\s*(?:file:)?([^`]+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      const filename = match[2]?.trim() || 'unknown';
      const content = match[3].trim();

      if (filename !== 'unknown' && content) {
        changes.push({
          path: filename,
          action: 'create',
          content,
        });
      }
    }

    return changes;
  }
}

export const agentOrchestrator = new AgentOrchestrator();
export default agentOrchestrator;
