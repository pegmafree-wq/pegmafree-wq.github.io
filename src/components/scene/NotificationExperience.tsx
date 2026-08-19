import { useState, useEffect } from 'react'

// ── Shared state for synchronized device screens ──
interface NotificationState {
  status: 'idle' | 'pending' | 'sent' | 'approved' | 'rejected'
  orderId: string
  amount: string
  message: string
}

const INITIAL_STATE: NotificationState = {
  status: 'idle',
  orderId: '#1042',
  amount: '₱12,500',
  message: '',
}

// ── Laptop Screen ──
export function LaptopScreen({ traceActive, notificationSent }: { traceActive: boolean; notificationSent: boolean }) {
  const [state, setState] = useState<NotificationState>(INITIAL_STATE)
  const [activity, setActivity] = useState<string[]>([
    'System initialized',
    'Dashboard loaded',
  ])

  useEffect(() => {
    if (traceActive && state.status === 'idle') {
      // Simulate request flow on laptop
      setState(prev => ({ ...prev, status: 'pending', message: 'Processing order...' }))
      setActivity(prev => [...prev, 'Order #1042 received'])

      const t1 = setTimeout(() => {
        setState(prev => ({ ...prev, message: 'Writing to database...' }))
        setActivity(prev => [...prev, 'Database write initiated'])
      }, 800)

      const t2 = setTimeout(() => {
        setState(prev => ({ ...prev, message: 'Dispatching notification...' }))
        setActivity(prev => [...prev, 'Notification dispatched'])
      }, 1600)

      const t3 = setTimeout(() => {
        setState(prev => ({ ...prev, status: 'sent', message: '' }))
        setActivity(prev => [...prev, '✓ Notification delivered'])
      }, 2400)

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [traceActive])

  return (
    <div className="w-full h-full bg-[#0a0c10] text-white p-3 flex flex-col" style={{ fontSize: '9px', fontFamily: 'monospace' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
        <div className="text-[8px] text-white/40 uppercase tracking-wider">Operations Dashboard</div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {[
          { label: 'ORDERS', value: notificationSent ? '143' : '142', change: notificationSent ? '+1' : '' },
          { label: 'PENDING', value: '12', change: '' },
          { label: 'REVENUE', value: '₱284K', change: '' },
          { label: 'ALERTS', value: notificationSent ? '1' : '0', change: notificationSent ? 'NEW' : '' },
        ].map(m => (
          <div key={m.label} className="bg-white/[0.03] rounded p-1.5 border border-white/[0.06]">
            <div className="text-[6px] text-white/30 uppercase">{m.label}</div>
            <div className="text-[11px] text-white/70 font-semibold">{m.value}</div>
            {m.change && <div className="text-[6px] text-[#c9ff4a]/70">{m.change}</div>}
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="flex-1 bg-white/[0.02] rounded border border-white/[0.06] overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1 px-2 py-1 border-b border-white/[0.06] text-[7px] text-white/30 uppercase">
          <span>Order</span><span>Customer</span><span>Status</span><span>Action</span>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1 px-2 py-1 text-[8px] border-b border-white/[0.04]"
          style={{ background: state.status === 'pending' ? 'rgba(201,255,74,0.03)' : undefined }}>
          <span className="text-white/60">{state.orderId}</span>
          <span className="text-white/50">Acme Corp</span>
          <span className={state.status === 'sent' ? 'text-[#c9ff4a]/70' : state.status === 'pending' ? 'text-yellow-400/70' : 'text-white/40'}>
            {state.status === 'sent' ? 'SENT' : state.status === 'pending' ? 'PROCESSING' : 'PENDING'}
          </span>
          <span className="text-white/20">—</span>
        </div>
        {/* More static rows */}
        {['#1041', '#1040', '#1039'].map((id, i) => (
          <div key={id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1 px-2 py-1 text-[8px] border-b border-white/[0.03]">
            <span className="text-white/40">{id}</span>
            <span className="text-white/30">{['Globex', 'Initech', 'Umbrella'][i]}</span>
            <span className="text-white/30">COMPLETE</span>
            <span className="text-white/15">—</span>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="mt-2 bg-white/[0.02] rounded border border-white/[0.06] p-1.5 max-h-[60px] overflow-hidden">
        <div className="text-[6px] text-white/25 uppercase mb-1">Activity</div>
        {activity.slice(-4).map((a, i) => (
          <div key={i} className="text-[7px] text-white/35 leading-relaxed">{a}</div>
        ))}
      </div>
    </div>
  )
}

// ── Phone Screen ──
export function PhoneScreen({ notificationSent }: { traceActive: boolean; notificationSent: boolean }) {
  const [notification, setNotification] = useState(false)

  useEffect(() => {
    if (notificationSent) {
      const t = setTimeout(() => setNotification(true), 300)
      return () => clearTimeout(t)
    }
    setNotification(false)
  }, [notificationSent])

  return (
    <div className="w-full h-full bg-[#0a0c10] text-white flex flex-col" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
      {/* Status bar */}
      <div className="flex justify-between items-center px-3 py-1.5 text-[7px] text-white/30">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="mx-2 mb-2 bg-[#c9ff4a]/10 border border-[#c9ff4a]/20 rounded-lg p-2.5 animate-[fadeIn_0.3s_ease]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px]">🔔</span>
            <span className="text-[8px] text-[#c9ff4a]/80 font-semibold uppercase">Order Alert</span>
          </div>
          <div className="text-[9px] text-white/60 mb-0.5">Order #1042 requires review</div>
          <div className="text-[7px] text-white/30">To: Operations Team</div>
          <div className="flex gap-1.5 mt-2">
            <button className="flex-1 bg-[#c9ff4a]/20 border border-[#c9ff4a]/30 rounded py-1 text-[8px] text-[#c9ff4a] cursor-pointer">
              VIEW
            </button>
            <button className="flex-1 bg-white/5 border border-white/10 rounded py-1 text-[8px] text-white/40 cursor-pointer">
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 px-3">
        {!notification ? (
          <>
            <div className="text-[9px] text-white/20 uppercase mb-3">No new notifications</div>
            {/* Previous items */}
            {[
              { text: 'System check complete', time: '2m ago' },
              { text: 'Dashboard synced', time: '15m ago' },
              { text: 'Backup successful', time: '1h ago' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-[8px] text-white/30">{item.text}</span>
                <span className="text-[7px] text-white/15">{item.time}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="text-[9px] text-white/20 uppercase mb-2">Notifications</div>
            <div className="bg-[#c9ff4a]/5 border border-[#c9ff4a]/15 rounded-lg p-2 mb-2">
              <div className="text-[8px] text-[#c9ff4a]/60 mb-0.5">ORDER #1042</div>
              <div className="text-[9px] text-white/60">₱12,500 — Acme Corp</div>
              <div className="text-[7px] text-white/25 mt-1">Requires approval</div>
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex justify-around py-2 border-t border-white/[0.06]">
        {['Home', 'Alerts', 'Settings'].map(tab => (
          <div key={tab} className="text-[7px] text-white/25 uppercase">{tab}</div>
        ))}
      </div>
    </div>
  )
}
