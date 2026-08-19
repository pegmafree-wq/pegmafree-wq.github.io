import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ClientBrief {
  pain: string | null
  goal: string | null
  tools: string[]
}

interface SystemDesignerResult {
  need: string | null
  users: string | null
  priority: string | null
}

interface PortfolioState {
  // Hero
  selectedProblem: string | null
  setSelectedProblem: (v: string | null) => void

  // System Lab
  activeLabTab: string
  setActiveLabTab: (v: string) => void
  visitedLabs: Set<string>
  markLabVisited: (id: string) => void

  // Client Mode
  clientModeOpen: boolean
  setClientModeOpen: (v: boolean) => void
  clientBrief: ClientBrief
  setClientBrief: (v: ClientBrief) => void

  // System Designer
  systemDesignerResult: SystemDesignerResult | null
  setSystemDesignerResult: (v: SystemDesignerResult | null) => void

  // Command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (v: boolean) => void

  // Copy feedback
  lastFeedback: string | null
  showFeedback: (msg: string) => void
}

const defaultBrief: ClientBrief = { pain: null, goal: null, tools: [] }

function loadState() {
  try {
    const raw = localStorage.getItem('portfolio-state')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        selectedProblem: parsed.selectedProblem ?? null,
        activeLabTab: parsed.activeLabTab ?? 'permission',
        clientBrief: parsed.clientBrief ?? defaultBrief,
        visitedLabs: new Set<string>(parsed.visitedLabs ?? []),
        systemDesignerResult: parsed.systemDesignerResult ?? null,
      }
    }
  } catch { /* ignore */ }
  return {
    selectedProblem: null,
    activeLabTab: 'permission',
    clientBrief: defaultBrief,
    visitedLabs: new Set<string>(),
    systemDesignerResult: null,
  }
}

const PortfolioContext = createContext<PortfolioState | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const loaded = loadState()
  const [selectedProblem, setSelectedProblem] = useState<string | null>(loaded.selectedProblem)
  const [activeLabTab, setActiveLabTab] = useState(loaded.activeLabTab)
  const [visitedLabs, setVisitedLabs] = useState<Set<string>>(loaded.visitedLabs)
  const [clientModeOpen, setClientModeOpen] = useState(false)
  const [clientBrief, setClientBrief] = useState<ClientBrief>(loaded.clientBrief)
  const [systemDesignerResult, setSystemDesignerResult] = useState<SystemDesignerResult | null>(loaded.systemDesignerResult)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [lastFeedback, setLastFeedback] = useState<string | null>(null)

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('portfolio-state', JSON.stringify({
        selectedProblem,
        activeLabTab,
        clientBrief,
        visitedLabs: [...visitedLabs],
        systemDesignerResult,
      }))
    } catch { /* ignore */ }
  }, [selectedProblem, activeLabTab, clientBrief, visitedLabs, systemDesignerResult])

  const markLabVisited = (id: string) => {
    setVisitedLabs((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const showFeedback = (msg: string) => {
    setLastFeedback(msg)
    setTimeout(() => setLastFeedback(null), 2500)
  }

  return (
    <PortfolioContext.Provider value={{
      selectedProblem, setSelectedProblem,
      activeLabTab, setActiveLabTab,
      visitedLabs, markLabVisited,
      clientModeOpen, setClientModeOpen,
      clientBrief, setClientBrief,
      systemDesignerResult, setSystemDesignerResult,
      commandPaletteOpen, setCommandPaletteOpen,
      lastFeedback, showFeedback,
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be inside PortfolioProvider')
  return ctx
}
