import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClerkAuthProvider } from "@/lib/clerk";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DesignAI - AI-Powered Design System Generator & Figma AI Agent",
  description: "Transform your vision into production-ready design systems with our Figma AI agent. Automate design tokens, typography, and component libraries directly within your workflow.",
  keywords: [
    "DesignAI", 
    "AI Design System", 
    "Figma AI Agent", 
    "AI UI Design", 
    "Figma Automation", 
    "Design Tokens", 
    "Tailwind CSS", 
    "Gemini AI"
  ],
  authors: [{ name: "DesignAI Team" }],
  icons: {
    icon: "./logo.png",
  },
  openGraph: {
    title: "DesignAI - Your Autonomous Figma AI Agent",
    description: "Meet the AI agent that builds your design system for you. From Figma variables to production code, DesignAI handles the heavy lifting.",
    url: "#",
    siteName: "DesignAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignAI - Figma AI Agent for Design Systems",
    description: "Stop building design systems manually. Use our AI agent to generate components and tokens in Figma instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkAuthProvider>
      <ThemeProvider defaultTheme="system">
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
          >
            {children}
            <Toaster />
          </body>
        </html>
      </ThemeProvider>
    </ClerkAuthProvider>
  );
}
