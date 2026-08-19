import { useState, useEffect } from 'react'
import { usePortfolio } from '../context/PortfolioContext'

const links = [
  { id: 'work', label: 'WORK', num: '02' },
  { id: 'lab', label: 'LAB', num: '03' },
  { id: 'build', label: 'BUILD', num: '04' },
  { id: 'about', label: 'ABOUT', num: '06' },
  { id: 'contact', label: 'CONTACT', num: '07' },
]

const labLabels: Record<string, string> = {
  permission: 'PERMISSIONS',
  workflow: 'WORKFLOW',
  dashboard: 'DASHBOARD',
  process: 'PROCESS',
  architecture: 'ARCHITECTURE',
}

export default function Navigation() {
  const { activeLabTab, setCommandPaletteOpen } = usePortfolio()
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const ids = links.map((l) => l.id)
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { threshold: 0.2, rootMargin: '-60px 0px -50% 0px' }
    )
    sections.forEach((s) => s && obs.observe(s))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setCommandPaletteOpen])

  const activeNum = links.find((l) => l.id === active)?.num || ''
  const isLab = active === 'lab'

  return (
    <>
      {/* Desktop header */}
      <header className={`hidden md:flex fixed top-3 left-3 right-3 lg:left-5 lg:right-5 z-50 items-center justify-between h-11 px-3 md:px-4 border border-white/[0.08] rounded-full bg-black/50 backdrop-blur-xl transition-all ${scrolled ? 'border-white/[0.12]' : ''}`}>
        <a href="#top" className="w-7 h-7 border border-white/15 rounded-full grid place-items-center text-[8px] font-mono tracking-[0.15em] text-white/60 hover:text-white hover:border-white/30 transition-colors">
          J/G
        </a>

        <nav className="flex items-center gap-5">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} data-cursor="OPEN"
              className={`text-[8px] font-mono tracking-[0.15em] uppercase transition-colors relative ${
                active === l.id ? 'text-white' : 'text-white/35 hover:text-white/60'
              }`}>
              {isLab && l.id === 'lab' ? `LAB / ${labLabels[activeLabTab] || 'WORK'}` : l.label}
              {active === l.id && <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-acid rounded-full" />}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {activeNum && (
            <span className="text-[7px] font-mono text-white/20">
              {activeNum} / 07
            </span>
          )}
          <button onClick={() => setCommandPaletteOpen(true)}
            data-cursor="OPEN"
            className="text-[7px] font-mono text-white/20 hover:text-white/40 border border-white/[0.06] rounded-full px-2 py-1 transition-colors cursor-pointer">
            ⌘K
          </button>
          <a href="mailto:j.ginrou07@gmail.com" data-cursor="MAIL"
            className="text-[8px] font-mono tracking-[0.14em] uppercase border border-white/[0.1] rounded-full px-3.5 py-1.5 hover:border-white/20 hover:bg-white/[0.03] transition-all">
            LET'S TALK ↗
          </a>
        </div>
      </header>

      {/* Mobile top bar */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-4 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl transition-all ${scrolled ? 'border-white/[0.12]' : ''}`}>
        <a href="#top" className="w-8 h-8 border border-white/15 rounded-full grid place-items-center text-[9px] font-mono tracking-[0.15em] text-white/60">
          J/G
        </a>
        <div className="flex items-center gap-2">
          <a href="#work" className="text-[8px] font-mono tracking-[0.12em] uppercase text-white/40 px-2 py-1.5">WORK</a>
          <a href="#lab" className="text-[8px] font-mono tracking-[0.12em] uppercase text-white/40 px-2 py-1.5">LAB</a>
          <a href="#contact" className="text-[8px] font-mono tracking-[0.12em] uppercase border border-white/15 rounded-full px-3 py-1.5 text-white/60">TALK ↗</a>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-14 px-2 border-t border-white/[0.1] bg-black/70 backdrop-blur-xl safe-area-pb">
        {links.slice(0, 4).map((l) => (
          <a key={l.id} href={`#${l.id}`}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
              active === l.id ? 'text-acid' : 'text-white/30'
            }`}>
            <span className="text-[7px] font-mono tracking-[0.1em] uppercase">{l.label}</span>
            {active === l.id && <span className="w-4 h-[1.5px] bg-acid rounded-full" />}
          </a>
        ))}
        <a href="#contact"
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-white/30">
          <span className="text-[7px] font-mono tracking-[0.1em] uppercase">TALK</span>
        </a>
      </nav>
    </>
  )
}
