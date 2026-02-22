"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 Icon */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center">
            <FileQuestion className="h-32 w-32 text-primary/80 animate-bounce" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-lg leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Illustration */}
        <div className="flex justify-center gap-4 py-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Additional Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link 
              href="/generate" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Generate Design
            </Link>
            <Link 
              href="/chat" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              AI Chat
            </Link>
            <Link 
              href="/figma" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Figma Plugin
            </Link>
            <Link 
              href="/dashboard" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}