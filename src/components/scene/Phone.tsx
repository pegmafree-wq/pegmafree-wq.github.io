import { useRef, useMemo, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface PhoneProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  screenContent?: ReactNode
  glowIntensity?: number
}

export default function Phone({
  position = [1.8, 0.6, 0.3],
  rotation = [0, -0.3, 0],
  screenContent,
  glowIntensity = 0,
}: PhoneProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.7 + 1) * 0.015
    }
  })

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e2025',
    metalness: 0.92,
    roughness: 0.12,
  }), [])

  const edgeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3a3d42',
    metalness: 0.95,
    roughness: 0.08,
  }), [])

  const screenSurface = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0c10',
    metalness: 0.03,
    roughness: 0.95,
    emissive: '#080c18',
    emissiveIntensity: 0.12 + glowIntensity * 0.4,
  }), [glowIntensity])

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ── Phone body — rounded aluminum frame ── */}
      <mesh material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.75, 1.55, 0.07]} />
      </mesh>

      {/* Side edge highlights — chamfered */}
      <mesh position={[0.38, 0, 0]} material={edgeMaterial}>
        <boxGeometry args={[0.01, 1.55, 0.07]} />
      </mesh>
      <mesh position={[-0.38, 0, 0]} material={edgeMaterial}>
        <boxGeometry args={[0.01, 1.55, 0.07]} />
      </mesh>

      {/* Top edge */}
      <mesh position={[0, 0.78, 0]} material={edgeMaterial}>
        <boxGeometry args={[0.75, 0.01, 0.07]} />
      </mesh>

      {/* Bottom edge */}
      <mesh position={[0, -0.78, 0]} material={edgeMaterial}>
        <boxGeometry args={[0.75, 0.01, 0.07]} />
      </mesh>

      {/* Screen bezel — dark glass */}
      <mesh position={[0, 0, 0.036]} material={screenSurface}>
        <boxGeometry args={[0.71, 1.51, 0.003]} />
      </mesh>

      {/* Screen surface — the display */}
      <mesh position={[0, 0, 0.038]} material={screenSurface} name="phone-screen">
        <boxGeometry args={[0.68, 1.42, 0.003]} />
      </mesh>

      {/* Camera notch — subtle pill */}
      <mesh position={[0, 0.66, 0.039]} material={edgeMaterial}>
        <boxGeometry args={[0.1, 0.025, 0.005]} />
      </mesh>

      {/* Home indicator bar */}
      <mesh position={[0, -0.68, 0.039]} material={edgeMaterial}>
        <boxGeometry args={[0.18, 0.006, 0.005]} />
      </mesh>

      {/* Screen glow */}
      <pointLight
        position={[0, 0, 0.35]}
        intensity={0.2 + glowIntensity * 0.3}
        color="#4a6aff"
        distance={2}
        decay={2}
      />

      {/* ── DOM Overlay — attached to screen via Html transform ── */}
      {screenContent && (
        <Html
          transform
          occlude={false}
          position={[0, 0, 0.041]}
          rotation={[0, 0, 0]}
          scale={0.0038}
          style={{ pointerEvents: 'auto' }}
          distanceFactor={2.5}
          zIndexRange={[10, 0]}
        >
          <div style={{
            width: '179px',
            height: '374px',
            overflow: 'hidden',
            borderRadius: '12px',
            background: '#0a0c10',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {screenContent}
          </div>
        </Html>
      )}
    </group>
  )
}

export const PHONE_SCREEN = {
  width: 0.68,
  height: 1.42,
  offset: new THREE.Vector3(0, 0, 0.038),
}
