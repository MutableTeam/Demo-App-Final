import type { Howl } from "howler"

type SoundType =
  | "coin"
  | "bow-draw"
  | "bow-release"
  | "bow-full-draw"
  | "special-attack"
  | "hit"
  | "death"
  | "pickup"
  | "dash"
  | "background-music"
  | "menu-music"
  | "game-over"
  | "victory"
  | "intro"
  | "connect"
  | "disconnect"
  | "error"
  | "explosion"

class AudioManager {
  private static instance: AudioManager
  private muted = false
  private volume = 0.5
  private initialized = false
  private audioContext: AudioContext | null = null
  private backgroundMusicNode: OscillatorNode | null = null
  private backgroundMusicGainNode: GainNode | null = null
  private backgroundMusicPlaying = false
  private lastPlayedTime: Map<string, number> = new Map()
  private minTimeBetweenSounds = 100
  private unlocked = false

  private sounds: { [key: string]: Howl } = {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  public init(): void {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      this.initialized = true

      this.setupUnlockEvents()
    } catch (error) {
      console.error("Error initializing audio manager:", error)
    }
  }

  private setupUnlockEvents(): void {
    const unlockEvents = ["touchstart", "touchend", "mousedown", "keydown"]

    const unlock = () => {
      if (this.unlocked) return

      this.unlockAudio()

      unlockEvents.forEach((event) => {
        document.removeEventListener(event, unlock)
      })

      this.unlocked = true
    }

    unlockEvents.forEach((event) => {
      document.addEventListener(event, unlock, { once: true })
    })
  }

  private unlockAudio(): void {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      gainNode.gain.value = 0.001

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start(0)
      oscillator.stop(0.1)

      if (this.audioContext.state === "suspended") {
        this.audioContext
          .resume()
          .then(() => {})
          .catch((err) => {
            console.error("Failed to resume audio context:", err)
          })
      }
    } catch (error) {
      console.error("Error unlocking audio:", error)
    }
  }

  public playSound(type: SoundType): void {
    if (this.muted || !this.initialized || !this.audioContext) return

    try {
      const now = Date.now()
      const lastPlayed = this.lastPlayedTime.get(type) || 0

      if (now - lastPlayed < this.minTimeBetweenSounds) {
        return
      }

      this.lastPlayedTime.set(type, now)

      this.playGeneratedSound(type)
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error)
    }
  }

  private playGeneratedSound(type: SoundType): void {
    if (!this.audioContext) return

    try {
      switch (type) {
        case "coin":
          this.playCoinSound()
          break
        case "bow-draw":
          this.playBowDrawSound()
          break
        case "bow-release":
          this.playBowReleaseSound()
          break
        case "bow-full-draw":
          this.playBowFullDrawSound()
          break
        case "special-attack":
          this.playSpecialAttackSound()
          break
        case "hit":
          this.playHitSound()
          break
        case "death":
          this.playDeathSound()
          break
        case "pickup":
          this.playPickupSound()
          break
        case "dash":
          this.playDashSound()
          break
        case "game-over":
          this.playGameOverSound()
          break
        case "victory":
          this.playVictorySound()
          break
        case "intro":
          this.playIntroSound()
          break
        case "connect":
          this.playConnectSound()
          break
        case "disconnect":
          this.playDisconnectSound()
          break
        case "error":
          this.playErrorSound()
          break
        case "explosion":
          this.playExplosionSound()
          break
        default:
          this.playDefaultSound()
      }
    } catch (error) {
      console.error(`Error playing generated sound ${type}:`, error)
    }
  }

  private playCoinSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(880 + Math.random() * 220, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.1)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playBowDrawSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "triangle"
    oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime)
    oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + 0.3)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.3)
    gainNode.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.4)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playBowReleaseSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1)

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(5000, this.audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.15)

    oscillator.onended = () => {
      oscillator.disconnect()
      filter.disconnect()
      gainNode.disconnect()
    }
  }

  private playBowFullDrawSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime)
    oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.3)
    gainNode.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.4)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playSpecialAttackSound(): void {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    oscillator1.type = "sawtooth"
    oscillator1.frequency.setValueAtTime(220, this.audioContext.currentTime)
    oscillator1.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5)

    oscillator2.type = "square"
    oscillator2.frequency.setValueAtTime(440, this.audioContext.currentTime)
    oscillator2.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.5)

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(5000, this.audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.5)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, this.audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5)

    oscillator1.connect(filter)
    oscillator2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.start()
    oscillator2.start()
    oscillator1.stop(this.audioContext.currentTime + 0.5)
    oscillator2.stop(this.audioContext.currentTime + 0.5)

    oscillator1.onended = () => {
      oscillator1.disconnect()
      oscillator2.disconnect()
      filter.disconnect()
      gainNode.disconnect()
    }
  }

  private playHitSound(): void {
    if (!this.audioContext) return

    const bufferSize = 4096
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = noiseBuffer

    const filter = this.audioContext.createBiquadFilter()
    const gainNode = this.audioContext.createGain()

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    noise.start()
    noise.stop(this.audioContext.currentTime + 0.15)

    noise.onended = () => {
      noise.disconnect()
      filter.disconnect()
      gainNode.disconnect()
    }
  }

  private playDeathSound(): void {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator1.type = "sawtooth"
    oscillator1.frequency.setValueAtTime(440, this.audioContext.currentTime)
    oscillator1.frequency.exponentialRampToValueAtTime(55, this.audioContext.currentTime + 0.8)

    oscillator2.type = "sine"
    oscillator2.frequency.setValueAtTime(220, this.audioContext.currentTime)
    oscillator2.frequency.exponentialRampToValueAtTime(27.5, this.audioContext.currentTime + 0.8)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.4)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8)

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.start()
    oscillator2.start()
    oscillator1.stop(this.audioContext.currentTime + 0.8)
    oscillator2.stop(this.audioContext.currentTime + 0.8)

    oscillator1.onended = () => {
      oscillator1.disconnect()
      oscillator2.disconnect()
      gainNode.disconnect()
    }
  }

  private playPickupSound(): void {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator1.type = "sine"
    oscillator1.frequency.setValueAtTime(880, this.audioContext.currentTime)
    oscillator1.frequency.setValueAtTime(1320, this.audioContext.currentTime + 0.1)

    oscillator2.type = "sine"
    oscillator2.frequency.setValueAtTime(1320, this.audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(1760, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.start()
    oscillator2.start()
    oscillator1.stop(this.audioContext.currentTime + 0.2)
    oscillator2.stop(this.audioContext.currentTime + 0.2)

    oscillator1.onended = () => {
      oscillator1.disconnect()
      oscillator2.disconnect()
      gainNode.disconnect()
    }
  }

  private playDashSound(): void {
    if (!this.audioContext) return

    const bufferSize = 4096
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = noiseBuffer

    const filter = this.audioContext.createBiquadFilter()
    const gainNode = this.audioContext.createGain()

    filter.type = "bandpass"
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2)
    filter.Q.value = 1.0

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    noise.start()
    noise.stop(this.audioContext.currentTime + 0.2)

    noise.onended = () => {
      noise.disconnect()
      filter.disconnect()
      gainNode.disconnect()
    }
  }

  private playGameOverSound(): void {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator1.type = "sine"
    oscillator1.frequency.setValueAtTime(440, this.audioContext.currentTime)
    oscillator1.frequency.setValueAtTime(415.3, this.audioContext.currentTime + 0.5)
    oscillator1.frequency.setValueAtTime(392, this.audioContext.currentTime + 1.0)
    oscillator1.frequency.setValueAtTime(349.2, this.audioContext.currentTime + 1.5)

    oscillator2.type = "triangle"
    oscillator2.frequency.setValueAtTime(220, this.audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(207.65, this.audioContext.currentTime + 0.5)
    oscillator2.frequency.setValueAtTime(196, this.audioContext.currentTime + 1.0)
    oscillator2.frequency.setValueAtTime(174.6, this.audioContext.currentTime + 1.5)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 1.5)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2.0)

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.start()
    oscillator2.start()
    oscillator1.stop(this.audioContext.currentTime + 2.0)
    oscillator2.stop(this.audioContext.currentTime + 2.0)

    oscillator1.onended = () => {
      oscillator1.disconnect()
      oscillator2.disconnect()
      gainNode.disconnect()
    }
  }

  private playVictorySound(): void {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator1.type = "square"
    oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime)
    oscillator1.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.2)
    oscillator1.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.4)
    oscillator1.frequency.setValueAtTime(1046.5, this.audioContext.currentTime + 0.6)

    oscillator2.type = "triangle"
    oscillator2.frequency.setValueAtTime(261.63, this.audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(329.63, this.audioContext.currentTime + 0.2)
    oscillator2.frequency.setValueAtTime(392, this.audioContext.currentTime + 0.4)
    oscillator2.frequency.setValueAtTime(523.25, this.audioContext.currentTime + 0.6)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.8)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2)

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.start()
    oscillator2.start()
    oscillator1.stop(this.audioContext.currentTime + 1.2)
    oscillator2.stop(this.audioContext.currentTime + 1.2)

    oscillator1.onended = () => {
      oscillator1.disconnect()
      oscillator2.disconnect()
      gainNode.disconnect()
    }
  }

  private playIntroSound(): void {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator1.type = "sine"
    oscillator1.frequency.setValueAtTime(392, this.audioContext.currentTime)
    oscillator1.frequency.setValueAtTime(493.88, this.audioContext.currentTime + 0.3)
    oscillator1.frequency.setValueAtTime(587.33, this.audioContext.currentTime + 0.6)

    oscillator2.type = "triangle"
    oscillator2.frequency.setValueAtTime(196, this.audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(246.94, this.audioContext.currentTime + 0.3)
    oscillator2.frequency.setValueAtTime(293.66, this.audioContext.currentTime + 0.6)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.7)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.0)

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.start()
    oscillator2.start()
    oscillator1.stop(this.audioContext.currentTime + 1.0)
    oscillator2.stop(this.audioContext.currentTime + 1.0)

    oscillator1.onended = () => {
      oscillator1.disconnect()
      oscillator2.disconnect()
      gainNode.disconnect()
    }
  }

  private playConnectSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.2)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playDisconnectSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "triangle"
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.2)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playErrorSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.3)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.3)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playDefaultSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.value = 440

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.2)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  private playExplosionSound(): void {
    if (!this.audioContext) return

    // Create noise for explosion
    const bufferSize = 4096
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = noiseBuffer

    // Create oscillator for the boom sound
    const oscillator = this.audioContext.createOscillator()
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.5)

    // Create filters
    const noiseFilter = this.audioContext.createBiquadFilter()
    const oscillatorFilter = this.audioContext.createBiquadFilter()
    const masterFilter = this.audioContext.createBiquadFilter()

    noiseFilter.type = "lowpass"
    noiseFilter.frequency.setValueAtTime(1000, this.audioContext.currentTime)
    noiseFilter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5)

    oscillatorFilter.type = "lowpass"
    oscillatorFilter.frequency.setValueAtTime(100, this.audioContext.currentTime)

    masterFilter.type = "lowpass"
    masterFilter.frequency.setValueAtTime(1000, this.audioContext.currentTime)
    masterFilter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.8)

    // Create gain nodes
    const noiseGain = this.audioContext.createGain()
    const oscillatorGain = this.audioContext.createGain()
    const masterGain = this.audioContext.createGain()

    // Set gain values
    noiseGain.gain.setValueAtTime(0, this.audioContext.currentTime)
    noiseGain.gain.linearRampToValueAtTime(this.volume * 1.0, this.audioContext.currentTime + 0.05)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5)

    oscillatorGain.gain.setValueAtTime(0, this.audioContext.currentTime)
    oscillatorGain.gain.linearRampToValueAtTime(this.volume * 0.8, this.audioContext.currentTime + 0.05)
    oscillatorGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8)

    masterGain.gain.setValueAtTime(this.volume * 0.8, this.audioContext.currentTime)

    // Connect everything
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(masterFilter)

    oscillator.connect(oscillatorFilter)
    oscillatorFilter.connect(oscillatorGain)
    oscillatorGain.connect(masterFilter)

    masterFilter.connect(masterGain)
    masterGain.connect(this.audioContext.destination)

    // Start and stop
    noise.start()
    oscillator.start()
    noise.stop(this.audioContext.currentTime + 0.5)
    oscillator.stop(this.audioContext.currentTime + 0.8)

    // Clean up
    noise.onended = () => {
      noise.disconnect()
      oscillator.disconnect()
      noiseFilter.disconnect()
      oscillatorFilter.disconnect()
      masterFilter.disconnect()
      noiseGain.disconnect()
      oscillatorGain.disconnect()
      masterGain.disconnect()
    }
  }

  public startBackgroundMusic(): void {
    if (this.muted || !this.initialized || !this.audioContext || this.backgroundMusicPlaying) return

    try {
      this.stopBackgroundMusic()

      // Create oscillators for different parts of the music
      const bassOsc = this.audioContext.createOscillator()
      const melodyOsc = this.audioContext.createOscillator()
      const padOsc = this.audioContext.createOscillator()

      // Create gain nodes for volume control
      const bassGain = this.audioContext.createGain()
      const melodyGain = this.audioContext.createGain()
      const padGain = this.audioContext.createGain()

      // Master gain node
      this.backgroundMusicGainNode = this.audioContext.createGain()

      // Set oscillator types
      bassOsc.type = "triangle"
      melodyOsc.type = "sine"
      padOsc.type = "sine"

      // Set initial frequencies
      bassOsc.frequency.value = 110 // A2
      melodyOsc.frequency.value = 440 // A4
      padOsc.frequency.value = 220 // A3

      // Create LFOs for more interesting variations
      const bassLFO = this.audioContext.createOscillator()
      const melodyLFO = this.audioContext.createOscillator()

      bassLFO.type = "sine"
      bassLFO.frequency.value = 0.05 // Very slow modulation

      melodyLFO.type = "triangle"
      melodyLFO.frequency.value = 0.1 // Slow modulation

      const bassLFOGain = this.audioContext.createGain()
      const melodyLFOGain = this.audioContext.createGain()

      bassLFOGain.gain.value = 10 // Subtle pitch variation
      melodyLFOGain.gain.value = 20 // More noticeable pitch variation

      // Connect LFOs to oscillator frequencies
      bassLFO.connect(bassLFOGain)
      bassLFOGain.connect(bassOsc.frequency)

      melodyLFO.connect(melodyLFOGain)
      melodyLFOGain.connect(melodyOsc.frequency)

      // Set gain values
      bassGain.gain.value = this.volume * 0.15
      melodyGain.gain.value = this.volume * 0.08
      padGain.gain.value = this.volume * 0.05

      this.backgroundMusicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      this.backgroundMusicGainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 2)

      // Connect oscillators to their gain nodes
      bassOsc.connect(bassGain)
      melodyOsc.connect(melodyGain)
      padOsc.connect(padGain)

      // Connect gain nodes to master gain
      bassGain.connect(this.backgroundMusicGainNode)
      melodyGain.connect(this.backgroundMusicGainNode)
      padGain.connect(this.backgroundMusicGainNode)

      // Connect master gain to output
      this.backgroundMusicGainNode.connect(this.audioContext.destination)

      // Create melody patterns using scheduled frequency changes
      this.scheduleMelodyPatterns(melodyOsc)

      // Create bass patterns
      this.scheduleBassPatterns(bassOsc)

      // Start all oscillators
      bassOsc.start()
      melodyOsc.start()
      padOsc.start()
      bassLFO.start()
      melodyLFO.start()

      // Store reference to main oscillator for stopping later
      this.backgroundMusicNode = bassOsc

      this.backgroundMusicPlaying = true
    } catch (error) {
      console.error("Error starting background music:", error)
    }
  }

  // Add these new methods for creating more varied music patterns
  private scheduleMelodyPatterns(oscillator: OscillatorNode): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const noteLength = 0.5 // Half a second per note

    // Define a simple pentatonic scale
    const pentatonicScale = [440, 493.88, 554.37, 659.25, 739.99]

    // Create a more varied melody pattern
    const melodyPattern = [
      pentatonicScale[0], // A4
      pentatonicScale[2], // C#5
      pentatonicScale[1], // B4
      pentatonicScale[3], // E5
      pentatonicScale[0], // A4
      pentatonicScale[4], // F#5
      pentatonicScale[2], // C#5
      pentatonicScale[1], // B4

      // Variation
      pentatonicScale[3], // E5
      pentatonicScale[1], // B4
      pentatonicScale[4], // F#5
      pentatonicScale[0], // A4
      pentatonicScale[2], // C#5
      pentatonicScale[3], // E5
      pentatonicScale[1], // B4
      pentatonicScale[0], // A4
    ]

    // Schedule the melody pattern
    for (let i = 0; i < melodyPattern.length; i++) {
      oscillator.frequency.setValueAtTime(melodyPattern[i], now + i * noteLength)
    }

    // Schedule the next pattern to create a continuous loop with variations
    setTimeout(
      () => {
        if (this.backgroundMusicPlaying && this.audioContext) {
          // Add slight variations to the pattern each time
          this.scheduleMelodyPatterns(oscillator)
        }
      },
      melodyPattern.length * noteLength * 1000 - 50,
    ) // Schedule slightly before end to avoid gaps
  }

  private scheduleBassPatterns(oscillator: OscillatorNode): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const noteLength = 1.0 // One second per bass note

    // Define bass notes (octave lower than melody)
    const bassNotes = [110, 146.83, 164.81, 196, 220]

    // Create a simple bass pattern
    const bassPattern = [
      bassNotes[0], // A2
      bassNotes[0], // A2
      bassNotes[3], // E3
      bassNotes[3], // E3

      // Variation
      bassNotes[2], // D3
      bassNotes[2], // D3
      bassNotes[4], // A3
      bassNotes[0], // A2
    ]

    // Schedule the bass pattern
    for (let i = 0; i < bassPattern.length; i++) {
      oscillator.frequency.setValueAtTime(bassPattern[i], now + i * noteLength)
    }

    // Schedule the next pattern
    setTimeout(
      () => {
        if (this.backgroundMusicPlaying && this.audioContext) {
          this.scheduleBassPatterns(oscillator)
        }
      },
      bassPattern.length * noteLength * 1000 - 50,
    ) // Schedule slightly before end to avoid gaps
  }

  public stopBackgroundMusic(): void {
    if (!this.audioContext || !this.backgroundMusicNode || !this.backgroundMusicGainNode) return

    try {
      this.backgroundMusicGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1)

      setTimeout(() => {
        if (this.backgroundMusicNode) {
          this.backgroundMusicNode.stop()
          this.backgroundMusicNode = null
        }
        this.backgroundMusicPlaying = false
      }, 1000)
    } catch (error) {
      console.error("Error stopping background music:", error)
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted

    if (!this.muted && this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch((err) => {
        console.error("Failed to resume audio context:", err)
      })
    }

    if (this.backgroundMusicGainNode) {
      this.backgroundMusicGainNode.gain.value = this.muted ? 0 : this.volume * 0.2
    }

    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted

    if (!this.muted && this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch((err) => {
        console.error("Failed to resume audio context:", err)
      })
    }

    if (this.backgroundMusicGainNode) {
      this.backgroundMusicGainNode.gain.value = this.muted ? 0 : this.volume * 0.2
    }
  }

  public isSoundMuted(): boolean {
    return this.muted
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))

    if (this.backgroundMusicGainNode && !this.muted) {
      this.backgroundMusicGainNode.gain.value = this.volume * 0.2
    }
  }

  public getVolume(): number {
    return this.volume
  }

  public resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext
        .resume()
        .then(() => {})
        .catch((err) => {
          console.error("Failed to resume audio context:", err)
        })
    }
  }
}

// Export functions outside the class
export const audioManager = AudioManager.getInstance()

export const playExplosionSound = (): void => {
  audioManager.playSound("explosion")
}

export const playRandomCoinSound = (): void => {
  audioManager.playSound("coin")
}

export const playBowDrawSound = (): void => {
  audioManager.playSound("bow-draw")
}

export const playBowReleaseSound = (): void => {
  audioManager.playSound("bow-release")
}

export const playBowFullDrawSound = (): void => {
  audioManager.playSound("bow-full-draw")
}

export const playSpecialAttackSound = (): void => {
  audioManager.playSound("special-attack")
}

export const playHitSound = (): void => {
  audioManager.playSound("hit")
}

export const playDeathSound = (): void => {
  audioManager.playSound("death")
}

export const playDashSound = (): void => {
  audioManager.playSound("dash")
}

export const playPickupSound = (): void => {
  audioManager.playSound("pickup")
}

export const playGameOverSound = (): void => {
  audioManager.playSound("game-over")
}

export const playVictorySound = (): void => {
  audioManager.playSound("victory")
}

export const playIntroSound = (): void => {
  audioManager.playSound("intro")
}

export const playConnectSound = (): void => {
  audioManager.playSound("connect")
}

export const playDisconnectSound = (): void => {
  audioManager.playSound("disconnect")
}

export const playErrorSound = (): void => {
  audioManager.playSound("error")
}

export const initializeAudio = async (): Promise<void> => {
  audioManager.init()
  return Promise.resolve()
}

export const startBackgroundMusic = (): void => {
  audioManager.startBackgroundMusic()
}

export const stopBackgroundMusic = (): void => {
  audioManager.stopBackgroundMusic()
}

export const loadAudioFiles = async (): Promise<void> => {
  // Placeholder function to simulate loading audio files
  // In a real implementation, this would load audio files from the server or local storage
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("Audio files loaded successfully")
      resolve()
    }, 500)
  })
}

// Add this function to play a sound when buttons are clicked
export function playCoinSoundEffect() {
  if (!audioManager.isSoundMuted()) {
    const coinSounds = ["coin1", "coin2", "coin3", "coin4"]
    const randomCoin = coinSounds[Math.floor(Math.random() * coinSounds.length)]
    audioManager.playSound(randomCoin, 0.3)
  }
}

export default audioManager
