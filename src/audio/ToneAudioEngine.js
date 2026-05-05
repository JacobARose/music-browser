import { AudioEngine } from "./AudioEngine.js";

export class ToneAudioEngine extends AudioEngine {
  constructor() {
    super();
    this.audioContext = null;
    this.activeVoices = new Map();
    this.pitchBendSemitones = 0;
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

  setPitchBend(semitones) {
    this.pitchBendSemitones = semitones;
    this.activeVoices.forEach((voice) => {
      if (voice && voice.oscillator) {
        const bentFrequency = this._getBentFrequency(voice.baseFrequency);
        voice.oscillator.frequency.setValueAtTime(
          bentFrequency,
          this.audioContext.currentTime
        );
      }
    });
  }

  play(soundPayload, voiceId) {
    if (!this.audioContext || soundPayload?.type !== "tone") {
      return;
    }

    const id = voiceId ?? `transient-${performance.now()}-${Math.random()}`;
    if (voiceId && this.activeVoices.has(id)) {
      this.stop(id);
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const baseFrequency = soundPayload.frequency;
    const frequency = this._getBentFrequency(baseFrequency);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime);
    if (voiceId) {
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        this.audioContext.currentTime + 0.02
      );
    } else {
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        this.audioContext.currentTime + 0.02
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.5
      );
    }

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();

    const voice = {
      baseFrequency,
      oscillator,
      gainNode,
      transient: !voiceId,
    };

    this.activeVoices.set(id, voice);

    if (!voiceId) {
      oscillator.stop(this.audioContext.currentTime + 0.52);
      oscillator.addEventListener(
        "ended",
        () => {
          this._cleanupVoice(id);
        },
        { once: true }
      );
    }
  }

  stop(voiceId) {
    const voice = this.activeVoices.get(voiceId);
    if (!voice) {
      return;
    }

    const now = this.audioContext.currentTime;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(
      voice.gainNode.gain.value,
      now
    );
    voice.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    voice.oscillator.stop(now + 0.52);
    voice.oscillator.addEventListener(
      "ended",
      () => {
        this._cleanupVoice(voiceId);
      },
      { once: true }
    );
  }

  stopAll() {
    Array.from(this.activeVoices.keys()).forEach((voiceId) => {
      this.stop(voiceId);
    });
  }

  _getBentFrequency(baseFrequency) {
    return baseFrequency * Math.pow(2, this.pitchBendSemitones / 12);
  }

  _cleanupVoice(voiceId) {
    const voice = this.activeVoices.get(voiceId);
    if (!voice) {
      return;
    }

    voice.oscillator.disconnect();
    voice.gainNode.disconnect();
    this.activeVoices.delete(voiceId);
  }
}
