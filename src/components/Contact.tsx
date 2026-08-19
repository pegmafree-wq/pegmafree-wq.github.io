import { useState } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import { useInView } from '../hooks/useInView'

export default function Contact() {
  const { clientBrief, setClientModeOpen, visitedLabs, lastFeedback, showFeedback } = usePortfolio()
  const [copied, setCopied] = useState(false)
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.1 })
  const [conversionRef, conversionInView] = useInView<HTMLDivElement>({ threshold: 0.3 })

  const hasBrief = clientBrief.pain !== null
  const visitedArray = [...visitedLabs]

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText('j.ginrou07@gmail.com') } catch {
      const ta = document.createElement('textarea')
      ta.value = 'j.ginrou07@gmail.com'
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true)
    showFeedback('READY WHEN YOU ARE.')
    setTimeout(() => setCopied(false), 2000)
  }

  const emailBrief = () => {
    const subject = encodeURIComponent(`Project Inquiry — ${clientBrief.pain || 'Workflow'}`)
    const body = encodeURIComponent(
      `Hi,\n\nI came across your portfolio and used the project brief tool.\n\nCurrent challenge: ${clientBrief.pain}\nGoal: ${clientBrief.goal}\nCurrent tools: ${clientBrief.tools.length > 0 ? clientBrief.tools.join(', ') : 'Not specified'}\n\nA little more context:\n\nI'd like to discuss what might make sense.`
    )
    window.open(`mailto:j.ginrou07@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  const labLabelMap: Record<string, string> = {
    permission: 'ACCESS CONTROL',
    workflow: 'AUTOMATION',
    dashboard: 'OPERATIONS',
    process: 'PROCESS DESIGN',
    architecture: 'ARCHITECTURE',
  }

  return (
    <>
      {/* Conversion moment */}
      <div ref={conversionRef} className="bg-ink text-bone py-[80px] md:py-[120px] px-6 md:px-14 overflow-hidden">
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className={`text-[clamp(32px,6vw,80px)] leading-[0.88] tracking-[-0.06em] font-medium transition-all duration-700 ${conversionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            YOU'VE SEEN<br />
            HOW I THINK.
          </h2>

          {visitedArray.length > 0 && (
            <div className={`mt-8 md:mt-12 transition-all duration-700 delay-200 ${conversionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-[8px] md:text-[9px] font-mono tracking-[0.15em] uppercase text-white/30 mb-3 md:mb-4">
                YOU EXPLORED
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {visitedArray.map((lab) => (
                  <span key={lab} className="text-[8px] md:text-[9px] font-mono tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border border-acid/20 text-acid/60 bg-acid/5">
                    ✓ {labLabelMap[lab] || lab.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h2 className={`mt-8 md:mt-12 text-[clamp(28px,5vw,64px)] leading-[0.88] tracking-[-0.06em] font-medium transition-all duration-700 delay-300 ${conversionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            NOW SHOW ME<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.2px rgba(201,255,74,0.5)' }}>HOW YOUR WORKFLOW WORKS.</span>
          </h2>
        </div>
      </div>

      {/* Contact */}
      <section ref={sectionRef} className="relative min-h-[80vh] overflow-hidden bg-ink text-bone py-[80px] md:py-[120px] px-6 md:px-14 flex flex-col justify-between" id="contact">
        <div className="orb" />

        {/* Feedback toast */}
        {lastFeedback && (
          <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] text-[9px] md:text-[10px] font-mono tracking-[0.12em] text-acid border border-acid/30 bg-ink/90 backdrop-blur-sm rounded-full px-4 md:px-5 py-2.5 animate-[fadeIn_0.3s_ease]">
            {lastFeedback}
          </div>
        )}

        <div className="relative z-10 max-w-[1600px] mx-auto w-full">
          <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-white/40 transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            <span>07 / Start a conversation</span>
            <span className="w-9 h-px bg-current opacity-30" />
          </div>

          <h2 className={`mt-10 md:mt-14 text-[clamp(36px,7vw,110px)] leading-[0.82] tracking-[-0.07em] font-medium m-0 max-w-[1100px] transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            WHAT'S TAKING{' '}
            <span className="text-transparent" style={{ WebkitTextStroke: '1.2px rgba(241,239,231,0.6)' }}>
              TOO MUCH TIME?
            </span>
          </h2>

          <p className={`mt-4 md:mt-5 text-white/45 max-w-[520px] leading-[1.7] text-sm md:text-base transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Tell me how you currently do it. We can figure out whether it should be automated, connected, simplified, or built.
          </p>

          {/* CTAs */}
          <div className={`mt-8 md:mt-10 flex flex-wrap gap-3 items-center transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            <a href="mailto:j.ginrou07@gmail.com" data-cursor="MAIL"
              className="inline-flex items-center gap-3 border border-white/15 rounded-full px-5 md:px-6 py-3 md:py-3.5 text-xs md:text-sm font-mono hover:border-white/25 hover:bg-white/[0.03] transition-all min-h-[40px]">
              <span>START A CONVERSATION</span>
              <span>↗</span>
            </a>
            <button onClick={copyEmail} data-cursor="COPY"
              className="text-[8px] md:text-[9px] font-mono tracking-[0.14em] uppercase border border-white/12 text-white/45 rounded-full px-4 md:px-5 py-2.5 md:py-3 hover:border-white/20 hover:text-white/65 transition-all cursor-pointer min-h-[40px]">
              {copied ? 'EMAIL COPIED ✓' : 'COPY EMAIL'}
            </button>
            <button onClick={() => setClientModeOpen(true)} data-cursor="BUILD"
              className="text-[8px] md:text-[9px] font-mono tracking-[0.14em] uppercase border border-acid/25 text-acid/70 rounded-full px-4 md:px-5 py-2.5 md:py-3 hover:bg-acid/10 hover:text-acid transition-all cursor-pointer min-h-[40px]">
              {hasBrief ? 'EMAIL YOUR BRIEF →' : 'BUILD A QUICK BRIEF →'}
            </button>
          </div>

          {/* Brief recall */}
          {hasBrief && (
            <div className={`mt-5 border border-white/[0.06] rounded-xl p-4 bg-white/[0.02] max-w-[420px] transition-all duration-500 delay-400 ${sectionInView ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-[7px] md:text-[8px] font-mono tracking-[0.15em] uppercase text-white/25 mb-2">YOUR BRIEF IS READY</div>
              <div className="text-[9px] md:text-[10px] font-mono text-white/40 mb-3">
                {clientBrief.pain} → {clientBrief.goal}
              </div>
              <button onClick={emailBrief} data-cursor="MAIL"
                className="text-[8px] md:text-[9px] font-mono tracking-[0.12em] uppercase border border-acid/30 text-acid bg-acid/10 rounded-full px-3 md:px-4 py-2 hover:bg-acid/20 transition-all cursor-pointer min-h-[32px]">
                EMAIL BRIEF →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="relative z-10 max-w-[1600px] mx-auto w-full mt-12 md:mt-20 pt-5 border-t border-white/[0.08] flex flex-col md:flex-row justify-between text-[7px] md:text-[8px] font-mono tracking-[0.14em] text-white/30 gap-3 pb-20 md:pb-0">
          <span>J. GINROU © 2026</span>
          <span>BUILD / CONNECT / AUTOMATE</span>
          <a href="#top" className="hover:text-white/50 transition-colors">BACK TO TOP ↑</a>
        </footer>
      </section>
    </>
  )
}
