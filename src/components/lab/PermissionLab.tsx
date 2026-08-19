import { useState, useCallback } from 'react'
import {
  scenarios, testActions, permLabels, roleLabels,
  getEffectivePermissions, testAccess, countEffective,
  type Role, type Perm, type OverrideType, type AccessTestResult,
} from '../../data/permissionModel'

export default function PermissionLab() {
  const [scenario, setScenario] = useState(scenarios[0])
  const [role, setRole] = useState<Role>('owner')
  const [overrides, setOverrides] = useState<Partial<Record<Perm, OverrideType>>>({})
  const [testAction, setTestAction] = useState<Perm>('view_dashboard')
  const [auditLog, setAuditLog] = useState<string[]>(['09:41 system.initialized'])
  const [simulating, setSimulating] = useState(false)
  const [simSteps, setSimSteps] = useState<string[]>([])
  const [simResult, setSimResult] = useState<AccessTestResult | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const perms = Object.keys(permLabels) as Perm[]
  const effectivePerms = getEffectivePermissions(role, overrides, scenario.basePermissions)
  const { allowed: effectiveCount } = countEffective(effectivePerms)
  const roleUser = scenario.roles.find((u) => u.role === role)

  const log = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    setAuditLog((l) => [`<span class="text-acid">${time}</span> ${msg}`, ...l.slice(0, 10)])
  }, [])

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 1500)
  }

  const switchScenario = (s: typeof scenario) => {
    setScenario(s)
    setRole(s.roles[0].role)
    setOverrides({})
    setSimulating(false)
    setSimSteps([])
    setSimResult(null)
    log(`scenario.switch → ${s.label}`)
    showFeedback('SCENARIO CHANGED')
  }

  const switchUser = (u: { name: string; role: Role }) => {
    setRole(u.role)
    setOverrides({})
    setSimulating(false)
    setSimSteps([])
    setSimResult(null)
    log(`user.switch → ${u.name} (${u.role})`)
    showFeedback('ROLE CHANGED')
  }

  const toggleOverride = (p: Perm) => {
    const current = overrides[p]
    let next: OverrideType
    if (current === undefined || current === null) next = 'deny'
    else if (current === 'deny') next = 'allow'
    else next = null

    const newOverrides = { ...overrides }
    if (next === null) delete newOverrides[p]
    else newOverrides[p] = next
    setOverrides(newOverrides)

    const label = next === null ? 'REMOVED' : next === 'deny' ? 'DENY OVERRIDE' : 'ALLOW OVERRIDE'
    log(`override.${permLabels[p].toLowerCase().replace(/\s+/g, '.')} → ${label}`)
    showFeedback('OVERRIDE APPLIED')
  }

  const resetDefaults = () => {
    setOverrides({})
    setSimulating(false)
    setSimSteps([])
    setSimResult(null)
    log('permissions.reset → defaults')
    showFeedback('RESET TO DEFAULTS')
  }

  const simulateAccess = useCallback(() => {
    if (simulating) return
    setSimulating(true)
    setSimSteps([])
    setSimResult(null)

    const steps = ['USER', 'ROLE', 'EFFECTIVE', 'RESOURCE']
    steps.forEach((step, i) => {
      setTimeout(() => setSimSteps((s) => [...s, step]), i * 350)
    })

    setTimeout(() => {
      const result = testAccess(effectivePerms, testAction, roleUser?.name || 'Unknown', role)
      setSimResult(result)
      setSimulating(false)
      log(`access.test → ${testAction} → ${result.granted ? 'GRANTED' : 'DENIED'} (${result.source})`)
    }, 1600)
  }, [simulating, testAction, effectivePerms, role, roleUser, log])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
      <div>
        {/* Scenario selector */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className="text-[7px] font-mono text-white/25 uppercase self-center mr-1">SCENARIO:</span>
          {scenarios.map((s) => (
            <button key={s.id} onClick={() => switchScenario(s)}
              className={`text-[7px] md:text-[8px] font-mono px-2 py-1 md:py-1.5 rounded-lg border transition-all cursor-pointer min-h-[28px] ${
                scenario.id === s.id ? 'border-acid/50 text-acid bg-acid/10' : 'border-white/[0.08] text-white/40 hover:border-white/15 bg-transparent'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* User selector */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {scenario.roles.map((u) => (
            <button key={u.name} onClick={() => switchUser(u)}
              className={`flex items-center gap-1.5 text-[8px] md:text-[9px] font-mono px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg border transition-all cursor-pointer min-h-[28px] ${
                role === u.role ? 'border-acid/50 text-acid bg-acid/10' : 'border-white/[0.08] text-white/40 hover:border-white/15 bg-transparent'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${role === u.role ? 'bg-acid' : 'bg-white/20'}`} />
              {u.name} <span className="text-white/25 uppercase hidden sm:inline">{u.role}</span>
            </button>
          ))}
          <button onClick={resetDefaults}
            className="text-[7px] font-mono text-white/30 hover:text-white/50 border border-white/[0.06] rounded-lg px-2 py-1 cursor-pointer ml-auto min-h-[28px]">
            RESET
          </button>
        </div>

        {/* Access flow */}
        <div className="flex items-center gap-1.5 mb-2 text-[7px] md:text-[8px] font-mono text-white/30 overflow-x-auto">
          <span className="text-white/50 shrink-0">{roleUser?.name}</span>
          <span className="shrink-0">→</span>
          <span className="text-acid/70 uppercase shrink-0">{role}</span>
          <span className="shrink-0">→</span>
          <span className="shrink-0">EFFECTIVE</span>
          <span className="shrink-0">→</span>
          <span className="shrink-0">RESOURCE</span>
        </div>

        {/* Permission matrix */}
        <div className="border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_60px_50px_50px] md:grid-cols-[1fr_80px_60px_60px] text-[6px] md:text-[7px] font-mono tracking-[0.12em] uppercase text-white/30 border-b border-white/[0.06]">
            <div className="px-2 md:px-3 py-2">PERMISSION</div>
            <div className="px-1.5 md:px-2 py-2 text-center">ROLE</div>
            <div className="px-1.5 md:px-2 py-2 text-center">OVERRIDE</div>
            <div className="px-1.5 md:px-2 py-2 text-center">EFFECTIVE</div>
          </div>
          {perms.map((p) => {
            const ep = effectivePerms.find((e) => e.perm === p)!
            const hasOverride = p in overrides
            return (
              <div key={p} className={`grid grid-cols-[1fr_60px_50px_50px] md:grid-cols-[1fr_80px_60px_60px] border-b border-white/[0.04] last:border-b-0 transition-colors ${hasOverride ? 'bg-acid/[0.03]' : ''}`}>
                <div className="px-2 md:px-3 py-2 text-[9px] md:text-[10px] font-mono text-white/60 flex items-center gap-1.5">
                  {permLabels[p]}
                  {hasOverride && <span className="text-[5px] md:text-[6px] text-acid/50 tracking-wider hidden sm:inline">
                    {overrides[p] === 'deny' ? 'DENY' : 'ALLOW'}
                  </span>}
                </div>
                <div className="px-1.5 md:px-2 py-2 flex items-center justify-center">
                  <span className={`text-[8px] md:text-[9px] font-mono ${scenario.basePermissions[role][p] ? 'text-white/40' : 'text-white/15'}`}>
                    {scenario.basePermissions[role][p] ? '✓' : '—'}
                  </span>
                </div>
                <div className="px-1.5 md:px-2 py-2 flex items-center justify-center">
                  <button onClick={() => toggleOverride(p)}
                    className={`text-[6px] md:text-[7px] font-mono px-1 py-0.5 rounded border transition-all cursor-pointer min-h-[20px] ${
                      hasOverride
                        ? overrides[p] === 'deny' ? 'border-red-500/30 text-red-400/70 bg-red-500/10' : 'border-acid/30 text-acid/70 bg-acid/10'
                        : 'border-white/[0.06] text-white/20 hover:text-white/40 bg-transparent'
                    }`}>
                    {hasOverride ? (overrides[p] === 'deny' ? 'DENY' : 'ALLOW') : '—'}
                  </button>
                </div>
                <div className="px-1.5 md:px-2 py-2 flex items-center justify-center">
                  <span className={`text-[8px] md:text-[9px] font-mono font-medium ${ep.allowed ? 'text-acid' : 'text-white/20'}`}>
                    {ep.allowed ? '✓' : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Test */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-[7px] font-mono text-white/25 uppercase">TEST:</span>
          <select value={testAction} onChange={(e) => setTestAction(e.target.value as Perm)}
            className="text-[8px] md:text-[9px] font-mono bg-transparent border border-white/10 rounded-lg px-2 py-1 text-white/60 appearance-none cursor-pointer outline-none min-h-[28px]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 0l3 4 3-4z' fill='%23ffffff40'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '14px' }}>
            {testActions.map((a) => <option key={a} value={a} className="bg-ink text-bone">{permLabels[a]}</option>)}
          </select>
          <button onClick={simulateAccess} disabled={simulating} data-cursor="RUN"
            className="text-[7px] md:text-[8px] font-mono tracking-[0.12em] uppercase border border-acid/30 text-acid bg-acid/10 rounded-lg px-3 py-1.5 hover:bg-acid/20 transition-all cursor-pointer disabled:opacity-40 min-h-[28px]">
            {simulating ? 'TESTING...' : 'TEST ACCESS'}
          </button>
        </div>

        {/* Simulation result */}
        {(simulating || simResult) && (
          <div className="mt-3 border border-white/[0.06] rounded-xl p-3 bg-white/[0.015]">
            <div className="flex flex-wrap gap-2 items-center">
              {simSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-1.5 animate-[fadeIn_0.2s_ease]">
                  <span className={`text-[8px] md:text-[9px] font-mono px-2 py-0.5 rounded border ${
                    step === 'RESOURCE' && simResult
                      ? simResult.granted ? 'border-acid/40 text-acid bg-acid/10' : 'border-red-500/30 text-red-400 bg-red-500/10'
                      : 'border-white/10 text-white/50'
                  }`}>{step}</span>
                  {i < simSteps.length - 1 && <span className="text-white/15 text-xs">→</span>}
                </div>
              ))}
            </div>
            {simResult && (
              <div className="mt-3 animate-[fadeIn_0.2s_ease]">
                <div className={`inline-flex items-center gap-2 text-[9px] md:text-[10px] font-mono px-3 py-2 rounded-lg border ${
                  simResult.granted ? 'border-acid/40 text-acid bg-acid/10' : 'border-red-500/30 text-red-400 bg-red-500/10'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {simResult.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </div>
                <div className="mt-2 text-[7px] md:text-[8px] font-mono text-white/30 space-y-0.5">
                  <div>User: <span className="text-white/50">{simResult.user}</span></div>
                  <div>Role: <span className="text-white/50">{roleLabels[simResult.role]}</span></div>
                  <div>Permission: <span className="text-white/50">{permLabels[simResult.permission]}</span></div>
                  <div>Source: <span className={simResult.source === 'override' ? 'text-yellow-400/60' : 'text-white/50'}>{simResult.source === 'override' ? 'User Override' : 'Role Permission'}</span></div>
                  <div className="text-white/20 mt-1">{simResult.reason}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback toast */}
        {feedback && (
          <div className="mt-2 text-[7px] font-mono text-acid/60 animate-[fadeIn_0.2s_ease]">{feedback}</div>
        )}
      </div>

      {/* Audit log + Inspector */}
      <div className="space-y-3">
        <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
          <div className="text-[6px] md:text-[7px] font-mono tracking-[0.15em] uppercase text-white/30 mb-2">SELECTION</div>
          <div className="text-[8px] md:text-[9px] font-mono text-white/50 mb-1">{roleUser?.name || '—'}</div>
          <div className="text-[7px] md:text-[8px] font-mono text-acid/60 mb-2">ROLE: {roleLabels[role]}</div>
          <div className="text-[6px] md:text-[7px] font-mono text-white/25 mb-1">EFFECTIVE PERMISSIONS</div>
          <div className="text-[8px] md:text-[9px] font-mono text-white/50">{effectiveCount} / {perms.length} allowed</div>
          <div className="mt-2 text-[6px] md:text-[7px] font-mono text-white/20 leading-relaxed">
            Role and individual overrides determine access. Click the override buttons to change behavior.
          </div>
        </div>

        <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
          <div className="text-[6px] md:text-[7px] font-mono tracking-[0.15em] uppercase text-white/30 mb-2">AUDIT LOG</div>
          <div className="space-y-1">
            {auditLog.map((entry, i) => (
              <div key={i} className="text-[8px] md:text-[9px] font-mono text-white/40 leading-relaxed" dangerouslySetInnerHTML={{ __html: entry }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
