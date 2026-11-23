import { useEffect, useRef } from "react";
import gsap from "gsap";
import { world } from "../lib/world";

/** Infinite marquee — speeds up and skews with scroll velocity */
export default function Marquee({ items, reverse = false, outline = false }: { items: string[]; reverse?: boolean; outline?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = 0;
    const dir = reverse ? 1 : -1;
    const tick = () => {
      const el = track.current;
      if (!el) return;
      const half = el.scrollWidth / 2;
      x += dir * (0.9 + Math.abs(world.vel) * 0.55);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      if (wrap.current) wrap.current.style.transform = `skewX(${Math.max(-12, Math.min(12, -world.vel * 0.35))}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reverse]);

  const row = [...items, ...items];
  return (
    <div className="overflow-hidden py-3">
      <div ref={wrap}>
        <div ref={track} className="flex w-max items-center whitespace-nowrap will-change-transform">
          {row.concat(row).map((it, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`font-display text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-none tracking-tight ${
                  outline ? "text-outline" : "text-white"
                }`}
              >
                {it}
              </span>
              <span className="mx-6 text-[clamp(1.5rem,3vw,2.5rem)] text-[var(--accent2)]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
