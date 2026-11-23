import { getPrefs } from "./prefs";

let iosInput: HTMLInputElement | null = null;

/**
 * iOS Safari 17.4+ fires a light haptic tick when a `switch` checkbox toggles.
 * Clicking the input directly (not the wrapping label) is the most reliable form
 * of the trick. iOS only grants the haptic inside a user-gesture transaction,
 * so callers must invoke this from a real interaction handler.
 */
function iosTick() {
  try {
    if (!iosInput) {
      iosInput = document.createElement("input");
      iosInput.type = "checkbox";
      iosInput.setAttribute("switch", "");
      iosInput.setAttribute("aria-hidden", "true");
      iosInput.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
      document.body.appendChild(iosInput);
    }
    iosInput.click();
  } catch {
    /* noop */
  }
}

export const hapticsSupported = () =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

/**
 * iOS detection that also catches iPad Safari, which spoofs a Macintosh UA
 * (a touch-capable Mac is an iPad).
 */
function isIOS(): boolean {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/** Vibrate (Android / supported browsers) or tick (iOS). Respects the user's preference. */
export function haptic(pattern: number | number[] = 8) {
  if (!getPrefs().haptics) return;
  if (hapticsSupported()) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  } else if (isIOS()) {
    iosTick();
  }
}

/**
 * Haptic patterns — kept at/above ~16ms so they are actually perceivable on
 * real hardware (very short vibrations read as "not working").
 */
export const H = {
  tick: () => haptic(16),
  tap: () => haptic(24),
  thud: () => haptic([20, 35, 25]),
  success: () => haptic([25, 40, 25, 40, 80]),
  section: () => haptic(16),
};
