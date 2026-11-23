// Shared mutable state read every frame by the 3D scene, nav, audio, etc.
export const store = {
  section: 0,
  progress: 0,
  velocity: 0,
  pulse: 0,
  audio: 0,
  bars: [0, 0, 0, 0] as number[],
  mouse: { x: 0, y: 0 },
  isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
};

export const SECTIONS = [
  { id: "home", label: "Home", accent: "#c8ff00" },
  { id: "about", label: "About", accent: "#a78bfa" },
  { id: "experience", label: "Experience", accent: "#22d3ee" },
  { id: "projects", label: "Projects", accent: "#ff4d8d" },
  { id: "skills", label: "Skills", accent: "#ffb020" },
  { id: "education", label: "Education", accent: "#c8ff00" },
  { id: "interests", label: "Interests", accent: "#a78bfa" },
  { id: "contact", label: "Contact", accent: "#ff4d8d" },
];

export const nav = {
  scrollTo: (_i: number) => {
    void _i;
  },
};

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("toast", { detail: message }));
}
