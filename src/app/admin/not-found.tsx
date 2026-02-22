"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home, Lock } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-destructive/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground">
            Admin Page Not Found
          </h2>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The admin page you're looking for doesn't exist or you don't have permission to access it.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Admin access required</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/admin">
              <Home className="h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              User Dashboard
            </Link>
          </Button>
        </div>

        {/* Additional Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Quick Admin Links:
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link 
              href="/admin/users" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              User Management
            </Link>
            <Link 
              href="/admin/api-keys" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              API Keys
            </Link>
            <Link 
              href="/admin/tickets" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Support Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}