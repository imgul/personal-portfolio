import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experience } from "../../lib/data";
import { Arrow, Eyebrow, Split } from "../ui";

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top 60%", end: "bottom 60%", scrub: 0.4 },
        }
      );
      gsap.utils.toArray<HTMLElement>("[data-job]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          end: "bottom 62%",
          toggleClass: { targets: el, className: "is-on" },
        });
        gsap.from(el.querySelectorAll("[data-job-in]"), {
          y: 40,
          opacity: 0,
          stagger: 0.09,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-section="journey" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="04" label="Experience" />
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Split
            text="A [journey] from freelancer to founder."
            className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl"
          />
          <p data-reveal className="mt-6 max-w-sm text-white/60">
            Six chapters across agencies, product studios, remote freelancing and my own company. Scroll — the timeline lights up as you go.
          </p>
        </div>

        <div ref={list} className="relative pl-8 sm:pl-12">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 sm:left-[11px]" />
          <div ref={line} className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-lime shadow-[0_0_14px_#c6ff3d] sm:left-[11px]" />

          {experience.map((j, i) => (
            <article key={j.company + j.period} data-job className="group relative pb-16 last:pb-0 [&.is-on_.dot]:scale-125 [&.is-on_.dot]:bg-lime [&.is-on_.card]:border-lime/40 [&.is-on_.card]:bg-white/[0.06]">
              <span className="dot absolute -left-8 top-2 h-[15px] w-[15px] rounded-full border-2 border-lime bg-ink transition-all duration-500 sm:-left-12 sm:h-[23px] sm:w-[23px] sm:top-1.5" />
              <div className="card rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-md transition-all duration-500 sm:p-8">
                <div data-job-in className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-widest text-lime">
                  <span>{j.period}</span>
                  <span className="text-white/40">
                    {String(i + 1).padStart(2, "0")} · {j.location}
                  </span>
                </div>
                <h3 data-job-in className="mt-4 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                  {j.position}
                </h3>
                <div data-job-in className="mt-1 text-white/60">
                  {j.url ? (
                    <a href={j.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline decoration-white/20 underline-offset-4 hover:text-lime">
                      {j.company} <Arrow className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    j.company
                  )}
                </div>
                <ul className="mt-5 space-y-2.5">
                  {j.points.map((p) => (
                    <li key={p} data-job-in className="flex gap-3 text-sm leading-relaxed text-white/65 sm:text-[15px]">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
