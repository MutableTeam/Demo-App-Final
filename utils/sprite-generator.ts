// Enhanced sprite generator for creating high-quality programmatic sprites

// Color palettes for consistent aesthetic
export const PALETTES = {
  // Vibrant fantasy palette
  FANTASY: {
    RED: ["#FF5252", "#FF7B7B", "#FF0000", "#B30000"],
    GREEN: ["#4CAF50", "#7BFF7B", "#00B300", "#005200"],
    BLUE: ["#2196F3", "#7BC8FF", "#0069B3", "#003052"],
    YELLOW: ["#FFC107", "#FFE07B", "#B38600", "#523D00"],
    PURPLE: ["#9C27B0", "#D47BFF", "#6A0080", "#3D004D"],
    BROWN: ["#795548", "#A98274", "#4B332C", "#2E201B"],
    GRAY: ["#9E9E9E", "#CECECE", "#616161", "#3D3D3D"],
    SKIN: ["#FFD3B6", "#FFEDD3", "#D49C6A", "#A67C53"],
    GOLD: ["#FFD700", "#FFEB3B", "#FFC107", "#FF8F00"],
    METAL: ["#B0BEC5", "#CFD8DC", "#78909C", "#546E7A"],
  },
  // Retro pixel art palette
  RETRO: {
    RED: ["#E83B3B", "#F57373", "#B32020", "#7A1616"],
    GREEN: ["#3BE83B", "#73F573", "#20B320", "#167A16"],
    BLUE: ["#3B3BE8", "#7373F5", "#2020B3", "#16167A"],
    YELLOW: ["#E8E83B", "#F5F573", "#B3B320", "#7A7A16"],
    PURPLE: ["#B33BE8", "#D373F5", "#7A20B3", "#52167A"],
    BROWN: ["#B37A3B", "#D3A973", "#7A5220", "#523616"],
    GRAY: ["#A0A0A0", "#D0D0D0", "#707070", "#404040"],
    SKIN: ["#E8B37A", "#F5D3A9", "#B38652", "#7A5A36"],
  },
}

// Helper function to get random element from array
function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper function to create a shadow
function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
  ctx.beginPath()
  ctx.ellipse(x, y + height / 2, width / 2, height / 4, 0, 0, Math.PI * 2)
  ctx.fill()
}

// Generate a detailed archer sprite
export function generateArcherSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  animationState: string,
  frame: number,
  isDrawingBow = false,
): void {
  // Save context state
  ctx.save()

  // Translate to position
  ctx.translate(x, y)

  // Get color palette based on player color
  let palette: string[] = []
  let skinTone: string[] = []
  let metalTone: string[] = []
  let goldTone: string[] = []

  // Determine which palette to use based on color
  const paletteType = "FANTASY" // Could be dynamic based on preferences

  // Map player color to palette color
  if (color === "#FF5252" || color.toLowerCase() === "#ff5252") {
    palette = PALETTES["FANTASY"].RED
    skinTone = PALETTES["FANTASY"].SKIN
    metalTone = PALETTES["FANTASY"].GRAY
    goldTone = PALETTES["FANTASY"].GOLD
  } else if (color === "#4CAF50" || color.toLowerCase() === "#4caf50") {
    palette = PALETTES["FANTASY"].GREEN
    skinTone = PALETTES["FANTASY"].SKIN
    metalTone = PALETTES["FANTASY"].GRAY
    goldTone = PALETTES["FANTASY"].GOLD
  } else if (color === "#2196F3" || color.toLowerCase() === "#2196f3") {
    palette = PALETTES["FANTASY"].BLUE
    skinTone = PALETTES["FANTASY"].SKIN
    metalTone = PALETTES["FANTASY"].GRAY
    goldTone = PALETTES["FANTASY"].GOLD
  } else if (color === "#FFC107" || color.toLowerCase() === "#ffc107") {
    palette = PALETTES["FANTASY"].YELLOW
    skinTone = PALETTES["FANTASY"].SKIN
    metalTone = PALETTES["FANTASY"].GRAY
    goldTone = PALETTES["FANTASY"].GOLD
  } else {
    // Default to red if color not recognized
    palette = PALETTES["FANTASY"].RED
    skinTone = PALETTES["FANTASY"].SKIN
    metalTone = PALETTES["FANTASY"].GRAY
    goldTone = PALETTES["FANTASY"].GOLD
  }

  // Animation-specific transformations
  let bobOffset = 0
  let legOffset = 0
  let armOffset = 0
  let rotation = 0
  let hitOffset = 0
  let deathProgress = 0

  switch (animationState) {
    case "idle":
      // Breathing motion for idle
      bobOffset = Math.sin(frame * 0.08) * 1.2
      // Slight arm movement
      armOffset = Math.sin(frame * 0.08) * 1
      break

    case "run":
      // Running animation - move legs and arms
      legOffset = Math.sin(frame * 0.3) * 6
      armOffset = Math.sin(frame * 0.3) * 4
      bobOffset = Math.abs(Math.sin(frame * 0.3)) * 3
      break

    case "fire":
      // Draw bow animation
      armOffset = isDrawingBow ? Math.min(frame * 0.5, 10) : 0
      break

    case "hit":
      // Hit animation - flash and recoil
      hitOffset = Math.sin(frame * 0.5) * 5
      rotation = Math.sin(frame * 0.5) * 0.15
      ctx.rotate(rotation)
      // Move character slightly in hit direction
      ctx.translate(hitOffset, 0)
      break

    case "death":
      // Death animation - fall over gradually
      deathProgress = Math.min(frame * 0.01, 1) // 0 to 1 over 100 frames
      rotation = (deathProgress * Math.PI) / 2 // Rotate 90 degrees
      ctx.rotate(rotation)
      // Fall down
      ctx.translate(0, deathProgress * size * 0.5)
      break
  }

  // Draw shadow
  drawShadow(ctx, 0, size / 2, size, size / 4)

  // Apply bobbing motion
  ctx.translate(0, -bobOffset)

  // ENHANCED SPRITE DRAWING - More detailed and similar to the sprite sheet

  // Draw legs
  if (animationState !== "death" || deathProgress < 0.5) {
    // Left leg
    ctx.fillStyle = palette[2] // Darker shade for pants
    ctx.fillRect(-size / 4 - 2, size / 4, size / 5, size / 2 + legOffset)

    // Right leg
    ctx.fillRect(size / 4 - 2, size / 4, size / 5, size / 2 - legOffset)

    // Boots
    ctx.fillStyle = "#4B332C" // Brown boots
    ctx.fillRect(-size / 4 - 4, size / 4 + size / 2 + legOffset - 4, size / 5 + 4, 6)
    ctx.fillRect(size / 4 - 4, size / 4 + size / 2 - legOffset - 4, size / 5 + 4, 6)

    // Boot details
    ctx.fillStyle = goldTone[0] // Gold trim
    ctx.fillRect(-size / 4 - 4, size / 4 + size / 2 + legOffset - 6, size / 5 + 4, 2)
    ctx.fillRect(size / 4 - 4, size / 4 + size / 2 - legOffset - 6, size / 5 + 4, 2)
  }

  // Draw body/torso with armor
  ctx.fillStyle = palette[0] // Main color for tunic
  ctx.fillRect(-size / 3, -size / 4, size / 1.5, size / 2)

  // Armor plate
  ctx.fillStyle = metalTone[0] // Metal armor
  ctx.fillRect(-size / 4, -size / 4, size / 2, size / 3)

  // Armor highlights
  ctx.fillStyle = metalTone[1] // Lighter metal
  ctx.fillRect(-size / 4, -size / 4, size / 2, size / 10)

  // Armor trim
  ctx.fillStyle = goldTone[0] // Gold trim
  ctx.fillRect(-size / 4, -size / 4, size / 2, size / 20)
  ctx.fillRect(-size / 4, -size / 4 + size / 3 - size / 20, size / 2, size / 20)

  // Draw belt
  ctx.fillStyle = "#4B332C" // Brown belt
  ctx.fillRect(-size / 3, size / 4 - 4, size / 1.5, 6)

  // Belt buckle
  ctx.fillStyle = goldTone[0] // Gold buckle
  ctx.fillRect(-size / 10, size / 4 - 4, size / 5, 6)

  // Draw head with helmet
  // Face
  ctx.fillStyle = skinTone[0] // Skin tone
  ctx.beginPath()
  ctx.arc(0, -size / 2, size / 4, 0, Math.PI * 2)
  ctx.fill()

  // Helmet
  ctx.fillStyle = metalTone[0] // Metal helmet
  ctx.beginPath()
  ctx.arc(0, -size / 2, size / 4 + 2, Math.PI * 0.3, Math.PI * 2.7)
  ctx.fill()

  // Helmet details
  ctx.fillStyle = metalTone[1] // Lighter metal for highlights
  ctx.beginPath()
  ctx.arc(0, -size / 2, size / 4 + 2, Math.PI * 0.3, Math.PI * 1.2)
  ctx.lineTo(0, -size / 2)
  ctx.fill()

  // Helmet crest
  ctx.fillStyle = palette[0] // Team color for crest
  ctx.beginPath()
  ctx.moveTo(-size / 8, -size / 2 - size / 4 - 2)
  ctx.lineTo(size / 8, -size / 2 - size / 4 - 2)
  ctx.lineTo(0, -size / 2 - size / 3 - 2)
  ctx.fill()

  // Draw face
  ctx.fillStyle = "#000000" // Black for eyes
  ctx.fillRect(-size / 10, -size / 2 - size / 16, size / 25, size / 25) // Left eye
  ctx.fillRect(size / 20, -size / 2 - size / 16, size / 25, size / 25) // Right eye

  // Mouth - changes with animation state
  if (animationState === "hit" || animationState === "death") {
    // Open mouth for hit/death
    ctx.fillStyle = "#A52A2A" // Dark red for open mouth
    ctx.beginPath()
    ctx.ellipse(0, -size / 2 + size / 12, size / 15, size / 25, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // Closed mouth for other states
    ctx.fillStyle = "#A52A2A" // Dark red for mouth
    ctx.fillRect(-size / 15, -size / 2 + size / 12, size / 7.5, size / 25)
  }

  // Draw arms
  if (animationState !== "death" || deathProgress < 0.7) {
    // Left arm (behind bow)
    ctx.fillStyle = palette[0] // Main color for sleeve
    ctx.fillRect(-size / 3 - size / 6, -size / 4, size / 6, size / 2 + armOffset)

    // Left arm armor
    ctx.fillStyle = metalTone[0] // Metal armor
    ctx.fillRect(-size / 3 - size / 6, -size / 4, size / 6, size / 5)

    // Right arm (holding bow)
    ctx.fillStyle = palette[0] // Main color for sleeve
    ctx.fillRect(size / 3, -size / 4, size / 6, size / 2 - armOffset)

    // Right arm armor
    ctx.fillStyle = metalTone[0] // Metal armor
    ctx.fillRect(size / 3, -size / 4, size / 6, size / 5)

    // Hands
    ctx.fillStyle = skinTone[0] // Skin tone
    ctx.beginPath()
    ctx.arc(-size / 3 - size / 12, -size / 4 + size / 2 + armOffset, size / 12, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(size / 3 + size / 12, -size / 4 + size / 2 - armOffset, size / 12, 0, Math.PI * 2)
    ctx.fill()

    // Glove details
    ctx.fillStyle = "#4B332C" // Brown leather glove trim
    ctx.beginPath()
    ctx.arc(-size / 3 - size / 12, -size / 4 + size / 2 + armOffset, size / 12, Math.PI * 0.8, Math.PI * 1.8)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(size / 3 + size / 12, -size / 4 + size / 2 - armOffset, size / 12, Math.PI * 1.2, Math.PI * 2.2)
    ctx.fill()
  }

  // Draw bow if not dead
  if (animationState !== "death") {
    drawDetailedBow(ctx, size, isDrawingBow, frame, armOffset)
  }

  // Draw quiver on back
  ctx.fillStyle = "#4B332C" // Brown quiver
  ctx.fillRect(-size / 2.5, -size / 4, size / 10, size / 2)

  // Quiver strap
  ctx.strokeStyle = "#4B332C" // Brown strap
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-size / 2.5 + size / 20, -size / 4)
  ctx.lineTo(0, -size / 3)
  ctx.stroke()

  // Draw arrows in quiver
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#D3A973" // Arrow shafts
    ctx.fillRect(-size / 2.5 + size / 20, -size / 4 + i * (size / 8), size / 20, size / 2 - i * (size / 8))

    // Arrow heads
    ctx.fillStyle = metalTone[0] // Metal arrowheads
    ctx.beginPath()
    ctx.moveTo(-size / 2.5 + size / 20 + size / 40, -size / 4 + i * (size / 8) - size / 20)
    ctx.lineTo(-size / 2.5 + size / 20 - size / 40, -size / 4 + i * (size / 8) - size / 20)
    ctx.lineTo(-size / 2.5 + size / 20, -size / 4 + i * (size / 8))
    ctx.fill()

    // Arrow fletching
    ctx.fillStyle = palette[0] // Team color fletching
    ctx.fillRect(-size / 2.5 + size / 20 - size / 30, -size / 4 + i * (size / 8) + size / 3, size / 15, size / 20)
  }

  // Add special effects based on animation state
  if (animationState === "hit") {
    // Hit flash effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.globalCompositeOperation = "lighter"
    ctx.fillRect(-size / 2, -size, size, size * 1.5)
  } else if (animationState === "death") {
    // Death effect
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
    ctx.globalCompositeOperation = "multiply"
    ctx.fillRect(-size / 2, -size, size, size * 1.5)

    // Add blood splatter for death animation
    if (deathProgress > 0.3) {
      ctx.fillStyle = "#8B0000" // Dark red blood
      for (let i = 0; i < 5; i++) {
        const splatterX = (Math.random() - 0.5) * size
        const splatterY = ((Math.random() - 0.5) * size) / 2
        const splatterSize = size / 15 + (Math.random() * size) / 15

        ctx.beginPath()
        ctx.arc(splatterX, splatterY, splatterSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // Restore context
  ctx.restore()
}

// Helper function to draw a detailed bow
function drawDetailedBow(
  ctx: CanvasRenderingContext2D,
  size: number,
  isDrawing: boolean,
  frame: number,
  armOffset: number,
): void {
  // Draw bow
  const drawAmount = isDrawing ? Math.min(frame * 0.2, 10) : 0

  // Bow handle
  ctx.fillStyle = "#8B4513" // Brown for bow handle
  ctx.fillRect(size / 3 + size / 6, -size / 4, size / 12, size / 2)

  // Bow handle wrap
  ctx.fillStyle = "#5D4037" // Darker brown for handle wrap
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(size / 3 + size / 6, -size / 4 + (i * size) / 10, size / 12, size / 20)
  }

  // Bow upper limb
  ctx.strokeStyle = "#8B4513" // Brown for bow
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(size / 3 + size / 6 + size / 24, -size / 4)
  ctx.quadraticCurveTo(size / 2 + drawAmount, -size / 2, size / 3 + size / 6 + size / 24, -size / 4 - size / 2)
  ctx.stroke()

  // Bow upper limb details
  ctx.strokeStyle = "#5D4037" // Darker brown for details
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(size / 3 + size / 6 + size / 24, -size / 4)
  ctx.quadraticCurveTo(size / 2 + drawAmount - 2, -size / 2, size / 3 + size / 6 + size / 24, -size / 4 - size / 2 + 2)
  ctx.stroke()

  // Bow lower limb
  ctx.strokeStyle = "#8B4513" // Brown for bow
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(size / 3 + size / 6 + size / 24, -size / 4 + size / 2)
  ctx.quadraticCurveTo(size / 2 + drawAmount, size / 4, size / 3 + size / 6 + size / 24, -size / 4 + size)
  ctx.stroke()

  // Bow lower limb details
  ctx.strokeStyle = "#5D4037" // Darker brown for details
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(size / 3 + size / 6 + size / 24, -size / 4 + size / 2)
  ctx.quadraticCurveTo(size / 2 + drawAmount - 2, size / 4, size / 3 + size / 6 + size / 24, -size / 4 + size - 2)
  ctx.stroke()

  // Bowstring
  ctx.strokeStyle = "#E0E0E0" // White string
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(size / 3 + size / 6 + size / 24, -size / 4 - size / 2)
  ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount, -size / 4 + size / 4)
  ctx.lineTo(size / 3 + size / 6 + size / 24, -size / 4 + size)
  ctx.stroke()

  // Arrow (only when drawing)
  if (isDrawing) {
    // Arrow shaft
    ctx.fillStyle = "#D3A973" // Light brown for arrow shaft
    ctx.fillRect(size / 3 + size / 6 + size / 24 + drawAmount, -size / 4 + size / 4 - 1, size / 2, 2)

    // Arrow head
    ctx.fillStyle = "#A0A0A0" // Metal arrowhead
    ctx.beginPath()
    ctx.moveTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 2, -size / 4 + size / 4)
    ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 2 - size / 12, -size / 4 + size / 4 - size / 20)
    ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 2 - size / 12, -size / 4 + size / 4 + size / 20)
    ctx.fill()

    // Arrow fletching
    ctx.fillStyle = "#FF5252" // Red fletching
    ctx.beginPath()
    ctx.moveTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 12, -size / 4 + size / 4)
    ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 6, -size / 4 + size / 4 - size / 12)
    ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 4, -size / 4 + size / 4)
    ctx.fill()

    ctx.fillStyle = "#FFFFFF" // White fletching
    ctx.beginPath()
    ctx.moveTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 12, -size / 4 + size / 4)
    ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 6, -size / 4 + size / 4 + size / 12)
    ctx.lineTo(size / 3 + size / 6 + size / 24 + drawAmount + size / 4, -size / 4 + size / 4)
    ctx.fill()
  }
}

// Generate a detailed arrow sprite
export function generateArrowSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // Draw shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
  ctx.beginPath()
  ctx.ellipse(0, 2, size * 4, size / 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Arrow shaft
  ctx.fillStyle = "#D3A973" // Light brown for arrow shaft
  ctx.fillRect(-size * 3, -size / 2, size * 6, size)

  // Arrow head
  ctx.fillStyle = "#A0A0A0" // Metal arrowhead
  ctx.beginPath()
  ctx.moveTo(size * 3, 0)
  ctx.lineTo(size * 2, -size)
  ctx.lineTo(size * 2, size)
  ctx.fill()

  // Arrow fletching
  // Red fletching
  ctx.fillStyle = "#FF5252"
  ctx.beginPath()
  ctx.moveTo(-size * 3, 0)
  ctx.lineTo(-size * 2, -size)
  ctx.lineTo(-size * 1.5, 0)
  ctx.fill()

  // White fletching
  ctx.fillStyle = "#FFFFFF"
  ctx.beginPath()
  ctx.moveTo(-size * 3, 0)
  ctx.lineTo(-size * 2, size)
  ctx.lineTo(-size * 1.5, 0)
  ctx.fill()

  // Add shine to shaft
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
  ctx.lineWidth = size / 4
  ctx.beginPath()
  ctx.moveTo(-size * 2.5, -size / 4)
  ctx.lineTo(size * 1.5, -size / 4)
  ctx.stroke()

  ctx.restore()
}

// Generate a detailed pickup sprite
export function generatePickupSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  frame: number,
): void {
  ctx.save()
  ctx.translate(x, y)

  // Pulsating effect
  const scale = 1 + Math.sin(frame * 0.1) * 0.1
  ctx.scale(scale, scale)

  // Draw shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
  ctx.beginPath()
  ctx.ellipse(0, size / 2, size / 2, size / 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Floating animation
  const floatOffset = Math.sin(frame * 0.1) * 3
  ctx.translate(0, -floatOffset)

  // Draw base glow
  ctx.fillStyle = color
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.arc(0, 0, size, 0, Math.PI * 2)
  ctx.fill()

  // Draw pickup base
  ctx.globalAlpha = 1
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw inner details
  ctx.fillStyle = "#FFFFFF"
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(0, 0, size / 3, 0, Math.PI * 2)
  ctx.fill()

  // Draw symbol based on color
  ctx.fillStyle = color
  ctx.globalAlpha = 1

  if (color === "#FF5252") {
    // Health pickup
    // Draw cross
    ctx.fillRect(-size / 6, -size / 15, size / 3, size / 7.5)
    ctx.fillRect(-size / 15, -size / 6, size / 7.5, size / 3)
  } else if (color === "#4CAF50") {
    // Speed pickup
    // Draw lightning bolt
    ctx.beginPath()
    ctx.moveTo(-size / 6, -size / 6)
    ctx.lineTo(0, 0)
    ctx.lineTo(-size / 12, size / 6)
    ctx.lineTo(size / 6, -size / 12)
    ctx.closePath()
    ctx.fill()
  } else if (color === "#2196F3") {
    // Shield pickup
    // Draw shield
    ctx.beginPath()
    ctx.moveTo(0, -size / 6)
    ctx.lineTo(size / 6, -size / 12)
    ctx.lineTo(size / 6, size / 12)
    ctx.lineTo(0, size / 6)
    ctx.lineTo(-size / 6, size / 12)
    ctx.lineTo(-size / 6, -size / 12)
    ctx.closePath()
    ctx.fill()
  } else {
    // Default pickup
    // Draw star
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
      const outerX = Math.cos(angle) * (size / 4)
      const outerY = Math.sin(angle) * (size / 4)

      const innerAngle = angle + Math.PI / 5
      const innerX = Math.cos(innerAngle) * (size / 8)
      const innerY = Math.sin(innerAngle) * (size / 8)

      if (i === 0) {
        ctx.moveTo(outerX, outerY)
      } else {
        ctx.lineTo(outerX, outerY)
      }

      ctx.lineTo(innerX, innerY)
    }
    ctx.closePath()
    ctx.fill()
  }

  // Draw outer glow
  const gradient = ctx.createRadialGradient(0, 0, size / 2, 0, 0, size)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

  ctx.globalAlpha = 0.3 + Math.sin(frame * 0.2) * 0.1
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(0, 0, size, 0, Math.PI * 2)
  ctx.fill()

  // Draw sparkles
  ctx.globalAlpha = 0.7
  ctx.fillStyle = "#FFFFFF"

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + frame * 0.05
    const distance = size * 0.6
    const sparkleX = Math.cos(angle) * distance
    const sparkleY = Math.sin(angle) * distance
    const sparkleSize = size / 10 + (Math.sin(frame * 0.2 + i) * size) / 20

    ctx.beginPath()
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// Generate a detailed wall sprite
export function generateWallSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save()
  ctx.translate(x, y)

  // Draw shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
  ctx.fillRect(-size - 5, -size - 5, size * 2 + 10, size * 2 + 10)

  // Draw the main wall
  const baseColor = "#6D6552" // Stone base color
  ctx.fillStyle = baseColor
  ctx.fillRect(-size, -size, size * 2, size * 2)

  // Draw stone pattern
  const blockSize = 10 // Size of each "block" in the wall

  // Create a consistent pattern based on position
  for (let bx = -size; bx < size; bx += blockSize) {
    for (let by = -size; by < size; by += blockSize) {
      // Use a deterministic pattern based on position
      const patternValue = Math.abs(Math.sin(bx * 0.1) * Math.cos(by * 0.1)) * 100

      if (patternValue > 70) {
        // Lighter stone
        ctx.fillStyle = "#7D7562"
        ctx.fillRect(bx, by, blockSize - 1, blockSize - 1)
      } else if (patternValue < 30) {
        // Darker stone
        ctx.fillStyle = "#5D5542"
        ctx.fillRect(bx, by, blockSize - 1, blockSize - 1)
      }

      // Add some random stone details
      if (patternValue > 40 && patternValue < 50) {
        // Stone cracks
        ctx.strokeStyle = "#4D4532"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(bx + blockSize * 0.2, by + blockSize * 0.2)
        ctx.lineTo(bx + blockSize * 0.8, by + blockSize * 0.8)
        ctx.stroke()
      }
    }
  }

  // Draw darker grout lines
  ctx.strokeStyle = "#4D4532"
  ctx.lineWidth = 1

  // Horizontal lines
  for (let y = -size; y <= size; y += blockSize) {
    ctx.beginPath()
    ctx.moveTo(-size, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }

  // Vertical lines
  for (let x = -size; x <= size; x += blockSize) {
    ctx.beginPath()
    ctx.moveTo(x, -size)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  // Add moss/vegetation details to some edges
  ctx.fillStyle = "#4A6741" // Moss green

  // Top edge moss
  if (Math.random() > 0.5) {
    for (let x = -size; x < size; x += blockSize) {
      if (Math.random() > 0.7) {
        ctx.beginPath()
        ctx.moveTo(x, -size)
        ctx.lineTo(x + blockSize, -size)
        ctx.lineTo(x + blockSize / 2, -size + blockSize / 2)
        ctx.fill()
      }
    }
  }

  // Left edge moss
  if (Math.random() > 0.5) {
    for (let y = -size; y < size; y += blockSize) {
      if (Math.random() > 0.7) {
        ctx.beginPath()
        ctx.moveTo(-size, y)
        ctx.lineTo(-size, y + blockSize)
        ctx.lineTo(-size + blockSize / 2, y + blockSize / 2)
        ctx.fill()
      }
    }
  }

  ctx.restore()
}

// Generate a detailed background tile
export function generateBackgroundTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type = "grass",
): void {
  ctx.save()
  ctx.translate(x, y)

  switch (type) {
    case "grass":
      // Base grass color
      ctx.fillStyle = "#2A4D00"
      ctx.fillRect(0, 0, size, size)

      // Add grass details
      for (let i = 0; i < 10; i++) {
        const grassX = Math.random() * size
        const grassY = Math.random() * size
        const grassHeight = 2 + Math.random() * 3
        const grassWidth = 1 + Math.random() * 1

        // Vary grass color slightly
        const colorVariation = Math.floor(Math.random() * 20)
        ctx.fillStyle = `rgb(${42 + colorVariation}, ${77 + colorVariation}, ${0 + colorVariation})`

        ctx.beginPath()
        ctx.moveTo(grassX, grassY)
        ctx.lineTo(grassX + grassWidth, grassY)
        ctx.lineTo(grassX + grassWidth / 2, grassY - grassHeight)
        ctx.closePath()
        ctx.fill()
      }
      break

    case "dirt":
      // Base dirt color
      ctx.fillStyle = "#5C4033"
      ctx.fillRect(0, 0, size, size)

      // Add dirt details
      for (let i = 0; i < 8; i++) {
        const stoneX = Math.random() * size
        const stoneY = Math.random() * size
        const stoneSize = 1 + Math.random() * 2

        // Vary stone color
        const colorVariation = Math.floor(Math.random() * 20)
        ctx.fillStyle = `rgb(${92 - colorVariation}, ${64 - colorVariation}, ${51 - colorVariation})`

        ctx.beginPath()
        ctx.arc(stoneX, stoneY, stoneSize, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case "water":
      // Base water color
      ctx.fillStyle = "#1A3A6C"
      ctx.fillRect(0, 0, size, size)

      // Add water ripple details
      ctx.strokeStyle = "#3A5A8C"
      ctx.lineWidth = 0.5

      for (let i = 0; i < 3; i++) {
        const rippleX = Math.random() * size
        const rippleY = Math.random() * size
        const rippleSize = 3 + Math.random() * 5

        ctx.beginPath()
        ctx.arc(rippleX, rippleY, rippleSize, 0, Math.PI * 2)
        ctx.stroke()
      }
      break

    default:
      // Default tile
      ctx.fillStyle = "#1a3300"
      ctx.fillRect(0, 0, size, size)

      // Add grid lines
      ctx.strokeStyle = "#2a4d00"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(size, 0)
      ctx.lineTo(size, size)
      ctx.lineTo(0, size)
      ctx.closePath()
      ctx.stroke()
  }

  ctx.restore()
}

// Generate a particle effect
export function generateParticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  type = "hit",
  frame = 0,
): void {
  ctx.save()
  ctx.translate(x, y)

  // Fade out based on frame
  const fadeOut = Math.max(0, 1 - frame / 30)
  ctx.globalAlpha = fadeOut

  switch (type) {
    case "hit":
      // Hit particle effect
      // FIX: Ensure particleSize is always positive
      const particleSize = Math.max(0.1, size * (1 - frame / 30))

      // Draw expanding circle
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(0, 0, particleSize, 0, Math.PI * 2)
      ctx.fill()

      // Draw inner highlight
      ctx.fillStyle = "#FFFFFF"
      ctx.globalAlpha = fadeOut * 0.7
      ctx.beginPath()
      ctx.arc(0, 0, Math.max(0.1, particleSize * 0.6), 0, Math.PI * 2)
      ctx.fill()

      // Draw lines radiating outward
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.globalAlpha = fadeOut * 0.5

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + frame * 0.05
        const innerRadius = Math.max(0.1, particleSize * 0.8)
        const outerRadius = Math.max(0.1, particleSize * 1.5)

        ctx.beginPath()
        ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius)
        ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
        ctx.stroke()
      }
      break

    case "trail":
      // Movement trail particle
      // FIX: Ensure trailSize is always positive
      const trailSize = Math.max(0.1, size * (1 - frame / 30))

      // Draw fading trail
      ctx.fillStyle = color
      ctx.globalAlpha = fadeOut * 0.3
      ctx.beginPath()
      ctx.arc(0, 0, trailSize, 0, Math.PI * 2)
      ctx.fill()
      break

    case "sparkle":
      // Sparkle particle
      // FIX: Ensure sparkleSize is always positive
      const sparkleSize = Math.max(0.1, size * (1 - frame / 30))

      // Draw star shape
      ctx.fillStyle = color
      ctx.beginPath()

      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const outerRadius = sparkleSize
        const innerRadius = sparkleSize * 0.4

        const outerX = Math.cos(angle) * outerRadius
        const outerY = Math.sin(angle) * outerRadius

        const innerAngle = angle + Math.PI / 5
        const innerX = Math.cos(innerAngle) * innerRadius
        const innerY = Math.sin(innerAngle) * innerRadius

        if (i === 0) {
          ctx.moveTo(outerX, outerY)
        } else {
          ctx.lineTo(outerX, outerY)
        }

        ctx.lineTo(innerX, innerY)
      }

      ctx.closePath()
      ctx.fill()

      // Add glow
      // FIX: Ensure radius is always positive
      const glowRadius = Math.max(0.1, sparkleSize * 1.5)
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.globalAlpha = fadeOut * 0.5
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2)
      ctx.fill()
      break

    case "blood":
      // Blood splatter effect for death animation
      const bloodSize = Math.max(0.1, size * (1 - frame / 40))

      // Draw blood splatter
      ctx.fillStyle = "#8B0000" // Dark red blood
      ctx.beginPath()

      // Create irregular shape for blood
      ctx.moveTo(0, 0)
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + Math.random() * 0.5
        const radius = bloodSize * (0.5 + Math.random() * 0.5)
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      }

      ctx.closePath()
      ctx.fill()

      // Add darker center
      ctx.fillStyle = "#660000" // Darker red
      ctx.globalAlpha = fadeOut * 0.7
      ctx.beginPath()
      ctx.arc(0, 0, bloodSize * 0.4, 0, Math.PI * 2)
      ctx.fill()
      break
  }

  ctx.restore()
}

// Generate a death animation effect
export function generateDeathEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  frame: number,
): void {
  // Add blood pool
  ctx.save()
  ctx.translate(x, y + size / 2)

  const poolSize = Math.min(size * 1.5, size * 0.5 + frame * 0.1)

  // Blood pool
  ctx.fillStyle = "#8B0000" // Dark red blood
  ctx.beginPath()
  ctx.ellipse(0, 0, poolSize, poolSize / 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Blood pool details
  ctx.fillStyle = "#660000" // Darker red
  ctx.beginPath()
  ctx.ellipse(poolSize * 0.3, -poolSize * 0.1, poolSize * 0.3, poolSize * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  // Add blood splatters around
  if (frame < 20 && frame % 3 === 0) {
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = size * (0.5 + Math.random() * 0.5)
      const splatterX = x + Math.cos(angle) * distance
      const splatterY = y + Math.sin(angle) * distance

      generateParticle(ctx, splatterX, splatterY, size * 0.3, "#8B0000", "blood", Math.random() * 10)
    }
  }
}

// Update sprite-animation.ts to support the new animations
