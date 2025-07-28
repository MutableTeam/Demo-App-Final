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
          className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-3"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-400/50 rounded-xl p-4 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-4">
              <h1 className={`text-xl sm:text-2xl font-bold text-cyan-300 mb-2 ${orbitron.className}`}>
                Touch Controls
              </h1>
              <p className="text-cyan-400/80 text-sm">Quick guide to get you started</p>
            </div>

            <div className="space-y-3 mb-4">
              {/* Movement */}
              <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/orange-neon-joystick.png"
                    width={20}
                    height={20}
                    alt="Movement"
                    className="drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base font-bold text-cyan-300 ${orbitron.className}`}>MOVE</h3>
                  <p className="text-gray-300 text-xs">Touch & drag left side of screen</p>
                </div>
              </div>

              {/* Aiming & Shooting */}
              <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/orange-neon-joystick.png"
                    width={20}
                    height={20}
                    alt="Aim & Shoot"
                    className="drop-shadow-[0_0_8px_rgba(255,165,0,0.7)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base font-bold text-orange-300 ${orbitron.className}`}>AIM & SHOOT</h3>
                  <p className="text-gray-300 text-xs">Touch & drag right side. Release to fire</p>
                </div>
              </div>

              {/* Dash Button */}
              <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                <div
                  className={cn(
                    "w-10 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded",
                    "flex items-center justify-center border border-yellow-400/50 flex-shrink-0",
                    orbitron.className,
                  )}
                >
                  <span className="text-black font-bold text-[10px]">DASH</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base font-bold text-yellow-300 ${orbitron.className}`}>DASH</h3>
                  <p className="text-gray-300 text-xs">Tap button for speed burst</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={onClose}
                className={cn(
                  "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
                  "text-white font-bold px-6 py-2 text-sm",
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
