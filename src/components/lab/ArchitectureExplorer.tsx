import { useState, useCallback, useRef, useEffect } from 'react'
import {
  nodes, edges, scenarios, issueTypes, NODE_POSITIONS,
  getNeighbors, getRelatedNodes, getRelatedScenarios,
  getScenarioRoute, getEdgePathD, isEdgeInRoute, getFailingNode,
  type NodeId, type ViewMode, type SimStatus, type IssueType,
  type NodeExecState, type EdgeExecState, type TraceEntry, type SimResult, type ScenarioOutput,
} from '../../data/architectureModel'

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
function makeSimTime() {
  let t = 0
  return () => { t += 142 + Math.floor(Math.random() * 120); const s = Math.floor(t / 1000); return `${String(s).padStart(2, '0')}.${String(t % 1000).padStart(3, '0')}` }
}

function OutputCard({ output }: { output: ScenarioOutput }) {
  return (
    <div className="border border-acid/20 rounded-xl p-4 bg-acid/[0.03]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{output.icon}</span>
        <span className="text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase text-acid/80">{output.title}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        {output.fields.map(f => (
          <div key={f.label}>
            <div className="text-[6px] font-mono tracking-[0.12em] uppercase text-white/25">{f.label}</div>
            <div className="text-[9px] font-mono text-white/60">{f.value}</div>
          </div>
        ))}
      </div>
      <div className="text-[8px] font-mono text-white/35 leading-relaxed border-t border-white/[0.06] pt-2">{output.message}</div>
    </div>
  )
}

export default function ArchitectureExplorer() {
  const [selected, setSelected] = useState<NodeId | null>(null)
  const [showTechnical, setShowTechnical] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [scenarioId, setScenarioId] = useState('notify')
  const [issue, setIssue] = useState<IssueType>('none')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [simStatus, setSimStatus] = useState<SimStatus>('idle')
  const [nodeStates, setNodeStates] = useState<Record<string, NodeExecState>>({})
  const [edgeStates, setEdgeStates] = useState<Record<string, EdgeExecState>>({})
  const [processingNode, setProcessingNode] = useState<NodeId | null>(null)
  const [trace, setTrace] = useState<TraceEntry[]>([])
  const [simResult, setSimResult] = useState<SimResult | null>(null)

  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map())
  const pulseRef = useRef<SVGCircleElement>(null)
  const isRunningRef = useRef(false)
  const cancelRef = useRef(false)

  const selectedNode = nodes.find(n => n.id === selected)
  const route = getScenarioRoute(scenarioId, issue)
  const isSimulating = simStatus === 'running'

  useEffect(() => { return () => { cancelRef.current = true } }, [])

  const simulate = useCallback(async (overrideScenario?: string) => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    cancelRef.current = false
    const sid = overrideScenario || scenarioId
    const sc = scenarios.find(s => s.id === sid)
    if (!sc) { isRunningRef.current = false; return }
    const r = getScenarioRoute(sid, issue)
    const getTime = makeSimTime()
    const initN: Record<string, NodeExecState> = {}
    nodes.forEach(n => { initN[n.id] = r.includes(n.id) ? 'queued' : 'unused' })
    setNodeStates(initN)
    const initE: Record<string, EdgeExecState> = {}
    edges.forEach(e => { initE[`${e.from}-${e.to}`] = 'idle' })
    setEdgeStates(initE)
    setSimStatus('running'); setTrace([]); setSimResult(null); setProcessingNode(null)
    setTrace([{ time: '00.000', nodeId: null, label: 'FLOW STARTED', detail: sc.label }])
    const failNode = getFailingNode(issue)

    for (let i = 0; i < r.length; i++) {
      if (cancelRef.current) break
      const nodeId = r[i]
      setNodeStates(prev => ({ ...prev, [nodeId]: 'processing' }))
      setProcessingNode(nodeId)
      setTrace(prev => [...prev, { time: getTime(), nodeId, label: nodes.find(n => n.id === nodeId)?.label || nodeId, detail: sc.stepDetails[i] || 'Processing' }])

      if (i > 0) {
        const edgeKey = `${r[i - 1]}-${nodeId}`
        setEdgeStates(prev => ({ ...prev, [edgeKey]: 'active' }))
        const pathEl = pathRefs.current.get(edgeKey)
        if (pathEl && pulseRef.current) {
          try {
            const len = pathEl.getTotalLength()
            const steps = Math.max(12, Math.floor(len / 1.5))
            for (let s = 0; s <= steps; s++) {
              if (cancelRef.current) break
              const pt = pathEl.getPointAtLength((s / steps) * len)
              pulseRef.current.setAttribute('cx', String(pt.x))
              pulseRef.current.setAttribute('cy', String(pt.y))
              pulseRef.current.style.opacity = '1'
              await delay(Math.max(6, 380 / steps))
            }
          } catch { await delay(380) }
        } else { await delay(380) }
        if (cancelRef.current) break

        if (failNode === nodeId && i === r.length - 1) {
          setEdgeStates(prev => ({ ...prev, [edgeKey]: 'failed' }))
          setNodeStates(prev => ({ ...prev, [nodeId]: 'failed' }))
          setTrace(prev => [...prev, { time: getTime(), nodeId, label: nodes.find(n => n.id === nodeId)?.label || nodeId, detail: 'NODE UNAVAILABLE' }])
          setTrace(prev => [...prev, { time: getTime(), nodeId: null, label: 'FLOW FAILED', detail: issueTypes.find(iss => iss.id === issue)?.description || '' }])
          if (pulseRef.current) pulseRef.current.style.opacity = '0'
          await delay(400)
          if (!cancelRef.current) {
            setSimStatus('failed'); setProcessingNode(null)
            setSimResult({ scenarioId: sc.id, scenarioLabel: sc.label, status: 'failed', finalNode: nodeId, route: r, selectedNode: selected, selectedParticipated: selected ? r.includes(selected) : false, output: null, failedAt: nodeId, failedReason: issueTypes.find(iss => iss.id === issue)?.description || '' })
          }
          isRunningRef.current = false; return
        }
        setEdgeStates(prev => ({ ...prev, [edgeKey]: 'complete' }))
      } else { await delay(200) }
      if (cancelRef.current) break
      if (i > 0) setNodeStates(prev => ({ ...prev, [r[i - 1]]: 'success' }))
    }

    if (!cancelRef.current) {
      const lastNode = r[r.length - 1]
      setNodeStates(prev => ({ ...prev, [lastNode]: 'success' }))
      setTrace(prev => [...prev, { time: getTime(), nodeId: null, label: 'FLOW COMPLETE', detail: sc.result }])
      if (pulseRef.current) pulseRef.current.style.opacity = '0'
      await delay(300)
      if (!cancelRef.current) {
        setSimStatus('success'); setProcessingNode(null)
        setSimResult({ scenarioId: sc.id, scenarioLabel: sc.label, status: 'completed', finalNode: lastNode, route: r, selectedNode: selected, selectedParticipated: selected ? r.includes(selected) : false, output: sc.output, failedAt: null, failedReason: '' })
      }
    } else {
      if (pulseRef.current) pulseRef.current.style.opacity = '0'
      setSimStatus('idle')
    }
    isRunningRef.current = false
  }, [scenarioId, issue, selected])

  const reset = useCallback(() => {
    cancelRef.current = true; setSimStatus('idle'); setNodeStates({}); setEdgeStates({})
    setProcessingNode(null); setTrace([]); setSimResult(null)
    if (pulseRef.current) pulseRef.current.style.opacity = '0'
    setTimeout(() => { isRunningRef.current = false }, 60)
  }, [])

  const traceSelectedNode = useCallback(() => {
    if (!selected || isSimulating) return
    const related = getRelatedScenarios(selected)
    if (related.length === 0) return
    const currentRoute = getScenarioRoute(scenarioId, issue)
    const targetId = currentRoute.includes(selected) ? scenarioId : related[0].id
    setScenarioId(targetId)
    setTimeout(() => simulate(targetId), 80)
  }, [selected, scenarioId, issue, isSimulating, simulate])

  const visibleNodeIds: Record<ViewMode, NodeId[]> = {
    overview: nodes.map(n => n.id),
    request: ['user', 'web', 'api', 'database', 'storage', 'external'],
    event: ['api', 'automation', 'notifications', 'analytics'],
    data: ['database', 'analytics', 'api', 'storage'],
  }

  function getNodeStyle(nodeId: NodeId): string {
    const ns = nodeStates[nodeId]
    const isFinalDest = simResult?.finalNode === nodeId && simResult?.status === 'completed'
    if (isFinalDest) return 'border-acid text-acid bg-acid/20 shadow-[0_0_20px_rgba(201,255,74,0.25)] scale-110'
    if (processingNode === nodeId && simStatus === 'running') return 'border-acid/60 text-acid bg-acid/15 shadow-[0_0_15px_rgba(201,255,74,0.15)]'
    if (ns === 'success') return 'border-acid/30 text-acid/70 bg-acid/5'
    if (ns === 'failed') return 'border-red-500/30 text-red-400/70 bg-red-500/5'
    if (selected === nodeId) return 'border-acid/40 text-acid bg-acid/[0.06]'
    return 'border-white/12 text-white/45 bg-ink/80 hover:border-white/20'
  }

  function getNodeOpacity(nodeId: NodeId): number {
    const ns = nodeStates[nodeId]
    if (simStatus !== 'idle') {
      if (ns === 'processing' || ns === 'success' || ns === 'failed') return 1
      if (ns === 'queued') return 0.5
      return 0.12
    }
    if (selected) { const rel = getRelatedNodes(selected); return rel.has(nodeId) ? 0.85 : 0.15 }
    return 1
  }

  function getEdgeVis(from: NodeId, to: NodeId) {
    const key = `${from}-${to}`
    const es = edgeStates[key]
    const inRoute = isEdgeInRoute(from, to, route)
    if (simStatus !== 'idle') {
      if (es === 'active') return { color: 'rgba(201,255,74,0.85)', width: 0.55, opacity: 1 }
      if (es === 'complete') return { color: 'rgba(201,255,74,0.4)', width: 0.35, opacity: 0.85 }
      if (es === 'failed') return { color: 'rgba(239,68,68,0.6)', width: 0.4, opacity: 0.9 }
      if (inRoute) return { color: 'rgba(255,255,255,0.08)', width: 0.2, opacity: 0.3 }
      return { color: 'rgba(255,255,255,0.02)', width: 0.15, opacity: 0.1 }
    }
    if (selected) { const rel = getRelatedNodes(selected); if (rel.has(from) && rel.has(to)) return { color: 'rgba(255,255,255,0.18)', width: 0.35, opacity: 0.9 } }
    return { color: 'rgba(255,255,255,0.10)', width: 0.25, opacity: 0.5 }
  }

  const hasResult = simResult !== null
  const hasTrace = isSimulating && trace.length > 0
  const relatedFlows = selectedNode ? getRelatedScenarios(selectedNode.id) : []

  return (
    <div>
      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={scenarioId} onChange={e => { setScenarioId(e.target.value); reset() }} disabled={isSimulating}
          className="text-[8px] md:text-[9px] font-mono tracking-[0.1em] uppercase border border-white/[0.12] rounded-lg px-3 py-2 bg-ink/80 text-white/60 cursor-pointer appearance-none min-h-[36px] disabled:opacity-40"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>
          {scenarios.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button onClick={isSimulating ? reset : () => simulate()} data-cursor="TRACE"
          className="text-[8px] md:text-[9px] font-mono tracking-[0.12em] uppercase border border-acid/30 text-acid bg-acid/10 rounded-lg px-4 py-2 hover:bg-acid/20 transition-all cursor-pointer min-h-[36px]">
          {isSimulating ? 'TRACING...' : hasResult ? 'RESET' : 'TRACE REQUEST'}
        </button>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[7px] font-mono tracking-[0.1em] uppercase border border-white/[0.08] text-white/25 rounded-lg px-2 py-1.5 hover:border-white/15 transition-all cursor-pointer min-h-[28px]">
          {showAdvanced ? 'HIDE' : 'ADVANCED'}
        </button>
        {!isSimulating && !hasResult && (
          <div className="ml-auto flex flex-wrap items-center gap-0.5">
            {route.map((nodeId, i) => (
              <span key={i} className="flex items-center">
                <span className="text-[7px] font-mono text-white/20">{nodes.find(n => n.id === nodeId)?.label}</span>
                {i < route.length - 1 && <span className="text-[6px] text-white/10 mx-0.5">→</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-2 mb-3 p-2 border border-white/[0.06] rounded-lg bg-white/[0.01]">
          <div className="flex gap-1">
            {(['overview', 'request', 'event', 'data'] as ViewMode[]).map(vm => (
              <button key={vm} onClick={() => { setViewMode(vm); setSelected(null) }} disabled={isSimulating}
                className={`text-[7px] font-mono tracking-[0.1em] uppercase border rounded px-2 py-1 transition-all cursor-pointer min-h-[24px] disabled:opacity-40 ${viewMode === vm ? 'border-acid/40 text-acid bg-acid/10' : 'border-white/[0.08] text-white/35 hover:border-white/15'}`}>{vm}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {issueTypes.filter(i => i.id !== 'none').map(i => (
              <button key={i.id} onClick={() => { setIssue(i.id === issue ? 'none' : i.id); reset() }} disabled={isSimulating}
                className={`text-[7px] font-mono tracking-[0.1em] uppercase border rounded px-2 py-1 transition-all cursor-pointer min-h-[24px] disabled:opacity-40 ${issue === i.id ? 'border-red-500/40 text-red-400 bg-red-500/10' : 'border-white/[0.08] text-white/35 hover:border-white/15'}`}>{i.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* ── Graph ── */}
        <div className="relative border border-white/[0.08] rounded-xl bg-white/[0.015] overflow-hidden" style={{ minHeight: 380 }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {edges.map(edge => {
              const key = `${edge.from}-${edge.to}`
              const v = getEdgeVis(edge.from, edge.to)
              const dashArray = edge.type === 'async' ? '2 2' : edge.type === 'event' ? '1.5 2' : undefined
              return <path key={key} ref={el => { if (el) pathRefs.current.set(key, el) }} d={getEdgePathD(edge.from, edge.to)} fill="none" stroke={v.color} strokeWidth={v.width} strokeDasharray={dashArray} opacity={v.opacity} style={{ transition: 'stroke 0.35s, stroke-width 0.35s, opacity 0.35s' }} />
            })}
            <circle ref={pulseRef} cx={0} cy={0} r={1.5} fill="rgba(201,255,74,0.9)" style={{ opacity: 0, transition: 'opacity 0.12s' }} />
          </svg>

          {nodes.filter(n => visibleNodeIds[viewMode].includes(n.id)).map(node => {
            const pos = NODE_POSITIONS[node.id]
            return (
              <button key={node.id} onClick={() => { if (!isSimulating) setSelected(selected === node.id ? null : node.id) }}
                className={`absolute text-[7px] md:text-[8px] font-mono tracking-[0.12em] border rounded-lg px-2 md:px-2.5 py-1.5 md:py-2 transition-all cursor-pointer min-h-[28px] ${getNodeStyle(node.id)}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', opacity: getNodeOpacity(node.id), transition: 'opacity 0.35s, border-color 0.35s, background 0.35s, transform 0.35s' }}>
                {node.label}
              </button>
            )
          })}

          {!selected && simStatus === 'idle' && (
            <div className="absolute bottom-3 left-3 text-[7px] font-mono text-white/15">Select a node or trace a scenario</div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="border border-white/[0.08] rounded-xl p-3 md:p-4 bg-white/[0.02] overflow-y-auto max-h-[480px]">
          {/* After simulation — output card + trace */}
          {hasResult && simResult && (
            <div className="space-y-3">
              {simResult.output && <OutputCard output={simResult.output} />}
              {simResult.status === 'failed' && (
                <div className="border border-red-500/20 rounded-xl p-3 bg-red-500/5">
                  <div className="text-[8px] font-mono tracking-[0.12em] uppercase text-red-400/70 mb-1">FLOW FAILED</div>
                  <div className="text-[8px] font-mono text-white/35">{simResult.failedReason}</div>
                </div>
              )}
              {simResult.selectedNode && (
                <div className={`border rounded-lg p-2 ${simResult.selectedParticipated ? 'border-acid/20 bg-acid/[0.03]' : 'border-white/[0.06]'}`}>
                  <div className="flex items-center gap-2 text-[7px] font-mono">
                    <span className="text-white/25 uppercase tracking-[0.1em]">SELECTED</span>
                    <span className="text-white/50">{nodes.find(n => n.id === simResult.selectedNode)?.label}</span>
                    <span className={simResult.selectedParticipated ? 'text-acid/60' : 'text-white/30'}>
                      {simResult.selectedParticipated ? '✓ IN FLOW' : '○ NOT IN FLOW'}
                    </span>
                  </div>
                  {!simResult.selectedParticipated && (
                    <button onClick={traceSelectedNode} className="mt-2 text-[7px] font-mono tracking-[0.1em] uppercase border border-acid/25 text-acid/60 rounded-lg px-2.5 py-1.5 hover:bg-acid/10 transition-all cursor-pointer min-h-[28px]">
                      TRACE {nodes.find(n => n.id === simResult.selectedNode)?.label} →
                    </button>
                  )}
                </div>
              )}
              <div>
                <div className="text-[6px] font-mono tracking-[0.12em] uppercase text-white/20 mb-1">TRACE</div>
                <div className="space-y-0.5">
                  {trace.map((entry, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[6px] font-mono text-white/15 shrink-0 w-[36px]">{entry.time}</span>
                      <span className={`text-[7px] font-mono ${entry.label === 'FLOW FAILED' ? 'text-red-400/70' : entry.label === 'FLOW COMPLETE' ? 'text-acid/70' : entry.detail === 'NODE UNAVAILABLE' ? 'text-red-400/60' : 'text-white/40'}`}>
                        {entry.nodeId ? <>{entry.label} <span className="text-white/20">— {entry.detail}</span></> : <span className="uppercase">{entry.label}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* During simulation — live trace */}
          {!hasResult && hasTrace && (
            <div>
              <div className="text-[7px] font-mono tracking-[0.15em] uppercase text-acid/50 mb-2">EXECUTING</div>
              <div className="space-y-0.5">
                {trace.map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[6px] font-mono text-white/15 shrink-0 w-[36px]">{entry.time}</span>
                    <span className="text-[7px] font-mono text-white/40">
                      {entry.nodeId ? <>{entry.label} <span className="text-white/20">— {entry.detail}</span></> : <span className="uppercase">{entry.label}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node selected — inspector */}
          {!hasResult && !hasTrace && selectedNode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[9px] font-mono tracking-[0.15em] uppercase text-acid/70">{selectedNode.label}</div>
                <div className="flex gap-1">
                  <button onClick={() => setShowTechnical(false)} className={`text-[6px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${!showTechnical ? 'text-acid/70 bg-acid/10' : 'text-white/25'}`}>SIMPLE</button>
                  <button onClick={() => setShowTechnical(true)} className={`text-[6px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${showTechnical ? 'text-acid/70 bg-acid/10' : 'text-white/25'}`}>TECH</button>
                </div>
              </div>
              <p className="text-[8px] font-mono text-white/40 leading-relaxed mb-3">{showTechnical ? selectedNode.technical : selectedNode.simple}</p>
              {(() => { const { upstream, downstream } = getNeighbors(selectedNode.id); return (<>
                {upstream.length > 0 && <div className="mb-2"><div className="text-[6px] font-mono tracking-[0.12em] uppercase text-white/20 mb-1">FROM</div><div className="flex flex-wrap gap-1">{upstream.map(id => <span key={id} className="text-[7px] font-mono px-1.5 py-0.5 border border-white/10 rounded text-white/40 uppercase">{nodes.find(n => n.id === id)?.label}</span>)}</div></div>}
                {downstream.length > 0 && <div className="mb-2"><div className="text-[6px] font-mono tracking-[0.12em] uppercase text-white/20 mb-1">TO</div><div className="flex flex-wrap gap-1">{downstream.map(id => <span key={id} className="text-[7px] font-mono px-1.5 py-0.5 border border-white/10 rounded text-white/40 uppercase">{nodes.find(n => n.id === id)?.label}</span>)}</div></div>}
              </>) })()}
              {relatedFlows.length > 0 && (
                <div className="mt-3">
                  <div className="text-[6px] font-mono tracking-[0.12em] uppercase text-white/20 mb-1">FLOWS</div>
                  <div className="flex flex-wrap gap-1 mb-2">{relatedFlows.map(f => <span key={f.id} className="text-[7px] font-mono px-1.5 py-0.5 border border-white/10 rounded text-white/40 uppercase">{f.label}</span>)}</div>
                  {!isSimulating && (
                    <button onClick={traceSelectedNode} data-cursor="TRACE"
                      className="w-full text-[8px] font-mono tracking-[0.1em] uppercase border border-acid/40 text-acid bg-acid/10 rounded-lg px-3 py-2 hover:bg-acid/20 transition-all cursor-pointer min-h-[32px]">
                      TRACE {selectedNode.label} →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Idle */}
          {!hasResult && !hasTrace && !selectedNode && (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <div className="text-[8px] font-mono text-white/20 leading-relaxed">Select a node to inspect.<br />Or trace a scenario.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
