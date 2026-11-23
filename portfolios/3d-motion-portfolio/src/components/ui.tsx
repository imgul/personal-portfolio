import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";

/** 3D tilt + spotlight following the pointer */
export function Tilt({
  children,
  className = "",
  max = 8,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    gsap.to(el, {
      rotateY: (px - 0.5) * max * 2,
      rotateX: -(py - 0.5) * max * 2,
      transformPerspective: 900,
      duration: 0.4,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`spot ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Element gently pulled toward the cursor */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}

export function SectionHead({ index, label, title, outline }: { index: string; label: string; title: string; outline?: string }) {
  return (
    <div data-reveal className="mb-10 md:mb-16">
      <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
        <span className="text-[var(--accent2)]">{index}</span>
        <span className="h-px w-10 bg-white/30" />
        <span>{label}</span>
      </div>
      <h2 className="font-display text-[clamp(2rem,6.5vw,5.5rem)] font-black leading-[0.95] tracking-tight">
        {title}
        {outline && (
          <>
            {" "}
            <span className="text-outline">{outline}</span>
          </>
        )}
      </h2>
    </div>
  );
}

export function Clock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
  return <span className={className}>{s} PKT</span>;
}

export function ArrowUpRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
