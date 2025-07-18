import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CyberpunkThemeProvider } from "@/contexts/cyberpunk-theme-context"
import { PlatformProvider } from "@/contexts/platform-context"
import { GameProvider } from "@/contexts/game-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mutable Platform - Web3 Gaming Hub",
  description: "Play games, earn tokens, and trade on Solana",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CyberpunkThemeProvider>
            <PlatformProvider>
              <GameProvider>
                {children}
                <Toaster />
              </GameProvider>
            </PlatformProvider>
          </CyberpunkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
