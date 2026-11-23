import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SECTIONS, nav, store } from "../lib/store";

interface Props {
  active: number;
  sound: boolean;
  haptics: boolean;
  onSound: () => void;
  onHaptics: () => void;
}

export default function Nav({ active, sound, haptics, onSound, onHaptics }: Props) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const prog = useRef<HTMLDivElement>(null);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    const fn = () => {
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleY(${soundRef.current ? 0.2 + store.bars[i] * 1.2 : 0.14})`;
      });
      if (prog.current) prog.current.style.transform = `scaleX(${store.progress})`;
    };
    gsap.ticker.add(fn);
    return () => gsap.ticker.remove(fn);
  }, []);

  const pad = String(active + 1).padStart(2, "0");

  return (
    <>
      <div ref={prog} className="fixed left-0 top-0 z-[80] h-[3px] w-full origin-left scale-x-0 bg-accent" />

      <header className="fixed left-0 right-0 top-0 z-[70] flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        <button onClick={() => nav.scrollTo(0)} className="font-display text-xl font-extrabold tracking-tighter" aria-label="Back to top" data-cursor="Top">
          MG<span className="accent">.</span>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onSound}
            aria-pressed={sound}
            className="glass mono flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[11px] uppercase tracking-widest transition hover:border-white/30"
          >
            <span className="flex h-4 items-end gap-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} ref={(el) => { bars.current[i] = el; }} className="block h-4 w-[3px] origin-bottom rounded-full bg-accent" style={{ transform: "scaleY(0.14)" }} />
              ))}
            </span>
            <span className="hidden sm:inline">Sound {sound ? "on" : "off"}</span>
          </button>
          <button
            onClick={onHaptics}
            aria-pressed={haptics}
            className="glass mono hidden items-center gap-2 rounded-full px-3.5 py-2 text-[11px] uppercase tracking-widest transition hover:border-white/30 sm:flex"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${haptics ? "bg-accent pulse-dot" : "bg-white/30"}`} />
            Haptics {haptics ? "on" : "off"}
          </button>
          <button
            onClick={() => nav.scrollTo(7)}
            className="mono rounded-full bg-accent px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-black transition hover:scale-105"
          >
            Hire me
          </button>
        </div>
      </header>

      {/* section dots */}
      <nav className="fixed right-5 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-end gap-3 md:flex" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => nav.scrollTo(i)} className="group flex items-center gap-3" aria-label={s.label}>
            <span className="mono translate-x-2 text-[10px] uppercase tracking-widest text-white/0 transition group-hover:translate-x-0 group-hover:text-white/80">{s.label}</span>
            <span className={`block rounded-full transition-all duration-500 ${i === active ? "h-6 w-[3px] bg-accent" : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white/80"}`} />
          </button>
        ))}
      </nav>

      <div className="mono pointer-events-none fixed bottom-6 left-5 z-[70] hidden text-[11px] uppercase tracking-[0.25em] text-white/50 md:block md:left-10">
        <span className="accent">{pad}</span> / 08 — {SECTIONS[active].label}
      </div>
    </>
  );
}
