import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LightingProps {
  accentPosition?: [number, number, number]
}

export default function Lighting({ accentPosition = [0, 3, 0] }: LightingProps) {
  const accentRef = useRef<THREE.PointLight>(null)
  const rimRef = useRef<THREE.SpotLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Accent light — subtle breathing, not constant
    if (accentRef.current) {
      accentRef.current.intensity = 1.2 + Math.sin(t * 0.6) * 0.4
      // Gentle orbit around accent position
      accentRef.current.position.x = accentPosition[0] + Math.sin(t * 0.3) * 0.5
      accentRef.current.position.z = accentPosition[2] + Math.cos(t * 0.25) * 0.3
    }

    // Rim light — subtle drift for living feel
    if (rimRef.current) {
      rimRef.current.position.x = Math.sin(t * 0.15) * 0.5
    }
  })

  return (
    <>
      {/* Ambient — very low, keeps scene moody */}
      <ambientLight intensity={0.06} color="#c8d0e0" />

      {/* Key light — soft overhead, warm white, casts shadows */}
      <directionalLight
        position={[4, 7, 3]}
        intensity={0.55}
        color="#e8e0d8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
      />

      {/* Fill — cool, from left, creates depth separation */}
      <directionalLight
        position={[-5, 3, 2]}
        intensity={0.12}
        color="#90a8c8"
      />

      {/* Rim spotlight — behind and above devices, creates edge separation */}
      <spotLight
        ref={rimRef}
        position={[0, 4, -5]}
        angle={0.5}
        penumbra={0.8}
        intensity={1.0}
        color="#b8c0d0"
        distance={15}
        decay={2}
        castShadow={false}
      />

      {/* Secondary rim — from right, cooler */}
      <pointLight
        position={[4, 2, -3]}
        intensity={0.3}
        color="#8090b0"
        distance={12}
        decay={2}
      />

      {/* Accent — acid green, for active/selected/system elements */}
      <pointLight
        ref={accentRef}
        position={accentPosition}
        intensity={1.2}
        color="#c9ff4a"
        distance={8}
        decay={2}
      />

      {/* Ground bounce — very subtle warm reflection */}
      <pointLight
        position={[0, -0.5, 1]}
        intensity={0.04}
        color="#d0c8b8"
        distance={5}
        decay={2}
      />

      {/* Screen spill — when devices are active, light bleeds onto environment */}
      <pointLight
        position={[-1.2, 1.2, 0.5]}
        intensity={0.15}
        color="#3a5aff"
        distance={4}
        decay={2}
      />
    </>
  )
}
