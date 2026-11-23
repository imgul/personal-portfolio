import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experience } from "../data";
import { TiltCard } from "../components/ui";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const el = track.current!;
      const dist = () => Math.max(0, el.scrollWidth - window.innerWidth);
      gsap.to(el, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          pin: true,
          scrub: 0.7,
          start: "top top",
          end: () => "+=" + dist(),
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            if (counter.current) {
              const idx = Math.min(experience.length, Math.max(1, Math.round(self.progress * (experience.length - 1)) + 1));
              counter.current.textContent = String(idx).padStart(2, "0");
            }
          },
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="experience" data-section="2" className="relative">
      <div ref={pin} className="relative flex min-h-screen flex-col justify-center overflow-hidden py-24 md:h-screen md:py-0">
        <div ref={track} className="flex flex-col gap-6 px-5 will-change-transform md:w-max md:flex-row md:items-center md:gap-8 md:px-[6vw]">
          {/* intro panel */}
          <div className="shrink-0 md:w-[min(46vw,640px)] md:pr-10">
            <div className="mono mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/60">
              <span className="accent">02</span>
              <span className="h-px w-10 bg-white/30" />
              <span>Experience</span>
            </div>
            <h2 className="font-display text-[clamp(2.6rem,7vw,6.5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter">
              Where I've <span className="outline-text">built</span> things
            </h2>
            <p className="mt-6 max-w-sm text-white/60">From freelance Laravel builds to leading engineers on AI-connected commerce platforms.</p>
            <p className="mono mt-8 hidden text-[11px] uppercase tracking-[0.3em] text-white/40 md:block">Keep scrolling →</p>
          </div>

          {experience.map((e, i) => (
            <TiltCard
              key={e.company}
              tilt={5}
              data-hover
              className="glass group flex shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] p-7 md:h-[min(620px,74vh)] md:w-[min(480px,38vw)] md:p-9"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-display outline-text text-7xl font-extrabold leading-none tracking-tighter">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mono rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70">{e.period}</span>
                </div>
                <h3 className="font-display mt-6 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noreferrer" className="transition hover:text-[var(--accent)]">
                      {e.company} <span className="text-xl">↗</span>
                    </a>
                  ) : (
                    e.company
                  )}
                </h3>
                <p className="accent mono mt-2 text-xs uppercase tracking-widest">
                  {e.role} · {e.location}
                </p>
                <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-white/70">
                  {e.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="accent mt-[3px] text-xs">▸</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span key={t} className="mono rounded-full bg-white/[0.07] px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                    {t}
                  </span>
                ))}
              </div>
            </TiltCard>
          ))}

          <div className="shrink-0 py-10 md:w-[30vw] md:pl-6">
            <p className="font-display text-4xl font-extrabold uppercase leading-none tracking-tighter md:text-6xl">
              ...and <span className="accent">counting</span>
            </p>
            <p className="mono mt-5 text-[11px] uppercase tracking-[0.3em] text-white/50">Next chapter: you?</p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-5 right-5 hidden items-center gap-5 md:left-12 md:right-12 md:flex">
          <span className="mono text-[11px] uppercase tracking-widest text-white/50">
            <span ref={counter} className="accent">01</span> / {String(experience.length).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-white/15">
            <div ref={bar} className="h-px origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
