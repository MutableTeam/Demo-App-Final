"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Orbitron } from "next/font/google"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

interface GameInstructionsProps {
  isOpen: boolean
  onClose: () => void
  onStartGame: () => void
  gameTitle: string
  instructions: string[]
}

export default function GameInstructions({
  isOpen,
  onClose,
  onStartGame,
  gameTitle,
  instructions,
}: GameInstructionsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-2 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-400/50 rounded-xl w-full max-w-sm sm:max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-cyan-400/20">
              <h1 className={`text-lg sm:text-3xl font-bold text-cyan-300 ${orbitron.className}`}>{gameTitle}</h1>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Close instructions"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700/50">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className={`text-xs sm:text-sm font-bold text-cyan-300 ${orbitron.className}`}>
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Start Button */}
            <div className="p-3 sm:p-6 border-t border-cyan-400/20">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={cn(
                    "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white",
                    "min-h-[44px] text-sm sm:text-base",
                    orbitron.className,
                  )}
                >
                  CLOSE
                </Button>
                <Button
                  onClick={onStartGame}
                  className={cn(
                    "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
                    "text-white font-bold flex-1 min-h-[44px] text-sm sm:text-base",
                    orbitron.className,
                  )}
                >
                  START GAME
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
