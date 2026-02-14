'use client';

import React, { useState, useCallback } from 'react';
import { Figma, FileCode, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVFSStore } from '@/store/useVFSStore';
import { getVisionAnalyzer } from '@/lib/ai/vision-analyzer';
import { agentOrchestrator } from '@/lib/agent/orchestrator';

interface FigmaIntegrationProps {
  className?: string;
}

const FigmaIntegration: React.FC<FigmaIntegrationProps> = ({ className = '' }) => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { createFile, appendTerminalOutput } = useVFSStore();

  const extractFigmaKey = (url: string): string | null => {
    const match = url.match(/figma\.com\/(?:file|design)\/([^\/?]+)/);
    return match ? match[1] : null;
  };

  const handleAnalyze = async () => {
    const fileKey = extractFigmaKey(figmaUrl);
    if (!fileKey) {
      setError('Invalid Figma URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/figma/file/${fileKey}`);
      if (!response.ok) throw new Error('Failed to fetch Figma file');
      
      const fileData = await response.json();
      setAnalysis(fileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!analysis) return;

    setIsGenerating(true);
    setError(null);

    try {
      appendTerminalOutput('Generating code from Figma design...\n');

      const visionAnalyzer = getVisionAnalyzer();
      
      const response = await agentOrchestrator.execute({
        type: 'coder',
        prompt: `Convert this Figma design to React code:
        
Design Name: ${analysis.name}
Last Modified: ${analysis.lastModified}

Generate:
1. A React component that matches this design
2. CSS/Tailwind styles
3. Component structure and hierarchy
4. Responsive design considerations

Output the code in markdown code blocks with the file path.`,
        context: {
          projectFiles: [],
          openFiles: [],
          terminalOutput: '',
          errorMessages: [],
          taskHistory: [],
        },
      });

      if (response.success && response.result) {
        setGeneratedCode(response.result);
        
        const codeChanges = agentOrchestrator.parseCodeChanges(response.result);
        
        for (const change of codeChanges) {
          if (change.action === 'create') {
            await createFile(change.path, change.content || '');
            appendTerminalOutput(`Created: ${change.path}\n`);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Figma className="w-4 h-4 mr-2" />
          Import from Figma
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Figma className="w-5 h-5" />
            Import from Figma
          </DialogTitle>
          <DialogDescription>
            Paste a Figma file URL to analyze the design and generate code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Figma File URL</Label>
            <div className="flex gap-2">
              <Input
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !figmaUrl}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Analyze
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          {analysis && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="styles">Styles</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-2">
                <div className="p-4 border rounded-md">
                  <h4 className="font-semibold">{analysis.name}</h4>
                  <p className="text-sm text-gray-500">
                    Last modified: {new Date(analysis.lastModified).toLocaleDateString()}
                  </p>
                  {analysis.thumbnailUrl && (
                    <img 
                      src={analysis.thumbnailUrl} 
                      alt="Preview" 
                      className="mt-2 rounded-md max-h-48 object-contain"
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="components">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {analysis.components?.map((component: any) => (
                      <div key={component.key} className="p-3 border rounded-md">
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-gray-500">{component.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="styles">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {analysis.styles?.map((style: any) => (
                      <div key={style.key} className="p-3 border rounded-md">
                        <p className="font-medium">{style.name}</p>
                        <p className="text-sm text-gray-500">{style.styleType}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {analysis && (
            <Button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileCode className="w-4 h-4 mr-2" />
              )}
              Generate React Code
            </Button>
          )}

          {generatedCode && (
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FigmaIntegration;
