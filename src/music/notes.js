import { KEYS, SCALES } from "./scales.js";

const A4_INDEX = KEYS.indexOf("A") + 12 * 4;

export function noteToFrequency(noteIndex) {
  return 440 * Math.pow(2, (noteIndex - A4_INDEX) / 12);
}

export function getScaleFrequencies(key, scaleName, octaveMin = 3, octaveMax = 6) {
  const keyIndex = KEYS.indexOf(key);
  const scaleIntervals = SCALES[scaleName];

  if (keyIndex < 0 || !scaleIntervals) {
    return [];
  }

  const frequencies = [];
  for (let octave = octaveMin; octave <= octaveMax; octave += 1) {
    for (const interval of scaleIntervals) {
      const noteIndex = keyIndex + interval + octave * 12;
      frequencies.push(noteToFrequency(noteIndex));
    }
  }

  return frequencies;
}
