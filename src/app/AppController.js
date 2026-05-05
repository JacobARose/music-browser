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
    this.controlState = {
      dataset: "random",
      key: "C",
      scale: "major",
      pitchBend: 0,
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
      this.pointCloudView.highlightPoint(point);
      if (point) {
        this.audioEngine.play(point.sound);
      }
    });

    this.hoverInteraction.setOnPointerPointChange(({ pointerId, point }) => {
      const voiceId = `pointer-${pointerId}`;
      if (point) {
        this.audioEngine.play(point.sound, voiceId);
        return;
      }
      this.audioEngine.stop(voiceId);
    });

    this.controlPanel = new ControlPanel(this.onControlPanelChange);
  }

  onControlPanelChange = (nextState) => {
    const hasPointConfigChanged =
      nextState.dataset !== this.controlState.dataset ||
      nextState.key !== this.controlState.key ||
      nextState.scale !== this.controlState.scale;

    this.controlState = nextState;
    this.audioEngine.setPitchBend(this.controlState.pitchBend);

    if (hasPointConfigChanged) {
      this.loadPoints();
    }
  };

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
