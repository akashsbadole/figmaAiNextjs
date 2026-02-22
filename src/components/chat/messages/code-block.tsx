'use client';

import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CodeBlockProps } from './types';

// Map of common language aliases
const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
};

function normalizeLanguage(language?: string): string {
  if (!language) return 'text';
  const normalized = language.toLowerCase();
  return languageMap[normalized] || normalized;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = normalizeLanguage(language);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-[var(--chat-border)] bg-[oklch(0.17_0_0)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--chat-border)] bg-[oklch(0.2_0_0)] px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <FileCode className="h-3.5 w-3.5" />
          <span className="font-mono">
            {filename || normalizedLanguage}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono), ui-monospace, monospace',
            },
          }}
          showLineNumbers={code.split('\n').length > 3}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: 'oklch(0.5_0_0)',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {code.trimEnd()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Inline code component for single-line code snippets
export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        'rounded-md bg-[var(--muted)] px-1.5 py-0.5 font-mono text-sm',
        'text-[var(--foreground)]',
        className
      )}
    >
      {children}
    </code>
  );
}
