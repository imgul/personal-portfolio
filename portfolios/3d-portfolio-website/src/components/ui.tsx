import { useEffect, useRef } from "react";
import type { ReactNode, PointerEvent as RPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Splits text into words > chars wrapped for masked reveal animations. */
export function Split({
  text,
  className = "",
  charClass = "char",
  onCharEnter,
}: {
  text: string;
  className?: string;
  charClass?: string;
  onCharEnter?: (index: number, el: HTMLElement) => void;
}) {
  let k = 0;
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: "0.1em", marginBottom: "-0.1em" }}>
          <span className="inline-block">
            {w.split("").map((c) => {
              const idx = k++;
              return (
                <span
                  key={idx}
                  data-hover
                  className={`${charClass} inline-block will-change-transform`}
                  onPointerEnter={onCharEnter ? (e) => onCharEnter(idx, e.currentTarget) : undefined}
                >
                  {c}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)", overwrite: true });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}

export function TiltCard({
  children,
  className = "",
  tilt = 6,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (e.pointerType === "mouse" && tilt) {
      gsap.to(el, { rotationY: (px - 0.5) * tilt * 2, rotationX: -(py - 0.5) * tilt * 2, transformPerspective: 1000, duration: 0.5, ease: "power2.out", overwrite: "auto" });
    }
  };
  const onLeave = () => {
    gsap.to(ref.current, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "elastic.out(1,0.6)", overwrite: "auto" });
  };
  return (
    <div ref={ref} className={`tilt-card relative ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
      <span className="spot" />
    </div>
  );
}

export function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div data-reveal className="mono mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/60">
      <span className="accent">{n}</span>
      <span className="h-px w-10 bg-white/30" />
      <span>{children}</span>
    </div>
  );
}

export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const o = { v: 0 };
    el.textContent = "0" + suffix;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: value,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = Math.round(o.v) + suffix;
          },
        }),
    });
    return () => st.kill();
  }, [value, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}
