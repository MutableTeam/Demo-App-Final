// Breakpoint values in pixels
const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// Media query strings for use with styled-components or emotion
const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]}px)`,

  // Max-width queries (for mobile-first approach)
  maxXs: `@media (max-width: ${breakpoints.xs - 1}px)`,
  maxSm: `@media (max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxLg: `@media (max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `@media (max-width: ${breakpoints.xl - 1}px)`,
  max2xl: `@media (max-width: ${breakpoints["2xl"] - 1}px)`,

  // Device-specific queries
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,

  // Orientation queries
  portrait: "@media (orientation: portrait)",
  landscape: "@media (orientation: landscape)",

  // Touch capability
  touch: "@media (hover: none) and (pointer: coarse)",
  mouse: "@media (hover: hover) and (pointer: fine)",
}

// Spacing scale that's consistent across breakpoints
const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
}

// Helper function to generate responsive styles
const responsive = <T,>(property: string, values: { [key: string]: T }): string =>
  Object.entries(values)
    .map(([breakpoint, value]) => {
      if (breakpoint === "base") {
        return `${property}: ${value};`
      }
      return `${mediaQueries[breakpoint]} { ${property}: ${value}; }`
    })
    .join("\n")

// Touch interaction helpers
const touchInteractions = {
  // Increase touch target size for better mobile usability
  touchTarget: `
    min-height: 44px;
    min-width: 44px;
  `,

  // Remove hover effects on touch devices
  noHoverOnTouch: `
    ${mediaQueries.touch} {
      &:hover {
        /* Reset any hover styles */
        transform: none;
        box-shadow: inherit;
      }
    }
  `,

  // Add active state for touch feedback
  touchFeedback: `
    ${mediaQueries.touch} {
      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  `,
}

// Performance optimizations for mobile
const mobileOptimizations = {
  // Reduce animation complexity on mobile
  reduceMotion: `
    ${mediaQueries.mobile} {
      animationDuration: 50% !important;
      transitionDuration: 50% !important;
    }
  `,

  // Use hardware acceleration for smoother scrolling/animations
  hardwareAcceleration: `
    transform: translateZ(0);
    backface-visibility: hidden;
  `,

  // Optimize images for mobile
  responsiveImage: `
    max-width: 100%;
    height: auto;
  `,
}

// Common responsive patterns
const responsivePatterns = {
  // Stack items vertically on mobile, horizontally on larger screens
  stackToRow: `
    display: flex;
    flex-direction: column;
    
    ${mediaQueries.md} {
      flex-direction: row;
    }
  `,

  // Grid that adjusts columns based on screen size
  responsiveGrid: `
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    
    ${mediaQueries.sm} {
      grid-template-columns: repeat(2, 1fr);
    }
    
    ${mediaQueries.lg} {
      grid-template-columns: repeat(3, 1fr);
    }
    
    ${mediaQueries.xl} {
      grid-template-columns: repeat(4, 1fr);
    }
  `,

  // Hide elements on mobile
  hideOnMobile: `
    ${mediaQueries.mobile} {
      display: none;
    }
  `,

  // Show elements only on mobile
  showOnlyOnMobile: `
    display: block;
    
    ${mediaQueries.md} {
      display: none;
    }
  `,

  // Adjust font sizes responsively
  responsiveText: `
    font-size: 1rem;
    
    ${mediaQueries.sm} {
      font-size: 1.1rem;
    }
    
    ${mediaQueries.lg} {
      font-size: 1.2rem;
    }
  `,

  // Full-width on mobile, constrained on larger screens
  containerResponsive: `
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    
    ${mediaQueries.sm} {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    
    ${mediaQueries.lg} {
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
    }
    
    ${mediaQueries.xl} {
      max-width: 1280px;
    }
  `,
}

// Hook to detect mobile devices (to be used with React)
const useMobileDetection = () => {
  if (typeof window === "undefined") return false

  // Check for touch capability
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0

  // Check screen size
  const isMobileSize = window.innerWidth < breakpoints.md

  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

  return hasTouch && (isMobileSize || isMobileDevice)
}

// Add a utility class for text shadow glow effect that can be used with the cn utility
export const textShadowGlow = "text-shadow-[0_0_10px_rgba(0,255,255,0.7)]"

// Add more cyberpunk-specific utility classes
export const cyberpunkGradientText = "bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text"
export const cyberpunkBorderGlow = "border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.7)]"
export const cyberpunkPulse = "animate-pulse"

// Export everything as named exports
export {
  breakpoints,
  mediaQueries,
  spacing,
  responsive,
  touchInteractions,
  mobileOptimizations,
  responsivePatterns,
  useMobileDetection,
}

// Also export as default for convenience
export default {
  breakpoints,
  mediaQueries,
  spacing,
  responsive,
  touchInteractions,
  mobileOptimizations,
  responsivePatterns,
  useMobileDetection,
}
