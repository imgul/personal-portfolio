import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SECTIONS, world } from "../lib/world";
import { fx } from "../lib/fx";
import { useFx } from "../lib/useFx";
import { scrollTo } from "../lib/scroll";

export default function Hud({ current, visible }: { current: number; visible: boolean }) {
  const { soundOn, hapticsOn } = useFx();
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      if (bar.current) bar.current.style.transform = `scaleX(${world.scroll})`;
      if (pct.current) pct.current.textContent = String(Math.round(world.scroll * 100)).padStart(2, "0");
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const go = (i: number) => {
    fx.haptic("tap");
    scrollTo(`#${SECTIONS[i].id}`);
  };

  return (
    <div className={`transition-opacity duration-1000 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {/* progress */}
      <div className="fixed left-0 top-0 z-[60] h-[3px] w-full bg-white/5">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" style={{ transform: "scaleX(0)" }} />
      </div>

      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-12 md:py-7">
        <button onClick={() => go(0)} data-hover className="font-display text-xl font-black tracking-tight">
          MG<span className="text-[var(--accent2)]">.</span>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => {
              fx.setSound(!fx.soundOn);
              fx.haptic("tap");
            }}
            data-hover
            aria-label="Toggle sound"
            className="glass flex items-center gap-3 rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em]"
          >
            <span className={`eq flex h-3.5 items-end gap-[3px] ${soundOn ? "on" : ""}`}>
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="hidden sm:inline">Sound {soundOn ? "on" : "off"}</span>
          </button>
          <button
            onClick={() => fx.setHaptics(!fx.hapticsOn)}
            data-hover
            aria-label="Toggle haptics"
            className="glass flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em]"
          >
            <span className={hapticsOn ? "animate-pulse" : "opacity-40"}>📳</span>
            <span className="hidden sm:inline">Haptics {hapticsOn ? "on" : "off"}</span>
          </button>
        </div>
      </header>

      {/* side nav */}
      <nav className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => go(i)} onPointerEnter={() => fx.note(i, 2)} data-hover className="group flex items-center gap-3" aria-label={s.label}>
            <span className="translate-x-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/0 transition group-hover:translate-x-0 group-hover:text-white/80">
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-500 ${
                i === current ? "h-6 w-[3px] bg-[var(--accent2)]" : "h-[6px] w-[6px] bg-white/30 group-hover:bg-white"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* bottom readout */}
      <div className="pointer-events-none fixed bottom-5 left-5 z-50 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 md:bottom-7 md:left-12">
        <span className="text-[var(--accent2)]">0{current + 1}</span> / 0{SECTIONS.length} — {SECTIONS[current].label}
      </div>
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 sm:block md:bottom-7 md:right-12">
        Scroll <span ref={pct}>00</span>%
      </div>
    </div>
  );
}
