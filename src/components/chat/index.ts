// Chat Layout Components
export { ChatLayout, useSidebar } from "./chat-layout";
export { ChatHeader } from "./chat-header";
export { ChatSidebar } from "./chat-sidebar";
export type { Conversation } from "./chat-sidebar";
export { ChatMain, MessageListContainer, ChatInputContainer } from "./chat-main";
export { WelcomeScreen } from "./welcome-screen";

// Message Components
export {
  // Types
  type Message,
  type MessageRole,
  type MessageBubbleProps,
  type MessageActionsProps,
  type MessageListProps,
  type TypingIndicatorProps,
  type CodeBlockProps,
  // Components
  MessageBubble,
  MemoizedMessageBubble,
  MessageActions,
  MessageActionsCompact,
  MemoizedMessageList,
  TypingIndicator,
  TypingIndicatorPulse,
  TypingIndicatorWave,
  CodeBlock,
  InlineCode,
} from "./messages";

// Input Components
export {
  // Types
  type Attachment,
  type ChatInputProps,
  type InputActionsProps,
  type AttachmentPreviewProps,
  // Components
  ChatInput,
  ChatInputCompact,
  InputActions,
  InputActionsCompact,
  getFileIcon,
  AttachmentPreview,
  AttachmentPreviewCompact,
  AttachmentPreviewGrid,
} from "./input";
