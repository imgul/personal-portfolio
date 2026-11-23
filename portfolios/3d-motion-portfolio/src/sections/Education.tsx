import { certifications, education } from "../data";
import { ArrowUpRight, SectionHead, Tilt } from "../components/ui";
import { fx } from "../lib/fx";

export default function Education() {
  return (
    <section id="education" data-section className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionHead index="05" label="Learning" title="Always" outline="leveling up." />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div data-reveal>
          <Tilt max={4} className="glass rounded-[2rem] p-7 md:p-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent2)]">{education.period}</div>
            <h3 className="mt-3 font-display text-3xl font-black leading-tight md:text-4xl">{education.degree}</h3>
            <a
              href={education.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-white/75 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-[var(--accent2)]"
            >
              {education.school} <ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-black">
                {education.grade}
              </span>
              <span className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70">{education.area}</span>
            </div>

            <ul className="mt-7 space-y-3 text-sm leading-relaxed text-white/70">
              {education.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <span className="text-[var(--accent2)]">✲</span>
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-6">
              {education.learned.map((l) => (
                <span key={l} className="rounded-full bg-white/8 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70">
                  {l}
                </span>
              ))}
            </div>
          </Tilt>
        </div>

        <div data-reveal>
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">Certifications — {certifications.length}</div>
          <div className="border-t border-white/15">
            {certifications.map((c, i) => (
              <div
                key={c.title}
                data-hover
                onPointerEnter={() => {
                  fx.note(i, 2);
                  fx.haptic("tick");
                }}
                className="group relative flex items-start gap-4 border-b border-white/15 py-5 transition-all duration-300 hover:bg-white/[0.04] hover:pl-4"
              >
                <span className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-[var(--accent2)] transition-transform duration-300 group-hover:scale-y-100" />
                <span className="pt-0.5 font-mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold leading-snug md:text-base">{c.title}</div>
                  <div className="mt-1 text-sm text-white/50">{c.issuer}</div>
                </div>
                <span className="whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-wider text-white/50 transition group-hover:text-[var(--accent2)]">
                  {c.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
