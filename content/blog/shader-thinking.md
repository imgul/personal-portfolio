---
title: "Shader Thinking: GLSL Without Losing the Weekend"
description: "A practical approach to writing GLSL shaders for the web — starting from the math you actually need, debugging techniques, and the performance habits that keep shaders fast on real devices."
date: "2026-09-18"
tags: ["Web", "GLSL", "Three.js"]
---

Shaders have a reputation for being the part of graphics programming that swallows weekends. The reputation is earned — but most of the pain comes from jumping into advanced techniques before the fundamentals are in place. Treat shaders as a small, precise language and the weekend survives.

## Start with the three ideas that matter

Almost every shader you will write on the web reduces to three concepts:

1. **Everything is a function of position.** A shader runs once per pixel (fragment) or per vertex, and its job is to decide what that element looks like based on its coordinates.
2. **Colors are just numbers.** Output is a vec3 of red, green and blue in the 0–1 range. Everything else is arithmetic on vectors.
3. **Light is arithmetic.** Diffuse, specular, ambient — each is a formula combining a light direction, a surface normal and a view direction.

```glsl
// A minimal fragment shader: distance-based glow on a dark field
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 center = vec2(0.5, 0.5 + 0.1 * sin(u_time));
  float d = distance(uv, center);
  vec3 col = vec3(0.03, 0.03, 0.05);
  col += vec3(0.78, 1.0, 0.24) * smoothstep(0.3, 0.0, d);
  gl_FragColor = vec4(col, 1.0);
}
```

That is the whole skeleton of a glow effect — position, arithmetic, output. Everything more complex is a variation on this shape.

## Debug by isolating inputs

Shader debugging is hard because you cannot step through it. Instead, isolate one variable at a time and visualize each channel separately:

- Render the **red channel alone** to see a value's map across the surface.
- Toggle **uniforms to constants** to remove time or input dependency.
- Output **the raw value of one variable** as grayscale — if the normal looks wrong, you will see it immediately.

The fastest debugging trick in my toolkit is a tiny UI slider that sweeps a uniform. If the effect changes predictably as you drag, the math is right and the problem is elsewhere.

## The performance habits that matter

Real devices — phones, low-end laptops — punish shader habits that desktop demos never notice:

- **Avoid branches in fragment shaders.** They serialize the GPU pipeline. Write formulas that blend instead of `if/else` wherever you can.
- **Keep the math cheap.** `pow`, `atan` and long transcendental chains cost real milliseconds on integrated GPUs. `smoothstep` and `mix` are your friends.
- **Cap pixel ratios.** Rendering at device pixel ratio 3 on a phone renders four to nine times the fragments. Cap at 2, or render the 3D scene at a lower resolution and upscale.
- **Frustum-cheat.** If a shader runs on a 2D background that is always fully on screen, it is pure cost with no visual benefit — use it sparingly.

## Think in terms of the frame budget

A shader is not "free" because it is GPU work. On a 60fps target you have about 16ms per frame for everything — physics, animation, audio, draw calls and every shader. Before optimizing, measure: render a frame, look at the profiler, and find what is actually eating the budget. Optimizing the shader that costs 1ms while the draw calls cost 10 is a losing battle.

## The takeaway

Shader thinking is just function thinking: input coordinates in, color numbers out, arithmetic in between. Start with the three fundamentals, debug by isolating channels, and budget your frames like any other engineering resource. The weekend is safe — as long as you respect the math and the profiler.
