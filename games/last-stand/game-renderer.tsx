"use client"

import { useEffect, useRef } from "react"
import type { LastStandGameState, Enemy, Player, Arrow } from "./game-state"
import { generateEnemySprite } from "@/utils/enemy-sprite-generator"
import { generateArcherSprite, generateBackgroundTile } from "@/utils/sprite-generator"
import { createArcherAnimationSet, SpriteAnimator } from "@/utils/sprite-animation"

interface LastStandRendererProps {
  gameState: LastStandGameState
}

export default function LastStandRenderer({ gameState }: LastStandRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameCountRef = useRef<number>(0)
  const animatorsRef = useRef<Record<string, SpriteAnimator>>({})
  const enemyAnimatorsRef = useRef<Record<string, SpriteAnimator>>({})
  const lastUpdateTimeRef = useRef<number>(Date.now())

  // Initialize animators
  useEffect(() => {
    // Create animation set for player
    const playerAnimationSet = createArcherAnimationSet()

    // Create or update player animator
    if (!animatorsRef.current[gameState.player.id]) {
      animatorsRef.current[gameState.player.id] = new SpriteAnimator(playerAnimationSet)
    }

    // Update animator state based on player state
    const animator = animatorsRef.current[gameState.player.id]

    // Only change animation if the player's state has changed
    if (animator.getCurrentAnimationName() !== gameState.player.animationState) {
      animator.play(gameState.player.animationState)
    }

    // Create or update enemy animators
    gameState.enemies.forEach((enemy) => {
      if (!enemyAnimatorsRef.current[enemy.id]) {
        const enemyAnimationSet = createArcherAnimationSet() // We can use the same animations for now
        enemyAnimatorsRef.current[enemy.id] = new SpriteAnimator(enemyAnimationSet)
      }

      // Update animator state based on enemy state
      const enemyAnimator = enemyAnimatorsRef.current[enemy.id]

      // Only change animation if the enemy's state has changed
      if (enemyAnimator.getCurrentAnimationName() !== enemy.animationState) {
        enemyAnimator.play(enemy.animationState)
      }
    })

    // Clean up animators for removed enemies
    Object.keys(enemyAnimatorsRef.current).forEach((enemyId) => {
      if (!gameState.enemies.find((e) => e.id === enemyId)) {
        delete enemyAnimatorsRef.current[enemyId]
      }
    })
  }, [gameState.player.animationState, gameState.enemies])

  // Animation loop
  useEffect(() => {
    const updateAnimations = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000
      lastUpdateTimeRef.current = now
      frameCountRef.current++

      // Update all animators
      Object.values(animatorsRef.current).forEach((animator) => {
        animator.update(deltaTime)
      })

      Object.values(enemyAnimatorsRef.current).forEach((animator) => {
        animator.update(deltaTime)
      })
    }

    const animationInterval = setInterval(updateAnimations, 1000 / 60) // 60 FPS

    return () => clearInterval(animationInterval)
  }, [])

  // Main render function
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = gameState.arenaSize.width
    canvas.height = gameState.arenaSize.height

    // Get rendering context
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw background
    drawBackground(ctx, gameState.arenaSize.width, gameState.arenaSize.height)

    // Draw arrows
    gameState.arrows.forEach((arrow) => {
      drawArrow(ctx, arrow)
    })

    // Draw enemies
    gameState.enemies.forEach((enemy) => {
      drawEnemy(ctx, enemy, frameCountRef.current)
    })

    // Draw player
    drawPlayer(ctx, gameState.player, frameCountRef.current)
  }, [gameState])

  // Draw background with tiles
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const tileSize = 40

    // Draw base background (darker for undead theme)
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, width, height)

    // Draw tiles
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        // Use a deterministic pattern based on position
        const tileType = (x + y) % 120 === 0 ? "graveyard" : "darkgrass"
        generateBackgroundTile(ctx, x, y, tileSize, tileType)
      }
    }

    // Add some fog effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 20 + Math.random() * 30

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Draw player
  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, frame: number) => {
    ctx.save()

    // Get the animator for this player
    const animator = animatorsRef.current[player.id]
    const animationState = player.animationState

    // Flip based on direction
    let flipX = false
    if (player.rotation > Math.PI / 2 || player.rotation < -Math.PI / 2) {
      flipX = true
    }

    // If player is invulnerable, make them flash
    if (player.isInvulnerable && frame % 4 < 2) {
      ctx.globalAlpha = 0.5
    }

    // Draw the player using our sprite generator
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

    // Draw health bar
    drawHealthBar(ctx, player.position.x, player.position.y - player.size - 10, player.health, player.maxHealth, 40, 4)

    // Draw bow charge indicator when player is drawing bow
    if (player.isDrawingBow && player.drawStartTime !== null) {
      const currentTime = Date.now() / 1000
      const drawTime = currentTime - player.drawStartTime
      const drawPercentage = Math.min(drawTime / player.maxDrawTime, 1)
      const minDrawPercentage = player.minDrawTime / player.maxDrawTime

      // Position below player
      const indicatorWidth = 30
      const indicatorHeight = 4
      const indicatorY = player.position.y + player.size + 10

      // Background
      ctx.fillStyle = "#333333"
      ctx.fillRect(player.position.x - indicatorWidth / 2, indicatorY, indicatorWidth, indicatorHeight)

      // Fill based on draw percentage
      ctx.fillStyle = drawPercentage < minDrawPercentage ? "#ff3333" : drawPercentage < 0.7 ? "#ffcc33" : "#33ff33"
      ctx.fillRect(player.position.x - indicatorWidth / 2, indicatorY, indicatorWidth * drawPercentage, indicatorHeight)

      // Draw minimum threshold marker
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(
        player.position.x - indicatorWidth / 2 + indicatorWidth * minDrawPercentage - 1,
        indicatorY - 1,
        2,
        indicatorHeight + 2,
      )
    }

    // Draw cooldown indicators
    if (player.dashCooldown > 0) {
      drawCooldownIndicator(
        ctx,
        player.position.x - 20,
        player.position.y + player.size + 20,
        "DASH",
        player.dashCooldown / 1.5,
      )
    }

    if (player.specialAttackCooldown > 0) {
      drawCooldownIndicator(
        ctx,
        player.position.x + 20,
        player.position.y + player.size + 20,
        "SPECIAL",
        player.specialAttackCooldown / 5,
      )
    }
  }

  // Draw enemy
  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy, frame: number) => {
    ctx.save()

    // Get the animator for this enemy
    const animator = enemyAnimatorsRef.current[enemy.id]
    const animationState = enemy.animationState

    // Flip based on direction
    let flipX = false
    if (enemy.rotation > Math.PI / 2 || enemy.rotation < -Math.PI / 2) {
      flipX = true
    }

    // Draw the enemy using our sprite generator
    if (flipX) {
      ctx.translate(enemy.position.x, enemy.position.y)
      ctx.scale(-1, 1)
      generateEnemySprite(ctx, 0, 0, enemy.size, enemy.type, animationState, frame)
    } else {
      generateEnemySprite(ctx, enemy.position.x, enemy.position.y, enemy.size, enemy.type, animationState, frame)
    }

    ctx.restore()

    // Draw health bar
    drawHealthBar(ctx, enemy.position.x, enemy.position.y - enemy.size - 10, enemy.health, enemy.maxHealth, 30, 3)
  }

  // Draw arrow
  const drawArrow = (ctx: CanvasRenderingContext2D, arrow: Arrow) => {
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

  // Draw health bar
  const drawHealthBar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    health: number,
    maxHealth: number,
    width: number,
    height: number,
  ) => {
    const healthPercentage = health / maxHealth

    // Background
    ctx.fillStyle = "#333333"
    ctx.fillRect(x - width / 2, y, width, height)

    // Health fill
    ctx.fillStyle = healthPercentage > 0.6 ? "#4CAF50" : healthPercentage > 0.3 ? "#FFC107" : "#F44336"
    ctx.fillRect(x - width / 2, y, width * healthPercentage, height)

    // Border
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 1
    ctx.strokeRect(x - width / 2, y, width, height)
  }

  // Draw cooldown indicator
  const drawCooldownIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    percentage: number,
  ) => {
    const radius = 12

    // Background circle
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Cooldown fill (clockwise from top)
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + (1 - percentage) * Math.PI * 2)
    ctx.closePath()
    ctx.fill()

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.stroke()

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.font = "8px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(label, x, y)
  }

  return <canvas ref={canvasRef} width={800} height={600} className="w-full h-full rounded-lg" />
}
