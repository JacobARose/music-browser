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

export class PointCloudView {
  constructor(scene) {
    this.scene = scene;
    this.pointCloud = null;
    this.highlightMesh = new Mesh(
      new SphereGeometry(1.5, 16, 16),
      new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    this.highlightMesh.visible = false;
    this.scene.add(this.highlightMesh);
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

  highlightPoint(point) {
    if (!point) {
      this.highlightMesh.visible = false;
      return;
    }

    this.highlightMesh.position.set(point.position.x, point.position.y, point.position.z);
    this.highlightMesh.visible = true;
  }
}
