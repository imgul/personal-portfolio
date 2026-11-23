import { getPrefs, subscribePrefs } from "./prefs";

/**
 * A tiny synthesised audio engine (no audio files).
 *  - Generative ambient music: pad + plucked arpeggio + soft pulse, run through delay + reverb.
 *  - UI sound effects: hover notes (pentatonic), click, whoosh, ticks, charge, success.
 *  - Scroll intensity opens the music's filter so the soundtrack "breathes" with the page.
 */

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Am9 – Fmaj9 – Cmaj7 – G6/9
const CHORDS: { root: number; notes: number[] }[] = [
  { root: 33, notes: [57, 60, 64, 67, 71] },
  { root: 29, notes: [53, 57, 60, 64, 67] },
  { root: 36, notes: [55, 60, 64, 67, 71] },
  { root: 31, notes: [55, 59, 62, 64, 69] },
];
const PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91];
const BEAT = 0.36;
const ARP = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0];

class Engine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private musicLP!: BiquadFilterNode;
  private pluckBus!: GainNode;
  private analyser!: AnalyserNode;
  private freq!: Uint8Array<ArrayBuffer>;
  private noise!: AudioBuffer;
  private timer: number | null = null;
  private nextT = 0;
  private step = 0;
  private intensity = 0;
  private lastHover = 0;
  private lastTick = 0;
  private lastCharge = 0;

  get ready() {
    return !!this.ctx && this.ctx.state === "running";
  }

  /** Must be called from a user gesture. */
  async unlock() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state !== "running") {
      try {
        await this.ctx.resume();
      } catch {
        /* noop */
      }
    }
    this.apply();
  }

  private init() {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    this.master.connect(comp);
    comp.connect(this.analyser);
    comp.connect(ctx.destination);

    // reverb
    const len = Math.floor(ctx.sampleRate * 2.8);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = ir;
    const revGain = ctx.createGain();
    revGain.gain.value = 0.4;
    reverb.connect(revGain);
    revGain.connect(this.master);

    // sfx
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0;
    this.sfxBus.connect(this.master);
    const sfxSend = ctx.createGain();
    sfxSend.gain.value = 0.35;
    this.sfxBus.connect(sfxSend);
    sfxSend.connect(reverb);

    // music
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicLP = ctx.createBiquadFilter();
    this.musicLP.type = "lowpass";
    this.musicLP.frequency.value = 900;
    this.musicLP.Q.value = 0.6;
    this.musicBus.connect(this.musicLP);
    this.musicLP.connect(this.master);
    const mSend = ctx.createGain();
    mSend.gain.value = 0.55;
    this.musicLP.connect(mSend);
    mSend.connect(reverb);

    // pluck delay
    this.pluckBus = ctx.createGain();
    this.pluckBus.connect(this.musicBus);
    const delay = ctx.createDelay(2);
    delay.delayTime.value = BEAT * 3;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    const dLP = ctx.createBiquadFilter();
    dLP.type = "lowpass";
    dLP.frequency.value = 2200;
    this.pluckBus.connect(delay);
    delay.connect(dLP);
    dLP.connect(fb);
    fb.connect(delay);
    dLP.connect(this.musicBus);

    // noise
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    subscribePrefs(() => this.apply());
  }

  apply() {
    if (!this.ctx) return;
    const p = getPrefs();
    const t = this.ctx.currentTime;
    this.sfxBus.gain.setTargetAtTime(p.fx ? 1 : 0, t, 0.05);
    this.musicBus.gain.setTargetAtTime(p.music ? 0.9 : 0, t, 0.6);
    if (p.music && this.timer === null && this.ready) {
      this.nextT = this.ctx.currentTime + 0.1;
      this.timer = window.setInterval(() => this.pump(), 90);
    } else if (!p.music && this.timer !== null) {
      const id = this.timer;
      this.timer = null;
      window.setTimeout(() => clearInterval(id), 1800);
    }
  }

  /* ------------------------- music ------------------------- */
  private pump() {
    if (!this.ctx) return;
    while (this.nextT < this.ctx.currentTime + 0.3) {
      this.schedule(this.step, this.nextT);
      this.nextT += BEAT;
      this.step++;
    }
  }

  private schedule(step: number, t: number) {
    const bar = Math.floor(step / 16) % 4;
    const s = step % 16;
    const chord = CHORDS[bar];
    if (s === 0) {
      this.pad(chord.notes, t, BEAT * 16);
      this.bass(chord.root, t, BEAT * 7);
    }
    if (s === 8) this.bass(chord.root, t, BEAT * 7);
    if (s % 8 === 0) this.kick(t);
    if (ARP[s] && Math.random() < 0.88) {
      const base = chord.notes[(s * 3 + bar) % chord.notes.length];
      this.pluck(base + (Math.random() < 0.3 ? 24 : 12), t, 0.05 + this.intensity * 0.03);
    }
    if (s % 4 === 2) this.hat(t, 0.012 + this.intensity * 0.03);
  }

  private pad(notes: number[], t: number, dur: number) {
    const ctx = this.ctx!;
    notes.slice(0, 4).forEach((n, i) => {
      for (const det of [-8, 8]) {
        const o = ctx.createOscillator();
        o.type = i % 2 ? "triangle" : "sawtooth";
        o.frequency.value = midi(n);
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.028, t + 2.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.4);
        o.connect(g);
        g.connect(this.musicBus);
        o.start(t);
        o.stop(t + dur + 1.6);
      }
    });
  }

  private bass(root: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = midi(root);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  private pluck(note: number, t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = midi(note);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g);
    g.connect(this.pluckBus);
    o.start(t);
    o.stop(t + 0.8);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    const g = ctx.createGain();
    const v = 0.14 + this.intensity * 0.12;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    o.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + 0.3);
  }

  private hat(t: number, vol: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.musicBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + 0.08);
  }

  /** 0..1 — how energetic the scroll is. Opens the filter. */
  setIntensity(v: number) {
    this.intensity = v;
    if (this.ctx) this.musicLP.frequency.setTargetAtTime(750 + v * 3800, this.ctx.currentTime, 0.25);
  }

  /** Overall output level 0..1 for visualisers. */
  level() {
    if (!this.ctx || !this.ready) return 0;
    this.analyser.getByteFrequencyData(this.freq);
    let sum = 0;
    for (let i = 0; i < 14; i++) sum += this.freq[i];
    return Math.min(1, sum / (14 * 190));
  }

  /* --------------------------- sfx --------------------------- */
  private tone(type: OscillatorType, f: number, t: number, dur: number, vol: number, end?: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (end) o.frequency.exponentialRampToValueAtTime(end, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private canFx() {
    return this.ready && getPrefs().fx;
  }

  hover() {
    if (!this.canFx()) return;
    const now = performance.now();
    if (now - this.lastHover < 70) return;
    this.lastHover = now;
    const n = PENTA[Math.floor(Math.random() * PENTA.length)];
    this.tone("sine", midi(n), this.ctx!.currentTime, 0.16, 0.045);
  }

  note(i: number) {
    if (!this.canFx()) return;
    const now = performance.now();
    if (now - this.lastHover < 40) return;
    this.lastHover = now;
    this.tone("triangle", midi(PENTA[i % PENTA.length]), this.ctx!.currentTime, 0.45, 0.09);
  }

  click() {
    if (!this.canFx()) return;
    const t = this.ctx!.currentTime;
    this.tone("triangle", 660, t, 0.12, 0.09, 1320);
    this.tone("sine", 1320, t + 0.05, 0.18, 0.05);
  }

  tick(i = 0) {
    if (!this.canFx()) return;
    const now = performance.now();
    if (now - this.lastTick < 120) return;
    this.lastTick = now;
    this.tone("sine", midi(PENTA[i % PENTA.length] + 12), this.ctx!.currentTime, 0.3, 0.05);
  }

  toggle(on: boolean) {
    if (!this.ready) return;
    const t = this.ctx!.currentTime;
    if (on) {
      this.tone("triangle", 520, t, 0.1, 0.07);
      this.tone("triangle", 780, t + 0.07, 0.14, 0.07);
    } else {
      this.tone("triangle", 780, t, 0.1, 0.07);
      this.tone("triangle", 520, t + 0.07, 0.14, 0.07);
    }
  }

  whoosh(strength = 1) {
    if (!this.canFx()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(260, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12 * strength, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
    src.stop(t + 0.8);
  }

  boot() {
    if (!this.ready) return;
    const t = this.ctx!.currentTime;
    this.tone("sine", 70, t, 1.4, 0.35, 28);
    [0, 4, 7, 12, 16].forEach((n, i) => this.tone("triangle", midi(57 + n), t + 0.12 + i * 0.09, 0.9, 0.07));
    this.whoosh(1.4);
  }

  charge(p: number) {
    if (!this.canFx()) return;
    const now = performance.now();
    if (now - this.lastCharge < 55) return;
    this.lastCharge = now;
    this.tone("sawtooth", 140 + p * 900, this.ctx!.currentTime, 0.14, 0.035 + p * 0.04);
  }

  success() {
    if (!this.ready) return;
    const t = this.ctx!.currentTime;
    [60, 64, 67, 72, 76, 79].forEach((n, i) => this.tone("triangle", midi(n), t + i * 0.07, 0.8, 0.08));
    this.tone("sine", 60, t, 0.9, 0.3, 30);
    this.whoosh(1.2);
  }
}

export const audio = new Engine();
