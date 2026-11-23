import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, profile } from "../data";
import { SectionLabel, TiltCard, Magnetic } from "../components/ui";

gsap.registerPlugin(ScrollTrigger);

function OxygenVisual() {
  const bars = [60, 85, 45, 95, 70, 55, 88, 66];
  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-[10px] uppercase tracking-widest text-white/40">oxygen / dashboard</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["Attendance", "Reports", "Users"].map((l, i) => (
          <div key={l} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="mono text-[9px] uppercase tracking-widest text-white/50">{l}</div>
            <svg viewBox="0 0 40 40" className="mt-2 h-10 w-10 -rotate-90">
              <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4" />
              <circle cx="20" cy="20" r="15" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${70 + i * 8} 100`} className="spin-slow" style={{ transformOrigin: "center" }} />
            </svg>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-28 items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        {bars.map((h, i) => (
          <div key={i} className="bar-anim flex-1 rounded-t-md bg-accent" style={{ height: `${h}%`, animationDelay: `${i * 0.25}s`, opacity: 0.4 + (h / 100) * 0.6 }} />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[80, 62, 74].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="h-6 w-6 rounded-full bg-white/10" />
            <span className="h-2 rounded-full bg-white/15" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AIVisual() {
  const nodes = [
    { x: 50, y: 150, l: "Query" },
    { x: 150, y: 70, l: "Embed" },
    { x: 150, y: 230, l: "Flask API" },
    { x: 260, y: 150, l: "Vector DB" },
    { x: 370, y: 70, l: "LLM" },
    { x: 370, y: 230, l: "Tools" },
    { x: 470, y: 150, l: "Answer" },
  ];
  const links = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]];
  return (
    <div className="relative flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-2">
      <svg viewBox="0 0 520 300" className="h-full w-full">
        {links.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.5" className="flow" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
        {nodes.map((n, i) => (
          <g key={n.l}>
            <circle cx={n.x} cy={n.y} r="22" fill="#06060a" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="var(--accent)" strokeOpacity="0.4">
              <animate attributeName="r" values="22;38" dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.5;0" dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r="5" fill="var(--accent)" />
            <text x={n.x} y={n.y + 42} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
              {n.l.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".proj-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top 85%", end: "top 15%", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="projects" data-section="3" className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionLabel n="03">Selected work</SectionLabel>
      <h2 data-reveal className="font-display mb-16 text-[clamp(2.6rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter">
        Things I <span className="outline-text">ship</span>
      </h2>

      <div className="space-y-[10vh]">
        {projects.map((p, i) => (
          <div key={p.id} className="proj-card sticky" style={{ top: `${11 + i * 2}vh` }}>
            <TiltCard tilt={3} data-hover data-cursor="Explore" className="glass grid gap-8 rounded-[2rem] p-6 md:grid-cols-2 md:gap-12 md:p-12">
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <div className="mono mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/60">
                    <span className="accent">{p.index}</span>
                    <span className="h-px w-8 bg-white/30" />
                    {p.kind}
                  </div>
                  <h3 className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter">{p.name}</h3>
                  <p className="mt-5 max-w-md text-lg text-white/65">{p.blurb}</p>
                  <ul className="mt-6 space-y-2.5 text-white/80">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-3">
                        <span className="accent">●</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="mono rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="min-h-[280px]">{p.id === "oxygen" ? <OxygenVisual /> : <AIVisual />}</div>
            </TiltCard>
          </div>
        ))}
      </div>

      <div data-reveal className="mt-24 flex flex-col items-center gap-5 text-center">
        <p className="text-white/60">More code, experiments and open-source contributions live on GitHub.</p>
        <Magnetic>
          <a href={profile.github} target="_blank" rel="noreferrer" className="inline-block rounded-full border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-widest transition hover:bg-white hover:text-black">
            github.com/imgul ↗
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
