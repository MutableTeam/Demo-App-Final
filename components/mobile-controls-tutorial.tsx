"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Orbitron } from "next/font/google"
import { cn } from "@/lib/utils"
import Image from "next/image"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
})

interface MobileControlsTutorialProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileControlsTutorial({ isOpen, onClose }: MobileControlsTutorialProps) {
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
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-400/50 rounded-xl p-3 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-4 sm:mb-6">
              <h1 className={`text-xl sm:text-3xl font-bold text-cyan-300 mb-1 sm:mb-2 ${orbitron.className}`}>
                Touch Controls
              </h1>
              <p className="text-sm sm:text-base text-cyan-400/80">Quick guide to get you started</p>
            </div>

            <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
              {/* Movement */}
              <div className="flex items-center gap-2 sm:gap-4 bg-gray-800/30 rounded-lg p-2 sm:p-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/orange-neon-joystick.png"
                    width={16}
                    height={16}
                    alt="Movement"
                    className="sm:w-6 sm:h-6 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm sm:text-lg font-bold text-cyan-300 ${orbitron.className}`}>MOVE</h3>
                  <p className="text-xs sm:text-sm text-gray-300">Touch & drag left side of screen</p>
                </div>
              </div>

              {/* Aiming & Shooting */}
              <div className="flex items-center gap-2 sm:gap-4 bg-gray-800/30 rounded-lg p-2 sm:p-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/orange-neon-joystick.png"
                    width={16}
                    height={16}
                    alt="Aim & Shoot"
                    className="sm:w-6 sm:h-6 drop-shadow-[0_0_8px_rgba(255,165,0,0.7)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm sm:text-lg font-bold text-orange-300 ${orbitron.className}`}>AIM & SHOOT</h3>
                  <p className="text-xs sm:text-sm text-gray-300">Touch & drag right side. Release to fire</p>
                </div>
              </div>

              {/* Dash Button */}
              <div className="flex items-center gap-2 sm:gap-4 bg-gray-800/30 rounded-lg p-2 sm:p-4">
                <div
                  className={cn(
                    "w-8 h-6 sm:w-12 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded",
                    "flex items-center justify-center border border-yellow-400/50 flex-shrink-0",
                    orbitron.className,
                  )}
                >
                  <span className="text-black font-bold text-xs">DASH</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm sm:text-lg font-bold text-yellow-300 ${orbitron.className}`}>DASH</h3>
                  <p className="text-xs sm:text-sm text-gray-300">Tap button for speed burst</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={onClose}
                className={cn(
                  "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
                  "text-white font-bold px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base",
                  "min-h-[44px] w-full sm:w-auto", // Ensure minimum touch target size
                  orbitron.className,
                )}
              >
                GOT IT!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
