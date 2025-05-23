/**
 * This file serves as a bridge to ensure the enhanced renderer components are properly loaded
 * and connected to the game system.
 */

import { debugManager } from "./debug-utils"

// Initialize the enhanced renderer system
export function initializeEnhancedRenderer() {
  debugManager.logInfo("RENDERER", "Enhanced renderer bridge initialized")
  return true
}

// Check if a game should use the enhanced renderer
export function shouldUseEnhancedRenderer(gameId: string): boolean {
  // Currently, only archer-arena and last-stand use the enhanced renderer
  return gameId === "archer-arena" || gameId === "last-stand"
}

// Export a flag to indicate the enhanced renderer is available
export const ENHANCED_RENDERER_AVAILABLE = true
