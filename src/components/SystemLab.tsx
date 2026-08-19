import { useEffect } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import { useInView } from '../hooks/useInView'
import PermissionLab from './lab/PermissionLab'
import WorkflowPlayground from './lab/WorkflowPlayground'
import OperationsConsole from './lab/OperationsConsole'
import ProcessDesigner from './lab/ProcessDesigner'
import ArchitectureExplorer from './lab/ArchitectureExplorer'

const tabs = [
  { id: 'permission', label: 'PERMISSIONS', key: '1', context: 'EFFECTIVE ACCESS' },
  { id: 'workflow', label: 'WORKFLOW', key: '2', context: 'EXECUTION MODEL' },
  { id: 'dashboard', label: 'DASHBOARD', key: '3', context: 'FICTIONAL DATA' },
  { id: 'process', label: 'PROCESS', key: '4', context: 'RULE EVALUATION' },
  { id: 'architecture', label: 'ARCHITECTURE', key: '5', context: 'REQUEST FLOW' },
]

const descriptions: Record<string, string> = {
  permission: 'Choose a person and test an action. Override individual permissions and see how effective access changes.',
  workflow: 'Configure the flow, then run a test payload. Change the amount to see different execution paths.',
  dashboard: 'Choose a metric to inspect its breakdown. Switch period and location to see coherent data changes.',
  process: 'Change the rule, then test a request. Reorder, enable, or disable steps to alter the process flow.',
  architecture: 'Select a node to inspect its relationships. Simulate different request scenarios and inject failures.',
}

export default function SystemLab() {
  const { activeLabTab, setActiveLabTab, markLabVisited, setCommandPaletteOpen } = usePortfolio()
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.08 })

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }
      const tab = tabs.find((t) => t.key === e.key)
      if (tab) {
        setActiveLabTab(tab.id)
        markLabVisited(tab.id)
        document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setActiveLabTab, markLabVisited, setCommandPaletteOpen])

  useEffect(() => { markLabVisited(activeLabTab) }, [activeLabTab, markLabVisited])

  const activeTab = tabs.find((t) => t.id === activeLabTab)

  return (
    <section ref={sectionRef} className="bg-ink text-bone py-[80px] md:py-[120px] px-6 md:px-14" id="lab">
      <div className="max-w-[1600px] mx-auto">
        <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-white/40 transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>03 / System Lab</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        <div className={`mt-10 md:mt-14 mb-8 md:mb-10 transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <h2 className="text-[clamp(32px,5.5vw,72px)] leading-[0.88] tracking-[-0.06em] font-medium m-0">
            DON'T JUST LOOK.<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.2px rgba(241,239,231,0.7)' }}>TRY IT.</span>
          </h2>
          <p className="mt-3 md:mt-4 text-white/45 max-w-[520px] leading-relaxed text-base">
            {descriptions[activeLabTab] || 'Explore how different system behaviors respond to changes.'}
          </p>
        </div>

        {/* Window chrome */}
        <div className={`border border-white/[0.12] rounded-xl md:rounded-2xl overflow-hidden bg-[#0c0f0e]/80 transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-[7px] md:text-[8px] font-mono tracking-[0.15em] text-white/25 ml-2 uppercase hidden sm:inline">
                SYSTEM LAB — {activeTab?.context || 'INTERACTIVE'}
              </span>
              <span className="text-[7px] font-mono tracking-[0.15em] text-white/25 ml-2 uppercase sm:hidden">
                SYSTEM LAB
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-[6px] md:text-[7px] font-mono text-white/20">
              <button onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-1 border border-white/[0.06] rounded px-1.5 py-0.5 hover:text-white/40 transition-colors cursor-pointer">
                <span>⌘K</span>
              </button>
              <span className="hidden md:inline">ESC RESET</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-scroll flex border-b border-white/[0.06] bg-white/[0.01]">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveLabTab(t.id)}
                data-cursor="OPEN"
                className={`relative text-[7px] md:text-[8px] font-mono tracking-[0.12em] uppercase px-2.5 md:px-4 py-2.5 transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                  activeLabTab === t.id
                    ? 'border-acid text-acid bg-acid/[0.04]'
                    : 'border-transparent text-white/35 hover:text-white/55 hover:bg-white/[0.02]'
                }`}>
                <span className="hidden md:inline text-white/15 mr-1">{t.key}/</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Demo content */}
          <div className="p-3 md:p-6 min-h-[400px] md:min-h-[480px]">
            {activeLabTab === 'permission' && <PermissionLab />}
            {activeLabTab === 'workflow' && <WorkflowPlayground />}
            {activeLabTab === 'dashboard' && <OperationsConsole />}
            {activeLabTab === 'process' && <ProcessDesigner />}
            {activeLabTab === 'architecture' && <ArchitectureExplorer />}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-mono text-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-acid/60" />
              READY
            </div>
            <span className="text-[6px] md:text-[7px] font-mono text-white/15 uppercase">
              {activeTab?.label} / {activeTab?.context}
            </span>
          </div>
        </div>

        <p className={`mt-3 text-[9px] md:text-[10px] font-mono tracking-[0.12em] text-white/20 uppercase transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100' : 'opacity-0'}`}>
          Client-side simulations with fictional data. All interactions run in the browser.
        </p>
      </div>
    </section>
  )
}
