import { useEffect, useRef } from "react";
import * as THREE from "three";
import { world } from "../lib/world";

const NOISE_GLSL = /* glsl */ `
float n3(vec3 p){ return sin(p.x*1.7+uTime)*sin(p.y*1.9+uTime*1.3)*sin(p.z*1.6-uTime*.9); }
float disp(vec3 p){
  vec3 q = p*uFreq;
  return (n3(q) + 0.5*n3(q*2.1+3.1) + 0.25*n3(q*4.3+7.0)) * (uAmp + uPulse*0.55);
}
`;

const VERT = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform float uFreq; uniform float uPulse;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
${NOISE_GLSL}
void main(){
  vec3 p = position;
  vec3 nrm = normalize(normal);
  float d = disp(p);
  vec3 np = p + normalize(p)*d;
  // finite-difference normal for lighting
  vec3 t1 = normalize(cross(nrm, abs(nrm.y) > 0.99 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
  vec3 t2 = cross(nrm, t1);
  float e = 0.03;
  vec3 pa = p + t1*e; pa += normalize(pa)*disp(pa);
  vec3 pb = p + t2*e; pb += normalize(pb)*disp(pb);
  vec3 nn = normalize(cross(pa-np, pb-np));
  if(dot(nn, nrm) < 0.) nn = -nn;
  vNoise = d;
  vec4 mv = modelViewMatrix * vec4(np, 1.0);
  vView = -mv.xyz;
  vNormal = normalize(normalMatrix * nn);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform float uWire; uniform float uOpacity; uniform float uTime;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
void main(){
  vec3 N = normalize(vNormal); vec3 V = normalize(vView);
  float fres = pow(1.0 - max(dot(N,V),0.0), 2.4);
  float g = smoothstep(-0.7, 0.7, vNoise*1.6 + N.y*0.55 + sin(uTime*.4)*.1);
  vec3 col = mix(uA, uB, g);
  if(uWire > 0.5){
    gl_FragColor = vec4(col*1.5, (0.14 + fres*0.75) * uOpacity);
  } else {
    vec3 L = normalize(vec3(0.5,0.8,0.6));
    float diff = max(dot(N,L),0.0);
    float spec = pow(max(dot(reflect(-V,N), L),0.0), 28.0);
    vec3 c = col*(0.16 + 0.5*diff) + uB*fres*1.25 + vec3(spec)*0.6;
    gl_FragColor = vec4(c, uOpacity);
  }
}`;

export default function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const mobile = window.innerWidth < 768;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.z = 7;

    /* ─ core blob ─ */
    const shared = {
      uTime: { value: 0 },
      uAmp: { value: 0.28 },
      uFreq: { value: 1.1 },
      uPulse: { value: 0 },
      uA: { value: world.a },
      uB: { value: world.b },
    };
    const solidMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { ...shared, uWire: { value: 0 }, uOpacity: { value: 1 } },
      transparent: true,
    });
    const wireMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { ...shared, uWire: { value: 1 }, uOpacity: { value: 0.5 } },
      transparent: true,
      wireframe: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Group();
    const solid = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, mobile ? 20 : 36), solidMat);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.53, mobile ? 8 : 12), wireMat);
    core.add(solid, wire);

    const ringMat = new THREE.MeshBasicMaterial({ color: world.b, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.007, 8, 200), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.005, 8, 200), ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    ring2.rotation.set(Math.PI / 3, 0.6, 0);
    core.add(ring1, ring2);
    scene.add(core);

    /* ─ satellites ─ */
    const satMat = new THREE.MeshBasicMaterial({ color: world.b, wireframe: true, transparent: true, opacity: 0.55 });
    const geos = [new THREE.OctahedronGeometry(1), new THREE.TetrahedronGeometry(1), new THREE.IcosahedronGeometry(1, 0), new THREE.BoxGeometry(1.2, 1.2, 1.2)];
    const sats: { m: THREE.Mesh; r: THREE.Vector3; base: THREE.Vector3 }[] = [];
    const satGroup = new THREE.Group();
    for (let i = 0; i < (mobile ? 6 : 12); i++) {
      const m = new THREE.Mesh(geos[i % geos.length], satMat);
      const ang = Math.random() * Math.PI * 2;
      const rad = 3.6 + Math.random() * 4.5;
      const base = new THREE.Vector3(Math.cos(ang) * rad, (Math.random() - 0.5) * 6, Math.sin(ang) * rad * 0.5 - 2);
      m.position.copy(base);
      m.scale.setScalar(0.1 + Math.random() * 0.22);
      sats.push({ m, r: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), base });
      satGroup.add(m);
    }
    scene.add(satGroup);

    /* ─ star field ─ */
    const count = mobile ? 1600 : 4200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.pow(Math.random(), 0.7) * 44;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      const b = 0.35 + Math.random() * 0.65;
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = b;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const cx = cv.getContext("2d")!;
    const grad = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    cx.fillStyle = grad;
    cx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cv);
    const pm = new THREE.PointsMaterial({
      size: mobile ? 0.16 : 0.12,
      map: tex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: world.b,
    });
    const stars = new THREE.Points(pg, pm);
    scene.add(stars);

    /* ─ input ─ */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, speed: 0 };
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / w) * 2 - 1;
      const ny = -((e.clientY / h) * 2 - 1);
      mouse.speed += Math.hypot(nx - mouse.tx, ny - mouse.ty);
      mouse.tx = nx;
      mouse.ty = ny;
    };
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);

    /* ─ loop ─ */
    const clock = new THREE.Clock();
    let t = 0;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const aspect = w / h;
      const narrow = aspect < 1;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const target = Math.min(mouse.speed * 2.5 + Math.abs(world.vel) * 0.05, 1.4);
      world.energy += (target - world.energy) * 0.08;
      mouse.speed *= 0.85;

      t += dt * (0.6 + world.energy * 1.2);
      shared.uTime.value = t;
      shared.uAmp.value = world.amp + world.energy * 0.12;
      shared.uFreq.value = world.freq;
      shared.uPulse.value = world.pulse;

      const xs = narrow ? 0.12 : Math.min(1, aspect / 1.7);
      core.position.set(world.x * xs + mouse.x * 0.35, (narrow ? world.y * 0.6 + 1.2 : world.y) + mouse.y * 0.25, 0);
      core.scale.setScalar(world.s * (narrow ? 0.62 : 1) * (1 + world.pulse * 0.1));
      core.rotation.y += dt * (0.12 + world.energy * 0.5);
      core.rotation.x = mouse.y * 0.3 + world.scroll * 3;
      ring1.rotation.z += dt * 0.2;
      ring2.rotation.z -= dt * 0.14;

      solidMat.uniforms.uOpacity.value = 1 - world.wire * 0.88;
      wireMat.uniforms.uOpacity.value = 0.35 + world.wire * 0.65 + world.pulse * 0.4;

      sats.forEach((s, i) => {
        s.m.rotation.x += dt * s.r.x;
        s.m.rotation.y += dt * s.r.y;
        s.m.position.y = s.base.y + Math.sin(t * 0.8 + i) * 0.3;
      });
      satGroup.rotation.y = world.scroll * Math.PI * 3 + t * 0.03;
      satGroup.position.x = mouse.x * -0.5;

      stars.rotation.y = t * 0.02 + world.scroll * Math.PI * 2;
      stars.rotation.x = world.scroll * 0.8;
      stars.scale.z = 1 + Math.min(Math.abs(world.vel) * 0.02, 1.2);
      pm.size = (mobile ? 0.16 : 0.12) * (1 + world.pulse * 0.8);

      camera.position.x = mouse.x * 0.5 + (Math.random() - 0.5) * world.shake * 0.35;
      camera.position.y = mouse.y * 0.3 + (Math.random() - 0.5) * world.shake * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      [solid.geometry, wire.geometry, ring1.geometry, ring2.geometry, pg, ...geos].forEach((g) => g.dispose());
      [solidMat, wireMat, ringMat, satMat, pm].forEach((m) => m.dispose());
      tex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0" aria-hidden />;
}
