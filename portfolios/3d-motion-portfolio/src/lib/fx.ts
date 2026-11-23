import { rumble } from "./world";

type Listener = () => void;
export type HapticKind = "tick" | "tap" | "success" | "heavy";

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// A minor — Am9 · Fmaj7 · Cmaj7 · G6
const CHORDS = [
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [48, 55, 60, 64],
  [55, 59, 62, 64],
];
const ARP = [0, 1, 2, 3, 2, 1, 4, 2, 0, 3, 2, 5, 4, 2, 1, 3];
const PENT = [0, 3, 5, 7, 10];

const PATTERNS: Record<HapticKind, number | number[]> = {
  tick: 6,
  tap: 14,
  success: [12, 40, 12, 40, 36],
  heavy: [40, 30, 70],
};
const RUMBLE: Record<HapticKind, number> = { tick: 0.12, tap: 0.4, success: 0.8, heavy: 1.4 };

class FX {
  ctx: AudioContext | null = null;
  soundOn = false;
  hapticsOn = true;
  level = 0;

  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private reverbSend!: GainNode;
  private delaySend!: GainNode;
  private noiseBuf!: AudioBuffer;
  private scrollGain!: GainNode;
  private scrollFilter!: BiquadFilterNode;
  private timer: number | undefined;
  private nextTime = 0;
  private step = 0;
  private version = 0;
  private listeners = new Set<Listener>();
  private lastHover = 0;

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };
  getSnapshot = () => this.version;
  private emit() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  /* ───────────── setup ───────────── */
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp);
    comp.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.6;
    this.musicBus.connect(this.master);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);

    // reverb
    const conv = ctx.createConvolver();
    conv.buffer = this.impulse(2.8, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    conv.connect(wet);
    wet.connect(this.master);
    this.reverbSend = ctx.createGain();
    this.reverbSend.connect(conv);

    // ping-pong-ish delay
    const dl = ctx.createDelay(1);
    dl.delayTime.value = 0.375;
    const fb = ctx.createGain();
    fb.gain.value = 0.36;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    dl.connect(lp);
    lp.connect(fb);
    fb.connect(dl);
    lp.connect(this.musicBus);
    lp.connect(this.reverbSend);
    this.delaySend = ctx.createGain();
    this.delaySend.gain.value = 0.5;
    this.delaySend.connect(dl);

    // noise
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // scroll "air" – driven by scroll velocity
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    this.scrollFilter = ctx.createBiquadFilter();
    this.scrollFilter.type = "bandpass";
    this.scrollFilter.frequency.value = 600;
    this.scrollFilter.Q.value = 0.8;
    this.scrollGain = ctx.createGain();
    this.scrollGain.gain.value = 0;
    src.connect(this.scrollFilter);
    this.scrollFilter.connect(this.scrollGain);
    this.scrollGain.connect(this.master);
    src.start();
  }

  private impulse(dur: number, decay: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  setSound(on: boolean) {
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    if (on && ctx.state === "suspended") void ctx.resume();
    this.soundOn = on;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(on ? 0.85 : 0, ctx.currentTime, 0.25);
    if (on) this.startMusic();
    else
      window.setTimeout(() => {
        if (!this.soundOn) this.stopMusic();
      }, 900);
    this.emit();
  }

  setHaptics(on: boolean) {
    this.hapticsOn = on;
    this.emit();
    if (on) this.haptic("success");
  }

  setMood(i: number) {
    this.level = i;
  }

  /* ───────────── music ───────────── */
  private startMusic() {
    if (this.timer !== undefined || !this.ctx) return;
    this.nextTime = this.ctx.currentTime + 0.15;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 80);
  }
  private stopMusic() {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }
  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    const sd = 60 / 84 / 2;
    while (this.nextTime < ctx.currentTime + 0.25) {
      this.playStep(this.step, this.nextTime, sd);
      this.nextTime += sd;
      this.step++;
    }
  }
  private playStep(step: number, t: number, sd: number) {
    const s = step % 16;
    const chord = CHORDS[Math.floor(step / 16) % CHORDS.length];
    const ext = [...chord, ...chord.map((n) => n + 12)];
    if (s === 0) {
      this.pad(chord, t, sd * 16);
      this.bass(chord[0] - 12, t, sd * 6);
    }
    if (Math.random() < 0.78) {
      const note = ext[ARP[s] % ext.length] + 12;
      this.pluck(mtof(note), t, 0.05 + Math.random() * 0.04);
    }
    if (this.level >= 2 && s % 4 === 2) this.hat(t, 0.018 + this.level * 0.003);
    if (this.level >= 3 && s % 8 === 0) this.kick(t, 0.2);
  }
  private pad(chord: number[], t: number, dur: number) {
    const ctx = this.ctx!;
    const cutoff = 520 + this.level * 170;
    chord.forEach((n) => {
      [-7, 7].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = mtof(n - 12);
        o.detune.value = det;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = cutoff;
        f.Q.value = 0.6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.022, t + 2);
        g.gain.setValueAtTime(0.022, t + dur - 0.2);
        g.gain.linearRampToValueAtTime(0, t + dur + 1.8);
        o.connect(f);
        f.connect(g);
        g.connect(this.musicBus);
        g.connect(this.reverbSend);
        o.start(t);
        o.stop(t + dur + 1.9);
      });
    });
  }
  private bass(n: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = mtof(n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + dur + 0.1);
  }
  private pluck(freq: number, t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.9);
    const p = ctx.createStereoPanner();
    p.pan.value = Math.random() * 1.2 - 0.6;
    o.connect(g);
    g.connect(p);
    p.connect(this.musicBus);
    p.connect(this.delaySend);
    p.connect(this.reverbSend);
    o.start(t);
    o.stop(t + 1);
  }
  private hat(t: number, vol: number) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
    s.connect(f);
    f.connect(g);
    g.connect(this.musicBus);
    s.start(t, Math.random());
    s.stop(t + 0.06);
  }
  private kick(t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + 0.3);
  }

  /* ───────────── sfx ───────────── */
  private tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number) {
    if (!this.soundOn || !this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(g);
    g.connect(this.sfxBus);
    g.connect(this.reverbSend);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  hover() {
    const n = performance.now();
    if (n - this.lastHover < 45) return;
    this.lastHover = n;
    this.tone(1500 + Math.random() * 500, 0.06, "sine", 0.035);
  }
  click() {
    this.tone(520, 0.12, "triangle", 0.1, 0, 880);
    this.tone(1040, 0.1, "sine", 0.05, 0.04);
  }
  tick() {
    this.tone(330, 0.05, "square", 0.02);
  }
  success() {
    [0, 4, 7, 12].forEach((s, i) => this.tone(mtof(69 + s), 0.5, "triangle", 0.1, i * 0.07));
  }
  note(i: number, level = 3) {
    const m = 57 + PENT[i % 5] + 12 * (Math.floor(i / 5) % 3);
    this.tone(mtof(m), 0.35 + level * 0.12, "triangle", 0.1);
    this.tone(mtof(m + 12), 0.25, "sine", 0.03);
  }
  whoosh() {
    if (!this.soundOn || !this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(250, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.7);
    s.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    s.start(t, Math.random());
    s.stop(t + 0.8);
  }
  scrollVelocity(v: number) {
    if (!this.soundOn || !this.ctx) return;
    const a = Math.min(Math.abs(v), 60);
    const t = this.ctx.currentTime;
    this.scrollGain.gain.setTargetAtTime(Math.min(a * 0.0011, 0.05), t, 0.12);
    this.scrollFilter.frequency.setTargetAtTime(350 + a * 60, t, 0.12);
  }

  /* ───────────── haptics ───────────── */
  haptic(kind: HapticKind) {
    if (!this.hapticsOn) return;
    try {
      navigator.vibrate?.(PATTERNS[kind]);
    } catch {
      /* unsupported */
    }
    // desktop fallback: the 3D camera rumbles
    if (kind !== "tick") rumble(RUMBLE[kind]);
  }
}

export const fx = new FX();
