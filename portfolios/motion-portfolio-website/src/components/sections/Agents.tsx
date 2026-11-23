import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { agentCaps, agents } from "../../lib/data";
import { audio } from "../../lib/audio";
import { H } from "../../lib/haptics";
import { Eyebrow, Split } from "../ui";

const C = 300;
const R = 215;
const pts = agents.map((_, i) => {
  const a = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
  return { x: C + Math.cos(a) * R, y: C + Math.sin(a) * R };
});

export default function Agents() {
  const [active, setActive] = useState(0);
  const [logs, setLogs] = useState<{ n: number; t: string }[]>([]);
  const pulse = useRef<SVGCircleElement>(null);
  const paused = useRef(false);
  const counter = useRef(0);

  const fire = useCallback((i: number, user = false) => {
    setActive(i);
    counter.current++;
    const id = counter.current;
    setLogs((l) => [...l.slice(-3), { n: id, t: `${agents[i].name.toLowerCase()}.agent › ${agents[i].log}` }]);
    const p = pulse.current;
    if (p) {
      gsap.killTweensOf(p);
      gsap
        .timeline()
        .set(p, { attr: { cx: C, cy: C, r: 6 }, opacity: 1 })
        .to(p, { attr: { cx: pts[i].x, cy: pts[i].y }, duration: 0.7, ease: "power2.inOut" })
        .to(p, { attr: { r: 26 }, opacity: 0, duration: 0.5, ease: "power2.out" });
    }
    if (user) {
      audio.note(i * 2 + 1);
      H.tap();
    } else {
      audio.tick(i);
    }
  }, []);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (paused.current) return;
      i = (i + 1) % agents.length;
      fire(i);
    }, 2600);
    return () => clearInterval(id);
  }, [fire]);

  return (
    <section data-section="agents" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="03" label="Agentic AI" />
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Split
            text="Building toward an [AI-native] company."
            className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl"
          />
          <p data-reveal className="mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            I'm fascinated by AI that does real work, not just generates text. The architecture I'm exploring: one orchestrator agent coordinating
            specialised agents across research, planning, code, operations, marketing, sales and support — with humans in the loop.
          </p>
          <div data-stagger className="mt-8 flex flex-wrap gap-2">
            {agentCaps.map((c) => (
              <span key={c} className="rounded-full border border-white/15 bg-black/30 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white/70 backdrop-blur">
                {c}
              </span>
            ))}
          </div>

          <div data-reveal className="glass mt-10 rounded-2xl p-5 font-mono text-[12px] leading-6 text-white/70">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/35">
              <span>orchestrator.log</span>
              <span>illustrative simulation</span>
            </div>
            <div className="min-h-[96px]">
              {logs.map((l, idx) => (
                <div key={l.n} className={idx === logs.length - 1 ? "text-lime" : "text-white/40"}>
                  <span className="text-white/30">▸ </span>
                  {l.t}
                </div>
              ))}
              <span className="inline-block h-3.5 w-2 animate-pulse bg-lime align-middle" />
            </div>
          </div>
        </div>

        <div data-reveal className="relative mx-auto w-full max-w-[560px]">
          <svg viewBox="0 0 600 600" className="w-full overflow-visible" role="img" aria-label="Orchestrator agent connected to seven specialised agents">
            <defs>
              <radialGradient id="core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c6ff3d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8b6cff" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 8" />
            <circle cx={C} cy={C} r={R * 0.55} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 8" />
            {pts.map((p, i) => (
              <line
                key={i}
                x1={C}
                y1={C}
                x2={p.x}
                y2={p.y}
                stroke={active === i ? "#c6ff3d" : "rgba(255,255,255,0.14)"}
                strokeWidth={active === i ? 2 : 1}
                strokeDasharray="4 6"
                style={{ transition: "stroke .4s, stroke-width .4s" }}
              />
            ))}
            <circle ref={pulse} cx={C} cy={C} r="6" fill="#c6ff3d" opacity="0" />

            {/* orchestrator */}
            <g>
              <circle cx={C} cy={C} r="62" fill="url(#core)" opacity="0.5">
                <animate attributeName="r" values="58;70;58" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={C} cy={C} r="44" fill="#07070b" stroke="#c6ff3d" strokeWidth="1.5" />
              <text x={C} y={C - 2} textAnchor="middle" fill="#eae9f2" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="2">
                MAIN
              </text>
              <text x={C} y={C + 14} textAnchor="middle" fill="#c6ff3d" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="2">
                AGENT
              </text>
            </g>

            {pts.map((p, i) => (
              <g
                key={agents[i].name}
                role="button"
                tabIndex={0}
                data-sfx
                data-nohaptic
                aria-label={`${agents[i].name} agent`}
                onPointerEnter={() => {
                  paused.current = true;
                  fire(i, true);
                }}
                onPointerLeave={() => (paused.current = false)}
                onClick={() => fire(i, true)}
                onKeyDown={(e) => e.key === "Enter" && fire(i, true)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <circle cx={p.x} cy={p.y} r="42" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active === i ? 34 : 28}
                  fill={active === i ? "rgba(198,255,61,0.16)" : "rgba(7,7,11,0.85)"}
                  stroke={active === i ? "#c6ff3d" : "rgba(255,255,255,0.3)"}
                  strokeWidth="1.5"
                  style={{ transition: "all .4s cubic-bezier(.2,.9,.2,1)" }}
                />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill={active === i ? "#c6ff3d" : "#eae9f2"} fontSize="9.5" fontFamily="JetBrains Mono" letterSpacing="1">
                  {agents[i].name.toUpperCase().slice(0, 9)}
                </text>
              </g>
            ))}
          </svg>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">Hover or tap an agent</p>
        </div>
      </div>
    </section>
  );
}
