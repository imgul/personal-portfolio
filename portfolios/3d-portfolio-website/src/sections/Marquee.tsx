import { useEffect, useRef } from "react";
import gsap from "gsap";
import { marqueeWords } from "../data";
import { store } from "../lib/store";

function Row({ dir, outline }: { dir: 1 | -1; outline?: boolean }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current!;
    let x = 0;
    const fn = () => {
      const half = el.scrollWidth / 2;
      x += dir * (0.8 + Math.abs(store.velocity) * 0.22);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(fn);
    return () => gsap.ticker.remove(fn);
  }, [dir]);

  const items = [...marqueeWords, ...marqueeWords];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((w, i) => (
              <span key={i} className="flex items-center">
                <span className={`font-display px-6 text-[clamp(2.8rem,8vw,7rem)] font-extrabold uppercase leading-none tracking-tighter ${(i + (outline ? 1 : 0)) % 2 ? "outline-text" : ""}`}>
                  {w}
                </span>
                <span className="accent text-[clamp(1.5rem,4vw,3rem)]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative z-10 -rotate-2 scale-[1.04] border-y border-white/10 bg-black/40 py-6 backdrop-blur-sm" aria-hidden>
      <Row dir={-1} />
      <div className="h-2" />
      <Row dir={1} outline />
    </div>
  );
}
