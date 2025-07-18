"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import type { GameObject, GameState, Player } from "./game-engine"
import { createArcherAnimationSet, SpriteAnimator } from "@/utils/sprite-animation"
import {
  generateArcherSprite,
  generatePickupSprite,
  generateWallSprite,
  generateBackgroundTile,
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

// Map game engine animation states to sprite animation states
const mapAnimationState = (state: string): string => {
  const stateMap: Record<string, string> = {
    idle: "idle",
    run: "run",
    fire: "fire",
    walk: "walk",
    attack: "attack",
    hit: "hit",
    death: "death",
    dash: "dash",
    special: "special",
  }

  return stateMap[state] || "idle"
}

export default function GameRenderer({ gameState, localPlayerId }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatorsRef = useRef<Record<string, SpriteAnimator>>({})
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const frameCountRef = useRef<number>(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const particlesRef = useRef<Particle[]>([])
  const [debugMode, setDebugMode] = useState<boolean>(false)

  // Auto-resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    // Set canvas size to match game state dimensions
    canvas.width = gameState.arenaSize.width
    canvas.height = gameState.arenaSize.height

    // Set display size to fill container
    canvas.style.width = "100%"
    canvas.style.height = "100%"
  }, [gameState.arenaSize.width, gameState.arenaSize.height])

  // Handle canvas resizing
  useEffect(() => {
    resizeCanvas()

    const handleResize = () => {
      requestAnimationFrame(resizeCanvas)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [resizeCanvas])

  // Draw background with tiles
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const tileSize = 40

    // Draw base background
    ctx.fillStyle = "#1a3300"
    ctx.fillRect(0, 0, width, height)

    // Draw tiles
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const tileType = (x + y) % 120 === 0 ? "dirt" : "grass"
        generateBackgroundTile(ctx, x, y, tileSize, tileType)
      }
    }
  }

  const drawWall = (ctx: CanvasRenderingContext2D, wall: GameObject) => {
    generateWallSprite(ctx, wall.position.x, wall.position.y, wall.size)
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, arrow: any) => {
    ctx.save()
    ctx.translate(arrow.position.x, arrow.position.y)
    ctx.rotate(arrow.rotation)

    ctx.fillStyle = arrow.isWeakShot ? "#996633" : "#D3A973"

    if (arrow.isWeakShot) {
      const pulseIntensity = Math.sin(frameCountRef.current * 0.2) * 0.3 + 0.7
      ctx.globalAlpha = pulseIntensity

      const breakProgress = Math.min(1, (arrow.distanceTraveled || 0) / 100)
      const splitDistance = breakProgress * 5
      const rotationVariance = breakProgress * 0.4

      // Draw broken arrow parts
      ctx.save()
      ctx.rotate(-rotationVariance)
      ctx.translate(0, -splitDistance)
      ctx.fillStyle = "#996633"
      ctx.fillRect(-arrow.size * 1.5, -arrow.size / 4, arrow.size * 1.5, arrow.size / 4)
      ctx.restore()

      ctx.save()
      ctx.rotate(rotationVariance)
      ctx.translate(0, splitDistance)
      ctx.fillStyle = "#996633"
      ctx.fillRect(-arrow.size * 1.5, 0, arrow.size * 1.5, arrow.size / 4)
      ctx.restore()

      ctx.globalAlpha = 1.0
    } else {
      // Regular arrow
      ctx.fillRect(-arrow.size * 1.5, -arrow.size / 4, arrow.size * 3, arrow.size / 2)

      // Arrow head
      ctx.beginPath()
      ctx.moveTo(arrow.size * 1.5, 0)
      ctx.lineTo(arrow.size * 1, -arrow.size)
      ctx.lineTo(arrow.size * 2, 0)
      ctx.lineTo(arrow.size * 1, arrow.size)
      ctx.closePath()
      ctx.fill()

      // Feathers
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

    const animationState = mapAnimationState(player.animationState)
    const frame = frameCountRef.current

    // Flip based on direction
    let flipX = false
    if (player.rotation > Math.PI / 2 || player.rotation < -Math.PI / 2) {
      flipX = true
    }

    // Draw the player sprite
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

    // Health bar
    const healthBarWidth = 40
    const healthBarHeight = 4
    const healthPercentage = player.health / 100
    const healthBarX = -healthBarWidth / 2
    const healthBarY = -48

    // Health bar background
    ctx.fillStyle = "#333333"
    ctx.fillRect(healthBarX - 1, healthBarY - 1, healthBarWidth + 2, healthBarHeight + 2)

    // Health bar fill
    const filledWidth = Math.floor(healthBarWidth * healthPercentage)
    ctx.fillStyle = healthPercentage > 0.5 ? "#00ff00" : healthPercentage > 0.25 ? "#ffff00" : "#ff0000"

    const segmentWidth = 4
    const segments = Math.floor(filledWidth / segmentWidth)
    for (let i = 0; i < segments; i++) {
      ctx.fillRect(healthBarX + i * segmentWidth, healthBarY, segmentWidth - 1, healthBarHeight)
    }

    // Player name
    ctx.fillStyle = "#000000"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(player.name, 1, -51)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(player.name, 0, -52)

    // Highlight local player
    if (isLocal) {
      const arrowSize = 10
      const arrowY = -player.size - 15

      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.moveTo(0, arrowY)
      ctx.lineTo(-arrowSize / 2, arrowY - arrowSize)
      ctx.lineTo(arrowSize / 2, arrowY - arrowSize)
      ctx.closePath()
      ctx.fill()

      const pulseSize = player.size + 5 + Math.sin(frameCountRef.current * 0.1) * 2
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, pulseSize, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()
  }

  const drawPickup = (ctx: CanvasRenderingContext2D, pickup: GameObject) => {
    generatePickupSprite(ctx, pickup.position.x, pickup.position.y, pickup.size, pickup.color, frameCountRef.current)
  }

  const drawUI = (ctx: CanvasRenderingContext2D, gameState: GameState, localPlayerId: string) => {
    // Draw remaining time
    const remainingTime = Math.max(0, gameState.maxGameTime - gameState.gameTime)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = Math.floor(remainingTime % 60)

    const timeWidth = 110
    const timeHeight = 36
    const timeX = (gameState.arenaSize.width - timeWidth) / 2
    const timeY = 10

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.beginPath()
    ctx.roundRect(timeX, timeY, timeWidth, timeHeight, 10)
    ctx.fill()

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(timeX, timeY, timeWidth, timeHeight, 10)
    ctx.stroke()

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

    // Draw scoreboard
    drawScoreboard(ctx, gameState, localPlayerId)

    // Draw game over message
    if (gameState.isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
      ctx.fillRect(0, 0, gameState.arenaSize.width, gameState.arenaSize.height)

      const gameOverWidth = 360
      const gameOverHeight = 220
      const gameOverX = (gameState.arenaSize.width - gameOverWidth) / 2
      const gameOverY = (gameState.arenaSize.height - gameOverHeight) / 2

      ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
      ctx.beginPath()
      ctx.roundRect(gameOverX, gameOverY, gameOverWidth, gameOverHeight, 20)
      ctx.fill()

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.font = "bold 32px Arial"
      ctx.textAlign = "center"
      ctx.fillText("GAME OVER", gameState.arenaSize.width / 2 + 2, gameOverY + 50 + 2)

      ctx.fillStyle = "#FFD700"
      ctx.fillText("GAME OVER", gameState.arenaSize.width / 2, gameOverY + 50)

      if (gameState.winner) {
        const winnerName = gameState.players[gameState.winner]?.name || "Unknown"

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.font = "bold 24px Arial"
        ctx.fillText(`${winnerName} WINS!`, gameState.arenaSize.width / 2 + 2, gameOverY + 100 + 2)

        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(`${winnerName} WINS!`, gameState.arenaSize.width / 2, gameOverY + 100)
      }
    }
  }

  const drawScoreboard = (ctx: CanvasRenderingContext2D, gameState: GameState, localPlayerId: string) => {
    const players = Object.values(gameState.players)
    if (players.length === 0) return

    const sortedPlayers = [...players].sort((a, b) => b.kills - a.kills)

    const scoreboardWidth = 200
    const headerHeight = 40
    const rowHeight = 30
    const scoreboardHeight = headerHeight + sortedPlayers.length * rowHeight
    const scoreboardX = gameState.arenaSize.width - scoreboardWidth - 15
    const scoreboardY = 15

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.beginPath()
    ctx.roundRect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight, 12)
    ctx.fill()

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight, 12)
    ctx.stroke()

    // Header
    ctx.fillStyle = "rgba(30, 30, 30, 0.9)"
    ctx.beginPath()
    ctx.roundRect(scoreboardX, scoreboardY, scoreboardWidth, headerHeight, {
      upperLeft: 12,
      upperRight: 12,
      lowerLeft: 0,
      lowerRight: 0,
    })
    ctx.fill()

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 18px Arial"
    ctx.textAlign = "center"
    ctx.fillText("SCOREBOARD", scoreboardX + scoreboardWidth / 2, scoreboardY + 25)

    // Player rows
    sortedPlayers.forEach((player, index) => {
      const isLocalPlayer = player.id === localPlayerId
      const rowY = scoreboardY + headerHeight + index * rowHeight

      if (isLocalPlayer) {
        ctx.fillStyle = "rgba(255, 255, 100, 0.2)"
      } else {
        ctx.fillStyle = index % 2 === 0 ? "rgba(40, 40, 40, 0.4)" : "rgba(60, 60, 60, 0.4)"
      }

      ctx.fillRect(scoreboardX, rowY, scoreboardWidth, rowHeight)

      // Rank
      ctx.fillStyle = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#FFFFFF"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${index + 1}`, scoreboardX + 20, rowY + rowHeight / 2 + 5)

      // Color indicator
      ctx.fillStyle = player.color
      ctx.beginPath()
      ctx.arc(scoreboardX + 40, rowY + rowHeight / 2, 8, 0, Math.PI * 2)
      ctx.fill()

      // Player name
      ctx.fillStyle = isLocalPlayer ? "#FFFF77" : "#FFFFFF"
      ctx.font = isLocalPlayer ? "bold 14px Arial" : "14px Arial"
      ctx.textAlign = "left"

      let displayName = player.name
      if (ctx.measureText(displayName).width > 90) {
        while (ctx.measureText(displayName + "...").width > 90 && displayName.length > 0) {
          displayName = displayName.slice(0, -1)
        }
        displayName += "..."
      }

      ctx.fillText(displayName, scoreboardX + 55, rowY + rowHeight / 2 + 5)

      // Kills
      const killsText = `${player.kills}`
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.fillText(killsText, scoreboardX + scoreboardWidth - 40, rowY + rowHeight / 2 + 5)
    })
  }

  // Add particle effect
  const addParticle = (x: number, y: number, type: string, color: string, count = 1, size = 5) => {
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
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
        const newX = particle.x + particle.vx * deltaTime
        const newY = particle.y + particle.vy * deltaTime

        let newVx = particle.vx
        let newVy = particle.vy

        if (particle.type === "hit") {
          newVx *= 0.95
          newVy *= 0.95
        } else if (particle.type === "trail") {
          newVx *= 0.9
          newVy *= 0.9
        }

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
      .filter((particle) => particle.frame < particle.maxFrames && particle.frame < 29)

    particlesRef.current = updatedParticles
    setParticles(updatedParticles)
  }

  // Initialize animators
  useEffect(() => {
    const animationSet = createArcherAnimationSet()

    Object.values(gameState.players).forEach((player) => {
      if (!animatorsRef.current[player.id]) {
        animatorsRef.current[player.id] = new SpriteAnimator(animationSet)
      }

      const animator = animatorsRef.current[player.id]

      if (animator.getCurrentAnimationName() !== player.animationState) {
        animator.play(player.animationState)

        if (player.animationState === "death" && !animator.isDeathEffectStarted()) {
          animator.setDeathEffectStarted(true)
          addParticle(player.position.x, player.position.y, "hit", "#FF5252", 20, 15)
        }
      }
    })

    Object.keys(animatorsRef.current).forEach((playerId) => {
      if (!gameState.players[playerId]) {
        delete animatorsRef.current[playerId]
      }
    })
  }, [gameState.players])

  // Animation loop
  useEffect(() => {
    const updateAnimations = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000
      lastUpdateTimeRef.current = now
      frameCountRef.current++

      Object.values(animatorsRef.current).forEach((animator) => {
        animator.update(deltaTime)
      })

      updateParticles(deltaTime)
    }

    const animationInterval = setInterval(updateAnimations, 1000 / 60)
    return () => clearInterval(animationInterval)
  }, [])

  // Particle effects
  useEffect(() => {
    Object.values(gameState.players).forEach((player) => {
      if (player.animationState === "hit") {
        addParticle(player.position.x, player.position.y, "hit", "#FF5252", 10, 10)
      } else if (player.animationState === "death") {
        addParticle(player.position.x, player.position.y, "hit", "#FF5252", 20, 15)
      }

      if (player.isDashing && frameCountRef.current % 3 === 0) {
        addParticle(player.position.x, player.position.y, "trail", player.color, 3, 8)
      }
    })

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
      if (!canvas) {
        console.error("RENDERER", "Canvas reference is null")
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("RENDERER", "Failed to get 2D context from canvas")
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      drawBackground(ctx, gameState.arenaSize.width, gameState.arenaSize.height)

      // Draw walls
      gameState.walls.forEach((wall) => {
        drawWall(ctx, wall)
      })

      // Draw pickups
      gameState.pickups.forEach((pickup) => {
        drawPickup(ctx, pickup)
      })

      // Draw death effects
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

      // Draw particles
      particles.forEach((particle) => {
        try {
          if (particle.type === "explosion") {
            ctx.fillStyle = particle.color
            const size = particle.size * (1 - particle.frame / particle.maxFrames)
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
            ctx.fill()
          } else {
            generateParticle(ctx, particle.x, particle.y, particle.size, particle.color, particle.type, particle.frame)
          }
        } catch (error) {
          console.error("Error generating particle:", error)
          particlesRef.current = particlesRef.current.filter((p) => p !== particle)
        }
      })

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        drawPlayer(ctx, player, player.id === localPlayerId)
      })

      // Draw UI
      drawUI(ctx, gameState, localPlayerId)

      // Draw debug info if enabled
      if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.beginPath()
        ctx.roundRect(10, gameState.arenaSize.height - 100, 250, 90, 8)
        ctx.fill()

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "12px Arial"
        ctx.textAlign = "left"

        const now = Date.now()
        const fps = Math.round(1000 / (now - lastUpdateTimeRef.current))
        ctx.fillText(`Frame: ${frameCountRef.current} | FPS: ${fps}`, 20, gameState.arenaSize.height - 80)
        ctx.fillText(`Particles: ${particles.length}`, 20, gameState.arenaSize.height - 60)

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
    } catch (error) {
      console.error("RENDERER", "Critical error in renderer setup", error)
    }
  }, [gameState, localPlayerId, particles, debugMode])

  // Handle canvas click for debug toggle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Toggle debug mode on click
    if (e.detail === 2) {
      // Double click
      setDebugMode(!debugMode)
    }
  }

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] game-canvas"
        width={gameState.arenaSize.width}
        height={gameState.arenaSize.height}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  )
}
