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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#212121]">
      {/* ChatGPT-style Sidebar */}
      <div className="w-[260px] flex-shrink-0 bg-[#F9F9F9] dark:bg-[#171717] border-r border-border flex flex-col h-full hidden md:flex text-foreground relative transition-colors duration-300">
        <div className="p-3 flex gap-2">
          <Link href="/">
             <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
               <ArrowLeft className="h-4 w-4" />
             </Button>
          </Link>
          <Button 
            onClick={handleNewConversation} 
            variant="ghost" 
            className="flex-1 justify-start gap-2 rounded-lg h-10 px-3 border border-border shadow-sm hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">New Chat</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-3">
          <div className="py-2">
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-3 mt-2">Chat History</p>
            {loadingConversations ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No recent chats
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`group relative flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                      currentConversation?.id === conv.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                    <div className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                      {conv.title}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-1 shrink-0 transition-opacity text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
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
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#212121] relative">
        {/* Header (Mobile Only) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b">
           <Button variant="ghost" size="icon" onClick={() => {/* Toggle Sidebar function needed here originally */}}>
             <MoreVertical className="h-5 w-5" />
           </Button>
           <h1 className="text-xl font-bold">UI/UX Design Agent</h1>
           <Button variant="ghost" size="icon" onClick={handleNewConversation}>
             <Plus className="h-5 w-5" />
           </Button>
        </header>

        <ScrollArea className="flex-1 pb-40" ref={scrollRef}>
          <div className="max-w-3xl mx-auto w-full pt-10 pb-[100px]">
            {messages.length === 0 && showSuggestions ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="bg-[#171717] rounded-full p-4 mb-6 shadow-md shadow-black/5 dark:shadow-white/5">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 tracking-tight text-foreground">How can I help you design today?</h2>
                <div className="w-full max-w-2xl mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-4 rounded-xl border border-border bg-card/50 hover:bg-muted text-left transition-colors font-medium text-sm text-foreground/80"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 px-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full flex">
                    <div className="w-full flex group gap-4">
                      {/* Avatar Space */}
                      <div className="w-8 shrink-0 flex justify-center mt-1">
                        {msg.role === 'assistant' ? (
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#10a37f] shadow-sm">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        ) : null}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
                        {msg.role === 'user' ? (
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-3xl bg-muted px-5 py-3 text-foreground mb-4 prose prose-sm dark:prose-invert">
                              {editingMessageId === msg.id ? (
                                <div className="space-y-3 mt-2 min-w-[300px]">
                                  <Textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="min-h-[100px] border-border bg-background"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                      Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => handleSaveEdit(msg.id)}>
                                      Send
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative group/edit">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                  </ReactMarkdown>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -bottom-8 right-0 h-8 w-8 opacity-0 group-hover/edit:opacity-100 transition-opacity bg-background rounded-full shadow-md"
                                    onClick={() => handleEditMessage(msg.id)}
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <h4 className="text-sm font-semibold mb-2 text-foreground/80">UI/UX Assistant</h4>
                            <div className="prose prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const codeString = String(children).replace(/\n$/, '')
                                    
                                    if (!inline && match) {
                                      return (
                                        <div className="relative group rounded-xl overflow-hidden my-4 border border-border">
                                          <div className="flex items-center justify-between px-4 py-2 bg-muted/80 text-muted-foreground text-xs font-mono">
                                            <span>{match[1]}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 gap-1 hover:text-foreground hover:bg-muted"
                                              onClick={() => copyCodeBlock(codeString)}
                                            >
                                              <Copy className="h-3 w-3" />
                                              Copy code
                                            </Button>
                                          </div>
                                          <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, padding: '1rem', borderRadius: 0, backgroundColor: '#0d1117' }}
                                            {...props}
                                          >
                                            {codeString}
                                          </SyntaxHighlighter>
                                        </div>
                                      )
                                    }
                                    return (
                                      <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm before:content-none after:content-none" {...props}>
                                        {children}
                                      </code>
                                    )
                                  }
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>

                              {msg.isStreaming && (
                                <div className="flex items-center gap-1 mt-4 text-foreground/50">
                                  <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
                                </div>
                              )}
                            </div>

                            {/* Actions Toolbar */}
                            {!msg.isStreaming && (
                              <div className="flex items-center gap-1 mt-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                                  onClick={() => copyToClipboard(msg.content, msg.id)}
                                  title="Copy response"
                                >
                                  {copiedIdx === msg.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full hover:bg-muted ${msg.reaction === 'up' ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
                                  onClick={() => handleReaction(msg.id, 'up')}
                                  title="Good response"
                                >
                                  <ThumbsUp className="h-4 w-4" fill={msg.reaction === 'up' ? 'currentColor' : 'none'} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full hover:bg-muted ${msg.reaction === 'down' ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                                  onClick={() => handleReaction(msg.id, 'down')}
                                  title="Poor response"
                                >
                                  <ThumbsDown className="h-4 w-4" fill={msg.reaction === 'down' ? 'currentColor' : 'none'} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                                  onClick={() => handleRegenerateResponse(msg.id)}
                                  title="Regenerate"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-[#212121] dark:via-[#212121] pt-10 pb-6 px-4 z-10 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <div className="relative shadow-lg ring-1 ring-border shadow-black/5 dark:shadow-black/20 rounded-[24px] bg-background">
              <Textarea
                placeholder="Message your UI/UX Agent..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="min-h-[56px] w-full resize-none border-0 focus-visible:ring-0 shadow-none px-4 py-4 rounded-[24px] pr-[50px] bg-transparent"
                disabled={loading}
                rows={1}
                style={{ height: '56px', maxHeight: '200px' }}
              />
              <div className="absolute right-2 bottom-2">
                {isGenerating ? (
                  <Button
                    onClick={handleStopGeneration}
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full bg-primary"
                  >
                    <StopCircle className="h-5 w-5 fill-primary-foreground stroke-primary" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim() || loading}
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full transition-all bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 text-primary-foreground"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                )}
              </div>
              {isListening && <span className="absolute left-4 -top-6 text-xs text-red-500 font-medium">● Listening...</span>}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              UI/UX Agent can make mistakes. Consider verifying important design decisions.
            </p>
          </div>
        </div>
      </div>
      
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
