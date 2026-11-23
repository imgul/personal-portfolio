import gsap from "gsap";
import { interests, languages } from "../data";
import { SectionHead, Tilt } from "../components/ui";
import { fx } from "../lib/fx";

export default function Beyond() {
  const wiggle = (e: React.PointerEvent<HTMLElement>) => {
    const icon = e.currentTarget.querySelector(".icon");
    if (icon) gsap.fromTo(icon, { rotate: 0, scale: 1 }, { rotate: 14, scale: 1.35, duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" });
    fx.haptic("tick");
  };

  return (
    <section id="beyond" data-section className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionHead index="06" label="Beyond code" title="What drives" outline="me." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((it, i) => (
          <div key={it.name} data-reveal>
            <Tilt max={7} className="glass h-full rounded-3xl p-7">
              <div onPointerEnter={(e) => { wiggle(e); fx.note(i + 2, 3); }} data-hover className="flex h-full flex-col">
                <span className="icon inline-block text-5xl">{it.icon}</span>
                <h3 className="mt-6 font-display text-lg font-bold md:text-xl">{it.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{it.text}</p>
              </div>
            </Tilt>
          </div>
        ))}
      </div>

      <div data-reveal className="mt-14 grid gap-5 md:grid-cols-2">
        {languages.map((l) => (
          <div key={l.name} className="glass rounded-3xl p-6">
            <div className="flex items-end justify-between">
              <span className="font-display text-2xl font-black">{l.name}</span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent2)]">{l.fluency}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" style={{ width: `${l.level * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
