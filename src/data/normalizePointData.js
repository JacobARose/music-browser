import { Color } from "three";

function normalizeColor(inputColor) {
  if (!inputColor) {
    return "#ffffff";
  }
  if (typeof inputColor === "string") {
    return inputColor;
  }
  if (inputColor instanceof Color) {
    return `#${inputColor.getHexString()}`;
  }
  return "#ffffff";
}

export function normalizePointData(rawPoints) {
  return rawPoints.map((point, index) => ({
    id: point.id ?? `point-${index}`,
    position: {
      x: point.position?.x ?? point.x ?? 0,
      y: point.position?.y ?? point.y ?? 0,
      z: point.position?.z ?? point.z ?? 0,
    },
    color: normalizeColor(point.color),
    sound: point.sound ?? {
      type: "tone",
      frequency: point.frequency ?? 440,
    },
    metadata: point.metadata ?? {},
  }));
}
