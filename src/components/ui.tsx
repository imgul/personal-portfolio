import { Fragment, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";

/** Splits text into masked words. Wrap a word in [brackets] to accent it. Animated globally via [data-split]. */
export function Split({
  text,
  className = "",
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  const words = text.split(" ");
  return (
    <Tag data-split className={className} aria-label={text.replace(/[[\\]]/g, "")}>
      {words.map((w, i) => {
        const accent = w.startsWith("[");
        const clean = w.replace(/[[\\]]/g, "");
        return (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]" aria-hidden="true">
              <span className={`sw inline-block will-change-transform ${accent ? "text-lime" : ""}`}>{clean}</span>
            </span>{" "}
          </Fragment>
        );
      })}
    </Tag>
  );
}

export function Eyebrow({ n, label }: { n: string; label: string }) {
  return (
    <div data-reveal className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-white/50">
      <span className="text-[color:var(--accent)]">{n}</span>
      <span className="h-px w-10 bg-white/30" />
      <span>{label}</span>
    </div>
  );
}

/** 3D-tilting card with a cursor-following spotlight. */
export function TiltCard({
  children,
  className = "",
  style,
  accent = "#c6ff3d",
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  accent?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    gsap.to(el, {
      rotateY: (px - 0.5) * max * 2,
      rotateX: -(py - 0.5) * max * 2,
      transformPerspective: 900,
      duration: 0.5,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1,0.5)" });
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`spot glass ${className}`}
      style={{ ["--accent" as string]: accent, transformStyle: "preserve-3d", ...style }}
    >
      {children}
    </div>
  );
}

export const Arrow = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
