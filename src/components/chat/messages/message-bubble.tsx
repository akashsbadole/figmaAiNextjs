'use client';

import { useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { MessageBubbleProps, Message } from './types';
import { MessageActions } from './message-actions';
import { CodeBlock, InlineCode } from './code-block';

// Format timestamp to readable string
function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Streaming cursor component
function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--foreground)] animate-pulse" />
  );
}

// Markdown components configuration
const markdownComponents = {
  code: ({ inline, className, children, ...props }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  } & React.HTMLAttributes<HTMLElement>) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : undefined;
    
    if (!inline && language) {
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
          language={language}
        />
      );
    }
    
    if (!inline) {
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
        />
      );
    }
    
    return <InlineCode>{children}</InlineCode>;
  },
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 sm:mb-3 last:mb-0 leading-relaxed text-sm sm:text-base">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-2 sm:mb-3 list-disc pl-5 sm:pl-6 space-y-0.5 sm:space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-2 sm:mb-3 list-decimal pl-5 sm:pl-6 space-y-0.5 sm:space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed text-sm sm:text-base">{children}</li>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-3 sm:mt-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 mt-2 sm:mt-3 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 mt-2 sm:mt-3 first:mt-0">{children}</h3>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-[var(--border)] pl-3 sm:pl-4 italic text-[var(--muted-foreground)] my-2 sm:my-3 text-sm sm:text-base">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--primary)] underline hover:no-underline text-sm sm:text-base"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 sm:my-4 border-[var(--border)]" />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-2 sm:my-3 -mx-2 sm:mx-0">
      <table className="min-w-full border-collapse text-sm sm:text-base">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-[var(--border)] px-2 sm:px-3 py-1.5 sm:py-2 bg-[var(--muted)] text-left font-semibold text-xs sm:text-sm">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-[var(--border)] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
      {children}
    </td>
  ),
};

// User message component
const UserMessage = memo(function UserMessage({
  message,
  isLast,
  onAction,
}: MessageBubbleProps) {
  return (
    <div className="flex justify-end group relative">
      <div
        className={cn(
          // Responsive max width
          'max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[60%]',
          // Responsive border radius
          'rounded-2xl rounded-br-md sm:rounded-2xl sm:rounded-br-sm',
          // Responsive padding
          'px-3 py-2 sm:px-4 sm:py-3',
          'bg-[var(--chat-bubble-user)] text-[var(--primary-foreground)]',
          'shadow-sm'
        )}
      >
        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
          <span className="text-[9px] sm:text-[10px] opacity-70">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
      <MessageActions
        messageId={message.id}
        role={message.role}
        content={message.content}
        onAction={onAction}
      />
    </div>
  );
});

// Assistant message component
const AssistantMessage = memo(function AssistantMessage({
  message,
  isLast,
  onAction,
}: MessageBubbleProps) {
  const content = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {message.content}
      </ReactMarkdown>
    );
  }, [message.content]);

  return (
    <div className="flex gap-2 sm:gap-3 group relative">
      {/* Avatar */}
      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 mt-0.5">
        <AvatarFallback className="bg-[var(--primary)] text-[var(--primary-foreground)]">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div
        className={cn(
          'flex-1 min-w-0',
          // Responsive border radius
          'rounded-2xl rounded-tl-md sm:rounded-2xl sm:rounded-tl-sm',
          // Responsive padding
          'px-3 py-2 sm:px-4 sm:py-3',
          'bg-[var(--chat-bubble-assistant)]',
          'text-[var(--foreground)]'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content}
          {message.isStreaming && <StreamingCursor />}
        </div>
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-[var(--muted-foreground)]">
          <span>{formatTimestamp(message.timestamp)}</span>
          {message.metadata?.model && (
            <>
              <span>•</span>
              <span>{message.metadata.model}</span>
            </>
          )}
          {message.metadata?.tokens && (
            <>
              <span>•</span>
              <span>{message.metadata.tokens} tokens</span>
            </>
          )}
        </div>
      </div>

      <MessageActions
        messageId={message.id}
        role={message.role}
        content={message.content}
        onAction={onAction}
      />
    </div>
  );
});

// System message component
const SystemMessage = memo(function SystemMessage({
  message,
}: MessageBubbleProps) {
  return (
    <div className="flex justify-center">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 sm:gap-2',
          'px-3 py-1.5 sm:px-4 sm:py-2 rounded-full',
          'bg-[var(--muted)] text-[var(--muted-foreground)]',
          'text-[10px] sm:text-xs'
        )}
      >
        <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span>{message.content}</span>
      </div>
    </div>
  );
});

// Main message bubble component
export function MessageBubble({
  message,
  isLast,
  onAction,
}: MessageBubbleProps) {
  switch (message.role) {
    case 'user':
      return (
        <UserMessage
          message={message}
          isLast={isLast}
          onAction={onAction}
        />
      );
    case 'assistant':
      return (
        <AssistantMessage
          message={message}
          isLast={isLast}
          onAction={onAction}
        />
      );
    case 'system':
      return (
        <SystemMessage
          message={message}
          isLast={isLast}
          onAction={onAction}
        />
      );
    default:
      return null;
  }
}

// Export memoized version for better performance
export const MemoizedMessageBubble = memo(MessageBubble);
