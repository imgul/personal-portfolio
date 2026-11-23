import { useEffect, useRef } from "react";
import gsap from "gsap";
import { certs, education } from "../../lib/data";
import { Eyebrow } from "../ui";

export default function Credentials() {
  const pin = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      gsap.to(track.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          pin: true,
          scrub: 0.6,
          start: "top top",
          end: () => "+=" + dist(),
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    }, pin);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <div data-section="credentials">
      <section ref={pin} className="relative flex h-screen h-[100svh] flex-col justify-center overflow-hidden">
        <div className="px-5 sm:px-10 md:px-16 lg:pl-24">
          <Eyebrow n="06" label="Education & certifications" />
        </div>

        <div ref={track} className="flex w-max items-stretch gap-5 px-5 will-change-transform sm:gap-8 sm:px-10 md:px-16 lg:pl-24">
          {/* education */}
          <article className="glass flex w-[86vw] shrink-0 flex-col justify-between rounded-3xl p-6 sm:w-[560px] sm:p-9 max-h-[68vh] overflow-hidden">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-lime">
                {education.period} · {education.grade}
              </div>
              <h3 className="mt-4 font-display text-3xl font-extrabold leading-[1.02] sm:text-5xl">{education.degree}</h3>
              <div className="mt-2 text-white/60">{education.school}</div>
            </div>
            <ul className="mt-6 space-y-2.5 overflow-hidden">
              {education.points.map((p) => (
                <li key={p} className="flex gap-3 text-[13px] leading-relaxed text-white/65 max-sm:[&:nth-child(n+4)]:hidden sm:text-sm">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" />
                  {p}
                </li>
              ))}
            </ul>
          </article>

          {/* certs */}
          {certs.map((c, i) => (
            <article
              key={c.title}
              data-sfx
              className="spot group relative flex w-[72vw] shrink-0 flex-col justify-between rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-md transition-colors duration-500 hover:border-lime/50 sm:w-[340px] sm:p-8"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
                e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-6xl font-extrabold text-white/10 transition-colors duration-500 group-hover:text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-2xl text-lime transition-transform duration-700 group-hover:rotate-180">✦</span>
              </div>
              <div>
                <h4 className="mt-10 font-display text-lg font-bold leading-snug sm:text-xl">{c.title}</h4>
                <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-white/50">
                  <span>{c.issuer}</span>
                  <span className="text-lime">{c.date}</span>
                </div>
              </div>
            </article>
          ))}

          {/* end card */}
          <article className="flex w-[80vw] shrink-0 flex-col justify-center pr-10 sm:w-[420px]">
            <div className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
              Still <span className="stroke-text">learning.</span>
              <br />
              Always <span className="text-lime">shipping.</span>
            </div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">Next up → Beyond the keyboard</div>
          </article>
        </div>

        <div className="mt-10 px-5 sm:px-10 md:px-16 lg:pl-24">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span>Keep scrolling →</span>
            <div className="h-px max-w-xs flex-1 bg-white/15">
              <div ref={bar} className="h-full origin-left bg-lime" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
