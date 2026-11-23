import { useSyncExternalStore } from "react";

export interface Prefs {
  music: boolean;
  fx: boolean;
  haptics: boolean;
}

const KEY = "mg-portfolio-prefs";

function load(): Prefs {
  const fallback: Prefs = { music: false, fx: true, haptics: true };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fallback, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    /* noop */
  }
  return fallback;
}

let prefs: Prefs = load();
const listeners = new Set<() => void>();

export const getPrefs = () => prefs;

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (prefs[key] === value) return;
  prefs = { ...prefs, [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l());
}

export function subscribePrefs(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function usePrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs, getPrefs);
}
