import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/** One accent per section — drives the HUD chrome, eyebrows and progress rail. */
export const SECTIONS = [
  { id: "intro", label: "Intro", accent: "#c6ff3d" },
  { id: "about", label: "About", accent: "#8b6cff" },
  { id: "ventures", label: "Ventures", accent: "#3de8ff" },
  { id: "agents", label: "Agents", accent: "#ff5c8a" },
  { id: "journey", label: "Journey", accent: "#ffb23d" },
  { id: "stack", label: "Stack", accent: "#3dffb0" },
  { id: "credentials", label: "Credentials", accent: "#8b6cff" },
  { id: "beyond", label: "Beyond", accent: "#ff5c8a" },
  { id: "contact", label: "Contact", accent: "#c6ff3d" },
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
    () => active,
    () => active
  );
}

export function scrollToSection(i: number) {
  const el = document.querySelectorAll<HTMLElement>("[data-section]")[i];
  if (!el || !store.lenis) return;
  store.lenis.scrollTo(el, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
}
