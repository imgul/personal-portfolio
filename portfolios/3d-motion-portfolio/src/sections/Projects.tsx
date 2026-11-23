import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SectionHead, Tilt, ArrowUpRight } from "../components/ui";
import { profile } from "../data";
import { fx } from "../lib/fx";

function LmsViz() {
  const bars = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = bars.current?.querySelectorAll<HTMLElement>(".bar");
    if (!els) return;
    const tws = Array.from(els).map((b, i) =>
      gsap.to(b, { height: `${30 + Math.random() * 65}%`, duration: 1.2 + Math.random(), yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * 0.1 })
    );
    return () => tws.forEach((t) => t.kill());
  }, []);
  const mods = ["Attendance", "Reporting", "Users", "Classes"];
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/50">
        <span>Oxygen · Dashboard</span>
        <span className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-rose-400/80" />
          <i className="h-2 w-2 rounded-full bg-amber-300/80" />
          <i className="h-2 w-2 rounded-full bg-emerald-400/80" />
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-5">
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Attendance this week</div>
          <div ref={bars} className="flex h-32 items-end gap-2.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div className="bar w-full rounded-t-md bg-gradient-to-t from-[var(--accent)] to-[var(--accent2)]" style={{ height: "50%" }} />
                <span className="font-mono text-[9px] text-white/40">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90 self-center">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--accent2)" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="30">
            <animate attributeName="stroke-dashoffset" values="120;30;120" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {mods.map((m) => (
          <span key={m} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/70">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function RagViz() {
  const Node = ({ x, y, label, hot }: { x: number; y: number; label: string; hot?: boolean }) => (
    <g>
      <rect x={x} y={y} width="104" height="44" rx="12" fill={hot ? "color-mix(in srgb, var(--accent) 35%, #0b0a14)" : "#0b0a14"} stroke={hot ? "var(--accent2)" : "rgba(255,255,255,.25)"} />
      <text x={x + 52} y={y + 26} textAnchor="middle" fill="#fff" fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
        {label}
      </text>
    </g>
  );
  const path = "M62,52 H340 V170 H62";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/50">RAG pipeline · live</div>
      <svg viewBox="0 0 400 220" className="w-full">
        <path d={path} fill="none" stroke="var(--accent2)" strokeWidth="1.5" className="flow" opacity=".8" />
        {[0, 1.2, 2.4].map((b) => (
          <circle key={b} r="4" fill="var(--accent)">
            <animateMotion dur="3.6s" begin={`${b}s`} repeatCount="indefinite" path={path} />
          </circle>
        ))}
        <Node x={10} y={30} label="QUERY" />
        <Node x={148} y={30} label="EMBED" />
        <Node x={288} y={30} label="VECTOR DB" hot />
        <Node x={288} y={148} label="LLM + CTX" hot />
        <Node x={148} y={148} label="FLASK API" />
        <Node x={10} y={148} label="ANSWER" />
      </svg>
    </div>
  );
}

const projects = [
  {
    index: "01",
    tag: "SaaS · EdTech",
    title: "Oxygen LMS",
    points: ["Built a SaaS-based Learning Management System for schools.", "Designed the backend architecture using Laravel.", "Developed core modules — attendance, reporting and user management."],
    tech: ["Laravel", "SaaS", "MySQL", "Architecture"],
    viz: <LmsViz />,
  },
  {
    index: "02",
    tag: "Artificial Intelligence",
    title: "AI Systems",
    points: ["Built AI-integrated APIs using Python Flask.", "Implemented RAG-based systems for intelligent workflows.", "Connected third-party AI services into production client apps."],
    tech: ["Python Flask", "RAG", "Laravel", "AI APIs"],
    viz: <RagViz />,
  },
];

export default function Projects() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".proj-card", wrap.current);
    const tws = cards.slice(0, -1).map((c, i) =>
      gsap.to(c, {
        scale: 0.9,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: cards[i + 1], start: "top 85%", end: "top 15%", scrub: true },
      })
    );
    return () => {
      tws.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <section id="projects" data-section className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionHead index="03" label="Selected work" title="Things I've" outline="built." />

      <div ref={wrap} className="space-y-[12vh]">
        {projects.map((p) => (
          <div key={p.title} className="proj-card sticky top-[12vh] origin-top">
            <Tilt max={3} className="glass rounded-[2.2rem] p-6 md:p-12">
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-6xl font-black text-outline-accent md:text-8xl">{p.index}</span>
                    <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70">{p.tag}</span>
                  </div>
                  <h3 className="mt-4 font-display text-4xl font-black tracking-tight md:text-6xl">{p.title}</h3>
                  <ul className="mt-6 space-y-3 text-white/70">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent2)]" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span key={t} className="rounded-full bg-white/8 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/75">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div onPointerEnter={() => fx.haptic("tick")}>{p.viz}</div>
              </div>
            </Tilt>
          </div>
        ))}

        <div className="proj-card sticky top-[12vh] origin-top">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            data-cursor="Open"
            className="glass group flex min-h-[40vh] flex-col items-start justify-between gap-10 rounded-[2.2rem] p-8 transition hover:border-[var(--accent2)] md:flex-row md:items-end md:p-12"
          >
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">Open source & experiments</div>
              <h3 className="mt-3 font-display text-4xl font-black leading-[0.95] tracking-tight md:text-7xl">
                More in the <span className="grad-text">lab</span>
              </h3>
            </div>
            <span className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.25em]">
              github.com/imgul
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition group-hover:rotate-45 group-hover:scale-110">
                <ArrowUpRight className="h-6 w-6" />
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
