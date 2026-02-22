import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message, MessageRole } from '@/components/chat/messages';

// Conversation type
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  type?: string;
}

// Chat message with additional fields
export interface ChatMessage extends Omit<Message, 'timestamp'> {
  timestamp: Date;
  conversationId: string;
}

// Store state interface
interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;

  // Messages
  messages: ChatMessage[];
  isGenerating: boolean;
  streamingMessageId: string | null;

  // UI State
  sidebarOpen: boolean;
  searchQuery: string;

  // Actions - Conversations
  setActiveConversation: (id: string | null) => void;
  createNewChat: (title?: string) => string;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  loadConversations: (conversations: Conversation[]) => void;

  // Actions - Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string) => void;
  clearMessages: (conversationId?: string) => void;
  loadMessages: (messages: ChatMessage[]) => void;

  // Actions - Streaming
  setStreamingMessage: (id: string | null) => void;
  appendToStreamingMessage: (content: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;

  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock conversations for demonstration
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Getting started with AI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 5,
    type: 'chat',
  },
  {
    id: 'conv-2',
    title: 'Code review assistance',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messageCount: 12,
    type: 'chat',
  },
  {
    id: 'conv-3',
    title: 'Design system questions',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    messageCount: 8,
    type: 'chat',
  },
];

// Mock messages for demonstration
const mockMessages: ChatMessage[] = [
  // Conversation 1 messages
  {
    id: 'msg-1-1',
    role: 'user' as MessageRole,
    content: 'Hello! Can you help me get started with AI?',
    timestamp: new Date(Date.now() - 3600000),
    conversationId: 'conv-1',
  },
  {
    id: 'msg-1-2',
    role: 'assistant' as MessageRole,
    content: `Of course! I'd be happy to help you get started with AI. Here are some key areas to explore:

1. **Machine Learning Basics** - Understanding supervised, unsupervised, and reinforcement learning
2. **Neural Networks** - The foundation of modern AI
3. **Natural Language Processing** - How AI understands and generates text
4. **Computer Vision** - How AI processes images and video

Would you like me to dive deeper into any of these topics?`,
    timestamp: new Date(Date.now() - 3500000),
    conversationId: 'conv-1',
  },
  {
    id: 'msg-1-3',
    role: 'user' as MessageRole,
    content: 'Tell me more about neural networks',
    timestamp: new Date(Date.now() - 3400000),
    conversationId: 'conv-1',
  },
  {
    id: 'msg-1-4',
    role: 'assistant' as MessageRole,
    content: `Neural networks are computing systems inspired by biological neural networks in the human brain. Here's a simple overview:

\`\`\`python
# Simple neural network layer
import numpy as np

class NeuralLayer:
    def __init__(self, input_size, output_size):
        self.weights = np.random.randn(input_size, output_size)
        self.bias = np.zeros(output_size)
    
    def forward(self, x):
        return np.dot(x, self.weights) + self.bias
\`\`\`

**Key Components:**
- **Neurons (Nodes)**: Basic processing units
- **Weights**: Connection strengths between neurons
- **Biases**: Threshold values for activation
- **Activation Functions**: Non-linear transformations (ReLU, Sigmoid, etc.)

**Architecture Types:**
- Feedforward Networks
- Convolutional Neural Networks (CNNs)
- Recurrent Neural Networks (RNNs)
- Transformers (like GPT!)

Would you like to see a practical example?`,
    timestamp: new Date(Date.now() - 3300000),
    conversationId: 'conv-1',
  },
  {
    id: 'msg-1-5',
    role: 'user' as MessageRole,
    content: 'Yes, show me a practical example!',
    timestamp: new Date(Date.now() - 3200000),
    conversationId: 'conv-1',
  },

  // Conversation 2 messages
  {
    id: 'msg-2-1',
    role: 'user' as MessageRole,
    content: 'Can you review this code for me?\n\n```javascript\nfunction fetchData(url) {\n  return fetch(url)\n    .then(response => response.json())\n    .then(data => {\n      console.log(data);\n      return data;\n    });\n}\n```',
    timestamp: new Date(Date.now() - 86400000 + 3600000),
    conversationId: 'conv-2',
  },
  {
    id: 'msg-2-2',
    role: 'assistant' as MessageRole,
    content: `I'd be happy to review your code! Here are my observations:

**Strengths:**
- Clean and readable structure
- Proper use of Promises
- Good use of arrow functions

**Suggestions for improvement:**

1. **Add error handling:**
\`\`\`javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
\`\`\`

2. **Consider using async/await** for better readability
3. **Add TypeScript types** for better type safety
4. **Consider adding a timeout** for network requests

Would you like me to elaborate on any of these suggestions?`,
    timestamp: new Date(Date.now() - 86400000 + 3500000),
    conversationId: 'conv-2',
  },

  // Conversation 3 messages
  {
    id: 'msg-3-1',
    role: 'user' as MessageRole,
    content: 'What are the key principles of a good design system?',
    timestamp: new Date(Date.now() - 172800000 + 3600000),
    conversationId: 'conv-3',
  },
  {
    id: 'msg-3-2',
    role: 'assistant' as MessageRole,
    content: `Great question! Here are the key principles of a well-designed design system:

## Core Principles

### 1. **Consistency**
- Unified visual language across all products
- Predictable component behavior
- Standardized naming conventions

### 2. **Reusability**
- Components should be flexible and adaptable
- Avoid one-off solutions
- Build with composition in mind

### 3. **Accessibility**
- WCAG compliance
- Keyboard navigation support
- Screen reader compatibility

### 4. **Documentation**
- Clear usage guidelines
- Code examples
- Do's and Don'ts

### 5. **Maintainability**
- Version control
- Clear contribution guidelines
- Regular updates and reviews

**Popular Design Systems to Study:**
- Material Design (Google)
- Human Interface Guidelines (Apple)
- Carbon Design System (IBM)
- Polaris (Shopify)

Would you like me to dive deeper into any of these principles?`,
    timestamp: new Date(Date.now() - 172800000 + 3500000),
    conversationId: 'conv-3',
  },
];

// Create the store
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: mockConversations,
      activeConversationId: null,
      isLoadingConversations: false,
      messages: mockMessages,
      isGenerating: false,
      streamingMessageId: null,
      sidebarOpen: true,
      searchQuery: '',

      // Conversation actions
      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      createNewChat: (title = 'New Chat') => {
        const newId = generateId();
        const now = new Date().toISOString();
        const newConversation: Conversation = {
          id: newId,
          title,
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
          type: 'chat',
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: newId,
          messages: state.messages.filter((m) => m.conversationId !== newId),
        }));
        return newId;
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          messages: state.messages.filter((m) => m.conversationId !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      loadConversations: (conversations) => {
        set({ conversations, isLoadingConversations: false });
      },

      // Message actions
      addMessage: (message) => {
        const id = generateId();
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp: new Date(),
        };

        set((state) => {
          // Update conversation message count and timestamp
          const updatedConversations = state.conversations.map((c) =>
            c.id === message.conversationId
              ? {
                  ...c,
                  messageCount: c.messageCount + 1,
                  updatedAt: new Date().toISOString(),
                  // Update title based on first user message
                  title:
                    c.messageCount === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : c.title,
                }
              : c
          );

          return {
            messages: [...state.messages, newMessage],
            conversations: updatedConversations,
          };
        });

        return id;
      },

      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        }));
      },

      clearMessages: (conversationId) => {
        set((state) => ({
          messages: conversationId
            ? state.messages.filter((m) => m.conversationId !== conversationId)
            : [],
        }));
      },

      loadMessages: (messages) => {
        set({ messages });
      },

      // Streaming actions
      setStreamingMessage: (id) => {
        set({ streamingMessageId: id });
      },

      appendToStreamingMessage: (content) => {
        const { streamingMessageId } = get();
        if (!streamingMessageId) return;

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === streamingMessageId
              ? { ...m, content: m.content + content }
              : m
          ),
        }));
      },

      setIsGenerating: (isGenerating) => {
        set({ isGenerating, streamingMessageId: isGenerating ? get().streamingMessageId : null });
      },

      // UI actions
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        messages: state.messages,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Selector hooks for better performance
export const useConversations = () => useChatStore((state) => state.conversations);
export const useActiveConversation = () =>
  useChatStore((state) =>
    state.conversations.find((c) => c.id === state.activeConversationId)
  );
export const useActiveMessages = () =>
  useChatStore((state) =>
    state.messages.filter((m) => m.conversationId === state.activeConversationId)
  );
export const useIsGenerating = () => useChatStore((state) => state.isGenerating);
export const useSidebarOpen = () => useChatStore((state) => state.sidebarOpen);
