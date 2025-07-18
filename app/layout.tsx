import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CyberpunkThemeProvider } from "@/contexts/cyberpunk-theme-context"
import { PlatformProvider } from "@/contexts/platform-context"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import IOSDarkModeScript from "./ios-dark-mode-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mutable Platform",
  description: "Web3 Gaming Platform on Solana",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <IOSDarkModeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CyberpunkThemeProvider>
            <PlatformProvider>
              {children}
              <Toaster />
              <SonnerToaster />
            </PlatformProvider>
          </CyberpunkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
