/**
 * kai - Financial Intelligence Agent
 * SoundService - Haptic Audio Feedback
 * 
 * Uses Web Audio API to synthesize clean, high-performance UI sounds
 * without requiring external assets. Provides a "tangible" feel to the interface.
 */

class SoundService {
    private context: AudioContext | null = null;

    private initContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    /**
     * Play a specific UI sound effect
     */
    public play(type: 'start' | 'stop' | 'report' | 'error' | 'click') {
        try {
            this.initContext();
            if (!this.context) return;

            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.connect(gain);
            gain.connect(this.context.destination);

            switch (type) {
                case 'start':
                    // Soft rising swell
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;

                case 'stop':
                    // Subtle descending tone
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;

                case 'report':
                    // Deep, crisp "chime" (harmonic)
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(659.25, now); // E5
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

                    // Second harmonic for richness
                    const osc2 = this.context.createOscillator();
                    const gain2 = this.context.createGain();
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(1318.5, now); // E6
                    osc2.connect(gain2);
                    gain2.connect(this.context.destination);
                    gain2.gain.setValueAtTime(0, now);
                    gain2.gain.linearRampToValueAtTime(0.05, now + 0.05);
                    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

                    osc.start(now);
                    osc.stop(now + 0.8);
                    osc2.start(now);
                    osc2.stop(now + 0.5);
                    break;

                case 'click':
                    // Tight, high-pitched mechanical click
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(1200, now);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;

                case 'error':
                    // Low warning pulse
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(80, now);
                    osc.frequency.linearRampToValueAtTime(60, now + 0.2);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
            }
        } catch (e) {
            console.warn('SoundService: Playback failed', e);
        }
    }
}

export const soundService = new SoundService();
