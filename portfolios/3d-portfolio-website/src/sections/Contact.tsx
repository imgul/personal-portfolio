import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile, languages } from "../data";
import { SectionLabel, Magnetic, Split } from "../components/ui";
import { audio } from "../lib/audio";
import { nav, store, toast } from "../lib/store";

gsap.registerPlugin(ScrollTrigger);

const KEYS = ["A", "S", "D", "F", "G", "H", "J", "K"];

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const pads = useRef<(HTMLButtonElement | null)[]>([]);
  const warned = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".cta-char", { yPercent: 125 });
      ScrollTrigger.create({
        trigger: ".cta-block",
        start: "top 75%",
        once: true,
        onEnter: () => gsap.to(".cta-char", { yPercent: 0, duration: 1.2, stagger: 0.03, ease: "expo.out" }),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const play = (i: number) => {
    if (!audio.sfxOn) {
      if (!warned.current) {
        warned.current = true;
        toast("Sound is off. Turn it on (top right) to play ♪");
      }
    }
    audio.note(i + 3, 0.2);
    audio.haptic("light");
    store.pulse = Math.min(1.5, store.pulse + 0.5);
    const el = pads.current[i];
    if (el) gsap.fromTo(el, { scale: 0.88, backgroundColor: "rgba(255,255,255,0.95)", color: "#000" }, { scale: 1, backgroundColor: "rgba(255,255,255,0.04)", color: "#fff", duration: 0.5, ease: "elastic.out(1,0.5)" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const i = KEYS.indexOf(e.key.toUpperCase());
      if (i >= 0) play(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      /* clipboard unavailable */
    }
    toast(`Email copied · ${profile.email}`);
    audio.success();
    audio.haptic("success");
    store.pulse = 1.6;
  };

  return (
    <section ref={root} id="contact" data-section="7" className="relative flex min-h-screen flex-col justify-between px-5 pb-8 pt-32 md:px-12 md:pt-44">
      <div>
        <SectionLabel n="07">Contact</SectionLabel>
        <h2 className="cta-block font-display text-[clamp(2.8rem,11.5vw,11rem)] font-extrabold uppercase leading-[0.88] tracking-tighter">
          <div><Split text="Let's build" charClass="cta-char" /></div>
          <div className="accent"><Split text="something" charClass="cta-char" /></div>
          <div className="outline-text"><Split text="great." charClass="cta-char" /></div>
        </h2>

        <div data-reveal className="mt-14 flex flex-wrap items-center gap-4">
          <Magnetic>
            <button onClick={copy} data-cursor="Copy" className="rounded-full bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-black">
              Copy email ✉
            </button>
          </Magnetic>
          <Magnetic>
            <a href={`mailto:${profile.email}`} className="inline-block rounded-full border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-widest transition hover:bg-white hover:text-black">
              {profile.email}
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="mt-24 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div data-reveal className="glass rounded-3xl p-6">
          <div className="mono mb-3 text-[10px] uppercase tracking-widest text-white/50">Call / WhatsApp</div>
          <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="font-display text-xl font-bold hover:text-[var(--accent)]">
            {profile.phone}
          </a>
          <div className="mono mt-5 mb-1 text-[10px] uppercase tracking-widest text-white/50">Based in</div>
          <div className="text-white/80">{profile.location}</div>
        </div>

        <div data-reveal className="glass rounded-3xl p-6">
          <div className="mono mb-3 text-[10px] uppercase tracking-widest text-white/50">Find me online</div>
          <ul className="space-y-2">
            {[
              { l: "LinkedIn", h: profile.linkedin, u: "gulzaib-ai" },
              { l: "GitHub", h: profile.github, u: "imgul" },
              { l: "Website", h: profile.website, u: profile.websiteLabel },
            ].map((s) => (
              <li key={s.l}>
                <a href={s.h} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-b border-white/10 py-2 transition hover:border-[var(--accent)]">
                  <span className="font-display font-semibold">{s.l}</span>
                  <span className="mono text-[11px] text-white/50 transition group-hover:text-[var(--accent)]">{s.u} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="glass rounded-3xl p-6">
          <div className="mono mb-3 text-[10px] uppercase tracking-widest text-white/50">Languages</div>
          <ul className="space-y-3">
            {languages.map((l) => (
              <li key={l.name} className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">{l.name}</span>
                <span className="mono accent text-[11px] uppercase tracking-widest">{l.level}</span>
              </li>
            ))}
          </ul>
          <div className="mono mt-5 text-[10px] uppercase tracking-widest text-white/50">Open to · Remote · UAE · KSA</div>
        </div>

        <div data-reveal className="glass rounded-3xl p-6">
          <div className="mono mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/50">
            <span>Play the synth</span>
            <span>keys A–K</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {KEYS.map((k, i) => (
              <button
                key={k}
                ref={(el) => { pads.current[i] = el; }}
                onPointerDown={() => play(i)}
                className="mono aspect-square rounded-xl border border-white/15 bg-white/[0.04] text-sm"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="mono mt-20 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.25em] text-white/40 md:flex-row md:items-center">
        <span>© 2026 Muhammad Gulzaib · Built with React, GSAP, Three.js &amp; Web Audio</span>
        <button onClick={() => nav.scrollTo(0)} className="transition hover:text-white" data-cursor="Top">
          Back to top ↑
        </button>
      </footer>
    </section>
  );
}
