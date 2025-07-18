"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Crosshair,
  Heart,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/contexts/platform-context"
import { useGameContext } from "@/contexts/game-context"
import MobileOptimizedContainer from "@/components/mobile-optimized-container"

interface GameStats {
  score: number
  health: number
  ammo: number
  level: number
  enemies: number
  accuracy: number
}

interface GameComponentProps {
  gameId: string
}

export default function TopDownShooterGame({ gameId }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ x: 0, y: 0, pressed: false })
  const touchRef = useRef({ x: 0, y: 0, active: false })

  const { platformType } = usePlatform()
  const { setGameStatus, setGameScore, setGameTimeRemaining } = useGameContext()
  const isMobile = platformType === "mobile"

  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameOver">("menu")
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    health: 100,
    ammo: 30,
    level: 1,
    enemies: 0,
    accuracy: 100,
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Game objects
  const [player, setPlayer] = useState({ x: 400, y: 300, angle: 0, speed: 5 })
  const [bullets, setBullets] = useState<Array<{ x: number; y: number; dx: number; dy: number; id: number }>>([])
  const [enemies, setEnemies] = useState<Array<{ x: number; y: number; health: number; id: number }>>([])

  // Touch controls state
  const [touchControls, setTouchControls] = useState({
    moveStick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0 },
    aimStick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0 },
    shooting: false,
  })

  // Initialize game
  const initGame = useCallback(() => {
    setPlayer({ x: 400, y: 300, angle: 0, speed: 5 })
    setBullets([])
    setEnemies([])
    setGameStats({
      score: 0,
      health: 100,
      ammo: 30,
      level: 1,
      enemies: 0,
      accuracy: 100,
    })
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Handle input
    let moveX = 0,
      moveY = 0

    if (isMobile) {
      // Mobile touch controls
      if (touchControls.moveStick.active) {
        const deltaX = touchControls.moveStick.x - touchControls.moveStick.centerX
        const deltaY = touchControls.moveStick.y - touchControls.moveStick.centerY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const maxDistance = 50

        if (distance > 5) {
          moveX = (deltaX / maxDistance) * player.speed
          moveY = (deltaY / maxDistance) * player.speed
        }
      }

      if (touchControls.aimStick.active) {
        const deltaX = touchControls.aimStick.x - touchControls.aimStick.centerX
        const deltaY = touchControls.aimStick.y - touchControls.aimStick.centerY
        const angle = Math.atan2(deltaY, deltaX)
        setPlayer((prev) => ({ ...prev, angle }))
      }
    } else {
      // Desktop keyboard controls
      if (keysRef.current.has("w") || keysRef.current.has("ArrowUp")) moveY = -player.speed
      if (keysRef.current.has("s") || keysRef.current.has("ArrowDown")) moveY = player.speed
      if (keysRef.current.has("a") || keysRef.current.has("ArrowLeft")) moveX = -player.speed
      if (keysRef.current.has("d") || keysRef.current.has("ArrowRight")) moveX = player.speed
    }

    // Update player position
    setPlayer((prev) => ({
      ...prev,
      x: Math.max(20, Math.min(canvas.width - 20, prev.x + moveX)),
      y: Math.max(20, Math.min(canvas.height - 20, prev.y + moveY)),
    }))

    // Draw player
    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.rotate(player.angle)
    ctx.fillStyle = "#00ff00"
    ctx.fillRect(-10, -10, 20, 20)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(8, -2, 8, 4)
    ctx.restore()

    // Update and draw bullets
    setBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.dx,
          y: bullet.y + bullet.dy,
        }))
        .filter((bullet) => bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height),
    )

    bullets.forEach((bullet) => {
      ctx.fillStyle = "#ffff00"
      ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4)
    })

    // Spawn enemies
    if (enemies.length < 5 && Math.random() < 0.02) {
      const side = Math.floor(Math.random() * 4)
      let x, y
      switch (side) {
        case 0:
          x = Math.random() * canvas.width
          y = 0
          break
        case 1:
          x = canvas.width
          y = Math.random() * canvas.height
          break
        case 2:
          x = Math.random() * canvas.width
          y = canvas.height
          break
        default:
          x = 0
          y = Math.random() * canvas.height
          break
      }
      setEnemies((prev) => [...prev, { x, y, health: 100, id: Date.now() }])
    }

    // Update and draw enemies
    setEnemies((prev) =>
      prev.map((enemy) => {
        const dx = player.x - enemy.x
        const dy = player.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const speed = 1

        return {
          ...enemy,
          x: enemy.x + (dx / distance) * speed,
          y: enemy.y + (dy / distance) * speed,
        }
      }),
    )

    enemies.forEach((enemy) => {
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(enemy.x - 8, enemy.y - 8, 16, 16)
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, player, bullets, enemies, touchControls, isMobile])

  // Event handlers
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isMobile) return
      keysRef.current.add(e.key.toLowerCase())

      if (e.key === " " && gameStats.ammo > 0) {
        e.preventDefault()
        shoot()
      }
    },
    [gameStats.ammo, isMobile],
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (isMobile) return
      keysRef.current.delete(e.key.toLowerCase())
    },
    [isMobile],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top

      const dx = mouseRef.current.x - player.x
      const dy = mouseRef.current.y - player.y
      const angle = Math.atan2(dy, dx)
      setPlayer((prev) => ({ ...prev, angle }))
    },
    [player.x, player.y, isMobile],
  )

  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return
      e.preventDefault()
      if (gameStats.ammo > 0) {
        shoot()
      }
    },
    [gameStats.ammo, isMobile],
  )

  // Touch event handlers for mobile
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return
      e.preventDefault()

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      // Determine if touch is on left or right side for movement/aiming
      if (x < canvas.width / 2) {
        // Left side - movement
        setTouchControls((prev) => ({
          ...prev,
          moveStick: { active: true, x, y, centerX: x, centerY: y },
        }))
      } else {
        // Right side - aiming and shooting
        setTouchControls((prev) => ({
          ...prev,
          aimStick: { active: true, x, y, centerX: x, centerY: y },
          shooting: true,
        }))
        if (gameStats.ammo > 0) {
          shoot()
        }
      }
    },
    [isMobile, gameStats.ammo],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return
      e.preventDefault()

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      if (x < canvas.width / 2 && touchControls.moveStick.active) {
        setTouchControls((prev) => ({
          ...prev,
          moveStick: { ...prev.moveStick, x, y },
        }))
      } else if (x >= canvas.width / 2 && touchControls.aimStick.active) {
        setTouchControls((prev) => ({
          ...prev,
          aimStick: { ...prev.aimStick, x, y },
        }))
      }
    },
    [isMobile, touchControls],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return
      e.preventDefault()

      setTouchControls((prev) => ({
        moveStick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0 },
        aimStick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0 },
        shooting: false,
      }))
    },
    [isMobile],
  )

  const shoot = useCallback(() => {
    if (gameStats.ammo <= 0) return

    const bulletSpeed = 10
    const dx = Math.cos(player.angle) * bulletSpeed
    const dy = Math.sin(player.angle) * bulletSpeed

    setBullets((prev) => [
      ...prev,
      {
        x: player.x,
        y: player.y,
        dx,
        dy,
        id: Date.now(),
      },
    ])

    setGameStats((prev) => ({ ...prev, ammo: prev.ammo - 1 }))
  }, [player.angle, player.x, player.y, gameStats.ammo])

  // Game controls
  const startGame = () => {
    initGame()
    setGameState("playing")
  }

  const pauseGame = () => {
    setGameState(gameState === "paused" ? "playing" : "paused")
  }

  const resetGame = () => {
    setGameState("menu")
    initGame()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Setup event listeners
  useEffect(() => {
    if (gameState === "playing") {
      if (!isMobile) {
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        canvasRef.current?.addEventListener("mousemove", handleMouseMove)
        canvasRef.current?.addEventListener("click", handleMouseClick)
      } else {
        canvasRef.current?.addEventListener("touchstart", handleTouchStart)
        canvasRef.current?.addEventListener("touchmove", handleTouchMove)
        canvasRef.current?.addEventListener("touchend", handleTouchEnd)
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
        canvasRef.current?.removeEventListener("mousemove", handleMouseMove)
        canvasRef.current?.removeEventListener("click", handleMouseClick)
      } else {
        canvasRef.current?.removeEventListener("touchstart", handleTouchStart)
        canvasRef.current?.removeEventListener("touchmove", handleTouchMove)
        canvasRef.current?.removeEventListener("touchend", handleTouchEnd)
      }

      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [
    gameState,
    gameLoop,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handleMouseClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isMobile,
  ])

  const renderGameContent = () => (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full bg-black" />
      {isMobile && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end p-4">
          {/* Movement D-pad */}
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-32 h-32">
            <Button
              className="col-start-2 row-start-1"
              onTouchStart={() => handleTouchInput("w", true)}
              onTouchEnd={() => handleTouchInput("w", false)}
              variant="outline"
              size="icon"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
            <Button
              className="col-start-1 row-start-2"
              onTouchStart={() => handleTouchInput("a", true)}
              onTouchEnd={() => handleTouchInput("a", false)}
              variant="outline"
              size="icon"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button
              className="col-start-3 row-start-2"
              onTouchStart={() => handleTouchInput("d", true)}
              onTouchEnd={() => handleTouchInput("d", false)}
              variant="outline"
              size="icon"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
            <Button
              className="col-start-2 row-start-3"
              onTouchStart={() => handleTouchInput("s", true)}
              onTouchEnd={() => handleTouchInput("s", false)}
              variant="outline"
              size="icon"
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
          </div>

          {/* Action Button */}
          <Button
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
            onTouchStart={() => handleTouchInput(" ", true)} // Spacebar for shooting
            onTouchEnd={() => handleTouchInput(" ", false)}
            variant="default"
            size="icon"
          >
            <Target className="h-10 w-10" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <MobileOptimizedContainer className={cn("w-full max-w-6xl mx-auto")}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Canvas */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crosshair className="h-5 w-5" />
                  Archer Arena
                  <Badge variant="secondary">{isMobile ? "Mobile" : "Desktop"}</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {renderGameContent()}
              {/* Game State Overlay */}
              {gameState !== "playing" && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    {gameState === "menu" && (
                      <div>
                        <h2 className="text-3xl font-bold mb-4">Archer Arena</h2>
                        <p className="mb-6 text-gray-300">
                          {isMobile
                            ? "Touch left side to move, right side to aim and shoot"
                            : "Use WASD to move, mouse to aim and click to shoot"}
                        </p>
                        <Button onClick={startGame} size="lg">
                          <Play className="mr-2 h-4 w-4" />
                          Start Game
                        </Button>
                      </div>
                    )}
                    {gameState === "paused" && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                        <div className="flex gap-4">
                          <Button onClick={pauseGame}>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </Button>
                          <Button onClick={resetGame} variant="outline">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restart
                          </Button>
                        </div>
                      </div>
                    )}
                    {gameState === "gameOver" && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                        <p className="mb-4">Final Score: {gameStats.score}</p>
                        <Button onClick={resetGame}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Play Again
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Stats & Controls */}
        <div className="space-y-6">
          {/* Game Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Score
                </span>
                <Badge variant="secondary">{gameStats.score}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Health
                  </span>
                  <span>{gameStats.health}%</span>
                </div>
                <Progress value={gameStats.health} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Ammo
                </span>
                <Badge variant={gameStats.ammo < 10 ? "destructive" : "secondary"}>{gameStats.ammo}</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span>Level</span>
                <Badge>{gameStats.level}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Enemies</span>
                <Badge variant="outline">{gameStats.enemies}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Accuracy</span>
                <Badge variant="secondary">{gameStats.accuracy}%</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Game Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameState === "playing" ? (
                <div className="flex flex-col gap-2">
                  <Button onClick={pauseGame} variant="outline" className="w-full bg-transparent">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Game
                  </Button>
                  <Button onClick={resetGame} variant="outline" className="w-full bg-transparent">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                </div>
              ) : (
                <Button onClick={startGame} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  {gameState === "menu" ? "Start Game" : "Resume"}
                </Button>
              )}

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground">{isMobile ? "Touch Controls:" : "Keyboard Controls:"}</h4>
                {isMobile ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3 w-3" />
                      <span>Left side: Move player</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      <span>Right side: Aim & shoot</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">W</kbd>
                        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">A</kbd>
                        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">S</kbd>
                        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">D</kbd>
                      </div>
                      <span>Move</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-3 w-3" />
                      <span>Mouse: Aim & shoot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Space</kbd>
                      <span>Shoot</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileOptimizedContainer>
  )
}
</merged_code>
