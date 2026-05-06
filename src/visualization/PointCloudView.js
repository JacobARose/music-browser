import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
} from "three";

export const POINT_ACTIVATION_RADIUS = 1.5;

export class PointCloudView {
  constructor(scene) {
    this.scene = scene;
    this.pointCloud = null;
    this.highlightGeometry = new SphereGeometry(POINT_ACTIVATION_RADIUS, 16, 16);
    this.hoverHighlightMesh = new Mesh(
      this.highlightGeometry,
      new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    this.hoverHighlightMesh.visible = false;
    this.scene.add(this.hoverHighlightMesh);
    this.activeHighlightMeshes = new Map();
  }

  setPoints(points) {
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      this.pointCloud.material.dispose();
    }

    const geometry = new BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);

    points.forEach((point, i) => {
      positions[i * 3] = point.position.x;
      positions[i * 3 + 1] = point.position.y;
      positions[i * 3 + 2] = point.position.z;

      const color = new Color(point.color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 1.5,
      vertexColors: true,
      sizeAttenuation: true,
    });

    this.pointCloud = new Points(geometry, material);
    this.scene.add(this.pointCloud);
  }

  getInteractiveObject() {
    return this.pointCloud;
  }

  addActiveHighlight(point) {
    if (!point || this.activeHighlightMeshes.has(point.id)) {
      return;
    }

    const highlightMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    const highlightMesh = new Mesh(this.highlightGeometry, highlightMaterial);
    highlightMesh.position.set(point.position.x, point.position.y, point.position.z);
    this.scene.add(highlightMesh);
    this.activeHighlightMeshes.set(point.id, highlightMesh);
  }

  removeActiveHighlight(point) {
    const pointId = point?.id ?? point;
    if (!pointId) {
      return;
    }

    const highlightMesh = this.activeHighlightMeshes.get(pointId);
    if (!highlightMesh) {
      return;
    }

    this.scene.remove(highlightMesh);
    highlightMesh.material.dispose();
    this.activeHighlightMeshes.delete(pointId);
  }

  clearActiveHighlights() {
    this.activeHighlightMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.material.dispose();
    });
    this.activeHighlightMeshes.clear();
  }

  highlightPoint(point) {
    if (!point) {
      this.hoverHighlightMesh.visible = false;
      return;
    }

    this.hoverHighlightMesh.position.set(point.position.x, point.position.y, point.position.z);
    this.hoverHighlightMesh.visible = true;
  }
}
