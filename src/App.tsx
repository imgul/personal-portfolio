import { Component, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
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

/** Crawler / automation detection — search bots and AI fetchers skip the entry gate. */
function isCrawler(): boolean {
  const ua = navigator.userAgent || "";
  return (
    /googlebot|google-web-fetch|bingbot|facebookexternalhit|twitterbot|applebot|perplexitybot|aibot|chatgpt|claude|cohere|duckduckbot|slurp|baiduspider|robot/i.test(
      ua
    ) || Boolean((navigator as unknown as { webdriver?: boolean }).webdriver)
  );
}

/** Error boundary — a runtime error should never leave a blank page. */
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Portfolio error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-display text-4xl font-extrabold uppercase">Something glitched.</p>
          <p className="max-w-md text-white/60">
            The experience hit an unexpected error. The content below is still available — scroll or jump to the
            contact section.
          </p>
          <a
            href="mailto:iigulzaib@gmail.com"
            className="rounded-full bg-lime px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-ink"
          >
            Get in touch
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const lastActive = useRef(0);
  const mainRef = useRef<HTMLElement>(null);
  useInteractions();

  /* crawler detection + deep-link hash (#about, #contact, …) */
  const hashIdx = useMemo(() => {
    const id = window.location.hash.replace(/^#/, "");
    return SECTIONS.findIndex((s) => s.id === id);
  }, []);
  const shouldAutoEnter = useMemo(() => isCrawler() || hashIdx >= 0, [hashIdx]);

  /* smooth scroll + per-frame scroll/section tracking */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    // only reset to top on a fresh navigation — never clobber back/forward or a deep link
    const nav = performance.getEntriesByType("navigation")[0] as (PerformanceEntry & { type?: string }) | undefined;
    const freshNav = !nav || nav.type === "navigate";
    if (freshNav && hashIdx < 0) window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.09, smoothWheel: !reduce, touchMultiplier: 1.4 });
    store.lenis = lenis;
    lenis.stop();
    lenis.on("scroll", () => ScrollTrigger.update());

    let lastY = 0;
    let lastIdx = -1;
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

      // keep the URL hash in sync with the active section (deep-linkable, shareable)
      if (idx !== lastIdx && store.entered) {
        lastIdx = idx;
        if (idx === 0) {
          if (window.location.hash) history.replaceState(null, "", window.location.pathname);
        } else {
          const id = SECTIONS[idx]?.id;
          if (id && window.location.hash !== `#${id}`) {
            history.replaceState(null, "", `#${id}`);
          }
        }
      }

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
  }, [hashIdx]);

  /* auto-enter for crawlers and deep links, then jump to the requested section */
  useEffect(() => {
    if (!shouldAutoEnter) return;
    const id = setTimeout(() => {
      store.entered = true;
      setEntered(true);
      store.lenis?.start();
      setTimeout(() => ScrollTrigger.refresh(), 200);
      if (hashIdx > 0) {
        setTimeout(() => {
          const el = document.querySelectorAll<HTMLElement>("[data-section]")[hashIdx];
          if (el && store.lenis) store.lenis.scrollTo(el, { duration: 1.2 });
        }, 400);
      }
    }, hashIdx > 0 ? 300 : 0);
    return () => clearTimeout(id);
  }, [shouldAutoEnter, hashIdx]);

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

  /* global scroll reveals — respects prefers-reduced-motion */
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
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
      mm.revert();
    };
  }, []);

  const handleEnter = () => {
    store.entered = true;
    setEntered(true);
    store.lenis?.start();
    setTimeout(() => ScrollTrigger.refresh(), 200);
    // move focus into the document for keyboard / AT users
    requestAnimationFrame(() => mainRef.current?.focus());
  };

  const skipToContent = (e: React.MouseEvent) => {
    e.preventDefault();
    mainRef.current?.focus();
    store.lenis?.scrollTo(0, { duration: 1.2 });
    history.replaceState(null, "", window.location.pathname);
  };

  return (
    <ErrorBoundary>
      <a
        href="#app-root"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-lime focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-ink"
      >
        Skip to content
      </a>
      {/* 3D scene mounts only after entry — defers the heavy WebGL init */}
      {entered && <Scene />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <HUD visible={entered} />
      {!entered && <Gate onEnter={handleEnter} />}

      <main
        id="app-root"
        ref={mainRef}
        tabIndex={-1}
        className="relative z-10 outline-none"
        data-sections={SECTIONS.length}
      >
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
    </ErrorBoundary>
  );
}
