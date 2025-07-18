"use client"

interface DemoWatermarkProps {
  className?: string
}

export default function DemoWatermark({ className = "" }: DemoWatermarkProps) {
  return (
    <div className={`fixed bottom-4 left-4 z-[80] ${className}`}>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 text-white/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span>BETA VERSION</span>
        </div>
      </div>
    </div>
  )
}
