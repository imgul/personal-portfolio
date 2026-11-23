import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutParagraphs, stats } from "../../lib/data";
import { Eyebrow, Split } from "../ui";

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
    <div className="spot glass rounded-3xl p-6 backdrop-blur-md">
      <div className="flex h-full flex-col justify-center">
        <div className="font-display text-5xl font-black md:text-6xl">
          <span ref={num} className="text-lime">
            0
          </span>
          <span className="text-violet">{suffix}</span>
        </div>
        <p className="mt-3 text-sm leading-snug text-white/60">{label}</p>
      </div>
    </div>
  );
}

export default function About() {
  const text = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const words = text.current?.querySelectorAll<HTMLElement>(".w");
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

  const words = aboutParagraphs.slice(0, 2).join(" ").split(" ");

  return (
    <section data-section="about" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="01" label="About" />
      <Split
        text="Engineering with [intent.]"
        className="max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
      />

      <div
        ref={text}
        className="mt-12 max-w-5xl font-display text-[clamp(1.35rem,3.2vw,2.6rem)] font-semibold leading-[1.3] tracking-tight"
      >
        {words.map((w, i) => (
          <span key={i} className="w inline-block pr-[0.28em]">
            {w}
          </span>
        ))}
      </div>

      <p data-reveal className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">
        {aboutParagraphs[2]}
      </p>

      <div data-reveal className="mt-10 inline-flex max-w-full items-center gap-4 rounded-2xl border border-lime/20 bg-lime/5 px-6 py-4 backdrop-blur-md">
        <span className="text-2xl">🌍</span>
        <span className="text-sm leading-snug text-white/85 md:text-base">
          Currently seeking <strong className="text-white">remote</strong> or <strong className="text-white">relocation</strong> opportunities in{" "}
          <span className="font-semibold text-lime">UAE / KSA</span>.
        </span>
      </div>

      <div data-stagger className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
