import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    const l = label.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3.out" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3.out" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const c = t.closest("[data-cursor]") as HTMLElement | null;
      const h = t.closest("a,button,[data-hover]");
      if (c) {
        l.textContent = c.dataset.cursor || "";
        gsap.to(r, { width: 84, height: 84, backgroundColor: "rgba(255,255,255,0.95)", duration: 0.35, ease: "power3.out" });
        gsap.to(l, { opacity: 1, duration: 0.2 });
        gsap.to(d, { scale: 0, duration: 0.2 });
      } else if (h) {
        l.textContent = "";
        gsap.to(r, { width: 60, height: 60, backgroundColor: "rgba(255,255,255,0.12)", duration: 0.35, ease: "power3.out" });
        gsap.to(l, { opacity: 0, duration: 0.1 });
        gsap.to(d, { scale: 0.6, duration: 0.2 });
      } else {
        gsap.to(r, { width: 36, height: 36, backgroundColor: "rgba(255,255,255,0)", duration: 0.35, ease: "power3.out" });
        gsap.to(l, { opacity: 0, duration: 0.1 });
        gsap.to(d, { scale: 1, duration: 0.2 });
      }
    };
    const down = (e: PointerEvent) => {
      gsap.to(r, { scale: 0.8, duration: 0.15 });
      const rip = document.createElement("div");
      rip.className = "ripple";
      rip.style.left = e.clientX + "px";
      rip.style.top = e.clientY + "px";
      document.body.appendChild(rip);
      gsap.to(rip, { scale: 7, opacity: 0, duration: 0.8, ease: "power3.out", onComplete: () => rip.remove() });
    };
    const up = () => gsap.to(r, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.2 });
    const enter = () => shown && gsap.to([d, r], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-9 w-9 items-center justify-center rounded-full border border-white/80 mix-blend-difference md:flex">
        <span ref={label} className="mono text-[10px] font-medium uppercase tracking-widest text-black opacity-0" />
      </div>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-1.5 w-1.5 rounded-full bg-white mix-blend-difference md:block" />
    </>
  );
}
