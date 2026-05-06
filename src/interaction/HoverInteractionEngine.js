import { Raycaster, Vector2 } from "three";
import { POINT_ACTIVATION_RADIUS } from "../visualization/PointCloudView.js";

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
    this.pointerMoved = new Map();
    this.lastTouchTap = { pointId: null, time: 0 };
    this.raycaster.params.Points.threshold = POINT_ACTIVATION_RADIUS;
    this.onPointChange = null;
    this.onPointerPointChange = null;
    this.onPointerDoubleTap = null;
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
    target.addEventListener("dblclick", this.handleDoubleClick);
  }

  handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const coords = this._normalizePointer(event);
    this.activePointers.set(event.pointerId, coords);
    this.pointerIndexMap.set(event.pointerId, null);
    this.pointerMoved.set(event.pointerId, false);

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
    this.pointerMoved.set(event.pointerId, true);
    this._updatePointer(event.pointerId, coords);
  };

  handlePointerUp = (event) => {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    const wasMoved = this.pointerMoved.get(event.pointerId);
    const currentIndex = this.pointerIndexMap.get(event.pointerId);
    const point = currentIndex !== null ? this.points[currentIndex] ?? null : null;

    if (event.pointerType === "touch" && !wasMoved && point) {
      const now = performance.now();
      if (
        this.lastTouchTap.pointId === point.id &&
        now - this.lastTouchTap.time < 300
      ) {
        this.lastTouchTap.pointId = null;
        this.lastTouchTap.time = 0;
        if (typeof this.onPointerDoubleTap === "function") {
          this.onPointerDoubleTap({ pointerId: event.pointerId, point });
        }
      } else {
        this.lastTouchTap.pointId = point.id;
        this.lastTouchTap.time = now;
      }
    }

    this.activePointers.delete(event.pointerId);
    this.pointerIndexMap.delete(event.pointerId);
    this.pointerMoved.delete(event.pointerId);
    this._emitPointerChange(event.pointerId, null);
  };

  handleDoubleClick = (event) => {
    const isMouse = event.pointerType ? event.pointerType === "mouse" : true;
    if (!isMouse) {
      return;
    }

    const normalizedCoords = this._normalizePointer(event);
    if (!this.interactiveObject) {
      return;
    }

    this.raycaster.setFromCamera(normalizedCoords, this.camera);
    const intersects = this.raycaster.intersectObject(this.interactiveObject);
    const point = intersects.length > 0 ? this.points[intersects[0].index] ?? null : null;
    if (point && typeof this.onPointerDoubleTap === "function") {
      this.onPointerDoubleTap({ pointerId: event.pointerId ?? null, point });
    }
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

  setOnPointerDoubleTap(callback) {
    this.onPointerDoubleTap = callback;
  }

  tick() {
    if (!this.interactiveObject || this.activePointers.size > 0) {
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
