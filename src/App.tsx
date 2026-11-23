import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Scene from "./components/Scene";
import Cursor from "./components/Cursor";
import Gate from "./components/Gate";
import HUD from "./components/HUD";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Ventures from "./components/sections/Ventures";
import Agents from "./components/sections/Agents";
import Experience from "./components/sections/Experience";
import Skills from "./components/sections/Skills";
import Credentials from "./components/sections/Credentials";
import Beyond from "./components/sections/Beyond";
import Contact from "./components/sections/Contact";
import { useInteractions } from "./hooks/useInteractions";
import { audio } from "./lib/audio";
import { H } from "./lib/haptics";
import { SECTIONS, getActive, setActive, store } from "./lib/store";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [entered, setEntered] = useState(false);
  const lastActive = useRef(0);
  useInteractions();

  /* smooth scroll + per-frame scroll/section tracking */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.09, smoothWheel: !reduce, touchMultiplier: 1.4 });
    store.lenis = lenis;
    lenis.stop();
    lenis.on("scroll", () => ScrollTrigger.update());

    let lastY = 0;
    const tick = (time: number) => {
      lenis.raf(time * 1000);
      const y = lenis.scroll;
      store.scrollY = y;
      store.vel += (y - lastY - store.vel) * 0.12;
      lastY = y;
      store.progress = Math.min(1, Math.max(0, y / Math.max(1, lenis.limit || document.body.scrollHeight - window.innerHeight)));

      // fractional section index
      const secs = document.querySelectorAll<HTMLElement>("[data-section]");
      const mid = window.innerHeight * 0.5;
      let f = store.f;
      for (let i = 0; i < secs.length; i++) {
        const r = secs[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          f = i + (mid - r.top) / Math.max(1, r.height);
          break;
        }
      }
      if (y < 4) f = 0;
      store.f = f;
      const idx = Math.min(secs.length - 1, Math.floor(f + 0.0001));
      if (idx !== getActive()) setActive(idx);

      audio.setIntensity(Math.min(1, Math.abs(store.vel) / 60));
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // suspend audio when the tab/app is hidden (mobile battery), resume when visible
    const onVis = () => {
      if (document.hidden) audio.suspend();
      else audio.resume();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener("visibilitychange", onVis);
      lenis.destroy();
      store.lenis = null;
    };
  }, []);

  /* section change feedback: whoosh + tick + haptic + chime */
  useEffect(() => {
    const id = setInterval(() => {
      const a = getActive();
      if (a !== lastActive.current) {
        lastActive.current = a;
        if (store.entered) {
          audio.whoosh(0.6);
          audio.chime(a);
          audio.tick(a);
          H.section();
        }
      }
    }, 80);
    return () => clearInterval(id);
  }, []);

  /* global scroll reveals */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        gsap.from(el.querySelectorAll(".sw"), {
          yPercent: 118,
          rotate: 4,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 56,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 400);
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  const handleEnter = () => {
    store.entered = true;
    setEntered(true);
    store.lenis?.start();
    setTimeout(() => ScrollTrigger.refresh(), 200);
  };

  return (
    <>
      <Scene />
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <HUD visible={entered} />
      {!entered && <Gate onEnter={handleEnter} />}

      <main id="app-root" className="relative z-10" data-sections={SECTIONS.length}>
        <Hero entered={entered} />
        <About />
        <Ventures />
        <Agents />
        <Experience />
        <Skills />
        <Credentials />
        <Beyond />
        <Contact />
      </main>
    </>
  );
}
