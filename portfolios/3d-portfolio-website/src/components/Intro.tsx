import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

export default function Intro({ onEnter }: { onEnter: (sound: boolean) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const btns = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const text = "MUHAMMAD GULZAIB";
    const el = title.current!;
    let frame = 0;
    const iv = window.setInterval(() => {
      frame++;
      const reveal = Math.floor(frame / 3);
      el.textContent = text
        .split("")
        .map((c, i) => (c === " " ? " " : i < reveal ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join("");
      if (reveal >= text.length) window.clearInterval(iv);
    }, 40);

    const o = { v: 0 };
    const tw = gsap.to(o, {
      v: 100,
      duration: 2.4,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counter.current) counter.current.textContent = String(Math.round(o.v)).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`;
      },
      onComplete: () => setReady(true),
    });
    return () => {
      window.clearInterval(iv);
      tw.kill();
    };
  }, []);

  useEffect(() => {
    if (ready && btns.current) {
      gsap.fromTo(btns.current.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" });
    }
  }, [ready]);

  const enter = (sound: boolean) => {
    onEnter(sound);
    gsap.to(root.current, {
      clipPath: "inset(0 0 100% 0)",
      duration: 1.3,
      ease: "power4.inOut",
      delay: 0.15,
      onComplete: () => setGone(true),
    });
  };

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[200] flex flex-col justify-between bg-[#06060a] p-6 md:p-12" style={{ clipPath: "inset(0 0 0% 0)" }}>
      <div className="mono flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/50">
        <span>Portfolio / 2026</span>
        <span>Islamabad, PK</span>
      </div>

      <div className="flex flex-col items-center text-center">
        <p className="mono mb-6 text-xs uppercase tracking-[0.35em] text-white/50">Senior Full Stack Engineer</p>
        <h1 ref={title} className="font-display text-[clamp(2rem,8vw,6.5rem)] font-extrabold leading-none tracking-tighter">
          &nbsp;
        </h1>

        <div ref={btns} className="mt-14 flex min-h-[120px] flex-col items-center gap-4" style={{ visibility: ready ? "visible" : "hidden" }}>
          <button
            onClick={() => enter(true)}
            className="group relative overflow-hidden rounded-full bg-accent px-9 py-4 text-sm font-semibold uppercase tracking-widest text-black transition hover:scale-105"
          >
            Enter with sound <span className="ml-1">♪</span>
          </button>
          <button onClick={() => enter(false)} className="mono text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white">
            Enter silent
          </button>
          <p className="mono max-w-sm text-[10px] uppercase leading-relaxed tracking-[0.2em] text-white/30">
            Best with headphones. Haptic feedback on supported mobile devices.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-4 h-px w-full bg-white/10">
          <div ref={bar} className="h-px origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="flex items-end justify-between">
          <span className="mono text-[11px] uppercase tracking-[0.3em] text-white/50">{ready ? "Ready" : "Loading experience"}</span>
          <span ref={counter} className="font-display text-6xl font-extrabold leading-none md:text-8xl">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
