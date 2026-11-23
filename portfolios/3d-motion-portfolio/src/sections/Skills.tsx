import { useRef, useState } from "react";
import gsap from "gsap";
import { skillGroups } from "../data";
import { SectionHead } from "../components/ui";
import { fx } from "../lib/fx";
import { pulse } from "../lib/world";

const flat = skillGroups.flatMap((g, gi) => g.skills.map((s) => ({ ...s, group: gi })));

export default function Skills() {
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const bounce = (el: Element) =>
    gsap.fromTo(el, { scale: 1 }, { scale: 1.12, y: -6, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" });

  const hit = (i: number, el: Element) => {
    fx.note(i, flat[i].level);
    fx.haptic("tick");
    bounce(el);
  };

  const playAll = () => {
    if (playing) return;
    if (!fx.soundOn) fx.setSound(true);
    fx.haptic("success");
    setPlaying(true);
    const chips = wrap.current!.querySelectorAll<HTMLElement>(".chip");
    chips.forEach((chip, i) => {
      const id = window.setTimeout(() => {
        chip.classList.add("chip-lit");
        hit(i, chip);
        pulse(0.35);
        window.setTimeout(() => chip.classList.remove("chip-lit"), 260);
        if (i === chips.length - 1) {
          fx.success();
          setPlaying(false);
        }
      }, 400 + i * 150);
      timers.current.push(id);
    });
  };

  let idx = -1;
  return (
    <section id="skills" data-section className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionHead index="04" label="Toolbox" title="My stack," outline="playable." />

      <div data-reveal className="mb-14 flex flex-col gap-5 sm:flex-row sm:items-center">
        <button
          onClick={playAll}
          data-hover
          disabled={playing}
          className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-7 py-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:scale-105 disabled:opacity-60"
        >
          <span className="text-base">{playing ? "♫" : "▶"}</span> {playing ? "Playing my stack…" : "Play my stack"}
        </button>
        <p className="max-w-md text-sm text-white/55">Every technology is a note. Hover or tap a chip to hear it — higher proficiency rings longer.</p>
      </div>

      <div ref={wrap} className="grid gap-x-12 gap-y-14 lg:grid-cols-2">
        {skillGroups.map((g, gi) => (
          <div key={g.name} data-reveal>
            <div className="mb-5 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
              <span className="text-[var(--accent2)]">0{gi + 1}</span>
              {g.name}
              <span className="h-px flex-1 bg-white/15" />
            </div>
            <div className="flex flex-wrap gap-3">
              {g.skills.map((s) => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={s.name}
                    data-hover
                    onPointerEnter={(e) => hit(i, e.currentTarget)}
                    className="chip glass group relative overflow-hidden rounded-2xl px-5 py-3.5 text-left transition-colors hover:border-[var(--accent2)]"
                  >
                    <span
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent)]/25 to-transparent transition-all duration-500 group-hover:from-[var(--accent)]/45"
                      style={{ width: `${s.level * 20}%` }}
                    />
                    <span className="relative block font-display text-sm font-semibold md:text-base">{s.name}</span>
                    <span className="relative mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <i key={d} className={`h-1 w-4 rounded-full ${d <= s.level ? "bg-[var(--accent2)]" : "bg-white/15"}`} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
