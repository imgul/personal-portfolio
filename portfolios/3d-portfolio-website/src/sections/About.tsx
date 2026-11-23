import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about, stats } from "../data";
import { SectionLabel, Counter, TiltCard } from "../components/ui";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const root = useRef<HTMLElement>(null);
  const words = about.lead.split(" ");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-word",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: ".about-lead", start: "top 78%", end: "bottom 45%", scrub: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="about" data-section="1" className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionLabel n="01">About</SectionLabel>

      <p className="about-lead font-display max-w-5xl text-[clamp(1.6rem,3.8vw,3.4rem)] font-semibold leading-[1.15] tracking-tight md:ml-[8vw]">
        {words.map((w, i) => (
          <span key={i} className={`about-word inline-block ${about.highlight.includes(w) ? "accent" : ""}`}>
            {w}&nbsp;
          </span>
        ))}
      </p>

      <div className="mt-16 grid gap-10 md:ml-[8vw] md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-xl">
          <p data-reveal className="text-lg leading-relaxed text-white/65">
            {about.more}
          </p>
          <div data-reveal className="glass mono mt-8 inline-flex items-center gap-3 rounded-full px-5 py-3 text-xs uppercase tracking-widest">
            <span className="inline-block h-2 w-2 rounded-full bg-accent pulse-dot" />
            {about.seeking}
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} data-reveal>
            <TiltCard className="glass h-full rounded-3xl p-6 md:p-8" tilt={10} data-hover>
              <div className="font-display accent text-5xl font-extrabold leading-none tracking-tighter md:text-7xl">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mono mt-4 text-[11px] uppercase leading-relaxed tracking-widest text-white/60">{s.label}</p>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}
