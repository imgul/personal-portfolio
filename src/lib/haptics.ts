import { getPrefs } from "./prefs";

let iosLabel: HTMLLabelElement | null = null;

/** iOS Safari 17.4+ fires a light haptic tick when a `switch` checkbox toggles. */
function iosTick() {
  try {
    if (!iosLabel) {
      iosLabel = document.createElement("label");
      iosLabel.setAttribute("aria-hidden", "true");
      iosLabel.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      iosLabel.appendChild(input);
      document.body.appendChild(iosLabel);
    }
    iosLabel.click();
  } catch {
    /* noop */
  }
}

export const hapticsSupported = () =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

/** Vibrate (Android / supported browsers) or tick (iOS). Respects the user's preference. */
export function haptic(pattern: number | number[] = 8) {
  if (!getPrefs().haptics) return;
  if (hapticsSupported()) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    iosTick();
  }
}

export const H = {
  tick: () => haptic(6),
  tap: () => haptic(12),
  thud: () => haptic([18, 30, 28]),
  success: () => haptic([20, 40, 20, 40, 70]),
  section: () => haptic(4),
};
