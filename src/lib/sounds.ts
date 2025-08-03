// Sound effects system for Campus Connect
class SoundEffects {
  private context: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported');
    }
  }

  // Generate sound effects procedurally (no external files needed)
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.context) return null;

    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          value = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
      }
      
      // Apply envelope for smooth sound
      const envelope = Math.exp(-3 * t);
      data[i] = value * envelope * 0.1; // Keep volume low
    }

    return buffer;
  }

  private async loadSounds() {
    if (!this.context) return;

    // Create Campus Connect themed sounds
    this.sounds.swipeRight = this.createTone(800, 0.15) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.swipeLeft = this.createTone(400, 0.15) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.match = this.createTone(1200, 0.3) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.message = this.createTone(1000, 0.1) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.notification = this.createTone(880, 0.2) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.success = this.createTone(1320, 0.25) || new AudioBuffer({ length: 1, sampleRate: 44100 });
  }

  async playSound(soundName: string, volume: number = 0.3) {
    if (!this.context || this.context.state === 'suspended') {
      await this.context?.resume();
    }

    if (!this.sounds[soundName]) {
      await this.loadSounds();
    }

    const buffer = this.sounds[soundName];
    if (!buffer || !this.context) return;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    source.start();
  }

  // Campus Connect specific sounds
  playSwipeRight() {
    this.playSound('swipeRight', 0.2);
  }

  playSwipeLeft() {
    this.playSound('swipeLeft', 0.15);
  }

  playMatch() {
    this.playSound('match', 0.3);
  }

  playMessage() {
    this.playSound('message', 0.2);
  }

  playNotification() {
    this.playSound('notification', 0.25);
  }

  playSuccess() {
    this.playSound('success', 0.3);
  }
}

// Create singleton instance
export const soundEffects = new SoundEffects();

// Initialize on user interaction
export const initializeSounds = () => {
  document.addEventListener('click', () => {
    soundEffects.playSound('');
  }, { once: true });
};