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

const LandscapeControls: React.FC = () => {
  return (
    <div className="flex flex-row h-full w-full">
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <ActionButton action="moveLeft" label="Left" description="Move Left" />
        <ActionButton action="moveRight" label="Right" description="Move Right" />
      </div>
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <ActionButton action="jump" label="A" description="Jump" />
        <ActionButton action="shoot" label="X" description="Shoot" />
      </div>
    </div>
  )
}

const PortraitControls: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <ActionButton action="moveLeft" label="Left" description="Move Left" />
      <ActionButton action="jump" label="A" description="Jump" />
      <ActionButton action="moveRight" label="Right" description="Move Right" />
      <ActionButton action="shoot" label="X" description="Shoot" />
    </div>
  )
}

interface MobileGameContainerProps {
  isLandscape: boolean
}

const MobileGameContainer: React.FC<MobileGameContainerProps> = ({ isLandscape }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-200 bg-opacity-50">
      {isLandscape ? <LandscapeControls /> : <PortraitControls />}
    </div>
  )
}

export default MobileGameContainer
