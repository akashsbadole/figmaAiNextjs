"use client";

import * as React from "react";
import { Sparkles, Code, Lightbulb, PenLine, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void;
  suggestions?: string[];
}

const defaultSuggestions = [
  {
    icon: Sparkles,
    title: "Create something new",
    description: "Help me brainstorm ideas for a new project",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Code,
    title: "Write code",
    description: "Help me write a function or debug code",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Lightbulb,
    title: "Learn something",
    description: "Explain a concept or answer questions",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: PenLine,
    title: "Write content",
    description: "Help me write or improve text content",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

export function WelcomeScreen({
  onSuggestionClick,
  suggestions,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-8 md:py-12 overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
        {/* Logo/Icon */}
        <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
          <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
        </div>

        {/* Title */}
        <h1 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          How can I help you today?
        </h1>

        {/* Subtitle */}
        <p className="mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base text-muted-foreground px-4">
          Start a conversation or choose a suggestion below
        </p>

        {/* Suggestion cards - Stack vertically on mobile, grid on larger screens */}
        <div className="grid w-full max-w-md sm:max-w-xl gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          {defaultSuggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              color={suggestion.color}
              bgColor={suggestion.bgColor}
              onClick={() => onSuggestionClick?.(suggestion.description)}
            />
          ))}
        </div>

        {/* Quick tips - Hidden on very small screens, simplified on mobile */}
        <div className="mt-6 sm:mt-8 md:mt-12 hidden xs:flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-2">
            <kbd className="rounded bg-muted px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs font-mono">Enter</kbd>
            <span>to send</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <kbd className="rounded bg-muted px-2 py-0.5 text-xs font-mono">Shift + Enter</kbd>
            <span>for new line</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <kbd className="rounded bg-muted px-2 py-0.5 text-xs font-mono">Ctrl + N</kbd>
            <span>new chat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

function SuggestionCard({
  icon: Icon,
  title,
  description,
  color,
  bgColor,
  onClick,
}: SuggestionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 text-left transition-all w-full",
        "hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "touch-manipulation min-h-[44px] sm:min-h-0"
      )}
    >
      <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md sm:rounded-lg", bgColor)}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-medium text-foreground">{title}</h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 hidden sm:block">{description}</p>
      </div>
    </button>
  );
}
