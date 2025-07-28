"use client"

import type React from "react"
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { X, Maximize2, Minimize2 } from "lucide-react"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { debugManager } from "@/utils/debug-utils"

const textShadowGlow = `
  .text-shadow-glow {
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5);
  }
`

if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = textShadowGlow
  document.head.appendChild(style)
}

interface GamePopOutContainerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export interface GamePopOutContainerRef {
  triggerFullscreen: () => void
}

const GamePopOutContainer = forwardRef<GamePopOutContainerRef, GamePopOutContainerProps>(
  ({ isOpen, onClose, title = "MUTABLE GAME", children }, ref) => {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      triggerFullscreen: () => {
        if (containerRef.current && document.fullscreenEnabled) {
          containerRef.current.requestFullscreen().catch((err) => {
            debugManager.logError("Fullscreen", "Error attempting to enable fullscreen mode:", err)
          })
        }
      },
    }))

    useEffect(() => {
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen && !document.fullscreenElement) {
          onClose()
        }
      }
      window.addEventListener("keydown", handleEscKey)
      return () => window.removeEventListener("keydown", handleEscKey)
    }, [isOpen, onClose])

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch((err) => {
            debugManager.logError("Fullscreen", "Error attempting to enable fullscreen mode:", err)
          })
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }

    useEffect(() => {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement
        setIsFullscreen(isCurrentlyFullscreen)
        if (!isCurrentlyFullscreen && isOpen) {
          onClose()
        }
      }
      document.addEventListener("fullscreenchange", handleFullscreenChange)
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [isOpen, onClose])

    useEffect(() => {
      const resizeGameToFit = () => {
        if (!containerRef.current) return
        const gameContent = containerRef.current.querySelector(".game-container-wrapper") as HTMLElement
        if (!gameContent) return

        const containerWidth = gameContent.clientWidth
        const containerHeight = gameContent.clientHeight

        const gameCanvas = gameContent.querySelector("canvas")
        if (!gameCanvas) return

        const gameAspectRatio = gameCanvas.width / gameCanvas.height
        const containerAspectRatio = containerWidth / containerHeight

        let newWidth, newHeight
        if (containerAspectRatio > gameAspectRatio) {
          newHeight = containerHeight * 0.95
          newWidth = newHeight * gameAspectRatio
        } else {
          newWidth = containerWidth * 0.95
          newHeight = newWidth / gameAspectRatio
        }

        gameCanvas.style.width = `${newWidth}px`
        gameCanvas.style.height = `${newHeight}px`
        gameCanvas.style.display = "block"
      }

      if (isOpen) {
        setTimeout(resizeGameToFit, 100)
      }
      window.addEventListener("resize", resizeGameToFit)
      return () => window.removeEventListener("resize", resizeGameToFit)
    }, [isOpen])

    return (
      <div
        ref={containerRef}
        className={`fixed inset-0 z-50 flex items-center justify-center p-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-[#fbf3de] dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col w-full h-full transition-transform duration-300 ${
            isOpen ? "scale-100" : "scale-95"
          }`}
        >
          {/* Header */}
          <div className="bg-black border-b-2 border-cyan-500 p-3 flex items-center justify-between relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-cyan-900/30"></div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,255,255,0.1)_20%,rgba(0,0,0,0)_40%,rgba(0,0,0,0)_60%,rgba(255,0,255,0.1)_80%,rgba(0,0,0,0)_100%)]"></div>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent)",
                backgroundSize: "30px 30px",
              }}
            ></div>
            <h2 className="font-mono font-bold text-cyan-400 text-lg relative z-10 text-shadow-glow">{title}</h2>
            <div className="flex items-center gap-2 relative z-10">
              <SoundButton
                variant="outline"
                size="icon"
                className="h-8 w-8 border-2 border-cyan-500 bg-black hover:bg-gray-900 text-cyan-400 hover:text-cyan-300 transition-colors"
                onClick={withClickSound(toggleFullscreen)}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
              </SoundButton>
              <SoundButton
                variant="outline"
                size="icon"
                className="h-8 w-8 border-2 border-cyan-500 bg-black hover:bg-gray-900 text-cyan-400 hover:text-cyan-300 transition-colors"
                onClick={withClickSound(onClose)}
              >
                <X size={16} />
                <span className="sr-only">Close</span>
              </SoundButton>
            </div>
          </div>

          {/* Game Content */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-gray-900">
            <div className="game-container-wrapper h-full w-full flex items-center justify-center">{children}</div>
          </div>
        </div>
      </div>
    )
  },
)

GamePopOutContainer.displayName = "GamePopOutContainer"

export default GamePopOutContainer
