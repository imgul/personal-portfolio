import { useSyncExternalStore } from "react";
import { fx } from "./fx";

export function useFx() {
  useSyncExternalStore(fx.subscribe, fx.getSnapshot);
  return { soundOn: fx.soundOn, hapticsOn: fx.hapticsOn };
}
