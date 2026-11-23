import { education, certifications } from "../data";
import { SectionLabel, TiltCard } from "../components/ui";
import { audio } from "../lib/audio";

export default function Education() {
  return (
    <section id="education" data-section="5" className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionLabel n="05">Education &amp; certifications</SectionLabel>
      <h2 data-reveal className="font-display mb-16 text-[clamp(2.6rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter">
        Always <span className="outline-text">learning</span>
      </h2>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div data-reveal>
          <TiltCard tilt={3} className="glass h-full rounded-[2rem] p-7 md:p-10">
            <div className="mono flex items-center justify-between text-[11px] uppercase tracking-widest text-white/60">
              <span>{education.period}</span>
              <span className="accent">{education.grade}</span>
            </div>
            <h3 className="font-display mt-6 text-4xl font-extrabold leading-[1] tracking-tight md:text-5xl">{education.degree}</h3>
            <a href={education.url} target="_blank" rel="noreferrer" className="accent mt-3 inline-block text-lg hover:underline">
              {education.school} ↗
            </a>
            <p className="mono mt-1 text-xs uppercase tracking-widest text-white/50">{education.area}</p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {education.highlights.map((h) => (
                <li key={h.role} data-hover onPointerEnter={() => audio.tick(1.2)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/30 hover:bg-white/[0.07]">
                  <div className="text-sm font-semibold">{h.role}</div>
                  <div className="mt-1 text-xs leading-relaxed text-white/55">{h.org}</div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2">
              {education.learned.map((l) => (
                <span key={l} className="mono rounded-full bg-white/[0.07] px-3 py-1 text-[10px] uppercase tracking-widest text-white/65">
                  {l}
                </span>
              ))}
            </div>
          </TiltCard>
        </div>

        <div data-reveal className="glass rounded-[2rem] p-3 md:p-4">
          <div className="mono px-4 pb-2 pt-3 text-[11px] uppercase tracking-widest text-white/50">Certifications · {certifications.length}</div>
          <ul>
            {certifications.map((c, i) => (
              <li
                key={c.title}
                data-hover
                onPointerEnter={() => audio.note(i)}
                className="group relative flex items-start justify-between gap-4 overflow-hidden rounded-2xl px-4 py-4 transition-colors hover:bg-white hover:text-black"
              >
                <div>
                  <div className="text-[15px] font-medium leading-snug">{c.title}</div>
                  <div className="mono mt-1 text-[10px] uppercase tracking-widest text-white/50 group-hover:text-black/60">{c.issuer}</div>
                </div>
                <span className="mono shrink-0 pt-0.5 text-[10px] uppercase tracking-widest accent group-hover:!text-black">{c.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
