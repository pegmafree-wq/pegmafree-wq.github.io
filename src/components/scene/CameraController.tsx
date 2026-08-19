import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

export type CameraState = 'default' | 'laptop' | 'phone' | 'system' | 'trace'

interface CameraTarget {
  position: [number, number, number]
  lookAt: [number, number, number]
  duration: number
}

const CAMERA_CONFIGS: Record<CameraState, CameraTarget> = {
  // Wide product shot — both devices prominent, slightly above
  default: {
    position: [0.3, 2, 5.5],
    lookAt: [0.3, 0.4, 0.3],
    duration: 2.2,
  },
  // Dolly into laptop — fills left side of frame
  laptop: {
    position: [-1.0, 1.5, 3.2],
    lookAt: [-0.8, 0.6, 0.3],
    duration: 1.8,
  },
  // Move toward phone — right side, slightly lower angle
  phone: {
    position: [1.6, 1.2, 3.0],
    lookAt: [1.4, 0.5, 0.8],
    duration: 1.6,
  },
  // Pull back and up to reveal system environment
  system: {
    position: [0, 3.5, 7],
    lookAt: [0, 1.0, -1.5],
    duration: 2.5,
  },
  // Slightly offset for trace — keep devices in peripheral
  trace: {
    position: [0.5, 2.8, 6],
    lookAt: [-0.3, 1.5, -1],
    duration: 2.0,
  },
}

interface CameraControllerProps {
  state: CameraState
}

export default function CameraController({ state }: CameraControllerProps) {
  const { camera } = useThree()
  const targetRef = useRef(new THREE.Vector3(0.3, 0.4, 0.3))
  const posTweenRef = useRef<gsap.core.Tween | null>(null)
  const lookTweenRef = useRef<gsap.core.Tween | null>(null)

  const transitionTo = useCallback((target: CameraTarget) => {
    posTweenRef.current?.kill()
    lookTweenRef.current?.kill()

    const pos = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    const look = { x: targetRef.current.x, y: targetRef.current.y, z: targetRef.current.z }

    posTweenRef.current = gsap.to(pos, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: target.duration,
      ease: 'power2.inOut',
      onUpdate: () => camera.position.set(pos.x, pos.y, pos.z),
    })

    lookTweenRef.current = gsap.to(look, {
      x: target.lookAt[0],
      y: target.lookAt[1],
      z: target.lookAt[2],
      duration: target.duration * 0.85,
      ease: 'power2.inOut',
      onUpdate: () => targetRef.current.set(look.x, look.y, look.z),
    })
  }, [camera])

  useEffect(() => {
    transitionTo(CAMERA_CONFIGS[state])
  }, [state, transitionTo])

  useFrame(() => {
    camera.lookAt(targetRef.current)
  })

  return null
}

export { CAMERA_CONFIGS }
