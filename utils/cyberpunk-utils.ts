import { cyberpunkTheme } from "@/styles/cyberpunk-theme"

// Helper function to apply cyberpunk text glow
export function applyCyberpunkGlow(element: HTMLElement, color: string = cyberpunkTheme.colors.primary.cyan) {
  element.style.color = color
  element.style.textShadow = `0 0 5px ${color}aa`
}

// Helper function to apply cyberpunk box glow
export function applyCyberpunkBoxGlow(element: HTMLElement, color: string = cyberpunkTheme.colors.primary.cyan) {
  element.style.boxShadow = `0 0 15px ${color}aa`
}

// Helper function to apply cyberpunk gradient
export function applyCyberpunkGradient(element: HTMLElement, type: "button" | "card" | "test") {
  switch (type) {
    case "button":
      element.style.background = cyberpunkTheme.colors.background.button
      break
    case "card":
      element.style.background = cyberpunkTheme.colors.background.card
      break
    case "test":
      element.style.background = cyberpunkTheme.colors.background.testButton
      break
  }
}

// Helper function to apply cyberpunk border
export function applyCyberpunkBorder(element: HTMLElement) {
  element.style.border = `1px solid ${cyberpunkTheme.colors.border.cyan}`
}

// Helper function to apply grid background
export function applyCyberpunkGrid(element: HTMLElement) {
  element.style.position = "relative"

  const gridElement = document.createElement("div")
  gridElement.style.position = "absolute"
  gridElement.style.top = "0"
  gridElement.style.left = "0"
  gridElement.style.right = "0"
  gridElement.style.bottom = "0"
  gridElement.style.background = `
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
  `
  gridElement.style.backgroundSize = "20px 20px"
  gridElement.style.transform = "perspective(500px) rotateX(60deg)"
  gridElement.style.transformOrigin = "center bottom"
  gridElement.style.opacity = "0.3"
  gridElement.style.zIndex = "0"

  element.appendChild(gridElement)
}

// Helper function to apply scanlines effect
export function applyCyberpunkScanlines(element: HTMLElement) {
  element.style.position = "relative"
  element.style.overflow = "hidden"

  const scanlinesElement = document.createElement("div")
  scanlinesElement.style.position = "absolute"
  scanlinesElement.style.top = "0"
  scanlinesElement.style.left = "0"
  scanlinesElement.style.width = "100%"
  scanlinesElement.style.height = "100%"
  scanlinesElement.style.background = "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 50%)"
  scanlinesElement.style.backgroundSize = "100% 4px"
  scanlinesElement.style.pointerEvents = "none"
  scanlinesElement.style.zIndex = "10"

  element.appendChild(scanlinesElement)
}
