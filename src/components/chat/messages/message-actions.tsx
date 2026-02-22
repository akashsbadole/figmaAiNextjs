'use client';

import { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Pencil,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MessageActionsProps } from './types';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

function ActionButton({ icon, label, onClick, isActive, className }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            // Minimum touch target size (44px recommended for mobile)
            'h-8 w-8 sm:h-7 sm:w-7 rounded-md',
            'text-[var(--muted-foreground)]',
            'hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
            'transition-all duration-150',
            'touch-manipulation',
            isActive && 'text-[var(--foreground)] bg-[var(--accent)]',
            className
          )}
          onClick={onClick}
          aria-label={label}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="animate-in fade-in-0 zoom-in-95 duration-150 text-xs"
        sideOffset={4}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function MessageActions({
  messageId,
  role,
  content,
  onAction,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [thumbsState, setThumbsState] = useState<'up' | 'down' | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onAction?.('copy', messageId);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content, messageId, onAction]);

  const handleRegenerate = useCallback(() => {
    onAction?.('regenerate', messageId);
  }, [messageId, onAction]);

  const handleEdit = useCallback(() => {
    onAction?.('edit', messageId);
  }, [messageId, onAction]);

  const handleDelete = useCallback(() => {
    onAction?.('delete', messageId);
  }, [messageId, onAction]);

  const handleThumbsUp = useCallback(() => {
    const newState = thumbsState === 'up' ? null : 'up';
    setThumbsState(newState);
    onAction?.(newState === 'up' ? 'thumbs_up' : 'thumbs_up_remove', messageId);
  }, [messageId, onAction, thumbsState]);

  const handleThumbsDown = useCallback(() => {
    const newState = thumbsState === 'down' ? null : 'down';
    setThumbsState(newState);
    onAction?.(newState === 'down' ? 'thumbs_down' : 'thumbs_down_remove', messageId);
  }, [messageId, onAction, thumbsState]);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex items-center gap-0.5 opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          'absolute -bottom-9 sm:-bottom-8 right-2',
          // Always show on touch devices when focused
          'focus-within:opacity-100'
        )}
      >
        {/* Copy button - available for all messages */}
        <ActionButton
          icon={copied ? <Check className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" /> : <Copy className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />}
          label={copied ? 'Copied!' : 'Copy message'}
          onClick={handleCopy}
          isActive={copied}
        />

        {/* User message actions */}
        {role === 'user' && (
          <>
            <ActionButton
              icon={<Pencil className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />}
              label="Edit message"
              onClick={handleEdit}
            />
            <ActionButton
              icon={<Trash2 className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />}
              label="Delete message"
              onClick={handleDelete}
              className="hover:text-[var(--destructive)]"
            />
          </>
        )}

        {/* Assistant message actions */}
        {role === 'assistant' && (
          <>
            <ActionButton
              icon={<RefreshCw className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />}
              label="Regenerate response"
              onClick={handleRegenerate}
            />
            <ActionButton
              icon={<ThumbsUp className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />}
              label="Good response"
              onClick={handleThumbsUp}
              isActive={thumbsState === 'up'}
            />
            <ActionButton
              icon={<ThumbsDown className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />}
              label="Bad response"
              onClick={handleThumbsDown}
              isActive={thumbsState === 'down'}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

// Compact action bar for inline use
export function MessageActionsCompact({
  messageId,
  role,
  content,
  onAction,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onAction?.('copy', messageId);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content, messageId, onAction]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 sm:h-6 px-2 sm:px-2 text-[10px] sm:text-xs text-[var(--muted-foreground)] touch-manipulation"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
