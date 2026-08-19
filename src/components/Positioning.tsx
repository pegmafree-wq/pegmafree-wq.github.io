import { useInView } from '../hooks/useInView'

const steps = [
  { num: '01', title: 'OBSERVE', desc: 'Start with the real workflow.' },
  { num: '02', title: 'SIMPLIFY', desc: 'Remove friction and repetition.' },
  { num: '03', title: 'CONNECT', desc: 'Make tools and data work together.' },
  { num: '04', title: 'BUILD', desc: 'Create only what genuinely needs to exist.' },
]

export default function Positioning() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section ref={ref} className={`bg-bone text-light-text py-[80px] md:py-[120px] px-6 md:px-14 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`} id="about">
      <div className="max-w-[1600px] mx-auto">
        {/* Section label */}
        <div className={`reveal flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-light-text-dim transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>01 / Positioning</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        {/* Main grid */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-[0.6fr_1.4fr] gap-8 md:gap-12">
          {/* Left: metadata */}
          <div className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-light-text-dim mb-6">
              HOW I THINK
            </div>
            <div className="flex gap-2 items-center mt-8">
              <div className="w-2 h-2 rounded-full bg-dark-accent" />
              <div className="text-[9px] font-mono tracking-[0.15em] text-light-text-dim uppercase">Philosophy</div>
            </div>
          </div>

          {/* Right: headline + body */}
          <div>
            <h2 className={`text-[clamp(36px,5.5vw,88px)] leading-[0.88] tracking-[-0.06em] font-medium m-0 transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              THE WORKFLOW<br />
              <span className="text-dark-accent">COMES FIRST.</span>
            </h2>
            <p className={`mt-5 md:mt-6 max-w-[640px] text-light-text/70 text-base md:text-lg leading-[1.7] transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              Before deciding what to build, I want to understand how the work actually moves —
              from people, to tools, to approvals, to data.
            </p>
          </div>
        </div>

        {/* Process diagram — single evolving line */}
        <div className={`mt-16 md:mt-24 border-t border-light-border transition-all duration-700 delay-400 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`relative min-h-[160px] md:min-h-[220px] py-6 md:py-7 px-4 md:px-6 ${
                  i < steps.length - 1 ? 'border-r border-light-border' : ''
                } ${i < 2 ? 'border-b md:border-b-0 border-light-border' : ''}`}
              >
                {/* Connection line */}
                {i < steps.length - 1 && (
                  <div className={`absolute top-1/2 right-0 w-4 md:w-8 h-[1.5px] bg-dark-accent/40 transition-all duration-500 ${
                    inView ? 'scale-x-100' : 'scale-x-0'
                  }`} style={{ transitionDelay: `${500 + i * 200}ms`, transformOrigin: 'left' }} />
                )}

                <span className="block text-[9px] font-mono tracking-[0.15em] text-light-text-dim">{s.num}</span>
                <h3 className="mt-12 md:mt-16 mb-2 text-xl md:text-2xl tracking-[-0.04em] font-medium">
                  {s.title}
                </h3>
                <p className="m-0 text-sm text-light-text/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
