export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    model?: string;
    tokens?: number;
    finishReason?: string;
  };
}

export interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  onAction?: (action: string, messageId: string) => void;
}

export interface MessageActionsProps {
  messageId: string;
  role: MessageRole;
  content: string;
  onAction?: (action: string, messageId: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onAction?: (action: string, messageId: string) => void;
}

export interface TypingIndicatorProps {
  className?: string;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}
