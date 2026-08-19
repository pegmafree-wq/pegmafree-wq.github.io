import { useRef, useMemo, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface LaptopProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  screenContent?: ReactNode
  glowIntensity?: number
}

export default function Laptop({
  position = [-1.2, 0, 0],
  rotation = [0, 0.15, 0],
  screenContent,
  glowIntensity = 0,
}: LaptopProps) {
  const groupRef = useRef<THREE.Group>(null)
  const screenLightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.02
    }
    if (screenLightRef.current) {
      screenLightRef.current.intensity = 0.3 + glowIntensity * 0.5
    }
  })

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a2d32',
    metalness: 0.88,
    roughness: 0.18,
  }), [])

  const edgeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a4d52',
    metalness: 0.92,
    roughness: 0.1,
  }), [])

  const screenSurface = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0c10',
    metalness: 0.05,
    roughness: 0.95,
    emissive: '#0a1020',
    emissiveIntensity: 0.15 + glowIntensity * 0.3,
  }), [glowIntensity])

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ── Base ── */}
      {/* Main base body — thin aluminum slab */}
      <mesh position={[0, 0, 0]} material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 1.6]} />
      </mesh>

      {/* Top edge highlight — chamfered look */}
      <mesh position={[0, 0.028, 0]} material={edgeMaterial}>
        <boxGeometry args={[2.42, 0.004, 1.62]} />
      </mesh>

      {/* Front edge — thinner, lighter */}
      <mesh position={[0, 0, 0.81]} material={edgeMaterial}>
        <boxGeometry args={[2.4, 0.05, 0.01]} />
      </mesh>

      {/* Trackpad — subtle glass inset */}
      <mesh position={[0, 0.03, 0.35]} material={screenSurface}>
        <boxGeometry args={[0.65, 0.002, 0.42]} />
      </mesh>

      {/* Keyboard grid — subtle recessed rows */}
      {[-0.35, -0.2, -0.05, 0.1].map((z, i) => (
        <mesh key={i} position={[0, 0.028, z - 0.15]} material={edgeMaterial}>
          <boxGeometry args={[1.8, 0.003, 0.08]} />
        </mesh>
      ))}

      {/* ── Hinge ── */}
      <mesh position={[0, 0.06, -0.78]} rotation={[0, 0, Math.PI / 2]} material={edgeMaterial}>
        <cylinderGeometry args={[0.025, 0.025, 2.0, 12]} />
      </mesh>

      {/* ── Screen assembly ── */}
      <group position={[0, 1.02, -0.82]} rotation={[-0.25, 0, 0]}>
        {/* Screen back — aluminum lid */}
        <mesh position={[0, 0, -0.025]} material={bodyMaterial} castShadow>
          <boxGeometry args={[2.3, 1.5, 0.035]} />
        </mesh>

        {/* Back edge trim */}
        <mesh position={[0, 0, -0.005]} material={edgeMaterial}>
          <boxGeometry args={[2.32, 1.52, 0.005]} />
        </mesh>

        {/* Screen bezel — thin dark frame */}
        <mesh position={[0, 0, 0.008]} material={screenSurface}>
          <boxGeometry args={[2.2, 1.4, 0.003]} />
        </mesh>

        {/* Screen surface — the display area */}
        <mesh position={[0, 0, 0.013]} material={screenSurface} name="laptop-screen">
          <boxGeometry args={[2.1, 1.3, 0.003]} />
        </mesh>

        {/* Camera dot — top center */}
        <mesh position={[0, 0.68, 0.012]} material={edgeMaterial}>
          <circleGeometry args={[0.015, 12]} />
        </mesh>

        {/* Screen glow light */}
        <pointLight
          ref={screenLightRef}
          position={[0, 0, 0.4]}
          intensity={0.3}
          color="#4a6aff"
          distance={3}
          decay={2}
        />

        {/* ── DOM Overlay — attached to screen via Html transform ── */}
        {screenContent && (
          <Html
            transform
            occlude={false}
            position={[0, 0, 0.016]}
            rotation={[0, 0, 0]}
            scale={0.004}
            style={{ pointerEvents: 'auto' }}
            distanceFactor={2.5}
            zIndexRange={[10, 0]}
          >
            <div style={{
              width: '525px',
              height: '325px',
              overflow: 'hidden',
              borderRadius: '8px',
              background: '#0a0c10',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {screenContent}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

export const LAPTOP_SCREEN = {
  width: 2.1,
  height: 1.3,
  offset: new THREE.Vector3(0, 1.02, -0.82),
  rotation: -0.25,
}
