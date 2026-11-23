"use client";

import { useEffect, useRef } from "react";

/** Reading progress bar for blog posts. */
export default function BlogProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? Math.min(100, ((h.scrollTop || document.body.scrollTop || 0) / max) * 100) : 0;
      el.style.width = `${pct}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="blog-progress" ref={bar} role="progressbar" aria-label="Reading progress" />
  );
}
