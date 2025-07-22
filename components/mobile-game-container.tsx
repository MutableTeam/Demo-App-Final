import type React from "react"

interface ActionButtonProps {
  action: string
  label: string
  description: string
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, label, description }) => {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {label} - {description}
    </button>
  )
}

type MobileGameContainerProps = {}

const MobileGameContainer: React.FC<MobileGameContainerProps> = () => {
  return (
    <div className="h-screen w-screen">
      {/* Landscape Layout */}
      <div className="hidden landscape:flex h-full">
        {/* Left Panel */}
        <div className="w-1/4 bg-gray-100 p-4">Left Panel (Landscape)</div>

        {/* Center Panel */}
        <div className="w-2/4 bg-gray-200 p-4">Center Panel (Landscape)</div>

        {/* Right Panel */}
        <div className="w-1/4 bg-gray-300 flex flex-col items-center justify-center space-y-4 p-4">
          <ActionButton action="jump" label="A" description="Jump" />
          <ActionButton action="shoot" label="X" description="Shoot" />
          <ActionButton action="special" label="Y" description="Special" />
        </div>
      </div>

      {/* Portrait Layout */}
      <div className="flex landscape:hidden flex-col h-full">
        {/* Top Panel */}
        <div className="h-1/4 bg-gray-100 p-4">Top Panel (Portrait)</div>

        {/* Center Panel */}
        <div className="h-2/4 bg-gray-200 p-4">Center Panel (Portrait)</div>

        {/* Bottom Panel */}
        <div className="h-1/4 bg-gray-300 flex flex-row items-center justify-around p-4">
          <ActionButton action="jump" label="A" description="Jump" />
          <ActionButton action="shoot" label="X" description="Shoot" />
          <ActionButton action="special" label="Y" description="Special" />
        </div>
      </div>
    </div>
  )
}

export default MobileGameContainer
