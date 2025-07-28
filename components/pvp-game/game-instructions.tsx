"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Gamepad2, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface ControlInfoProps {
  icon: React.ReactNode
  title: string
  description: string
  iconBgClass: string
}

const ControlInfo = ({ icon, title, description, iconBgClass }: ControlInfoProps) => (
  <motion.div
    className="flex items-center gap-4 rounded-lg bg-gray-800/50 p-4 border border-gray-700"
    whileHover={{ scale: 1.03, backgroundColor: "rgba(31, 41, 55, 0.8)" }}
  >
    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${iconBgClass}`}>{icon}</div>
    <div>
      <h3 className="text-lg font-bold text-white font-mono tracking-wider">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </motion.div>
)

export default function GameInstructions({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gray-900 text-white p-6 sm:p-8 rounded-2xl w-full max-w-md border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-cyan-300 font-mono tracking-widest">TOUCH CONTROLS</h2>
          <p className="text-cyan-400/80 mt-1">Quick guide to get you started</p>
        </div>

        <div className="space-y-4 mb-8">
          <ControlInfo
            icon={<Gamepad2 className="h-8 w-8 text-cyan-200" />}
            title="MOVE"
            description="Touch & drag left side of screen"
            iconBgClass="bg-cyan-500/30"
          />
          <ControlInfo
            icon={<Gamepad2 className="h-8 w-8 text-orange-200" />}
            title="AIM & SHOOT"
            description="Touch & drag right side. Release to fire"
            iconBgClass="bg-orange-500/30"
          />
          <ControlInfo
            icon={
              <div className="flex items-center justify-center w-full h-full">
                <Zap className="h-7 w-7 text-yellow-200" />
              </div>
            }
            title="DASH"
            description="Tap button for speed burst"
            iconBgClass="bg-yellow-500/30"
          />
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onDismiss}
            className="w-full h-14 text-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 rounded-lg border-none font-mono tracking-widest"
          >
            GOT IT!
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
