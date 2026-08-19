import { useState } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import { useInView } from '../hooks/useInView'
import { needOptions, userOptions, priorityOptions, generateSystemDirection, type Need, type Users, type Priority } from '../data/systemDesignerRules'

export default function SystemDesigner() {
  const { setSystemDesignerResult, setActiveLabTab, setClientModeOpen } = usePortfolio()
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.1 })
  const [need, setNeed] = useState<Need | null>(null)
  const [users, setUsers] = useState<Users | null>(null)
  const [priority, setPriority] = useState<Priority | null>(null)
  const [result, setResult] = useState<ReturnType<typeof generateSystemDirection> | null>(null)

  const canGenerate = need !== null || users !== null || priority !== null

  const generate = () => {
    const r = generateSystemDirection(need, users, priority)
    setResult(r)
    setSystemDesignerResult({ need, users, priority })
  }

  const reset = () => {
    setNeed(null)
    setUsers(null)
    setPriority(null)
    setResult(null)
    setSystemDesignerResult(null)
  }

  const goToDemo = (lab: string) => {
    setActiveLabTab(lab)
    setTimeout(() => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <section ref={sectionRef} className="bg-bone text-light-text py-[80px] md:py-[120px] px-6 md:px-14">
      <div className="max-w-[1600px] mx-auto">
        {/* Label */}
        <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-light-text-dim transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>05 / System Designer</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        <h2 className={`mt-10 md:mt-14 text-[clamp(32px,5vw,72px)] leading-[0.88] tracking-[-0.06em] font-medium m-0 transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          WHAT WOULD<br />
          <span className="text-dark-accent">YOU BUILD?</span>
        </h2>

        {!result ? (
          <div className="mt-10 md:mt-14 space-y-8 md:space-y-10">
            {/* Step 1: Need */}
            <div className={`transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              <div className="text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase text-light-text-dim mb-3 md:mb-4">
                I NEED TO...
              </div>
              <div className="flex flex-wrap gap-2">
                {needOptions.map((opt) => (
                  <button key={opt.id} onClick={() => setNeed(opt.id)}
                    className={`flex items-center gap-2 text-[9px] md:text-[10px] font-mono px-3 md:px-4 py-2 md:py-2.5 rounded-xl border transition-all cursor-pointer min-h-[36px] ${
                      need === opt.id
                        ? 'border-dark-accent text-dark-accent bg-dark-accent/10'
                        : 'border-light-border text-light-text/50 hover:border-light-border/80 hover:text-light-text/70 bg-transparent'
                    }`}>
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Users */}
            <div className={`transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              <div className="text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase text-light-text-dim mb-3 md:mb-4">
                WHO USES IT?
              </div>
              <div className="flex flex-wrap gap-2">
                {userOptions.map((opt) => (
                  <button key={opt.id} onClick={() => setUsers(opt.id)}
                    className={`text-[9px] md:text-[10px] font-mono px-3 md:px-4 py-2 md:py-2.5 rounded-xl border transition-all cursor-pointer min-h-[36px] ${
                      users === opt.id
                        ? 'border-dark-accent text-dark-accent bg-dark-accent/10'
                        : 'border-light-border text-light-text/50 hover:border-light-border/80 hover:text-light-text/70 bg-transparent'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Priority */}
            <div className={`transition-all duration-700 delay-[400ms] ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              <div className="text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase text-light-text-dim mb-3 md:mb-4">
                WHAT MATTERS MOST?
              </div>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((opt) => (
                  <button key={opt.id} onClick={() => setPriority(opt.id)}
                    className={`text-[9px] md:text-[10px] font-mono px-3 md:px-4 py-2 md:py-2.5 rounded-xl border transition-all cursor-pointer min-h-[36px] ${
                      priority === opt.id
                        ? 'border-dark-accent text-dark-accent bg-dark-accent/10'
                        : 'border-light-border text-light-text/50 hover:border-light-border/80 hover:text-light-text/70 bg-transparent'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <div className="flex gap-3 items-center pt-4">
              <button onClick={generate} disabled={!canGenerate}
                className="text-[9px] md:text-[10px] font-mono tracking-[0.12em] uppercase border border-dark-accent/50 text-dark-accent bg-dark-accent/10 rounded-full px-5 md:px-6 py-2.5 md:py-3 hover:bg-dark-accent/20 transition-all cursor-pointer disabled:opacity-40 min-h-[40px]">
                GENERATE DIRECTION →
              </button>
              {canGenerate && (
                <button onClick={reset}
                  className="text-[8px] md:text-[9px] font-mono text-light-text/30 hover:text-light-text/50 transition-colors cursor-pointer min-h-[36px]">
                  RESET
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result */
          <div className="mt-10 md:mt-14 animate-[fadeIn_0.4s_ease]">
            <div className="text-[9px] md:text-[10px] font-mono tracking-[0.18em] uppercase text-dark-accent/70 mb-3">
              YOUR POSSIBLE DIRECTION
            </div>
            <h3 className="text-[clamp(28px,4vw,56px)] leading-[0.9] tracking-[-0.05em] font-medium mb-3 md:mb-4">
              {result.title}
            </h3>
            <p className="text-light-text/60 leading-relaxed mb-4 md:mb-6 max-w-[520px] text-sm md:text-base">{result.desc}</p>

            {/* Capabilities */}
            {result.capabilities && (
              <div className="mb-5 md:mb-6">
                <div className="text-[7px] md:text-[8px] font-mono tracking-[0.15em] uppercase text-light-text-dim mb-2">KEY CAPABILITIES</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.capabilities.map((c) => (
                    <span key={c} className="text-[7px] md:text-[8px] font-mono px-2 py-1 rounded border border-dark-accent/20 text-dark-accent/60 bg-dark-accent/5">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Flow */}
            <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
              {result.flow.map((node, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] font-mono px-2.5 md:px-3 py-1.5 rounded-lg border border-light-border text-light-text/60 bg-white/50">
                    {node}
                  </span>
                  {i < result.flow.length - 1 && <span className="text-light-text/20">→</span>}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => goToDemo(result.relatedLab)}
                className="text-[9px] md:text-[10px] font-mono tracking-[0.12em] uppercase border border-dark-accent/40 text-dark-accent bg-dark-accent/10 rounded-full px-4 md:px-5 py-2.5 hover:bg-dark-accent/20 transition-all cursor-pointer min-h-[40px]">
                {result.relatedLabel} →
              </button>
              <button onClick={() => { setClientModeOpen(true) }}
                className="text-[9px] md:text-[10px] font-mono tracking-[0.12em] uppercase border border-light-border text-light-text/50 rounded-full px-4 md:px-5 py-2.5 hover:border-light-border/80 transition-all cursor-pointer min-h-[40px]">
                TURN THIS INTO A BRIEF →
              </button>
              <button onClick={reset}
                className="text-[8px] md:text-[9px] font-mono text-light-text/30 hover:text-light-text/50 transition-colors cursor-pointer min-h-[36px]">
                START OVER
              </button>
            </div>

            <p className="mt-4 md:mt-6 text-[8px] md:text-[9px] font-mono text-light-text/25 leading-relaxed">
              This is a conversation starter — not a technical specification.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
