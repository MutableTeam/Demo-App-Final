"use client"

import type React from "react"
import { useState } from "react"

interface MarketplaceItem {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
}

interface MutableMarketplaceProps {
  balance: number
  mutbBalance: number
  items: MarketplaceItem[]
  onPurchase: (itemId: number) => void
}

const MutableMarketplace: React.FC<MutableMarketplaceProps> = ({ balance, mutbBalance, items, onPurchase }) => {
  const [purchasedItems, setPurchasedItems] = useState<number[]>([])

  // Add safe defaults
  const safeBalance = balance ?? 0
  const safeMutbBalance = mutbBalance ?? 0

  const handlePurchase = (itemId: number) => {
    const item = items.find((item) => item.id === itemId)

    if (!item) {
      console.error("Item not found")
      return
    }

    // Safe balance validation
    const canAfford = safeMutbBalance >= (item.price ?? 0)

    if (canAfford) {
      onPurchase(itemId)
      setPurchasedItems([...purchasedItems, itemId])
    } else {
      alert("Insufficient MUTB balance.")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Mutable Marketplace</h1>
      <p className="mb-4">Balance: {safeBalance} USD</p>
      <p className="mb-4">MUTB Balance: {safeMutbBalance} MUTB</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.description}</p>
              <p className="mt-2">
                {/* Safe price display */}
                <span className="font-bold text-lg">{(item.price ?? 0).toFixed(2)} MUTB</span>
              </p>
              <button
                onClick={() => handlePurchase(item.id)}
                disabled={purchasedItems.includes(item.id)}
                className={`mt-4 px-4 py-2 rounded-md ${
                  purchasedItems.includes(item.id)
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-700"
                }`}
              >
                {purchasedItems.includes(item.id) ? "Purchased" : "Purchase"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MutableMarketplace
