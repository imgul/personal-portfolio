import { lessons, ventures } from "../../lib/data";
import { Arrow, Eyebrow, Split, TiltCard } from "../ui";

export default function Ventures() {
  return (
    <section data-section="ventures" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="02" label="Ventures & products" />
      <Split
        text="Things I've built, and [things] I'm building."
        className="max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
      />
      <p data-reveal className="mt-6 max-w-xl text-white/60">
        I want to own products, not just sell hours. Here's the portfolio — from a company to a handful of SaaS bets, with honest status labels.
      </p>

      <div data-stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1200 }}>
        {ventures.map((v, i) => {
          const Wrapper = v.url ? "a" : "div";
          const linkProps = v.url ? { href: v.url, target: "_blank", rel: "noreferrer", "data-cursor": "Visit" } : {};
          return (
            <TiltCard key={v.name} accent={v.accent} className={`rounded-3xl ${v.wide ? "lg:col-span-2" : ""}`}>
              <Wrapper {...linkProps} className="relative z-10 flex h-full flex-col p-6 sm:p-8" style={{ transform: "translateZ(30px)" }}>
                <div className="mb-10 flex items-start justify-between gap-4">
                  <span className="font-mono text-xs text-white/55">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
                    style={{ borderColor: `${v.accent}66`, color: v.accent, background: `${v.accent}14` }}
                  >
                    {v.status}
                  </span>
                </div>
                <h3 className="font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                  {v.name}
                  {v.url && <Arrow className="ml-2 inline h-6 w-6 -translate-y-1" />}
                </h3>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest" style={{ color: v.accent }}>
                  {v.role}
                </div>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-white/65 sm:text-base">{v.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {v.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </Wrapper>
            </TiltCard>
          );
        })}
      </div>

      {/* lessons */}
      <div className="mt-28">
        <div data-reveal className="mb-8 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-white/50">
          <span className="text-hot">Field notes</span>
          <span className="h-px flex-1 bg-white/15" />
          <span className="hidden sm:inline">what shipping &amp; selling taught me</span>
        </div>
        <div data-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lessons.map((l) => (
            <div key={l.n} className="group rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-md transition-colors duration-500 hover:border-hot/50">
              <div className="font-display text-5xl font-extrabold text-white/10 transition-colors duration-500 group-hover:text-hot">{l.n}</div>
              <h4 className="mt-4 font-display text-lg font-bold leading-tight">{l.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{l.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
