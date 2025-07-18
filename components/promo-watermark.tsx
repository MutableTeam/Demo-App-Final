"use client"

export default function PromoWatermark() {
  // Simple watermark for the platform
  return (
    <div className="fixed top-2 left-2 sm:top-3 sm:left-3 z-[99]">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs font-medium text-gray-600">Mutable Platform</span>
      </div>
    </div>
  )
}
