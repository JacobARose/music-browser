export class AudioEngine {
  async init() {
    throw new Error("AudioEngine.init must be implemented");
  }

  play(_soundPayload) {
    throw new Error("AudioEngine.play must be implemented");
  }

  stopCurrent() {
    throw new Error("AudioEngine.stopCurrent must be implemented");
  }
}
