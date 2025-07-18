"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Home, Gamepad2, Wallet, Settings, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileGameTab } from "@/components/mobile-game-tab"
import { useIsMobile } from "@/components/ui/use-mobile"

interface MobileNavigationProps {
  className?: string
}

type TabType = "home" | "games" | "wallet" | "profile" | "settings"

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  const tabs = [
    { id: "home" as TabType, label: "Home", icon: Home },
    { id: "games" as TabType, label: "Games", icon: Gamepad2 },
    { id: "wallet" as TabType, label: "Wallet", icon: Wallet },
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "games":
        return <MobileGameTab />
      case "home":
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Welcome to Mutable</h2>
            <p className="text-gray-400">Your Web3 Gaming Platform</p>
          </div>
        )
      case "wallet":
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Wallet</h2>
            <p className="text-gray-400">Connect your wallet to get started</p>
          </div>
        )
      case "profile":
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
            <p className="text-gray-400">Manage your gaming profile</p>
          </div>
        )
      case "settings":
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            <p className="text-gray-400">Configure your preferences</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn("flex flex-col h-screen bg-black", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">Mutable</h1>
        <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-gray-300",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div className="absolute inset-0 bg-black/80 z-50">
          <div className="absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-gray-800 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setIsMenuOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      activeTab === tab.id ? "bg-blue-500/20 text-blue-400" : "text-gray-300 hover:bg-gray-800",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
