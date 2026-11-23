import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { audio } from "../lib/audio";
import { H, hapticsSupported } from "../lib/haptics";
import { setPref } from "../lib/prefs";
import { store } from "../lib/store";

const LOGS = [
  "mounting 3D core ........ ok",
  "compiling shaders ....... ok",
  "tuning audio engine ..... ok",
  "calibrating haptics ..... ok",
  "loading portfolio ....... ok",
];

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState(0);
  const leaving = useRef(false);

  useEffect(() => {
    const o = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from("[data-g-in]", { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" });
      tl.to(
        o,
        {
          v: 100,
          duration: 2.4,
          ease: "power2.inOut",
          onUpdate: () => {
            const v = Math.round(o.v);
            if (num.current) num.current.textContent = String(v).padStart(3, "0");
            if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`;
            setLines(Math.min(LOGS.length, Math.floor(o.v / 20) + (o.v >= 99 ? 0 : 0)));
          },
          onComplete: () => {
            setLines(LOGS.length);
            setReady(true);
          },
        },
        0.2
      );
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready) return;
    gsap.from("[data-g-btn]", { y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" });
  }, [ready]);

  const enter = (sound: boolean) => {
    if (leaving.current) return;
    leaving.current = true;
    setPref("music", sound);
    setPref("fx", sound);
    // audio must unlock inside the user gesture
    audio.unlock().then(() => {
      if (sound) audio.boot();
    });
    H.thud();
    store.pulse = 2;
    const tl = gsap.timeline({
      onComplete: () => {
        onEnter();
      },
    });
    tl.to("[data-g-in], [data-g-btn]", { y: -30, opacity: 0, stagger: 0.03, duration: 0.5, ease: "power3.in" });
    tl.to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut" }, "-=0.2");
  };

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink/80 p-6 backdrop-blur-xl sm:p-10 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div data-g-in className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
        <span>MG / Portfolio 2026</span>
        <span>Islamabad · PK</span>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <h1 data-g-in className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          An experience
          <br />
          you can <span className="text-lime">see, hear</span>
          <br />
          &amp; <span className="stroke-text">feel.</span>
        </h1>

        <div data-g-in className="mt-10 font-mono text-xs leading-6 text-white/55">
          {LOGS.slice(0, lines).map((l) => (
            <div key={l}>
              <span className="text-lime">›</span> {l}
            </div>
          ))}
        </div>

        <div data-g-in className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 overflow-hidden bg-white/15">
            <div ref={bar} className="h-full origin-left bg-lime" style={{ transform: "scaleX(0)" }} />
          </div>
          <span ref={num} className="font-mono text-sm tabular-nums text-lime">
            000
          </span>
        </div>

        <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${ready ? "" : "pointer-events-none opacity-0"}`}>
          <button
            data-g-btn
            data-magnetic
            onClick={() => enter(true)}
            className="group relative overflow-hidden rounded-full bg-lime px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-ink"
          >
            <span className="relative z-10">Enter · sound on</span>
            <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
          </button>
          <button
            data-g-btn
            data-magnetic
            onClick={() => enter(false)}
            className="rounded-full border border-white/25 px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Enter · silent
          </button>
        </div>
      </div>

      <div data-g-in className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
        <span>Best with headphones{hapticsSupported() ? " & a phone that buzzes" : ""}</span>
        <span>Scroll · Click · Hover · Press “M” for music</span>
      </div>
    </div>
  );
}
