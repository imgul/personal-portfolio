// Fully synthesised audio + haptics engine (no audio files needed).
export type HapticKind = "light" | "medium" | "heavy" | "success" | "error";

const HAPTIC: Record<HapticKind, number | number[]> = {
  light: 6,
  medium: 14,
  heavy: [24, 30, 24],
  success: [8, 40, 8, 40, 26],
  error: [40, 30, 40],
};

// A minor pentatonic, spread over a few octaves
export const PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];
const CHORDS = [
  [57, 60, 64, 67], // Am7
  [53, 57, 60, 64], // Fmaj7
  [48, 55, 60, 64], // Cmaj7
  [55, 59, 62, 64], // G6
];
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class AudioEngine {
  ctx: AudioContext | null = null;
  musicOn = false;
  sfxOn = false;
  hapticsOn = true;
  intensity = 0.3;

  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicFilter!: BiquadFilterNode;
  private musicOut!: GainNode;
  private drumBus!: GainNode;
  private analyser!: AnalyserNode;
  private noise!: AudioBuffer;
  private freq = new Uint8Array(32);
  private timer: number | undefined;
  private nextT = 0;
  private bar = 0;
  private lastHover = 0;
  private lastWhoosh = 0;
  private smooth = 0;

  get soundOn() {
    return this.musicOn || this.sfxOn;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;
    this.master.connect(comp);
    comp.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // Echo bus
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.375;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const dlp = ctx.createBiquadFilter();
    dlp.type = "lowpass";
    dlp.frequency.value = 2400;
    const wet = ctx.createGain();
    wet.gain.value = 0.4;
    const send = ctx.createGain();
    send.gain.value = 1;
    send.connect(delay);
    delay.connect(dlp);
    dlp.connect(fb);
    fb.connect(delay);
    dlp.connect(wet);
    wet.connect(this.master);

    // Music chain
    this.musicFilter = ctx.createBiquadFilter();
    this.musicFilter.type = "lowpass";
    this.musicFilter.frequency.value = 900;
    this.musicFilter.Q.value = 0.8;
    this.musicOut = ctx.createGain();
    this.musicOut.gain.value = 0;
    this.musicFilter.connect(this.musicOut);
    this.drumBus = ctx.createGain();
    this.drumBus.connect(this.musicOut);
    this.musicOut.connect(this.master);
    const musicSend = ctx.createGain();
    musicSend.gain.value = 0.45;
    this.musicOut.connect(musicSend);
    musicSend.connect(send);

    // SFX chain
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0;
    this.sfxBus.connect(this.master);
    const sfxSend = ctx.createGain();
    sfxSend.gain.value = 0.3;
    this.sfxBus.connect(sfxSend);
    sfxSend.connect(send);

    // Noise buffer
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  setSound(on: boolean) {
    if (on) this.init();
    if (!this.ctx) return;
    this.sfxOn = on;
    this.musicOn = on;
    const t = this.ctx.currentTime;
    this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, t, 0.05);
    this.musicOut.gain.setTargetAtTime(on ? 0.9 : 0, t, 0.35);
    if (on) this.startMusic();
    else this.stopMusic();
  }

  private startMusic() {
    if (this.timer || !this.ctx) return;
    this.nextT = this.ctx.currentTime + 0.1;
    const pump = () => {
      const ctx = this.ctx;
      if (!ctx) return;
      while (this.nextT < ctx.currentTime + 2.4) {
        this.scheduleBar(this.nextT);
        this.nextT += 2;
      }
    };
    pump();
    this.timer = window.setInterval(pump, 500);
  }

  private stopMusic() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  setIntensity(v: number) {
    this.intensity = Math.max(0, Math.min(1, v));
    if (this.ctx && this.musicFilter) {
      this.musicFilter.frequency.setTargetAtTime(500 + this.intensity * 3800, this.ctx.currentTime, 0.4);
    }
  }

  private scheduleBar(t: number) {
    const chord = CHORDS[Math.floor(this.bar / 4) % CHORDS.length];
    if (this.bar % 4 === 0) this.pad(chord, t, 8.6);
    this.bass(chord[0] - 24, t);
    const dens = 0.35 + 0.55 * this.intensity;
    for (let i = 0; i < 4; i++) {
      if (Math.random() < dens) {
        const n = chord[Math.floor(Math.random() * chord.length)] + 12 * (1 + Math.floor(Math.random() * 2));
        this.pluck(n, t + i * 0.5 + (Math.random() < 0.3 ? 0.25 : 0), 0.05 + Math.random() * 0.05, this.musicFilter, "triangle", 1.6);
      }
    }
    if (this.intensity > 0.45) for (let i = 0; i < 4; i++) this.hat(t + i * 0.5 + 0.25, 0.03 + this.intensity * 0.03);
    if (this.intensity > 0.6) {
      this.kick(t, 0.5);
      this.kick(t + 1, 0.4);
    }
    this.bar++;
  }

  private pad(chord: number[], t: number, dur: number) {
    const ctx = this.ctx!;
    chord.forEach((n) => {
      [-7, 7].forEach((det, k) => {
        const o = ctx.createOscillator();
        o.type = k ? "sawtooth" : "triangle";
        o.frequency.value = mtof(n);
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.02, t + 1.8);
        g.gain.setValueAtTime(0.02, t + dur - 2);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.connect(g);
        g.connect(this.musicFilter);
        o.start(t);
        o.stop(t + dur + 0.1);
      });
    });
  }

  private bass(n: number, t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = mtof(n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.9);
    o.connect(g);
    g.connect(this.musicFilter);
    o.start(t);
    o.stop(t + 2);
  }

  private kick(t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    o.connect(g);
    g.connect(this.drumBus);
    o.start(t);
    o.stop(t + 0.4);
  }

  private hat(t: number, vol: number) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f);
    f.connect(g);
    g.connect(this.drumBus);
    s.start(t);
    s.stop(t + 0.08);
  }

  private pluck(midi: number, t: number, vol: number, dest: AudioNode, type: OscillatorType = "sine", dur = 1.2) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = mtof(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private tone(freq: number, dur: number, vol: number, type: OscillatorType = "sine", slideTo?: number) {
    if (!this.ctx || !this.sfxOn) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // ---------- public SFX ----------
  hover() {
    if (!this.ctx || !this.sfxOn) return;
    const now = performance.now();
    if (now - this.lastHover < 70) return;
    this.lastHover = now;
    const n = PENTA[Math.floor(Math.random() * 8) + 2];
    this.pluck(n + 12, this.ctx.currentTime, 0.05, this.sfxBus, "sine", 0.35);
  }

  tick(pitch = 1) {
    this.tone(1800 * pitch, 0.04, 0.035, "square");
  }

  click() {
    this.tone(760, 0.12, 0.12, "sine", 280);
    this.tone(1500, 0.05, 0.03, "square");
  }

  pulse() {
    this.tone(220, 0.35, 0.1, "sine", 70);
  }

  note(i: number, vol = 0.16) {
    if (!this.ctx || !this.sfxOn) return;
    const n = PENTA[((i % PENTA.length) + PENTA.length) % PENTA.length];
    const t = this.ctx.currentTime;
    this.pluck(n, t, vol, this.sfxBus, "triangle", 1.1);
    this.pluck(n + 12, t, vol * 0.35, this.sfxBus, "sine", 0.8);
  }

  chime(i = 0) {
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime;
    [0, 2, 4].forEach((o, k) => this.pluck(PENTA[(i + o) % 8 + 3], t + k * 0.07, 0.06, this.sfxBus, "sine", 0.9));
  }

  success() {
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime;
    [0, 2, 4, 7].forEach((o, k) => this.pluck(PENTA[o + 2], t + k * 0.08, 0.1, this.sfxBus, "triangle", 0.9));
  }

  whoosh(strength = 1) {
    if (!this.ctx || !this.sfxOn) return;
    const now = performance.now();
    if (now - this.lastWhoosh < 700) return;
    this.lastWhoosh = now;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(260, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.28);
    f.frequency.exponentialRampToValueAtTime(380, t + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.14 * Math.min(1.4, strength), t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    s.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    s.start(t);
    s.stop(t + 0.8);
  }

  enter() {
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime;
    this.lastWhoosh = 0;
    this.whoosh(1.4);
    [0, 2, 4, 7, 9].forEach((o, k) => this.pluck(PENTA[o], t + 0.15 + k * 0.09, 0.09, this.sfxBus, "triangle", 1.6));
  }

  // ---------- haptics ----------
  haptic(kind: HapticKind = "light") {
    if (!this.hapticsOn) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(HAPTIC[kind]);
      } catch {
        /* ignore */
      }
    }
    window.dispatchEvent(new CustomEvent("haptic", { detail: kind }));
  }

  // ---------- analysis ----------
  sample(): { bass: number; bars: number[] } {
    if (!this.ctx || !this.sfxOn) {
      this.smooth *= 0.9;
      return { bass: this.smooth, bars: [0, 0, 0, 0] };
    }
    this.analyser.getByteFrequencyData(this.freq);
    const avg = (a: number, b: number) => {
      let s = 0;
      for (let i = a; i <= b; i++) s += this.freq[i];
      return s / ((b - a + 1) * 255);
    };
    const bass = avg(0, 1);
    this.smooth += (bass - this.smooth) * 0.25;
    return { bass: this.smooth, bars: [avg(0, 0), avg(1, 2), avg(3, 6), avg(7, 14)] };
  }
}

export const audio = new AudioEngine();
