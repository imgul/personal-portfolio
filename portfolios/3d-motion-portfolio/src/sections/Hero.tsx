import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { profile, roles } from "../data";
import { fx } from "../lib/fx";
import { scrollTo } from "../lib/scroll";
import { Clock } from "../components/ui";

function Chars({ text, base, outline }: { text: string; base: number; outline?: boolean }) {
  const onEnter = (e: React.PointerEvent<HTMLSpanElement>, i: number) => {
    gsap.fromTo(
      e.currentTarget,
      { y: 0, rotate: 0, scale: 1 },
      { y: -18, rotate: (i % 2 ? 1 : -1) * 6, scale: 1.1, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }
    );
    fx.note(base + i, 4);
    fx.haptic("tick");
  };
  return (
    <span className="flex" aria-label={text}>
      {[...text].map((c, i) => (
        <span
          key={i}
          aria-hidden
          data-hover
          onPointerEnter={(e) => onEnter(e, i)}
          className={`hero-char inline-block will-change-transform transition-colors duration-300 ${
            outline ? "text-outline hover:!text-[var(--accent)]" : "hover:text-[var(--accent2)]"
          }`}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

export default function Hero({ entered }: { entered: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [role, setRole] = useState(0);
  const roleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.set(".hero-char", { opacity: 0, yPercent: 110, rotateX: -80 });
    gsap.set(".hero-fade", { opacity: 0, y: 24 });
  }, []);

  useEffect(() => {
    if (!entered) return;
    const tl = gsap.timeline({ delay: 0.7 });
    tl.to(".hero-char", { opacity: 1, yPercent: 0, rotateX: 0, duration: 1.3, ease: "expo.out", stagger: 0.045 }, 0)
      .to(".hero-fade", { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.12 }, 0.5);
    return () => {
      tl.kill();
    };
  }, [entered]);

  useEffect(() => {
    if (!entered) return;
    const id = window.setInterval(() => setRole((r) => (r + 1) % roles.length), 2600);
    return () => window.clearInterval(id);
  }, [entered]);

  useEffect(() => {
    if (!entered || !roleRef.current) return;
    gsap.fromTo(roleRef.current, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out" });
  }, [role, entered]);

  // gentle parallax of the title with the pointer
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(".hero-title");
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "power3" });
    const move = (e: PointerEvent) => {
      xTo((e.clientX / window.innerWidth - 0.5) * -30);
      yTo((e.clientY / window.innerHeight - 0.5) * -20);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <section ref={root} id="hero" data-section className="relative flex min-h-[100svh] flex-col justify-between px-5 pb-20 pt-28 md:px-12 md:pb-24">
      <div className="hero-fade flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
        <span className="glass inline-flex items-center gap-3 rounded-full px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Open to remote · UAE · KSA
        </span>
        <span className="hidden sm:inline">
          {profile.location} — <Clock />
        </span>
      </div>

      <div>
        <h1 className="hero-title font-display text-[clamp(2.4rem,10.4vw,11rem)] font-black uppercase leading-[0.88] tracking-tighter [perspective:800px]">
          <Chars text="Muhammad" base={0} />
          <Chars text="Gulzaib" base={3} outline />
        </h1>

        <div className="mt-8 grid items-end gap-8 md:mt-12 md:grid-cols-[1fr_auto]">
          <div className="hero-fade max-w-xl">
            <div className="flex items-center gap-3 font-display text-lg font-semibold md:text-2xl">
              <span className="text-white/60">I'm a</span>
              <span className="relative inline-block h-[1.4em] overflow-hidden">
                <span ref={roleRef} className="grad-text inline-block whitespace-nowrap">
                  {roles[role]}
                </span>
              </span>
            </div>
            <p className="mt-4 text-base leading-relaxed text-white/65 md:text-lg">
              Senior Full Stack Engineer crafting scalable SaaS platforms and AI-powered products — from Laravel back-ends to buttery React interfaces.
            </p>
          </div>

          <button
            onClick={() => {
              fx.haptic("tap");
              scrollTo("#about");
            }}
            data-hover
            data-cursor="Scroll"
            className="hero-fade group flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/70"
          >
            Scroll to explore
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 transition group-hover:border-[var(--accent2)] group-hover:bg-[var(--accent2)]/15">
              <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
