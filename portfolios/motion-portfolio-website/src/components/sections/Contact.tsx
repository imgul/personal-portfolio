import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "../../lib/data";
import { audio } from "../../lib/audio";
import { H, haptic } from "../../lib/haptics";
import { store } from "../../lib/store";
import { Arrow, Eyebrow, Split } from "../ui";

const RING = 2 * Math.PI * 70;

function HoldButton() {
  const ring = useRef<SVGCircleElement>(null);
  const wrap = useRef<HTMLButtonElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const prog = useRef({ p: 0 });
  const lastBuzz = useRef(0);
  const [done, setDone] = useState(false);

  const start = () => {
    if (done) return;
    tween.current?.kill();
    tween.current = gsap.to(prog.current, {
      p: 1,
      duration: 1.4,
      ease: "power1.in",
      onUpdate: () => {
        const p = prog.current.p;
        if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - p));
        audio.charge(p);
        store.pulse = Math.max(store.pulse, p * 1.2);
        // escalating vibration: stronger the longer you hold
        const now = performance.now();
        if (now - lastBuzz.current > 90) {
          lastBuzz.current = now;
          haptic(Math.round(10 + p * 60));
        }
        gsap.set(wrap.current, { x: (Math.random() - 0.5) * p * 5, y: (Math.random() - 0.5) * p * 5 });
      },
      onComplete: () => {
        setDone(true);
        audio.success();
        H.success();
        store.pulse = 2;
        gsap.to(wrap.current, { x: 0, y: 0, duration: 0.4 });
        gsap.fromTo("#app-root", { x: -6 }, { x: 0, duration: 0.8, ease: "elastic.out(1,0.2)", clearProps: "transform" });
        setTimeout(() => {
          window.location.href = `mailto:${profile.email}?subject=Hello%20Gulzaib%20%E2%80%94%20let%27s%20build%20something`;
        }, 700);
        setTimeout(() => {
          setDone(false);
          prog.current.p = 0;
          if (ring.current) ring.current.style.strokeDashoffset = String(RING);
        }, 3500);
      },
    });
  };
  const cancel = () => {
    if (done) return;
    tween.current?.kill();
    gsap.to(wrap.current, { x: 0, y: 0, duration: 0.4 });
    tween.current = gsap.to(prog.current, {
      p: 0,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - prog.current.p));
      },
    });
  };

  return (
    <button
      ref={wrap}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => e.key === " " && start()}
      onKeyUp={(e) => e.key === " " && cancel()}
      data-cursor="Hold"
      data-nohaptic
      aria-label="Hold to send me an email"
      className="relative flex h-44 w-44 select-none items-center justify-center rounded-full touch-none sm:h-52 sm:w-52"
    >
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90">
        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle
          ref={ring}
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#c6ff3d"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={RING}
          style={{ filter: "drop-shadow(0 0 8px #c6ff3d)" }}
        />
      </svg>
      <span className={`absolute inset-4 rounded-full transition-all duration-500 ${done ? "scale-110 bg-lime" : "bg-lime/10"}`} />
      <span className={`relative text-center font-display text-sm font-extrabold uppercase leading-tight tracking-widest ${done ? "text-ink" : "text-lime"}`}>
        {done ? (
          <>
            Sent
            <br />
            ✦
          </>
        ) : (
          <>
            Hold to
            <br />
            say hi
          </>
        )}
      </span>
    </button>
  );
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () =>
      setT(new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t}</span>;
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      /* ignore */
    }
    setCopied(true);
    audio.success();
    H.success();
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    { label: "LinkedIn", sub: "gulzaib-ai", href: profile.linkedin },
    { label: "GitHub", sub: "imgul", href: profile.github },
    { label: "Website", sub: "gulzaib.dev", href: profile.website },
    { label: "Phone", sub: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  ];

  return (
    <div data-section="contact">
      <section className="relative flex min-h-screen flex-col justify-between px-5 pb-8 pt-28 sm:px-10 md:px-16 lg:pl-24">
        <div>
          <Eyebrow n="08" label="Contact" />
          <Split
            text="Let's build something that [ships.]"
            className="max-w-5xl font-display font-extrabold leading-[0.95] tracking-tight"
          />
          <style>{`[data-section="contact"] h2{font-size:clamp(2.6rem,9vw,8rem)}`}</style>
          <p data-reveal className="mt-6 max-w-xl text-base text-white/65 sm:text-lg">
            Hiring for a remote role, relocating to UAE / KSA, or starting something new? I'm in. Startups, AI products and ambitious MVPs are my favourite
            conversations.
          </p>
        </div>

        <div className="my-14 grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div data-reveal>
            <button
              onClick={copy}
              data-magnetic
              data-cursor={copied ? "Copied" : "Copy"}
              className="group break-all text-left font-display text-3xl font-extrabold leading-tight underline decoration-lime/0 decoration-2 underline-offset-8 transition-all hover:decoration-lime sm:text-5xl lg:text-6xl"
            >
              {profile.email}
              <span className="ml-3 inline-block font-mono text-xs font-normal uppercase tracking-widest text-lime">
                {copied ? "✓ copied" : "↗ copy"}
              </span>
            </button>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  data-magnetic
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4 backdrop-blur-md transition-colors hover:border-lime/60 hover:bg-lime/10"
                >
                  <span>
                    <span className="block font-display text-lg font-bold">{l.label}</span>
                    <span className="font-mono text-xs text-white/50">{l.sub}</span>
                  </span>
                  <Arrow className="h-5 w-5 text-white/40 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-lime" />
                </a>
              ))}
            </div>
          </div>

          <div data-reveal className="flex flex-col items-center gap-4">
            <HoldButton />
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Press &amp; hold — feel it build</p>
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Muhammad Gulzaib</span>
          <span>
            {profile.location} · <Clock /> PKT
          </span>
          <button onClick={() => store.lenis?.scrollTo(0, { duration: 2.4 })} className="text-left text-lime hover:underline sm:text-right">
            Back to top ↑
          </button>
        </footer>
      </section>
    </div>
  );
}
