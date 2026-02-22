"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowLeft, Home, History, CreditCard, MessageSquare } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground">
            Dashboard Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground">
          The dashboard page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Quick Dashboard Links:
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link 
              href="/dashboard/history" 
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <History className="h-3 w-3" />
              History
            </Link>
            <Link 
              href="/dashboard/subscription" 
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <CreditCard className="h-3 w-3" />
              Subscription
            </Link>
            <Link 
              href="/dashboard/support" 
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}