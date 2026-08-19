interface HeroProps {
  onExplore?: () => void
}

export default function Hero({ onExplore }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-start px-8 md:px-16 lg:px-24 pointer-events-none z-10">
      <div className="max-w-lg">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.05] mb-4">
          <span className="text-white/90">SOFTWARE</span>
          <br />
          <span className="text-[#c9ff4a]">SHOULD FIT</span>
          <br />
          <span className="text-white/90">THE WORK.</span>
        </h1>

        <p className="text-xs md:text-sm text-white/25 max-w-xs mb-6 leading-relaxed">
          Custom systems, web applications, internal tools, and automation.
        </p>

        <button
          onClick={onExplore}
          className="pointer-events-auto text-[9px] font-mono tracking-[0.15em] uppercase border border-[#c9ff4a]/30 text-[#c9ff4a]/60 rounded px-4 py-2 hover:bg-[#c9ff4a]/10 transition-all cursor-pointer"
        >
          EXPLORE THE SYSTEM →
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/15 to-transparent" />
      </div>
    </section>
  )
}
