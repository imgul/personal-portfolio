import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

export const SECTIONS = [
  "Intro",
  "About",
  "Ventures",
  "Agents",
  "Journey",
  "Stack",
  "Credentials",
  "Beyond",
  "Contact",
] as const;

/** Mutable, non-reactive shared state read every frame by Three.js / GSAP. */
export const store = {
  mouse: { x: 0, y: 0, nx: 0, ny: 0 },
  scrollY: 0,
  progress: 0,
  vel: 0,
  f: 0, // fractional section index
  pulse: 0,
  entered: false,
  lenis: null as Lenis | null,
};

/* ---------- active section (reactive) ---------- */
let active = 0;
const aListeners = new Set<() => void>();
export function setActive(i: number) {
  if (i !== active) {
    active = i;
    aListeners.forEach((l) => l());
  }
}
export function getActive() {
  return active;
}
export function useActive() {
  return useSyncExternalStore(
    (cb) => {
      aListeners.add(cb);
      return () => aListeners.delete(cb);
    },
    () => active
  );
}

export function scrollToSection(i: number) {
  const el = document.querySelectorAll("[data-section]")[i] as HTMLElement | undefined;
  if (!el || !store.lenis) return;
  store.lenis.scrollTo(el, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
}
