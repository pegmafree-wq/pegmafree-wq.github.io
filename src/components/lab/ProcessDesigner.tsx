import { useState, useRef, useCallback, useEffect } from 'react'
import {
  defaultSteps, createStep, executeProcess,
  type ProcessStep, type ProcessRule, type ProcessTestInput, type StepExecution,
} from '../../data/processModel'

export default function ProcessDesigner() {
  const [steps, setSteps] = useState<ProcessStep[]>(defaultSteps)
  const [newName, setNewName] = useState('')
  const [rule, setRule] = useState<ProcessRule>({
    enabled: false, field: 'AMOUNT', operator: 'GREATER THAN', value: '10000', action: 'REQUIRE APPROVAL',
  })
  const [input, setInput] = useState<ProcessTestInput>({ amount: '12500', priority: '1', category: 'general' })
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'stopped'>('idle')
  const [execution, setExecution] = useState<StepExecution[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState(-1)
  const timersRef = useRef<number[]>([])

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }

  useEffect(() => () => clearTimers(), [])

  const toggleStep = (id: string) => setSteps((s) => s.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x))
  const renameStep = (id: string, name: string) => setSteps((s) => s.map((x) => x.id === id ? { ...x, name: name.toUpperCase() } : x))
  const addStep = () => {
    if (!newName.trim()) return
    setSteps((s) => [...s, createStep(newName)])
    setNewName('')
  }
  const removeStep = (id: string) => setSteps((s) => s.filter((x) => x.id !== id))
  const moveStep = (id: string, dir: -1 | 1) => {
    setSteps((s) => {
      const idx = s.findIndex((x) => x.id === id)
      if (idx === -1) return s
      const ni = idx + dir
      if (ni < 0 || ni >= s.length) return s
      const c = [...s]; [c[idx], c[ni]] = [c[ni], c[idx]]
      return c
    })
  }

  const testProcess = useCallback(() => {
    clearTimers()
    setStatus('running')
    setExecution([])
    setLogs([])
    setActiveStep(-1)

    const result = executeProcess(steps, rule, input)

    // Animate steps
    result.execution.forEach((step, i) => {
      const delay = 700 + i * 800
      const t = window.setTimeout(() => {
        setActiveStep(i)
        setExecution((e) => [...e.slice(0, i), { ...step, status: 'active' }])
        setLogs((l) => [...l, result.logs[i] || `${step.name.toLowerCase()} → processing`])

        const t2 = window.setTimeout(() => {
          setExecution((e) => [...e.slice(0, i), step])
          if (step.status === 'blocked') {
            setLogs((l) => [...l, `process.stopped → rule blocked at ${step.name}`])
            setStatus('stopped')
            setActiveStep(-1)
          } else if (i === result.execution.length - 1) {
            const t3 = window.setTimeout(() => {
              setLogs((l) => [...l, ...result.logs.slice(i + 1)])
              setStatus(result.status === 'stopped' ? 'stopped' : 'success')
              setActiveStep(-1)
            }, 400)
            timersRef.current.push(t3)
          }
        }, 300)
        timersRef.current.push(t2)
      }, delay)
      timersRef.current.push(t)
    })
  }, [steps, rule, input])

  const reset = () => {
    clearTimers()
    setStatus('idle')
    setExecution([])
    setLogs([])
    setActiveStep(-1)
  }

  const route = executeProcess(steps, rule, input).route

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <div>
        {/* Flow */}
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isActive = activeStep === i
            const execStep = execution[i]
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`flex-1 border rounded-xl px-3 py-2.5 flex items-center justify-between transition-all ${
                  isActive ? 'border-acid/60 bg-acid/[0.08]' :
                  execStep?.status === 'blocked' ? 'border-red-500/30 bg-red-500/5' :
                  execStep?.status === 'skipped' ? 'border-yellow-500/20 bg-yellow-500/5 opacity-50' :
                  execStep?.status === 'completed' ? 'border-acid/30 bg-acid/5' :
                  step.enabled ? 'border-white/15 bg-white/[0.03]' : 'border-white/[0.06] bg-white/[0.01] opacity-40'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isActive ? 'bg-acid animate-pulse' :
                      execStep?.status === 'completed' ? 'bg-acid' :
                      execStep?.status === 'blocked' ? 'bg-red-400' :
                      execStep?.status === 'skipped' ? 'bg-yellow-400' :
                      step.enabled ? 'bg-white/30' : 'bg-white/15'
                    }`} />
                    <input value={step.name} onChange={(e) => renameStep(step.id, e.target.value)}
                      disabled={status === 'running'}
                      className="bg-transparent border-none outline-none text-[9px] md:text-[10px] font-mono tracking-[0.1em] text-white/70 w-20 md:w-24 min-w-0 disabled:opacity-40" />
                    {execStep?.status === 'skipped' && <span className="text-[6px] font-mono text-yellow-400/60">SKIPPED</span>}
                    {execStep?.status === 'blocked' && <span className="text-[6px] font-mono text-red-400/60">BLOCKED</span>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {status === 'idle' && (
                      <>
                        <button onClick={() => moveStep(step.id, -1)} disabled={i === 0}
                          className="text-white/20 hover:text-white/50 disabled:opacity-20 text-[9px] cursor-pointer px-0.5">↑</button>
                        <button onClick={() => moveStep(step.id, 1)} disabled={i === steps.length - 1}
                          className="text-white/20 hover:text-white/50 disabled:opacity-20 text-[9px] cursor-pointer px-0.5">↓</button>
                        <button onClick={() => removeStep(step.id)}
                          className="text-white/20 hover:text-red-400 text-[9px] cursor-pointer px-0.5">×</button>
                      </>
                    )}
                    <button onClick={() => toggleStep(step.id)} disabled={status === 'running'}
                      className={`ml-1 text-[6px] md:text-[7px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer min-h-[20px] disabled:opacity-40 ${
                        step.enabled ? 'border-acid/30 text-acid bg-acid/10' : 'border-white/10 text-white/30 bg-transparent'
                      }`}>
                      {step.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
                {i < steps.length - 1 && <span className="text-white/15 text-xs shrink-0">↓</span>}
              </div>
            )
          })}
        </div>

        {/* Add step */}
        {status === 'idle' && (
          <div className="flex gap-2 mt-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStep()}
              placeholder="NEW STEP"
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[8px] md:text-[9px] font-mono text-white/60 placeholder:text-white/20 outline-none focus:border-white/20 min-h-[30px]" />
            <button onClick={addStep}
              className="text-[7px] md:text-[8px] font-mono border border-acid/30 text-acid bg-acid/10 rounded-lg px-2.5 py-1.5 hover:bg-acid/20 transition-all cursor-pointer min-h-[30px]">ADD</button>
          </div>
        )}

        {/* Route preview */}
        <div className="mt-3 flex flex-wrap gap-1 items-center">
          <span className="text-[6px] font-mono text-white/20 uppercase mr-1">ROUTE:</span>
          {route.map((name, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={`text-[7px] md:text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                name === 'BLOCKED' ? 'border-red-500/30 text-red-400/70 bg-red-500/5' : 'border-white/10 text-white/40'
              }`}>{name}</span>
              {i < route.length - 1 && <span className="text-white/10 text-[8px]">→</span>}
            </span>
          ))}
        </div>

        {/* Test */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[6px] font-mono text-white/25 uppercase">AMOUNT:</span>
            <input value={input.amount} onChange={(e) => setInput((i) => ({ ...i, amount: e.target.value }))}
              disabled={status === 'running'}
              className="w-20 bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-[8px] font-mono text-acid/70 outline-none focus:border-white/20 disabled:opacity-40" />
          </div>
          <button onClick={status === 'running' ? undefined : (status !== 'idle' ? reset : testProcess)}
            data-cursor="RUN"
            className="text-[7px] md:text-[8px] font-mono tracking-[0.12em] uppercase border border-acid/30 text-acid bg-acid/10 rounded-lg px-3 py-1.5 hover:bg-acid/20 transition-all cursor-pointer disabled:opacity-40 min-h-[30px]">
            {status === 'running' ? 'TESTING...' : status !== 'idle' ? 'RESET' : 'TEST PROCESS'}
          </button>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mt-3 border border-white/[0.06] rounded-lg p-2.5 bg-white/[0.015] font-mono text-[8px] md:text-[9px] overflow-x-auto">
            {logs.map((l, i) => (
              <div key={i} className={`leading-relaxed whitespace-nowrap ${
                l.includes('complete') || l.includes('done') || l.includes('granted') ? 'text-acid/60' :
                l.includes('blocked') || l.includes('stopped') || l.includes('rejected') ? 'text-red-400/60' :
                l.includes('rule') || l.includes('action') ? 'text-yellow-400/50' :
                'text-white/40'
              }`}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {/* Rule builder */}
      <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
        <div className="text-[6px] md:text-[7px] font-mono tracking-[0.15em] uppercase text-white/30 mb-2">RULE BUILDER</div>
        <div className="border border-white/[0.06] rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] md:text-[9px] font-mono text-white/55">Conditional Logic</span>
            <button onClick={() => setRule((r) => ({ ...r, enabled: !r.enabled }))}
              className={`w-7 h-[16px] rounded-full border transition-all cursor-pointer ${rule.enabled ? 'bg-acid/20 border-acid/40' : 'bg-white/5 border-white/15'}`}>
              <span className={`block w-2.5 h-2.5 rounded-full transition-transform mx-0.5 ${rule.enabled ? 'bg-acid translate-x-[15px]' : 'bg-white/30 translate-x-0'}`} />
            </button>
          </div>
          {rule.enabled && (
            <div className="border-t border-white/[0.06] pt-2.5 mt-2 space-y-2">
              <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-mono">
                <span className="text-white/30">IF</span>
                <select value={rule.field} onChange={(e) => setRule((r) => ({ ...r, field: e.target.value as any }))}
                  className="bg-transparent border border-white/08 rounded px-1 py-0.5 text-white/60 appearance-none cursor-pointer outline-none text-[8px] font-mono"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='3'%3E%3Cpath d='M0 0l2.5 3 2.5-3z' fill='%23ffffff40'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 3px center', paddingRight: '10px' }}>
                  <option value="AMOUNT" className="bg-ink">AMOUNT</option>
                  <option value="PRIORITY" className="bg-ink">PRIORITY</option>
                  <option value="CATEGORY" className="bg-ink">CATEGORY</option>
                </select>
                <select value={rule.operator} onChange={(e) => setRule((r) => ({ ...r, operator: e.target.value as any }))}
                  className="bg-transparent border border-white/08 rounded px-1 py-0.5 text-white/60 appearance-none cursor-pointer outline-none text-[8px] font-mono"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='3'%3E%3Cpath d='M0 0l2.5 3 2.5-3z' fill='%23ffffff40'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 3px center', paddingRight: '10px' }}>
                  <option value="GREATER THAN" className="bg-ink">&gt; GREATER THAN</option>
                  <option value="LESS THAN" className="bg-ink">&lt; LESS THAN</option>
                  <option value="EQUALS" className="bg-ink">= EQUALS</option>
                  <option value="DOES NOT EQUAL" className="bg-ink">≠ DOES NOT EQUAL</option>
                </select>
              </div>
              <input value={rule.value} onChange={(e) => setRule((r) => ({ ...r, value: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-[8px] md:text-[9px] font-mono text-acid/70 outline-none focus:border-white/20" />
              <div className="text-[8px] md:text-[9px] font-mono">
                <span className="text-white/30">THEN </span>
                <select value={rule.action} onChange={(e) => setRule((r) => ({ ...r, action: e.target.value as any }))}
                  className="bg-transparent border border-white/08 rounded px-1 py-0.5 text-acid/60 appearance-none cursor-pointer outline-none text-[8px] font-mono"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='3'%3E%3Cpath d='M0 0l2.5 3 2.5-3z' fill='%23ffffff40'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 3px center', paddingRight: '10px' }}>
                  <option value="REQUIRE APPROVAL" className="bg-ink">REQUIRE APPROVAL</option>
                  <option value="SKIP REVIEW" className="bg-ink">SKIP REVIEW</option>
                  <option value="FLAG REQUEST" className="bg-ink">FLAG REQUEST</option>
                  <option value="STOP PROCESS" className="bg-ink">STOP PROCESS</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-[7px] md:text-[8px] font-mono text-white/20 leading-relaxed">
          Configure rules that alter process flow. Change the test amount to see different routing behavior.
        </p>
      </div>
    </div>
  )
}
