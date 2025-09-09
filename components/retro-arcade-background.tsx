"use client"

import type React from "react"

interface RetroArcadeBackgroundProps {
  children?: React.ReactNode
}

export default function RetroArcadeBackground({ children }: RetroArcadeBackgroundProps) {
  return (
    <div className="retro-arcade-background">
      {/* Grid background */}
      <div className="grid-background"></div>
      <div className="horizon-line"></div>

      {/* Glow effects */}
      <div className="glow-circle"></div>
      <div className="glow-circle"></div>

      {/* Animated background elements */}
      <div className="bg-animation">
        {/* Generate 20 pixel elements */}
        {Array.from({ length: 20 }).map((_, i) => {
          const top = Math.floor(Math.random() * 90) + 5
          const left = Math.floor(Math.random() * 90) + 5
          return <div key={i} className="pixel-element" style={{ top: `${top}%`, left: `${left}%` }}></div>
        })}
      </div>

      {/* Foreground container for content */}
      <div className="foreground-container">
        <div className="arcade-content-container">{children}</div>
      </div>

      {/* CRT screen effects */}
      <div className="crt-effects">
        <div className="scanlines"></div>
        <div className="screen-flicker"></div>
        <div className="screen-glitch"></div>
        <div className="screen-glow"></div>
        <div className="screen-vignette"></div>
        <div className="screen-curvature"></div>
      </div>
    </div>
  )
}
