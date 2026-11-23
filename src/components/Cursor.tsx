import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.4, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.4, ease: "power3" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a, button, [data-sfx], [data-cursor], [role='button']") as HTMLElement | null;
      if (el) {
        const txt = el.dataset.cursor || "";
        label.current!.textContent = txt;
        gsap.to(r, { scale: txt ? 3.2 : 2.2, backgroundColor: "rgba(198,255,61,0.14)", borderColor: "rgba(198,255,61,0.9)", duration: 0.3 });
        gsap.to(d, { scale: txt ? 0 : 0.6, duration: 0.3 });
      } else {
        label.current!.textContent = "";
        gsap.to(r, { scale: 1, backgroundColor: "rgba(198,255,61,0)", borderColor: "rgba(234,233,242,0.5)", duration: 0.3 });
        gsap.to(d, { scale: 1, duration: 0.3 });
      }
    };
    const down = () => gsap.to(r, { scale: "-=0.4", duration: 0.15 });
    const up = () => gsap.to(r, { scale: "+=0.4", duration: 0.3, ease: "back.out(3)" });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 items-center justify-center rounded-full border border-paper/50 [@media(pointer:fine)]:flex"
      >
        <span ref={label} className="font-mono text-[4px] font-bold uppercase tracking-widest text-lime" />
      </div>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden h-1.5 w-1.5 rounded-full bg-lime [@media(pointer:fine)]:block"
      />
    </>
  );
}
