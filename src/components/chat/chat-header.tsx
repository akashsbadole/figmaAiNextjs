"use client";

import * as React from "react";
import { Menu, Plus, MessageSquare, Settings, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onMenuClick: () => void;
  title?: string;
  showNewChat?: boolean;
  onNewChat?: () => void;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export function ChatHeader({
  onMenuClick,
  title = "Chat",
  showNewChat = true,
  onNewChat,
  user,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-12 sm:h-14 w-full items-center justify-between border-b border-border bg-background/95 px-3 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
      {/* Left section */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        {/* Mobile menu toggle - visible on mobile and tablet */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9 lg:hidden shrink-0 touch-manipulation"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo/Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* New chat button - text hidden on mobile */}
        {showNewChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="hidden sm:flex gap-2 h-9 touch-manipulation"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New Chat</span>
          </Button>
        )}

        {/* Mobile new chat button - icon only */}
        {showNewChat && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-9 w-9 sm:hidden shrink-0 touch-manipulation"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}

        {/* Theme toggle - hidden on very small screens */}
        <div className="hidden xs:block">
          <ThemeToggle variant="toggle" />
        </div>

        {/* User menu/avatar */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full touch-manipulation"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={user?.image} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="sm:hidden">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">
                <ThemeToggle variant="dropdown" />
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* More options - mobile only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:hidden shrink-0 touch-manipulation"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onNewChat}>
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
