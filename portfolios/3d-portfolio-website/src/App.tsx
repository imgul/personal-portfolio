import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Scene3D from "./components/Scene3D";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Intro from "./components/Intro";
import Hero from "./sections/Hero";
import Marquee from "./sections/Marquee";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Education from "./sections/Education";
import Interests from "./sections/Interests";
import Contact from "./sections/Contact";
import { audio } from "./lib/audio";
import { SECTIONS, nav, store } from "./lib/store";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const lenis = useRef<Lenis | null>(null);
  const main = useRef<HTMLElement>(null);
  const toastEl = useRef<HTMLDivElement>(null);
  const isReady = useRef(false);

  // ---------- smooth scroll + triggers + global interaction ----------
  useEffect(() => {
    const l = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.current = l;
    l.stop();
    l.on("scroll", (e: { velocity: number }) => {
      store.velocity = e.velocity;
      ScrollTrigger.update();
    });
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    nav.scrollTo = (i: number) => {
      const el = document.querySelector(`[data-section="${i}"]`) as HTMLElement | null;
      if (!el) return;
      audio.whoosh(1.2);
      audio.haptic("medium");
      l.scrollTo(i === 0 ? 0 : el, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    };

    // reveal-on-scroll for any [data-reveal]
    gsap.set("[data-reveal]", { y: 40 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "power3.out", overwrite: true }),
    });

    // progress
    const prog = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        store.progress = self.progress;
      },
    });

    // active section
    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          if (store.section !== i && isReady.current) {
            audio.chime(i);
            audio.haptic("light");
          }
          store.section = i;
          setActive(i);
          document.documentElement.style.setProperty("--accent", SECTIONS[i].accent);
        },
      })
    );

    // per-frame: audio sampling, music intensity
    let lastInt = 0;
    const frame = () => {
      const s = audio.sample();
      store.audio = s.bass;
      store.bars = s.bars;
      store.velocity *= 0.92;
      const now = performance.now();
      if (now - lastInt > 250) {
        lastInt = now;
        const v = Math.min(1, Math.abs(store.velocity) / 60);
        audio.setIntensity(0.2 + store.progress * 0.45 + v * 0.35);
        if (Math.abs(store.velocity) > 45) audio.whoosh(Math.abs(store.velocity) / 70);
      }
    };
    gsap.ticker.add(frame);

    // pointer
    const onMove = (e: PointerEvent) => {
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    let lastHover: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest("a,button,[data-hover]");
      if (t && t !== lastHover) {
        lastHover = t;
        audio.hover();
      } else if (!t) lastHover = null;
    };
    const onDown = (e: PointerEvent) => {
      store.pulse = Math.min(1.5, store.pulse + 0.9);
      const t = (e.target as HTMLElement).closest("a,button");
      if (t) {
        audio.click();
        audio.haptic("medium");
      } else {
        audio.pulse();
        audio.haptic("light");
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);

    // haptic fallback: visual micro-shake on heavy feedback
    const onHaptic = (e: Event) => {
      const kind = (e as CustomEvent<string>).detail;
      if (kind === "light" || !main.current) return;
      const amp = kind === "medium" ? 2 : 5;
      gsap.fromTo(main.current, { x: (Math.random() - 0.5) * amp * 2, y: (Math.random() - 0.5) * amp }, { x: 0, y: 0, duration: 0.45, ease: "elastic.out(1,0.3)", clearProps: "transform" });
    };
    window.addEventListener("haptic", onHaptic);

    const onToast = (e: Event) => {
      setToastMsg((e as CustomEvent<string>).detail);
    };
    window.addEventListener("toast", onToast);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    const t1 = window.setTimeout(refresh, 800);

    const onVis = () => {
      if (!audio.ctx) return;
      if (document.hidden) void audio.ctx.suspend();
      else if (audio.soundOn) void audio.ctx.resume();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearTimeout(t1);
      window.removeEventListener("load", refresh);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("haptic", onHaptic);
      window.removeEventListener("toast", onToast);
      document.removeEventListener("visibilitychange", onVis);
      gsap.ticker.remove(tick);
      gsap.ticker.remove(frame);
      triggers.forEach((t) => t.kill());
      prog.kill();
      l.destroy();
    };
  }, []);

  // toast animation
  useEffect(() => {
    if (!toastMsg || !toastEl.current) return;
    const el = toastEl.current;
    gsap.killTweensOf(el);
    gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" });
    gsap.to(el, { y: 20, opacity: 0, duration: 0.4, delay: 2.4, ease: "power2.in" });
  }, [toastMsg]);

  const onEnter = useCallback((withSound: boolean) => {
    if (withSound) {
      audio.setSound(true);
      audio.setIntensity(0.25);
      audio.enter();
      setSound(true);
    }
    audio.haptic("success");
    store.pulse = 1.5;
    window.scrollTo(0, 0);
    lenis.current?.start();
    window.setTimeout(() => {
      isReady.current = true;
      ScrollTrigger.refresh();
    }, 1500);
    setEntered(true);
  }, []);

  const toggleSound = () => {
    const next = !audio.soundOn;
    audio.setSound(next);
    setSound(next);
    if (next) {
      audio.success();
    }
    audio.haptic("medium");
  };

  const toggleHaptics = () => {
    const next = !audio.hapticsOn;
    audio.hapticsOn = next;
    setHaptics(next);
    if (next) audio.haptic("heavy");
  };

  return (
    <>
      <Scene3D />
      <div className="vignette" />
      <div className="grain" />
      <Cursor />
      <Nav active={active} sound={sound} haptics={haptics} onSound={toggleSound} onHaptics={toggleHaptics} />

      <main ref={main} className="relative z-10">
        <Hero entered={entered} />
        <Marquee />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Interests />
        <Contact />
      </main>

      <div
        ref={toastEl}
        className="glass mono pointer-events-none fixed bottom-8 left-1/2 z-[120] -translate-x-1/2 rounded-full px-6 py-3 text-xs uppercase tracking-widest opacity-0"
      >
        {toastMsg}
      </div>

      <Intro onEnter={onEnter} />
    </>
  );
}
