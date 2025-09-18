"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Shield, Target } from "lucide-react"

interface Player {
  x: number
  y: number
  size: number
  health: number
  maxHealth: number
  shield: number
  maxShield: number
}

interface Enemy {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  type: "triangle" | "diamond" | "hexagon"
  health: number
  color: string
}

interface Bullet {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
}

export default function GalacticVanguardGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())

  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameOver">("menu")
  const [score, setScore] = useState(0)
  const [wave, setWave] = useState(1)
  const [lives, setLives] = useState(3)

  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    size: 15,
    health: 100,
    maxHealth: 100,
    shield: 50,
    maxShield: 50,
  })

  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  const lastShotRef = useRef(0)
  const enemyIdRef = useRef(0)
  const bulletIdRef = useRef(0)
  const particleIdRef = useRef(0)

  // Game constants
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600
  const PLAYER_SPEED = 5
  const BULLET_SPEED = 8
  const SHOT_COOLDOWN = 150

  // Initialize game
  const initGame = useCallback(() => {
    setScore(0)
    setWave(1)
    setLives(3)
    setPlayer({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: 15,
      health: 100,
      maxHealth: 100,
      shield: 50,
      maxShield: 50,
    })
    setEnemies([])
    setBullets([])
    setParticles([])
    enemyIdRef.current = 0
    bulletIdRef.current = 0
    particleIdRef.current = 0
  }, [])

  // Spawn enemies for current wave
  const spawnWave = useCallback((waveNum: number) => {
    const enemyCount = Math.min(3 + waveNum * 2, 15)
    const newEnemies: Enemy[] = []

    for (let i = 0; i < enemyCount; i++) {
      const side = Math.floor(Math.random() * 4)
      let x, y

      switch (side) {
        case 0: // Top
          x = Math.random() * CANVAS_WIDTH
          y = -50
          break
        case 1: // Right
          x = CANVAS_WIDTH + 50
          y = Math.random() * CANVAS_HEIGHT
          break
        case 2: // Bottom
          x = Math.random() * CANVAS_WIDTH
          y = CANVAS_HEIGHT + 50
          break
        default: // Left
          x = -50
          y = Math.random() * CANVAS_HEIGHT
          break
      }

      const types: Enemy["type"][] = ["triangle", "diamond", "hexagon"]
      const colors = ["#ff0080", "#00ff80", "#8000ff", "#ff8000", "#0080ff"]

      newEnemies.push({
        id: enemyIdRef.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 15 + Math.random() * 10,
        type: types[Math.floor(Math.random() * types.length)],
        health: 1 + Math.floor(waveNum / 3),
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    setEnemies(newEnemies)
  }, [])

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const speed = 2 + Math.random() * 3
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return

    const gameLoop = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas with starfield effect
      ctx.fillStyle = "#000011"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw stars
      ctx.fillStyle = "#ffffff"
      for (let i = 0; i < 100; i++) {
        const x = (i * 37) % CANVAS_WIDTH
        const y = (i * 73) % CANVAS_HEIGHT
        const size = Math.sin(Date.now() * 0.001 + i) * 0.5 + 1
        ctx.fillRect(x, y, size, size)
      }

      // Update and draw player
      setPlayer((prev) => {
        let newX = prev.x
        let newY = prev.y

        if (keysRef.current.has("a") || keysRef.current.has("arrowleft")) {
          newX = Math.max(prev.size, prev.x - PLAYER_SPEED)
        }
        if (keysRef.current.has("d") || keysRef.current.has("arrowright")) {
          newX = Math.min(CANVAS_WIDTH - prev.size, prev.x + PLAYER_SPEED)
        }
        if (keysRef.current.has("w") || keysRef.current.has("arrowup")) {
          newY = Math.max(prev.size, prev.y - PLAYER_SPEED)
        }
        if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) {
          newY = Math.min(CANVAS_HEIGHT - prev.size, prev.y + PLAYER_SPEED)
        }

        // Shooting
        if (keysRef.current.has(" ") && Date.now() - lastShotRef.current > SHOT_COOLDOWN) {
          setBullets((prevBullets) => [
            ...prevBullets,
            {
              id: bulletIdRef.current++,
              x: newX,
              y: newY - prev.size,
              vx: 0,
              vy: -BULLET_SPEED,
              size: 3,
            },
          ])
          lastShotRef.current = Date.now()
        }

        return { ...prev, x: newX, y: newY }
      })

      // Draw player (triangle ship)
      ctx.save()
      ctx.translate(player.x, player.y)
      ctx.fillStyle = "#00ffff"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -player.size)
      ctx.lineTo(-player.size * 0.7, player.size * 0.7)
      ctx.lineTo(player.size * 0.7, player.size * 0.7)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      // Update and draw bullets
      setBullets((prev) => {
        const updated = prev
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + bullet.vx,
            y: bullet.y + bullet.vy,
          }))
          .filter((bullet) => bullet.x > 0 && bullet.x < CANVAS_WIDTH && bullet.y > 0 && bullet.y < CANVAS_HEIGHT)

        updated.forEach((bullet) => {
          ctx.fillStyle = "#ffff00"
          ctx.fillRect(bullet.x - bullet.size / 2, bullet.y - bullet.size / 2, bullet.size, bullet.size)
        })

        return updated
      })

      // Update and draw enemies
      setEnemies((prev) => {
        const updated = prev.map((enemy) => {
          // Move towards player
          const dx = player.x - enemy.x
          const dy = player.y - enemy.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const speed = 1 + wave * 0.1

          return {
            ...enemy,
            x: enemy.x + (dx / dist) * speed,
            y: enemy.y + (dy / dist) * speed,
          }
        })

        updated.forEach((enemy) => {
          ctx.save()
          ctx.translate(enemy.x, enemy.y)
          ctx.fillStyle = enemy.color
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 1

          // Draw different shapes based on type
          ctx.beginPath()
          if (enemy.type === "triangle") {
            ctx.moveTo(0, -enemy.size)
            ctx.lineTo(-enemy.size * 0.8, enemy.size * 0.6)
            ctx.lineTo(enemy.size * 0.8, enemy.size * 0.6)
          } else if (enemy.type === "diamond") {
            ctx.moveTo(0, -enemy.size)
            ctx.lineTo(enemy.size, 0)
            ctx.lineTo(0, enemy.size)
            ctx.lineTo(-enemy.size, 0)
          } else {
            // hexagon
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2
              const x = Math.cos(angle) * enemy.size
              const y = Math.sin(angle) * enemy.size
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        })

        return updated
      })

      // Update and draw particles
      setParticles((prev) => {
        const updated = prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0)

        updated.forEach((particle) => {
          const alpha = particle.life / particle.maxLife
          ctx.fillStyle =
            particle.color +
            Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0")
          ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4)
        })

        return updated
      })

      // Collision detection
      setBullets((prevBullets) => {
        const newBullets = [...prevBullets]

        setEnemies((prevEnemies) => {
          const newEnemies = [...prevEnemies]

          newBullets.forEach((bullet, bulletIndex) => {
            newEnemies.forEach((enemy, enemyIndex) => {
              const dx = bullet.x - enemy.x
              const dy = bullet.y - enemy.y
              const dist = Math.sqrt(dx * dx + dy * dy)

              if (dist < bullet.size + enemy.size) {
                // Hit!
                createExplosion(enemy.x, enemy.y, enemy.color)
                newBullets.splice(bulletIndex, 1)
                newEnemies.splice(enemyIndex, 1)
                setScore((prev) => prev + 10 * wave)
              }
            })
          })

          // Check if wave is complete
          if (newEnemies.length === 0) {
            setWave((prev) => {
              const nextWave = prev + 1
              setTimeout(() => spawnWave(nextWave), 1000)
              return nextWave
            })
          }

          return newEnemies
        })

        return newBullets
      })

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, player, wave, spawnWave, createExplosion])

  const startGame = () => {
    initGame()
    setGameState("playing")
    spawnWave(1)
  }

  const pauseGame = () => {
    setGameState("paused")
  }

  const resumeGame = () => {
    setGameState("playing")
  }

  const resetGame = () => {
    setGameState("menu")
    initGame()
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Galactic Vanguard
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Score: {score}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Wave: {wave}
              </Badge>
              <Badge variant="outline">Lives: {lives}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-300 rounded-lg bg-black"
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {gameState === "menu" && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-white mb-4">Galactic Vanguard</h2>
                  <p className="text-gray-300 mb-6">Survive waves of geometric enemies!</p>
                  <div className="text-sm text-gray-400 space-y-1 mb-6">
                    <p>WASD or Arrow Keys to move</p>
                    <p>SPACE to shoot</p>
                  </div>
                  <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === "paused" && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-white">Game Paused</h2>
                  <div className="flex gap-2">
                    <Button onClick={resumeGame} className="bg-green-500 hover:bg-green-600">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                    <Button onClick={resetGame} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {gameState === "gameOver" && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-red-400">Game Over</h2>
                  <p className="text-white">Final Score: {score}</p>
                  <p className="text-white">Waves Survived: {wave - 1}</p>
                  <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600">
                    <Play className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {gameState === "playing" && (
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={pauseGame} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
