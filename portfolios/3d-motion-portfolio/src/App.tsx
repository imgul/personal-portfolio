import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./components/Scene";
import Cursor from "./components/Cursor";
import Gate from "./components/Gate";
import Hud from "./components/Hud";
import Marquee from "./components/Marquee";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Education from "./sections/Education";
import Beyond from "./sections/Beyond";
import Contact from "./sections/Contact";
import { initScroll, startScroll } from "./lib/scroll";
import { fx } from "./lib/fx";
import { goSection, pulse } from "./lib/world";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [entered, setEntered] = useState(false);
  const [gate, setGate] = useState(true);
  const [current, setCurrent] = useState(0);
  const enteredRef = useRef(false);

  // smooth scroll
  useEffect(() => initScroll(), []);

  // section tracking + reveal animations
  useEffect(() => {
    const els = gsap.utils.toArray<HTMLElement>("[data-section]");
    const triggers = els.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          setCurrent(i);
          goSection(i);
          fx.setMood(i);
          if (enteredRef.current) {
            fx.whoosh();
            fx.haptic("tick");
          }
        },
      })
    );
    goSection(0);

    const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]").map((el) =>
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      })
    );

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const id = window.setTimeout(refresh, 600);

    return () => {
      window.clearTimeout(id);
      triggers.forEach((t) => t.kill());
      reveals.forEach((r) => {
        r.scrollTrigger?.kill();
        r.kill();
      });
    };
  }, []);

  // global interaction feedback: hover ticks, click ripple + sound + haptics
  useEffect(() => {
    let lastEl: Element | null = null;
    const SEL = "a,button,[data-hover]";
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest(SEL);
      if (el && el !== lastEl) fx.hover();
      lastEl = el;
    };
    const down = (e: PointerEvent) => {
      const isUi = !!(e.target as HTMLElement).closest(SEL);
      fx.click();
      fx.haptic(isUi ? "tap" : "tick");
      pulse(isUi ? 0.5 : 0.9);
      const ring = document.createElement("div");
      ring.className = "ring-ripple";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      gsap.to(ring, { scale: 7, opacity: 0, duration: 0.9, ease: "expo.out", onComplete: () => ring.remove() });
    };
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m" && enteredRef.current) fx.setSound(!fx.soundOn);
    };
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, []);

  const onEnter = (sound: boolean) => {
    enteredRef.current = true;
    setEntered(true);
    if (sound) fx.setSound(true);
    fx.haptic("success");
    pulse(1.8);
    startScroll();
    window.setTimeout(() => fx.whoosh(), 150);
  };

  return (
    <div className="relative">
      <Scene />
      <div className="vignette" />
      <div className="grain" />
      <Cursor />
      <Hud current={current} visible={entered} />
      {gate && <Gate onEnter={onEnter} onGone={() => setGate(false)} />}

      <main className="relative z-10">
        <Hero entered={entered} />
        <About />
        <div className="py-10">
          <Marquee items={["Laravel", "React", "AI Systems", "SaaS", "RAG", "Flask", "Tailwind", "MySQL"]} />
        </div>
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Beyond />
        <Contact />
      </main>
    </div>
  );
}
