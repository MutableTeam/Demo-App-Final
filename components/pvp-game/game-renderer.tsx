"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { GameObject, GameState, Player } from "./game-engine"
import { createArcherAnimationSet, SpriteAnimator } from "@/utils/sprite-animation"
import {
  generateArcherSprite,
  generatePickupSprite,
  generateWallSprite,
  generateParticle,
  generateDeathEffect,
} from "@/utils/sprite-generator"

interface GameRendererProps {
  gameState: GameState
  localPlayerId: string
}

// Particle system interface
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  type: string
  frame: number
  maxFrames: number
}

// --- Creative Background Generation ---

// Seed for procedural generation to keep the background consistent
const backgroundSeed = 12345
let seed = backgroundSeed
const prng = () => {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Cache for pre-generated background details to improve performance
let backgroundDetails: { type: string; x: number; y: number; size: number; color?: string; rotation?: number }[] = []
let backgroundGenerated = false

const generateBackgroundDetails = (width: number, height: number) => {
  seed = backgroundSeed // Reset seed for consistency
  backgroundDetails = []

  // Generate grass details
  for (let i = 0; i < 200; i++) {
    backgroundDetails.push({
      type: "grass_blade",
      x: prng() * width,
      y: prng() * height,
      size: 2 + prng() * 3,
    })
  }

  const arenaCenterX = width / 2
  const arenaCenterY = height / 2
  const arenaRadius = Math.min(width, height) * 0.45

  // Generate rocks on the grass (outside the arena)
  for (let i = 0; i < 25; i++) {
    const x = prng() * width
    const y = prng() * height
    const dist = Math.sqrt(Math.pow(x - arenaCenterX, 2) + Math.pow(y - arenaCenterY, 2))
    if (dist > arenaRadius) {
      backgroundDetails.push({
        type: "rock",
        x,
        y,
        size: 5 + prng() * 10,
      })
    }
  }

  // Generate archery targets
  const targetPositions = [
    { x: 60, y: height / 2 },
    { x: width - 60, y: height / 2 },
    { x: width / 2, y: 60 },
  ]
  targetPositions.forEach((pos) => {
    backgroundDetails.push({
      type: "target",
      x: pos.x,
      y: pos.y,
      size: 40,
    })
  })

  backgroundGenerated = true
}

const drawCreativeBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
  if (!backgroundGenerated || width !== 1280) {
    // Re-generate if dimensions change (e.g. from old 800x600)
    generateBackgroundDetails(width, height)
  }

  // 1. Base Grass Layer
  ctx.fillStyle = "#3A5920" // Dark grass
  ctx.fillRect(0, 0, width, height)

  // Draw grass details
  backgroundDetails
    .filter((d) => d.type === "grass_blade")
    .forEach((detail) => {
      ctx.fillStyle = "#4B7F2A"
      ctx.beginPath()
      ctx.moveTo(detail.x, detail.y)
      ctx.lineTo(detail.x + detail.size / 2, detail.y - detail.size * 2)
      ctx.lineTo(detail.x + detail.size, detail.y)
      ctx.closePath()
      ctx.fill()
    })

  // 2. Stone Arena Floor (circular)
  const arenaCenterX = width / 2
  const arenaCenterY = height / 2
  const arenaRadius = Math.min(width, height) * 0.45

  ctx.save()
  ctx.beginPath()
  ctx.arc(arenaCenterX, arenaCenterY, arenaRadius, 0, Math.PI * 2)
  ctx.clip()

  // Draw stone tiles
  const stoneColor1 = "#787772"
  const stoneColor2 = "#8A8983"
  const tileSize = 60
  for (let y = 0; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      ctx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? stoneColor1 : stoneColor2
      ctx.fillRect(x, y, tileSize, tileSize)
    }
  }

  // Draw cracks on the stone
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
  ctx.lineWidth = 2
  for (let i = 0; i < 15; i++) {
    ctx.beginPath()
    const startAngle = prng() * Math.PI * 2
    const startRadius = prng() * arenaRadius
    ctx.moveTo(arenaCenterX + Math.cos(startAngle) * startRadius, arenaCenterY + Math.sin(startAngle) * startRadius)
    const endAngle = startAngle + (prng() - 0.5) * 0.5
    const endRadius = startRadius + 20 + prng() * 50
    ctx.lineTo(arenaCenterX + Math.cos(endAngle) * endRadius, arenaCenterY + Math.sin(endAngle) * endRadius)
    ctx.stroke()
  }

  ctx.restore() // remove clipping mask

  // Draw arena border
  ctx.strokeStyle = "#4A4139" // Dark stone border
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(arenaCenterX, arenaCenterY, arenaRadius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = "#6B5D50" // Lighter highlight
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(arenaCenterX, arenaCenterY, arenaRadius - 3, 0, Math.PI * 2)
  ctx.stroke()

  // 3. Draw Scenery (outside the arena)

  // Draw rocks
  backgroundDetails
    .filter((d) => d.type === "rock")
    .forEach((detail) => {
      ctx.fillStyle = "#5E5851"
      ctx.beginPath()
      ctx.arc(detail.x, detail.y, detail.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#6C665F"
      ctx.beginPath()
      ctx.arc(detail.x - detail.size * 0.2, detail.y - detail.size * 0.2, detail.size * 0.8, 0, Math.PI * 2)
      ctx.fill()
    })

  // Draw targets
  const drawTarget = (x: number, y: number, size: number) => {
    ctx.fillStyle = "#D3B88C" // Wood color
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#FF0000"
    ctx.beginPath()
    ctx.arc(x, y, size * 0.15, 0, Math.PI * 2)
    ctx.fill()
  }
  backgroundDetails
    .filter((d) => d.type === "target")
    .forEach((detail) => {
      drawTarget(detail.x, detail.y, detail.size)
    })

  // Draw Banners
  const bannerPositions = [
    { x: width * 0.25, y: 30, color: "#B32020" },
    { x: width * 0.75, y: 30, color: "#2020B3" },
    { x: width * 0.25, y: height - 30, color: "#20B320" },
    { x: width * 0.75, y: height - 30, color: "#B3B320" },
  ]
  bannerPositions.forEach((banner) => {
    ctx.fillStyle = "#654321" // Wood pole
    ctx.fillRect(banner.x - 5, banner.y - 20, 10, 40)
    ctx.fillStyle = banner.color
    ctx.beginPath()
    ctx.moveTo(banner.x, banner.y - 20)
    ctx.lineTo(banner.x + 30, banner.y - 10)
    ctx.lineTo(banner.x, banner.y)
    ctx.closePath()
    ctx.fill()
  })

  // 4. Vignette effect
  const gradient = ctx.createRadialGradient(
    arenaCenterX,
    arenaCenterY,
    arenaRadius * 0.7,
    arenaCenterX,
    arenaCenterY,
    arenaRadius * 1.2,
  )
  gradient.addColorStop(0, "rgba(0,0,0,0)")
  gradient.addColorStop(1, "rgba(0,0,0,0.3)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

// --- End of Creative Background ---

// Map game engine animation states to sprite animation states
const mapAnimationState = (state: string): string => {
  const stateMap: Record<string, string> = {
    idle: "idle",
    run: "run", // Now directly supported
    fire: "fire", // Now directly supported
    walk: "walk",
    attack: "attack",
    hit: "hit",
    death: "death",
    dash: "dash",
    special: "special",
  }

  const result = stateMap[state] || "idle" // Default to idle if unknown state
  return result
}

export default function GameRenderer({ gameState, localPlayerId }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatorsRef = useRef<Record<string, SpriteAnimator>>({})
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const frameCountRef = useRef<number>(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const particlesRef = useRef<Particle[]>([])
  const [debugMode, setDebugMode] = useState<boolean>(false)
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const lastParticleUpdateTime = useRef<number>(performance.now())

  const drawWall = (ctx: CanvasRenderingContext2D, wall: GameObject) => {
    // Use our enhanced wall sprite
    generateWallSprite(ctx, wall.position.x, wall.position.y, wall.size)
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, arrow: any) => {
    ctx.save()

    // Translate to arrow position
    ctx.translate(arrow.position.x, arrow.position.y)

    // Rotate to arrow direction
    ctx.rotate(arrow.rotation)

    // Draw arrow body
    ctx.fillStyle = arrow.isWeakShot ? "#996633" : "#D3A973" // Darker color for weak shots

    // Special visual for weak shots - arrow splitting in half
    if (arrow.isWeakShot) {
      // Add a pulsing effect to make weak shots more noticeable
      const pulseIntensity = Math.sin(frameCountRef.current * 0.2) * 0.3 + 0.7
      ctx.globalAlpha = pulseIntensity

      // Calculate the frame of the breaking animation based on distance traveled
      const breakProgress = Math.min(1, (arrow.distanceTraveled || 0) / 100)

      // Draw the broken arrow (split in half)
      const splitDistance = breakProgress * 5 // Maximum split distance
      const rotationVariance = breakProgress * 0.4 // Maximum rotation variation

      // Draw upper half of the arrow (rotated slightly upward)
      ctx.save()
      ctx.rotate(-rotationVariance)
      ctx.translate(0, -splitDistance)

      // Upper arrow half
      ctx.fillStyle = "#996633"
      ctx.fillRect(-arrow.size * 1.5, -arrow.size / 4, arrow.size * 1.5, arrow.size / 4)

      // Upper arrow head (smaller)
      ctx.beginPath()
      ctx.moveTo(0, -arrow.size / 4)
      ctx.lineTo(-arrow.size * 0.5, -arrow.size / 2)
      ctx.lineTo(arrow.size * 0, -arrow.size / 8)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Draw lower half of the arrow (rotated slightly downward)
      ctx.save()
      ctx.rotate(rotationVariance)
      ctx.translate(0, splitDistance)

      // Lower arrow half
      ctx.fillStyle = "#996633"
      ctx.fillRect(-arrow.size * 1.5, 0, arrow.size * 1.5, arrow.size / 4)

      // Lower arrow head (smaller)
      ctx.beginPath()
      ctx.moveTo(0, arrow.size / 4)
      ctx.lineTo(-arrow.size * 0.5, arrow.size / 2)
      ctx.lineTo(arrow.size * 0, arrow.size / 8)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Add small debris particles
      if (frameCountRef.current % 3 === 0) {
        for (let i = 0; i < 2; i++) {
          const particleSize = 1 + Math.random() * 2
          const particleX = -arrow.size + Math.random() * arrow.size * 3
          const particleY = (Math.random() - 0.5) * arrow.size

          ctx.fillStyle = "#AA8866"
          ctx.beginPath()
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Add small damage indicator
      ctx.save()
      ctx.rotate(-arrow.rotation)
      ctx.fillStyle = "#ff3333"
      ctx.font = "8px Arial"
      ctx.textAlign = "center"
      ctx.fillText("1", 0, -10)
      ctx.restore()

      ctx.globalAlpha = 1.0
    } else {
      // Regular arrow drawing for normal shots
      // Draw arrow shaft
      ctx.fillRect(-arrow.size * 1.5, -arrow.size / 4, arrow.size * 3, arrow.size / 2)

      // Draw arrow head
      ctx.beginPath()
      ctx.moveTo(arrow.size * 1.5, 0)
      ctx.lineTo(arrow.size * 1, -arrow.size)
      ctx.lineTo(arrow.size * 2, 0)
      ctx.lineTo(arrow.size * 1, arrow.size)
      ctx.closePath()
      ctx.fill()

      // Draw feathers
      ctx.fillStyle = "#AA8866"
      ctx.beginPath()
      ctx.moveTo(-arrow.size * 1.5, 0)
      ctx.lineTo(-arrow.size * 2, -arrow.size)
      ctx.lineTo(-arrow.size * 1.2, 0)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(-arrow.size * 1.5, 0)
      ctx.lineTo(-arrow.size * 2, arrow.size)
      ctx.lineTo(-arrow.size * 1.2, 0)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, isLocal: boolean) => {
    ctx.save()

    // Get the animator for this player
    const animator = animatorsRef.current[player.id]
    const animationState = mapAnimationState(player.animationState)

    const frame = frameCountRef.current

    // Flip based on direction
    let flipX = false
    if (player.rotation > Math.PI / 2 || player.rotation < -Math.PI / 2) {
      flipX = true
    }

    // Draw the player using our enhanced sprite
    if (flipX) {
      ctx.translate(player.position.x, player.position.y)
      ctx.scale(-1, 1)
      generateArcherSprite(ctx, 0, 0, player.size, player.color, animationState, frame, player.isDrawingBow)
    } else {
      generateArcherSprite(
        ctx,
        player.position.x,
        player.position.y,
        player.size,
        player.color,
        animationState,
        frame,
        player.isDrawingBow,
      )
    }

    ctx.restore()

    // Draw health bar and name
    drawPlayerUI(ctx, player, isLocal)
  }

  const drawPlayerUI = (ctx: CanvasRenderingContext2D, player: Player, isLocal: boolean) => {
    ctx.save()
    ctx.translate(player.position.x, player.position.y)

    // Health bar - pixelated style
    const healthBarWidth = 40
    const healthBarHeight = 4
    const healthPercentage = player.health / 100

    // Health bar position
    const healthBarX = -healthBarWidth / 2
    const healthBarY = -48 // Position above player

    // Health bar background with border
    ctx.fillStyle = "#333333"
    ctx.fillRect(healthBarX - 1, healthBarY - 1, healthBarWidth + 2, healthBarHeight + 2)

    // Health bar fill - pixelated segments
    const filledWidth = Math.floor(healthBarWidth * healthPercentage)
    ctx.fillStyle = healthPercentage > 0.5 ? "#00ff00" : healthPercentage > 0.25 ? "#ffff00" : "#ff0000"

    // Draw health as segments
    const segmentWidth = 4
    const segments = Math.floor(filledWidth / segmentWidth)
    for (let i = 0; i < segments; i++) {
      ctx.fillRect(healthBarX + i * segmentWidth, healthBarY, segmentWidth - 1, healthBarHeight)
    }

    // Draw player name with shadow
    ctx.fillStyle = "#000000"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(player.name, 1, -51)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(player.name, 0, -52)

    // Highlight local player
    if (isLocal) {
      // Draw arrow pointing to local player
      const arrowSize = 10
      const arrowY = -player.size - 15

      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.moveTo(0, arrowY)
      ctx.lineTo(-arrowSize / 2, arrowY - arrowSize)
      ctx.lineTo(arrowSize / 2, arrowY - arrowSize)
      ctx.closePath()
      ctx.fill()

      // Replaced pulsating highlight with a static one
      const staticHighlightSize = player.size + 6
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, staticHighlightSize, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw bow draw indicator when player is drawing bow
    if (player.isDrawingBow && player.drawStartTime !== null) {
      const currentTime = gameState.gameTime
      const drawTime = currentTime - player.drawStartTime
      const drawPercentage = Math.min(drawTime / player.maxDrawTime, 1)
      const minDrawPercentage = player.minDrawTime / player.maxDrawTime

      // Draw indicator below player
      const indicatorWidth = 30
      const indicatorHeight = 4
      const indicatorY = player.size + 10

      // Background
      ctx.fillStyle = "#333333"
      ctx.fillRect(-indicatorWidth / 2, indicatorY, indicatorWidth, indicatorHeight)

      // Fill based on draw percentage
      ctx.fillStyle = drawPercentage < minDrawPercentage ? "#ff3333" : drawPercentage < 0.7 ? "#ffcc33" : "#33ff33"

      ctx.fillRect(-indicatorWidth / 2, indicatorY, indicatorWidth * drawPercentage, indicatorHeight)

      // Draw minimum threshold marker
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(-indicatorWidth / 2 + indicatorWidth * minDrawPercentage - 1, indicatorY - 1, 2, indicatorHeight + 2)
    }

    // Add a special indicator for weak shot hits
    if (player.lastHitByWeakShot) {
      const indicatorY = player.position.y - player.size - 20

      ctx.fillStyle = "#ff3333"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText("-1", player.position.x, indicatorY)

      // Reset the flag after a short time
      setTimeout(() => {
        player.lastHitByWeakShot = false
      }, 500)
    }

    ctx.restore()
  }

  const drawPickup = (ctx: CanvasRenderingContext2D, pickup: GameObject) => {
    // Use our enhanced pickup sprite
    generatePickupSprite(ctx, pickup.position.x, pickup.position.y, pickup.size, pickup.color, frameCountRef.current)
  }

  const drawUI = (ctx: CanvasRenderingContext2D, gameState: GameState, localPlayerId: string) => {
    const player = gameState.players[localPlayerId]
    if (!player) return

    // Draw bow charge indicator when drawing bow
    if (player.isDrawingBow && player.drawStartTime !== null) {
      const currentTime = Date.now() / 1000
      const drawTime = currentTime - player.drawStartTime
      const drawPercentage = Math.min(drawTime / player.maxDrawTime, 1)
      const minDrawPercentage = player.minDrawTime / player.maxDrawTime

      // Position just below the timer at the top of screen
      const bowChargeWidth = 240
      const bowChargeHeight = 12
      const bowChargeX = (gameState.arenaSize.width - bowChargeWidth) / 2
      const bowChargeY = 55 // Position below timer (timer is at y=10 with height=36)

      // Draw semi-transparent background with rounded corners
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.beginPath()
      ctx.roundRect(bowChargeX - 15, bowChargeY - 8, bowChargeWidth + 30, bowChargeHeight + 16, 10)
      ctx.fill()

      // Add subtle border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(bowChargeX - 15, bowChargeY - 8, bowChargeWidth + 30, bowChargeHeight + 16, 10)
      ctx.stroke()

      // Draw charge bar background with rounded corners
      ctx.fillStyle = "#333333"
      ctx.beginPath()
      ctx.roundRect(bowChargeX, bowChargeY, bowChargeWidth, bowChargeHeight, 6)
      ctx.fill()

      // Draw charge bar fill with rounded left corner
      const chargeColor =
        drawPercentage < minDrawPercentage
          ? "rgba(255, 77, 77, 0.8)"
          : drawPercentage < 0.7
            ? "rgba(255, 204, 51, 0.8)"
            : "rgba(51, 255, 51, 0.8)"

      const fillWidth = bowChargeWidth * drawPercentage
      ctx.fillStyle = chargeColor
      ctx.beginPath()
      if (fillWidth >= bowChargeWidth) {
        // If completely filled, use rounded rect
        ctx.roundRect(bowChargeX, bowChargeY, fillWidth, bowChargeHeight, 6)
      } else {
        // Otherwise, only round the left corners
        const radius = 6
        ctx.moveTo(bowChargeX + radius, bowChargeY)
        ctx.lineTo(bowChargeX + fillWidth, bowChargeY)
        ctx.lineTo(bowChargeX + fillWidth, bowChargeY + bowChargeHeight)
        ctx.lineTo(bowChargeX + radius, bowChargeY + bowChargeHeight)
        ctx.arcTo(bowChargeX, bowChargeY + bowChargeHeight, bowChargeX, bowChargeY + bowChargeHeight - radius, radius)
        ctx.lineTo(bowChargeX, bowChargeY + radius)
        ctx.arcTo(bowChargeX, bowChargeY, bowChargeX + radius, bowChargeY, radius)
      }
      ctx.fill()

      // Draw minimum threshold marker
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.roundRect(bowChargeX + bowChargeWidth * minDrawPercentage - 1, bowChargeY - 2, 2, bowChargeHeight + 4, 1)
      ctx.fill()
    }

    // Draw remaining time (top-center)
    const remainingTime = Math.max(0, gameState.maxGameTime - gameState.gameTime)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = Math.floor(remainingTime % 60)

    // Draw time background with enhanced styling
    const timeWidth = 110
    const timeHeight = 36
    const timeX = (gameState.arenaSize.width - timeWidth) / 2
    const timeY = 10

    // Draw semi-transparent background with blur effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.beginPath()
    ctx.roundRect(timeX, timeY, timeWidth, timeHeight, 10)
    ctx.fill()

    // Add subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(timeX, timeY, timeWidth, timeHeight, 10)
    ctx.stroke()

    // Draw time text with shadow
    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.font = "bold 20px Arial"
    ctx.fillText(
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      gameState.arenaSize.width / 2 + 1,
      timeY + 24 + 1,
    )

    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      gameState.arenaSize.width / 2,
      timeY + 24,
    )

    // Draw enhanced scoreboard (top-right)
    drawEnhancedScoreboard(ctx, gameState, localPlayerId)

    // Draw game over message
    if (gameState.isGameOver) {
      // Semi-transparent overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
      ctx.fillRect(0, 0, gameState.arenaSize.width, gameState.arenaSize.height)

      // Game over panel
      const gameOverWidth = 360
      const gameOverHeight = 220
      const gameOverX = (gameState.arenaSize.width - gameOverWidth) / 2
      const gameOverY = (gameState.arenaSize.height - gameOverHeight) / 2

      // Draw panel background with blur effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
      ctx.beginPath()
      ctx.roundRect(gameOverX, gameOverY, gameOverWidth, gameOverHeight, 20)
      ctx.fill()

      // Add decorative border
      const gradient = ctx.createLinearGradient(
        gameOverX,
        gameOverY,
        gameOverX + gameOverWidth,
        gameOverY + gameOverHeight,
      )
      gradient.addColorStop(0, "rgba(255, 215, 0, 0.7)")
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.7)")
      gradient.addColorStop(1, "rgba(255, 215, 0, 0.7)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(gameOverX, gameOverY, gameOverWidth, gameOverHeight, 20)
      ctx.stroke()

      // Game over text with shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.font = "bold 32px Arial"
      ctx.textAlign = "center"
      ctx.fillText("GAME OVER", gameState.arenaSize.width / 2 + 2, gameOverY + 50 + 2)

      ctx.fillStyle = "#FFD700" // Gold color
      ctx.fillText("GAME OVER", gameState.arenaSize.width / 2, gameOverY + 50)

      if (gameState.winner) {
        const winnerName = gameState.players[gameState.winner]?.name || "Unknown"

        // Winner text with shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.font = "bold 24px Arial"
        ctx.fillText(`${winnerName} WINS!`, gameState.arenaSize.width / 2 + 2, gameOverY + 100 + 2)

        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(`${winnerName} WINS!`, gameState.arenaSize.width / 2, gameOverY + 100)

        // Add winner stats
        const winner = gameState.players[gameState.winner]
        if (winner) {
          // Draw stats with shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
          ctx.font = "18px Arial"
          ctx.fillText(
            `Kills: ${winner.kills} | Score: ${winner.score}`,
            gameState.arenaSize.width / 2 + 1,
            gameOverY + 140 + 1,
          )

          ctx.fillStyle = "#CCCCCC"
          ctx.fillText(
            `Kills: ${winner.kills} | Score: ${winner.score}`,
            gameState.arenaSize.width / 2,
            gameOverY + 140,
          )

          // Draw a trophy icon
          drawTrophy(ctx, gameState.arenaSize.width / 2 - 15, gameOverY + 180, 30)
        }
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.font = "bold 24px Arial"
        ctx.fillText("DRAW!", gameState.arenaSize.width / 2 + 2, gameOverY + 100 + 2)

        ctx.fillStyle = "#FFFFFF"
        ctx.fillText("DRAW!", gameState.arenaSize.width / 2, gameOverY + 100)
      }
    }
  }

  // Helper function to draw a trophy icon
  const drawTrophy = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Trophy cup
    ctx.fillStyle = "#FFD700" // Gold color

    // Cup body
    ctx.beginPath()
    ctx.moveTo(x - size / 3, y - size / 2)
    ctx.lineTo(x + size / 3, y - size / 2)
    ctx.lineTo(x + size / 4, y)
    ctx.lineTo(x - size / 4, y)
    ctx.closePath()
    ctx.fill()

    // Cup handles
    ctx.beginPath()
    ctx.arc(x - size / 3, y - size / 3, size / 6, Math.PI / 2, (3 * Math.PI) / 2, false)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x + size / 3, y - size / 3, size / 6, -Math.PI / 2, Math.PI / 2, false)
    ctx.fill()

    // Base
    ctx.fillStyle = "#FFD700"
    ctx.beginPath()
    ctx.moveTo(x - size / 6, y)
    ctx.lineTo(x + size / 6, y)
    ctx.lineTo(x + size / 8, y + size / 3)
    ctx.lineTo(x - size / 8, y + size / 3)
    ctx.closePath()
    ctx.fill()

    // Stand
    ctx.fillStyle = "#FFD700"
    ctx.beginPath()
    ctx.moveTo(x - size / 4, y + size / 3)
    ctx.lineTo(x + size / 4, y + size / 3)
    ctx.lineTo(x + size / 4, y + size / 2.5)
    ctx.lineTo(x - size / 4, y + size / 2.5)
    ctx.closePath()
    ctx.fill()
  }

  // Draw explosions
  const drawExplosions = (ctx: CanvasRenderingContext2D) => {
    if (!gameState.explosions) return

    gameState.explosions.forEach((explosion) => {
      const progress = explosion.time / explosion.maxTime
      const radius = explosion.radius * (1 - Math.pow(progress - 1, 2)) // Easing function for size

      // Create gradient for explosion
      const gradient = ctx.createRadialGradient(
        explosion.position.x,
        explosion.position.y,
        0,
        explosion.position.x,
        explosion.position.y,
        radius,
      )

      // Colors based on progress
      const alpha = 1 - progress
      gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`) // Yellow core
      gradient.addColorStop(0.4, `rgba(255, 100, 50, ${alpha * 0.8})`) // Orange mid
      gradient.addColorStop(1, `rgba(100, 0, 0, ${alpha * 0.1})`) // Dark red edge

      // Draw explosion circle
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(explosion.position.x, explosion.position.y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Add some particles for more effect
      if (frameCountRef.current % 2 === 0) {
        const particleCount = Math.floor(10 * (1 - progress)) // Fewer particles as explosion fades
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * radius * 0.8
          const particleX = explosion.position.x + Math.cos(angle) * distance
          const particleY = explosion.position.y + Math.sin(angle) * distance

          // Add particle to the system
          addParticle(particleX, particleY, "explosion", "#FF5722", 1, 3 + Math.random() * 3)
        }
      }
    })
  }

  // Enhanced scoreboard
  const drawEnhancedScoreboard = (ctx: CanvasRenderingContext2D, gameState: GameState, localPlayerId: string) => {
    const players = Object.values(gameState.players)
    if (players.length === 0) return

    // Sort players by kills (descending)
    const sortedPlayers = [...players].sort((a, b) => b.kills - a.kills)

    // Draw scoreboard in top-right corner
    const scoreboardWidth = 200
    const headerHeight = 40
    const rowHeight = 30
    const scoreboardHeight = headerHeight + sortedPlayers.length * rowHeight
    const scoreboardX = gameState.arenaSize.width - scoreboardWidth - 15
    const scoreboardY = 15

    // Draw semi-transparent background with blur effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.beginPath()
    ctx.roundRect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight, 12)
    ctx.fill()

    // Add subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight, 12)
    ctx.stroke()

    // Draw header
    const gradient = ctx.createLinearGradient(
      scoreboardX,
      scoreboardY,
      scoreboardX + scoreboardWidth,
      scoreboardY + headerHeight,
    )
    gradient.addColorStop(0, "rgba(30, 30, 30, 0.9)")
    gradient.addColorStop(1, "rgba(60, 60, 60, 0.9)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(scoreboardX, scoreboardY, scoreboardWidth, headerHeight, {
      upperLeft: 12,
      upperRight: 12,
      lowerLeft: 0,
      lowerRight: 0,
    })
    ctx.fill()

    // Draw header text with shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.font = "bold 18px Arial"
    ctx.textAlign = "center"
    ctx.fillText("SCOREBOARD", scoreboardX + scoreboardWidth / 2 + 1, scoreboardY + 25 + 1)

    ctx.fillStyle = "#FFFFFF"
    ctx.fillText("SCOREBOARD", scoreboardX + scoreboardWidth / 2, scoreboardY + 25)

    // Draw separator line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.beginPath()
    ctx.moveTo(scoreboardX, scoreboardY + headerHeight)
    ctx.lineTo(scoreboardX + scoreboardWidth, scoreboardY + headerHeight)
    ctx.stroke()

    // Draw player scores with alternating row backgrounds
    sortedPlayers.forEach((player, index) => {
      const isLocalPlayer = player.id === localPlayerId
      const rowY = scoreboardY + headerHeight + index * rowHeight

      // Draw row background
      if (isLocalPlayer) {
        // Highlight local player
        ctx.fillStyle = "rgba(255, 255, 100, 0.2)"
      } else {
        // Alternating row colors
        ctx.fillStyle = index % 2 === 0 ? "rgba(40, 40, 40, 0.4)" : "rgba(60, 60, 60, 0.4)"
      }

      ctx.beginPath()
      if (index === sortedPlayers.length - 1) {
        // Last row gets rounded bottom corners
        ctx.roundRect(scoreboardX, rowY, scoreboardWidth, rowHeight, {
          upperLeft: 0,
          upperRight: 0,
          lowerLeft: 12,
          lowerRight: 12,
        })
      } else {
        // Regular rows
        ctx.rect(scoreboardX, rowY, scoreboardWidth, rowHeight)
      }
      ctx.fill()

      // Draw rank number (1st, 2nd, 3rd, etc.)
      ctx.fillStyle = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#FFFFFF"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${index + 1}`, scoreboardX + 20, rowY + rowHeight / 2 + 5)

      // Draw color indicator (circle)
      ctx.fillStyle = player.color
      ctx.beginPath()
      ctx.arc(scoreboardX + 40, rowY + rowHeight / 2, 8, 0, Math.PI * 2)
      ctx.fill()

      // Add stroke to color indicator
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw player name
      ctx.fillStyle = isLocalPlayer ? "#FFFF77" : "#FFFFFF"
      ctx.font = isLocalPlayer ? "bold 14px Arial" : "14px Arial"
      ctx.textAlign = "left"

      // Truncate long names
      let displayName = player.name
      if (ctx.measureText(displayName).width > 90) {
        // Truncate and add ellipsis
        while (ctx.measureText(displayName + "...").width > 90 && displayName.length > 0) {
          displayName = displayName.slice(0, -1)
        }
        displayName += "..."
      }

      ctx.fillText(displayName, scoreboardX + 55, rowY + rowHeight / 2 + 5)

      // Draw kills with background pill
      const killsText = `${player.kills}`
      const killsWidth = ctx.measureText(killsText).width + 16

      // Draw pill background
      ctx.fillStyle = "rgba(80, 80, 80, 0.6)"
      ctx.beginPath()
      ctx.roundRect(scoreboardX + scoreboardWidth - 40 - killsWidth / 2, rowY + rowHeight / 2 - 10, killsWidth, 20, 10)
      ctx.fill()

      // Draw kills text
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.fillText(killsText, scoreboardX + scoreboardWidth - 40, rowY + rowHeight / 2 + 5)
    })
  }

  // Draw debug information
  const drawDebugInfo = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    // Draw semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.beginPath()
    ctx.roundRect(10, gameState.arenaSize.height - 100, 250, 90, 8)
    ctx.fill()

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "12px Arial"
    ctx.textAlign = "left"

    // Display frame count and FPS
    const now = Date.now()
    const fps = Math.round(1000 / (now - lastUpdateTimeRef.current))
    ctx.fillText(`Frame: ${frameCountRef.current} | FPS: ${fps}`, 20, gameState.arenaSize.height - 80)

    // Display particle count
    ctx.fillText(`Particles: ${particles.length}`, 20, gameState.arenaSize.height - 60)

    // Display local player info
    const player = gameState.players[localPlayerId]
    if (player) {
      ctx.fillText(
        `Position: (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`,
        20,
        gameState.arenaSize.height - 40,
      )
      ctx.fillText(
        `Animation: ${player.animationState} | Rotation: ${player.rotation.toFixed(2)}`,
        20,
        gameState.arenaSize.height - 20,
      )
    }
  }

  // Effect to pre-render the background to an offscreen canvas for performance
  useEffect(() => {
    const { width, height } = gameState.arenaSize
    if (width > 0 && height > 0) {
      const bgCanvas = document.createElement("canvas")
      bgCanvas.width = width
      bgCanvas.height = height
      const bgCtx = bgCanvas.getContext("2d")
      if (bgCtx) {
        drawCreativeBackground(bgCtx, width, height)
        backgroundCanvasRef.current = bgCanvas
      }
    }
  }, [gameState.arenaSize])

  // Initialize animators for each player
  useEffect(() => {
    // Create animation set once
    const animationSet = createArcherAnimationSet()

    // Create or update animators for each player
    Object.values(gameState.players).forEach((player) => {
      if (!animatorsRef.current[player.id]) {
        animatorsRef.current[player.id] = new SpriteAnimator(animationSet)
      }

      // Update animator state based on player state
      const animator = animatorsRef.current[player.id]

      // Only change animation if the player's state has changed
      if (animator.getCurrentAnimationName() !== player.animationState) {
        animator.play(player.animationState)

        // Add death effect when player dies
        if (player.animationState === "death" && !animator.isDeathEffectStarted()) {
          animator.setDeathEffectStarted(true)
          addParticle(player.position.x, player.position.y, "hit", "#FF5252", 20, 15)
        }
      }
    })

    // Clean up animators for removed players
    Object.keys(animatorsRef.current).forEach((playerId) => {
      if (!gameState.players[playerId]) {
        delete animatorsRef.current[playerId]
      }
    })
  }, [gameState.players])

  // Animation loop for particles
  useEffect(() => {
    const animateParticles = (now: number) => {
      const deltaTime = (now - lastParticleUpdateTime.current) / 1000
      lastParticleUpdateTime.current = now

      updateParticles(deltaTime)

      animationFrameId.current = requestAnimationFrame(animateParticles)
    }

    animationFrameId.current = requestAnimationFrame(animateParticles)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, []) // Run this effect only once

  // Handle container resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Maintain the game's aspect ratio while fitting in container
      const container = canvas.parentElement
      if (!container) return

      // Get the container dimensions
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Set canvas style dimensions for display scaling
      // (while keeping the internal canvas dimensions for game logic)
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.maxWidth = `${gameState.arenaSize.width}px`
      canvas.style.maxHeight = `${gameState.arenaSize.height}px`
      canvas.style.objectFit = "contain"
    }

    // Initial sizing
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [gameState.arenaSize.width, gameState.arenaSize.height])

  // Add particle effect
  const addParticle = (x: number, y: number, type: string, color: string, count = 1, size = 5) => {
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      // Calculate random velocity
      const speed = 20 + Math.random() * 30
      const angle = Math.random() * Math.PI * 2

      newParticles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size * (0.8 + Math.random() * 0.4),
        color,
        type,
        frame: 0,
        // Ensure maxFrames is always less than what would cause negative radius
        maxFrames: 25 + Math.floor(Math.random() * 5),
      })
    }

    particlesRef.current = [...particlesRef.current, ...newParticles]
    setParticles(particlesRef.current)
  }

  // Update particles
  const updateParticles = (deltaTime: number) => {
    if (particlesRef.current.length === 0) return

    const updatedParticles = particlesRef.current
      .map((particle) => {
        // Update position
        const newX = particle.x + particle.vx * deltaTime
        const newY = particle.y + particle.vy * deltaTime

        // Apply gravity and friction for some particle types
        let newVx = particle.vx
        let newVy = particle.vy

        if (particle.type === "hit") {
          newVx *= 0.98 // Slower decay
          newVy *= 0.98
          newVy += 50 * deltaTime // Gravity
        } else if (particle.type === "trail") {
          newVx *= 0.85
          newVy *= 0.85
        }

        // Increment frame
        const newFrame = particle.frame + 1

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          frame: newFrame,
        }
      })
      // Filter out old particles
      .filter((particle) => particle.frame < particle.maxFrames)

    particlesRef.current = updatedParticles
    setParticles(updatedParticles)
  }

  // Check for events that should trigger particles
  useEffect(() => {
    // Add hit particles when a player is hit
    Object.values(gameState.players).forEach((player) => {
      if (player.animationState === "hit") {
        addParticle(player.position.x, player.position.y, "hit", "#FF5252", 10, 10)
      } else if (player.animationState === "death") {
        addParticle(player.position.x, player.position.y, "hit", "#FF5252", 20, 15)
      }

      // Add movement trail for dashing players
      if (player.isDashing && frameCountRef.current % 3 === 0) {
        addParticle(player.position.x, player.position.y, "trail", player.color, 3, 8)
      }
    })

    // Add sparkle particles for arrows
    gameState.arrows.forEach((arrow) => {
      if (frameCountRef.current % 5 === 0) {
        addParticle(arrow.position.x, arrow.position.y, "trail", "#D3A973", 1, 3)
      }
    })
  }, [gameState])

  // Main render function
  useEffect(() => {
    try {
      const canvas = canvasRef.current
      const bgCanvas = backgroundCanvasRef.current
      if (!canvas || !bgCanvas) return

      // Set canvas dimensions
      try {
        canvas.width = gameState.arenaSize.width
        canvas.height = gameState.arenaSize.height
      } catch (error) {
        console.error("RENDERER", "Error setting canvas dimensions", error)
        return
      }

      // Get rendering context
      let ctx
      try {
        ctx = canvas.getContext("2d")
        if (!ctx) {
          console.error("RENDERER", "Failed to get 2D context from canvas")
          return
        }
      } catch (error) {
        console.error("RENDERER", "Error getting canvas context", error)
        return
      }

      // Clear and draw background from cache
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bgCanvas, 0, 0)

      // Draw walls
      gameState.walls.forEach((wall) => {
        drawWall(ctx, wall)
      })

      // Draw pickups
      gameState.pickups.forEach((pickup) => {
        drawPickup(ctx, pickup)
      })

      // Draw death effects first (so they appear under players)
      Object.values(gameState.players).forEach((player) => {
        const animator = animatorsRef.current[player.id]
        if (animator && animator.getCurrentAnimationName() === "death" && animator.isDeathEffectStarted()) {
          generateDeathEffect(
            ctx,
            player.position.x,
            player.position.y,
            player.size,
            player.color,
            frameCountRef.current,
          )
        }
      })

      // Draw arrows
      gameState.arrows.forEach((arrow) => {
        drawArrow(ctx, arrow)
      })

      // Draw explosions
      drawExplosions(ctx)

      // Draw particles
      particles.forEach((particle) => {
        try {
          if (particle.type === "explosion") {
            // Draw explosion particle
            ctx.fillStyle = particle.color
            const size = particle.size * (1 - particle.frame / particle.maxFrames)
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
            ctx.fill()
          } else {
            // Wrap particle generation in try/catch to prevent errors from crashing the game
            generateParticle(ctx, particle.x, particle.y, particle.size, particle.color, particle.type, particle.frame)
          }
        } catch (error) {
          console.error("Error generating particle:", error)
          // Remove problematic particle
          particlesRef.current = particlesRef.current.filter((p) => p !== particle)
        }
      })

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        drawPlayer(ctx, player, player.id === localPlayerId)
      })

      // Draw UI (only essential elements - no ability indicators)
      drawUI(ctx, gameState, localPlayerId)

      // Draw debug info if enabled
      if (debugMode) {
        drawDebugInfo(ctx, gameState)
      }
    } catch (error) {
      console.error("RENDERER", "Critical error in renderer setup", error)
    }
  }, [gameState, localPlayerId, particles, debugMode])

  // Handle click on debug button
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if debug button was clicked
    if (
      x >= gameState.arenaSize.width - 110 &&
      x <= gameState.arenaSize.width - 10 &&
      y >= gameState.arenaSize.height - 40 &&
      y <= gameState.arenaSize.height - 10
    ) {
      setDebugMode(!debugMode)
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] game-canvas"
        width={gameState.arenaSize.width}
        height={gameState.arenaSize.height}
        onClick={handleCanvasClick}
      />
    </div>
  )
}
