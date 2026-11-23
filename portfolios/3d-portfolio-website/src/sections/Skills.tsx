import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { skillGroups } from "../data";
import { SectionLabel, TiltCard } from "../components/ui";
import { audio } from "../lib/audio";

type Item = { name: string; level?: number; hue: string };

function SkillSphere({ items }: { items: Item[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);

  const pts = useMemo(
    () =>
      items.map((_, i) => {
        const n = items.length;
        const y = 1 - (i / (n - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = i * 2.399963;
        return [Math.cos(th) * r, y, Math.sin(th) * r] as const;
      }),
    [items]
  );

  useEffect(() => {
    const w = wrap.current!;
    const s = { rx: 0.25, ry: 0, vy: 0.004, vx: 0, drag: false, lx: 0, ly: 0 };
    const down = (e: PointerEvent) => {
      s.drag = true;
      s.lx = e.clientX;
      s.ly = e.clientY;
      audio.haptic("light");
    };
    const move = (e: PointerEvent) => {
      if (!s.drag) return;
      const dx = e.clientX - s.lx;
      const dy = e.clientY - s.ly;
      s.lx = e.clientX;
      s.ly = e.clientY;
      s.vy = dx * 0.006;
      s.vx = -dy * 0.006;
      s.ry += s.vy;
      s.rx += s.vx;
      if (Math.abs(dx) + Math.abs(dy) > 6) audio.tick(1 + Math.random() * 0.5);
    };
    const up = () => {
      s.drag = false;
    };
    w.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    const fn = () => {
      const R = w.clientWidth * 0.38;
      if (!s.drag) {
        s.ry += s.vy;
        s.rx += s.vx;
        s.vy += (0.004 - s.vy) * 0.02;
        s.vx *= 0.95;
        s.rx += (0.25 - s.rx) * 0.004;
      }
      const cy = Math.cos(s.ry),
        sy = Math.sin(s.ry),
        cx = Math.cos(s.rx),
        sx = Math.sin(s.rx);
      pts.forEach(([x, y, z], i) => {
        const el = els.current[i];
        if (!el) return;
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y1 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const d = (z2 + 1) / 2;
        el.style.transform = `translate(-50%,-50%) translate3d(${x1 * R}px,${y1 * R}px,0) scale(${0.6 + d * 0.7})`;
        el.style.opacity = String(0.2 + d * 0.8);
        el.style.zIndex = String(Math.round(d * 100));
      });
    };
    gsap.ticker.add(fn);
    return () => {
      gsap.ticker.remove(fn);
      w.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [pts]);

  return (
    <div ref={wrap} data-cursor="Drag" className="relative mx-auto aspect-square w-full max-w-[560px] select-none" style={{ touchAction: "pan-y" }}>
      <div className="absolute inset-[12%] rounded-full border border-white/10" />
      <div className="absolute inset-[26%] rounded-full border border-dashed border-white/10 spin-slow" />
      {items.map((it, i) => (
        <span
          key={it.name}
          ref={(el) => { els.current[i] = el; }}
          data-hover
          onPointerEnter={() => audio.note(((it.level ?? 3) - 1) * 2 + (i % 2))}
          className="mono absolute left-1/2 top-1/2 whitespace-nowrap rounded-full border bg-black/55 px-3 py-1.5 text-[11px] uppercase tracking-wider backdrop-blur-sm transition-colors hover:!bg-white hover:!text-black"
          style={{ borderColor: it.hue + "88", color: it.hue }}
        >
          {it.name}
        </span>
      ))}
    </div>
  );
}

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const items: Item[] = useMemo(() => skillGroups.flatMap((g) => g.items.map((s) => ({ ...s, hue: g.hue }))), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".skill-row").forEach((row) => {
        const dots = row.querySelectorAll(".dot-on");
        gsap.fromTo(
          dots,
          { scale: 0 },
          { scale: 1, stagger: 0.07, duration: 0.5, ease: "back.out(3)", scrollTrigger: { trigger: row, start: "top 92%", once: true } }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="skills" data-section="4" className="relative px-5 py-32 md:px-12 md:py-44">
      <SectionLabel n="04">Toolbox</SectionLabel>
      <h2 data-reveal className="font-display mb-6 text-[clamp(2.6rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter">
        Skills <span className="outline-text">&amp;</span> stack
      </h2>
      <p data-reveal className="mono mb-12 text-[11px] uppercase tracking-[0.3em] text-white/50">
        ↻ drag the sphere · hover tags to play them
      </p>

      <div data-reveal>
        <SkillSphere items={items} />
      </div>

      <div className="mt-24 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {skillGroups.map((g) => (
          <div key={g.title} data-reveal>
            <TiltCard tilt={5} className="glass h-full rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.hue, boxShadow: `0 0 16px ${g.hue}` }} />
                <h3 className="font-display text-xl font-bold tracking-tight">{g.title}</h3>
              </div>
              <ul className="space-y-2.5">
                {g.items.map((s) => (
                  <li
                    key={s.name}
                    data-hover
                    onPointerEnter={() => audio.tick(0.7 + (s.level ?? 3) * 0.18)}
                    className="skill-row flex items-center justify-between gap-3 text-sm text-white/80"
                  >
                    <span>{s.name}</span>
                    {s.level ? (
                      <span className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`h-1.5 w-1.5 rounded-full ${n <= s.level! ? "dot-on" : "bg-white/15"}`}
                            style={n <= s.level! ? { background: g.hue } : undefined}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="mono text-[9px] uppercase tracking-widest" style={{ color: g.hue }}>
                        core
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}
