"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import type { Scene } from "three"

interface EnhancedGameRendererProps {
  scene: Scene
  camera: PerspectiveCamera
  //onTouchControl: (action: string) => void; // Removed onTouchControl
}

const EnhancedGameRenderer: React.FC<EnhancedGameRendererProps> = ({ scene, camera }) => {
  const cameraRef = useRef<PerspectiveCamera>(null)

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.copy(camera.position)
      cameraRef.current.rotation.copy(camera.rotation)
    }
  }, [camera])

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.position.copy(camera.position)
      cameraRef.current.rotation.copy(camera.rotation)
    }
  })

  return (
    <Canvas
      gl={{ antialias: false, stencil: false, depth: false }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <primitive object={scene} />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={camera.fov}
        near={camera.near}
        far={camera.far}
        position={camera.position}
        rotation={camera.rotation}
      />
    </Canvas>
  )
}

export default EnhancedGameRenderer
