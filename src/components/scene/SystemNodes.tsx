import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface SystemNodeData {
  id: string
  label: string
  position: [number, number, number]
  color: string
  size: number // relative importance
  depth: number // 0=near, 1=far — controls opacity fallback
}

// Spatial layout — layered depth, not flat grid
const SYSTEM_NODES: SystemNodeData[] = [
  // Core layer — API is central, slightly elevated
  { id: 'api', label: 'API', position: [0, 2.8, -1.5], color: '#c9ff4a', size: 1.2, depth: 0 },

  // Data layer — behind and to the right
  { id: 'database', label: 'DATABASE', position: [2.2, 2.2, -2.8], color: '#6baaff', size: 1.0, depth: 1 },
  { id: 'analytics', label: 'ANALYTICS', position: [3.2, 1.5, -1.8], color: '#8ac9ff', size: 0.8, depth: 1 },

  // Service layer — to the left, varied depth
  { id: 'notifications', label: 'NOTIFICATIONS', position: [-1.5, 2.0, -3.2], color: '#ff8a4a', size: 1.0, depth: 1 },
  { id: 'automation', label: 'AUTOMATION', position: [-2.8, 2.5, -2.2], color: '#ff6b8a', size: 0.9, depth: 1 },

  // Storage — far left, deep
  { id: 'storage', label: 'STORAGE', position: [-3.5, 1.8, -1.2], color: '#8affc9', size: 0.7, depth: 1 },
]

interface SystemNodesProps {
  visible: boolean
  activeNode?: string | null
}

export default function SystemNodes({ visible, activeNode }: SystemNodesProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group && i < SYSTEM_NODES.length) {
        const node = SYSTEM_NODES[i]
        // Each node floats at its own rhythm — deeper nodes move slower
        const speed = 0.3 + (1 - node.depth) * 0.2
        const amplitude = 0.04 + node.depth * 0.02
        child.position.y = node.position[1] + Math.sin(t * speed + i * 1.2) * amplitude
      }
    })
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {SYSTEM_NODES.map(node => {
        const isActive = activeNode === node.id
        const hasActive = !!activeNode
        // Active node full opacity, connected nodes medium, others very dim
        const nodeOpacity = isActive ? 1 : hasActive ? 0.08 : 0.6 - node.depth * 0.2

        return (
          <group key={node.id} position={node.position}>
            {/* Core sphere */}
            <mesh>
              <sphereGeometry args={[0.1 * node.size, 20, 20]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={isActive ? 1.0 : hasActive ? 0.05 : 0.15}
                transparent
                opacity={nodeOpacity}
                metalness={0.4}
                roughness={0.5}
              />
            </mesh>

            {/* Active indicator ring */}
            {isActive && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.16 * node.size, 0.22 * node.size, 32]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent
                  opacity={0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Label — only visible when active or no selection */}
            {(isActive || !hasActive) && (
              <Text
                position={[0, 0.22 * node.size + 0.08, 0]}
                fontSize={0.065 * node.size}
                color={node.color}
                anchorX="center"
                anchorY="bottom"
                fillOpacity={nodeOpacity}
                letterSpacing={0.1}
              >
                {node.label}
              </Text>
            )}
          </group>
        )
      })}

      {/* Connection lines — only when a node is active */}
      {activeNode && <ConnectionLines activeNode={activeNode} />}
    </group>
  )
}

// ── Connection lines between active node and its neighbors ──

const CONNECTIONS: Record<string, string[]> = {
  api: ['database', 'notifications', 'analytics', 'automation'],
  database: ['api', 'analytics'],
  notifications: ['api', 'automation'],
  analytics: ['api', 'database'],
  automation: ['api', 'notifications'],
  storage: ['api'],
}

function ConnectionLines({ activeNode }: { activeNode: string }) {
  const targets = CONNECTIONS[activeNode] || []
  const activeNodeData = SYSTEM_NODES.find(n => n.id === activeNode)
  if (!activeNodeData) return null

  return (
    <>
      {targets.map(targetId => {
        const target = SYSTEM_NODES.find(n => n.id === targetId)
        if (!target) return null
        return (
          <LineSegment
            key={`${activeNode}-${targetId}`}
            from={activeNodeData.position}
            to={target.position}
          />
        )
      })}
    </>
  )
}

function LineSegment({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const lineObj = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: '#c9ff4a',
      transparent: true,
      opacity: 0.15,
    })
    return new THREE.Line(geometry, material)
  }, [from, to])

  return <primitive object={lineObj} />
}
