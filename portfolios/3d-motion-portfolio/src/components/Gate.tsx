import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Gate({ onEnter, onGone }: { onEnter: (sound: boolean) => void; onGone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const o = { v: 0 };
    const tw = gsap.to(o, {
      v: 100,
      duration: 2.2,
      ease: "power2.inOut",
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(o.v)).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`;
      },
      onComplete: () => setReady(true),
    });
    const intro = gsap.fromTo(".gate-in", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1.1, ease: "expo.out" });
    return () => {
      tw.kill();
      intro.kill();
    };
  }, []);

  useEffect(() => {
    if (ready) gsap.fromTo(".gate-btn", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "expo.out" });
  }, [ready]);

  const enter = (sound: boolean) => {
    onEnter(sound);
    gsap.to(root.current, { yPercent: -100, duration: 1.4, ease: "expo.inOut", delay: 0.1, onComplete: onGone });
  };

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#06050b]/80 p-6 backdrop-blur-xl md:p-12">
      <div className="gate-in flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
        <span>MG — Portfolio</span>
        <span>2026</span>
      </div>

      <div className="mx-auto w-full max-w-3xl text-center">
        <div className="gate-in font-display text-[clamp(4rem,16vw,11rem)] font-black leading-none tracking-tight">
          <span ref={num} className="grad-text tabular-nums">000</span>
        </div>
        <div className="gate-in mx-auto mt-4 h-px w-full max-w-md overflow-hidden bg-white/15">
          <div ref={bar} className="h-full origin-left bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" style={{ transform: "scaleX(0)" }} />
        </div>
        <p className="gate-in mt-6 font-mono text-xs uppercase tracking-[0.25em] text-white/60">
          {ready ? "Experience ready" : "Tuning shaders · warming up synths"}
        </p>

        <div className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row ${ready ? "" : "pointer-events-none opacity-0"}`}>
          <button
            onClick={() => enter(true)}
            data-hover
            className="gate-btn group rounded-full bg-white px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:scale-105"
          >
            Enter with sound <span className="ml-1 inline-block transition group-hover:rotate-12">♪</span>
          </button>
          <button
            onClick={() => enter(false)}
            data-hover
            className="gate-btn rounded-full border border-white/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-white hover:text-white"
          >
            Enter silently
          </button>
        </div>
      </div>

      <div className="gate-in flex flex-col items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 md:flex-row">
        <span>🎧 Headphones recommended</span>
        <span>📳 Haptics on supported devices</span>
        <span>🖱 Move · scroll · click · hover everything</span>
      </div>
    </div>
  );
}
