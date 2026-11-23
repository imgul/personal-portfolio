import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { skillGroups } from "../../lib/data";
import { audio } from "../../lib/audio";
import { H } from "../../lib/haptics";
import { Eyebrow, Split } from "../ui";

const COLORS = ["#c6ff3d", "#8b6cff", "#3de8ff", "#ff5c8a", "#ffb23d"];

/** Interactive 3D tag sphere: drag to spin, scroll-velocity gives it a kick. */
function TagSphere({ words }: { words: string[] }) {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<HTMLSpanElement[]>([]);

  const points = useMemo(
    () =>
      words.map((_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / words.length);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)] as const;
      }),
    [words]
  );

  useEffect(() => {
    const el = box.current!;
    let rx = 0.2;
    let ry = 0;
    let vx = 0;
    let vy = 0.004;
    let drag = false;
    let lx = 0;
    let ly = 0;
    let hover = false;
    let size = el.clientWidth;
    const ro = new ResizeObserver(() => (size = el.clientWidth));
    ro.observe(el);

    const down = (e: PointerEvent) => {
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag) {
        vy = (e.clientX - lx) * 0.0016;
        vx = -(e.clientY - ly) * 0.0016;
        lx = e.clientX;
        ly = e.clientY;
      } else if (hover) {
        const r = el.getBoundingClientRect();
        vy += (((e.clientX - r.left) / r.width - 0.5) * 0.004 - vy) * 0.05;
        vx += (-((e.clientY - r.top) / r.height - 0.5) * 0.004 - vx) * 0.05;
      }
    };
    const up = () => (drag = false);
    const enter = () => (hover = true);
    const leave = () => {
      hover = false;
      drag = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);

    let lastNear = -1;
    const tick = () => {
      if (!drag) {
        vx *= 0.96;
        vy += (0.004 - vy) * 0.02;
      }
      rx += vx;
      ry += vy;
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const rad = size * (size < 640 ? 0.3 : 0.36);
      let near = -1;
      let nearZ = -2;
      points.forEach(([x, y, z], i) => {
        // rotate around Y then X
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y1 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const s = 0.55 + (z2 + 1) * 0.35;
        const node = els.current[i];
        if (node) {
          node.style.transform = `translate3d(calc(-50% + ${(x1 * rad).toFixed(1)}px), calc(-50% + ${(y1 * rad).toFixed(1)}px), 0) scale(${s.toFixed(3)})`;
          node.style.opacity = String(0.18 + ((z2 + 1) / 2) * 0.82);
          node.style.zIndex = String(Math.round((z2 + 1) * 50));
        }
        if (z2 > nearZ) {
          nearZ = z2;
          near = i;
        }
      });
      if (near !== lastNear && nearZ > 0.92) {
        lastNear = near;
        audio.tick(near);
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [points]);

  return (
    <div ref={box} data-cursor="Drag" className="relative mx-auto aspect-square w-full max-w-[520px] touch-pan-y select-none overflow-hidden">
      <div className="absolute inset-[12%] rounded-full border border-white/10" />
      <div className="absolute inset-[26%] rounded-full border border-dashed border-white/10" />
      {words.map((w, i) => (
        <span
          key={w}
          ref={(n) => {
            if (n) els.current[i] = n;
          }}
          className="tag-cloud-word text-[11px] sm:text-lg"
          style={{ color: COLORS[i % COLORS.length] }}
        >
          {w}
        </span>
      ))}
    </div>
  );
}

export default function Skills() {
  const [tab, setTab] = useState(0);
  const group = skillGroups[tab];
  const words = useMemo(() => skillGroups.flatMap((g) => g.items.map((i) => i.n)), []);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(
      panel.current.querySelectorAll("[data-skill]"),
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.04, duration: 0.6, ease: "power3.out" }
    );
  }, [tab]);

  return (
    <section data-section="stack" className="relative px-5 py-28 sm:px-10 md:px-16 lg:pl-24 lg:py-40">
      <Eyebrow n="05" label="Stack" />
      <Split
        text="The [toolbox] — spin it."
        className="max-w-3xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
      />

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
        <div data-reveal>
          <TagSphere words={words} />
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">Drag · hover · {words.length} technologies</p>
        </div>

        <div data-reveal>
          <div className="mb-6 flex flex-wrap gap-2">
            {skillGroups.map((g, i) => (
              <button
                key={g.name}
                onClick={() => {
                  setTab(i);
                  audio.note(i * 2);
                  H.tap();
                }}
                className={`rounded-full border px-5 py-2.5 font-display text-sm font-bold transition-all duration-300 ${
                  tab === i ? "border-lime bg-lime text-ink" : "border-white/15 bg-black/30 text-white/70 hover:border-white/50"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
          <p className="mb-6 text-white/55">{group.blurb}</p>
          <div ref={panel} className="glass rounded-3xl p-5 sm:p-7">
            {group.items.every((i) => i.l) ? (
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {group.items.map((s) => (
                  <li key={s.n} data-skill className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium sm:text-base">{s.n}</span>
                    <span className="flex gap-1" aria-label={`${s.l} of 5`}>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <span
                          key={p}
                          className="pip h-2 w-5 rounded-full sm:w-6"
                          style={{
                            background: p <= (s.l || 0) ? "#c6ff3d" : "rgba(255,255,255,0.12)",
                            boxShadow: p <= (s.l || 0) ? "0 0 10px rgba(198,255,61,0.4)" : "none",
                          }}
                        />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((s) => (
                  <span
                    key={s.n}
                    data-skill
                    data-sfx
                    className="rounded-full border border-hot/40 bg-hot/10 px-4 py-2 text-sm text-hot transition-colors hover:bg-hot hover:text-ink"
                  >
                    {s.n}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
