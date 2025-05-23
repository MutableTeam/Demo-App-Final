import { keyframes } from "@emotion/react"

// Define theme colors
export const cyberpunkColors = {
  // Primary colors
  primary: {
    cyan: "#0ff",
    magenta: "#f0f",
    darkCyan: "#0cc",
    darkMagenta: "#b300b3",
  },
  // Background colors
  background: {
    dark: "rgba(16, 16, 48, 0.9)",
    darker: "rgba(10, 10, 30, 0.95)",
    card: "linear-gradient(135deg, rgba(16, 16, 48, 0.9) 0%, rgba(32, 16, 64, 0.9) 100%)",
    button: "linear-gradient(90deg, #0ff 0%, #f0f 100%)",
    buttonHover: "linear-gradient(90deg, #0ff 20%, #f0f 80%)",
    testButton: "linear-gradient(90deg, #f0f 0%, #b300b3 100%)",
    testButtonHover: "linear-gradient(90deg, #f0f 20%, #b300b3 80%)",
  },
  // Border colors
  border: {
    cyan: "rgba(0, 255, 255, 0.3)",
    magenta: "rgba(255, 0, 255, 0.3)",
    cyanBright: "rgba(0, 255, 255, 0.5)",
    magentaBright: "rgba(255, 0, 255, 0.5)",
  },
  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "#d1d5db",
    muted: "#9ca3af",
    cyan: "#0ff",
    magenta: "#f0f",
  },
  // Shadow colors
  shadow: {
    cyan: "rgba(0, 255, 255, 0.2)",
    magenta: "rgba(255, 0, 255, 0.1)",
    cyanBright: "rgba(0, 255, 255, 0.7)",
  },
}

// Define animations
export const cyberpunkAnimations = {
  pulse: keyframes`
    0%, 100% {
      opacity: 1;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.9), 0 0 20px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3);
    }
    50% {
      opacity: 0.8;
      text-shadow: 0 0 15px rgba(255, 0, 255, 0.9), 0 0 25px rgba(255, 0, 255, 0.5), 0 0 35px rgba(255, 0, 255, 0.3);
    }
  `,

  glitch: keyframes`
    0%, 100% { 
      transform: translate(0); 
      text-shadow: -2px 0 #0ff, 2px 0 #f0f;
    }
    25% { 
      transform: translate(-2px, 2px); 
      text-shadow: 2px 0 #0ff, -2px 0 #f0f;
    }
    50% { 
      transform: translate(2px, -2px); 
      text-shadow: 2px 0 #0ff, -2px 0 #f0f;
    }
    75% { 
      transform: translate(-2px, -2px); 
      text-shadow: -2px 0 #0ff, 2px 0 #f0f;
    }
  `,

  shine: keyframes`
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: 0 200%;
    }
  `,

  scanline: keyframes`
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  `,

  borderFlow: keyframes`
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 0%;
    }
  `,

  buttonGlow: keyframes`
    0%, 100% {
      box-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 8px rgba(255, 0, 255, 0.7), 0 0 12px rgba(255, 0, 255, 0.5), 0 0 18px rgba(255, 0, 255, 0.3);
    }
  `,
}

// Define common effects
export const cyberpunkEffects = {
  textGlow: (color: string = cyberpunkColors.primary.cyan) => `
    color: ${color};
    text-shadow: 0 0 5px ${color}aa;
  `,
  boxGlow: (color: string = cyberpunkColors.primary.cyan) => `
    box-shadow: 0 0 15px ${color}aa;
  `,
  gridBackground: `
    background: 
      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    transform: perspective(500px) rotateX(60deg);
    transform-origin: center bottom;
    opacity: 0.3;
  `,
  scanlines: `
    position: relative;
    overflow: hidden;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent 50%,
        rgba(0, 0, 0, 0.1) 50%
      );
      background-size: 100% 4px;
      pointer-events: none;
      z-index: 10;
    }
  `,
}

// Define responsive breakpoints
export const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
}

// Define spacing scale
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
}

// Define font settings
export const typography = {
  fontFamily: {
    mono: "monospace",
    sans: "system-ui, -apple-system, sans-serif",
    display: "var(--font-press-start-2p), monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
}

// Define border radius
export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  default: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
}

// Define z-index scale
export const zIndex = {
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  auto: "auto",
}

// Export the complete theme
export const cyberpunkTheme = {
  colors: cyberpunkColors,
  animations: cyberpunkAnimations,
  effects: cyberpunkEffects,
  breakpoints,
  spacing,
  typography,
  borderRadius,
  zIndex,
}

export default cyberpunkTheme
