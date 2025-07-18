"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import styled from "@emotion/styled"

interface MobileOptimizedContainerProps {
  children: React.ReactNode
  className?: string
  mobileStackDirection?: "column" | "column-reverse" | "row" | "row-reverse"
  desktopStackDirection?: "column" | "column-reverse" | "row" | "row-reverse"
  spacing?: "none" | "sm" | "md" | "lg"
  fullWidthOnMobile?: boolean
  centerContent?: boolean
  maxWidth?: string
  as?: React.ElementType
  forceFullscreen?: boolean
}

// Define breakpoints locally to avoid import issues
const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// Define media queries directly in this file to avoid import issues
const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]}px)`,
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  touch: "@media (hover: none) and (pointer: coarse)",
}

// Styled container with responsive properties
const StyledContainer = styled.div<{
  mobileStackDirection: string
  desktopStackDirection: string
  spacing: string
  fullWidthOnMobile: boolean
  centerContent: boolean
  maxWidth: string
  forceFullscreen: boolean
}>`
  display: flex;
  flex-direction: ${(props) => props.mobileStackDirection};
  gap: ${(props) => {
    switch (props.spacing) {
      case "none":
        return "0"
      case "sm":
        return "0.5rem"
      case "md":
        return "1rem"
      case "lg":
        return "2rem"
      default:
        return "1rem"
    }
  }};
  width: ${(props) => (props.fullWidthOnMobile ? "100%" : "auto")};
  
  ${(props) =>
    props.centerContent &&
    `
    align-items: center;
    justify-content: center;
  `}
  
  ${(props) =>
    props.forceFullscreen &&
    `
    ${mediaQueries.mobile} {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      z-index: 50;
      overflow: hidden;
      background: #000;
    }
  `}
  
  ${mediaQueries.md} {
    flex-direction: ${(props) => props.desktopStackDirection};
    max-width: ${(props) => props.maxWidth || "none"};
    margin: ${(props) => (props.centerContent ? "0 auto" : "0")};
    
    ${(props) =>
      props.forceFullscreen &&
      `
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      z-index: auto;
      background: transparent;
    `}
  }
  
  /* Apply hardware acceleration for smoother animations */
  transform: translateZ(0);
  backface-visibility: hidden;
  
  /* Optimize for touch devices */
  ${mediaQueries.touch} {
    & > * {
      min-height: 44px; /* Minimum touch target size */
    }
  }
  
  /* Mobile viewport optimizations */
  ${mediaQueries.mobile} {
    /* Prevent scrolling and zooming */
    touch-action: manipulation;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    
    /* Force landscape orientation hint */
    @media (orientation: portrait) {
      &::before {
        content: 'Rotate device to landscape for best experience';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        font-size: 16px;
        white-space: nowrap;
      }
    }
  }
`

/**
 * A container component optimized for mobile and desktop layouts
 *
 * This component provides consistent responsive behavior across the application
 * and can be easily configured for different layout needs.
 */
export function MobileOptimizedContainer({
  children,
  className,
  mobileStackDirection = "column",
  desktopStackDirection = "row",
  spacing = "md",
  fullWidthOnMobile = true,
  centerContent = false,
  maxWidth = "1200px",
  as = "div",
  forceFullscreen = false,
}: MobileOptimizedContainerProps) {
  const isMobile = useIsMobile()

  return (
    <>
      {/* Global mobile styles */}
      {forceFullscreen && (
        <style jsx global>{`
          @media (max-width: 767px) {
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              position: fixed;
              -webkit-user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
            }
            
            /* Lock to landscape */
            @media (orientation: portrait) {
              body {
                transform: rotate(90deg);
                transform-origin: left top;
                width: 100vh;
                height: 100vw;
                overflow: hidden;
                position: fixed;
                top: 100%;
                left: 0;
              }
            }
          }
        `}</style>
      )}

      <StyledContainer
        as={as}
        className={cn("mobile-optimized-container", className)}
        mobileStackDirection={mobileStackDirection}
        desktopStackDirection={desktopStackDirection}
        spacing={spacing}
        fullWidthOnMobile={fullWidthOnMobile}
        centerContent={centerContent}
        maxWidth={maxWidth}
        forceFullscreen={forceFullscreen}
        data-mobile={isMobile ? "true" : "false"}
      >
        {children}
      </StyledContainer>
    </>
  )
}

/**
 * A responsive grid component that adjusts columns based on screen size
 */
export const ResponsiveGrid = styled.div<{
  columns?: { base: number; sm?: number; md?: number; lg?: number; xl?: number }
  gap?: string
}>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns?.base || 1}, 1fr);
  gap: ${(props) => props.gap || "1rem"};
  width: 100%;
  
  ${mediaQueries.sm} {
    grid-template-columns: repeat(${(props) => props.columns?.sm || 2}, 1fr);
  }
  
  ${mediaQueries.md} {
    grid-template-columns: repeat(${(props) => props.columns?.md || 3}, 1fr);
  }
  
  ${mediaQueries.lg} {
    grid-template-columns: repeat(${(props) => props.columns?.lg || 4}, 1fr);
  }
  
  ${mediaQueries.xl} {
    grid-template-columns: repeat(${(props) => props.columns?.xl || 4}, 1fr);
  }
`

/**
 * A component that is only visible on mobile devices
 */
export const MobileOnly = styled.div`
  display: block;
  
  ${mediaQueries.md} {
    display: none;
  }
`

/**
 * A component that is hidden on mobile devices
 */
export const DesktopOnly = styled.div`
  display: none;
  
  ${mediaQueries.md} {
    display: block;
  }
`

export default MobileOptimizedContainer
