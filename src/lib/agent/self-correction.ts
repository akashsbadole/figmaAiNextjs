import { agentOrchestrator, AgentContext, CodeChange } from './orchestrator';

export interface ErrorInfo {
  type: 'compile' | 'runtime' | 'test' | 'lint';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface CorrectionResult {
  success: boolean;
  fixes: CodeChange[];
  explanation: string;
  attempts: number;
}

export interface SelfCorrectionConfig {
  maxRetries: number;
  retryDelay: number;
  enableAutoFix: boolean;
}

class SelfCorrectionSystem {
  private config: SelfCorrectionConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    enableAutoFix: true,
  };

  configure(config: Partial<SelfCorrectionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  async analyzeError(error: ErrorInfo): Promise<{
    rootCause: string;
    suggestedFix: string;
  }> {
    const prompt = `Analyze this error and provide:
1. Root cause explanation
2. Suggested fix

Error details:
- Type: ${error.type}
- Message: ${error.message}
${error.stack ? `- Stack: ${error.stack}` : ''}
${error.file ? `- File: ${error.file}` : ''}
${error.line ? `- Line: ${error.line}` : ''}

Provide your response in JSON format:
{
  "rootCause": "explanation",
  "suggestedFix": "fix description"
}`;

    const result = await agentOrchestrator.execute({
      type: 'debugger',
      prompt,
      context: {
        projectFiles: [],
        openFiles: [],
        terminalOutput: '',
        errorMessages: [error.message],
        taskHistory: [],
      },
    });

    if (result.success && result.result) {
      try {
        const parsed = JSON.parse(result.result);
        return {
          rootCause: parsed.rootCause || 'Unknown',
          suggestedFix: parsed.suggestedFix || 'No fix suggested',
        };
      } catch {
        return {
          rootCause: 'Failed to parse response',
          suggestedFix: error.message,
        };
      }
    }

    return {
      rootCause: 'Analysis failed',
      suggestedFix: error.message,
    };
  }

  async fixError(
    error: ErrorInfo,
    context: AgentContext
  ): Promise<CorrectionResult> {
    if (!this.config.enableAutoFix) {
      return {
        success: false,
        fixes: [],
        explanation: 'Auto-fix is disabled',
        attempts: 0,
      };
    }

    const analysis = await this.analyzeError(error);
    
    const prompt = `Fix the following error based on the analysis:

Error: ${error.message}
Type: ${error.type}
${error.file ? `File: ${error.file}` : ''}
${error.line ? `Line: ${error.line}` : ''}

Root Cause: ${analysis.rootCause}
Suggested Fix: ${analysis.suggestedFix}

Generate the corrected code. Use markdown code blocks with the file path.`;

    const fixes: CodeChange[] = [];
    let attempts = 0;

    for (let i = 0; i < this.config.maxRetries; i++) {
      attempts++;

      const result = await agentOrchestrator.execute({
        type: 'coder',
        prompt,
        context,
      });

      if (result.success && result.result) {
        const changes = agentOrchestrator.parseCodeChanges(result.result);
        
        if (changes.length > 0) {
          return {
            success: true,
            fixes: changes,
            explanation: `Fixed after ${attempts} attempt(s). ${analysis.rootCause}`,
            attempts,
          };
        }
      }

      if (i < this.config.maxRetries - 1) {
        await this.delay(this.config.retryDelay * (i + 1));
      }
    }

    return {
      success: false,
      fixes: [],
      explanation: `Failed after ${attempts} attempts. Last suggestion: ${analysis.suggestedFix}`,
      attempts,
    };
  }

  async fixWithRetry(
    errors: ErrorInfo[],
    context: AgentContext,
    onAttempt?: (attempt: number, error: ErrorInfo) => void
  ): Promise<{
    fixedErrors: ErrorInfo[];
    remainingErrors: ErrorInfo[];
    allFixes: CodeChange[];
  }> {
    const fixedErrors: ErrorInfo[] = [];
    const remainingErrors: ErrorInfo[] = [];
    const allFixes: CodeChange[] = [];

    for (const error of errors) {
      onAttempt?.(fixedErrors.length + remainingErrors.length + 1, error);

      const result = await this.fixError(error, context);

      if (result.success) {
        fixedErrors.push(error);
        allFixes.push(...result.fixes);
      } else {
        remainingErrors.push(error);
      }
    }

    return {
      fixedErrors,
      remainingErrors,
      allFixes,
    };
  }

  parseErrorOutput(output: string): ErrorInfo[] {
    const errors: ErrorInfo[] = [];

    const patterns = [
      {
        type: 'compile' as const,
        regex: /(?:Error|error):\s*(.+?)(?:\n|\r|$)/g,
      },
      {
        type: 'runtime' as const,
        regex: /(?:Uncaught|Thrown):\s*(.+?)(?:\n|\r|$)/g,
      },
      {
        type: 'test' as const,
        regex: /(?:\d+\s+)?(?:FAIL|PASS|FAILED|PASSED)\s+(?:in|on)\s+(.+?)(?:\n|\r|$)/g,
      },
    ];

    for (const { type, regex } of patterns) {
      let match;
      while ((match = regex.exec(output)) !== null) {
        errors.push({
          type,
          message: match[1].trim(),
          stack: this.extractStackTrace(output, match.index),
        });
      }
    }

    const tsErrorRegex = /^(.+?):(\d+):(\d+):\s*(.+)$/gm;
    let tsMatch;
    while ((tsMatch = tsErrorRegex.exec(output)) !== null) {
      errors.push({
        type: 'compile',
        message: tsMatch[4].trim(),
        file: tsMatch[1],
        line: parseInt(tsMatch[2], 10),
        column: parseInt(tsMatch[3], 10),
      });
    }

    return errors;
  }

  private extractStackTrace(output: string, errorIndex: number): string | undefined {
    const startIndex = output.indexOf('\n', errorIndex);
    if (startIndex === -1) return undefined;

    const endIndex = output.indexOf('\n\n', startIndex);
    const stack = output.slice(startIndex, endIndex === -1 ? undefined : endIndex);
    
    return stack.trim().slice(0, 500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getErrorSummary(errors: ErrorInfo[]): string {
    const byType = errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byType)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  }
}

export const selfCorrectionSystem = new SelfCorrectionSystem();
export default selfCorrectionSystem;
