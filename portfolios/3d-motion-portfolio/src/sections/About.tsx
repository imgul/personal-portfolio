import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stats, summary } from "../data";
import { SectionHead, Tilt } from "../components/ui";
import { fx } from "../lib/fx";

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const num = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const o = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: num.current,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: value,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => {
            if (num.current) num.current.textContent = String(Math.round(o.v));
          },
        }),
    });
    return () => st.kill();
  }, [value]);

  return (
    <Tilt
      className="glass rounded-3xl p-6"
    >
      <div onPointerEnter={() => fx.haptic("tick")}>
        <div className="font-display text-5xl font-black md:text-6xl">
          <span ref={num} className="grad-text">0</span>
          <span className="text-[var(--accent2)]">{suffix}</span>
        </div>
        <p className="mt-3 text-sm leading-snug text-white/60">{label}</p>
      </div>
    </Tilt>
  );
}

export default function About() {
  const text = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const words = text.current?.querySelectorAll(".w");
    if (!words) return;
    const tw = gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: text.current, start: "top 78%", end: "bottom 55%", scrub: 0.6 },
      }
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);

  const words = summary.slice(0, 2).join(" ").split(" ");

  return (
    <section id="about" data-section className="relative px-5 py-32 md:px-12 md:py-48">
      <SectionHead index="01" label="About" title="Engineering with" outline="intent." />

      <div ref={text} className="max-w-5xl font-display text-[clamp(1.35rem,3.2vw,2.8rem)] font-semibold leading-[1.25] tracking-tight">
        {words.map((w, i) => (
          <span key={i} className="w inline-block pr-[0.28em]">
            {w}
          </span>
        ))}
      </div>

      <p data-reveal className="mt-10 max-w-2xl text-lg leading-relaxed text-white/65">
        {summary[2]}
      </p>

      <div data-reveal className="shimmer-border mt-10 inline-flex max-w-full items-center gap-4 rounded-2xl px-6 py-4">
        <span className="text-2xl">🌍</span>
        <span className="text-sm leading-snug text-white/85 md:text-base">
          Currently seeking <strong className="text-white">remote</strong> or <strong className="text-white">relocation</strong> opportunities in{" "}
          <span className="grad-text font-semibold">UAE / KSA</span>.
        </span>
      </div>

      <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
