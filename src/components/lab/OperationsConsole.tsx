import { useState, useEffect, useRef, useCallback } from 'react'
import { getOperationsDataset, fmt, locationLabels, periodLabels, type Period, type Location, type MetricsData } from '../../data/operationsData'

export default function OperationsConsole() {
  const [period, setPeriod] = useState<Period>('today')
  const [location, setLocation] = useState<Location>('all')
  const [liveMode, setLiveMode] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [liveOffset, setLiveOffset] = useState(0)
  const [liveActivity, setLiveActivity] = useState<string[]>([])
  const intervalRef = useRef<number | null>(null)

  const data: MetricsData = getOperationsDataset(period, location)
  const maxVal = Math.max(...data.chart)

  // Live simulation — operates on current dataset
  const startLive = useCallback(() => {
    setLiveMode(true)
    setLiveOffset(0)
    setLiveActivity([])
    intervalRef.current = window.setInterval(() => {
      setLiveOffset((o) => o + 1)
      const act = data.activities[Math.floor(Math.random() * data.activities.length)]
      setLiveActivity((a) => [act.text, ...a].slice(0, 6))
    }, 3000)
  }, [data.activities])

  const stopLive = useCallback(() => {
    setLiveMode(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  // Reset live when filters change
  useEffect(() => {
    if (liveMode) {
      stopLive()
      startLive()
    }
  }, [period, location])

  const liveRevenue = data.revenue + liveOffset * 89
  const liveOrders = data.orders.completed + liveOffset

  const chartData = [...data.chart, ...Array(liveOffset).fill(0).map(() => {
    const last = data.chart[data.chart.length - 1]
    return last + Math.floor(Math.random() * 8 - 2)
  })]

  const drilldownData: Record<string, { label: string; items: { label: string; value: string; color?: string }[] }> = {
    revenue: {
      label: 'REVENUE BREAKDOWN',
      items: [
        { label: 'Online', value: fmt(Math.floor(liveRevenue * 0.55)) },
        { label: 'In-store', value: fmt(Math.floor(liveRevenue * 0.30)) },
        { label: 'Other', value: fmt(Math.floor(liveRevenue * 0.15)) },
      ],
    },
    orders: {
      label: 'ORDER STATUS',
      items: [
        { label: 'Completed', value: liveOrders.toLocaleString(), color: 'text-acid' },
        { label: 'Processing', value: data.orders.processing.toString(), color: 'text-white/60' },
        { label: 'Cancelled', value: data.orders.cancelled.toString(), color: 'text-white/30' },
      ],
    },
    tasks: {
      label: 'TASK STATUS',
      items: [
        { label: 'Open', value: data.tasks.open.toString(), color: 'text-white/60' },
        { label: 'In Progress', value: data.tasks.inProgress.toString(), color: 'text-acid' },
        { label: 'Blocked', value: data.tasks.blocked.toString(), color: 'text-red-400/60' },
      ],
    },
    alerts: {
      label: 'ALERT TYPES',
      items: [
        { label: 'Low Stock', value: data.alerts.lowStock.toString() },
        { label: 'Pending Approval', value: data.alerts.pendingApproval.toString() },
        { label: 'Sync Warning', value: data.alerts.syncWarning.toString() },
      ],
    },
  }

  const currentActivities = liveMode ? liveActivity.slice(0, 5) : data.activities.slice(0, 5).map((a) => a.text)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="flex gap-1">
          {(['today', '7days', '30days'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-[7px] md:text-[8px] font-mono tracking-[0.12em] uppercase border rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 transition-all cursor-pointer min-h-[28px] ${
                period === p ? 'border-acid/40 text-acid bg-acid/10' : 'border-white/[0.08] text-white/40 hover:border-white/15 bg-transparent'
              }`}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'north', 'central', 'south'] as Location[]).map((l) => (
            <button key={l} onClick={() => setLocation(l)}
              className={`text-[7px] md:text-[8px] font-mono tracking-[0.12em] uppercase border rounded-lg px-2 md:px-2.5 py-1 md:py-1.5 transition-all cursor-pointer min-h-[28px] ${
                location === l ? 'border-acid/40 text-acid bg-acid/10' : 'border-white/[0.08] text-white/40 hover:border-white/15 bg-transparent'
              }`}>
              {locationLabels[l]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[6px] md:text-[7px] font-mono text-white/20 uppercase hidden sm:inline">FICTIONAL DATA</span>
          <button onClick={liveMode ? stopLive : startLive}
            className={`flex items-center gap-1.5 text-[7px] md:text-[8px] font-mono px-2 md:px-2.5 py-1 rounded-full border transition-all cursor-pointer min-h-[28px] ${
              liveMode ? 'border-acid/40 text-acid bg-acid/10' : 'border-white/[0.08] text-white/35 hover:border-white/15 bg-transparent'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? 'bg-acid animate-pulse' : 'bg-white/20'}`} />
            LIVE
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          { key: 'revenue', label: 'REVENUE', value: fmt(liveRevenue), change: '+12%', icon: '$' },
          { key: 'orders', label: 'ORDERS', value: liveOrders.toLocaleString(), change: '+8%', icon: '#' },
          { key: 'tasks', label: 'TASKS', value: data.tasks.open.toString(), change: '-3%', icon: '○' },
          { key: 'alerts', label: 'ALERTS', value: data.alerts.lowStock.toString(), change: data.alerts.lowStock > 5 ? '+15%' : '-5%', icon: '!' },
        ].map((card) => (
          <button key={card.key} onClick={() => setExpandedCard(expandedCard === card.key ? null : card.key)}
            data-cursor="INSPECT"
            className={`text-left border rounded-xl p-3 transition-all cursor-pointer min-h-[70px] ${
              expandedCard === card.key ? 'border-acid/30 bg-acid/[0.05]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'
            }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[6px] md:text-[7px] font-mono tracking-[0.15em] uppercase text-white/30">{card.label}</span>
              <span className="text-white/15 text-xs">{card.icon}</span>
            </div>
            <div className="text-lg md:text-xl font-medium tracking-tight">{card.value}</div>
            <div className={`text-[7px] md:text-[8px] font-mono mt-0.5 ${card.change.startsWith('+') ? 'text-acid/60' : 'text-white/25'}`}>{card.change}</div>
          </button>
        ))}
      </div>

      {/* Expanded detail */}
      {expandedCard && drilldownData[expandedCard] && (
        <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02] mb-4 animate-[fadeIn_0.2s_ease]">
          <div className="text-[6px] md:text-[7px] font-mono tracking-[0.12em] uppercase text-white/30 mb-2">{drilldownData[expandedCard].label}</div>
          <div className="grid grid-cols-3 gap-3">
            {drilldownData[expandedCard].items.map((item) => (
              <div key={item.label}>
                <div className="text-[6px] md:text-[7px] font-mono text-white/25 mb-0.5">{item.label}</div>
                <div className={`text-sm md:text-base font-mono ${item.color || 'text-white/60'}`}>{item.value}</div>
              </div>
            ))}
          </div>
          {liveMode && <div className="mt-2 text-[6px] font-mono text-acid/40">LIVE — {liveOffset} simulated events</div>}
        </div>
      )}

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
        <div className="border border-white/[0.08] rounded-xl p-3 md:p-4 bg-white/[0.02]">
          <div className="text-[6px] md:text-[7px] font-mono tracking-[0.15em] uppercase text-white/30 mb-3">REVENUE TREND</div>
          <svg viewBox="0 0 400 120" className="w-full h-auto">
            {[0, 30, 60, 90, 120].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            <path
              d={`M0,${120 - (chartData[0] / maxVal) * 100} ${chartData.map((v, i) => `L${(i / (chartData.length - 1)) * 400},${120 - (Math.min(v, maxVal * 1.1) / (maxVal * 1.1)) * 100}`).join(' ')} L400,120 L0,120 Z`}
              fill="url(#chartGrad)" opacity="0.3"
            />
            <path
              d={`M0,${120 - (chartData[0] / maxVal) * 100} ${chartData.map((v, i) => `L${(i / (chartData.length - 1)) * 400},${120 - (Math.min(v, maxVal * 1.1) / (maxVal * 1.1)) * 100}`).join(' ')}`}
              fill="none" stroke="#c9ff4a" strokeWidth="2" strokeLinecap="round"
            />
            {chartData.map((v, i) => (
              <circle key={i} cx={(i / (chartData.length - 1)) * 400} cy={120 - (Math.min(v, maxVal * 1.1) / (maxVal * 1.1)) * 100} r="2.5" fill="#080a0d" stroke="#c9ff4a" strokeWidth="1.5" />
            ))}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9ff4a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#c9ff4a" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="border border-white/[0.08] rounded-xl p-3 md:p-4 bg-white/[0.02]">
          <div className="text-[6px] md:text-[7px] font-mono tracking-[0.15em] uppercase text-white/30 mb-3">ACTIVITY</div>
          <div className="space-y-2">
            {currentActivities.map((a, i) => (
              <div key={`${a}-${i}`} className="flex items-center gap-2 text-[8px] md:text-[9px] font-mono text-white/45">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${liveMode && i === 0 ? 'bg-acid animate-pulse' : 'bg-acid/40'}`} />
                <span className="truncate">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
