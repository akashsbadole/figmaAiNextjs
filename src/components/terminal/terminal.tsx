'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalComponentProps {
  onData?: (data: string) => void;
  initialData?: string;
  readOnly?: boolean;
  className?: string;
}

export default function TerminalComponent({
  onData,
  initialData,
  readOnly = false,
  className = '',
}: TerminalComponentProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const writeToTerminal = useCallback((data: string) => {
    if (terminalInstance.current) {
      terminalInstance.current.write(data);
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      allowTransparency: true,
      scrollback: 10000,
    });

    const fit = new FitAddon();
    terminal.loadAddon(fit);

    terminal.open(terminalRef.current);
    fit.fit();

    terminalInstance.current = terminal;
    fitAddon.current = fit;

    if (initialData) {
      terminal.write(initialData);
    }

    if (!readOnly && onData) {
      terminal.onData((data) => {
        onData(data);
      });
    }

    const handleResize = () => {
      fit.fit();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  useEffect(() => {
    if (fitAddon.current) {
      fitAddon.current.fit();
    }
  }, []);

  return (
    <div 
      ref={terminalRef} 
      className={`terminal-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        backgroundColor: '#1e1e1e',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    />
  );
}

export function useTerminal() {
  const writeRef = useRef<(data: string) => void>(() => {});

  const setWriteHandler = useCallback((handler: (data: string) => void) => {
    writeRef.current = handler;
  }, []);

  const write = useCallback((data: string) => {
    writeRef.current(data);
  }, []);

  return { write, setWriteHandler };
}
