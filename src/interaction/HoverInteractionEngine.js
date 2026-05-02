import { Raycaster, Vector2 } from "three";

export class HoverInteractionEngine {
  constructor({ camera, interactiveObject, points }) {
    this.camera = camera;
    this.interactiveObject = interactiveObject;
    this.points = points;
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.hoveredIndex = null;
    this.raycaster.params.Points.threshold = 1.0;
    this.onPointChange = null;
  }

  attachMouseListener() {
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  setPoints(points) {
    this.points = points;
    this.hoveredIndex = null;
  }

  setInteractiveObject(object) {
    this.interactiveObject = object;
  }

  setOnPointChange(callback) {
    this.onPointChange = callback;
  }

  tick() {
    if (!this.interactiveObject) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.interactiveObject);
    const nextIndex = intersects.length > 0 ? intersects[0].index : null;

    if (nextIndex === this.hoveredIndex) {
      return;
    }

    this.hoveredIndex = nextIndex;
    if (typeof this.onPointChange !== "function") {
      return;
    }

    if (nextIndex === null) {
      this.onPointChange(null);
      return;
    }

    this.onPointChange(this.points[nextIndex] ?? null);
  }
}
