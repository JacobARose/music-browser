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
    };

    this.pointCloudView = new PointCloudView(this.sceneManager.scene);
    this.hoverInteraction = new HoverInteractionEngine({
      camera: this.sceneManager.camera,
      interactiveObject: null,
      points: [],
    });

    this.hoverInteraction.attachMouseListener();
    this.hoverInteraction.setOnPointChange((point) => {
      this.pointCloudView.highlightPoint(point);
      if (point) {
        this.audioEngine.play(point.sound);
      }
    });

    this.controlPanel = new ControlPanel((nextState) => {
      this.controlState = nextState;
      this.loadPoints();
    });
  }

  async start() {
    await this.audioEngine.init();
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
