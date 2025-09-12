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
import { AnalyticsProvider } from "@/components/analytics-provider"
import { Suspense } from "react"

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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8TPFC6NL03"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8TPFC6NL03', {
                page_title: document.title,
                page_location: window.location.href,
                debug_mode: ${process.env.NODE_ENV === "development"}
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Suspense>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <CyberpunkThemeProvider>
              <PlatformProvider>
                <AnalyticsProvider>{children}</AnalyticsProvider>
                <Toaster />
                <SonnerToaster />
              </PlatformProvider>
            </CyberpunkThemeProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
