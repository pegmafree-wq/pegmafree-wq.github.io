import { useState } from 'react'
import { useInView } from '../hooks/useInView'

type Mode = 'build' | 'connect'

const buildBest = [
  'Workflow is unique to your organization',
  'Multiple roles need different access',
  'Existing tools don\'t fit the process',
  'Operations need centralization',
]

const connectBest = [
  'Existing tools already work well',
  'Information is fragmented across apps',
  'Manual handoffs are the main problem',
  'Automation can remove repetition',
]

export default function Automation() {
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.1 })
  const [mode, setMode] = useState<Mode>('connect')

  return (
    <section ref={sectionRef} className="bg-ink text-bone py-[80px] md:py-[120px] px-6 md:px-14">
      <div className="max-w-[1600px] mx-auto">
        {/* Label */}
        <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-white/40 transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>05 / Build vs Connect</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        <div className="mt-12 md:mt-16">
          <h2 className={`text-[clamp(32px,5vw,72px)] leading-[0.88] tracking-[-0.06em] font-medium m-0 transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            BUILD NEW?<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.2px rgba(241,239,231,0.5)' }}>OR CONNECT WHAT EXISTS?</span>
          </h2>
        </div>

        {/* Toggle */}
        <div className={`mt-8 md:mt-12 flex transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <div className="inline-flex border border-white/[0.1] rounded-full p-1 bg-white/[0.02]">
            <button onClick={() => setMode('build')}
              className={`text-[9px] md:text-[10px] font-mono tracking-[0.12em] uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all cursor-pointer min-h-[36px] ${
                mode === 'build' ? 'bg-acid text-ink' : 'text-white/40 hover:text-white/60'
              }`}>
              BUILD
            </button>
            <button onClick={() => setMode('connect')}
              className={`text-[9px] md:text-[10px] font-mono tracking-[0.12em] uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all cursor-pointer min-h-[36px] ${
                mode === 'connect' ? 'bg-acid text-ink' : 'text-white/40 hover:text-white/60'
              }`}>
              CONNECT
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Best when */}
          <div className={`transition-all duration-500 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase text-acid/60 mb-4 md:mb-6">
              BEST WHEN
            </div>
            <ul className="space-y-3 md:space-y-4 list-none p-0 m-0">
              {(mode === 'build' ? buildBest : connectBest).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/60 text-sm md:text-base leading-relaxed">
                  <span className="text-acid mt-1 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Diagram */}
          <div className={`border border-white/[0.08] rounded-2xl p-5 md:p-6 bg-white/[0.02] transition-all duration-500 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            style={{ transitionDelay: '200ms' }}>
            <div className="text-[7px] md:text-[8px] font-mono tracking-[0.15em] uppercase text-white/25 mb-4">
              {mode === 'build' ? 'CUSTOM SYSTEM' : 'INTEGRATION LAYER'}
            </div>
            {mode === 'build' ? (
              <div className="space-y-3">
                {['INPUT', 'VALIDATION', 'PROCESSING', 'APPROVAL', 'REPORTING'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex-1 border rounded-lg px-3 py-2.5 text-[9px] md:text-[10px] font-mono text-center transition-all ${
                      i === 0 ? 'border-acid/30 text-acid bg-acid/10' : 'border-white/10 text-white/40'
                    }`}>
                      {step}
                    </div>
                    {i < 4 && <span className="text-white/15 text-xs">↓</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {['FORM', 'AUTOMATION', 'STRUCTURED DATA', 'ALERTS', 'DASHBOARD'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex-1 border rounded-lg px-3 py-2.5 text-[9px] md:text-[10px] font-mono text-center transition-all ${
                      i === 1 ? 'border-acid/30 text-acid bg-acid/10' : 'border-white/10 text-white/40'
                    }`}>
                      {step}
                    </div>
                    {i < 4 && <span className="text-white/15 text-xs">↓</span>}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[8px] md:text-[9px] font-mono text-white/25 leading-relaxed">
              {mode === 'build'
                ? 'A custom system built around your specific workflow and roles.'
                : 'Connect existing tools so information flows automatically.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
