import { useEffect, useRef } from "react";
import gsap from "gsap";
import { experience } from "../data";
import { ArrowUpRight, Tilt } from "../components/ui";
import { fx } from "../lib/fx";

export default function Experience() {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const el = track.current!;
      const dist = () => Math.max(0, el.scrollWidth - window.innerWidth + window.innerWidth * 0.08);
      let last = -1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin.current,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(experience.length - 1, Math.floor(self.progress * experience.length * 0.999));
            if (idx !== last) {
              last = idx;
              if (counter.current) counter.current.textContent = String(idx + 1).padStart(2, "0");
              fx.tick();
              fx.haptic("tick");
            }
          },
        },
      });
      tl.to(el, { x: () => -dist() }, 0).to(bar.current, { scaleX: 1 }, 0);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="experience" data-section className="relative">
      <div ref={pin} className="relative flex flex-col justify-center overflow-hidden py-24 md:h-screen md:py-0">
        <div className="px-5 md:absolute md:left-12 md:top-24 md:z-10 md:px-0">
          <div className="mb-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
            <span className="text-[var(--accent2)]">02</span>
            <span className="h-px w-10 bg-white/30" />
            <span>Experience</span>
          </div>
        </div>

        <div ref={track} className="flex flex-col gap-6 px-5 md:w-max md:flex-row md:items-center md:gap-10 md:px-0 md:pl-12">
          {/* title panel */}
          <div data-reveal className="mb-6 md:mb-0 md:w-[38vw] md:shrink-0 md:pr-10">
            <h2 className="font-display text-[clamp(2.4rem,7vw,6.5rem)] font-black leading-[0.92] tracking-tight">
              Where I've <span className="text-outline">shipped.</span>
            </h2>
            <p className="mt-6 max-w-sm text-white/60">
              From freelance Laravel gigs to leading engineers and wiring AI into products. Scroll sideways through time →
            </p>
            <div className="mt-8 hidden items-center gap-3 font-mono text-xs uppercase tracking-widest text-white/60 md:flex">
              <span className="text-3xl font-black text-white">
                <span ref={counter}>01</span>
              </span>
              / 0{experience.length}
            </div>
          </div>

          {experience.map((job, i) => (
            <Tilt key={job.company} max={5} className="glass group relative rounded-[2rem] p-7 md:h-[68vh] md:w-[min(34vw,520px)] md:min-w-[400px] md:shrink-0 md:p-9">
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="font-display text-7xl font-black text-outline md:text-8xl">0{i + 1}</span>
                  <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70">
                    {i === 0 ? "Latest" : job.location.split(",")[0]}
                  </span>
                </div>

                <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--accent2)]">{job.period}</div>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight md:text-2xl">{job.position}</h3>
                <div className="mt-1 flex items-center gap-2 text-white/70">
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noreferrer" data-cursor="Visit" className="inline-flex items-center gap-1 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-[var(--accent2)]">
                      {job.company} <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    job.company
                  )}
                  <span className="text-white/30">·</span>
                  <span className="text-sm text-white/50">{job.location}</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-white/65">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent2)]" />
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {job.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/8 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Tilt>
          ))}
          <div className="hidden w-[10vw] shrink-0 md:block" />
        </div>

        <div className="absolute bottom-16 left-12 right-12 hidden h-px bg-white/15 md:block">
          <div ref={bar} className="h-full origin-left bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
