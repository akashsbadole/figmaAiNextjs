"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MemoizedMessageList } from "./messages";
import { ChatInput } from "./input";
import { WelcomeScreen } from "./welcome-screen";
import type { Message } from "./messages";
import type { Attachment } from "./input";

interface ChatMainProps {
  children?: React.ReactNode;
  messages?: Message[];
  isLoading?: boolean;
  onSend?: (message: string, attachments?: Attachment[]) => void;
  onAction?: (action: string, messageId: string) => void;
  showWelcome?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMain({
  children,
  messages = [],
  isLoading = false,
  onSend,
  onAction,
  showWelcome = false,
  onSuggestionClick,
}: ChatMainProps) {
  // Handle virtual keyboard appearance on mobile
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        // Check if virtual keyboard is likely open
        const isKeyboardOpen = window.innerHeight < window.screen.height * 0.75;
        document.documentElement.style.setProperty(
          "--keyboard-offset",
          isKeyboardOpen ? `${window.screen.height - window.innerHeight}px` : "0px"
        );
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {children || (
          <>
            {/* Messages area */}
            {showWelcome && messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={onSuggestionClick} />
            ) : (
              <MemoizedMessageList
                messages={messages}
                isLoading={isLoading}
                onAction={onAction}
              />
            )}

            {/* Input area */}
            <ChatInputContainer>
              <ChatInput
                onSend={onSend || (() => {})}
                isLoading={isLoading}
                disabled={false}
              />
            </ChatInputContainer>
          </>
        )}
      </div>
    </main>
  );
}

// Message list container - placeholder for now
interface MessageListContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export function MessageListContainer({ children, className }: MessageListContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        // Responsive padding
        "px-3 py-4",
        "sm:px-4 sm:py-5",
        "md:px-6 md:py-6",
        "lg:px-8",
        // Safe area for notched devices
        "safe-area-inset-left safe-area-inset-right",
        className
      )}
    >
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  );
}

// Chat input container with safe area support
interface ChatInputContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export function ChatInputContainer({ children, className }: ChatInputContainerProps) {
  return (
    <div 
      className={cn(
        "border-t border-border bg-background",
        // Responsive padding
        "p-3",
        "sm:p-4",
        // Safe area for notched devices (bottom)
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "sm:pb-[calc(1rem+env(safe-area-inset-bottom))]",
        // Keyboard offset for mobile
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="mx-auto max-w-3xl">
        {children}
      </div>
    </div>
  );
}
