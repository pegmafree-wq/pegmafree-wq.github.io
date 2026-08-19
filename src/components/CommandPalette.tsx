import { useState, useEffect, useRef, useCallback } from 'react'
import { usePortfolio } from '../context/PortfolioContext'

interface Command {
  id: string
  label: string
  category: string
  action: () => void
}

export default function CommandPalette() {
  const {
    commandPaletteOpen, setCommandPaletteOpen,
    setActiveLabTab, setClientModeOpen,
  } = usePortfolio()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const navigateTo = useCallback((id: string) => {
    setCommandPaletteOpen(false)
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [setCommandPaletteOpen])

  const openLab = useCallback((tab: string) => {
    setActiveLabTab(tab)
    setCommandPaletteOpen(false)
    setTimeout(() => {
      document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [setActiveLabTab, setCommandPaletteOpen])

  const commands: Command[] = [
    { id: 'cmd-permissions', label: 'Open Permissions', category: 'LAB', action: () => openLab('permission') },
    { id: 'cmd-workflow', label: 'Open Workflow', category: 'LAB', action: () => openLab('workflow') },
    { id: 'cmd-operations', label: 'Open Operations', category: 'LAB', action: () => openLab('dashboard') },
    { id: 'cmd-process', label: 'Open Process Designer', category: 'LAB', action: () => openLab('process') },
    { id: 'cmd-architecture', label: 'Open Architecture', category: 'LAB', action: () => openLab('architecture') },
    { id: 'cmd-work', label: 'View Private Work', category: 'NAV', action: () => navigateTo('work') },
    { id: 'cmd-build', label: 'What I Build', category: 'NAV', action: () => navigateTo('build') },
    { id: 'cmd-about', label: 'About / Profile', category: 'NAV', action: () => navigateTo('about') },
    { id: 'cmd-brief', label: 'Build a Project Brief', category: 'ACTION', action: () => { setCommandPaletteOpen(false); setClientModeOpen(true) } },
    { id: 'cmd-contact', label: 'Start a Conversation', category: 'NAV', action: () => navigateTo('contact') },
  ]

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (!commandPaletteOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        filtered[selectedIndex].action()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [commandPaletteOpen, setCommandPaletteOpen, filtered, selectedIndex])

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[20vh] px-4"
      onClick={() => setCommandPaletteOpen(false)}>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[520px] border border-white/[0.12] rounded-2xl bg-[#121514]/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <span className="text-white/20 text-sm">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-[13px] font-mono text-white/80 placeholder:text-white/25 outline-none"
          />
          <kbd className="text-[8px] font-mono text-white/20 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-5 py-6 text-center text-[11px] font-mono text-white/25">
              No commands found.
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors cursor-pointer ${
                i === selectedIndex ? 'bg-white/[0.06] text-white' : 'text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <span className="text-[8px] font-mono tracking-[0.12em] uppercase text-white/25 w-12 shrink-0">
                {cmd.category}
              </span>
              <span className="text-[12px] font-mono">{cmd.label}</span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/[0.06] text-[8px] font-mono text-white/20">
          <span>↑↓ NAVIGATE</span>
          <span>↵ SELECT</span>
          <span>ESC CLOSE</span>
        </div>
      </div>
    </div>
  )
}
