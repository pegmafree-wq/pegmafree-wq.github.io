import { useInView } from '../hooks/useInView'

const chips = [
  'FULL-STACK', 'WEB APPS', 'INTERNAL SYSTEMS', 'n8n', 'GOOGLE APPS SCRIPT',
  'SYSTEM DESIGN', 'WORKFLOWS', 'AUTOMATION',
]

export default function Profile() {
  const [sectionRef, sectionInView] = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={sectionRef} className="bg-bone text-light-text py-[80px] md:py-[120px] px-6 md:px-14">
      <div className="max-w-[1600px] mx-auto">
        <div className={`flex items-center gap-3 text-[9px] font-mono tracking-[0.18em] uppercase text-light-text-dim transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          <span>06 / Profile</span>
          <span className="w-9 h-px bg-current opacity-30" />
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-16 items-end">
          <div>
            <div className={`text-[10px] font-mono tracking-[0.2em] uppercase text-light-text-dim mb-5 md:mb-6 transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100' : 'opacity-0'}`}>
              CURRENTLY
            </div>
            <h2 className={`text-[clamp(36px,5.5vw,88px)] leading-[0.88] tracking-[-0.06em] font-medium m-0 transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              IT / Full-Stack Development.
              <br />
              <span className="text-light-text-dim">Building practical systems and automation.</span>
            </h2>
          </div>

          <div className={`transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            <p className="text-light-text/60 leading-[1.75] mb-0 text-sm md:text-base">
              I focus on building practical software around real workflows — custom systems, web applications,
              internal tools, integrations, and automation. I like understanding how a process currently works
              before deciding what should be simplified, connected, automated, or built.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 md:mt-8">
              {chips.map((c) => (
                <span key={c} className="text-[7px] md:text-[8px] font-mono tracking-[0.12em] uppercase border border-light-border rounded-full px-2.5 md:px-3 py-1.5 md:py-2 text-light-text-dim">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
