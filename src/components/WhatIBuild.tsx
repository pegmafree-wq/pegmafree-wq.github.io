import { useInView } from '../hooks/useInView'

const caps = [
  { num: '01', title: 'Custom Systems', desc: 'Software designed around real operational workflows.' },
  { num: '02', title: 'Web Applications', desc: 'Responsive full-stack products designed for actual use.' },
  { num: '03', title: 'Internal Tools', desc: 'Dashboards, admin interfaces, management tools, and operational utilities.' },
  { num: '04', title: 'Workflow Automation', desc: 'Reducing repetitive processes through automation and integration.' },
  { num: '05', title: 'Integrations', desc: 'Connecting tools and data that currently operate separately.' },
  { num: '06', title: 'Operational Software', desc: 'Systems that help make complex processes easier to manage.' },
]

const principles = [
  { title: 'UNDERSTAND BEFORE BUILDING', desc: 'I want to know how the process works before deciding what software it needs.' },
  { title: 'BUILD AROUND THE WORKFLOW', desc: 'The system should adapt to the process — not force people into unnecessary steps.' },
  { title: 'KEEP THE IMPORTANT PARTS VISIBLE', desc: 'Access, state, history, and reporting should be understandable.' },
  { title: 'AUTOMATE WITH PURPOSE', desc: 'Automation should remove repetition, not create another layer of complexity.' },
]

export default function WhatIBuild() {
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={sectionRef} className="bg-bone text-light-text py-[80px] md:py-[120px] px-6 md:px-14" id="build">
      <div className="max-w-[1600px] mx-auto">
        {/* Label */}
        <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-light-text-dim transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>04 / What I Build</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-16">
          {/* Left */}
          <div>
            <div className={`text-[10px] font-mono tracking-[0.2em] uppercase text-light-text-dim mb-6 transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100' : 'opacity-0'}`}>
              CAPABILITIES
            </div>
            <h2 className={`text-[clamp(36px,5.5vw,88px)] leading-[0.88] tracking-[-0.06em] font-medium m-0 transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              Build what matters.
              <br />
              <span className="text-dark-accent">Automate what doesn't.</span>
            </h2>
          </div>

          {/* Right: list */}
          <div className={`border-t border-light-border transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            {caps.map((c) => (
              <div key={c.num} className="grid grid-cols-[50px_1fr] md:grid-cols-[60px_1fr] py-6 md:py-8 border-b border-light-border items-start">
                <span className="text-[8px] md:text-[9px] font-mono tracking-[0.15em] text-light-text-dim pt-1">{c.num}</span>
                <div>
                  <h3 className="text-lg md:text-[28px] tracking-[-0.04em] font-medium m-0 mb-1.5 md:mb-2">{c.title}</h3>
                  <p className="text-light-text/55 leading-[1.7] text-sm md:text-base m-0">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You Can Expect */}
        <div className="mt-16 md:mt-24">
          <div className={`text-[9px] md:text-[10px] font-mono tracking-[0.2em] uppercase text-light-text-dim mb-6 md:mb-8 transition-all duration-700 ${sectionInView ? 'opacity-100' : 'opacity-0'}`}>
            WHAT YOU CAN EXPECT
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {principles.map((p, i) => (
              <div key={p.title} className={`transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${400 + i * 100}ms` }}>
                <h3 className="text-base md:text-lg font-medium tracking-[-0.02em] mb-2">{p.title}</h3>
                <p className="text-light-text/55 leading-[1.7] text-sm m-0">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
