"use client";

import * as React from "react";
import { X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Attachment } from "./chat-input";

export interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  maxPreview?: number;
}

// Format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get file icon based on type
function getFileIcon(type: string, className?: string) {
  if (type === "image") return <ImageIcon className={cn("h-4 w-4", className)} />;
  return <FileText className={cn("h-4 w-4", className)} />;
}

export function AttachmentPreview({
  attachments,
  onRemove,
  maxPreview = 4,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  const visibleAttachments = attachments.slice(0, maxPreview);
  const hiddenCount = attachments.length - maxPreview;

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {visibleAttachments.map((attachment) => (
        <AttachmentItem
          key={attachment.id}
          attachment={attachment}
          onRemove={onRemove}
        />
      ))}
      
      {/* Show count of hidden attachments */}
      {hiddenCount > 0 && (
        <div className="flex items-center justify-center h-14 sm:h-16 px-2.5 sm:px-3 rounded-lg bg-muted text-xs sm:text-sm text-muted-foreground">
          +{hiddenCount} more
        </div>
      )}
    </div>
  );
}

// Individual attachment item
interface AttachmentItemProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentItem({ attachment, onRemove }: AttachmentItemProps) {
  const [imageError, setImageError] = React.useState(false);

  // Image preview
  if (attachment.type === "image" && attachment.url && !imageError) {
    return (
      <div className="relative group">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border bg-muted">
          <img
            src={attachment.url}
            alt={attachment.name || "Attached image"}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
        
        {/* Remove button - always visible on mobile */}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => onRemove(attachment.id)}
          className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-5 sm:w-5 rounded-full opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
        
        {/* Filename tooltip - hidden on very small screens */}
        <div className="hidden sm:block absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-[10px] text-muted-foreground truncate block px-1">
            {attachment.name.length > 10
              ? `${attachment.name.slice(0, 10)}...`
              : attachment.name}
          </span>
        </div>
      </div>
    );
  }

  // File preview (non-image or failed image load)
  return (
    <div className="relative group">
      <div className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg border border-border bg-muted">
        {getFileIcon(attachment.type, "h-3.5 w-3.5 sm:h-4 sm:w-4")}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-[120px]">
            {attachment.name}
          </span>
          {attachment.size && (
            <span className="hidden sm:block text-[10px] text-muted-foreground">
              {formatFileSize(attachment.size)}
            </span>
          )}
        </div>
      </div>
      
      {/* Remove button - always visible on mobile */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => onRemove(attachment.id)}
        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-5 sm:w-5 rounded-full opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
        aria-label={`Remove ${attachment.name}`}
      >
        <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      </Button>
    </div>
  );
}

// Compact preview for small spaces
export function AttachmentPreviewCompact({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-1 h-6 sm:h-7 px-1.5 sm:px-2 rounded-full bg-muted text-[10px] sm:text-xs"
        >
          {getFileIcon(attachment.type, "h-2.5 w-2.5 sm:h-3 sm:w-3")}
          <span className="max-w-[60px] sm:max-w-[80px] truncate">{attachment.name}</span>
          <button
            type="button"
            onClick={() => onRemove(attachment.id)}
            className="ml-0.5 text-muted-foreground hover:text-foreground touch-manipulation"
            aria-label={`Remove ${attachment.name}`}
          >
            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Grid preview for multiple images
export function AttachmentPreviewGrid({
  attachments,
  onRemove,
  columns = 3,
}: AttachmentPreviewProps & { columns?: number }) {
  const imageAttachments = attachments.filter((a) => a.type === "image");
  
  if (imageAttachments.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-1.5 sm:gap-2",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4"
      )}
    >
      {imageAttachments.map((attachment) => (
        <div key={attachment.id} className="relative group aspect-square">
          {attachment.url && (
            <img
              src={attachment.url}
              alt={attachment.name || "Attached image"}
              className="h-full w-full object-cover rounded-lg"
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => onRemove(attachment.id)}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-6 w-6 sm:h-6 sm:w-6 rounded-full opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
            aria-label={`Remove ${attachment.name}`}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
