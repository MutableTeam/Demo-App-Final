import type React from "react"
import { Gamepad2, Code, Repeat } from "lucide-react"
import { CyberpunkTabs, CyberpunkTab, CyberpunkTabContent } from "@/components/cyberpunk-tabs"
import GameSelection from "@/components/game-selection"

interface MutablePlatformProps {
  handleGameSelect: (gameId: string) => void
}

const MutablePlatform: React.FC<MutablePlatformProps> = ({ handleGameSelect }) => {
  return (
    <CyberpunkTabs defaultValue="games">
      <div className="flex justify-center mb-8">
        <CyberpunkTab value="exchange">
          <Repeat className="w-4 h-4 mr-2" />
          Exchange
        </CyberpunkTab>
        <CyberpunkTab value="games">
          <Gamepad2 className="w-4 h-4 mr-2" />
          Games
        </CyberpunkTab>
        <CyberpunkTab value="develop">
          <Code className="w-4 h-4 mr-2" />
          Develop
        </CyberpunkTab>
      </div>

      <CyberpunkTabContent value="exchange">
        {/* Content for Exchange tab */}
        <div>Exchange Content</div>
      </CyberpunkTabContent>
      <CyberpunkTabContent value="games">
        <GameSelection onGameSelect={handleGameSelect} />
      </CyberpunkTabContent>
      <CyberpunkTabContent value="develop">
        {/* Content for Develop tab */}
        <div>Develop Content</div>
      </CyberpunkTabContent>
    </CyberpunkTabs>
  )
}

export default MutablePlatform
