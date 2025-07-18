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
  
  ${mediaQueries.md} {
    flex-direction: ${(props) => props.desktopStackDirection};
    max-width: ${(props) => props.maxWidth || "none"};
    margin: ${(props) => (props.centerContent ? "0 auto" : "0")};
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
}: MobileOptimizedContainerProps) {
  const isMobile = useIsMobile()

  return (
    <StyledContainer
      as={as}
      className={cn("mobile-optimized-container", className)}
      mobileStackDirection={mobileStackDirection}
      desktopStackDirection={desktopStackDirection}
      spacing={spacing}
      fullWidthOnMobile={fullWidthOnMobile}
      centerContent={centerContent}
      maxWidth={maxWidth}
      data-mobile={isMobile ? "true" : "false"}
    >
      {children}
    </StyledContainer>
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
