import { interests, languages } from "../../lib/data";
import { Eyebrow, Split, TiltCard } from "../ui";

export default function Beyond() {
  return (
    <section data-section="beyond" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="07" label="Beyond the keyboard" />
      <Split
        text="What keeps me [curious] when the laptop closes."
        className="max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
      />

      <div data-stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1200 }}>
        {interests.map((it, i) => (
          <TiltCard key={it.name} accent={["#c6ff3d", "#8b6cff", "#3de8ff", "#ff5c8a", "#ffb23d", "#3dffb0"][i]} className="rounded-3xl" max={10}>
            <div className="relative z-10 p-6 sm:p-8">
              <div className="font-display text-5xl text-lime transition-transform duration-500 hover:rotate-12">{it.icon}</div>
              <h3 className="mt-8 font-display text-xl font-bold">{it.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{it.text}</p>
            </div>
          </TiltCard>
        ))}
      </div>

      <div data-reveal className="mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
        {languages.map((l) => (
          <div key={l.name} className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-extrabold">{l.name}</span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-lime">{l.level}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-lime to-violet" style={{ width: `${l.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
