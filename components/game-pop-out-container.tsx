"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { debugManager } from "@/utils/debug-utils"
import { useIsMobile } from "@/components/ui/use-mobile"

// Add after the imports
const textShadowGlow = `
  .text-shadow-glow {
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5);
  }
`

// Then add this before the component definition
// Add the style to the document
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

export default function GamePopOutContainer({
  isOpen,
  onClose,
  title = "MUTABLE GAME",
  children,
}: GamePopOutContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  // Handle fullscreen toggle
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

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Mobile-specific setup
  useEffect(() => {
    if (isOpen && isMobile) {
      // Lock orientation to landscape on mobile
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {
          // Fallback: just hide mobile browser UI
          console.log("Could not lock orientation, using CSS fallback")
        })
      }

      // Hide mobile browser UI
      const hideAddressBar = () => {
        window.scrollTo(0, 1)
        setTimeout(() => window.scrollTo(0, 0), 0)
      }

      hideAddressBar()

      // Prevent scrolling
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.height = "100%"

      return () => {
        // Restore normal scrolling
        document.body.style.overflow = ""
        document.body.style.position = ""
        document.body.style.width = ""
        document.body.style.height = ""

        // Unlock orientation
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock()
        }
      }
    }
  }, [isOpen, isMobile])

  // Auto-enter fullscreen on mobile
  useEffect(() => {
    if (isOpen && isMobile && containerRef.current) {
      const timer = setTimeout(() => {
        if (containerRef.current && document.fullscreenEnabled) {
          containerRef.current.requestFullscreen().catch((err) => {
            debugManager.logWarning("Fullscreen", "Could not enter fullscreen mode automatically:", err)
            setIsFullscreen(false)
          })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isOpen, isMobile])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile-specific styles */}
          <style jsx global>{`
            @media (max-width: 768px) {
              .game-popup-container {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                padding: 0 !important;
                margin: 0 !important;
                border-radius: 0 !important;
                max-width: none !important;
                max-height: none !important;
              }
              
              .game-popup-backdrop {
                background: #000 !important;
              }
              
              /* Force landscape orientation hint */
              @media (orientation: portrait) {
                .game-popup-container::before {
                  content: 'Please rotate your device to landscape mode';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: rgba(0, 0, 0, 0.9);
                  color: white;
                  padding: 20px;
                  border-radius: 10px;
                  z-index: 1000;
                  text-align: center;
                  font-size: 18px;
                }
              }
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`game-popup-backdrop fixed inset-0 z-50 flex items-center justify-center ${
              isMobile ? "p-0 bg-black" : "p-4 bg-black/50 backdrop-blur-sm"
            }`}
          >
            <motion.div
              ref={containerRef}
              className={`game-popup-container bg-[#fbf3de] dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ${
                isMobile || isFullscreen ? "w-full h-full" : "w-[95%] h-[95%] max-w-7xl"
              }`}
              layoutId="game-container"
            >
              {/* Header - hide on mobile landscape */}
              <div
                className={`bg-black border-b-2 border-cyan-500 p-3 flex items-center justify-between relative overflow-hidden ${
                  isMobile ? "hidden landscape:flex landscape:h-12" : ""
                }`}
              >
                {/* Cyberpunk background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-cyan-900/30"></div>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,255,255,0.1)_20%,rgba(0,0,0,0)_40%,rgba(0,0,0,0)_60%,rgba(255,0,255,0.1)_80%,rgba(0,0,0,0)_100%)]"></div>

                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent)",
                    backgroundSize: "30px 30px",
                  }}
                ></div>

                {/* Content */}
                <h2 className="font-mono font-bold text-cyan-400 text-lg relative z-10 text-shadow-glow">{title}</h2>
                <div className="flex items-center gap-2 relative z-10">
                  {!isMobile && (
                    <SoundButton
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-2 border-cyan-500 bg-black hover:bg-gray-900 text-cyan-400 hover:text-cyan-300 transition-colors"
                      onClick={withClickSound(toggleFullscreen)}
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                    </SoundButton>
                  )}
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
              <div
                className={`flex-1 overflow-hidden relative flex items-center justify-center bg-gray-900 ${
                  isMobile ? "h-full" : ""
                }`}
              >
                <div className="game-container-wrapper h-full w-full flex items-center justify-center">{children}</div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
