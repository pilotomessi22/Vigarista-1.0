// Web Audio API synthesizer for realistic Sci-Fi / Cyber / Hacker sound effects

class HackerAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Main Cyber Hacker Access Sound:
   * Fast data frequency scan chirp + digital burst + resonant cyber chord + bass power whoosh
   */
  public playHackerAccessSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Digital data burst (fast randomized square/saw chirp pulses)
      const burstFreqs = [520, 880, 1040, 680, 1420, 960, 1780, 1200, 2100];
      burstFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.035);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + i * 0.035 + 0.03);

        gain.gain.setValueAtTime(0.08, now + i * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.035);
        osc.stop(now + i * 0.035 + 0.045);
      });

      // 2. Futuristic Sub Bass Power Sweep (Cyber whoosh)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(240, now + 0.1);
      subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.55);

      subGain.gain.setValueAtTime(0.001, now + 0.1);
      subGain.gain.linearRampToValueAtTime(0.22, now + 0.18);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now + 0.1);
      subOsc.stop(now + 0.65);

      // 3. Cyber resonant chord (Cyberpunk harmony: D minor futuristic pad)
      const chordPitches = [293.66, 440.0, 587.33, 880.0]; // D4, A4, D5, A5
      chordPitches.forEach((pitch) => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        chordOsc.type = 'triangle';
        chordOsc.frequency.setValueAtTime(pitch, now + 0.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.4);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.85);

        chordGain.gain.setValueAtTime(0.001, now + 0.2);
        chordGain.gain.linearRampToValueAtTime(0.09, now + 0.32);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        chordOsc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(ctx.destination);

        chordOsc.start(now + 0.2);
        chordOsc.stop(now + 0.95);
      });

      // 4. Final confirmation high-tech chime
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(1760, now + 0.35); // A6
      chimeOsc.frequency.exponentialRampToValueAtTime(2093, now + 0.48); // C7

      chimeGain.gain.setValueAtTime(0.001, now + 0.35);
      chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.38);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.35);
      chimeOsc.stop(now + 0.82);
    } catch {
      // Audio autoplay gracefully handled
    }
  }

  /**
   * Access Granted Sound (upon successful login / key activation)
   */
  public playAccessGrantedSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch {}
  }

  /**
   * Access Denied / Error Sound
   */
  public playAccessDeniedSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [220, 185].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.1, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.16);
      });
    } catch {}
  }
}

export const hackerAudio = new HackerAudioEngine();
