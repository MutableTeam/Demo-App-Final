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
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"

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
      <body className={inter.className}>
        <Script id="data-layer-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
          `}
        </Script>

        <Script id="gtm" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KJNK8MKP');
          `}
        </Script>

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-8TPFC6NL03" strategy="afterInteractive" />

        <Script id="gtag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8TPFC6NL03', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJNK8MKP"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Suspense>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <CyberpunkThemeProvider>
              <PlatformProvider>
                <AnalyticsProvider>{children}</AnalyticsProvider>
                <Toaster />
                <SonnerToaster />
                <Analytics />
              </PlatformProvider>
            </CyberpunkThemeProvider>
          </ThemeProvider>
        </Suspense>

        <IOSDarkModeScript />
      </body>
    </html>
  )
}
