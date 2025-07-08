// Enemy sprite generator
export function generateEnemySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  animationState: string,
  frame: number,
) {
  switch (type) {
    case "skeleton":
      generateSkeletonSprite(ctx, x, y, size, animationState, frame)
      break
    case "zombie":
      generateZombieSprite(ctx, x, y, size, animationState, frame)
      break
    case "ghost":
      generateGhostSprite(ctx, x, y, size, animationState, frame)
      break
    case "necromancer":
      generateNecromancerSprite(ctx, x, y, size, animationState, frame)
      break
    default:
      generateSkeletonSprite(ctx, x, y, size, animationState, frame)
  }
}

// Generate skeleton sprite
function generateSkeletonSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  animationState: string,
  frame: number,
) {
  ctx.save()
  ctx.translate(x, y)

  // Base skeleton body (white/bone color)
  ctx.fillStyle = "#E0E0E0"

  // Body
  ctx.beginPath()
  ctx.ellipse(0, 0, size / 2, size / 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Animate based on state and frame
  const bounceOffset = Math.sin(frame * 0.2) * 2

  // Head
  ctx.beginPath()
  ctx.arc(0, -size / 3, size / 3, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = "#00FF00" // Glowing green eyes
  ctx.beginPath()
  ctx.arc(-size / 6, -size / 3, size / 10, 0, Math.PI * 2)
  ctx.arc(size / 6, -size / 3, size / 10, 0, Math.PI * 2)
  ctx.fill()

  // Jaw
  ctx.strokeStyle = "#E0E0E0"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-size / 4, -size / 4)
  ctx.lineTo(size / 4, -size / 4)
  ctx.stroke()

  // Arms
  ctx.lineWidth = 3
  ctx.beginPath()

  if (animationState === "attack") {
    // Attack animation
    const attackPhase = (frame % 20) / 20
    const armAngle = Math.PI / 4 + (Math.sin(attackPhase * Math.PI * 2) * Math.PI) / 2

    ctx.moveTo(-size / 4, -size / 8)
    ctx.lineTo(-size / 2 - (Math.cos(armAngle) * size) / 2, -size / 8 + (Math.sin(armAngle) * size) / 2)

    ctx.moveTo(size / 4, -size / 8)
    ctx.lineTo(size / 2 + (Math.cos(armAngle) * size) / 2, -size / 8 + (Math.sin(armAngle) * size) / 2)
  } else {
    // Walking animation
    const walkOffset = (Math.sin(frame * 0.2) * size) / 6

    ctx.moveTo(-size / 4, -size / 8)
    ctx.lineTo(-size / 2 - walkOffset, size / 4)

    ctx.moveTo(size / 4, -size / 8)
    ctx.lineTo(size / 2 + walkOffset, size / 4)
  }

  ctx.stroke()

  // Legs
  ctx.beginPath()

  if (animationState === "walk") {
    // Walking animation
    const walkOffset = (Math.sin(frame * 0.2) * size) / 6

    ctx.moveTo(-size / 6, size / 8)
    ctx.lineTo(-size / 3, size / 2 + walkOffset)

    ctx.moveTo(size / 6, size / 8)
    ctx.lineTo(size / 3, size / 2 - walkOffset)
  } else {
    // Standing
    ctx.moveTo(-size / 6, size / 8)
    ctx.lineTo(-size / 3, size / 2)

    ctx.moveTo(size / 6, size / 8)
    ctx.lineTo(size / 3, size / 2)
  }

  ctx.stroke()

  ctx.restore()
}

// Generate zombie sprite
function generateZombieSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  animationState: string,
  frame: number,
) {
  ctx.save()
  ctx.translate(x, y)

  // Base zombie body (greenish)
  ctx.fillStyle = "#5D8C61"

  // Body
  ctx.beginPath()
  ctx.ellipse(0, 0, size / 2, size / 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.beginPath()
  ctx.arc(0, -size / 3, size / 3, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = "#FF0000" // Red eyes
  ctx.beginPath()
  ctx.arc(-size / 6, -size / 3, size / 10, 0, Math.PI * 2)
  ctx.arc(size / 6, -size / 3, size / 10, 0, Math.PI * 2)
  ctx.fill()

  // Mouth
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-size / 5, -size / 4)
  ctx.lineTo(size / 5, -size / 4)
  ctx.stroke()

  // Arms - more hunched over
  ctx.strokeStyle = "#5D8C61"
  ctx.lineWidth = 4
  ctx.beginPath()

  if (animationState === "attack") {
    // Attack animation
    const attackPhase = (frame % 20) / 20
    const armAngle = Math.PI / 3 + (Math.sin(attackPhase * Math.PI * 2) * Math.PI) / 3

    ctx.moveTo(-size / 4, -size / 8)
    ctx.lineTo(-size / 2 - (Math.cos(armAngle) * size) / 2, -size / 8 + (Math.sin(armAngle) * size) / 2)

    ctx.moveTo(size / 4, -size / 8)
    ctx.lineTo(size / 2 + (Math.cos(armAngle) * size) / 2, -size / 8 + (Math.sin(armAngle) * size) / 2)
  } else {
    // Shambling animation
    const walkOffset = (Math.sin(frame * 0.15) * size) / 5

    ctx.moveTo(-size / 4, -size / 8)
    ctx.lineTo(-size / 2 - walkOffset, size / 3)

    ctx.moveTo(size / 4, -size / 8)
    ctx.lineTo(size / 2 + walkOffset, size / 3)
  }

  ctx.stroke()

  // Legs - shuffling
  ctx.beginPath()

  if (animationState === "walk") {
    // Shambling animation
    const walkOffset = (Math.sin(frame * 0.15) * size) / 8

    ctx.moveTo(-size / 6, size / 8)
    ctx.lineTo(-size / 3, size / 2 + walkOffset)

    ctx.moveTo(size / 6, size / 8)
    ctx.lineTo(size / 3, size / 2 - walkOffset)
  } else {
    // Standing
    ctx.moveTo(-size / 6, size / 8)
    ctx.lineTo(-size / 3, size / 2)

    ctx.moveTo(size / 6, size / 8)
    ctx.lineTo(size / 3, size / 2)
  }

  ctx.stroke()

  ctx.restore()
}

// Generate ghost sprite
function generateGhostSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  animationState: string,
  frame: number,
) {
  ctx.save()
  ctx.translate(x, y)

  // Make ghost semi-transparent
  ctx.globalAlpha = 0.7

  // Base ghost body (bluish white)
  ctx.fillStyle = "#B8C5D6"

  // Floating animation
  const floatOffset = Math.sin(frame * 0.1) * 5

  // Ghost body (classic ghost shape)
  ctx.beginPath()
  ctx.moveTo(-size / 2, -size / 3 + floatOffset)
  ctx.quadraticCurveTo(-size / 2, -size * 0.8 + floatOffset, 0, -size * 0.8 + floatOffset)
  ctx.quadraticCurveTo(size / 2, -size * 0.8 + floatOffset, size / 2, -size / 3 + floatOffset)
  ctx.lineTo(size / 2, size / 3 + floatOffset)

  // Wavy bottom
  ctx.quadraticCurveTo(size / 3, size / 4 + floatOffset, size / 4, size / 2 + floatOffset)
  ctx.quadraticCurveTo(size / 8, size / 3 + floatOffset, 0, size / 2 + floatOffset)
  ctx.quadraticCurveTo(-size / 8, size / 3 + floatOffset, -size / 4, size / 2 + floatOffset)
  ctx.quadraticCurveTo(-size / 3, size / 4 + floatOffset, -size / 2, size / 3 + floatOffset)

  ctx.closePath()
  ctx.fill()

  // Eyes
  ctx.fillStyle = "#000000"
  ctx.beginPath()
  ctx.arc(-size / 6, -size / 3 + floatOffset, size / 10, 0, Math.PI * 2)
  ctx.arc(size / 6, -size / 3 + floatOffset, size / 10, 0, Math.PI * 2)
  ctx.fill()

  // Mouth
  if (animationState === "attack") {
    // Attack mouth - open
    ctx.beginPath()
    ctx.arc(0, -size / 6 + floatOffset, size / 6, 0, Math.PI)
    ctx.fill()
  } else {
    // Normal mouth - small
    ctx.beginPath()
    ctx.arc(0, -size / 6 + floatOffset, size / 10, 0, Math.PI)
    ctx.fill()
  }

  // Restore opacity
  ctx.globalAlpha = 1.0
  ctx.restore()
}

// Generate necromancer sprite
function generateNecromancerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  animationState: string,
  frame: number,
) {
  ctx.save()
  ctx.translate(x, y)

  // Base necromancer body (dark purple)
  ctx.fillStyle = "#4A235A"

  // Robe
  ctx.beginPath()
  ctx.moveTo(-size / 2, -size / 4)
  ctx.lineTo(size / 2, -size / 4)
  ctx.lineTo(size / 3, size / 2)
  ctx.lineTo(-size / 3, size / 2)
  ctx.closePath()
  ctx.fill()

  // Hood
  ctx.beginPath()
  ctx.arc(0, -size / 3, size / 2.5, Math.PI, 0, true)
  ctx.lineTo(size / 2, -size / 4)
  ctx.lineTo(-size / 2, -size / 4)
  ctx.closePath()
  ctx.fill()

  // Face (dark shadow)
  ctx.fillStyle = "#000000"
  ctx.beginPath()
  ctx.arc(0, -size / 3, size / 4, 0, Math.PI * 2)
  ctx.fill()

  // Eyes (glowing purple)
  ctx.fillStyle = "#8E44AD"
  ctx.beginPath()
  ctx.arc(-size / 8, -size / 3, size / 12, 0, Math.PI * 2)
  ctx.arc(size / 8, -size / 3, size / 12, 0, Math.PI * 2)
  ctx.fill()

  // Staff
  ctx.strokeStyle = "#7D6608"
  ctx.lineWidth = 3

  if (animationState === "attack") {
    // Attack animation - raising staff
    const attackPhase = (frame % 30) / 30
    const staffAngle = Math.PI / 2 - (attackPhase * Math.PI) / 2

    ctx.beginPath()
    ctx.moveTo(size / 3, -size / 6)
    ctx.lineTo(size / 3 + Math.cos(staffAngle) * size, -size / 6 - Math.sin(staffAngle) * size)
    ctx.stroke()

    // Glowing orb on staff during attack
    const glowSize = 5 + Math.sin(frame * 0.2) * 2
    ctx.fillStyle = "#8E44AD"
    ctx.beginPath()
    ctx.arc(size / 3 + Math.cos(staffAngle) * size, -size / 6 - Math.sin(staffAngle) * size, glowSize, 0, Math.PI * 2)
    ctx.fill()

    // Magical effect
    if (attackPhase > 0.7) {
      ctx.strokeStyle = "#8E44AD"
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + frame * 0.05
        const length = size / 2 + (Math.sin(frame * 0.2) * size) / 4
        ctx.beginPath()
        ctx.moveTo(size / 3 + Math.cos(staffAngle) * size, -size / 6 - Math.sin(staffAngle) * size)
        ctx.lineTo(
          size / 3 + Math.cos(staffAngle) * size + Math.cos(angle) * length,
          -size / 6 - Math.sin(staffAngle) * size + Math.sin(angle) * length,
        )
        ctx.stroke()
      }
    }
  } else {
    // Walking animation - staff at side
    const walkOffset = (Math.sin(frame * 0.1) * size) / 10

    ctx.beginPath()
    ctx.moveTo(size / 3, -size / 6)
    ctx.lineTo(size / 3 + size / 2, size / 2 + walkOffset)
    ctx.stroke()

    // Small orb on staff
    ctx.fillStyle = "#8E44AD"
    ctx.beginPath()
    ctx.arc(size / 3 + size / 2, size / 2 + walkOffset, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}
