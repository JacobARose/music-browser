export class AudioEngine {
  async init() {
    throw new Error("AudioEngine.init must be implemented");
  }

  play(_soundPayload, _voiceId) {
    throw new Error("AudioEngine.play must be implemented");
  }

  stop(_voiceId) {
    throw new Error("AudioEngine.stop must be implemented");
  }

  stopAll() {
    throw new Error("AudioEngine.stopAll must be implemented");
  }

  setPitchBend(_semitones) {
    throw new Error("AudioEngine.setPitchBend must be implemented");
  }

  stopCurrent() {
    this.stopAll();
  }
}
