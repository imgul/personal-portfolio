import { interests } from "../data";
import { SectionLabel, TiltCard } from "../components/ui";
import { audio } from "../lib/audio";

export default function Interests() {
  return (
    <section id="interests" data-section="6" className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionLabel n="06">Beyond the code</SectionLabel>
      <h2 data-reveal className="font-display mb-16 text-[clamp(2.6rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter">
        What <span className="outline-text">drives</span> me
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((it, i) => (
          <div key={it.name} data-reveal>
            <TiltCard tilt={9} data-hover onPointerEnter={() => audio.note(i * 2)} className="glass group h-full min-h-[240px] rounded-3xl p-7">
              <div className="flex h-full flex-col justify-between gap-10">
                <div className="flex items-start justify-between">
                  <span className="font-display outline-text text-6xl font-extrabold leading-none tracking-tighter transition-all duration-500 group-hover:text-[var(--accent)] group-hover:[-webkit-text-stroke-color:transparent]">
                    {it.glyph}
                  </span>
                  <span className="accent text-2xl transition-transform duration-700 group-hover:rotate-180">✲</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{it.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{it.text}</p>
                </div>
              </div>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}
