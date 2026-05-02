import { Color } from "three";
import { normalizePointData } from "../normalizePointData.js";
import { getScaleFrequencies } from "../../music/notes.js";

export class KeyScaleToneProvider {
  async getPoints(options = {}) {
    const pointCount = options.pointCount ?? 500;
    const spread = options.spread ?? 50;
    const key = options.key ?? "C";
    const scale = options.scale ?? "major";

    const frequencies = getScaleFrequencies(key, scale);
    const points = [];

    if (frequencies.length === 0) {
      return [];
    }

    for (let i = 0; i < pointCount; i += 1) {
      const frequency = frequencies[i % frequencies.length];
      points.push({
        id: `scale-${i}`,
        position: {
          x: (Math.random() - 0.5) * spread,
          y: (Math.random() - 0.5) * spread,
          z: (Math.random() - 0.5) * spread,
        },
        color: new Color().setHSL((i % frequencies.length) / frequencies.length, 0.8, 0.6),
        sound: {
          type: "tone",
          frequency,
        },
        metadata: {
          key,
          scale,
        },
      });
    }

    return normalizePointData(points);
  }
}
