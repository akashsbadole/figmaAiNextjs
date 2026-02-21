'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDesignSystemStore } from '@/store/useDesignSystemStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  History,
  Trash2,
  Palette,
  Layers,
  Server,
  ExternalLink,
  MoreVertical,
  Pencil,
  Link2,
} from 'lucide-react'

interface HistoryItem {
  id: string
  name: string
  description: string | null
  prompt: string
  type: string
  createdAt: string
  designSystemId: string | null
}

export default function HistoryPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const { designHistory, isLoadingHistory, historyError, fetchDesignHistory, clearDesignHistory, deleteHistoryItem, renameHistoryItem } = useDesignSystemStore()

  // Rename dialog state
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [itemToRename, setItemToRename] = useState<HistoryItem | null>(null)
  const [newName, setNewName] = useState('')

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    fetchDesignHistory()
  }, [isLoaded, isSignedIn, router, fetchDesignHistory])

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all history?')) return
    await clearDesignHistory()
  }

  // Rename handlers
  const openRenameDialog = (item: HistoryItem) => {
    setItemToRename(item)
    setNewName(item.name)
    setIsRenameDialogOpen(true)
  }

  const handleRename = async () => {
    if (!itemToRename || !newName.trim()) return
    await renameHistoryItem(itemToRename.id, newName.trim())
    setIsRenameDialogOpen(false)
    setItemToRename(null)
    setNewName('')
  }

  // Copy shareable link handler
  const handleCopyLink = (item: HistoryItem) => {
    if (!item.designSystemId) {
      toast.error('No design system associated with this item')
      return
    }
    const link = `${window.location.origin}/design-system/${item.designSystemId}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard')
  }

  // Delete handlers
  const openDeleteDialog = (item: HistoryItem) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    await deleteHistoryItem(itemToDelete.id)
    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design-system':
        return <Palette className="h-4 w-4" />
      case 'figma':
        return <Layers className="h-4 w-4" />
      case 'system-design':
        return <Server className="h-4 w-4" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'design-system':
        return 'default'
      case 'figma':
        return 'secondary'
      case 'system-design':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Design History</h1>
                <p className="text-xs text-muted-foreground">Your generated designs</p>
              </div>
            </div>
          </div>
          {designHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : historyError ? (
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <History className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Error loading history</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {historyError}
              </p>
              <Button onClick={() => fetchDesignHistory()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : designHistory.length === 0 ? (
          <Card className="flex items-center justify-center py-20">
            <CardContent className="text-center space-y-4">
              <div className="bg-primary/10 rounded-full p-4 mx-auto w-fit">
                <History className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No History Yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Your generated design systems, Figma designs, and system architectures will appear here.
                </p>
              </div>
              <Link href="/generate">
                <Button>
                  Generate Your First Design
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {designHistory.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {item.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeBadgeVariant(item.type) as any}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRenameDialog(item)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCopyLink(item)}
                            disabled={!item.designSystemId}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Copy Shareable Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {item.prompt}
                  </p>
                  <div className="flex items-center gap-2">
                    {item.designSystemId && (
                      <Link href={`/design-system/${item.designSystemId}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Design
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename History Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete History Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
