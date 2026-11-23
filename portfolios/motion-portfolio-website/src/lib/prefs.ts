import { useSyncExternalStore } from "react";

export interface Prefs {
  music: boolean;
  fx: boolean;
  haptics: boolean;
}

let prefs: Prefs = { music: false, fx: true, haptics: true };
const listeners = new Set<() => void>();

export const getPrefs = () => prefs;

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (prefs[key] === value) return;
  prefs = { ...prefs, [key]: value };
  listeners.forEach((l) => l());
}

export function subscribePrefs(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function usePrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs);
}
