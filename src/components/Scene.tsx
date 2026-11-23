import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SECTIONS, store } from "../lib/store";

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
${NOISE}
uniform float uTime; uniform float uAmp; uniform float uPulse; uniform float uPoint; uniform vec2 uMouse;
varying vec3 vNormal; varying vec3 vView; varying float vD;
void main(){
  float n  = snoise(normal*1.3 + vec3(0., uTime*.25, uTime*.12));
  float n2 = snoise(normal*3.2 - uTime*.35);
  float bulge = pow(max(dot(normal, normalize(vec3(uMouse, .6))), 0.), 6.) * .18;
  float d = (n*.26 + n2*.05)*uAmp + uPulse*.1*sin(normal.y*7. - uTime*9.) + bulge;
  vec3 p = position + normal*d;
  vD = d;
  vNormal = normalize(normalMatrix*normal);
  vec4 mv = modelViewMatrix*vec4(p,1.);
  vView = -mv.xyz;
  gl_Position = projectionMatrix*mv;
  gl_PointSize = uPoint * (10.0 / -mv.z);
}`;

const FRAG_MESH = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform float uTime;
varying vec3 vNormal; varying vec3 vView; varying float vD;
void main(){
  vec3 N = normalize(vNormal); vec3 V = normalize(vView);
  float fres = pow(1. - max(dot(N,V),0.), 2.2);
  float band = .5 + .5*sin(vD*28. + uTime*.8 + N.y*4.);
  vec3 base = mix(vec3(.02,.02,.05), mix(uB,uA,band)*.38, .65);
  vec3 col = base + fres*mix(uA,uB,.5+.5*sin(uTime*.4+N.x*2.))*1.5;
  col += pow(max(dot(reflect(-V,N), normalize(vec3(.4,.8,.6))),0.), 22.)*.55;
  gl_FragColor = vec4(col,1.);
}`;

const FRAG_POINTS = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform float uTime;
varying vec3 vNormal; varying vec3 vView; varying float vD;
void main(){
  float d = length(gl_PointCoord-.5);
  if(d>.5) discard;
  float a = smoothstep(.5,.05,d);
  vec3 col = mix(uA,uB,.5+.5*sin(vD*18.+uTime*.7));
  gl_FragColor = vec4(col*1.5, a*.85);
}`;

interface Key {
  x: number;
  y: number;
  z: number;
  s: number;
  o: number;
}
// one keyframe per section: Intro, About, Ventures, Agents, Journey, Stack, Credentials, Beyond, Contact
const KEYS: Key[] = [
  { x: 0, y: 0.1, z: 0, s: 1.25, o: 1 },
  { x: 2.7, y: 0, z: 0, s: 1.05, o: 1 },
  { x: 0, y: 0, z: -3.5, s: 1.1, o: 0.32 },
  { x: -3.1, y: 0, z: -0.5, s: 0.85, o: 0.7 },
  { x: 3.3, y: 0, z: -1.2, s: 0.8, o: 0.5 },
  { x: 0, y: 0, z: -3, s: 1, o: 0.28 },
  { x: 0, y: 0.6, z: -4, s: 1, o: 0.22 },
  { x: 3.1, y: 0, z: -0.8, s: 0.9, o: 0.75 },
  { x: 0, y: 0.5, z: 0.4, s: 1.35, o: 1 },
];

const PALETTE: [string, string][] = [
  ["#c6ff3d", "#8b6cff"],
  ["#8b6cff", "#ff5c8a"],
  ["#3de8ff", "#8b6cff"],
  ["#ff9a3d", "#ff3d9a"],
  ["#c6ff3d", "#3de8ff"],
  ["#ff5c8a", "#8b6cff"],
  ["#ffb23d", "#ff5c5c"],
  ["#3dffb0", "#c6ff3d"],
  ["#c6ff3d", "#ffffff"],
];

const smooth = (t: number) => t * t * (3 - 2 * t);

export default function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    let w = window.innerWidth;
    let h = window.innerHeight;
    const mobile = () => window.innerWidth < 900;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    const dpr = Math.min(window.devicePixelRatio || 1, mobile() ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.8 },
      uPulse: { value: 0 },
      uPoint: { value: 3.2 * dpr },
      uMouse: { value: new THREE.Vector2() },
      uA: { value: new THREE.Color(PALETTE[0][0]) },
      uB: { value: new THREE.Color(PALETTE[0][1]) },
    };

    const rig = new THREE.Group();
    scene.add(rig);
    const core = new THREE.Group();
    rig.add(core);

    const detail = mobile() ? 18 : 34;
    const meshGeo = new THREE.IcosahedronGeometry(1, detail);
    const mesh = new THREE.Mesh(
      meshGeo,
      new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG_MESH })
    );
    core.add(mesh);

    const shellGeo = new THREE.IcosahedronGeometry(1.32, mobile() ? 10 : 22);
    const shell = new THREE.Points(
      shellGeo,
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG_POINTS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    core.add(shell);

    // rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    const SEG = mobile() ? 120 : 240;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.006, 8, SEG), ringMat);
    ring1.rotation.x = 1.25;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.004, 8, SEG), ringMat);
    ring2.rotation.set(0.4, 0.6, 0);
    rig.add(ring1, ring2);

    // orbiters
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 });
    const orbiters: { pivot: THREE.Group; speed: number }[] = [];
    const orbGeos = [new THREE.IcosahedronGeometry(0.1, 0), new THREE.OctahedronGeometry(0.11, 0), new THREE.TetrahedronGeometry(0.12, 0)];
    for (let i = 0; i < (mobile() ? 6 : 12); i++) {
      const pivot = new THREE.Group();
      pivot.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const m = new THREE.Mesh(orbGeos[i % 3], orbMat);
      m.position.x = 1.7 + Math.random() * 1.1;
      pivot.add(m);
      rig.add(pivot);
      orbiters.push({ pivot, speed: (0.15 + Math.random() * 0.4) * (Math.random() < 0.5 ? -1 : 1) });
    }

    // stars
    const starCount = mobile() ? 600 : 2400;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const c = new THREE.Color();
    for (let i = 0; i < starCount; i++) {
      const r = 7 + Math.random() * 20;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      const k = Math.random();
      c.set(k < 0.7 ? "#ffffff" : k < 0.85 ? "#c6ff3d" : "#8b6cff");
      c.multiplyScalar(0.5 + Math.random() * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const target = new THREE.Vector3();
    let targetS = 1.2;
    const colA = new THREE.Color();
    const colB = new THREE.Color();
    const pa = PALETTE.map(([a, b]) => [new THREE.Color(a), new THREE.Color(b)] as const);
    let rotX = 0;
    let rotY = 0;
    let raf = 0;
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const N = SECTIONS.length;
      const f = Math.max(0, Math.min(store.f, N - 1));
      const i = Math.min(Math.floor(f), N - 2);
      const k = smooth(f - i);
      const a = KEYS[i];
      const b = KEYS[i + 1];
      const xMul = mobile() ? 0.15 : 1;
      const sMul = mobile() ? 0.72 : 1;
      target.set(
        (a.x + (b.x - a.x) * k) * xMul,
        a.y + (b.y - a.y) * k + (mobile() ? 0.9 : 0),
        a.z + (b.z - a.z) * k
      );
      targetS = (a.s + (b.s - a.s) * k) * sMul;
      const op = (a.o + (b.o - a.o) * k) * (mobile() ? 0.6 : 1);
      canvas.style.opacity = op.toFixed(3);

      const lerpK = 1 - Math.pow(0.0015, dt);
      rig.position.lerp(target, lerpK);
      const sc = rig.scale.x + (targetS - rig.scale.x) * lerpK;
      rig.scale.setScalar(sc);

      // palette
      const pi = Math.min(Math.floor(f), pa.length - 2);
      const pk = f - pi;
      colA.copy(pa[pi][0]).lerp(pa[pi + 1][0], pk);
      colB.copy(pa[pi][1]).lerp(pa[pi + 1][1], pk);
      uniforms.uA.value.lerp(colA, 0.12);
      uniforms.uB.value.lerp(colB, 0.12);
      ringMat.color.copy(uniforms.uA.value);
      orbMat.color.copy(uniforms.uB.value);

      // motion
      mouseX += (store.mouse.nx - mouseX) * 0.06;
      mouseY += (store.mouse.ny - mouseY) * 0.06;
      uniforms.uTime.value = t;
      store.pulse *= Math.pow(0.04, dt);
      uniforms.uPulse.value = store.pulse;
      const rm = reduce ? 0.4 : 1;
      const speed = Math.min(Math.abs(store.vel) * 0.012, 1.2) * rm;
      const ampTarget = reduce ? 0.25 : 0.75 + speed * 0.8;
      uniforms.uAmp.value += (ampTarget - uniforms.uAmp.value) * 0.08;
      uniforms.uMouse.value.set(mouseX, mouseY);

      rotY += dt * (0.12 + speed * 1.2) * rm;
      rotX += dt * 0.05 * rm;
      core.rotation.y = rotY + mouseX * 0.5;
      core.rotation.x = rotX * 0.3 + -mouseY * 0.35 + f * 0.2;
      shell.rotation.y = -rotY * 0.6;
      ring1.rotation.z += dt * 0.15 * rm;
      ring2.rotation.z -= dt * 0.1 * rm + speed * 0.1;
      ring1.rotation.x = 1.25 + Math.sin(t * 0.3) * 0.15 + mouseY * 0.2;
      ring2.rotation.y = 0.6 + Math.cos(t * 0.25) * 0.2 + mouseX * 0.2;
      orbiters.forEach((o, n) => {
        o.pivot.rotation.y += dt * o.speed * (1 + speed * 4) * rm;
        o.pivot.rotation.z += dt * 0.05 * (n % 2 ? 1 : -1) * rm;
      });

      stars.rotation.y += dt * (0.01 + speed * 0.35) * rm;
      stars.rotation.x = f * 0.12 + mouseY * 0.05;
      camera.position.x += (mouseX * 0.45 - camera.position.x) * 0.04;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    loop();

    // pause rendering when the tab/app is hidden — saves battery on mobile
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      meshGeo.dispose();
      shellGeo.dispose();
      starGeo.dispose();
      orbGeos.forEach((g) => g.dispose());
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      ringMat.dispose();
      orbMat.dispose();
      starMat.dispose();
      (mesh.material as THREE.Material).dispose();
      (shell.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" aria-hidden="true" />;
}
