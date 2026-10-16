// Web Audio API synthesizer for zero-dependency sound effects

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playDrumroll(durationMs = 2000) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const count = Math.floor(durationMs / 60);

    for (let i = 0; i < count; i++) {
      const time = startTime + i * (0.04 + (i / count) * 0.02);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90 + Math.random() * 40, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.04);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.04);
    }
  }

  public playFanfare() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25, 783.99], // C5 Major
      [587.33, 739.99, 880.00], // D5 Major
      [659.25, 830.61, 987.77], // E5 Major
      [1046.50, 1318.51, 1567.98], // High C6 Major
    ];

    let t = ctx.currentTime;
    chords.forEach((chord, step) => {
      const stepDuration = step === chords.length - 1 ? 0.7 : 0.18;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + stepDuration);
      });
      t += stepDuration;
    });
  }

  public playPop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}

export const sfx = new SoundEffectsManager();
