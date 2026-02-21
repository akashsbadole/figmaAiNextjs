'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  MessageSquare,
  Send,
  Palette,
  ArrowLeft,
  Loader2,
  Sparkles,
  Trash2,
  Plus,
  Clock,
  Copy,
  Check,
  Download,
  Eye,
  FileCode,
  MoreVertical,
  RefreshCw,
  Edit2,
  StopCircle,
  FileDown,
  Lightbulb,
  Mic,
  MicOff,
  Pencil,
  Link2,
  ThumbsUp,
  ThumbsDown,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
  isEditing?: boolean
  reaction?: 'up' | 'down' | null
}

interface Conversation {
  id: string
  title: string
  type: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

const SUGGESTED_PROMPTS = [
  "How can I improve the accessibility of my dashboard?",
  "What's the best color contrast ratio for text?",
  "How should I structure my design system?",
  "What are some best practices for mobile navigation?",
  "Explain the principles of visual hierarchy",
  "How do I design for different screen sizes?",
  "What are common UX patterns for e-commerce?",
  "How can I make my forms more user-friendly?"
]

export default function AgentPage() {
  const { isLoaded, userId, isSignedIn } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewCode, setPreviewCode] = useState({ code: '', language: '', filename: '' })
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [conversationToRename, setConversationToRename] = useState<Conversation | null>(null)
  const [newTitle, setNewTitle] = useState('')
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null)
  
  // Conversation search state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<Message | null>(null)
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  // Voice recognition
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setMessage(prev => prev + ' ' + transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  // Load conversations
  useEffect(() => {
    if (isSignedIn) {
      loadConversations()
    }
  }, [isSignedIn])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/agent/chat')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/agent/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentConversation(data.conversation)
        const messagesWithIds = data.conversation.messages.map((msg: any, idx: number) => ({
          ...msg,
          id: `${conversationId}-${idx}`
        }))
        setMessages(messagesWithIds)
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const handleSendMessage = async (messageToSend?: string) => {
    const textToSend = messageToSend || message
    if (!textToSend.trim() || loading) return

    const userMessageId = `user-${Date.now()}`
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)
    setIsGenerating(true)
    setShowSuggestions(false)

    // Create abort controller for stopping generation
    abortControllerRef.current = new AbortController()

    const assistantMessageId = `assistant-${Date.now()}`
    const streamingMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }

    setMessages(prev => [...prev, streamingMessage])

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationId: currentConversation?.id,
          messages: [...messages, userMessage]
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      // Simulate streaming effect
      const fullResponse = data.response
      let currentText = ''
      const words = fullResponse.split(' ')

      for (let i = 0; i < words.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break

        currentText += (i > 0 ? ' ' : '') + words[i]
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: currentText }
            : msg
        ))
        await new Promise(resolve => setTimeout(resolve, 30))
      }

      // Final update
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: fullResponse, isStreaming: false }
          : msg
      ))

      // Update conversation
      if (!currentConversation && data.conversationId) {
        setCurrentConversation({ id: data.conversationId })
        loadConversations()
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user')
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        ))
      } else {
        console.error('Error sending message:', error)
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
        alert('Failed to send message')
      }
    } finally {
      setLoading(false)
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleRegenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    const previousUserMessage = messages[messageIndex - 1]
    if (previousUserMessage.role !== 'user') return

    // Remove the assistant message and regenerate
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    await handleSendMessage(previousUserMessage.content)
  }

  const handleEditMessage = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId)
    if (msg) {
      setEditingMessageId(messageId)
      setEditedContent(msg.content)
    }
  }

  const handleSaveEdit = async (messageId: string) => {
    if (!editedContent.trim()) return

    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1) return

    // Update the message
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, content: editedContent } : msg
    ))

    // Remove all messages after this one
    setMessages(prev => prev.slice(0, messageIndex + 1))

    setEditingMessageId(null)
    setEditedContent('')

    // Regenerate response if it was a user message
    const editedMessage = messages[messageIndex]
    if (editedMessage.role === 'user') {
      await handleSendMessage(editedContent)
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditedContent('')
  }

  const handleNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
    setShowSuggestions(true)
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Find the conversation and open delete confirmation dialog
    const conv = conversations.find(c => c.id === id)
    if (conv) {
      setConversationToDelete(conv)
      setDeleteDialogOpen(true)
    }
  }
  
  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return
    
    try {
      const response = await fetch(`/api/agent/conversations/${conversationToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (currentConversation?.id === conversationToDelete.id) {
          handleNewConversation()
        }
        loadConversations()
        toast.success('Conversation deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    } finally {
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }
  
  const handleRenameConversation = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToRename(conv)
    setNewTitle(conv.title)
    setRenameDialogOpen(true)
  }
  
  const confirmRenameConversation = async () => {
    if (!conversationToRename || !newTitle.trim()) return
    
    try {
      const response = await fetch(`/api/agent/conversations/${conversationToRename.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      })

      if (response.ok) {
        loadConversations()
        // Update current conversation if it's the one being renamed
        if (currentConversation?.id === conversationToRename.id) {
          setCurrentConversation({ ...currentConversation, title: newTitle.trim() })
        }
        toast.success('Conversation renamed successfully')
      }
    } catch (error) {
      console.error('Error renaming conversation:', error)
      toast.error('Failed to rename conversation')
    } finally {
      setRenameDialogOpen(false)
      setConversationToRename(null)
      setNewTitle('')
    }
  }
  
  const handleCopyShareLink = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/agent?conversation=${conv.id}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Shareable link copied to clipboard')
  }
  
  // Handle message reaction
  const handleReaction = (messageId: string, reaction: 'up' | 'down') => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return
    
    // Toggle reaction if same button clicked
    const newReaction = message.reaction === reaction ? null : reaction
    
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, reaction: newReaction } : msg
    ))
    
    // Open feedback dialog for downvote or show toast for upvote
    if (newReaction === 'down') {
      setFeedbackMessage(message)
      setFeedbackType('down')
      setFeedbackDialogOpen(true)
    } else if (newReaction === 'up') {
      toast.success('Thanks for your feedback!', {
        description: 'We appreciate you taking the time to let us know.'
      })
    } else {
      toast.info('Feedback removed')
    }
  }
  
  // Submit feedback
  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      console.log('Feedback submitted:', {
        messageId: feedbackMessage?.id,
        type: feedbackType,
        feedback: feedbackText
      })
      toast.success('Thanks for your detailed feedback!', {
        description: 'Your input helps us improve our responses.'
      })
    }
    setFeedbackDialogOpen(false)
    setFeedbackText('')
    setFeedbackMessage(null)
    setFeedbackType(null)
  }
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Copy code block to clipboard
  const copyCodeBlock = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy code:', error)
      toast.error('Failed to copy code')
    }
  }

  const handleExportConversation = () => {
    const exportData = {
      title: currentConversation?.title || 'Conversation',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(id)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">UI/UX Design Agent</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Design Consulting</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button onClick={handleExportConversation} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            <Button onClick={handleNewConversation} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar - Conversations */}
          <Card className="lg:col-span-1 overflow-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[calc(100vh-340px)]">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-xs mt-1">Start a new chat!</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer overflow-auto ${currentConversation?.id === conv.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50 border border-transparent'
                          }`}
                      >
                        <div className="flex items-start min-w-0">
                          <div className="flex-1 min-w-0 overflow-auto">
                            <p className="text-sm font-medium">{conv.title}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {conv.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(conv.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-60 hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleRenameConversation(conv, e)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleCopyShareLink(conv, e)}>
                                <Link2 className="h-4 w-4 mr-2" />
                                Copy Shareable Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col overflow-auto">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                {currentConversation?.title || 'New Conversation'}
              </CardTitle>
              <CardDescription>
                Ask anything about UI/UX design, user experience, accessibility, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                  {messages.length === 0 && showSuggestions ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="bg-primary/10 rounded-full p-4 mb-4">
                        <Sparkles className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Start Your Design Consultation</h3>
                      <p className="text-sm text-muted-foreground max-w-md mb-6">
                        I'm your AI-powered UI/UX design consultant. Ask me about design systems,
                        user research, accessibility, best practices, or any design challenge you're facing.
                      </p>
                      <div className="w-full max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <p className="text-xs font-medium text-muted-foreground">Suggested prompts:</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          {SUGGESTED_PROMPTS.map((prompt, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(prompt)}
                              className="text-sm p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        {msg.role === 'assistant' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              AI
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                            }`}
                        >
                          {editingMessageId === msg.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveEdit(msg.id)}>
                                  Save & Submit
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.role === 'assistant' && (
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium opacity-70">AI Assistant</span>
                                  <div className="flex items-center gap-1">
                                    {/* Thumbs Up Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 ${msg.reaction === 'up' ? 'text-green-500' : 'opacity-60 hover:opacity-100'}`}
                                      onClick={() => handleReaction(msg.id, 'up')}
                                      title="Good response"
                                    >
                                      <ThumbsUp className="h-3 w-3" fill={msg.reaction === 'up' ? 'currentColor' : 'none'} />
                                    </Button>
                                    {/* Thumbs Down Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 ${msg.reaction === 'down' ? 'text-red-500' : 'opacity-60 hover:opacity-100'}`}
                                      onClick={() => handleReaction(msg.id, 'down')}
                                      title="Poor response"
                                    >
                                      <ThumbsDown className="h-3 w-3" fill={msg.reaction === 'down' ? 'currentColor' : 'none'} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-60 hover:opacity-100"
                                      onClick={() => copyToClipboard(msg.content, msg.id)}
                                      title="Copy"
                                    >
                                      {copiedIdx === msg.id ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-60 hover:opacity-100"
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleRegenerateResponse(msg.id)}>
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Regenerate
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              )}
                              {msg.role === 'user' && (
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium opacity-70">You</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-60 hover:opacity-100"
                                    onClick={() => handleEditMessage(msg.id)}
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                      const match = /language-(\w+)/.exec(className || '')
                                      const codeString = String(children).replace(/\n$/, '')
                                      
                                      // Code block component with copy button
                                      if (!inline && match) {
                                        return (
                                          <div className="relative group">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 z-10"
                                              onClick={() => copyCodeBlock(codeString)}
                                              title="Copy code"
                                            >
                                              <Copy className="h-3 w-3 text-white" />
                                            </Button>
                                            <SyntaxHighlighter
                                              style={vscDarkPlus}
                                              language={match[1]}
                                              PreTag="div"
                                              {...props}
                                            >
                                              {codeString}
                                            </SyntaxHighlighter>
                                          </div>
                                        )
                                      }
                                      
                                      return (
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      )
                                    }
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                              {msg.isStreaming && (
                                <div className="flex items-center gap-1 mt-2">
                                  <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  <span className="text-xs opacity-60 ml-2">Generating...</span>
                                </div>
                              )}
                              <p className="text-xs mt-2 opacity-60">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src="" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="pt-4 border-t mt-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about UI/UX design..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="min-h-[60px] resize-none"
                    disabled={loading}
                  />
                  <div className="flex flex-col  justify-start  gap-2">
                    {isGenerating ? (
                      <Button
                        onClick={handleStopGeneration}
                        variant="destructive"
                        size="icon"
                        className="h-[28px] w-[60px]"
                      >
                        <StopCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!message.trim() || loading}
                        size="icon"
                        className="h-[28px] w-[60px]"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift + Enter for new line
                  {isListening && <span className="text-red-500 ml-2">● Listening...</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Rename Conversation Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter new title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmRenameConversation()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRenameConversation} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{conversationToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteConversation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell us more about your feedback</DialogTitle>
            <DialogDescription>
              What was the issue with this response? Your feedback helps us improve.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe the issue or suggestion..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Skip
            </Button>
            <Button onClick={handleSubmitFeedback}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
