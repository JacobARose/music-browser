import { ToneAudioEngine } from "../audio/ToneAudioEngine.js";
import { KeyScaleToneProvider } from "../data/providers/KeyScaleToneProvider.js";
import { RandomToneProvider } from "../data/providers/RandomToneProvider.js";
import { HoverInteractionEngine } from "../interaction/HoverInteractionEngine.js";
import { ControlPanel } from "../ui/ControlPanel.js";
import { PointCloudView } from "../visualization/PointCloudView.js";
import { SceneManager } from "../visualization/SceneManager.js";

export class AppController {
  constructor({ container }) {
    this.sceneManager = new SceneManager(container);
    this.sceneManager.attachResizeHandler();

    this.audioEngine = new ToneAudioEngine();
    this.providers = {
      random: new RandomToneProvider(),
      keyScale: new KeyScaleToneProvider(),
    };

    this.points = [];
    this.sustainedVoiceIds = new Set();
    this.sustainedPoints = new Map();
    this.currentHoverPoint = null;
    this.hoveredPointId = null;
    this.lastActivePoint = null;
    this.pointerActivePointById = new Map();
    this.hoverVoiceId = null;
    this.controlState = {
      dataset: "random",
      key: "C",
      scale: "major",
      octaveMin: 2,
      octaveMax: 5,
      pitchBend: 0,
      pitchRange: 2,
      pitchAutoReturn: true,
      rotationLocked: false,
      sustain: false,
      noteDecayTime: 0.5,
    };

    this.pointCloudView = new PointCloudView(this.sceneManager.scene);
    this.hoverInteraction = new HoverInteractionEngine({
      camera: this.sceneManager.camera,
      interactiveObject: null,
      points: [],
    });

    this.hoverInteraction.attachMouseListener();
    this.hoverInteraction.attachPointerListeners(this.sceneManager.renderer.domElement);
    this.hoverInteraction.setOnPointChange((point) => {
      this.currentHoverPoint = point;
      if (!this.controlState.sustain) {
        this.handleHoverPoint(point);
      }
    });

    this.hoverInteraction.setOnPointerPointChange(({ pointerId, point }) => {
      const voiceId = `pointer-${pointerId}`;
      const previousPointId = this.pointerActivePointById.get(pointerId) ?? null;
      const nextPointId = point ? point.id : null;

      if (this.controlState.sustain) {
        if (!previousPointId && nextPointId) {
          if (this.sustainedPoints.has(point.id)) {
            const existingVoiceId = this.sustainedPoints.get(point.id);
            this.audioEngine.stop(existingVoiceId, this.controlState.noteDecayTime);
            this.sustainedVoiceIds.delete(existingVoiceId);
            this.sustainedPoints.delete(point.id);
            this.pointCloudView.removeActiveHighlight(point.id);
            if (this.lastActivePoint?.id === point.id) {
              this.lastActivePoint = null;
            }
          } else {
            const sustainVoiceId = `sustain-${point.id}-${Date.now()}`;
            if (this.hoveredPointId === point.id && this.hoverVoiceId) {
              this.audioEngine.stop(this.hoverVoiceId, this.controlState.noteDecayTime);
              this.hoverVoiceId = null;
            }
            this.sustainedVoiceIds.add(sustainVoiceId);
            this.sustainedPoints.set(point.id, sustainVoiceId);
            this.lastActivePoint = point;
            this.pointCloudView.addActiveHighlight(point);
            this.audioEngine.play(point.sound, sustainVoiceId);
          }
        }

        if (nextPointId) {
          this.pointerActivePointById.set(pointerId, nextPointId);
        } else {
          this.pointerActivePointById.delete(pointerId);
        }
        return;
      }

      if (point) {
        this.audioEngine.play(point.sound, voiceId);
      } else {
        this.audioEngine.stop(voiceId, this.controlState.noteDecayTime);
      }

      if (nextPointId) {
        this.pointerActivePointById.set(pointerId, nextPointId);
      } else {
        this.pointerActivePointById.delete(pointerId);
      }
    });

    this.hoverInteraction.setOnPointerDoubleTap(this.handlePointerDoubleTap);
    this.controlPanel = new ControlPanel(this.onControlPanelChange);
  }

  onControlPanelChange = (nextState) => {
    const hasPointConfigChanged =
      nextState.dataset !== this.controlState.dataset ||
      nextState.key !== this.controlState.key ||
      nextState.scale !== this.controlState.scale ||
      nextState.octaveMin !== this.controlState.octaveMin ||
      nextState.octaveMax !== this.controlState.octaveMax;

    const rotationLockChanged =
      nextState.rotationLocked !== this.controlState.rotationLocked;
    const sustainReleased = this.controlState.sustain && !nextState.sustain;

    this.controlState = nextState;
    this.audioEngine.setPitchBend(this.controlState.pitchBend);

    if (rotationLockChanged) {
      this.sceneManager.setRotationEnabled(!this.controlState.rotationLocked);
    }

    if (sustainReleased) {
      this.sustainedVoiceIds.forEach((voiceId) => {
        this.audioEngine.stop(voiceId, this.controlState.noteDecayTime);
      });
      this.sustainedVoiceIds.clear();
      this.sustainedPoints.clear();
      this.pointCloudView.clearActiveHighlights();
    }

    if (hasPointConfigChanged) {
      this.loadPoints();
    }
  };

  handleHoverPoint(point) {
    const nextPointId = point?.id ?? null;
    if (nextPointId === this.hoveredPointId) {
      return;
    }

    if (this.hoverVoiceId) {
      this.audioEngine.stop(this.hoverVoiceId, this.controlState.noteDecayTime);
      this.hoverVoiceId = null;
    }

    if (this.hoveredPointId && !this.sustainedPoints.has(this.hoveredPointId)) {
      this.pointCloudView.removeActiveHighlight(this.hoveredPointId);
    }

    this.hoveredPointId = nextPointId;
    if (!point) {
      return;
    }

    this.hoverVoiceId = `hover-${point.id}`;
    this.pointCloudView.addActiveHighlight(point);
    this.audioEngine.play(point.sound, this.hoverVoiceId);
  }

  handlePointerDoubleTap = ({ point }) => {
    if (!point || this.controlState.sustain) {
      return;
    }

    this.toggleSustainPoint(point);
  };

  toggleSustainPoint(point) {
    if (this.sustainedPoints.has(point.id)) {
      const voiceId = this.sustainedPoints.get(point.id);
      this.audioEngine.stop(voiceId, this.controlState.noteDecayTime);
      this.sustainedVoiceIds.delete(voiceId);
      this.sustainedPoints.delete(point.id);
      this.pointCloudView.removeActiveHighlight(point.id);
      if (this.lastActivePoint?.id === point.id) {
        this.lastActivePoint = null;
      }
      return;
    }

    if (this.hoveredPointId === point.id && this.hoverVoiceId) {
      this.audioEngine.stop(this.hoverVoiceId, this.controlState.noteDecayTime);
      this.hoverVoiceId = null;
    }

    const sustainVoiceId = `sustain-${point.id}-${Date.now()}`;
    this.sustainedVoiceIds.add(sustainVoiceId);
    this.sustainedPoints.set(point.id, sustainVoiceId);
    this.lastActivePoint = point;
    this.pointCloudView.addActiveHighlight(point);
    this.audioEngine.play(point.sound, sustainVoiceId);
  }

  async start() {
    await this.audioEngine.init();
    this.audioEngine.setPitchBend(this.controlState.pitchBend);
    await this.loadPoints();
    this.animate();
  }

  async loadPoints() {
    const provider = this.providers[this.controlState.dataset];
    if (!provider) {
      return;
    }

    this.points = await provider.getPoints(this.controlState);
    this.pointCloudView.setPoints(this.points);
    this.hoverInteraction.setPoints(this.points);
    this.hoverInteraction.setInteractiveObject(this.pointCloudView.getInteractiveObject());
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.sceneManager.update();
    this.hoverInteraction.tick();
    this.sceneManager.render();
  };
}
