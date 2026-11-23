import { useEffect, useRef } from "react";
import * as THREE from "three";
import { store } from "../lib/store";

const N = 7000;

type ShapeName = "knot" | "sphere" | "helix" | "cube" | "galaxy" | "torus" | "wave";

const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

function build(name: ShapeName): Float32Array {
  const a = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let x = 0,
      y = 0,
      z = 0;
    switch (name) {
      case "sphere": {
        const yy = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(1 - yy * yy);
        const th = i * 2.399963;
        const R = 2.1 * (0.97 + Math.random() * 0.06);
        x = Math.cos(th) * r * R;
        y = yy * R;
        z = Math.sin(th) * r * R;
        break;
      }
      case "knot": {
        const t = Math.random() * Math.PI * 2;
        const r = Math.cos(3 * t) + 2;
        x = r * Math.cos(2 * t) * 0.78 + g() * 0.16;
        y = r * Math.sin(2 * t) * 0.78 + g() * 0.16;
        z = -Math.sin(3 * t) * 0.78 * 1.2 + g() * 0.16;
        break;
      }
      case "helix": {
        const t = Math.random() * 2 - 1;
        if (i < N * 0.78) {
          const ang = t * Math.PI * 5 + (i % 2) * Math.PI;
          x = Math.cos(ang) * 1.15 + g() * 0.07;
          z = Math.sin(ang) * 1.15 + g() * 0.07;
          y = t * 3.2;
        } else {
          const ang = t * Math.PI * 5;
          const s = Math.random() * 2 - 1;
          x = Math.cos(ang) * 1.15 * s;
          z = Math.sin(ang) * 1.15 * s;
          y = t * 3.2;
        }
        break;
      }
      case "cube": {
        const S = 1.6;
        const sg = () => (Math.random() < 0.5 ? -1 : 1);
        const v = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
        if (Math.random() < 0.4) {
          const free = Math.floor(Math.random() * 3);
          for (let k = 0; k < 3; k++) if (k !== free) v[k] = sg();
        } else {
          v[Math.floor(Math.random() * 3)] = sg();
        }
        x = v[0] * S;
        y = v[1] * S;
        z = v[2] * S;
        break;
      }
      case "galaxy": {
        const arm = i % 3;
        const r = Math.pow(Math.random(), 0.6) * 4.4;
        const ang = (arm * Math.PI * 2) / 3 + r * 1.1;
        const spread = 0.12 + r * 0.07;
        x = Math.cos(ang) * r + g() * spread;
        z = Math.sin(ang) * r + g() * spread;
        y = g() * 0.2 * (1 - r / 6);
        break;
      }
      case "torus": {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const R = 2.1,
          r = 0.65;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = r * Math.sin(v) * 1.1;
        z = (R + r * Math.cos(v)) * Math.sin(u);
        break;
      }
      case "wave": {
        const side = Math.ceil(Math.sqrt(N));
        const gx = i % side;
        const gz = Math.floor(i / side);
        x = (gx / side - 0.5) * 10;
        z = (gz / side - 0.5) * 10;
        y = Math.sin(x * 0.8) * Math.cos(z * 0.8) * 0.5;
        break;
      }
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

interface Cfg {
  shape: ShapeName;
  x: number;
  y: number;
  s: number;
  op: number;
  rx: number;
  a: string;
  b: string;
}

const CFG: Cfg[] = [
  { shape: "knot", x: 3.1, y: 0.1, s: 1.0, op: 0.95, rx: 0.2, a: "#c8ff00", b: "#22d3ee" },
  { shape: "sphere", x: -3.2, y: 0, s: 1.05, op: 0.9, rx: 0, a: "#a78bfa", b: "#ff4d8d" },
  { shape: "helix", x: 0, y: 0, s: 1.3, op: 0.32, rx: 0, a: "#22d3ee", b: "#6366f1" },
  { shape: "cube", x: 3.5, y: 0, s: 1.0, op: 0.75, rx: 0.4, a: "#ff4d8d", b: "#ffb020" },
  { shape: "galaxy", x: 0, y: 0, s: 1.25, op: 0.4, rx: 1.0, a: "#ffb020", b: "#ff4d8d" },
  { shape: "torus", x: -3.4, y: 0, s: 1.0, op: 0.85, rx: 0.9, a: "#c8ff00", b: "#22d3ee" },
  { shape: "wave", x: 0, y: -0.6, s: 1.1, op: 0.45, rx: -1.0, a: "#a78bfa", b: "#22d3ee" },
  { shape: "sphere", x: 0, y: 0.2, s: 1.35, op: 0.7, rx: 0, a: "#ff4d8d", b: "#c8ff00" },
];

const vert = /* glsl */ `
uniform float uTime, uPulse, uAudio, uSize, uPR;
attribute vec4 aRand;
varying float vMix;
varying float vAlpha;
void main(){
  vec3 p = position;
  float n = sin(p.x*1.5 + uTime*0.8 + aRand.x*6.28) + cos(p.y*1.7 + uTime*0.6 + aRand.y*6.28) + sin(p.z*1.3 + uTime*0.7);
  p += normalize(p + 0.001) * (n*0.04 + uPulse*0.9*aRand.z + uAudio*0.55*aRand.w);
  p += vec3(sin(uTime*0.5 + aRand.x*20.), cos(uTime*0.4 + aRand.y*20.), sin(uTime*0.45 + aRand.z*20.)) * 0.035;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aRand.w*0.95 + uAudio*1.2 + uPulse*0.6) * uPR * (1.0 / -mv.z);
  vMix = aRand.x;
  vAlpha = 0.45 + 0.55*aRand.y;
}`;

const frag = /* glsl */ `
uniform vec3 uColorA, uColorB;
uniform float uOpacity;
varying float vMix;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  vec3 c = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(c * (0.8 + a*0.6), a * vAlpha * uOpacity);
}`;

export default function Scene3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const targets = {} as Record<ShapeName, Float32Array>;
    (["knot", "sphere", "helix", "cube", "galaxy", "torus", "wave"] as ShapeName[]).forEach((k) => (targets[k] = build(k)));

    // main particle body (starts exploded, then flows into the first shape)
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 6 + Math.random() * 8;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const rand = new Float32Array(N * 4);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      rand[i * 4] = Math.random();
      rand[i * 4 + 1] = Math.random();
      rand[i * 4 + 2] = Math.random();
      rand[i * 4 + 3] = Math.random();
      speed[i] = 1.2 + Math.random() * 2.6;
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));

    const uniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uAudio: { value: 0 },
      uSize: { value: 26 },
      uPR: { value: pr },
      uOpacity: { value: 0.9 },
      uColorA: { value: new THREE.Color(CFG[0].a) },
      uColorB: { value: new THREE.Color(CFG[0].b) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;

    const group = new THREE.Group();
    group.add(points);

    // thin orbit rings
    const ringMat = new THREE.MeshBasicMaterial({ color: CFG[0].a, transparent: true, opacity: 0.22, depthWrite: false });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.006, 8, 220), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.004, 8, 220), ringMat);
    ring1.rotation.x = 1.2;
    ring2.rotation.y = 1.1;
    group.add(ring1, ring2);
    scene.add(group);

    // distant stars
    const SN = 1600;
    const sp = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      const r = 14 + Math.random() * 30;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      sp[i * 3] = r * Math.sin(ph) * Math.cos(th);
      sp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      sp[i * 3 + 2] = r * Math.cos(ph);
    }
    const sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const smat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true });
    const stars = new THREE.Points(sgeo, smat);
    scene.add(stars);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      store.isMobile = window.innerWidth < 768;
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let t = 0;
    let spin = 0;
    let shape: ShapeName = CFG[0].shape;
    let raf = 0;
    const tmpA = new THREE.Color();
    const tmpB = new THREE.Color();
    let vel = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;
      const cfg = CFG[store.section] ?? CFG[0];
      const mobile = store.isMobile;
      if (cfg.shape !== shape) shape = cfg.shape;

      // morph
      const tgt = targets[shape];
      for (let i = 0; i < N; i++) {
        const k = Math.min(1, dt * speed[i]);
        const j = i * 3;
        pos[j] += (tgt[j] - pos[j]) * k;
        pos[j + 1] += (tgt[j + 1] - pos[j + 1]) * k;
        pos[j + 2] += (tgt[j + 2] - pos[j + 2]) * k;
      }
      posAttr.needsUpdate = true;

      // transform targets
      const tx = mobile ? 0 : cfg.x;
      const ty = mobile ? 1.9 : cfg.y;
      const ts = cfg.s * (mobile ? 0.7 : 1);
      const to = cfg.op * (mobile ? 0.5 : 1);
      const e = 1 - Math.exp(-dt * 2.4);
      group.position.x += (tx - group.position.x) * e;
      group.position.y += (ty - group.position.y) * e;
      const sc = group.scale.x + (ts - group.scale.x) * e;
      group.scale.setScalar(sc);
      uniforms.uOpacity.value += (to - uniforms.uOpacity.value) * e;
      tmpA.set(cfg.a);
      tmpB.set(cfg.b);
      uniforms.uColorA.value.lerp(tmpA, e);
      uniforms.uColorB.value.lerp(tmpB, e);
      ringMat.color.lerp(tmpA, e);
      ringMat.opacity = 0.12 + uniforms.uOpacity.value * 0.15;

      // motion
      vel += (Math.abs(store.velocity) - vel) * 0.08;
      spin += dt * (0.12 + vel * 0.012);
      group.rotation.y = spin + store.progress * Math.PI * 3 + store.mouse.x * 0.35;
      group.rotation.x += (cfg.rx - store.mouse.y * 0.3 - group.rotation.x) * e;
      ring1.rotation.z += dt * (0.2 + vel * 0.01);
      ring2.rotation.x += dt * 0.15;
      ring2.rotation.z -= dt * 0.1;

      camera.position.x += (store.mouse.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (store.mouse.y * 0.4 - camera.position.y) * 0.04;
      camera.position.z += (7 - Math.min(vel, 40) * 0.025 - camera.position.z) * 0.06;
      camera.lookAt(0, 0, 0);

      stars.rotation.y += dt * 0.012 + vel * 0.0004;
      stars.rotation.x = store.progress * 0.8;

      // uniforms
      store.pulse *= Math.exp(-dt * 2.8);
      uniforms.uTime.value = t;
      uniforms.uPulse.value = store.pulse;
      uniforms.uAudio.value = store.audio;

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      sgeo.dispose();
      smat.dispose();
      ringMat.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 z-0 h-full w-full pointer-events-none" aria-hidden />;
}
