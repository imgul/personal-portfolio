import { useEffect } from "react";
import gsap from "gsap";
import { audio } from "../lib/audio";
import { H } from "../lib/haptics";
import { getPrefs, setPref } from "../lib/prefs";
import { store } from "../lib/store";

const SFX_SEL = "a, button, [data-sfx], [role='button']";

/** Global pointer tracking, hover/click sound + haptics, and magnetic elements via event delegation. */
export function useInteractions() {
  useEffect(() => {
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      const m = store.mouse;
      m.x = e.clientX;
      m.y = e.clientY;
      m.nx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ny = -((e.clientY / window.innerHeight) * 2 - 1);

      const target = (e.target as HTMLElement | null)?.closest?.("[data-magnetic]") as HTMLElement | null;
      if (magnet && magnet !== target) {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" });
        magnet = null;
      }
      if (target && e.pointerType !== "touch") {
        magnet = target;
        const r = target.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(target, { x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: "power3.out" });
      }
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as HTMLElement | null)?.closest?.(SFX_SEL) as HTMLElement | null;
      if (!el) return;
      const from = e.relatedTarget as Node | null;
      if (from && el.contains(from)) return;
      if (el.dataset.note !== undefined) audio.note(Number(el.dataset.note));
      else audio.hover();
      if (el.dataset.nohaptic === undefined) H.tick();
    };

    const onDown = (e: PointerEvent) => {
      store.pulse = Math.min(store.pulse + 0.9, 1.6);
      const el = (e.target as HTMLElement | null)?.closest?.(SFX_SEL);
      if (el) {
        audio.click();
        H.tap();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (!store.entered) return;
      if ((e.key === "m" || e.key === "M") && !e.metaKey && !e.ctrlKey) {
        const next = !getPrefs().music;
        setPref("music", next);
        audio.toggle(next);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}
