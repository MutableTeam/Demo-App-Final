"use client"
import { StyleSwitcher } from "./style-switcher"

export default function PromoWatermark() {
  // Hide the promo watermark and show the StyleSwitcher instead
  return (
    <div className="fixed top-2 left-2 sm:top-3 sm:left-3 z-[99]">
      <StyleSwitcher size="sm" className="shadow-md" />
    </div>
  )
}
