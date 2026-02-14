'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Square, Terminal, Package, Settings, FolderGit, LayoutGrid } from 'lucide-react';
import { useVFSStore } from '@/store/useVFSStore';
import FileTree from '@/components/file-tree/file-tree';
import CodeEditor from '@/components/editor/code-editor';
import TerminalComponent from '@/components/terminal/terminal';
import LivePreview from '@/components/preview/live-preview';
import PackageManager from '@/components/package-manager/package-manager';
import { agentOrchestrator } from '@/lib/agent/orchestrator';
import { contextManager } from '@/lib/agent/context-manager';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ProjectIDE() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string[]>([]);

  const {
    files,
    activeFile,
    openFiles,
    previewUrl,
    webContainerBooted,
    bootWebContainer,
    initProject,
    createFile,
    createDirectory,
    deleteFile,
    readFile,
    writeFile,
    setActiveFile,
    openFile,
    toggleDirectory,
    runDevServer,
    installDependencies,
    appendTerminalOutput,
  } = useVFSStore();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && !webContainerBooted) {
      bootWebContainer();
    }
  }, [isSignedIn, webContainerBooted, bootWebContainer]);

  const handleRun = async () => {
    setIsRunning(true);
    appendTerminalOutput('$ npm run dev\n');
    
    const result = await runDevServer((data) => {
      appendTerminalOutput(data);
    });

    if (result.error) {
      appendTerminalOutput(`Error: ${result.error}\n`);
    }

    setIsRunning(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    appendTerminalOutput('\nStopping dev server...\n');
  };

  const handleInstall = async () => {
    appendTerminalOutput('$ npm install\n');
    await installDependencies((data) => {
      appendTerminalOutput(data);
    });
  };

  const handleNewProject = async (template: 'nextjs' | 'react' | 'vanilla') => {
    await initProject(template);
    appendTerminalOutput(`Initialized ${template} project\n`);
  };

  const handleAiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setAiOutput(prev => [...prev, `> ${aiPrompt}`]);
    
    const context = contextManager.buildContext(
      files,
      openFiles.map(path => ({ path, content: '' })),
      terminalOutput.split('\n'),
      []
    );

    const response = await agentOrchestrator.execute({
      type: 'planner',
      prompt: aiPrompt,
      context: {
        projectFiles: files,
        openFiles: [],
        terminalOutput: context.terminalOutput,
        errorMessages: [],
        taskHistory: [],
      },
    });

    if (response.success && response.result) {
      setAiOutput(prev => [...prev, response.result!]);
      
      const codeChanges = agentOrchestrator.parseCodeChanges(response.result);
      
      for (const change of codeChanges) {
        if (change.action === 'create' || change.action === 'modify') {
          await createFile(change.path, change.content || '');
        }
      }
    }

    setAiPrompt('');
    setIsGenerating(false);
  };

  const handleFileClick = async (path: string) => {
    await readFile(path);
    openFile(path);
    setActiveFile(path);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-[#252526]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">AI IDE</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleNewProject('nextjs')}
              disabled={!webContainerBooted}
            >
              <FolderGit className="w-4 h-4 mr-2" />
              New Next.js
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleNewProject('react')}
              disabled={!webContainerBooted}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              New React
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Code Assistant</DialogTitle>
                <DialogDescription>
                  Describe what you want to build, and the AI will generate code for you.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Create a login form with email and password fields, validation, and error handling"
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleAiPrompt} 
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Code'}
                </Button>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {aiOutput.map((output, i) => (
                  <div key={i} className="mb-2 text-sm font-mono whitespace-pre-wrap">
                    {output}
                  </div>
                ))}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="outline" onClick={handleInstall}>
            <Package className="w-4 h-4 mr-2" />
            Install
          </Button>

          {isRunning ? (
            <Button size="sm" variant="destructive" onClick={handleStop}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button size="sm" variant="default" onClick={handleRun}>
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          )}
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <FileTree
            files={files}
            activeFile={activeFile}
            openFiles={openFiles}
            onFileClick={handleFileClick}
            onCreateFile={createFile}
            onCreateDirectory={createDirectory}
            onDeleteFile={deleteFile}
            onToggleDirectory={toggleDirectory}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={45} minSize={30}>
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="mx-4 mt-2 w-auto justify-start">
              {openFiles.map((file) => (
                <TabsTrigger
                  key={file}
                  value={file}
                  onClick={() => setActiveFile(file)}
                  className={activeFile === file ? 'bg-blue-500/20' : ''}
                >
                  {file.split('/').pop()}
                </TabsTrigger>
              ))}
              <TabsTrigger value="editor">Editor</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="flex-1 m-0 p-0">
              <CodeEditor className="h-full" />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={40} minSize={20}>
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <TabsList className="mx-4 mt-2 w-auto justify-start">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="flex-1 m-0 p-0">
              <LivePreview url={previewUrl} />
            </TabsContent>
            <TabsContent value="terminal" className="flex-1 m-0 p-0">
              <TerminalComponent
                initialData={terminalOutput}
                className="h-full"
              />
            </TabsContent>
            <TabsContent value="packages" className="flex-1 m-0 p-0">
              <PackageManager className="h-full" />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
