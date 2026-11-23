import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("a,button,[data-hover]");
      const txt = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      if (label.current) label.current.textContent = txt || "";
      gsap.to(ring.current, {
        scale: el ? (txt ? 2.6 : 1.9) : 1,
        backgroundColor: el ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0)",
        duration: 0.35,
        ease: "power3.out",
      });
      gsap.to(dot.current, { scale: el ? 0.4 : 1, duration: 0.25 });
    };
    const down = () => gsap.to(ring.current, { scale: 0.7, duration: 0.15, yoyo: true, repeat: 1 });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[300] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div ref={ring} className="absolute -left-5 -top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 mix-blend-difference">
        <span ref={label} className="font-mono text-[6px] uppercase tracking-widest text-white" />
      </div>
      <div ref={dot} className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-white" />
    </div>
  );
}
