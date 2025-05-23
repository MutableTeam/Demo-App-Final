"use client"

import { useEffect, useRef, useState } from "react"
import * as PIXI from "pixi.js"
import { ArcherGameIntegration } from "@/utils/archer-game-integration"
import { textureManager } from "@/utils/rendering/texture-manager"
import { ParticleSystem, ParticleType } from "@/utils/rendering/particle-system"
import { debugManager } from "@/utils/debug-utils"
import type { GameState } from "./game-engine"

interface EnhancedGameRendererProps {
  gameState: GameState
  localPlayerId: string
  debugMode?: boolean
}

export default function EnhancedGameRenderer({
  gameState,
  localPlayerId,
  debugMode = false,
}: EnhancedGameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixiAppRef = useRef<PIXI.Application | null>(null)
  const gameIntegrationRef = useRef<ArcherGameIntegration | null>(null)
  const particleSystemRef = useRef<ParticleSystem | null>(null)
  const lastGameStateRef = useRef<GameState | null>(null)
  const playerSpritesRef = useRef<Map<string, PIXI.AnimatedSprite>>(new Map())
  const arrowSpritesRef = useRef<Map<string, PIXI.Sprite>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)
  const [showFps, setShowFps] = useState(debugMode)
  const fpsTextRef = useRef<PIXI.Text | null>(null)
  const frameCountRef = useRef(0)
  const lastFpsUpdateRef = useRef(0)

  // Initialize Pixi.js and game systems
  useEffect(() => {
    if (!canvasRef.current || pixiAppRef.current) return

    const initializeGame = async () => {
      try {
        debugManager.logInfo("RENDERER", "Initializing enhanced game renderer")

        // Create Pixi.js application
        const app = new PIXI.Application({
          view: canvasRef.current as HTMLCanvasElement,
          width: gameState.arenaSize.width,
          height: gameState.arenaSize.height,
          backgroundColor: 0x1a1a1a,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })
        pixiAppRef.current = app

        // Load textures
        await textureManager.loadGameTextures()

        // Create particle system
        const particleSystem = new ParticleSystem(app)
        particleSystem.loadTextures(textureManager.getAllTextures())
        particleSystem.start()
        particleSystemRef.current = particleSystem

        // Create game integration
        const gameIntegration = new ArcherGameIntegration(gameState.arenaSize.width, gameState.arenaSize.height)
        await gameIntegration.initialize(canvasRef.current.parentElement || document.body)
        gameIntegrationRef.current = gameIntegration

        // Create FPS counter if debug mode is enabled
        if (debugMode) {
          const fpsText = new PIXI.Text("FPS: 0", {
            fontFamily: "Arial",
            fontSize: 12,
            fill: 0xffffff,
            align: "left",
          })
          fpsText.position.set(10, 10)
          app.stage.addChild(fpsText)
          fpsTextRef.current = fpsText

          // Update FPS counter
          app.ticker.add(() => {
            frameCountRef.current++
            const now = performance.now()
            const elapsed = now - lastFpsUpdateRef.current

            if (elapsed >= 1000) {
              const fps = Math.round((frameCountRef.current * 1000) / elapsed)
              fpsText.text = `FPS: ${fps}`
              frameCountRef.current = 0
              lastFpsUpdateRef.current = now
            }
          })
        }

        // Start game loop
        gameIntegration.start()

        setIsInitialized(true)
        debugManager.logInfo("RENDERER", "Enhanced game renderer initialized successfully")
      } catch (error) {
        debugManager.logError("RENDERER", "Failed to initialize enhanced game renderer", error)
      }
    }

    initializeGame()

    // Clean up on unmount
    return () => {
      debugManager.logInfo("RENDERER", "Cleaning up enhanced game renderer")

      if (particleSystemRef.current) {
        particleSystemRef.current.destroy()
        particleSystemRef.current = null
      }

      if (gameIntegrationRef.current) {
        gameIntegrationRef.current.destroy()
        gameIntegrationRef.current = null
      }

      if (pixiAppRef.current) {
        pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true })
        pixiAppRef.current = null
      }

      playerSpritesRef.current.clear()
      arrowSpritesRef.current.clear()
    }
  }, [gameState.arenaSize.width, gameState.arenaSize.height, debugMode])

  // Update game state
  useEffect(() => {
    if (!isInitialized || !gameIntegrationRef.current || !particleSystemRef.current) return

    const gameIntegration = gameIntegrationRef.current
    const particleSystem = particleSystemRef.current
    const lastGameState = lastGameStateRef.current

    // Process players
    Object.entries(gameState.players).forEach(([playerId, player]) => {
      const lastPlayer = lastGameState?.players[playerId]

      // Check if player is new
      if (!lastPlayer) {
        // Create new player
        gameIntegration.createPlayer(playerId, player.position.x, player.position.y, {
          radius: player.size,
          color: Number.parseInt(player.color.replace("#", "0x")),
          name: player.name,
        })

        debugManager.logInfo("RENDERER", `Created player: ${playerId}`)
      } else {
        // Update existing player
        gameIntegration.movePlayer(playerId, {
          x: (player.position.x - lastPlayer.position.x) * 60, // Convert to velocity
          y: (player.position.y - lastPlayer.position.y) * 60,
        })

        // Check for animation changes
        if (player.animationState !== lastPlayer.animationState) {
          // Set appropriate animation
          switch (player.animationState) {
            case "idle":
              gameIntegration.setPlayerAnimation(playerId, "idle")
              break
            case "run":
            case "walk":
              gameIntegration.setPlayerAnimation(playerId, "run")
              break
            case "fire":
            case "attack":
              gameIntegration.setPlayerAnimation(playerId, "shoot")
              break
          }
        }

        // Check for dash effect
        if (player.isDashing && !lastPlayer.isDashing) {
          // Create dash particles
          particleSystem.emit(
            ParticleType.PLAYER_DASH,
            player.position,
            15,
            {
              x: -Math.cos(player.rotation),
              y: -Math.sin(player.rotation),
            },
            Math.PI / 6,
          )
        }

        // Check for death effect
        if (player.health <= 0 && lastPlayer.health > 0) {
          // Create death particles
          particleSystem.emit(ParticleType.PLAYER_DEATH, player.position, 30)
        }
      }
    })

    // Check for removed players
    if (lastGameState) {
      Object.keys(lastGameState.players).forEach((playerId) => {
        if (!gameState.players[playerId]) {
          // Remove player
          gameIntegration.removePlayer(playerId)
          debugManager.logInfo("RENDERER", `Removed player: ${playerId}`)
        }
      })
    }

    // Process arrows
    // First, identify new arrows
    const currentArrowIds = new Set(gameState.arrows.map((arrow) => arrow.id))
    const lastArrowIds = new Set(lastGameState?.arrows.map((arrow) => arrow.id) || [])

    // Add new arrows
    gameState.arrows.forEach((arrow) => {
      if (!lastArrowIds.has(arrow.id)) {
        // Create new arrow
        gameIntegration.createArrow(arrow.id, arrow.position.x, arrow.position.y, arrow.rotation, arrow.velocity)

        // Create arrow trail particles
        particleSystem.createEmitter(ParticleType.ARROW_TRAIL, arrow.position, {
          interval: 0.05,
          count: 1,
          followSprite: arrowSpritesRef.current.get(arrow.id) || undefined,
        })

        debugManager.logDebug("RENDERER", `Created arrow: ${arrow.id}`)
      }
    })

    // Remove old arrows
    if (lastGameState) {
      lastGameState.arrows.forEach((arrow) => {
        if (!currentArrowIds.has(arrow.id)) {
          // Create impact particles at last known position
          particleSystem.emit(ParticleType.ARROW_IMPACT, arrow.position, 10)

          // Remove arrow
          gameIntegration.removeArrow(arrow.id)
          debugManager.logDebug("RENDERER", `Removed arrow: ${arrow.id}`)
        }
      })
    }

    // Process explosions
    if (gameState.explosions && gameState.explosions.length > 0) {
      gameState.explosions.forEach((explosion) => {
        // Check if this is a new explosion
        const isNewExplosion = !lastGameState?.explosions?.some(
          (e) => e.position.x === explosion.position.x && e.position.y === explosion.position.y,
        )

        if (isNewExplosion) {
          // Create explosion particles
          particleSystem.emit(ParticleType.EXPLOSION, explosion.position, 30)
          debugManager.logDebug("RENDERER", "Created explosion effect")
        }
      })
    }

    // Update last game state reference
    lastGameStateRef.current = { ...gameState }
  }, [gameState, isInitialized])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !pixiAppRef.current || !gameIntegrationRef.current) return

      // Get container dimensions
      const container = canvasRef.current.parentElement
      if (!container) return

      // Calculate scale to fit
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const gameWidth = gameState.arenaSize.width
      const gameHeight = gameState.arenaSize.height

      // Maintain aspect ratio
      const scale = Math.min(containerWidth / gameWidth, containerHeight / gameHeight)

      // Resize renderer
      pixiAppRef.current.renderer.resize(gameWidth, gameHeight)

      // Update canvas style
      canvasRef.current.style.width = `${gameWidth * scale}px`
      canvasRef.current.style.height = `${gameHeight * scale}px`

      // Resize game integration
      gameIntegrationRef.current.resize(gameWidth, gameHeight)
    }

    // Initial resize
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [gameState.arenaSize.width, gameState.arenaSize.height])

  // Toggle debug mode
  const handleCanvasClick = () => {
    if (debugMode) {
      setShowFps((prev) => !prev)
      if (fpsTextRef.current) {
        fpsTextRef.current.visible = !showFps
      }
    }
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="block mx-auto"
        style={{ backgroundColor: "black" }}
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-bold">Loading Enhanced Renderer...</p>
          </div>
        </div>
      )}
    </div>
  )
}
