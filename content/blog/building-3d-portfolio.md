---
title: "Building a 3D Portfolio With Sound: GSAP, Three.js and Web Audio"
description: "A field report from building an interactive, motion-animated portfolio: what the stack does well, what breaks on mobile, and the audio-gesture lesson that cost the most debugging time."
date: "2026-01-20"
tags: ["Web", "Three.js", "GSAP", "Audio"]
---

I recently shipped an interactive portfolio built around a 3D scene, scroll-driven animation and a synthesized ambient soundtrack. It is the kind of project where the stack is well understood but the integration is not — and almost every hard lesson came from the seams between the pieces.

## The stack, and why it works

**Three.js** renders a WebGL scene that reacts to scroll and pointer movement. **GSAP** drives the scroll-linked timeline and UI motion. **Lenis** provides smooth scrolling that both GSAP and Three.js subscribe to, so the 3D camera, the section reveals and the scroll bar all move in lockstep.

```tsx
// Syncing three.js camera with Lenis via GSAP's ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
  camera.position.y = -scrollProgress * CAMERA_RANGE;
  renderer.render(scene, camera);
});
```

The pattern that made this manageable was a **single source of truth for scroll**: Lenis owns the value, everything else reads it. When the camera, the DOM animations and the audio intensity all derive from one scroll number, they can never drift apart.

## What breaks on mobile

Desktop-only assumptions fail fast on phones. Three things needed real rework:

1. **Pixel ratio** — cap `renderer.setPixelRatio()` at around 2. Uncapped high-DPI rendering drains batteries and drops frames on mid-range Android devices.
2. **Antialiasing** — disable it on mobile; the perf cost is not worth the edge smoothness at small sizes.
3. **Interaction models** — a hover-driven UI has no hover on touch. Every `hover` behavior needs a `pointerdown` equivalent, and haptic feedback is the mobile way to confirm a press.

## The audio-gesture lesson

The lesson that cost the most time: **browsers will not start audio without a user gesture** — and Safari on iOS is the strictest about it. An `AudioContext` created on page load starts suspended, and if your entry flow skips the interactive screen because of a deep-link or a refresh, the context never unlocks. Users hear nothing, and nothing in the console explains why.

The fix is architectural, not cosmetic:

- Always unlock audio **inside** a real user gesture — a tap on the entry screen is the reliable trigger.
- Add a safety net: unlock on the first `pointerdown`, `keydown` or `touchstart` anywhere on the page, whatever path the visitor took.
- Never gate `AudioContext.resume()` on a preference flag. If the context is suspended, resume it; the gain nodes already control what the user actually hears.

```ts
// Unlock on the first gesture, no matter how the user arrived
window.addEventListener("pointerdown", unlockAudio, { passive: true, once: true });
window.addEventListener("touchstart", unlockAudio, { passive: true, once: true });
```

## Build the whole thing as one performance budget

Animation, 3D and audio compete for the same frame budget. I treat it as an explicit budget: the audio engine runs a low-cost synthesis loop (no audio files to download), the 3D scene uses simple shaders, and motion is throttled or disabled entirely when the user has `prefers-reduced-motion` set. Accessibility is also performance: a reduced-motion user should get a fast, calm page, not a stuttering one.

## The takeaway

The stack itself was the easy part. The hard parts were the integration points: one scroll source, mobile interaction models, and respecting browser audio policies. Treat those seams as first-class engineering problems and the flashy parts take care of themselves.
