import { FileNode } from '@/store/useVFSStore';

export interface ContextOptions {
  maxFileTreeDepth?: number;
  maxOpenFiles?: number;
  maxTerminalLines?: number;
  includeRelevantFiles?: boolean;
}

export interface Context {
  fileTree: string;
  openFiles: string;
  terminalOutput: string;
  errorMessages: string;
  totalTokens: number;
}

class ContextManager {
  private maxFileTreeDepth = 3;
  private maxOpenFiles = 5;
  private maxTerminalLines = 500;

  buildContext(
    fileTree: FileNode[],
    openFiles: { path: string; content: string }[],
    terminalOutput: string[],
    errorMessages: string[] = [],
    options: ContextOptions = {}
  ): Context {
    const {
      maxFileTreeDepth = this.maxFileTreeDepth,
      maxOpenFiles = this.maxOpenFiles,
      maxTerminalLines = this.maxTerminalLines,
    } = options;

    const fileTreeStr = this.buildFileTreeString(fileTree, 0, maxFileTreeDepth);
    const openFilesStr = this.buildOpenFilesString(openFiles.slice(0, maxOpenFiles));
    const terminalStr = this.buildTerminalString(terminalOutput, maxTerminalLines);
    const errorStr = this.buildErrorString(errorMessages);

    const totalTokens = this.estimateTokens(
      fileTreeStr + openFilesStr + terminalStr + errorStr
    );

    return {
      fileTree: fileTreeStr,
      openFiles: openFilesStr,
      terminalOutput: terminalStr,
      errorMessages: errorStr,
      totalTokens,
    };
  }

  private buildFileTreeString(
    nodes: FileNode[],
    depth: number,
    maxDepth: number
  ): string {
    if (depth >= maxDepth) return '';

    let result = '';
    const indent = '  '.repeat(depth);

    for (const node of nodes) {
      const icon = node.type === 'directory' ? '📁' : '📄';
      result += `${indent}${icon} ${node.name}\n`;

      if (node.children && node.type === 'directory') {
        result += this.buildFileTreeString(node.children, depth + 1, maxDepth);
      }
    }

    return result;
  }

  private buildOpenFilesString(
    files: { path: string; content: string }[]
  ): string {
    if (files.length === 0) return 'No open files\n';

    return files
      .map(f => {
        const truncatedContent = this.truncateContent(f.content, 2000);
        return `--- ${f.path} ---\n${truncatedContent}\n`;
      })
      .join('\n');
  }

  private buildTerminalString(
    lines: string[],
    maxLines: number
  ): string {
    if (lines.length === 0) return 'No terminal output\n';

    const recentLines = lines.slice(-maxLines);
    return `--- Terminal Output (last ${recentLines.length} lines) ---\n${recentLines.join('')}\n`;
  }

  private buildErrorString(errors: string[]): string {
    if (errors.length === 0) return 'No errors\n';

    return `--- Errors ---\n${errors.join('\n')}\n`;
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;

    const halfLength = Math.floor(maxLength / 2);
    return (
      content.slice(0, halfLength) +
      `\n... [truncated ${content.length - maxLength} characters] ...\n` +
      content.slice(-halfLength)
    );
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  async findRelevantFiles(
    query: string,
    files: FileNode[]
  ): Promise<string[]> {
    const relevant: string[] = [];
    const keywords = query.toLowerCase().split(/\s+/);

    const search = (nodes: FileNode[]) => {
      for (const node of nodes) {
        const nameMatch = keywords.some(kw => node.name.toLowerCase().includes(kw));
        
        if (nameMatch) {
          relevant.push(node.path);
        }

        if (node.children) {
          search(node.children);
        }
      }
    };

    search(files);
    return relevant.slice(0, 10);
  }

  getContextSummary(context: Context): string {
    const lines = [
      'Context Summary:',
      `- File Tree: ${context.fileTree.split('\n').length} entries`,
      `- Open Files: ${context.openFiles.split('---').length - 1} files`,
      `- Terminal: ${context.terminalOutput.split('\n').length} lines`,
      `- Errors: ${context.errorMessages.split('\n').length} entries`,
      `- Est. Tokens: ${context.totalTokens}`,
    ];
    return lines.join('\n');
  }
}

export const contextManager = new ContextManager();
export default contextManager;
