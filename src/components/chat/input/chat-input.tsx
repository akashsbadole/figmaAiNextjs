"use client";

import * as React from "react";
import { Send, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InputActions } from "./input-actions";
import { AttachmentPreview } from "./attachment-preview";

// Types
export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  size?: number;
  url?: string;
  file?: File;
}

export interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showActions?: boolean;
  onStop?: () => void;
}

// Random placeholder messages
const PLACEHOLDERS = [
  "Type a message...",
  "Ask me anything...",
  "What's on your mind?",
  "How can I help you today?",
  "Send a message...",
  "What would you like to know?",
];

// Auto-resize textarea hook
function useAutoResize(value: string, maxHeight: number = 150) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate new height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  return textareaRef;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder,
  maxLength = 4000,
  showActions = true,
  onStop,
}: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Random placeholder on mount
  const [randomPlaceholder] = React.useState(() => 
    PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  const textareaRef = useAutoResize(message);

  // Focus textarea on mount
  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle send message
  const handleSend = React.useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) return;

    onSend(trimmedMessage, attachments.length > 0 ? attachments : undefined);
    setMessage("");
    setAttachments([]);
    
    // Refocus textarea after sending
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [message, attachments, isLoading, disabled, onSend]);

  // Handle key down
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send (without shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        return;
      }

      // Escape to clear
      if (e.key === "Escape") {
        e.preventDefault();
        setMessage("");
        setAttachments([]);
        return;
      }
    },
    [handleSend]
  );

  // Handle file attachment
  const handleAttachment = React.useCallback((files: FileList) => {
    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const isImage = file.type.startsWith("image/");
      
      return {
        id,
        type: isImage ? "image" : "file" as const,
        name: file.name,
        size: file.size,
        file,
        url: isImage ? URL.createObjectURL(file) : undefined,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  // Remove attachment
  const handleRemoveAttachment = React.useCallback((id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  // Clear all
  const handleClear = React.useCallback(() => {
    setMessage("");
    attachments.forEach((a) => {
      if (a.url) URL.revokeObjectURL(a.url);
    });
    setAttachments([]);
  }, [attachments]);

  const hasContent = message.trim().length > 0 || attachments.length > 0;
  const characterCount = message.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div
      className={cn(
        "relative w-full transition-all duration-200",
        isFocused && "ring-2 ring-ring/20"
      )}
    >
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="mb-2">
          <AttachmentPreview
            attachments={attachments}
            onRemove={handleRemoveAttachment}
          />
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          "relative flex items-end gap-1.5 sm:gap-2",
          "rounded-2xl border border-border bg-[var(--chat-input-bg)]",
          "p-2 sm:p-3 shadow-sm transition-all duration-200",
          isFocused && "border-ring shadow-md",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Action Buttons (Left) - Hidden on very small screens */}
        {showActions && (
          <div className="hidden xs:flex items-center gap-0.5 sm:gap-1 pb-0.5 sm:pb-1">
            <InputActions
              onAttachment={handleAttachment}
              onClear={hasContent ? handleClear : undefined}
              hasContent={hasContent}
              disabled={disabled || isLoading}
            />
          </div>
        )}

        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || randomPlaceholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground",
              "focus:outline-none",
              "min-h-[24px] max-h-[120px] sm:max-h-[150px] py-1 sm:py-1",
              "text-sm leading-relaxed",
              disabled && "cursor-not-allowed"
            )}
            style={{ overflow: "hidden" }}
          />
        </div>

        {/* Character Counter - Hidden on mobile when under 80% */}
        {characterCount > maxLength * 0.8 && (
          <span
            className={cn(
              "text-[10px] sm:text-xs shrink-0 pb-0.5 sm:pb-1",
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {characterCount}/{maxLength}
          </span>
        )}

        {/* Send/Stop Button */}
        <div className="flex items-center pb-0.5 sm:pb-1">
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStop}
              disabled={!onStop}
              className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg shrink-0 touch-manipulation"
              aria-label="Stop generating"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!hasContent || isOverLimit || disabled}
              className={cn(
                "h-9 w-9 sm:h-8 sm:w-8 rounded-lg shrink-0 transition-all duration-200 touch-manipulation",
                hasContent && !isOverLimit
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
              aria-label="Send message"
            >
              <Send
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  hasContent && !isOverLimit && "translate-x-0.5"
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint - Hidden on mobile */}
      <div className="hidden sm:flex mt-2 justify-center">
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
            Enter
          </kbd>
          {" to send · "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
            Shift+Enter
          </kbd>
          {" for new line · "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
            Esc
          </kbd>
          {" to clear"}
        </p>
      </div>

      {/* Mobile keyboard hint - simplified */}
      <div className="sm:hidden mt-1.5 flex justify-center">
        <p className="text-[10px] text-muted-foreground">
          <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-mono">
            Enter
          </kbd>
          {" send · "}
          <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-mono">
            Shift+Enter
          </kbd>
          {" new line"}
        </p>
      </div>
    </div>
  );
}

// Compact variant for smaller spaces
export function ChatInputCompact({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder,
}: Omit<ChatInputProps, "showActions" | "maxLength">) {
  const [message, setMessage] = React.useState("");
  const textareaRef = useAutoResize(message);

  const handleSend = React.useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) return;
    onSend(trimmedMessage);
    setMessage("");
  }, [message, isLoading, disabled, onSend]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 rounded-xl border border-input bg-background p-2 sm:p-2">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type a message..."}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[24px] max-h-[80px] sm:max-h-[100px]"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || isLoading || disabled}
        className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 touch-manipulation"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
