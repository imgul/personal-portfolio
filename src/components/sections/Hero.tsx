import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { marquee, rotating } from "../../lib/data";
import { store } from "../../lib/store";

function Word({ text, offset, base, className = "" }: { text: string; offset: number; base: string; className?: string }) {
  return (
    <div className={`flex ${className}`} style={{ perspective: 800 }} aria-hidden="true">
      {text.split("").map((c, i) => (
        <span key={i} data-char data-base={base} data-sfx data-note={offset + i} data-nohaptic className="inline-block will-change-transform">
          <span data-char-in className="inline-block">
            {c}
          </span>
        </span>
      ))}
    </div>
  );
}

function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current!;
    let x = 0;
    let dir = 1;
    const tick = () => {
      const half = el.scrollWidth / 2;
      const v = store.vel;
      if (Math.abs(v) > 0.4) dir = v > 0 ? 1 : -1;
      x -= (0.7 + Math.min(Math.abs(v) * 0.35, 18)) * dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  const items = [...marquee, ...marquee];
  return (
    <div className="relative border-y border-white/10 bg-black/30 py-5 backdrop-blur-sm" aria-hidden="true">
      <div ref={track} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((m, i) => (
              <span key={i} className="flex items-center font-display text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
                <span className={i % 3 === 1 ? "stroke-text" : i % 3 === 2 ? "text-lime" : "text-paper"}>{m}</span>
                <span className="mx-6 text-hot sm:mx-10">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero({ entered }: { entered: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [wi, setWi] = useState(0);

  // rotating word
  useEffect(() => {
    const id = setInterval(() => setWi((i) => (i + 1) % rotating.length), 2400);
    return () => clearInterval(id);
  }, []);

  // proximity hover on letters
  useEffect(() => {
    const chars = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-char]"));
    const cur = chars.map(() => ({ y: 0, s: 1, k: 0 }));
    const tick = () => {
      if (store.scrollY > window.innerHeight) return;
      const { x: mx, y: my } = store.mouse;
      chars.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const inf = Math.max(0, 1 - d / 240);
        const c = cur[i];
        c.y += (-inf * 34 - c.y) * 0.14;
        c.s += (1 + inf * 0.1 - c.s) * 0.14;
        c.k += (inf - c.k) * 0.18;
        el.style.transform = `translate3d(0,${c.y.toFixed(2)}px,0) scale(${c.s.toFixed(3)})`;
        el.style.color = c.k > 0.02 ? `color-mix(in srgb, #c6ff3d ${(c.k * 100).toFixed(0)}%, ${el.dataset.base})` : "";
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // entrance
  useEffect(() => {
    const fromChars = { yPercent: 120, opacity: 0, rotateX: -80 };
    const fromIn = { y: 30, opacity: 0 };
    const ctx = gsap.context(() => {
      if (!entered) {
        gsap.set("[data-char-in]", fromChars);
        gsap.set("[data-hero-in]", fromIn);
        return;
      }
      const tl = gsap.timeline({ delay: 0.35 });
      tl.fromTo(
        "[data-char-in]",
        fromChars,
        { yPercent: 0, opacity: 1, rotateX: 0, stagger: 0.045, duration: 1.3, ease: "expo.out" }
      );
      tl.fromTo(
        "[data-hero-in]",
        fromIn,
        { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out" },
        "-=0.8"
      );
    }, root);
    return () => ctx.revert();
  }, [entered]);

  return (
    <div data-section="intro">
      <section ref={root} className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 sm:px-10 md:px-16 lg:pl-24">
        <div data-hero-in className="mb-8 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
          <span className="flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1.5 text-lime">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-lime" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            Open to remote · UAE · KSA
          </span>
          <span className="hidden sm:inline">Founder &amp; CEO — SynergyFlow Labs</span>
        </div>

        <h1 className="font-display font-extrabold uppercase leading-[0.86] tracking-[-0.03em]" style={{ fontSize: "clamp(3rem, 12.4vw, 12rem)" }}>
          <span className="sr-only">Muhammad Gulzaib</span>
          <Word text="MUHAMMAD" offset={0} base="#eae9f2" />
          <Word text="GULZAIB" offset={8} base="transparent" className="stroke-text" />
        </h1>

        <div className="mt-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p data-hero-in className="max-w-xl font-display text-xl font-bold leading-tight sm:text-3xl">
              Senior Full Stack Engineer
              <span className="text-white/40"> who builds</span>
              <span className="mt-1 block h-[1.2em] overflow-hidden text-lime" style={{ perspective: 600 }}>
                <span key={wi} className="inline-block animate-wordin">
                  {rotating[wi]}
                </span>
              </span>
            </p>
            <p data-hero-in className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
              Laravel · React · AI systems · SaaS. 5+ years turning ideas into products people pay for — and now building a company around them.
            </p>
          </div>

          <div data-hero-in className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
            <div className="relative h-14 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-lime" style={{ animation: "scroll-cue 1.8s cubic-bezier(.6,0,.3,1) infinite" }} />
            </div>
            <div>
              Scroll to
              <br />
              explore
            </div>
          </div>
        </div>
        <p data-hero-in className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 sm:text-[11px]">
          ↑ Hover the letters — they play notes
        </p>
      </section>
      <Marquee />
    </div>
  );
}
