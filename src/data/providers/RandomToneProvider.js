import { Color } from "three";
import { normalizePointData } from "../normalizePointData.js";

export class RandomToneProvider {
  async getPoints(options = {}) {
    const pointCount = options.pointCount ?? 500;
    const spread = options.spread ?? 50;
    const points = [];

    for (let i = 0; i < pointCount; i += 1) {
      points.push({
        id: `random-${i}`,
        position: {
          x: (Math.random() - 0.5) * spread,
          y: (Math.random() - 0.5) * spread,
          z: (Math.random() - 0.5) * spread,
        },
        color: new Color().setHSL(Math.random(), 0.8, 0.6),
        sound: {
          type: "tone",
          frequency: 200 + Math.random() * 600,
        },
      });
    }

    return normalizePointData(points);
  }
}
