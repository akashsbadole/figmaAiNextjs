'use client';

import { cn } from '@/lib/utils';
import type { TypingIndicatorProps } from './types';

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-3',
        'animate-in fade-in-0 duration-300',
        className
      )}
      aria-label="Assistant is typing"
      role="status"
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              'h-2 w-2 rounded-full bg-[var(--muted-foreground)]',
              'animate-bounce'
            )}
            style={{
              animationDelay: `${index * 150}ms`,
              animationDuration: '600ms',
            }}
          />
        ))}
      </div>
      <span className="ml-2 text-xs text-[var(--muted-foreground)]">
        Thinking...
      </span>
    </div>
  );
}

// Alternative pulsing indicator variant
export function TypingIndicatorPulse({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3',
        'animate-in fade-in-0 duration-300',
        className
      )}
      aria-label="Assistant is typing"
      role="status"
    >
      <div className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--primary)]" />
      </div>
      <span className="text-xs text-[var(--muted-foreground)]">
        Generating response...
      </span>
    </div>
  );
}

// Wave animation indicator
export function TypingIndicatorWave({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-4 py-3',
        'animate-in fade-in-0 duration-300',
        className
      )}
      aria-label="Assistant is typing"
      role="status"
    >
      <div className="flex items-end gap-0.5 h-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className="w-1 bg-[var(--muted-foreground)] rounded-full"
            style={{
              height: '100%',
              animation: 'wave 1s ease-in-out infinite',
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
