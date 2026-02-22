'use client'

import { LayoutGrid, Share2, Settings, HelpCircle, Sparkles, User2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardView = 'generator' | 'projects' | 'shared'

interface DashboardSidebarProps {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
}

export function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  return (
    <div className="w-72 border-r border-border/10 bg-[#0A0A0A] flex flex-col p-6 space-y-8 h-[calc(100vh-65px)] sticky top-[65px]">
      {/* View Switcher - Matching Screenshot */}
      <div className="bg-[#151515] p-1 rounded-xl flex border border-border/5">
        <button
          onClick={() => onViewChange('projects')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            activeView === 'projects' || activeView === 'generator'
              ? "bg-[#252525] text-white shadow-lg" 
              : "text-muted-foreground hover:text-white"
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5 text-primary" />
          My Projects
        </button>
        <button
          onClick={() => onViewChange('shared')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            activeView === 'shared' 
              ? "bg-[#252525] text-white shadow-lg" 
              : "text-muted-foreground hover:text-white"
          )}
        >
          <Share2 className="h-3.5 w-3.5" />
          Shared with me
        </button>
      </div>

      {/* Navigation Section */}
      <div className="space-y-6">
        <div className="space-y-1">
            <button
              onClick={() => onViewChange('generator')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                activeView === 'generator' 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Sparkles className={cn("h-4 w-4", activeView === 'generator' ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              Launch Studio
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group">
              <MessageSquare className="h-4 w-4 group-hover:text-primary" />
              AI Assistant
            </button>
        </div>
      </div>

      <div className="mt-auto space-y-1 border-t border-border/5 pt-6">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all group">
          <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform" />
          System Config
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
          <HelpCircle className="h-4 w-4" />
          Documentation
        </button>
      </div>
    </div>
  )
}
