/**
 * Global image path references
 *
 * This file centralizes all image paths used throughout the application.
 * Update paths here to fix broken images across the entire app.
 */

// Logos
export const LOGOS = {
  MUTABLE: {
    TRANSPARENT: "/images/mutable-logo-transparent.png",
    STANDARD: "/images/mutable-logo.png",
  },
  SOLANA: "/solana-logo.png",
  PHANTOM: "/images/phantom-wallet.png",
  SOLFLARE: "/images/solflare-icon.png",
}

// Tokens
export const TOKENS = {
  MUTABLE: "/images/mutable-token.png",
  SOL: "/solana-logo.png",
}

// Game Images
export const GAME_IMAGES = {
  ARCHER: "/images/archer-game.png",
  LAST_STAND: "/images/last-stand.jpg",
  PIXEL_POOL: "/images/pixel-art-pool.png",
}

// Avatars and User Images
export const AVATARS = {
  DIVERSE_GROUP: "/diverse-group-avatars.png",
}

// Placeholder Images
export const PLACEHOLDERS = {
  DEFAULT: "/placeholder.svg",
  AVATAR: "/abstract-geometric-shapes.png",
  GAME: "/diverse-group-playing-board-game.png",
}

// Helper function to get image path with fallback
export function getImagePath(path: string, fallback: string = PLACEHOLDERS.DEFAULT): string {
  // If path is empty or undefined, return fallback
  if (!path) return fallback

  // If path starts with http or https, it's an external URL
  if (path.startsWith("http")) return path

  // Otherwise, return the path (could add validation here)
  return path
}

// Helper function to get game image
export function getGameImage(gameId: string): string {
  switch (gameId) {
    case "archer-arena":
      return GAME_IMAGES.ARCHER
    case "last-stand":
      return GAME_IMAGES.LAST_STAND
    case "pixel-pool":
      return GAME_IMAGES.PIXEL_POOL
    default:
      return PLACEHOLDERS.GAME
  }
}
