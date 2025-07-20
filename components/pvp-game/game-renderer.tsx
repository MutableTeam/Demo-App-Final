"use client"
import { useEffect, useRef } from "react"
import type { GameState } from "./game-engine"
import { createArcherAnimationSet, SpriteAnimator } from "@/utils/sprite-animation"
import { generateParticle } from "@/utils/sprite-generator"

interface GameRendererProps {
  gameState: GameState
  localPlayerId: string
  debugMode?: boolean
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

export default function GameRenderer({ gameState, localPlayerId, debugMode = false }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatorsRef = useRef<Record<string, SpriteAnimator>>({})
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const frameCountRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()

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

      // Update particles
      updateParticles(deltaTime)
    }

    animationFrameRef.current = requestAnimationFrame(updateAnimations)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

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
          newVx *= 0.95 // Apply friction
          newVy *= 0.95
        } else if (particle.type === "trail") {
          newVx *= 0.9
          newVy *= 0.9
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
      // Ensure particles are removed before they cause negative radius
      .filter((particle) => particle.frame < particle.maxFrames && particle.frame < 29)

    particlesRef.current = updatedParticles
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
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Clear canvas with a dark green background
      ctx.fillStyle = "#1a2a1a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw players
      Object.values(gameState.players).forEach((player) => {
        if (!player || player.health <= 0) return
        ctx.save()
        ctx.translate(player.position.x, player.position.y)
        ctx.rotate(player.rotation)
        ctx.fillStyle = player.color
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(player.size, 0)
        ctx.stroke()
        ctx.restore()
      })

      // Draw arrows
      if (gameState.arrows) {
        gameState.arrows.forEach((arrow) => {
          ctx.save()
          ctx.translate(arrow.position.x, arrow.position.y)
          ctx.rotate(arrow.rotation)
          ctx.fillStyle = arrow.color || "#ffff00"
          ctx.fillRect(-8, -1, 16, 2)
          ctx.restore()
        })
      }

      // Draw walls
      if (gameState.walls) {
        ctx.fillStyle = "#666666"
        gameState.walls.forEach((wall) => {
          ctx.fillRect(wall.position.x, wall.position.y, wall.width, wall.height)
        })
      }

      // Draw particles
      particlesRef.current.forEach((particle) => {
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

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="absolute top-0 left-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
