import { useCallback, useRef } from 'react';
import { useChatStore, type ChatMessage } from '@/store/use-chat-store';
import type { Attachment } from '@/components/chat/input';

// Mock AI responses for demonstration
const mockResponses = [
  "That's a great question! Let me help you with that.\n\nBased on my understanding, here are some key points to consider:\n\n1. **First point** - This is important because...\n2. **Second point** - Additionally, you should know...\n3. **Third point** - Finally, consider this...\n\nWould you like me to elaborate on any of these points?",
  "I'd be happy to assist! Here's what I found:\n\n```javascript\n// Example code\nfunction example() {\n  console.log('Hello, World!');\n  return true;\n}\n```\n\nThis code demonstrates a simple function. Let me know if you need more details!",
  "Interesting! Let me break this down for you:\n\n**Overview:**\nThis is a complex topic, but I'll make it simple.\n\n**Key Concepts:**\n- Concept A: The foundation\n- Concept B: Building on A\n- Concept C: Advanced usage\n\n**Next Steps:**\n1. Start with the basics\n2. Practice regularly\n3. Build projects\n\nAny questions?",
  "Great! Here's my analysis:\n\n| Aspect | Rating | Notes |\n|--------|--------|-------|\n| Performance | ⭐⭐⭐⭐ | Good speed |\n| Quality | ⭐⭐⭐⭐⭐ | Excellent |\n| Usability | ⭐⭐⭐⭐ | Easy to use |\n\n**Summary:**\nOverall, this is a solid approach. I recommend proceeding with caution and testing thoroughly.",
  "Let me think about this...\n\n🤔 *Processing your request...*\n\nHere's my response:\n\n> \"The best way to predict the future is to create it.\"\n\nThis quote perfectly captures the essence of your question. Here's what I suggest:\n\n1. Start small\n2. Iterate quickly\n3. Learn from failures\n4. Celebrate successes\n\nShall I provide more specific guidance?",
];

// Simulate streaming delay
const STREAM_DELAY = 20; // ms per character
const MIN_STREAM_TIME = 500; // minimum time for streaming

interface UseChatOptions {
  onMessageSent?: (message: string) => void;
  onResponseComplete?: (response: string) => void;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    activeConversationId,
    addMessage,
    setIsGenerating,
    setStreamingMessage,
    updateMessage,
    createNewChat,
  } = useChatStore();

  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Send a message and get AI response
  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!content.trim()) return;

      // Create new conversation if none active
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = createNewChat(content.slice(0, 50));
      }

      // Add user message
      const userMessageId = addMessage({
        role: 'user',
        content,
        conversationId,
      });

      options.onMessageSent?.(content);

      // Start generating response
      setIsGenerating(true);

      // Get random mock response
      const mockResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Add assistant message placeholder
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
        conversationId,
        isStreaming: true,
      });

      setStreamingMessage(assistantMessageId);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Simulate streaming
        await simulateStreaming(
          mockResponse,
          assistantMessageId,
          (content) => {
            updateMessage(assistantMessageId, content);
          },
          abortControllerRef.current.signal
        );

        options.onResponseComplete?.(mockResponse);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Chat error:', error);
          options.onError?.(error as Error);
        }
      } finally {
        setIsGenerating(false);
        setStreamingMessage(null);
        abortControllerRef.current = null;
      }
    },
    [
      activeConversationId,
      addMessage,
      setIsGenerating,
      setStreamingMessage,
      updateMessage,
      createNewChat,
      options,
    ]
  );

  // Stop generating
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setStreamingMessage(null);
  }, [setIsGenerating, setStreamingMessage]);

  // Load a conversation
  const loadConversation = useCallback(
    (conversationId: string) => {
      const { setActiveConversation } = useChatStore.getState();
      setActiveConversation(conversationId);
    },
    []
  );

  return {
    sendMessage,
    stopGeneration,
    loadConversation,
    isActive: !!activeConversationId,
  };
}

// Simulate streaming response
async function simulateStreaming(
  fullContent: string,
  messageId: string,
  onUpdate: (content: string) => void,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    let currentIndex = 0;
    let streamedContent = '';
    const startTime = Date.now();

    const stream = () => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      if (currentIndex >= fullContent.length) {
        // Ensure minimum stream time for realistic feel
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_STREAM_TIME) {
          setTimeout(() => resolve(), MIN_STREAM_TIME - elapsed);
        } else {
          resolve();
        }
        return;
      }

      // Stream 1-3 characters at a time for realistic feel
      const charsToAdd = Math.min(
        Math.floor(Math.random() * 3) + 1,
        fullContent.length - currentIndex
      );
      streamedContent += fullContent.slice(
        currentIndex,
        currentIndex + charsToAdd
      );
      currentIndex += charsToAdd;

      onUpdate(streamedContent);

      // Variable delay for more natural feel
      const delay = STREAM_DELAY + Math.random() * 20;
      setTimeout(stream, delay);
    };

    stream();
  });
}

// Hook for managing conversation list
export function useConversations() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createNewChat,
    deleteConversation,
    updateConversationTitle,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    conversations: filteredConversations,
    activeId: activeConversationId,
    setActive: setActiveConversation,
    create: createNewChat,
    remove: deleteConversation,
    rename: updateConversationTitle,
    searchQuery,
    setSearchQuery,
  };
}

// Hook for message actions
export function useMessageActions() {
  const { messages, updateMessage, addMessage, activeConversationId } =
    useChatStore();

  const copyMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return false;

      try {
        await navigator.clipboard.writeText(message.content);
        return true;
      } catch (error) {
        console.error('Failed to copy:', error);
        return false;
      }
    },
    [messages]
  );

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.role !== 'assistant' || !activeConversationId)
        return;

      // Find the preceding user message
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const userMessage = messages
        .slice(0, messageIndex)
        .reverse()
        .find((m) => m.role === 'user');

      if (!userMessage) return;

      // Get new mock response
      const mockResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];
      updateMessage(messageId, mockResponse);
    },
    [messages, activeConversationId, updateMessage]
  );

  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      updateMessage(messageId, newContent);
    },
    [updateMessage]
  );

  return {
    copyMessage,
    regenerateMessage,
    editMessage,
  };
}

// Export types
export type { UseChatOptions };
