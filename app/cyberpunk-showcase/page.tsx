"use client"
import { CyberpunkGameCard } from "@/components/cyberpunk-ui/cyberpunk-game-card"
import { CyberpunkTokenSwap } from "@/components/cyberpunk-ui/cyberpunk-token-swap"
import { CyberpunkTabs } from "@/components/cyberpunk-ui/cyberpunk-tabs"
import { CyberpunkBadge } from "@/components/cyberpunk-ui/cyberpunk-badge"
import { CyberpunkAlert } from "@/components/cyberpunk-ui/cyberpunk-alert"
import { StyleSwitcher } from "@/components/style-switcher"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"

export default function CyberpunkShowcase() {
  const { isCyberpunkMode, styleMode } = useCyberpunkTheme()

  const tabContent = [
    {
      value: "games",
      label: "Games",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <CyberpunkGameCard
            title="Pixel Pool"
            description="A retro-style pool game with pixel art graphics"
            imageSrc="/images/pixel-art-pool.png"
            players="1-2 Players"
            onPlay={() => console.log("Play Pixel Pool")}
          />
          <CyberpunkGameCard
            title="Archer's Quest"
            description="Test your aim in this medieval archery game"
            imageSrc="/images/archer-game.png"
            players="1 Player"
            onPlay={() => console.log("Play Archer's Quest")}
          />
          <CyberpunkGameCard
            title="Last Stand"
            description="Survive waves of enemies in this top-down shooter"
            imageSrc="/images/last-stand.jpg"
            players="1-4 Players"
            onPlay={() => console.log("Play Last Stand")}
          />
        </div>
      ),
    },
    {
      value: "marketplace",
      label: "Marketplace",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <CyberpunkTokenSwap />
          <div className="space-y-6">
            <div
              className={cn(
                "p-6 rounded-lg",
                isCyberpunkMode && styleMode === "cyberpunk"
                  ? "bg-black bg-opacity-80 border border-[#00f0ff] border-opacity-30"
                  : "bg-white dark:bg-gray-800 shadow-md",
              )}
            >
              <h3
                className={cn(
                  "text-xl font-bold mb-4",
                  isCyberpunkMode && styleMode === "cyberpunk" && "text-[#00f0ff]",
                )}
              >
                Market Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span
                    className={cn(
                      isCyberpunkMode && styleMode === "cyberpunk"
                        ? "text-gray-400"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    MUTB Price
                  </span>
                  <span className={cn("font-medium", isCyberpunkMode && styleMode === "cyberpunk" && "text-white")}>
                    $0.0023
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={cn(
                      isCyberpunkMode && styleMode === "cyberpunk"
                        ? "text-gray-400"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    24h Volume
                  </span>
                  <span className={cn("font-medium", isCyberpunkMode && styleMode === "cyberpunk" && "text-white")}>
                    $124,532
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={cn(
                      isCyberpunkMode && styleMode === "cyberpunk"
                        ? "text-gray-400"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    Market Cap
                  </span>
                  <span className={cn("font-medium", isCyberpunkMode && styleMode === "cyberpunk" && "text-white")}>
                    $2.3M
                  </span>
                </div>
              </div>
            </div>

            <CyberpunkAlert
              title="Price Alert"
              description="MUTB price has increased by 5% in the last hour."
              variant="info"
            />

            <div className="flex flex-wrap gap-2">
              <CyberpunkBadge>Default</CyberpunkBadge>
              <CyberpunkBadge variant="secondary">Secondary</CyberpunkBadge>
              <CyberpunkBadge variant="destructive">Destructive</CyberpunkBadge>
              <CyberpunkBadge variant="outline">Outline</CyberpunkBadge>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "alerts",
      label: "Alerts",
      content: (
        <div className="space-y-4 mt-6">
          <CyberpunkAlert title="Information" description="This is an informational message." variant="info" />
          <CyberpunkAlert
            title="Success"
            description="Your transaction was completed successfully."
            variant="success"
          />
          <CyberpunkAlert title="Warning" description="Your account balance is running low." variant="warning" />
          <CyberpunkAlert title="Error" description="There was an error processing your request." variant="error" />
        </div>
      ),
    },
  ]

  return (
    <div className={cn("min-h-screen p-6", isCyberpunkMode && styleMode === "cyberpunk" && "bg-gray-900")}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={cn("text-3xl font-bold", isCyberpunkMode && styleMode === "cyberpunk" && "text-[#00f0ff]")}>
            Cyberpunk UI Showcase
          </h1>
          <StyleSwitcher size="sm" />
        </div>

        <CyberpunkTabs tabs={tabContent} />
      </div>
    </div>
  )
}
