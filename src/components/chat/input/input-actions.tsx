"use client";

import * as React from "react";
import { Paperclip, Mic, MicOff, X, Link, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface InputActionsProps {
  onAttachment?: (files: FileList) => void;
  onVoiceInput?: () => void;
  onClear?: () => void;
  hasContent?: boolean;
  disabled?: boolean;
  showVoiceInput?: boolean;
  showLinkButton?: boolean;
}

export function InputActions({
  onAttachment,
  onVoiceInput,
  onClear,
  hasContent = false,
  disabled = false,
  showVoiceInput = true,
  showLinkButton = true,
}: InputActionsProps) {
  const [isVoiceActive, setIsVoiceActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file input click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAttachment) {
      onAttachment(files);
    }
    // Reset input
    e.target.value = "";
  };

  // Handle voice input toggle
  const handleVoiceToggle = () => {
    setIsVoiceActive((prev) => !prev);
    onVoiceInput?.();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {/* File Attachment Button */}
        {onAttachment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAttachmentClick}
                disabled={disabled}
                className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent touch-manipulation"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Attach file</p>
            </TooltipContent>
          </Tooltip>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Image Upload Button - Hidden on very small screens */}
        {onAttachment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
                disabled={disabled}
                className="hidden sm:flex h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent touch-manipulation"
                aria-label="Upload image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Upload image</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Link Button - Hidden on mobile */}
        {showLinkButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="hidden md:flex h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent touch-manipulation"
                aria-label="Add link"
              >
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Add link</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Voice Input Button */}
        {showVoiceInput && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceToggle}
                disabled={disabled}
                className={cn(
                  "h-8 w-8 rounded-lg transition-colors touch-manipulation",
                  isVoiceActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                aria-label={isVoiceActive ? "Stop voice input" : "Start voice input"}
              >
                {isVoiceActive ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{isVoiceActive ? "Stop voice input" : "Voice input"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Clear Button */}
        {onClear && hasContent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={disabled}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Clear input</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Compact action buttons for mobile
export function InputActionsCompact({
  onAttachment,
  onVoiceInput,
  disabled = false,
}: Pick<InputActionsProps, "onAttachment" | "onVoiceInput" | "disabled">) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-1">
      {onAttachment && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="h-9 w-9 sm:h-8 sm:w-8 rounded-full touch-manipulation"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAttachment(e.target.files);
              }
              e.target.value = "";
            }}
            className="hidden"
          />
        </>
      )}
      {onVoiceInput && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onVoiceInput}
          disabled={disabled}
          className="h-9 w-9 sm:h-8 sm:w-8 rounded-full touch-manipulation"
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// File type icon helper
export function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return ImageIcon;
  }
  if (type.includes("pdf") || type.includes("document") || type.includes("text")) {
    return FileText;
  }
  return FileText;
}
