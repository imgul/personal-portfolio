import { useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "../data";
import { ArrowUpRight, Clock, Magnetic } from "../components/ui";
import Marquee from "../components/Marquee";
import { fx } from "../lib/fx";
import { pulse } from "../lib/world";
import { scrollTo } from "../lib/scroll";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  const confetti = () => {
    const b = btn.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("span");
      s.style.cssText = `position:fixed;z-index:200;pointer-events:none;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:8px;height:8px;border-radius:${
        Math.random() > 0.5 ? "50%" : "2px"
      };background:${["#7c3aed", "#22d3ee", "#f43f5e", "#a3e635", "#fbbf24", "#fff"][i % 6]}`;
      document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2;
      const d = 90 + Math.random() * 190;
      gsap.to(s, {
        x: Math.cos(a) * d,
        y: Math.sin(a) * d + 60,
        rotate: Math.random() * 720,
        opacity: 0,
        duration: 1.1 + Math.random() * 0.6,
        ease: "power3.out",
        onComplete: () => s.remove(),
      });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      /* ignore */
    }
    setCopied(true);
    confetti();
    fx.success();
    fx.haptic("success");
    pulse(1.6);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const links = [
    { label: "LinkedIn", sub: "gulzaib-ai", href: profile.linkedin },
    { label: "GitHub", sub: "imgul", href: profile.github },
    { label: "Website", sub: "gulzaib.dev", href: profile.website },
    { label: "Phone", sub: profile.phone, href: profile.phoneHref },
  ];

  return (
    <section id="contact" data-section className="relative flex min-h-screen flex-col justify-between pt-32 md:pt-44">
      <div className="px-5 md:px-12">
        <div data-reveal className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
          <span className="text-[var(--accent2)]">07</span>
          <span className="h-px w-10 bg-white/30" />
          Contact
        </div>
        <h2 data-reveal className="font-display text-[clamp(2.4rem,9vw,9rem)] font-black uppercase leading-[0.9] tracking-tighter">
          Let's build
          <br />
          something <span className="grad-text">remarkable</span>
          <span className="text-[var(--accent2)]">.</span>
        </h2>

        <div data-reveal className="mt-12 flex flex-wrap items-center gap-6">
          <Magnetic>
            <button
              ref={btn}
              onClick={copy}
              data-hover
              data-cursor="Copy"
              className="flex items-center gap-4 rounded-full bg-white px-8 py-5 font-display text-sm font-bold text-black transition hover:scale-[1.03] md:text-lg"
            >
              {copied ? "Copied to clipboard ✓" : profile.email}
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-black/50">{copied ? "" : "click to copy"}</span>
            </button>
          </Magnetic>
          <a
            href={`mailto:${profile.email}`}
            data-hover
            className="font-mono text-xs uppercase tracking-[0.25em] text-white/70 underline decoration-white/30 underline-offset-8 transition hover:text-white hover:decoration-[var(--accent2)]"
          >
            or open mail app
          </a>
        </div>

        <div data-reveal className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              data-cursor="Go"
              onPointerEnter={() => fx.haptic("tick")}
              className="glass group flex items-center justify-between rounded-2xl p-5 transition hover:border-[var(--accent2)] hover:bg-white/[0.06]"
            >
              <div>
                <div className="font-display text-lg font-bold">{l.label}</div>
                <div className="font-mono text-[11px] text-white/50">{l.sub}</div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-white/50 transition group-hover:rotate-12 group-hover:text-[var(--accent2)]" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <Marquee items={["Available for remote", "UAE", "KSA", "Laravel", "React", "AI Systems"]} reverse outline />
        <footer className="flex flex-col items-start justify-between gap-4 px-5 pb-24 pt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 md:flex-row md:items-center md:px-12 md:pb-16">
          <span>
            © 2026 {profile.name} · {profile.location} · <Clock />
          </span>
          <span className="hidden md:inline">Crafted with GSAP · Three.js · Web Audio</span>
          <button
            onClick={() => {
              fx.haptic("heavy");
              fx.whoosh();
              scrollTo(0);
            }}
            data-hover
            className="flex items-center gap-2 text-white transition hover:text-[var(--accent2)]"
          >
            Back to top ↑
          </button>
        </footer>
      </div>
    </section>
  );
}
