'use client';

import { useEffect, useRef, useCallback, memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { MessageListProps } from './types';
import { MemoizedMessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';

// Loading skeleton for messages
function MessageSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
      {/* Assistant message skeleton */}
      <div className="flex gap-2 sm:gap-3">
        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-3/4" />
          <Skeleton className="h-3 sm:h-4 w-1/2" />
        </div>
      </div>
      {/* User message skeleton */}
      <div className="flex justify-end">
        <div className="max-w-[70%] sm:max-w-[60%] space-y-1.5 sm:space-y-2">
          <Skeleton className="h-12 sm:h-16 w-36 sm:w-48 rounded-2xl rounded-br-md" />
        </div>
      </div>
      {/* Another assistant message skeleton */}
      <div className="flex gap-2 sm:gap-3">
        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-2/3" />
          <Skeleton className="h-3 sm:h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-3 sm:mb-4">
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)] mb-1">
        No messages yet
      </h3>
      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-[240px] sm:max-w-[280px]">
        Start a conversation by typing a message below
      </p>
    </div>
  );
}

// Scroll anchor component for auto-scrolling
function ScrollAnchor() {
  return <div className="h-px w-full" aria-hidden="true" />;
}

export function MessageList({
  messages,
  isLoading,
  onAction,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  // Scroll on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom('smooth');
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Scroll on streaming updates
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isStreaming) {
      scrollToBottom('auto');
    }
  }, [messages, scrollToBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  // Show loading skeleton
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <MessageSkeleton />
      </div>
    );
  }

  // Show empty state
  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  // Check if any message is streaming
  const isStreaming = messages.some((m) => m.isStreaming);

  return (
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full"
        type="auto"
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'animate-in fade-in-0 slide-in-from-bottom-2',
                'duration-200'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <MemoizedMessageBubble
                message={message}
                isLast={index === messages.length - 1}
                onAction={onAction}
              />
            </div>
          ))}

          {/* Show typing indicator when streaming */}
          {isStreaming && (
            <div
              className={cn(
                'animate-in fade-in-0 slide-in-from-bottom-2',
                'duration-200'
              )}
            >
              <TypingIndicator />
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef}>
            <ScrollAnchor />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Export memoized version for better performance
export const MemoizedMessageList = memo(MessageList);
