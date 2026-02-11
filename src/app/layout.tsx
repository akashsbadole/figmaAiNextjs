import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClerkAuthProvider } from "@/lib/clerk";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DesignAI - AI-Powered Design System Generator",
  description: "Transform your design vision into production-ready design systems with AI. Generate colors, typography, spacing, and components in minutes.",
  keywords: ["DesignAI", "AI Design System", "Figma", "UI/UX", "Design Tokens", "Tailwind CSS", "Gemini AI"],
  authors: [{ name: "DesignAI Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "DesignAI - AI-Powered Design System Generator",
    description: "Transform your design vision into production-ready design systems with AI",
    url: "https://designai.z.ai",
    siteName: "DesignAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignAI - AI-Powered Design System Generator",
    description: "Transform your design vision into production-ready design systems with AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkAuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkAuthProvider>
  );
}
