import { AudioEngine } from "./AudioEngine.js";

export class ToneAudioEngine extends AudioEngine {
  constructor() {
    super();
    this.audioContext = null;
    this.currentOscillator = null;
  }

  async init() {
    if (!this.audioContext) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextCtor();
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  play(soundPayload) {
    if (!this.audioContext || soundPayload?.type !== "tone") {
      return;
    }

    if (this.currentOscillator) {
      this.currentOscillator.stop();
      this.currentOscillator.disconnect();
      this.currentOscillator = null;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      soundPayload.frequency,
      this.audioContext.currentTime
    );

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.5
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
    this.currentOscillator = oscillator;
  }

  stopCurrent() {
    if (!this.currentOscillator) {
      return;
    }

    this.currentOscillator.stop();
    this.currentOscillator.disconnect();
    this.currentOscillator = null;
  }
}
