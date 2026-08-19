import { useState, useEffect } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'

const steps = [
  {
    question: "WHAT'S FRUSTRATING RIGHT NOW?",
    options: [
      'Too much manual work',
      'Too many spreadsheets',
      "Tools don't communicate",
      "Hard to track what's happening",
      'Reporting takes too long',
      'Approvals are messy',
      "Existing software doesn't fit",
      'Need something custom',
    ],
  },
  {
    question: 'WHAT WOULD A BETTER VERSION FEEL LIKE?',
    options: [
      'Save time',
      'Fewer mistakes',
      'Clearer visibility',
      'Centralized operations',
      'Faster approvals',
      'Less repetitive work',
      'Better reporting',
      'Better access control',
    ],
  },
  {
    question: "WHAT'S ALREADY IN THE WORKFLOW?",
    optional: true,
    options: [
      'Google Sheets',
      'Excel',
      'Email',
      'Google Forms',
      'Existing website',
      'Existing software',
      'Manual encoding',
      'Files / PDFs',
      'Messaging apps',
    ],
  },
]

interface Blueprint {
  title: string
  desc: string
  current: string[]
  possible: string[]
}

function generateBlueprint(pain: string | null, goal: string | null, _tools: string[]): Blueprint {
  const isManual = pain?.includes('manual') || pain?.includes('spreadsheet')
  const isDisconnected = pain?.includes("don't communicate") || pain?.includes('track')
  const isReporting = pain?.includes('Reporting')
  const isApprovals = pain?.includes('messy')

  if (isManual || goal?.includes('time') || goal?.includes('repetitive')) {
    return {
      title: 'AUTOMATION + INTERNAL TOOL',
      desc: 'Automate repetitive handoffs first, then centralize the information that people need to monitor.',
      current: ['FORM', 'MANUAL ENCODING', 'SHEET', 'MESSAGE', 'REPORT'],
      possible: ['FORM', 'AUTOMATION', 'STRUCTURED DATA', 'ALERTS', 'DASHBOARD'],
    }
  }
  if (isDisconnected || goal?.includes('Centralized') || goal?.includes('visibility')) {
    return {
      title: 'CUSTOM INTERNAL TOOL',
      desc: 'Centralize the workflow into a focused application instead of maintaining multiple spreadsheets and handoffs.',
      current: ['APP A', 'SHEET', 'EMAIL', 'APP B', 'MANUAL SYNC'],
      possible: ['INPUT', 'PROCESSING', 'CENTRAL DATABASE', 'VIEWS', 'REPORTS'],
    }
  }
  if (isReporting || goal?.includes('reporting')) {
    return {
      title: 'OPERATIONAL DASHBOARD',
      desc: 'Turn scattered data into structured views that make decisions faster. Connect sources, define metrics, surface what matters.',
      current: ['DATA SOURCE 1', 'DATA SOURCE 2', 'MANUAL REPORT', 'EMAIL', 'SPREADSHEET'],
      possible: ['DATA SOURCES', 'PROCESSING', 'METRICS', 'DASHBOARD', 'ALERTS'],
    }
  }
  if (isApprovals || goal?.includes('approval')) {
    return {
      title: 'WORKFLOW + APPROVAL SYSTEM',
      desc: 'Replace messy approval chains with a structured process that routes requests automatically and tracks status.',
      current: ['REQUEST', 'EMAIL', 'WAIT', 'FOLLOW UP', 'APPROVE'],
      possible: ['REQUEST', 'VALIDATION', 'AUTO-ROUTE', 'APPROVAL', 'COMPLETE'],
    }
  }
  return {
    title: 'INTEGRATED WORKFLOW',
    desc: 'Map the current process, identify bottlenecks, and build a system that connects steps automatically.',
    current: ['TRIGGER', 'MANUAL STEP', 'SHEET', 'MESSAGE', 'REPORT'],
    possible: ['TRIGGER', 'VALIDATION', 'PROCESSING', 'NOTIFICATION', 'ARCHIVE'],
  }
}

export default function ClientMode() {
  const { clientModeOpen, setClientModeOpen, clientBrief, setClientBrief, showFeedback } = usePortfolio()
  const [step, setStep] = useState(0)
  const [pain, setPain] = useState<string | null>(clientBrief.pain)
  const [goal, setGoal] = useState<string | null>(clientBrief.goal)
  const [tools, setTools] = useState<string[]>(clientBrief.tools)
  const [showBlueprint, setShowBlueprint] = useState(false)

  useEffect(() => {
    if (clientModeOpen) {
      setStep(0)
      setPain(clientBrief.pain)
      setGoal(clientBrief.goal)
      setTools(clientBrief.tools)
      setShowBlueprint(false)
    }
  }, [clientModeOpen])

  useEffect(() => {
    if (!clientModeOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setClientModeOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [clientModeOpen, setClientModeOpen])

  if (!clientModeOpen) return null

  const s = steps[step]
  const blueprint = generateBlueprint(pain, goal, tools)

  const selectOption = (opt: string) => {
    if (step === 0) { setPain(opt); next() }
    else if (step === 1) { setGoal(opt); next() }
    else if (step === 2) {
      setTools((t) => t.includes(opt) ? t.filter((x) => x !== opt) : [...t, opt])
    }
  }

  const next = () => {
    if (step < 2) setStep(step + 1)
    else {
      setClientBrief({ pain, goal, tools })
      setShowBlueprint(true)
    }
  }

  const sendBrief = () => {
    const subject = encodeURIComponent(`Project Inquiry — ${blueprint.title}`)
    const body = encodeURIComponent(
      `Hi,\n\nI came across your portfolio and used the project brief tool.\n\nCurrent challenge: ${pain}\n\nGoal: ${goal}\n\nCurrent tools: ${tools.length > 0 ? tools.join(', ') : 'Not specified'}\n\nPossible direction: ${blueprint.title}\n\nA little more context:\n\nI'd like to discuss what might make sense.`
    )
    window.open(`mailto:j.ginrou07@gmail.com?subject=${subject}&body=${body}`, '_blank')
    showFeedback('READY WHEN YOU ARE.')
    setClientModeOpen(false)
  }

  const copyBrief = async () => {
    const text = `Project Inquiry — ${blueprint.title}\n\nChallenge: ${pain}\nGoal: ${goal}\nTools: ${tools.join(', ') || 'N/A'}\nDirection: ${blueprint.title}\n\n${blueprint.desc}`
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    showFeedback('BRIEF COPIED.')
  }

  return (
    <div className="fixed inset-0 z-[200] bg-ink/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6" role="dialog" aria-modal="true" aria-label="Client intake">
      <div className="w-full max-w-[680px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <div className="text-[7px] md:text-[8px] font-mono tracking-[0.18em] uppercase text-white/30 mb-1">
              SYSTEM BLUEPRINT
            </div>
            <div className="text-[8px] md:text-[9px] font-mono tracking-[0.12em] text-white/20">
              STEP {showBlueprint ? '✓' : `${step + 1}`} / 3
            </div>
          </div>
          <button onClick={() => setClientModeOpen(false)}
            className="text-[8px] md:text-[9px] font-mono tracking-[0.12em] text-white/30 hover:text-white/60 transition-colors cursor-pointer min-h-[36px] px-2">
            ESC CLOSE
          </button>
        </div>

        {/* Progress */}
        {!showBlueprint && (
          <div className="flex gap-1 mb-6 md:mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-[2px] flex-1 rounded-full transition-colors ${i <= step ? 'bg-acid' : 'bg-white/10'}`} />
            ))}
          </div>
        )}

        {!showBlueprint ? (
          <>
            {/* Question */}
            <h2 className="text-[clamp(24px,4vw,44px)] leading-[0.95] tracking-[-0.04em] font-medium mb-6 md:mb-8">
              {s.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2 mb-5 md:mb-6">
              {s.options.map((opt) => {
                const selected = step === 0 ? pain === opt : step === 1 ? goal === opt : tools.includes(opt)
                return (
                  <button key={opt} onClick={() => selectOption(opt)} data-cursor="START"
                    className={`text-left text-[10px] md:text-[11px] font-mono px-3 md:px-4 py-3 md:py-3.5 rounded-xl border transition-all cursor-pointer min-h-[40px] ${
                      selected ? 'border-acid/50 text-acid bg-acid/10' : 'border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70 bg-white/[0.02]'
                    }`}>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Nav */}
            <div className="flex justify-between items-center min-h-[40px]">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)}
                  className="text-[8px] md:text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors cursor-pointer min-h-[36px]">
                  ← BACK
                </button>
              )}
              {step === 2 && (
                <button onClick={() => { setClientBrief({ pain, goal, tools }); setShowBlueprint(true) }}
                  className="text-[8px] md:text-[9px] font-mono tracking-[0.12em] uppercase border border-acid/40 text-acid bg-acid/10 rounded-full px-4 md:px-5 py-2.5 hover:bg-acid/20 transition-all cursor-pointer ml-auto min-h-[40px]">
                  GENERATE BLUEPRINT →
                </button>
              )}
            </div>
          </>
        ) : (
          /* Blueprint */
          <div className="animate-[fadeIn_0.4s_ease]">
            <div className="text-[8px] md:text-[9px] font-mono tracking-[0.18em] uppercase text-acid/70 mb-3">
              YOUR POSSIBLE DIRECTION
            </div>
            <h2 className="text-[clamp(28px,5vw,56px)] leading-[0.9] tracking-[-0.05em] font-medium mb-3 md:mb-4">
              {blueprint.title}
            </h2>
            <p className="text-white/50 leading-relaxed mb-6 md:mb-8 max-w-[520px] text-sm">{blueprint.desc}</p>

            {/* Current vs Possible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
              <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                <div className="text-[7px] md:text-[8px] font-mono tracking-[0.15em] uppercase text-white/25 mb-3">CURRENT</div>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.current.map((node, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[8px] md:text-[9px] font-mono px-2 py-1 rounded border border-white/10 text-white/40 bg-white/[0.02]">
                        {node}
                      </span>
                      {i < blueprint.current.length - 1 && <span className="text-white/15 text-xs">→</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-acid/20 rounded-xl p-4 bg-acid/[0.03]">
                <div className="text-[7px] md:text-[8px] font-mono tracking-[0.15em] uppercase text-acid/50 mb-3">POSSIBLE</div>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.possible.map((node, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[8px] md:text-[9px] font-mono px-2 py-1 rounded border border-acid/20 text-acid/70 bg-acid/5">
                        {node}
                      </span>
                      {i < blueprint.possible.length - 1 && <span className="text-acid/30 text-xs">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border border-white/[0.08] rounded-xl p-4 md:p-5 bg-white/[0.02] mb-6 md:mb-8 text-[10px] md:text-[11px] font-mono text-white/40 leading-relaxed">
              <div className="text-white/25 mb-2">YOUR BRIEF</div>
              <div>Challenge: <span className="text-white/60">{pain}</span></div>
              <div>Goal: <span className="text-white/60">{goal}</span></div>
              {tools.length > 0 && <div>Tools: <span className="text-white/60">{tools.join(', ')}</span></div>}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={sendBrief} data-cursor="MAIL"
                className="text-[8px] md:text-[9px] font-mono tracking-[0.14em] uppercase border border-acid/40 text-acid bg-acid/10 rounded-full px-4 md:px-5 py-2.5 hover:bg-acid/20 transition-all cursor-pointer min-h-[40px]">
                EMAIL BRIEF →
              </button>
              <button onClick={copyBrief} data-cursor="COPY"
                className="text-[8px] md:text-[9px] font-mono tracking-[0.14em] uppercase border border-white/15 text-white/50 bg-transparent rounded-full px-4 md:px-5 py-2.5 hover:border-white/25 transition-all cursor-pointer min-h-[40px]">
                COPY BRIEF
              </button>
              <button onClick={() => { setPain(null); setGoal(null); setTools([]); setStep(0); setShowBlueprint(false) }}
                className="text-[8px] md:text-[9px] font-mono text-white/25 hover:text-white/50 transition-colors cursor-pointer min-h-[36px]">
                START OVER
              </button>
            </div>

            <p className="mt-4 md:mt-6 text-[8px] md:text-[9px] font-mono text-white/20 leading-relaxed">
              This is a conversation starter — not a technical specification.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
