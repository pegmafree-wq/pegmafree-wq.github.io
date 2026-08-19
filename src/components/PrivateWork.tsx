import { usePortfolio } from '../context/PortfolioContext'
import { useInView } from '../hooks/useInView'

const projects = [
  {
    id: '01',
    role: 'LEAD DEVELOPER',
    title: 'Custom Management Platform',
    desc: 'A private full-stack platform built around structured workflows, data management, access control, reporting, and operational tools.',
    tags: [
      { label: 'ARCHITECTURE', link: 'architecture', tip: 'TRY THE STACK', icon: '↗' },
      { label: 'FULL-STACK', tip: 'End-to-end development from database to interface.' },
      { label: 'ACCESS CONTROL', link: 'permission', tip: 'TRY A PERMISSION MODEL', icon: '↗' },
      { label: 'WORKFLOWS', link: 'process', tip: 'TEST A PROCESS', icon: '↗' },
      { label: 'REPORTING', link: 'dashboard', tip: 'OPEN A LIVE CONSOLE', icon: '↗' },
    ],
  },
  {
    id: '02',
    role: 'FULL-STACK DEVELOPMENT',
    title: 'Business Operations Platform',
    desc: 'An ongoing software platform focused on connecting operational processes, internal tools, automation, and management workflows.',
    tags: [
      { label: 'SYSTEM DESIGN', link: 'architecture', tip: 'EXPLORE ARCHITECTURE', icon: '↗' },
      { label: 'OPERATIONS', link: 'dashboard', tip: 'OPEN THE CONSOLE', icon: '↗' },
      { label: 'AUTOMATION', link: 'workflow', tip: 'TRY THE WORKFLOW', icon: '↗' },
      { label: 'INTERNAL TOOLS', tip: 'Dashboards, admin panels, and operational utilities.' },
    ],
  },
]

export default function PrivateWork() {
  const { setActiveLabTab, markLabVisited } = usePortfolio()
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.1 })
  const [transitionRef, transitionInView] = useInView<HTMLDivElement>({ threshold: 0.3 })

  const goToLab = (tab: string) => {
    setActiveLabTab(tab)
    markLabVisited(tab)
    setTimeout(() => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <section ref={sectionRef} className="bg-ink text-bone py-[80px] md:py-[120px] px-6 md:px-14" id="work">
      <div className="max-w-[1600px] mx-auto">
        {/* Label */}
        <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-white/40 transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>02 / Private Work</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        {/* Intro */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6 md:gap-10">
          <div />
          <div>
            <h2 className={`text-[clamp(36px,5.5vw,80px)] leading-[0.88] tracking-[-0.06em] font-medium m-0 transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              PRIVATE WORK.<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(241,239,231,0.35)' }}>PUBLIC PROOF.</span>
            </h2>
            <p className={`mt-4 md:mt-5 text-white/45 max-w-[580px] leading-[1.7] transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              Some systems are better demonstrated through the thinking behind them rather than the data inside them.
            </p>
          </div>
        </div>

        {/* Projects */}
        {projects.map((project, idx) => (
          <article key={project.id} className={`mt-10 md:mt-12 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 bg-white/[0.02] overflow-hidden transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
            style={{ transitionDelay: `${400 + idx * 150}ms` }}>
            <div className="flex justify-between text-[8px] font-mono tracking-[0.16em] text-white/35 uppercase px-1 pb-4 md:pb-5">
              <span>{project.id} / PRIVATE</span>
              <span className="hidden sm:inline">{project.role}</span>
            </div>

            <div className="border-t border-white/10 pt-6 md:pt-7 px-1 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-6 md:gap-8 items-end">
              <div>
                <h3 className="text-[clamp(28px,4.5vw,64px)] leading-[0.9] tracking-[-0.05em] font-medium m-0">
                  {project.title}
                </h3>
                <p className="mt-2 md:mt-3 text-white/45 leading-[1.65] max-w-[520px]">{project.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {project.tags.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => tag.link && goToLab(tag.link)}
                    data-cursor={tag.link ? 'TRY' : undefined}
                    className={`tooltip-trigger relative text-[8px] font-mono tracking-[0.12em] border rounded-full px-3 py-2 transition-all min-h-[32px] ${
                      tag.link
                        ? 'border-white/20 text-white/60 hover:border-acid/50 hover:text-acid cursor-pointer'
                        : 'border-white/10 text-white/40 cursor-default'
                    }`}
                  >
                    {tag.icon && <span className="mr-1">{tag.icon}</span>}
                    {tag.label}
                    <span className="tooltip">{tag.tip}</span>
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}

        {/* Proof transition — Signature Moment 2 */}
        <div ref={transitionRef} className="mt-20 md:mt-32 overflow-hidden">
          <div className={`text-center transition-all duration-700 ${transitionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-[clamp(28px,5vw,64px)] leading-[0.9] tracking-[-0.06em] font-medium text-white/15">
              ANYONE CAN LIST SKILLS.
            </h2>
          </div>
          <div className={`mt-6 md:mt-8 text-center transition-all duration-700 delay-300 ${transitionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-[clamp(24px,4.5vw,56px)] leading-[0.9] tracking-[-0.06em] font-medium">
              SO DON'T TAKE MY WORD FOR IT.
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}
