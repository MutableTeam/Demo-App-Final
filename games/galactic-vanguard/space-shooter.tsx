"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import GameUI from "./components/game-ui"
import MobileGameUI from "./components/mobile-game-ui"
import GameOverScreen from "./components/game-over-screen"
import StartScreen from "./components/start-screen"
import { cn } from "@/lib/utils" // Assuming cn utility is available

interface SpaceShooterProps {
  playerName: string
  onExit: () => void
  isMobile?: boolean
  platformType?: "mobile" | "desktop"
}

export default function SpaceShooter({
  playerName: initialPlayerName,
  onExit,
  isMobile: propIsMobile,
  platformType,
}: SpaceShooterProps) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const gameStateRef = useRef({
    player: {
      x: 400,
      y: 500,
      health: 100,
      maxHealth: 100,
      vx: 0, // Player velocity for bullet physics
      vy: 0,
      prevX: 400,
      prevY: 500,
      currentSpeed: 0, // For mobile acceleration
      momentumX: 0, // Add momentum for thrust effect
      momentumY: 0,
    },
    bullets: [],
    enemies: [],
    particles: [],
    smokeParticles: [], // For damaged ship effect
    powerUps: [],
    score: 0,
    wave: 1,
    gameTime: 0,
    lastShot: 0,
    keys: {},
    gameStatus: "start", // 'start', 'playing', 'exploding', 'gameOver'
    baseEnemySpawnRate: 0.002, // Base rate for desktop
    lastEnemySpawn: 0,
    lastPowerUpSpawn: 0,
    playerUpgrades: {
      dualShot: 0,
      rapidFire: 0,
      shield: 0,
      speed: 0,
    },
    abilitySlots: [null, null], // Two ability slots
    selectedAbilitySlot: null, // Which slot is selected for use (0 or 1)
  })

  const [gameState, setGameState] = useState(gameStateRef.current.gameStatus)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100)
  const [score, setScore] = useState(0) // NEW: State for score
  const [wave, setWave] = useState(1) // NEW: State for wave
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [playerName, setPlayerName] = useState("Player")
  const [abilitySlots, setAbilitySlots] = useState([null, null]) // State for ability slots UI
  const [selectedAbilitySlot, setSelectedAbilitySlot] = useState(null) // State for selected ability UI
  const animationRef = useRef()
  const lastTimeRef = useRef(0)
  const startTimeRef = useRef(0)
  const explosionTimeoutRef = useRef(null)
  const touchStartRef = useRef(null) // Ref to store initial touch position

  // Mobile controls - We'll still need this state for general mobile input logic
  const [mobileInput, setMobileInput] = useState({ x: 0, y: 0, magnitude: 0 })

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        propIsMobile ||
        platformType === "mobile" ||
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768
      const landscape = window.innerWidth > window.innerHeight
      setIsMobile(mobile)
      setIsLandscape(landscape)

      let newWidth, newHeight
      if (mobile) {
        if (landscape) {
          // Landscape mode - use full screen width
          newWidth = Math.min(window.innerWidth - 10, 900)
          newHeight = Math.min(window.innerHeight - 60, 500)
        } else {
          // Portrait mode - optimize for vertical gameplay
          newWidth = Math.min(window.innerWidth - 20, 380)
          newHeight = Math.min(window.innerHeight - 120, 600)
        }
      } else {
        // Desktop dimensions
        newWidth = 800
        newHeight = 600
      }

      setDimensions({ width: newWidth, height: newHeight })

      // Reset player position for new dimensions
      if (gameStateRef.current.player) {
        gameStateRef.current.player.x = newWidth / 2
        gameStateRef.current.player.y = newHeight - (mobile ? 80 : 100)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    window.addEventListener("orientationchange", checkMobile)

    const handleTouchStart = (e) => {
      if (!isMobile || gameStateRef.current.gameStatus !== "playing") return
      if (gameStateRef.current.selectedAbilitySlot === null) {
        e.preventDefault()
      }
      const touch = e.touches[0]
      if (touch) {
        const rect = e.target.getBoundingClientRect()
        touchStartRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
      }
    }

    const handleTouchMove = (e) => {
      if (!isMobile || gameStateRef.current.gameStatus !== "playing" || !touchStartRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      if (touch) {
        const rect = e.target.getBoundingClientRect()
        const currentX = touch.clientX - rect.left
        const currentY = touch.clientY - rect.top

        const startX = touchStartRef.current.x
        const startY = touchStartRef.current.y

        const dx = currentX - startX
        const dy = currentY - startY

        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 1) {
          setMobileInput({ x: 0, y: 0, magnitude: 0 })
          return
        }

        const joystickRadius = isLandscape ? 80 : 60
        const magnitude = Math.min(1.0, distance / joystickRadius)

        const dirX = dx / distance
        const dirY = dy / distance

        setMobileInput({ x: dirX, y: dirY, magnitude: magnitude })
      }
    }

    const handleTouchEnd = () => {
      if (!isMobile) return
      touchStartRef.current = null // Reset start position
      setMobileInput({ x: 0, y: 0, magnitude: 0 })
    }

    // Capture canvas reference at the start of the effect
    const canvas = canvasRef.current
    if (canvas && isMobile) {
      canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
      canvas.addEventListener("touchend", handleTouchEnd)
      canvas.addEventListener("touchcancel", handleTouchEnd)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
      if (explosionTimeoutRef.current) {
        clearTimeout(explosionTimeoutRef.current)
      }
      // Use the captured canvas reference instead of canvasRef.current
      if (canvas && isMobile) {
        canvas.removeEventListener("touchstart", handleTouchStart)
        canvas.removeEventListener("touchmove", handleTouchMove)
        canvas.removeEventListener("touchend", handleTouchEnd)
        canvas.removeEventListener("touchcancel", handleTouchEnd)
      }
    }
  }, [isMobile, isLandscape]) // Removed selectedAbilitySlot as it's accessed via gameStateRef.current, which is always up-to-date.

  const enemyTypes = useMemo(() => {
    const desktopTypes = {
      scout: { health: 25, speed: 1.4, color: "#ff4444", size: 15, points: 10, behavior: "direct" }, // Reduced from 2.8
      fighter: { health: 50, speed: 1.1, color: "#4444ff", size: 20, points: 25, behavior: "zigzag" }, // Reduced from 2.2
      bomber: { health: 100, speed: 0.6, color: "#ff8844", size: 30, points: 50, behavior: "shoot" }, // Reduced from 1.2
      hunter: { health: 40, speed: 1.75, color: "#f56565", size: 20, points: 75, behavior: "strafe_shoot" }, // Reduced from 3.5
      guardian: { health: 250, speed: 0.3, color: "#a0aec0", size: 45, points: 250, behavior: "spread_shot" }, // Reduced from 0.6
    }

    const mobileTypes = {
      scout: { health: 18, speed: 0.9, color: "#ff4444", size: 22, points: 15, behavior: "direct" }, // Reduced from 1.8
      fighter: { health: 35, speed: 0.75, color: "#4444ff", size: 28, points: 30, behavior: "zigzag" }, // Reduced from 1.5
      bomber: { health: 70, speed: 0.4, color: "#ff8844", size: 38, points: 60, behavior: "shoot" }, // Reduced from 0.8
      hunter: { health: 30, speed: 1.4, color: "#f56565", size: 25, points: 80, behavior: "strafe_shoot" }, // Reduced from 2.8
      guardian: { health: 180, speed: 0.225, color: "#a0aec0", size: 50, points: 275, behavior: "spread_shot" }, // Reduced from 0.45
    }

    return isMobile ? mobileTypes : desktopTypes
  }, [isMobile])

  const powerUpTypes = useMemo(
    () => ({
      dualShot: {
        color: "#00ff00",
        size: 12,
        duration: 12000, // Reduced from 15000
        name: "Dual Shot",
      },
      rapidFire: {
        color: "#ffff00",
        size: 12,
        duration: 8000, // Reduced from 10000
        name: "Rapid Fire",
      },
      shield: {
        color: "#0088ff",
        size: 12,
        duration: 10000, // Reduced from 12000
        name: "Shield",
      },
      speed: {
        color: "#ff8800",
        size: 12,
        duration: 6000, // Reduced from 8000
        name: "Speed Boost",
      },
    }),
    [],
  )

  const createPowerUp = useCallback(() => {
    const types = Object.keys(powerUpTypes)
    const type = types[Math.floor(Math.random() * types.length)]
    const config = powerUpTypes[type]

    return {
      type,
      x: Math.random() * (dimensions.width - 50) + 25,
      y: -20,
      speed: 1,
      color: config.color,
      name: config.name,
      duration: config.duration,
      size: config.size,
    }
  }, [powerUpTypes, dimensions.width])

  const createEnemy = useCallback(
    (type) => {
      const config = enemyTypes[type]
      return {
        type,
        x: Math.random() * (dimensions.width - 50) + 25,
        y: -50,
        health: config.health,
        maxHealth: config.health,
        speed: config.speed,
        color: config.color,
        size: config.size,
        points: config.points,
        behavior: config.behavior,
        zigzagOffset: Math.random() * Math.PI * 2,
        zigzagSpeed: 0.005 + Math.random() * 0.01, // Random zigzag speed
        lastShot: 0,
        strafeDirection: Math.random() < 0.5 ? 1 : -1, // For Hunter
        behaviorTimer: 0, // For chaotic behavior changes
        chaosOffset: Math.random() * Math.PI * 2, // Random chaos factor
      }
    },
    [enemyTypes, dimensions.width],
  )

  const createParticle = useCallback((x, y, color) => {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      color,
      size: Math.random() * 3 + 1,
    }
  }, [])

  // Helper function to activate stored abilities
  const activateStoredAbility = useCallback(
    (slotIndex, ability) => {
      const game = gameStateRef.current
      if (!game.player || !ability) return

      // Apply the power-up effect immediately
      game.playerUpgrades[ability.type] = game.gameTime + ability.duration

      // Create visual feedback particles around player
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3 + 2
        game.particles.push({
          x: game.player.x,
          y: game.player.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 25,
          color: ability.color,
          size: Math.random() * 4 + 2,
        })
      }

      // Remove ability from slot
      game.abilitySlots[slotIndex] = null
      setAbilitySlots([...game.abilitySlots])

      // Clear selection if this slot was selected
      if (game.selectedAbilitySlot === slotIndex) {
        game.selectedAbilitySlot = null
        setSelectedAbilitySlot(null)
      }

      console.log(`Activated ${ability.name} from keyboard shortcut`)
    },
    [setAbilitySlots, setSelectedAbilitySlot],
  )

  const handleKeyDown = useCallback(
    (e) => {
      gameStateRef.current.keys[e.code.toLowerCase()] = true

      // Handle ability activation with Q and E keys
      if (gameStateRef.current.gameStatus === "playing") {
        if (e.code === "KeyQ" && gameStateRef.current.abilitySlots[0]) {
          // Activate first ability slot
          const ability = gameStateRef.current.abilitySlots[0]
          activateStoredAbility(0, ability)
          e.preventDefault()
        } else if (e.code === "KeyE" && gameStateRef.current.abilitySlots[1]) {
          // Activate second ability slot
          const ability = gameStateRef.current.abilitySlots[1]
          activateStoredAbility(1, ability)
          e.preventDefault()
        }
      }
    },
    [activateStoredAbility],
  )

  const handleKeyUp = useCallback((e) => {
    gameStateRef.current.keys[e.code.toLowerCase()] = false
  }, [])

  const triggerPlayerExplosion = useCallback(() => {
    const game = gameStateRef.current
    if (!game.player) return

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 8 + 2
      const color = ["#ffcc00", "#ff6600", "#ff0000", "#ffffff"][Math.floor(Math.random() * 4)]
      game.particles.push({
        x: game.player.x,
        y: game.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: Math.random() * 60 + 40,
        color: color,
        size: Math.random() * 4 + 2,
      })
    }
    game.player = null // Remove player from screen
  }, [])

  const endGame = useCallback(async () => {
    const playDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)

    try {
      const response = await fetch("/api/highscores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_name: playerName,
          score: gameStateRef.current.score,
          wave: gameStateRef.current.wave,
          play_duration: playDuration,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save high score")
      }
    } catch (error) {
      console.error("Error saving high score:", error)
    }

    setGameState("gameOver")
  }, [playerName])

  const startGame = () => {
    if (explosionTimeoutRef.current) clearTimeout(explosionTimeoutRef.current)
    const initialHealth = isMobile ? 120 : 100
    setPlayerHealth(initialHealth)
    setPlayerMaxHealth(initialHealth)
    setScore(0) // Initialize score state
    setWave(1) // Initialize wave state
    setAbilitySlots([null, null]) // Reset ability slots UI state
    setSelectedAbilitySlot(null) // Reset selected slot UI state

    gameStateRef.current = {
      player: {
        x: dimensions.width / 2,
        y: dimensions.height - (isMobile ? 80 : 100),
        health: initialHealth,
        maxHealth: initialHealth,
        vx: 0,
        vy: 0,
        prevX: dimensions.width / 2,
        prevY: dimensions.height - (isMobile ? 80 : 100),
        currentSpeed: 0, // Reset speed
        momentumX: 0, // Reset momentum
        momentumY: 0,
      },
      bullets: [],
      enemies: [],
      particles: [],
      smokeParticles: [],
      powerUps: [],
      score: 0,
      wave: 1,
      gameTime: 0,
      lastShot: 0,
      keys: {},
      gameStatus: "playing",
      // SEGREGATED DIFFICULTY: Mobile vs Desktop
      baseEnemySpawnRate: isMobile ? 0.006 : 0.003, // Mobile gets 2x spawn rate
      lastEnemySpawn: 0,
      lastPowerUpSpawn: 0,
      playerUpgrades: {
        dualShot: 0,
        rapidFire: 0,
        shield: 0,
        speed: 0,
      },
      abilitySlots: [null, null], // Reset ability slots
      selectedAbilitySlot: null, // Reset selected slot
    }
    startTimeRef.current = Date.now()
    setGameState("playing")
  }

  // Handle ability slot selection (from UI component)
  const handleAbilitySlotClick = useCallback((slotIndex) => {
    if (gameStateRef.current.gameStatus !== "playing") return

    const game = gameStateRef.current
    if (game.abilitySlots[slotIndex]) {
      // Toggle selection
      const newSelected = game.selectedAbilitySlot === slotIndex ? null : slotIndex
      setSelectedAbilitySlot(newSelected)
      game.selectedAbilitySlot = newSelected
    }
  }, []) // Depend on nothing as it uses ref values and state setters

  // Handle canvas click for ability usage
  const handleCanvasClick = useCallback(
    (e) => {
      const game = gameStateRef.current
      const currentSelected = game.selectedAbilitySlot

      if (game.gameStatus !== "playing" || currentSelected === null) return

      const rect = canvasRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Scale coordinates to canvas dimensions
      const scaleX = dimensions.width / rect.width
      const scaleY = dimensions.height / rect.height
      const targetX = clickX * scaleX
      const targetY = clickY * scaleY

      // Use the ability at target location
      const ability = game.abilitySlots[currentSelected]
      if (ability) {
        // Create visual feedback particles at target location
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 4 + 2
          game.particles.push({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30,
            color: ability.color,
            size: Math.random() * 3 + 2,
          })
        }

        // Remove used ability and deselect
        game.abilitySlots[currentSelected] = null
        game.selectedAbilitySlot = null
        setAbilitySlots([...game.abilitySlots]) // Update UI state
        setSelectedAbilitySlot(null) // Update UI state

        console.log(`Used ${ability.name} ability at (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`)
      }
    },
    [dimensions.width, dimensions.height],
  )

  const gameLoop = useCallback(
    (currentTime) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      const game = gameStateRef.current
      const canvas = canvasRef.current
      if (!canvas) {
        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }
      const ctx = canvas.getContext("2d")

      // Clear canvas
      ctx.fillStyle = "#000011"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      const starCount = isMobile ? 40 : 100
      ctx.fillStyle = "#ffffff"
      for (let i = 0; i < starCount; i++) {
        const x = (i * 47) % canvas.width
        const y = (i * 73 + (game.gameTime || 0) * 0.5) % canvas.height
        ctx.fillRect(x, y, 1, 1)
      }

      if (game.gameStatus === "exploding") {
        // Only update particles during explosion
      } else if (game.gameStatus === "playing") {
        // Fix gameTime to be relative to game start, not absolute time
        game.gameTime = Date.now() - startTimeRef.current

        // Calculate player velocity for bullet physics
        if (game.player) {
          game.player.vx = game.player.x - game.player.prevX
          game.player.vy = game.player.y - game.player.prevY
          game.player.prevX = game.player.x
          game.player.prevY = game.player.y
        }

        // Update player position with reduced speed
        const baseSpeed = 3 // Reduced from 6 (50% reduction)
        const speedMultiplier = game.playerUpgrades.speed > 0 ? 1.5 : 1
        const maxSpeed = baseSpeed * speedMultiplier

        if (isMobile) {
          const targetSpeed = maxSpeed * mobileInput.magnitude
          // Interpolate for smooth acceleration/deceleration
          game.player.currentSpeed += (targetSpeed - game.player.currentSpeed) * 0.1 // Slightly increased responsiveness

          // Apply movement only if there's significant input
          if (mobileInput.magnitude > 0.01) {
            // Active input
            const playerSize = 18
            const moveX = mobileInput.x * game.player.currentSpeed
            const moveY = mobileInput.y * game.player.currentSpeed

            // Update momentum when actively moving
            game.player.momentumX = moveX * 0.3 // Store 30% of movement as momentum
            game.player.momentumY = moveY * 0.3

            const newX = game.player.x + moveX
            const newY = game.player.y + moveY

            game.player.x = Math.max(playerSize, Math.min(canvas.width - playerSize, newX))
            game.player.y = Math.max(playerSize, Math.min(canvas.height - playerSize, newY))
          } else {
            // No input - apply momentum/thrust
            // Apply momentum for realistic space physics
            const playerSize = 18
            const newX = game.player.x + game.player.momentumX
            const newY = game.player.y + game.player.momentumY

            game.player.x = Math.max(playerSize, Math.min(canvas.width - playerSize, newX))
            game.player.y = Math.max(playerSize, Math.min(canvas.height - playerSize, newY))

            // Gradually reduce momentum (space friction)
            game.player.momentumX *= 0.95
            game.player.momentumY *= 0.95
            game.player.currentSpeed *= 0.92
          }
        } else {
          // Desktop controls
          if (game.keys["keya"] || game.keys["arrowleft"]) game.player.x -= maxSpeed
          if (game.keys["keyd"] || game.keys["arrowright"]) game.player.x += maxSpeed
          if (game.keys["keyw"] || game.keys["arrowup"]) game.player.y -= maxSpeed
          if (game.keys["keys"] || game.keys["arrowdown"]) game.player.y += maxSpeed

          // Keep desktop player in bounds
          const playerSize = 20
          game.player.x = Math.max(playerSize, Math.min(canvas.width - playerSize, game.player.x))
          game.player.y = Math.max(playerSize, Math.min(canvas.height - playerSize, game.player.y))
        }

        // Auto-shoot with UPGRADED BULLET PHYSICS
        const baseShootRate = isMobile ? 150 : 150
        const shootRate = game.playerUpgrades.rapidFire > 0 ? baseShootRate / 2 : baseShootRate

        if (game.gameTime - game.lastShot > shootRate) {
          const hasDualShot = game.playerUpgrades.dualShot > 0
          const bulletSpeed = isMobile ? -10 : -8

          // Add player momentum to bullets for realistic physics
          const momentumFactor = 0.3 // How much player movement affects bullets
          const bulletVx = game.player.vx * momentumFactor
          const bulletVy = bulletSpeed + game.player.vy * momentumFactor * 0.5 // Less vertical momentum

          if (hasDualShot) {
            // Dual shot for both platforms with upgrade
            game.bullets.push(
              { x: game.player.x - 8, y: game.player.y - 20, vx: bulletVx - 0.5, vy: bulletVy, friendly: true },
              { x: game.player.x + 8, y: game.player.y - 20, vx: bulletVx + 0.5, vy: bulletVy, friendly: true },
            )
          } else {
            // Single shot default
            game.bullets.push({
              x: game.player.x,
              y: game.player.y - 20,
              vx: bulletVx,
              vy: bulletVy,
              friendly: true,
            })
          }
          game.lastShot = game.gameTime
        }

        // Damaged effect: smoke
        if (game.player && game.player.health < game.player.maxHealth * 0.5 && Math.random() < 0.2) {
          game.smokeParticles.push({
            x: game.player.x + (Math.random() - 0.5) * 10,
            y: game.player.y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 1,
            life: 40,
            color: "#444",
            size: Math.random() * 4 + 2,
          })
        }

        // Spawn power-ups
        const powerUpSpawnInterval = isMobile ? 25000 : 20000 // Power-ups less frequent on mobile
        if (game.gameTime - game.lastPowerUpSpawn > powerUpSpawnInterval && Math.random() < 0.005) {
          game.powerUps.push(createPowerUp())
          game.lastPowerUpSpawn = game.gameTime
        }

        // Update power-ups
        game.powerUps = game.powerUps.filter((powerUp) => {
          powerUp.y += powerUp.speed
          return powerUp.y < canvas.height + 20
        })

        // SEGREGATED WAVE PROGRESSION: Mobile vs Desktop (ACCELERATED)
        if (isMobile) {
          // Accelerated: What was wave 3 is now wave 1
          game.wave = Math.floor(game.gameTime / 6000) + 3 // Faster progression, start at effective wave 3
        } else {
          // Accelerated: What was wave 3 is now wave 1
          game.wave = Math.floor(game.gameTime / 7500) + 3 // Faster progression, start at effective wave 3
        }

        // SEGREGATED ENEMY SPAWNING: Mobile gets more aggressive progression
        let waveProgression, spawnRateMultiplier, currentSpawnRate, minSpawnInterval

        if (isMobile) {
          // Mobile: More aggressive difficulty curve (adjusted for new wave offset)
          waveProgression = Math.pow(game.wave - 3, 1.6) // Adjusted base since we start at wave 3
          spawnRateMultiplier = 1 + waveProgression * 0.18 // Higher scaling
          currentSpawnRate = game.baseEnemySpawnRate * spawnRateMultiplier
          minSpawnInterval = 300 // Shorter intervals between spawns
        } else {
          // Desktop: Balanced difficulty curve (adjusted for new wave offset)
          waveProgression = Math.pow(game.wave - 3, 1.4) // Adjusted base since we start at wave 3
          spawnRateMultiplier = 1 + waveProgression * 0.12 // Gentler scaling
          currentSpawnRate = game.baseEnemySpawnRate * spawnRateMultiplier
          minSpawnInterval = 400 // Longer intervals between spawns
        }

        if (Math.random() < currentSpawnRate && game.gameTime - game.lastEnemySpawn > minSpawnInterval) {
          // SEGREGATED ENEMY TYPE PROGRESSION: Mobile vs Desktop (adjusted for new starting wave)
          let spawnCount, enemyType

          if (isMobile) {
            // Mobile: Adjusted thresholds since we now start at effective wave 3
            spawnCount = game.wave > 5 && Math.random() < 0.3 ? 2 : 1

            const rand = Math.random()
            if (game.wave >= 8 && rand > 0.95) {
              enemyType = "guardian"
            } else if (game.wave >= 6 && rand > 0.85) {
              enemyType = "hunter"
            } else if (game.wave >= 4 && rand > 0.6) {
              enemyType = "bomber"
            } else if (rand > 0.4) {
              enemyType = "fighter"
            } else {
              enemyType = "scout"
            }
          } else {
            // Desktop: Adjusted thresholds since we now start at effective wave 3
            spawnCount = game.wave > 6 && Math.random() < 0.2 ? 2 : 1

            const rand = Math.random()
            if (game.wave >= 10 && rand > 0.97) {
              enemyType = "guardian"
            } else if (game.wave >= 7 && rand > 0.9) {
              enemyType = "hunter"
            } else if (game.wave >= 5 && rand > 0.7) {
              enemyType = "bomber"
            } else if (rand > 0.5) {
              enemyType = "fighter"
            } else {
              enemyType = "scout"
            }
          }

          for (let i = 0; i < spawnCount; i++) {
            const enemy = createEnemy(enemyType)
            // Add some spawn position variation for swarms
            if (i > 0) {
              enemy.x += (Math.random() - 0.5) * 100
              enemy.x = Math.max(enemy.size, Math.min(canvas.width - enemy.size, enemy.x))
            }
            game.enemies.push(enemy)
          }

          game.lastEnemySpawn = game.gameTime
        }

        // Update bullets with new physics
        game.bullets = game.bullets.filter((bullet) => {
          bullet.x += bullet.vx
          bullet.y += bullet.vy
          // Bullets with momentum can go slightly off-screen horizontally
          return bullet.y > -10 && bullet.y < canvas.height + 10 && bullet.x > -50 && bullet.x < canvas.width + 50
        })

        // Update enemies with CHAOTIC BEHAVIOR
        game.enemies.forEach((enemy) => {
          enemy.behaviorTimer += deltaTime
          const chaosWave = Math.sin(game.gameTime * 0.001 + enemy.chaosOffset) * 0.5

          switch (enemy.behavior) {
            case "direct":
              if (game.player) {
                // Only target if player exists
                const dx = game.player.x - enemy.x
                const dy = game.player.y - enemy.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                // Avoid division by zero if enemy is exactly on player
                if (dist > 0) {
                  // Add chaos to direct movement
                  const chaosFactor = 1 + chaosWave * 0.3
                  enemy.x += (dx / dist) * enemy.speed * chaosFactor
                  enemy.y += (dy / dist) * enemy.speed * chaosFactor
                  // Random direction changes
                  if (Math.random() < 0.005) {
                    enemy.x += (Math.random() - 0.5) * 20
                  }
                }
              } else {
                // If player is gone, just move downwards
                enemy.y += enemy.speed
              }
              break

            case "zigzag":
              enemy.y += enemy.speed * (1 + chaosWave * 0.2)
              // More chaotic zigzag with variable speed and amplitude
              const zigzagAmplitude = 3 + chaosWave * 2
              enemy.x += Math.sin(game.gameTime * enemy.zigzagSpeed + enemy.zigzagOffset) * zigzagAmplitude
              break

            case "shoot":
              enemy.y += enemy.speed * 0.5 // Bomber moves slower
              // Bombers shoot back (much more frequent)
              const shootFreq = isMobile ? 2500 : 1500
              if (game.gameTime - enemy.lastShot > shootFreq && enemy.y > 0 && game.player) {
                // Only shoot when on screen and player exists
                const playerDx = game.player.x - enemy.x
                const playerDy = game.player.y - enemy.y
                const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy)
                if (playerDist > 0) {
                  // Sometimes shoot slightly off-target for chaos
                  const accuracy = Math.random() < 0.8 ? 1 : 0.7 + Math.random() * 0.6
                  game.bullets.push({
                    x: enemy.x,
                    y: enemy.y + 15,
                    vx: (playerDx / playerDist) * 3.5 * accuracy,
                    vy: (playerDy / playerDist) * 3.5 * accuracy,
                    friendly: false,
                  })
                }
                enemy.lastShot = game.gameTime
              }
              break

            case "strafe_shoot": // Hunter behavior
              enemy.y += enemy.speed * 0.4
              enemy.x += enemy.strafeDirection * enemy.speed * (1 + chaosWave * 0.3)
              if (enemy.x <= enemy.size || enemy.x >= canvas.width - enemy.size) {
                enemy.strafeDirection *= -1 // Reverse direction at edges
              }
              const hunterShootFreq = isMobile ? 1800 : 1200 // Much more frequent
              if (game.gameTime - enemy.lastShot > hunterShootFreq && enemy.y > 0 && game.player) {
                const playerDx = game.player.x - enemy.x
                const playerDy = game.player.y - enemy.y
                const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy)
                if (playerDist > 0) {
                  game.bullets.push({
                    x: enemy.x,
                    y: enemy.y + 10,
                    vx: (playerDx / playerDist) * 6,
                    vy: (playerDy / playerDist) * 6, // Even faster bullets
                    friendly: false,
                    color: "#f56565",
                  })
                }
                enemy.lastShot = game.gameTime
              }
              break

            case "spread_shot": // Guardian behavior
              enemy.y += enemy.speed
              const guardianShootFreq = isMobile ? 3500 : 2800 // More frequent
              if (game.gameTime - enemy.lastShot > guardianShootFreq && enemy.y > 0 && game.player) {
                const spread = [-0.4, -0.2, 0, 0.2, 0.4] // 5-shot spread instead of 3
                spread.forEach((angle) => {
                  game.bullets.push({
                    x: enemy.x,
                    y: enemy.y + 20,
                    vx: Math.sin(angle) * 3.5,
                    vy: Math.cos(angle) * 3.5,
                    friendly: false,
                    color: "#a0aec0",
                  })
                })
                enemy.lastShot = game.gameTime
              }
              break
          }
        })

        // Collision detection
        game.bullets.forEach((bullet, bulletIndex) => {
          if (bullet.friendly) {
            game.enemies.forEach((enemy, enemyIndex) => {
              const dx = bullet.x - enemy.x
              const dy = bullet.y - enemy.y
              const distance = Math.sqrt(dx * dx + dy * dy)

              if (distance < enemy.size / 2 + (isMobile ? 2 : 1)) {
                // Adjusted collision for bullet size
                // Hit enemy
                enemy.health -= isMobile ? 25 : 20 // More damage on mobile
                game.bullets.splice(bulletIndex, 1)

                // Create particles
                for (let i = 0; i < 5; i++) {
                  game.particles.push(createParticle(enemy.x, enemy.y, enemy.color))
                }

                if (enemy.health <= 0) {
                  game.score += enemy.points
                  game.enemies.splice(enemyIndex, 1)

                  // Explosion particles
                  for (let i = 0; i < 10; i++) {
                    game.particles.push(createParticle(enemy.x, enemy.y, "#ffff00"))
                  }
                }
              }
            })
          } else {
            // Enemy bullet hitting player or shield
            if (!game.player) return
            const dx = bullet.x - game.player.x
            const dy = bullet.y - game.player.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            const playerSize = isMobile ? 18 : 20
            const shieldRadius = playerSize * 2.2
            const hasShield = game.playerUpgrades.shield > 0

            if (hasShield && distance < shieldRadius) {
              // SHIELD REFLECTS BULLET
              // Calculate reflection angle
              const angle = Math.atan2(dy, dx)
              const reflectionSpeed = 4

              // Convert enemy bullet to friendly reflected bullet
              bullet.friendly = true
              bullet.vx = Math.cos(angle + Math.PI) * reflectionSpeed
              bullet.vy = Math.sin(angle + Math.PI) * reflectionSpeed
              bullet.color = "#0088ff" // Shield color

              // Shield reflection particles
              for (let i = 0; i < 5; i++) {
                game.particles.push(createParticle(bullet.x, bullet.y, "#0088ff"))
              }
            } else if (distance < playerSize / 2 + (isMobile ? 2 : 1)) {
              // Direct hit on player
              game.player.health -= isMobile ? 8 : 10
              setPlayerHealth(game.player.health)
              for (let i = 0; i < 3; i++) {
                game.particles.push(createParticle(game.player.x, game.player.y, "#ff0000"))
              }
              game.bullets.splice(bulletIndex, 1)

              if (game.player.health <= 0) {
                game.gameStatus = "exploding"
                triggerPlayerExplosion()
                explosionTimeoutRef.current = setTimeout(endGame, 2000)
              }
            }
          }
        })

        // Enemy-player collision and SHIELD DAMAGE
        if (game.player) {
          game.enemies.forEach((enemy, enemyIndex) => {
            if (!game.player) return

            const dx = enemy.x - game.player.x
            const dy = enemy.y - game.player.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            const playerSize = isMobile ? 18 : 20
            const hasShield = game.playerUpgrades.shield > 0
            const shieldRadius = playerSize * 2.2
            const collisionDistance = enemy.size / 2 + playerSize / 2

            if (hasShield && distance < shieldRadius) {
              // SHIELD DAMAGES ENEMY
              enemy.health -= isMobile ? 2 : 3 // Continuous shield damage

              // Shield damage particles
              for (let i = 0; i < 3; i++) {
                game.particles.push(createParticle(enemy.x, enemy.y, "#0088ff"))
              }

              // Push enemy away from shield
              const pushForce = 3
              enemy.x += (dx / distance) * pushForce
              enemy.y += (dy / distance) * pushForce

              if (enemy.health <= 0) {
                game.score += enemy.points
                game.enemies.splice(enemyIndex, 1)

                // Explosion particles
                for (let i = 0; i < 10; i++) {
                  game.particles.push(createParticle(enemy.x, enemy.y, "#ffff00"))
                }
              }
            } else if (distance < collisionDistance) {
              // Direct collision with player
              game.player.health -= isMobile ? 3 : 5
              setPlayerHealth(game.player.health)
              for (let i = 0; i < 5; i++) game.particles.push(createParticle(game.player.x, game.player.y, "#ff0000"))

              enemy.health -= 1
              game.player.x -= (dx / distance) * 2
              game.player.y -= (dy / distance) * 2

              if (game.player.health <= 0) {
                game.gameStatus = "exploding"
                triggerPlayerExplosion()
                explosionTimeoutRef.current = setTimeout(endGame, 2000)
              }
            }
          })
        }

        // Power-up collision detection - CHANGED TO IMMEDIATE ACTIVATION
        if (game.player) {
          const playerSize = isMobile ? 18 : 20
          game.powerUps.forEach((powerUp, powerUpIndex) => {
            const dx = powerUp.x - game.player.x
            const dy = powerUp.y - game.player.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < powerUp.size / 2 + playerSize / 2) {
              // Collected power-up - IMMEDIATE ACTIVATION
              game.powerUps.splice(powerUpIndex, 1)
              game.score += 100

              // Check if power-up should be stored or immediately activated
              // Mobile always activates immediately. Desktop has a chance to store.
              const shouldStore = !isMobile && Math.random() < 0.3 // 30% chance to store on desktop

              if (shouldStore) {
                // Try to add to ability slots first (desktop only)
                let addedToSlot = false
                for (let i = 0; i < game.abilitySlots.length; i++) {
                  if (!game.abilitySlots[i]) {
                    game.abilitySlots[i] = {
                      type: powerUp.type,
                      name: powerUp.name,
                      color: powerUp.color,
                      duration: powerUp.duration,
                    }
                    setAbilitySlots([...game.abilitySlots])
                    addedToSlot = true
                    console.log(`${powerUp.name} stored in slot ${i + 1}. Press ${i === 0 ? "Q" : "E"} to activate.`)
                    break
                  }
                }

                if (!addedToSlot) {
                  // Slots full, activate immediately
                  game.playerUpgrades[powerUp.type] = game.gameTime + powerUp.duration
                  console.log(`${powerUp.name} activated immediately (slots full)`)
                }
              } else {
                // Immediate activation (mobile or 70% chance on desktop)
                game.playerUpgrades[powerUp.type] = game.gameTime + powerUp.duration
                console.log(`${powerUp.name} activated immediately`)
              }

              // Create particles for collection feedback
              for (let i = 0; i < 8; i++) {
                game.particles.push(createParticle(powerUp.x, powerUp.y, powerUp.color))
              }
            }
          })
        }

        // Update upgrade timers
        Object.keys(game.playerUpgrades).forEach((upgrade) => {
          if (game.playerUpgrades[upgrade] > 0 && game.gameTime > game.playerUpgrades[upgrade]) {
            game.playerUpgrades[upgrade] = 0 // Deactivate upgrade
          }
        })

        // Sync ref values with state to trigger UI re-renders
        if (game.score !== score) {
          setScore(game.score)
        }
        if (game.wave !== wave) {
          setWave(game.wave)
        }
        // Sync ability slots with state if changed by powerup collection
        if (JSON.stringify(game.abilitySlots) !== JSON.stringify(abilitySlots)) {
          setAbilitySlots([...game.abilitySlots])
        }
      }

      // Update all particles (explosion and smoke)
      game.particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--
        particle.vx *= 0.98
        particle.vy *= 0.98
      })
      game.particles = game.particles.filter((p) => p.life > 0)

      game.smokeParticles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--
        particle.vx *= 0.98
        particle.vy *= 0.98
      })
      game.smokeParticles = game.smokeParticles.filter((p) => p.life > 0)

      if (game.gameStatus === "playing") {
        // Remove off-screen enemies
        game.enemies = game.enemies.filter((enemy) => enemy.y < canvas.height + 50)
      }

      // --- DRAWING FUNCTIONS ---

      const drawPlayer = (player, upgrades) => {
        if (!player) return // Don't draw player if it's null (exploding)
        ctx.save()
        ctx.translate(player.x, player.y)
        const size = isMobile ? 14 : 12

        const healthRatio = player.health / player.maxHealth
        const isDamaged = healthRatio < 0.3

        // Flicker when heavily damaged
        if (isDamaged && Math.floor(game.gameTime / 100) % 2 === 0) {
          ctx.globalAlpha = 0.7
        }

        // --- POWER-UP VISUALS (drawn first to be underneath) ---
        if (upgrades.speed > 0) {
          ctx.fillStyle = `rgba(255, 136, 0, ${0.4 + Math.sin(game.gameTime * 0.02) * 0.3})`
          ctx.beginPath()
          ctx.moveTo(0, size * 0.8)
          ctx.lineTo(size * 0.5, size * 1.2)
          ctx.lineTo(0, size * 1.6)
          ctx.lineTo(-size * 0.5, size * 1.2)
          ctx.closePath()
          ctx.fill()
        }

        // --- SHIP BODY ---
        // Main Body
        ctx.fillStyle = isDamaged ? "#ff8800" : "#00dd00" // Change color when damaged
        ctx.beginPath()
        ctx.moveTo(0, -size) // Top point
        ctx.lineTo(size * 0.8, size * 0.8)
        ctx.lineTo(0, size * 0.5)
        ctx.lineTo(-size * 0.8, size * 0.8)
        ctx.closePath()
        ctx.fill()

        // Cockpit
        ctx.fillStyle = "#aaffaa"
        ctx.beginPath()
        ctx.moveTo(0, -size * 0.4)
        ctx.lineTo(size * 0.4, size * 0.2)
        ctx.lineTo(0, size * 0.4)
        ctx.lineTo(-size * 0.4, size * 0.2)
        ctx.closePath()
        ctx.fill()

        // --- MORE POWER-UP VISUALS (drawn on top) ---
        if (upgrades.dualShot > 0 && !isMobile) {
          ctx.fillStyle = "#00ff00"
          ctx.fillRect(-size, size * 0.2, 4, 6)
          ctx.fillRect(size - 4, size * 0.2, 4, 6)
        }
        if (upgrades.rapidFire > 0) {
          ctx.fillStyle = `rgba(255, 255, 0, ${0.6 + Math.sin(game.gameTime * 0.05) * 0.4})`
          ctx.beginPath()
          ctx.arc(0, -size * 1.2, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
        ctx.globalAlpha = 1 // Reset alpha after potential flicker

        // Shield is drawn last in player's original coordinate space
        if (upgrades.shield > 0) {
          const shieldAlpha = Math.max(0.2, (upgrades.shield - game.gameTime) / powerUpTypes.shield.duration)
          ctx.strokeStyle = `rgba(0, 136, 255, ${shieldAlpha})`
          ctx.fillStyle = `rgba(0, 136, 255, ${shieldAlpha * 0.1})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(player.x, player.y, size * 2.2, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fill()
        }
      }

      const drawEnemy = (enemy) => {
        ctx.save()
        ctx.translate(enemy.x, enemy.y)
        const size = enemy.size / 2

        ctx.fillStyle = enemy.color
        ctx.beginPath()

        switch (enemy.type) {
          case "scout": // More aggressive arrow/jet design
            ctx.moveTo(0, -size * 1.5)
            ctx.lineTo(size, size * 0.5)
            ctx.lineTo(size * 0.5, size)
            ctx.lineTo(-size * 0.5, size)
            ctx.lineTo(-size, size * 0.5)
            break
          case "fighter": // Crescent / Bat-wing shape
            ctx.moveTo(0, -size * 0.5)
            ctx.quadraticCurveTo(size * 1.5, 0, 0, size)
            ctx.quadraticCurveTo(-size * 1.5, 0, 0, -size * 0.5)
            break
          case "bomber": // Bulky Hexagon
            ctx.moveTo(size * 0.8, -size)
            ctx.lineTo(size * 1.2, 0)
            ctx.lineTo(size * 0.8, size)
            ctx.lineTo(-size * 0.8, size)
            ctx.lineTo(-size * 1.2, 0)
            ctx.lineTo(-size * 0.8, -size)
            break
          case "hunter": // Sleek, arrowhead design
            ctx.moveTo(0, -size)
            ctx.lineTo(size * 0.8, size)
            ctx.lineTo(0, size * 0.6)
            ctx.lineTo(-size * 0.8, size)
            break
          case "guardian": // Heavy, shielded diamond
            ctx.moveTo(0, -size * 1.2)
            ctx.lineTo(size, 0)
            ctx.lineTo(0, size * 1.2)
            ctx.lineTo(-size, 0)
            break
          default:
            // Fallback for undefined enemy types (e.g., if a new type is added but not drawn)
            ctx.arc(0, 0, size, 0, Math.PI * 2) // Draw a circle
            break
        }
        ctx.closePath()
        ctx.fill()

        // Add details based on type
        if (enemy.type === "scout") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
          ctx.beginPath()
          ctx.moveTo(0, -size * 0.8)
          ctx.lineTo(size * 0.3, -size * 0.4)
          ctx.lineTo(-size * 0.3, -size * 0.4)
          ctx.closePath()
          ctx.fill()
        } else if (enemy.type === "bomber") {
          ctx.fillStyle = "rgba(255,255,255,0.3)"
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2)
          ctx.fill()
        } else if (enemy.type === "guardian") {
          ctx.fillStyle = "rgba(255,255,255,0.6)"
          ctx.beginPath()
          ctx.moveTo(0, -size * 0.6)
          ctx.lineTo(size * 0.5, 0)
          ctx.lineTo(0, size * 0.6)
          ctx.lineTo(-size * 0.5, 0)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()

        // Health bar (drawn after restoring context)
        if (enemy.health < enemy.maxHealth) {
          const barHeight = isMobile ? 4 : 3
          const barY = enemy.y - size - (isMobile ? 10 : 8)
          ctx.fillStyle = "#ff0000"
          ctx.fillRect(enemy.x - size, barY, size * 2, barHeight)
          ctx.fillStyle = "#00ff00"
          const healthWidth = (enemy.health / enemy.maxHealth) * (size * 2)
          ctx.fillRect(enemy.x - size, barY, healthWidth, barHeight)
        }
      }

      // --- MAIN DRAW SEQUENCE ---

      // Draw smoke first, so it's behind other particles
      game.smokeParticles.forEach((particle) => {
        ctx.globalAlpha = particle.life / 60
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw explosion particles
      game.particles.forEach((particle) => {
        ctx.globalAlpha = particle.life / 30
        ctx.fillStyle = particle.color
        ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size)
      })
      ctx.globalAlpha = 1

      // Draw game objects only if not exploding
      if (game.gameStatus === "playing") {
        game.powerUps.forEach((powerUp) => {
          ctx.fillStyle = powerUp.color
          ctx.fillRect(powerUp.x - powerUp.size / 2, powerUp.y - powerUp.size / 2, powerUp.size, powerUp.size)
          ctx.globalAlpha = 0.3
          ctx.fillRect(powerUp.x - powerUp.size, powerUp.y - powerUp.size, powerUp.size * 2, powerUp.size * 2)
          ctx.globalAlpha = 1
        })

        drawPlayer(game.player, game.playerUpgrades)

        game.bullets.forEach((bullet) => {
          ctx.fillStyle = bullet.color || (bullet.friendly ? "#00ffff" : "#ff0044")
          const bulletSize = isMobile ? 4 : 2
          const bulletHeight = isMobile ? 12 : 10
          ctx.save()
          ctx.shadowBlur = 8
          ctx.shadowColor = ctx.fillStyle
          ctx.fillRect(bullet.x - bulletSize / 2, bullet.y - bulletHeight / 2, bulletSize, bulletHeight)
          ctx.restore()
        })

        game.enemies.forEach(drawEnemy)
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    },
    [
      isMobile,
      mobileInput,
      endGame,
      createEnemy,
      createParticle,
      createPowerUp,
      triggerPlayerExplosion,
      score,
      wave,
      abilitySlots,
      powerUpTypes,
      isLandscape, // Added isLandscape to dependencies
    ],
  )

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
    }

    // Add canvas click listener for ability usage (keep for any remaining click functionality)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("click", handleCanvasClick)
    }

    // Initial call to start the game loop
    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
      }
      if (canvas) {
        canvas.removeEventListener("click", handleCanvasClick)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [handleKeyDown, handleKeyUp, gameLoop, isMobile, handleCanvasClick])

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-black text-white overflow-hidden",
        isMobile ? "w-full h-full min-h-screen" : "w-full h-full min-h-[600px]",
      )}
    >
      {gameState !== "playing" && (
        <div
          className={cn("absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm", isMobile ? "p-3" : "p-4")}
        >
          <div className="flex items-center justify-between">
            <h1 className={cn("font-bold text-cyan-400", isMobile ? "text-lg" : "text-2xl")}>GALACTIC VANGUARD</h1>
            <button
              onClick={onExit}
              className={cn(
                "px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white font-mono transition-colors",
                isMobile ? "text-sm min-h-[44px] px-4" : "text-base",
              )}
            >
              EXIT
            </button>
          </div>
        </div>
      )}

      <div className={cn("relative", isMobile ? "w-full h-full flex items-center justify-center" : "")}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className={cn("border border-cyan-500 bg-black", isMobile ? "max-w-full max-h-full" : "")}
          style={{
            imageRendering: "pixelated",
            touchAction: "none",
          }}
        />
      </div>

      {gameState === "playing" && (
        <>
          {isMobile ? (
            <MobileGameUI
              score={score}
              abilitySlots={abilitySlots}
              selectedAbilitySlot={selectedAbilitySlot}
              onAbilitySlotClick={handleAbilitySlotClick}
              isPortrait={!isLandscape}
            />
          ) : (
            <GameUI
              score={score}
              health={playerHealth}
              maxHealth={playerMaxHealth}
              abilitySlots={abilitySlots}
              selectedAbilitySlot={selectedAbilitySlot}
              onAbilitySlotClick={handleAbilitySlotClick}
            />
          )}
        </>
      )}

      {gameState === "start" && (
        <StartScreen onStart={startGame} playerName={playerName} setPlayerName={setPlayerName} isMobile={isMobile} />
      )}

      {gameState === "gameOver" && (
        <GameOverScreen
          score={gameStateRef.current.score}
          wave={gameStateRef.current.wave}
          onRestart={() => {
            setGameState("start")
          }}
          isMobile={isMobile}
        />
      )}

      {!isMobile && gameState === "playing" && (
        <div className="mt-4 text-cyan-400 text-center">
          <p className="text-sm">Use WASD or Arrow Keys to move • Auto-firing enabled</p>
          <p className="text-xs text-yellow-400 mt-1">
            Power-ups activate on pickup (30% chance to store) • Press Q/E to use stored abilities
          </p>
          {selectedAbilitySlot !== null && (
            <p className="text-xs text-yellow-400 mt-1">Click anywhere on the game area to use selected ability</p>
          )}
        </div>
      )}
      {isMobile && gameState === "playing" && (
        <div className="mt-4 text-cyan-400 text-center">
          <p className="text-sm">Touch and drag anywhere on screen to move</p>
          <p className="text-xs text-yellow-400 mt-1">Power-ups activate immediately when collected</p>
          {selectedAbilitySlot !== null && (
            <p className="text-xs text-yellow-400 mt-1">Tap anywhere on the game area to use selected ability</p>
          )}
        </div>
      )}
    </div>
  )
}
