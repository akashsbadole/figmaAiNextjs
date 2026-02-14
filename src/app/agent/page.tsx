'use client'

import { useState, useEffect, useRef } from 'react'
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
  Wand2,
  Download,
  Eye,
  FileCode
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  type: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export default function AgentPage() {
  const { isLoaded, userId, isSignedIn } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewCode, setPreviewCode] = useState({ code: '', language: '', filename: '' })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Language detection and file extensions
  const languageMap: Record<string, { ext: string; name: string }> = {
    html: { ext: 'html', name: 'HTML' },
    htm: { ext: 'html', name: 'HTML' },
    css: { ext: 'css', name: 'CSS' },
    javascript: { ext: 'js', name: 'JavaScript' },
    js: { ext: 'js', name: 'JavaScript' },
    react: { ext: 'tsx', name: 'ReactJS' },
    reactjs: { ext: 'tsx', name: 'ReactJS' },
    nextjs: { ext: 'tsx', name: 'NextJS' },
    next: { ext: 'tsx', name: 'NextJS' },
    sqlite: { ext: 'sql', name: 'SQLite' },
    sql: { ext: 'sql', name: 'SQLite' },
  }

  // Detect code blocks and extract code
  const detectCodeBlocks = (content: string): { hasCode: boolean; code: string; language: string; filename: string } => {
    // Check for markdown code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const match = codeBlockRegex.exec(content)
    
    if (match) {
      const lang = match[1].toLowerCase() || 'text'
      const code = match[2].trim()
      const langInfo = languageMap[lang] || { ext: 'txt', name: lang }
      return {
        hasCode: true,
        code,
        language: langInfo.name,
        filename: `code_${Date.now()}.${langInfo.ext}`
      }
    }

    // Check for inline code patterns
    const inlinePatterns = [
      { pattern: /<html[\s\S]*?<\/html>/gi, lang: 'html' },
      { pattern: /<style[\s\S]*?<\/style>/gi, lang: 'css' },
      { pattern: /<script[\s\S]*?<\/script>/gi, lang: 'js' },
      { pattern: /import.*from\s+['"]react['"]/gi, lang: 'react' },
      { pattern: /import.*from\s+['"]next['"]/gi, lang: 'nextjs' },
      { pattern: /CREATE TABLE|SELECT \* FROM/gi, lang: 'sqlite' },
    ]

    for (const { pattern, lang } of inlinePatterns) {
      if (pattern.test(content)) {
        const langInfo = languageMap[lang]
        return {
          hasCode: true,
          code: content,
          language: langInfo.name,
          filename: `code_${Date.now()}.${langInfo.ext}`
        }
      }
    }

    return { hasCode: false, code: '', language: '', filename: '' }
  }

  // Download code as file
  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Open preview modal
  const openPreview = (content: string) => {
    const detected = detectCodeBlocks(content)
    if (detected.hasCode) {
      setPreviewCode(detected)
      setPreviewOpen(true)
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
        setMessages(data.conversation.messages)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: currentConversation?.id,
          messages: [...messages, userMessage]
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update conversation title if it's the first message
      if (!currentConversation && data.conversationId) {
        setCurrentConversation({ id: data.conversationId })
        loadConversations() // Refresh conversation list
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this conversation?')) return

    try {
      const response = await fetch(`/api/agent/conversations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (currentConversation?.id === id) {
          handleNewConversation()
        }
        loadConversations()
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Copy to clipboard handler
  const copyToClipboard = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
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
          <Button onClick={handleNewConversation} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] ">
          {/* Sidebar - Conversations */}
          <Card className="lg:col-span-1 overflow-hidden overflow-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-280px)]">
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
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                          currentConversation?.id === conv.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            {/* Horizontal scroll for title */}
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            {/* Horizontal scroll for badges */}
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pt-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                  {conv.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  {new Date(conv.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 opacity-60 hover:opacity-100"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col overflow-hidden overflow-auto">
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
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="bg-primary/10 rounded-full p-4 mb-4">
                        <Sparkles className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Start Your Design Consultation</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        I'm your AI-powered UI/UX design consultant. Ask me about design systems,
                        user research, accessibility, best practices, or any design challenge you're facing.
                      </p>
                      <div className="mt-6 grid gap-2 text-left max-w-lg">
                        <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                        {[
                          "How can I improve the accessibility of my dashboard?",
                          "What's the best color contrast ratio for text?",
                          "How should I structure my design system?",
                          "What are some best practices for mobile navigation?"
                        ].map((example, i) => (
                          <button
                            key={i}
                            onClick={() => setMessage(example)}
                            className="text-sm p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                          >
                            "{example}"
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
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
                          className={`max-w-[80%] rounded-lg p-4 overflow-hidden ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {/* Message header with copy, preview, and download buttons for assistant */}
                          {msg.role === 'assistant' && (
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium opacity-70">AI Assistant</span>
                              <div className="flex items-center gap-1">
                                {detectCodeBlocks(msg.content).hasCode && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-60 hover:opacity-100"
                                      onClick={() => openPreview(msg.content)}
                                      title="Preview Code"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-60 hover:opacity-100"
                                      onClick={() => {
                                        const detected = detectCodeBlocks(msg.content)
                                        downloadCode(detected.code, detected.filename)
                                      }}
                                      title="Download Code"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-60 hover:opacity-100"
                                  onClick={() => copyToClipboard(msg.content, idx)}
                                  title="Copy"
                                >
                                  {copiedIdx === idx ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          {/* Horizontal scroll wrapper for message content */}
                          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          </div>
                          <p className="text-xs mt-2 opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
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
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
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
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || loading}
                    size="icon"
                    className="h-[60px] w-[60px] flex-shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Code Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Code Preview - {previewCode.language}
            </DialogTitle>
            <DialogDescription>
              Filename: {previewCode.filename}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm font-mono">{previewCode.code}</code>
            </pre>
          </ScrollArea>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(previewCode.code)
                alert('Copied to clipboard!')
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={() => downloadCode(previewCode.code, previewCode.filename)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
