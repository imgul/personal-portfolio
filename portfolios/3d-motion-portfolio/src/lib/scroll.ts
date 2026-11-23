import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "./world";
import { fx } from "./fx";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initScroll() {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.stop();
  const l = lenis;

  l.on("scroll", (e: Lenis) => {
    ScrollTrigger.update();
    world.scroll = e.progress || 0;
    world.vel = e.velocity || 0;
    fx.scrollVelocity(e.velocity || 0);
  });

  const tick = (t: number) => l.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    l.destroy();
    lenis = null;
  };
}

export const startScroll = () => lenis?.start();
export const stopScroll = () => lenis?.stop();

export function scrollTo(target: string | number | HTMLElement, offset = 0) {
  if (lenis) lenis.scrollTo(target as never, { offset, duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
}
