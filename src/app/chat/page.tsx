"use client";

import * as React from "react";
import { ChatLayout, useSidebar } from "@/components/chat/chat-layout";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMain } from "@/components/chat/chat-main";
import { useChatStore, useActiveMessages, useIsGenerating } from "@/store/use-chat-store";
import { useChat, useMessageActions } from "@/hooks/use-chat";
import type { Message } from "@/components/chat/messages";

// Convert ChatMessage to Message format for MessageList
function toMessageFormat(messages: ReturnType<typeof useActiveMessages>): Message[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    isStreaming: m.isStreaming,
    metadata: m.metadata,
  }));
}

// Main chat page component
export default function ChatPage() {
  // Store state
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    setSidebarOpen,
    setActiveConversation,
    createNewChat,
    deleteConversation,
    updateConversationTitle,
  } = useChatStore();

  const activeMessages = useActiveMessages();
  const isGenerating = useIsGenerating();

  // Hooks
  const { sendMessage, stopGeneration, loadConversation } = useChat();
  const { copyMessage, regenerateMessage } = useMessageActions();

  // Convert messages to the correct format
  const messages = toMessageFormat(activeMessages);

  // Handle sending messages
  const handleSend = React.useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage]
  );

  // Handle suggestion click from welcome screen
  const handleSuggestionClick = React.useCallback(
    (suggestion: string) => {
      handleSend(suggestion);
    },
    [handleSend]
  );

  // Handle message actions (copy, regenerate, etc.)
  const handleMessageAction = React.useCallback(
    (action: string, messageId: string) => {
      switch (action) {
        case "copy":
          copyMessage(messageId);
          break;
        case "regenerate":
          regenerateMessage(messageId);
          break;
        case "delete":
          // Handle delete if needed
          break;
        default:
          break;
      }
    },
    [copyMessage, regenerateMessage]
  );

  // Handle new chat
  const handleNewChat = React.useCallback(() => {
    createNewChat();
  }, [createNewChat]);

  // Handle sidebar toggle
  const handleMenuClick = React.useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Handle conversation selection
  const handleSelectConversation = React.useCallback(
    (id: string) => {
      setActiveConversation(id);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    },
    [setActiveConversation, setSidebarOpen]
  );

  // Handle conversation deletion
  const handleDeleteConversation = React.useCallback(
    (id: string) => {
      deleteConversation(id);
    },
    [deleteConversation]
  );

  // Handle conversation rename
  const handleRenameConversation = React.useCallback(
    (id: string, title: string) => {
      updateConversationTitle(id, title);
    },
    [updateConversationTitle]
  );

  return (
    <ChatLayout>
      <ChatHeader
        onMenuClick={handleMenuClick}
        title="AI Chat"
        showNewChat={true}
        onNewChat={handleNewChat}
        user={{
          name: "User",
          email: "user@example.com",
        }}
      />
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeConversationId || undefined}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        user={{
          name: "User",
          email: "user@example.com",
        }}
      />
      <ChatMain
        messages={messages}
        isLoading={isGenerating}
        onSend={handleSend}
        onAction={handleMessageAction}
        showWelcome={!activeConversationId || messages.length === 0}
        onSuggestionClick={handleSuggestionClick}
      />
    </ChatLayout>
  );
}
