"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  children?: React.ReactNode;
  defaultSidebarOpen?: boolean;
}

interface SidebarContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  closeOnMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a ChatLayout");
  }
  return context;
}

export function ChatLayout({ children, defaultSidebarOpen = true }: ChatLayoutProps) {
  const [isOpen, setIsOpen] = React.useState(defaultSidebarOpen);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Handle responsive behavior with debounced resize
  React.useEffect(() => {
    setMounted(true);
    
    let timeoutId: NodeJS.Timeout;
    
    const checkViewport = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const mobile = width < 768;
        const tablet = width >= 768 && width < 1024;
        const desktop = width >= 1024;
        
        setIsMobile(mobile);
        setIsTablet(tablet);
        setIsDesktop(desktop);
        
        // Auto-close sidebar on mobile, auto-open on desktop
        if (mobile && isOpen) {
          setIsOpen(false);
        } else if (desktop && !isOpen && defaultSidebarOpen) {
          setIsOpen(true);
        }
      }, 100);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    
    // Handle orientation change
    const handleOrientationChange = () => {
      setTimeout(checkViewport, 100);
    };
    window.addEventListener("orientationchange", handleOrientationChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkViewport);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [defaultSidebarOpen, isOpen]);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeOnMobile = React.useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const contextValue = React.useMemo(
    () => ({ 
      isOpen, 
      setIsOpen, 
      toggle, 
      isMobile, 
      isTablet, 
      isDesktop,
      closeOnMobile 
    }),
    [isOpen, setIsOpen, toggle, isMobile, isTablet, isDesktop, closeOnMobile]
  );

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <div className="flex flex-1 flex-col overflow-hidden" />
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Mobile sidebar overlay backdrop */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
