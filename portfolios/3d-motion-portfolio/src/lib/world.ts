import gsap from "gsap";
import { Color } from "three";

export type SectionCfg = {
  id: string;
  label: string;
  a: string;
  b: string;
  x: number;
  y: number;
  s: number;
  wire: number;
  amp: number;
  freq: number;
};

/** Each section re-skins the 3D world + the UI accent colour. */
export const SECTIONS: SectionCfg[] = [
  { id: "hero", label: "Intro", a: "#7c3aed", b: "#22d3ee", x: 0, y: 0, s: 1.25, wire: 0, amp: 0.28, freq: 1.1 },
  { id: "about", label: "About", a: "#f43f5e", b: "#fb923c", x: 3.4, y: 0.2, s: 0.9, wire: 0.45, amp: 0.34, freq: 1.4 },
  { id: "experience", label: "Experience", a: "#06b6d4", b: "#3b82f6", x: 4.2, y: 2.0, s: 0.45, wire: 1, amp: 0.2, freq: 1.8 },
  { id: "projects", label: "Projects", a: "#a3e635", b: "#14b8a6", x: -3.8, y: 0, s: 0.85, wire: 0.25, amp: 0.4, freq: 1.2 },
  { id: "skills", label: "Skills", a: "#8b5cf6", b: "#ec4899", x: 0, y: 0, s: 1.7, wire: 1, amp: 0.3, freq: 1.0 },
  { id: "education", label: "Education", a: "#f59e0b", b: "#ef4444", x: 3.5, y: -0.4, s: 0.85, wire: 0.5, amp: 0.3, freq: 1.5 },
  { id: "beyond", label: "Beyond", a: "#34d399", b: "#60a5fa", x: -3.5, y: 0, s: 0.85, wire: 0.2, amp: 0.42, freq: 1.3 },
  { id: "contact", label: "Contact", a: "#7c3aed", b: "#22d3ee", x: 0, y: 0.8, s: 1.35, wire: 0, amp: 0.36, freq: 1.1 },
];

export const world = {
  x: 0,
  y: 0,
  s: 1.25,
  wire: 0,
  amp: 0.28,
  freq: 1.1,
  pulse: 0,
  shake: 0,
  energy: 0,
  scroll: 0,
  vel: 0,
  a: new Color(SECTIONS[0].a),
  b: new Color(SECTIONS[0].b),
};

export function goSection(i: number) {
  const c = SECTIONS[i];
  if (!c) return;
  gsap.to(world, {
    x: c.x,
    y: c.y,
    s: c.s,
    wire: c.wire,
    amp: c.amp,
    freq: c.freq,
    duration: 1.8,
    ease: "power3.inOut",
    overwrite: "auto",
  });
  const ca = new Color(c.a);
  const cb = new Color(c.b);
  gsap.to(world.a, { r: ca.r, g: ca.g, b: ca.b, duration: 1.4, overwrite: "auto" });
  gsap.to(world.b, { r: cb.r, g: cb.g, b: cb.b, duration: 1.4, overwrite: "auto" });
  gsap.to(document.documentElement, { "--accent": c.a, "--accent2": c.b, duration: 1.2, overwrite: "auto" });
}

export function pulse(amount = 1) {
  gsap.fromTo(world, { pulse: amount }, { pulse: 0, duration: 1.5, ease: "expo.out", overwrite: "auto" });
}

export function rumble(amount = 1) {
  gsap.fromTo(world, { shake: amount }, { shake: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
}
