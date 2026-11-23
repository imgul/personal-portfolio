"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog";

/** Table of contents with active-section highlighting via IntersectionObserver. */
export default function TocNav({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (!toc.length) return;
    const ids = toc.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) {
    return (
      <nav className="toc" aria-label="Table of contents">
        <p className="toc-title">On this page</p>
        <p className="toc-empty" style={{ color: "#8a8899", fontSize: "0.85rem" }}>
          Short read — no sections.
        </p>
      </nav>
    );
  }

  return (
    <nav className="toc" aria-label="Table of contents">
      <p className="toc-title">On this page</p>
      <ol>
        {toc.map((t) => (
          <li key={t.id} className={`lvl-${t.level}`}>
            <a href={`#${t.id}`} className={active === t.id ? "active" : ""}>
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
