"use client"

import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
             <Link href='/'> <span className="text-2xl font-bold">DesignAI</span></Link>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Already have an account?
            </span>
            <Link href="/sign-in">
              <Button variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "shadow-xl border border-border",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/dashboard"
        />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-6 px-4">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DesignAI. AI Design System Generator for modern teams.</p>
        </div>
      </footer>
    </div>
  )
}
