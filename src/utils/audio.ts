// Web Audio API synthesized vintage camera shutter and wind-up sounds

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Authentic mechanical shutter click (twin-lens reflex or vintage 35mm rangefinder)
  playShutter(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Initial mechanical leaf shutter opening click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // 2. Metallic aperture snap
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, now + 0.035);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.5, now + 0.035);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.035);
    osc2.stop(now + 0.11);

    // 3. Film ratchet gear winding sound (0.12s - 0.28s)
    setTimeout(() => {
      this.playFilmWinding();
    }, 120);
  }

  // Film advance ratchet sound
  playFilmWinding(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const clickTime = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200 - i * 150, clickTime);
      osc.frequency.exponentialRampToValueAtTime(300, clickTime + 0.018);

      gain.gain.setValueAtTime(0.25 - i * 0.04, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.025);
    }
  }

  // Soft polaroid print ejection chime
  playEject(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }
}

export const soundEffects = new SoundEffects();
