// Sound effects service using Web Audio API (Zero external assets required)

class SoundService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private lastSoundTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_planner_sound_enabled');
      this.soundEnabled = saved !== null ? saved === 'true' : true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_planner_sound_enabled', String(enabled));
    }
    if (enabled) {
      this.playButtonClick();
    }
  }

  public toggleSound(): boolean {
    this.setEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  // General Button / Menu / UI Click: Crisp tactile pop
  public playButtonClick(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.lastSoundTime = Date.now();

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Loading Action (상차 완료 vs 상차 해제): Rewarding affirmative chime vs softer pop
  public playLoadSound(isLoaded: boolean): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.lastSoundTime = Date.now();

    try {
      const now = ctx.currentTime;

      if (isLoaded) {
        // Bright affirmative 2-tone chime for loading completion
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.05); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.setValueAtTime(1174.66, now + 0.05); // D6

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.16);
        osc2.stop(now + 0.16);
      } else {
        // Soft cancel/unload pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.08); // E4

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {}
  }

  // Delivery / Complete / Save Sound
  public playSuccessSound(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.lastSoundTime = Date.now();

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.14, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.12);
      });
    } catch {}
  }

  // Navigation / Date change / Filter select
  public playTapSound(): void {
    this.playButtonClick();
  }

  // Global listener for all buttons, menus, and clickable items
  public initGlobalClickListener(): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleClick = (e: MouseEvent) => {
      // Throttle if specific sound was played very recently
      if (Date.now() - this.lastSoundTime < 40) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Detect button, role="button", menu, select, input or anything clickable
      const isClickable = target.closest(
        'button, [role="button"], a, input[type="checkbox"], input[type="radio"], select, .cursor-pointer, [data-clickable="true"]'
      );

      if (isClickable) {
        this.playButtonClick();
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => {
      window.removeEventListener('click', handleClick, true);
    };
  }
}

export const soundService = new SoundService();
