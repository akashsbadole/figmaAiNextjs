'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useVFSStore } from '@/store/useVFSStore';
import * as monaco from 'monaco-editor';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
      <div className="text-gray-400 text-sm">Loading editor...</div>
    </div>
  ),
});

type OnMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => void;

interface CodeEditorProps {
  className?: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  className = '',
  onChange,
  onSave,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [content, setContent] = useState('');
  
  const {
    activeFile,
    files,
    writeFile,
    markModified,
  } = useVFSStore();

  useEffect(() => {
    const findFileContent = () => {
      const findContent = (nodes: any[]): string | null => {
        for (const node of nodes) {
          if (node.path === activeFile && node.type === 'file') {
            return node.content || '';
          }
          if (node.children) {
            const found = findContent(node.children);
            if (found !== null) return found;
          }
        }
        return null;
      };

      if (activeFile && files.length > 0) {
        const fileContent = findContent(files);
        if (fileContent !== null && fileContent !== content) {
          setContent(fileContent);
        }
      }
    };

    findFileContent();
  }, [activeFile, files]);

  const handleEditorMount: OnMount = useCallback((editor, monacoInstance) => {
    editorRef.current = editor;

    monacoInstance.editor.defineTheme('customDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2d2d30',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });

    monacoInstance.editor.setTheme('customDark');

    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        handleSave();
        onSave?.();
      }
    );
  }, [onSave]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      onChange?.(value);
      
      if (activeFile) {
        markModified(activeFile);
      }
    }
  }, [activeFile, markModified, onChange]);

  const handleSave = useCallback(async () => {
    if (activeFile && content) {
      await writeFile(activeFile, content);
    }
  }, [activeFile, content, writeFile]);

  const getLanguage = (filename: string | null): string => {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'py': 'python',
      'sql': 'sql',
      'prisma': 'prisma',
    };
    
    return languageMap[ext || ''] || 'plaintext';
  };

  if (!activeFile) {
    return (
      <div className={`flex items-center justify-center bg-[#1e1e1e] ${className}`}>
        <div className="text-center text-gray-400">
          <p className="text-sm">Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-[#2d2d30] px-4 py-2 text-sm text-gray-300 flex justify-between items-center">
        <span>{activeFile}</span>
        <span className="text-xs text-gray-500">
          {getLanguage(activeFile).toUpperCase()}
        </span>
      </div>
      <Editor
        height="calc(100% - 40px)"
        language={getLanguage(activeFile)}
        value={content}
        theme="customDark"
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          renderWhitespace: 'selection',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
        }}
      />
    </div>
  );
};

export default CodeEditor;
