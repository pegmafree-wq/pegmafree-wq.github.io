import { useState, useCallback, useRef, useEffect } from 'react'
import {
  getDefaultNode, executeWorkflow, getOptionsForType,
  type WorkflowNode, type NodeType, type Payload, type WorkflowExecution,
} from '../../data/workflowModel'

const defaultNodes: WorkflowNode[] = [
  { id: 't1', type: 'trigger', label: 'New Order', config: {} },
  { id: 'f1', type: 'filter', label: 'Amount > 1000', config: {} },
  { id: 'a1', type: 'action', label: 'Create Record', config: {} },
  { id: 'n1', type: 'notification', label: 'Email Alert', config: {} },
]

export default function WorkflowPlayground() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes)
  const [payload, setPayload] = useState<Payload>({ name: 'alex', amount: 1200, customer: 'Sample Customer', paid: true })
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [activeNodeIdx, setActiveNodeIdx] = useState(-1)
  const timersRef = useRef<number[]>([])

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }

  useEffect(() => () => clearTimers(), [])

  const updateNode = (id: string, label: string) => {
    setNodes((n) => n.map((node) => node.id === id ? { ...node, label } : node))
  }

  const addNode = (type: NodeType) => {
    const newNode = getDefaultNode(type)
    setNodes((n) => {
      const insertIdx = n.length > 0 ? n.length - 1 : 0
      const copy = [...n]
      copy.splice(insertIdx, 0, newNode)
      return copy
    })
  }

  const removeNode = (id: string) => {
    setNodes((n) => n.filter((node) => node.id !== id))
  }

  const run = useCallback(() => {
    clearTimers()
    setStatus('running')
    setExecution(null)
    setActiveNodeIdx(-1)

    const result = executeWorkflow(nodes, payload)
    const totalMs = 1500 + Math.random() * 500

    // Animate through nodes
    result.nodes.forEach((_, i) => {
      const delay = (totalMs / result.nodes.length) * (i + 1)
      const t = window.setTimeout(() => {
        setActiveNodeIdx(i)
        if (i === result.nodes.length - 1) {
          const t2 = window.setTimeout(() => {
            setStatus('done')
            setExecution(result)
            setActiveNodeIdx(-1)
          }, 300)
          timersRef.current.push(t2)
        }
      }, delay)
      timersRef.current.push(t)
    })
  }, [nodes, payload])

  const reset = () => {
    clearTimers()
    setStatus('idle')
    setExecution(null)
    setActiveNodeIdx(-1)
  }

  const nodeTypes: { type: NodeType; label: string }[] = [
    { type: 'filter', label: '+ FILTER' },
    { type: 'transform', label: '+ TRANSFORM' },
    { type: 'approval', label: '+ APPROVAL' },
    { type: 'delay', label: '+ DELAY' },
    { type: 'notification', label: '+ NOTIFY' },
  ]

  return (
    <div>
      {/* Node canvas */}
      <div className="border border-white/[0.08] rounded-xl p-3 md:p-4 bg-white/[0.015] mb-4">
        <div className="flex flex-col items-center gap-1.5">
          {nodes.map((node, i) => {
            const isActive = activeNodeIdx === i
            const isDone = status === 'done' && execution?.nodes[i]
            const execNode = execution?.nodes[i]
            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className="relative flex items-center gap-2">
                  <div className={`text-[6px] font-mono text-white/20 w-8 text-right uppercase shrink-0`}>
                    {node.type}
                  </div>
                  <select
                    value={node.label}
                    onChange={(e) => updateNode(node.id, e.target.value)}
                    disabled={status === 'running'}
                    className={`text-[9px] md:text-[10px] font-mono px-2.5 py-2 rounded-lg border appearance-none cursor-pointer bg-transparent pr-5 transition-all min-h-[34px] min-w-[130px] md:min-w-[160px] ${
                      isActive ? 'border-acid text-acid bg-acid/10' :
                      isDone ? execNode?.status === 'filtered' ? 'border-red-500/30 text-red-400/70 bg-red-500/5' :
                               execNode?.status === 'denied' ? 'border-red-500/30 text-red-400/70 bg-red-500/5' :
                               'border-acid/30 text-acid/70 bg-acid/5' :
                      'border-white/12 text-white/55 hover:border-white/20'
                    }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 0l3 4 3-4z' fill='%23ffffff40'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                  >
                    {getOptionsForType(node.type).map((opt) => (
                      <option key={opt} value={opt} className="bg-ink text-bone">{opt}</option>
                    ))}
                  </select>
                  {status === 'idle' && (
                    <button onClick={() => removeNode(node.id)}
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-white/10 text-white/40 text-[7px] flex items-center justify-center hover:bg-white/20 cursor-pointer">×</button>
                  )}
                </div>
                {i < nodes.length - 1 && (
                  <div className={`text-xs transition-colors shrink-0 ${isActive ? 'text-acid' : isDone ? 'text-acid/40' : 'text-white/15'}`}>↓</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add buttons */}
        {status === 'idle' && (
          <div className="flex flex-wrap gap-1 mt-3 justify-center">
            {nodeTypes.map((nt) => (
              <button key={nt.type} onClick={() => addNode(nt.type)}
                className="text-[6px] md:text-[7px] font-mono text-white/25 hover:text-white/40 border border-white/[0.06] rounded px-2 py-1 cursor-pointer min-h-[24px]">
                {nt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Test payload */}
      <div className="border border-white/[0.06] rounded-lg p-3 mb-4 bg-white/[0.015]">
        <div className="text-[6px] md:text-[7px] font-mono tracking-[0.12em] uppercase text-white/25 mb-2">TEST PAYLOAD</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="text-[6px] font-mono text-white/20 block mb-0.5">NAME</label>
            <input value={payload.name} onChange={(e) => setPayload((p) => ({ ...p, name: e.target.value }))}
              disabled={status === 'running'}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-[8px] font-mono text-white/60 outline-none focus:border-white/20 disabled:opacity-40" />
          </div>
          <div>
            <label className="text-[6px] font-mono text-white/20 block mb-0.5">AMOUNT</label>
            <input type="number" value={payload.amount} onChange={(e) => setPayload((p) => ({ ...p, amount: Number(e.target.value) }))}
              disabled={status === 'running'}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-[8px] font-mono text-white/60 outline-none focus:border-white/20 disabled:opacity-40" />
          </div>
          <div>
            <label className="text-[6px] font-mono text-white/20 block mb-0.5">CUSTOMER</label>
            <input value={payload.customer} onChange={(e) => setPayload((p) => ({ ...p, customer: e.target.value }))}
              disabled={status === 'running'}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-[8px] font-mono text-white/60 outline-none focus:border-white/20 disabled:opacity-40" />
          </div>
          <div>
            <label className="text-[6px] font-mono text-white/20 block mb-0.5">PAID</label>
            <select value={payload.paid ? 'yes' : 'no'} onChange={(e) => setPayload((p) => ({ ...p, paid: e.target.value === 'yes' }))}
              disabled={status === 'running'}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-[8px] font-mono text-white/60 appearance-none cursor-pointer outline-none disabled:opacity-40"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 0l3 4 3-4z' fill='%23ffffff40'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '12px' }}>
              <option value="yes" className="bg-ink">Yes</option>
              <option value="no" className="bg-ink">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions + Log */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 items-center shrink-0">
          {status === 'idle' ? (
            <button onClick={run} data-cursor="RUN"
              className="text-[8px] md:text-[9px] font-mono tracking-[0.14em] uppercase border border-acid/40 text-acid bg-acid/10 rounded-full px-4 py-2 hover:bg-acid/20 transition-all cursor-pointer min-h-[34px]">
              RUN FLOW
            </button>
          ) : (
            <button onClick={reset}
              className="text-[8px] md:text-[9px] font-mono tracking-[0.14em] uppercase border border-white/15 text-white/50 rounded-full px-4 py-2 hover:border-white/25 transition-all cursor-pointer min-h-[34px]">
              RESET
            </button>
          )}
          {status === 'running' && (
            <span className="flex items-center gap-1.5 text-[7px] md:text-[8px] font-mono text-acid/70">
              <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" /> RUNNING
            </span>
          )}
          {status === 'done' && execution && (
            <span className="flex items-center gap-1.5 text-[7px] md:text-[8px] font-mono text-acid">
              <span className="w-1.5 h-1.5 rounded-full bg-acid" />
              {execution.status === 'filtered' ? 'FILTERED' : execution.status === 'denied' ? 'DENIED' : 'SUCCESS'}
            </span>
          )}
        </div>

        <div className="flex-1 border border-white/[0.06] rounded-lg p-2.5 bg-white/[0.015] min-h-[60px] font-mono text-[8px] md:text-[9px] overflow-x-auto">
          {execution ? (
            execution.logs.map((l, i) => (
              <div key={i} className={`leading-relaxed whitespace-nowrap ${
                l.includes('complete') || l.includes('PASSED') || l.includes('applied') || l.includes('granted') || l.includes('sent') ? 'text-acid/60' :
                l.includes('FILTERED') || l.includes('REJECTED') || l.includes('stopped') ? 'text-red-400/60' :
                l.includes('rule') ? 'text-yellow-400/50' :
                'text-white/40'
              }`}>{l}</div>
            ))
          ) : (
            <div className="text-white/20">Run the flow to see execution logs...</div>
          )}
        </div>
      </div>

      {/* Execution inspector */}
      {execution && execution.nodes.length > 0 && (
        <div className="mt-3 border border-white/[0.06] rounded-lg p-3 bg-white/[0.015]">
          <div className="text-[6px] md:text-[7px] font-mono tracking-[0.12em] uppercase text-white/25 mb-2">EXECUTION INSPECTOR</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {execution.nodes.map((n) => (
              <div key={n.nodeId} className={`border rounded-lg p-2 ${
                n.status === 'filtered' || n.status === 'denied' ? 'border-red-500/20 bg-red-500/5' :
                n.status === 'success' ? 'border-acid/20 bg-acid/5' :
                'border-white/[0.06] bg-white/[0.01]'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7px] md:text-[8px] font-mono text-white/50">{n.nodeId}</span>
                  <span className={`text-[6px] font-mono px-1 py-0.5 rounded ${
                    n.status === 'filtered' || n.status === 'denied' ? 'text-red-400/70 bg-red-500/10' :
                    n.status === 'success' ? 'text-acid/70 bg-acid/10' :
                    'text-white/30 bg-white/5'
                  }`}>{n.status.toUpperCase()}</span>
                </div>
                <div className="text-[7px] font-mono text-white/30 truncate">{n.output}</div>
                <div className="text-[6px] font-mono text-white/15 mt-1">{n.duration}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'done' && execution && (
        <div className="mt-2 text-[7px] md:text-[8px] font-mono text-acid/40">
          {execution.status === 'filtered' ? 'Flow stopped at filter. Change the payload amount to see a different result.' :
           execution.status === 'denied' ? 'Flow stopped at approval.' :
           'ONE LESS REPETITIVE TASK.'}
        </div>
      )}
      <div className="mt-1 text-[6px] font-mono text-white/15 uppercase">SIMULATED EXECUTION</div>
    </div>
  )
}
