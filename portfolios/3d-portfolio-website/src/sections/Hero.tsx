import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "../data";
import { Split, Magnetic } from "../components/ui";
import { audio } from "../lib/audio";
import { nav } from "../lib/store";

gsap.registerPlugin(ScrollTrigger);

const time = () =>
  new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit" });

export default function Hero({ entered }: { entered: boolean }) {
  const root = useRef<HTMLElement>(null);
  const roles = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(time());

  useEffect(() => {
    const iv = window.setInterval(() => setClock(time()), 20000);
    return () => window.clearInterval(iv);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero-char", { yPercent: 125 });
      gsap.set(".hero-fade", { opacity: 0, y: 30 });
      gsap.to(".hero-name", {
        y: -140,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-sub", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "20% top", end: "70% top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!entered) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.75 });
      tl.to(".hero-char", { yPercent: 0, duration: 1.3, stagger: 0.035, ease: "expo.out" })
        .to(".hero-fade", { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" }, "-=0.9");
    }, root);
    return () => ctx.revert();
  }, [entered]);

  // rotating role words
  useEffect(() => {
    const box = roles.current!;
    const items = Array.from(box.children) as HTMLElement[];
    gsap.set(items, { yPercent: 110 });
    gsap.set(items[0], { yPercent: 0 });
    let i = 0;
    const iv = window.setInterval(() => {
      const cur = items[i];
      i = (i + 1) % items.length;
      const next = items[i];
      gsap.to(cur, { yPercent: -110, duration: 0.7, ease: "power3.inOut" });
      gsap.fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power3.inOut" });
    }, 2200);
    return () => window.clearInterval(iv);
  }, []);

  const onChar = (idx: number, el: HTMLElement) => {
    audio.note(idx);
    audio.haptic("light");
    gsap.fromTo(
      el,
      { skewX: 0, scaleX: 1, color: "#ffffff" },
      { skewX: -14, scaleX: 1.06, color: "var(--accent)", duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1, overwrite: "auto" }
    );
  };

  return (
    <section ref={root} id="home" data-section="0" className="relative flex min-h-screen flex-col justify-between px-5 pb-10 pt-28 md:px-12">
      <div className="hero-fade mono flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/60">
        <span className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-accent pulse-dot" /> Available · Remote / UAE / KSA
        </span>
        <span className="hidden sm:block">
          {profile.location.split(",")[0]} · {clock} PKT
        </span>
      </div>

      <div className="hero-name my-10">
        <div className="hero-fade mono mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm uppercase tracking-[0.2em] text-white/70 md:text-base">
          <span>{profile.headline}</span>
          <span className="h-px w-8 bg-white/30" />
          <span className="relative inline-block h-[1.4em] w-[9em] overflow-hidden accent">
            <div ref={roles} className="contents">
              {profile.roles.map((r) => (
                <div key={r} className="absolute left-0 top-0 whitespace-nowrap leading-[1.4em]">
                  {r}
                </div>
              ))}
            </div>
          </span>
        </div>

        <h1 className="font-display text-[clamp(3rem,13.2vw,12.5rem)] font-extrabold uppercase leading-[0.86] tracking-tighter">
          <div>
            <Split text={profile.first} charClass="hero-char" onCharEnter={onChar} />
          </div>
          <div className="md:pl-[8vw]">
            <Split text={profile.last} charClass="hero-char" onCharEnter={onChar} />
          </div>
        </h1>
        <p className="hero-fade mono mt-5 text-[10px] uppercase tracking-[0.3em] text-white/40">♪ hover the letters, my name is a keyboard</p>
      </div>

      <div className="hero-sub flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div className="hero-fade max-w-md">
          <p className="mb-6 text-base leading-relaxed text-white/70 md:text-lg">
            I build scalable SaaS platforms and AI-powered web applications, turning complex backends into products people love using.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <button
                onClick={() => nav.scrollTo(3)}
                data-cursor="Go"
                className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-black"
              >
                View work
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => nav.scrollTo(7)}
                className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold uppercase tracking-widest transition hover:bg-white hover:text-black"
              >
                Say hello
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="hero-fade mono flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-white/60">
          <span>Scroll</span>
          <span className="relative flex h-12 w-[22px] justify-center rounded-full border border-white/30">
            <span className="bob mt-2 block h-2 w-[3px] rounded-full bg-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}
