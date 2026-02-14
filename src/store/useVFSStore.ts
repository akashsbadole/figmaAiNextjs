import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import webContainerService, { FileSystemTree } from '@/lib/webcontainer/webcontainer-service';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

export interface FileChange {
  path: string;
  type: 'add' | 'modify' | 'delete';
  content?: string;
}

export interface VFSState {
  files: FileNode[];
  activeFile: string | null;
  openFiles: string[];
  modifiedFiles: Set<string>;
  isLoading: boolean;
  error: string | null;
  webContainerBooted: boolean;
  previewUrl: string | null;
  terminalOutput: string[];
}

export interface VFSActions {
  bootWebContainer: () => Promise<void>;
  loadFileTree: () => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  createDirectory: (path: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  setActiveFile: (path: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  markModified: (path: string) => void;
  unmarkModified: (path: string) => void;
  toggleDirectory: (path: string) => void;
  setPreviewUrl: (url: string | null) => void;
  appendTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;
  initProject: (template: 'nextjs' | 'react' | 'vanilla') => Promise<void>;
  installDependencies: (onOutput?: (data: string) => void) => Promise<{ success: boolean; error?: string }>;
  runDevServer: (onOutput?: (data: string) => void) => Promise<{ url?: string; error?: string }>;
  build: (onOutput?: (data: string) => void) => Promise<{ success: boolean; error?: string }>;
}

const initialState: VFSState = {
  files: [],
  activeFile: null,
  openFiles: [],
  modifiedFiles: new Set(),
  isLoading: false,
  error: null,
  webContainerBooted: false,
  previewUrl: null,
  terminalOutput: [],
};

function buildFileTree(files: FileSystemTree, basePath: string = ''): FileNode[] {
  const nodes: FileNode[] = [];
  
  for (const [name, node] of Object.entries(files)) {
    const path = basePath ? `${basePath}/${name}` : name;
    
    if (node.directory) {
      nodes.push({
        name,
        path,
        type: 'directory',
        children: buildFileTree(node.directory, path),
        isExpanded: false,
      });
    } else if (node.file) {
      nodes.push({
        name,
        path,
        type: 'file',
        content: node.file.contents,
      });
    }
  }
  
  return nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

function findNode(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function updateNode(nodes: FileNode[], path: string, update: Partial<FileNode>): FileNode[] {
  return nodes.map(node => {
    if (node.path === path) {
      return { ...node, ...update };
    }
    if (node.children) {
      return { ...node, children: updateNode(node.children, path, update) };
    }
    return node;
  });
}

function addNode(nodes: FileNode[], parentPath: string, newNode: FileNode): FileNode[] {
  if (!parentPath) {
    return [...nodes, newNode].sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  }
  
  return nodes.map(node => {
    if (node.path === parentPath && node.type === 'directory') {
      return {
        ...node,
        children: [...(node.children || []), newNode].sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'directory' ? -1 : 1;
        }),
      };
    }
    if (node.children) {
      return { ...node, children: addNode(node.children, parentPath, newNode) };
    }
    return node;
  });
}

function removeNode(nodes: FileNode[], path: string): FileNode[] {
  return nodes
    .filter(node => node.path !== path)
    .map(node => {
      if (node.children) {
        return { ...node, children: removeNode(node.children, path) };
      }
      return node;
    });
}

export const useVFSStore = create<VFSState & VFSActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      bootWebContainer: async () => {
        set({ isLoading: true, error: null });
        try {
          await webContainerService.boot();
          set({ webContainerBooted: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to boot WebContainer', 
            isLoading: false 
          });
        }
      },

      loadFileTree: async () => {
        set({ isLoading: true, error: null });
        try {
          const tree = await webContainerService.getFileTree('/');
          const nodes = buildFileTree(tree);
          set({ files: nodes, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load file tree', 
            isLoading: false 
          });
        }
      },

      createFile: async (path: string, content: string = '') => {
        set({ isLoading: true, error: null });
        try {
          await webContainerService.writeFile(path, content);
          const name = path.split('/').pop() || '';
          const parentPath = path.split('/').slice(0, -1).join('/');
          
          const newNode: FileNode = {
            name,
            path,
            type: 'file',
            content,
          };
          
          set(state => ({
            files: addNode(state.files, parentPath, newNode),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create file', 
            isLoading: false 
          });
        }
      },

      createDirectory: async (path: string) => {
        set({ isLoading: true, error: null });
        try {
          await webContainerService.mkdir(path);
          const name = path.split('/').pop() || '';
          const parentPath = path.split('/').slice(0, -1).join('/');
          
          const newNode: FileNode = {
            name,
            path,
            type: 'directory',
            children: [],
            isExpanded: true,
          };
          
          set(state => ({
            files: addNode(state.files, parentPath, newNode),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create directory', 
            isLoading: false 
          });
        }
      },

      deleteFile: async (path: string) => {
        set({ isLoading: true, error: null });
        try {
          await webContainerService.rm(path, { recursive: true });
          
          set(state => ({
            files: removeNode(state.files, path),
            openFiles: state.openFiles.filter(f => f !== path),
            activeFile: state.activeFile === path ? null : state.activeFile,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete', 
            isLoading: false 
          });
        }
      },

      readFile: async (path: string) => {
        try {
          const content = await webContainerService.readFile(path);
          set(state => ({
            files: updateNode(state.files, path, { content }),
          }));
          return content;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to read file', 
          });
          return '';
        }
      },

      writeFile: async (path: string, content: string) => {
        try {
          await webContainerService.writeFile(path, content);
          set(state => ({
            files: updateNode(state.files, path, { content }),
            modifiedFiles: new Set(state.modifiedFiles),
          }));
          get().unmarkModified(path);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to write file', 
          });
        }
      },

      setActiveFile: (path: string | null) => {
        set({ activeFile: path });
      },

      openFile: (path: string) => {
        set(state => {
          if (state.openFiles.includes(path)) {
            return { activeFile: path };
          }
          return {
            openFiles: [...state.openFiles, path],
            activeFile: path,
          };
        });
      },

      closeFile: (path: string) => {
        set(state => {
          const newOpenFiles = state.openFiles.filter(f => f !== path);
          const newActiveFile = state.activeFile === path 
            ? newOpenFiles[newOpenFiles.length - 1] || null 
            : state.activeFile;
          
          return {
            openFiles: newOpenFiles,
            activeFile: newActiveFile,
          };
        });
      },

      markModified: (path: string) => {
        set(state => {
          const newModified = new Set(state.modifiedFiles);
          newModified.add(path);
          return { modifiedFiles: newModified };
        });
      },

      unmarkModified: (path: string) => {
        set(state => {
          const newModified = new Set(state.modifiedFiles);
          newModified.delete(path);
          return { modifiedFiles: newModified };
        });
      },

      toggleDirectory: (path: string) => {
        set(state => ({
          files: updateNode(state.files, path, { 
            isExpanded: !findNode(state.files, path)?.isExpanded 
          }),
        }));
      },

      setPreviewUrl: (url: string | null) => {
        set({ previewUrl: url });
      },

      appendTerminalOutput: (output: string) => {
        set(state => ({
          terminalOutput: [...state.terminalOutput.slice(-1000), output],
        }));
      },

      clearTerminalOutput: () => {
        set({ terminalOutput: [] });
      },

      initProject: async (template: 'nextjs' | 'react' | 'vanilla') => {
        set({ isLoading: true, error: null });
        try {
          await webContainerService.boot();
          
          if (template === 'nextjs') {
            await webContainerService.initNextJSProject();
          } else if (template === 'react') {
            await webContainerService.initReactProject();
          } else {
            const vanillaFiles: FileSystemTree = {
              'index.html': {
                file: {
                  contents: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`
                }
              },
              'script.js': {
                file: {
                  contents: `console.log('Hello World');`
                }
              }
            };
            await webContainerService.mount(vanillaFiles);
          }
          
          const tree = await webContainerService.getFileTree('/');
          const nodes = buildFileTree(tree);
          set({ files: nodes, webContainerBooted: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize project', 
            isLoading: false 
          });
        }
      },

      installDependencies: async (onOutput?: (data: string) => void) => {
        set({ isLoading: true, error: null });
        const outputHandler = (data: string) => {
          get().appendTerminalOutput(data);
          onOutput?.(data);
        };
        
        try {
          const result = await webContainerService.installDependencies(outputHandler);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Installation failed', 
            isLoading: false 
          });
          return { success: false, error: error instanceof Error ? error.message : 'Installation failed' };
        }
      },

      runDevServer: async (onOutput?: (data: string) => void) => {
        set({ isLoading: true, error: null });
        const outputHandler = (data: string) => {
          get().appendTerminalOutput(data);
          onOutput?.(data);
        };
        
        try {
          const result = await webContainerService.runDevServer(outputHandler);
          if (result.url) {
            set({ previewUrl: result.url });
          }
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start dev server', 
            isLoading: false 
          });
          return { error: error instanceof Error ? error.message : 'Failed to start dev server' };
        }
      },

      build: async (onOutput?: (data: string) => void) => {
        set({ isLoading: true, error: null });
        const outputHandler = (data: string) => {
          get().appendTerminalOutput(data);
          onOutput?.(data);
        };
        
        try {
          const result = await webContainerService.build(outputHandler);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Build failed', 
            isLoading: false 
          });
          return { success: false, error: error instanceof Error ? error.message : 'Build failed' };
        }
      },
    }),
    {
      name: 'vfs-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeFile: state.activeFile,
        openFiles: state.openFiles,
      }),
    }
  )
);

export default useVFSStore;
