'use client';

import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, ExternalLink, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PreviewRef {
  refresh: () => void;
}

interface LivePreviewProps {
  url: string | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

const LivePreview = forwardRef<PreviewRef, LivePreviewProps>(({
  url,
  isLoading = false,
  error = null,
  onRefresh,
  className = '',
}, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setIframeKey(prev => prev + 1);
    }
  }));

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    onRefresh?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (url) {
      setIframeKey(prev => prev + 1);
    }
  }, [url]);

  if (!url) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-900 ${className}`}
        style={{ minHeight: '300px' }}
      >
        <div className="text-center text-gray-400">
          <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Start a dev server to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ 
        backgroundColor: '#ffffff',
        height: isFullscreen ? '100vh' : '100%',
        minHeight: '300px',
      }}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {isLoading && (
          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Building...
          </div>
        )}
        {error && (
          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          className="h-7 px-2"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleFullscreen}
          className="h-7 px-2"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3 h-3" />
          ) : (
            <Maximize2 className="w-3 h-3" />
          )}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="h-7 px-2"
        >
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>

      {error && (
        <div className="absolute bottom-10 left-2 right-2 bg-red-900/90 text-red-100 text-xs p-2 rounded">
          {error}
        </div>
      )}

      <iframe
        key={iframeKey}
        src={url}
        title="Preview"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#ffffff',
        }}
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
});

LivePreview.displayName = 'LivePreview';

export default LivePreview;
export { LivePreview };
