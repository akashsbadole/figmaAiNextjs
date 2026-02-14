'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, MoreVertical } from 'lucide-react';
import { FileNode } from '@/store/useVFSStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileTreeProps {
  files: FileNode[];
  activeFile: string | null;
  openFiles: string[];
  onFileClick: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateDirectory: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onToggleDirectory: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  openFiles,
  onFileClick,
  onCreateFile,
  onCreateDirectory,
  onDeleteFile,
  onToggleDirectory,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [createType, setCreateType] = useState<'file' | 'directory'>('file');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ name: string; path: string } | null>(null);

  const handleCreate = (path: string, type: 'file' | 'directory') => {
    setSelectedPath(path);
    setCreateType(type);
    setNewItemName('');
    setCreateDialogOpen(true);
  };

  const handleCreateConfirm = () => {
    if (!newItemName.trim()) return;
    
    const parentPath = selectedPath || '';
    const fullPath = parentPath ? `${parentPath}/${newItemName}` : newItemName;
    
    if (createType === 'file') {
      onCreateFile(fullPath);
    } else {
      onCreateDirectory(fullPath);
    }
    
    setCreateDialogOpen(false);
    setNewItemName('');
  };

  const handleDelete = (name: string, path: string) => {
    setItemToDelete({ name, path });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDeleteFile(itemToDelete.path);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="select-none">
        <div
          className={`
            flex items-center py-1 px-2 cursor-pointer text-sm
            ${activeFile === node.path ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'}
            ${openFiles.includes(node.path) && node.type === 'file' ? 'text-blue-300' : 'text-gray-300'}
          `}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              onFileClick(node.path);
            } else {
              onToggleDirectory(node.path);
            }
          }}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {node.type === 'directory' ? (
              <>
                {node.isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
                {node.isExpanded ? (
                  <FolderOpen className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                ) : (
                  <Folder className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                )}
              </>
            ) : (
              <>
                <span className="w-4" />
                <File className="w-4 h-4 flex-shrink-0 text-blue-400" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {node.type === 'directory' && (
                <>
                  <DropdownMenuItem onClick={() => handleCreate(node.path, 'file')}>
                    <Plus className="w-4 h-4 mr-2" />
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreate(node.path, 'directory')}>
                    <Folder className="w-4 h-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                onClick={() => handleDelete(node.name, node.path)}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {node.type === 'directory' && node.isExpanded && node.children && (
          <div>
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-300">Explorer</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleCreate('', 'file')}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="group">
          {files.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No files yet
            </div>
          ) : (
            renderTree(files)
          )}
        </div>
      </ScrollArea>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {createType === 'file' ? 'File' : 'Folder'}</DialogTitle>
            <DialogDescription>
              Enter a name for the new {createType}.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={createType === 'file' ? 'filename.ts' : 'foldername'}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateConfirm()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConfirm} disabled={!newItemName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {itemToDelete?.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileTree;
