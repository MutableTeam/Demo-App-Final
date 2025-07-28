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
          className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-400/50 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-bold text-cyan-300 mb-2 ${orbitron.className}`}>Mobile Controls</h1>
              <p className="text-cyan-400/80 text-lg">Master the battlefield with touch controls</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Movement Controls */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-cyan-400/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
                    <Image
                      src="/orange-neon-joystick.png"
                      width={40}
                      height={40}
                      alt="Movement Joystick"
                      className="drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]"
                    />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold text-cyan-300 ${orbitron.className}`}>MOVEMENT</h3>
                    <p className="text-cyan-400/80">Left side of screen</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Touch and drag to move your character</li>
                  <li>• 8-directional movement support</li>
                  <li>• Dynamic joystick appears where you touch</li>
                  <li>• Release to stop moving</li>
                </ul>
              </div>

              {/* Aiming & Shooting */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-orange-400/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center">
                    <Image
                      src="/orange-neon-joystick.png"
                      width={40}
                      height={40}
                      alt="Aiming Joystick"
                      className="drop-shadow-[0_0_8px_rgba(255,165,0,0.7)]"
                    />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold text-orange-300 ${orbitron.className}`}>AIM & SHOOT</h3>
                    <p className="text-orange-400/80">Right side of screen</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Touch to start aiming</li>
                  <li>• Drag to aim in any direction</li>
                  <li>• Hold longer to charge power</li>
                  <li>• Release to fire arrow/weapon</li>
                </ul>
              </div>
            </div>

            {/* Dash Button */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-yellow-400/30 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={cn(
                    "w-20 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg",
                    "flex items-center justify-center border-2 border-yellow-400/50",
                    "shadow-lg shadow-yellow-500/30",
                    orbitron.className,
                  )}
                >
                  <span className="text-black font-bold text-sm">DASH</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold text-yellow-300 ${orbitron.className}`}>DASH</h3>
                  <p className="text-yellow-400/80">Bottom right corner</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Quick burst of speed in movement direction</li>
                <li>• Avoid enemy attacks and projectiles</li>
                <li>• Has cooldown period between uses</li>
                <li>• Essential for advanced combat tactics</li>
              </ul>
            </div>

            {/* Game-Specific Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-400/30">
                <h4 className={`text-lg font-bold text-red-300 mb-2 ${orbitron.className}`}>ARCHER ARENA</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Charge arrows for more damage</li>
                  <li>• Use dash to dodge enemy arrows</li>
                  <li>• Aim ahead of moving targets</li>
                </ul>
              </div>
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-400/30">
                <h4 className={`text-lg font-bold text-green-300 mb-2 ${orbitron.className}`}>LAST STAND</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Rapid fire for crowd control</li>
                  <li>• Dash through enemy groups</li>
                  <li>• Keep moving to survive waves</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={onClose}
                className={cn(
                  "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
                  "text-white font-bold px-8 py-3 text-lg",
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
