import { useState, useCallback, useEffect } from 'react'
import Scene3D from './components/scene/Scene3D'
import { LaptopScreen, PhoneScreen } from './components/scene/NotificationExperience'
import Hero from './components/Hero'
import Navigation from './components/Navigation'
import Positioning from './components/Positioning'
import PrivateWork from './components/PrivateWork'
import SystemLab from './components/SystemLab'
import WhatIBuild from './components/WhatIBuild'
import Automation from './components/Automation'
import SystemDesigner from './components/SystemDesigner'
import Profile from './components/Profile'
import Contact from './components/Contact'
import ClientMode from './components/client/ClientMode'
import CommandPalette from './components/CommandPalette'
import { useReducedMotion } from './hooks/useReducedMotion'
import { usePortfolio } from './context/PortfolioContext'
import type { CameraState } from './components/scene/CameraController'

function App() {
  const reducedMotion = useReducedMotion()
  usePortfolio()

  // 3D interaction state
  const [cameraState, setCameraState] = useState<CameraState>('default')
  const [traceActive, setTraceActive] = useState(false)
  const [notificationSent, setNotificationSent] = useState(false)
  const [activeNode, setActiveNode] = useState<string | null>(null)

  const handleEnterSystem = useCallback(() => {
    setCameraState('system')
  }, [])

  const handleTrace = useCallback(() => {
    setTraceActive(true)
    setCameraState('trace')
    setTimeout(() => {
      setNotificationSent(true)
      setCameraState('phone')
    }, 2800)
  }, [])

  const handleReset = useCallback(() => {
    setTraceActive(false)
    setNotificationSent(false)
    setActiveNode(null)
    setCameraState('default')
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleReset() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleReset])

  // Scroll reveal observer
  useEffect(() => {
    if (reducedMotion) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    const observe = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer.observe(el))
    }
    observe()
    const mutationObs = new MutationObserver(observe)
    mutationObs.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutationObs.disconnect() }
  }, [reducedMotion])

  return (
    <>
      <div className="noise-overlay" />

      {/* 3D Canvas — THE HERO */}
      {!reducedMotion && (
        <Scene3D
          cameraState={cameraState}
          activeNode={activeNode}
          laptopGlow={traceActive ? 0.5 : 0}
          phoneGlow={notificationSent ? 0.8 : 0}
          laptopScreen={<LaptopScreen traceActive={traceActive} notificationSent={notificationSent} />}
          phoneScreen={<PhoneScreen traceActive={traceActive} notificationSent={notificationSent} />}
        />
      )}

      {/* Hero — transparent overlay on 3D scene */}
      <Hero onExplore={handleEnterSystem} />

      {/* 3D interaction controls — floating over the scene */}
      {cameraState !== 'default' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center bg-[#080a0d]/80 backdrop-blur-sm border border-white/[0.08] rounded-xl px-3 py-2">
          {cameraState === 'system' && (
            <>
              <div className="flex gap-1 mr-2">
                {['api', 'database', 'notifications', 'analytics'].map(node => (
                  <button
                    key={node}
                    onClick={() => setActiveNode(activeNode === node ? null : node)}
                    className={`text-[7px] font-mono uppercase px-2 py-1 rounded border transition-all cursor-pointer ${
                      activeNode === node
                        ? 'border-[#c9ff4a]/40 text-[#c9ff4a] bg-[#c9ff4a]/10'
                        : 'border-white/[0.08] text-white/30 hover:border-white/15'
                    }`}
                  >
                    {node}
                  </button>
                ))}
              </div>

              <button
                onClick={traceActive ? handleReset : handleTrace}
                disabled={traceActive && !notificationSent}
                className="text-[8px] font-mono tracking-[0.12em] uppercase border border-[#c9ff4a]/30 text-[#c9ff4a] bg-[#c9ff4a]/10 rounded-lg px-3 py-1.5 hover:bg-[#c9ff4a]/20 transition-all cursor-pointer disabled:opacity-40"
              >
                {notificationSent ? 'RESET' : traceActive ? 'TRACING...' : 'TRACE NOTIFICATION'}
              </button>
            </>
          )}

          <button
            onClick={handleReset}
            className="text-[7px] font-mono text-white/20 hover:text-white/40 transition-colors cursor-pointer px-2"
          >
            ESC
          </button>
        </div>
      )}

      {/* Old sections — below fold, solid background */}
      <div className="relative z-10 bg-[#080a0d]">
        <Navigation />
        <ClientMode />
        <CommandPalette />
        <main>
          <Positioning />
          <PrivateWork />
          <SystemLab />
          <WhatIBuild />
          <Automation />
          <SystemDesigner />
          <Profile />
          <Contact />
        </main>
      </div>
    </>
  )
}

export default App
