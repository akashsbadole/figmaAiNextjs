"use client";

import * as React from "react";
import { Search, Plus, MessageSquare, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  type?: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations?: Conversation[];
  activeId?: string;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  user?: {
    name?: string;
    email?: string;
  };
}

// Placeholder conversations for demo
const defaultConversations: Conversation[] = [
  {
    id: "1",
    title: "Getting started with AI",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 5,
  },
  {
    id: "2",
    title: "Code review assistance",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messageCount: 12,
  },
  {
    id: "3",
    title: "Design system questions",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    messageCount: 8,
  },
];

export function ChatSidebar({
  isOpen,
  onClose,
  conversations = defaultConversations,
  activeId,
  onSelectConversation,
  onNewChat,
  user,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = React.useState<number | null>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key to close sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle swipe to close gesture
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (touchStart !== null) {
      setTouchCurrent(e.targetTouches[0].clientX);
    }
  }, [touchStart]);

  const handleTouchEnd = React.useCallback(() => {
    if (touchStart !== null && touchCurrent !== null) {
      const diff = touchCurrent - touchStart;
      // If swiped left more than 50px, close sidebar
      if (diff < -50) {
        onClose();
      }
    }
    setTouchStart(null);
    setTouchCurrent(null);
  }, [touchStart, touchCurrent, onClose]);

  // Filter conversations based on search query
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Group conversations by date
  const groupedConversations = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    filteredConversations.forEach((conv) => {
      const date = new Date(conv.updatedAt);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() >= today.getTime()) {
        groups["Today"].push(conv);
      } else if (date.getTime() >= yesterday.getTime()) {
        groups["Yesterday"].push(conv);
      } else if (date.getTime() >= lastWeek.getTime()) {
        groups["Previous 7 Days"].push(conv);
      } else {
        groups["Older"].push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  // Handle conversation selection - close sidebar on mobile
  const handleSelectConversation = React.useCallback((id: string) => {
    onSelectConversation?.(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [onSelectConversation, onClose]);

  // Calculate swipe transform
  const getSwipeTransform = () => {
    if (touchStart !== null && touchCurrent !== null) {
      const diff = Math.min(0, touchCurrent - touchStart);
      return `translateX(${diff}px)`;
    }
    return isOpen ? "translateX(0)" : "translateX(-100%)";
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          // Base styles
          "flex flex-col border-r border-border bg-sidebar",
          // Mobile: Full-screen overlay with slide animation
          "fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px]",
          "transition-transform duration-300 ease-in-out",
          // Desktop: Static sidebar
          "md:relative md:z-auto md:w-72 lg:w-80",
          "md:transition-none",
          // Animation states
          mounted && (isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:hidden"),
          // Safe area for notched devices
          "pt-safe pl-safe"
        )}
        style={{
          transform: mounted ? getSwipeTransform() : undefined,
        }}
        role="navigation"
        aria-label="Chat navigation"
        aria-hidden={!isOpen}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold text-sidebar-foreground">Chats</span>
          </div>
          {/* Close button - visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 md:hidden touch-manipulation"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New chat button */}
        <div className="p-3 sm:p-4 pb-2 sm:pb-2">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-10 sm:h-11 touch-manipulation"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">New Chat</span>
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 sm:px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 sm:h-10 bg-sidebar-accent/50 border-sidebar-border text-sm sm:text-base touch-manipulation"
            />
          </div>
        </div>

        {/* Conversations list */}
        <ScrollArea className="flex-1 px-2 sm:px-3">
          {Object.entries(groupedConversations).map(([group, convs]) => {
            if (convs.length === 0) return null;
            return (
              <div key={group} className="py-2">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group}
                </h3>
                <div className="space-y-1">
                  {convs.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === activeId}
                      onClick={() => handleSelectConversation(conversation.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No conversations found</p>
            </div>
          )}
        </ScrollArea>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3 sm:p-4 safe-area-inset-bottom">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm sm:text-base">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-sidebar-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "w-full flex items-center gap-2 sm:gap-3 rounded-lg px-3 py-2.5 sm:py-3 text-left transition-colors touch-manipulation",
        "min-h-[44px]", // Minimum touch target size
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
      <span className="flex-1 truncate text-sm">{conversation.title}</span>
      {showActions && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 opacity-60 hover:opacity-100 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit
            }}
            aria-label="Rename conversation"
          >
            <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 opacity-60 hover:opacity-100 text-destructive touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
            }}
            aria-label="Delete conversation"
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      )}
    </button>
  );
}
