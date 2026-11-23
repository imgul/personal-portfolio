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
    <div className="glass rounded-2xl p-5">
      <div className="font-display text-5xl font-extrabold text-lime sm:text-6xl">
        <span ref={num}>0</span>
        {suffix}
      </div>
      <div className="mt-2 text-xs leading-snug text-white/55 sm:text-sm">{label}</div>
    </div>
  );
}

export default function About() {
  return (
    <section data-section="about" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="01" label="About" />
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Split
            text="I don't just write code — I build [products] that earn their keep."
            className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          />
          <div data-stagger className="mt-10 max-w-2xl space-y-5 text-base leading-relaxed text-white/70 sm:text-lg">
            {aboutParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="text-white">
              Currently open to <span className="text-lime">remote roles</span> and <span className="text-lime">relocation to UAE / KSA</span> — and always
              up for a conversation about startups.
            </p>
          </div>
          <div data-stagger className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:gap-4">
            {stats.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </div>

        <div className="lg:pt-80">
          <div data-reveal className="glass rounded-2xl p-5 font-mono text-[12px] leading-6 sm:text-[13px]">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-hot" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffb23d]" />
              <span className="h-2.5 w-2.5 rounded-full bg-lime" />
              <span className="ml-3 text-white/40">now.json</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-white/75">
              <span className="text-white/40">{"{"}</span>
              {"\n  "}
              <span className="text-cyan">"role"</span>: <span className="text-lime">"Founder & CEO, SynergyFlow Labs"</span>,{"\n  "}
              <span className="text-cyan">"cto_at"</span>: <span className="text-lime">"Sehat Bunyad"</span>,{"\n  "}
              <span className="text-cyan">"building"</span>: [<span className="text-lime">"Oxygen LMS"</span>, <span className="text-lime">"AnySub"</span>,{" "}
              <span className="text-lime">"ZeroExam AI"</span>],{"\n  "}
              <span className="text-cyan">"obsessed_with"</span>: [<span className="text-lime">"Agentic AI"</span>, <span className="text-lime">"RAG"</span>],
              {"\n  "}
              <span className="text-cyan">"open_to"</span>: [<span className="text-lime">"Remote"</span>, <span className="text-lime">"UAE"</span>,{" "}
              <span className="text-lime">"KSA"</span>],{"\n  "}
              <span className="text-cyan">"based_in"</span>: <span className="text-lime">"Islamabad, PK"</span>
              {"\n"}
              <span className="text-white/40">{"}"}</span>
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-lime" />
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
