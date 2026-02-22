'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout, Layers, Box, Component, Database, Share2, Plus, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface ArchitectureNode {
  id: string
  name: string
  type: 'foundation' | 'component' | 'pattern' | 'utility'
  description: string
}

export function SystemArchitect() {
  const [nodes, setNodes] = useState<ArchitectureNode[]>([
    { id: '1', name: 'Color System', type: 'foundation', description: 'Primary, secondary, and semantic tokens' },
    { id: '2', name: 'Typography', type: 'foundation', description: 'Font scales and variants' },
    { id: '3', name: 'Button', type: 'component', description: 'Primary, secondary, and ghost variants' },
    { id: '4', name: 'Input', type: 'component', description: 'Text, select, and checkbox fields' },
  ])

  const addNode = () => {
    const newNode: ArchitectureNode = {
      id: Date.now().toString(),
      name: 'New Component',
      type: 'component',
      description: 'Describe the component purpose'
    }
    setNodes([...nodes, newNode])
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id))
  }

  const cn = (...classes: (string | undefined | false)[]): string => {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          System Architecture Designer
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Map out your design system's structure, from global foundations to complex UI patterns.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar Controls */}
        <Card className="lg:col-span-1 border-2 shadow-xl rounded-3xl overflow-hidden bg-background/50 backdrop-blur-sm">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Build Structure
            </CardTitle>
            <CardDescription>Add new elements to your architecture</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Button onClick={addNode} className="w-full h-12 rounded-2xl gap-2 shadow-lg shadow-primary/10">
                <Plus className="h-4 w-4" />
                Add New Layer
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col rounded-2xl gap-2 hover:bg-primary/5 transition-all">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-bold uppercase">Tokens</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col rounded-2xl gap-2 hover:bg-primary/5 transition-all">
                  <Box className="h-5 w-5 text-purple-500" />
                  <span className="text-xs font-bold uppercase">Atoms</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col rounded-2xl gap-2 hover:bg-primary/5 transition-all">
                  <Layers className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-bold uppercase">Molecules</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col rounded-2xl gap-2 hover:bg-primary/5 transition-all">
                  <Layout className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-bold uppercase">Organisms</span>
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
                Export Options
              </Label>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start rounded-xl gap-3">
                  <Share2 className="h-4 w-4" />
                  Share Architecture
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-xl gap-3">
                  <Component className="h-4 w-4" />
                  Generate Diagram
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualizer Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Architecture Map
            </h3>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {nodes.length} Elements Defined
            </span>
          </div>
          
          <div className="grid gap-4">
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group border-2 hover:border-primary/30 transition-all rounded-3xl bg-surface-variant/30 hover:bg-background overflow-hidden">
                  <div className="flex items-center p-6 gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0",
                      node.type === 'foundation' ? "bg-blue-500 text-white" : "bg-primary text-primary-foreground"
                    )}>
                      {node.type === 'foundation' ? <Database className="h-6 w-6" /> : <Component className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">{node.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-muted rounded-full text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{node.description}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button 
            variant="ghost" 
            className="w-full h-20 rounded-3xl border-2 border-dashed border-muted hover:border-primary/30 hover:bg-primary/5 transition-all gap-3"
            onClick={addNode}
          >
            <Plus className="h-5 w-5" />
            <span className="font-bold uppercase tracking-widest text-sm">Add architectural layer</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
