class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext() {
    if (!this.audioContext) {
      this.initialize();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', fadeOut: boolean = true) {
    if (!this.enabled) return;
    
    this.ensureContext();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);

      if (fadeOut) {
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      }

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    
    this.ensureContext();
    if (!this.audioContext) return;

    try {
      const gainNode = this.audioContext.createGain();
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

      frequencies.forEach((freq) => {
        const oscillator = this.audioContext!.createOscillator();
        oscillator.connect(gainNode);
        oscillator.frequency.value = freq;
        oscillator.type = type;
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + duration);
      });
    } catch (e) {
      console.warn('Error playing chord:', e);
    }
  }

  playDrop() {
    this.playTone(400, 0.1, 'sine', true);
    setTimeout(() => {
      this.playTone(300, 0.15, 'sine', true);
    }, 50);
  }

  playWin() {
    const frequencies = [523.25, 659.25, 783.99];
    this.playChord(frequencies, 0.5, 'sine');
    setTimeout(() => {
      this.playChord([659.25, 783.99, 987.77], 0.5, 'sine');
    }, 300);
  }

  playLose() {
    const frequencies = [392, 349.23, 311.13];
    this.playChord(frequencies, 0.6, 'sawtooth');
  }

  playDraw() {
    this.playTone(440, 0.2, 'sine', true);
    setTimeout(() => {
      this.playTone(440, 0.2, 'sine', true);
    }, 200);
  }

  playGameStart() {
    const frequencies = [523.25, 659.25];
    this.playChord(frequencies, 0.3, 'sine');
    setTimeout(() => {
      this.playTone(783.99, 0.4, 'sine', true);
    }, 200);
  }

  playNotification() {
    this.playTone(600, 0.15, 'sine', true);
    setTimeout(() => {
      this.playTone(700, 0.15, 'sine', true);
    }, 100);
  }

  playClick() {
    this.playTone(800, 0.05, 'square', false);
  }

  playError() {
    const frequencies = [200, 150];
    this.playChord(frequencies, 0.3, 'sawtooth');
  }
}

export const soundEngine = new SoundEngine();

