"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react"
import { motion } from "framer-motion"

interface ControlInfoProps {
  icon: React.ReactNode
  title: string
  description: string
  iconBgClass: string
}

const ControlInfo = ({ icon, title, description, iconBgClass }: ControlInfoProps) => (
  <motion.div className="flex items-center gap-3 py-2" whileHover={{ scale: 1.02 }}>
    <div
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBgClass} border-2 border-current`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-white font-mono tracking-wide leading-tight">{title}</h3>
      <p className="text-sm text-gray-300 leading-tight">{description}</p>
    </div>
  </motion.div>
)

export default function GameInstructions({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
    >
      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button className="w-10 h-10 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-md flex items-center justify-center hover:bg-cyan-400/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <button
          onClick={onDismiss}
          className="w-10 h-10 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-md flex items-center justify-center hover:bg-cyan-400/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Game title */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-lg font-bold tracking-wider">
        ARCHER ARENA: LAST STAND
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-cyan-400 font-mono tracking-widest mb-1">TOUCH CONTROLS</h2>
          <p className="text-cyan-300/80 text-base">Quick guide to get you started</p>
        </div>

        <div className="space-y-4 mb-8 px-4">
          <ControlInfo
            icon={<Gamepad2 className="h-6 w-6 text-cyan-400" />}
            title="MOVE"
            description="Touch & drag left side of screen"
            iconBgClass="text-cyan-400"
          />
          <ControlInfo
            icon={<Gamepad2 className="h-6 w-6 text-orange-400" />}
            title="AIM & SHOOT"
            description="Touch & drag right side. Release to fire"
            iconBgClass="text-orange-400"
          />
          <ControlInfo
            icon={<div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">DASH</div>}
            title="DASH"
            description="Tap button for speed burst"
            iconBgClass="text-yellow-400"
          />
        </div>

        <div className="flex justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onDismiss}
              className="px-8 py-3 text-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 rounded-lg border-none font-mono tracking-widest"
            >
              GOT IT!
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
