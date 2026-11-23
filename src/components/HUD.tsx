import { useEffect, useRef } from "react";
import gsap from "gsap";
import { audio } from "../lib/audio";
import { H } from "../lib/haptics";
import { setPref, usePrefs } from "../lib/prefs";
import { SECTIONS, scrollToSection, store, useActive } from "../lib/store";

function Toggle({
  on,
  label,
  onClick,
  children,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      data-nohaptic
      title={label}
      className={`group flex h-10 items-center gap-2 rounded-full border px-3.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md transition-colors ${
        on ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/10 text-[color:var(--accent)]" : "border-white/15 bg-black/30 text-white/55"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function HUD({ visible }: { visible: boolean }) {
  const active = useActive();
  const prefs = usePrefs();
  const accent = SECTIONS[active].accent;
  const root = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bars = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  useEffect(() => {
    if (!visible) return;
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.4 });
  }, [visible]);

  useEffect(() => {
    const tick = () => {
      if (prog.current) prog.current.style.transform = `scaleY(${store.progress})`;
      if (pct.current) pct.current.textContent = String(Math.round(store.progress * 100)).padStart(2, "0");
      const lv = prefs.music || prefs.fx ? audio.level() : 0;
      bars.current.forEach((b, i) => {
        if (!b) return;
        const s = prefs.music ? 0.2 + lv * (0.6 + 0.5 * Math.sin(performance.now() / (180 + i * 70) + i)) * 1.4 : 0.15;
        b.style.transform = `scaleY(${Math.max(0.15, Math.min(1, s))})`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [prefs.music, prefs.fx]);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-50 opacity-0">
      {/* top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-5 sm:p-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <button
          onClick={() => scrollToSection(0)}
          data-magnetic
          className="pointer-events-auto font-display text-xl font-extrabold tracking-tight"
          aria-label="Back to top"
        >
          MG<span className="text-lime">.</span>
        </button>
        <div className="flex items-center gap-3">
          <a
            href="/blog/"
            data-magnetic
            data-cursor="Blog"
            className="pointer-events-auto rounded-full border border-white/25 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors duration-300 hover:border-lime/70 hover:text-lime"
          >
            Blog
          </a>
          <button
            onClick={() => scrollToSection(8)}
            data-magnetic
            data-cursor="Hire me"
            className="pointer-events-auto rounded-full bg-[color:var(--accent)] px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink transition-transform duration-300 hover:scale-105"
          >
            Hire me
          </button>
          <div className="pointer-events-none text-right font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            <span style={{ color: accent }}>{String(active + 1).padStart(2, "0")}</span>
            <span className="text-white/55"> / {String(SECTIONS.length).padStart(2, "0")}</span>
            <div className="mt-1 text-white/90">{SECTIONS[active].label}</div>
          </div>
        </div>
      </div>

      {/* progress rail */}
      <div className="absolute bottom-24 left-5 top-24 hidden w-px bg-white/10 sm:left-8 md:block">
        <div ref={prog} className="h-full origin-top" style={{ background: accent, transform: "scaleY(0)" }} />
      </div>
      <div className="absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-5 font-mono text-[10px] uppercase tracking-widest text-white/55 sm:left-8">
        <span ref={pct} className="text-white/80">
          00
        </span>
        % scrolled
      </div>

      {/* section dots */}
      <nav className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex sm:right-8" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to ${s.label}`}
            className="pointer-events-auto group flex items-center justify-end gap-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/0 transition-all group-hover:text-white/80">
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-500 ${
                i === active ? "h-5 w-1.5" : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white"
              }`}
              style={i === active ? { background: accent } : undefined}
            />
          </button>
        ))}
      </nav>

      {/* toggles */}
      <div className="pointer-events-auto absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 flex items-center gap-2 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-8">
        <Toggle
          on={prefs.music}
          label="Music"
          onClick={() => {
            const n = !prefs.music;
            setPref("music", n);
            audio.toggle(n);
          }}
        >
          <span className="flex h-3.5 items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                ref={(el) => {
                  if (el) bars.current[i] = el;
                }}
                className="block h-full w-[2px] origin-bottom bg-current"
                style={{ transform: "scaleY(0.15)" }}
              />
            ))}
          </span>
        </Toggle>
        <Toggle
          on={prefs.fx}
          label="FX"
          onClick={() => {
            const n = !prefs.fx;
            setPref("fx", n);
            if (n) setTimeout(() => audio.toggle(true), 80);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            {prefs.fx && <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
          </svg>
        </Toggle>
        <Toggle
          on={prefs.haptics}
          label="Haptics"
          onClick={() => {
            const n = !prefs.haptics;
            setPref("haptics", n);
            if (n) setTimeout(() => H.success(), 50);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="3" width="8" height="18" rx="2" />
            <path d="M4 8v8M20 8v8" />
          </svg>
        </Toggle>
      </div>
    </div>
  );
}
