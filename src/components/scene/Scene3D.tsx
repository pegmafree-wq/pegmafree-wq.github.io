import { Suspense, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import CameraController from './CameraController'
import Lighting from './Lighting'
import Laptop from './Laptop'
import Phone from './Phone'
import SystemNodes from './SystemNodes'
import * as THREE from 'three'
import type { CameraState } from './CameraController'

interface Scene3DProps {
  cameraState: CameraState
  activeNode?: string | null
  laptopGlow?: number
  phoneGlow?: number
  laptopScreen?: ReactNode
  phoneScreen?: ReactNode
}

function SceneContent({ activeNode, laptopGlow, phoneGlow, laptopScreen, phoneScreen }: Omit<Scene3DProps, 'cameraState'>) {
  const groundMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080a0d',
    metalness: 0.8,
    roughness: 0.4,
  }), [])

  return (
    <>
      <Lighting accentPosition={activeNode ? [0, 3, -1] : [0, 3, 0]} />

      <Laptop
        position={[-0.8, 0, 0.3]}
        rotation={[0, 0.12, 0]}
        glowIntensity={laptopGlow ?? 0}
        screenContent={laptopScreen}
      />
      <Phone
        position={[1.4, 0.3, 0.8]}
        rotation={[0, -0.25, 0.05]}
        glowIntensity={phoneGlow ?? 0}
        screenContent={phoneScreen}
      />

      <SystemNodes visible={!!activeNode} activeNode={activeNode} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} material={groundMaterial} receiveShadow>
        <planeGeometry args={[30, 30]} />
      </mesh>

      <ContactShadows position={[0, -0.3, 0]} opacity={0.25} scale={10} blur={2.5} far={4} color="#000000" />
      <Environment preset="night" />
      <fog attach="fog" args={['#080a0d', 6, 20]} />
    </>
  )
}

export default function Scene3D({ cameraState, activeNode, laptopGlow, phoneGlow, laptopScreen, phoneScreen }: Scene3DProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0.3, 2, 5.5], fov: 40, near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 1.5]}
      style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#080a0d' }}
    >
      <Suspense fallback={null}>
        <CameraController state={cameraState} />
        <SceneContent
          activeNode={activeNode}
          laptopGlow={laptopGlow}
          phoneGlow={phoneGlow}
          laptopScreen={laptopScreen}
          phoneScreen={phoneScreen}
        />
      </Suspense>
    </Canvas>
  )
}
