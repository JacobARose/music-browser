import { Raycaster, Vector2 } from "three";

export class HoverInteractionEngine {
  constructor({ camera, interactiveObject, points }) {
    this.camera = camera;
    this.interactiveObject = interactiveObject;
    this.points = points;
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.hoveredIndex = null;
    this.activePointers = new Map();
    this.pointerIndexMap = new Map();
    this.raycaster.params.Points.threshold = 1.0;
    this.onPointChange = null;
    this.onPointerPointChange = null;
  }

  attachMouseListener() {
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  attachPointerListeners(target) {
    if (!target) {
      return;
    }

    target.style.touchAction = "none";
    target.addEventListener("pointerdown", this.handlePointerDown);
    target.addEventListener("pointermove", this.handlePointerMove);
    target.addEventListener("pointerup", this.handlePointerUp);
    target.addEventListener("pointercancel", this.handlePointerUp);
  }

  handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const coords = this._normalizePointer(event);
    this.activePointers.set(event.pointerId, coords);
    this.pointerIndexMap.set(event.pointerId, null);

    try {
      event.target.setPointerCapture(event.pointerId);
    } catch (error) {
      // ignore capture failures
    }

    this._updatePointer(event.pointerId, coords);
  };

  handlePointerMove = (event) => {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    const coords = this._normalizePointer(event);
    this.activePointers.set(event.pointerId, coords);
    this._updatePointer(event.pointerId, coords);
  };

  handlePointerUp = (event) => {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    this.activePointers.delete(event.pointerId);
    this.pointerIndexMap.delete(event.pointerId);
    this._emitPointerChange(event.pointerId, null);
  };

  _normalizePointer(event) {
    const rect = event.target.getBoundingClientRect();
    return new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  _updatePointer(pointerId, normalizedCoords) {
    if (!this.interactiveObject) {
      return;
    }

    this.raycaster.setFromCamera(normalizedCoords, this.camera);
    const intersects = this.raycaster.intersectObject(this.interactiveObject);
    const nextIndex = intersects.length > 0 ? intersects[0].index : null;
    const previousIndex = this.pointerIndexMap.get(pointerId);

    if (nextIndex === previousIndex) {
      return;
    }

    this.pointerIndexMap.set(pointerId, nextIndex);
    this._emitPointerChange(pointerId, nextIndex === null ? null : this.points[nextIndex] ?? null);
  }

  _emitPointerChange(pointerId, point) {
    if (typeof this.onPointerPointChange === "function") {
      this.onPointerPointChange({ pointerId, point });
    }
  }

  setPoints(points) {
    this.points = points;
    this.hoveredIndex = null;
    this.pointerIndexMap.clear();
  }

  setInteractiveObject(object) {
    this.interactiveObject = object;
  }

  setOnPointChange(callback) {
    this.onPointChange = callback;
  }

  setOnPointerPointChange(callback) {
    this.onPointerPointChange = callback;
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
