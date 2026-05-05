import { KEYS, SCALES } from "../music/scales.js";

export class ControlPanel {
  constructor(onChange) {
    this.onChange = onChange;
    this.root = document.createElement("div");
    this.root.id = "control-panel";

    this.datasetSelect = this.createSelect("Dataset", [
      { value: "random", label: "Random Notes" },
      { value: "keyScale", label: "Key + Scale Notes" },
    ]);
    this.keySelect = this.createSelect(
      "Key",
      KEYS.map((key) => ({ value: key, label: key }))
    );
    this.scaleSelect = this.createSelect(
      "Scale",
      Object.keys(SCALES).map((scaleName) => ({
        value: scaleName,
        label: scaleName,
      }))
    );
    this.pitchWheel = this.createPitchWheel();

    this.datasetSelect.value = "random";
    this.keySelect.value = "C";
    this.scaleSelect.value = "major";
    this.pitchWheel.slider.value = "0";
    this.pitchWheel.valueDisplay.textContent = "0.00 st";

    this.root.appendChild(this.datasetSelect.parentElement);
    this.root.appendChild(this.keySelect.parentElement);
    this.root.appendChild(this.scaleSelect.parentElement);
    this.root.appendChild(this.pitchWheel.container);
    document.body.appendChild(this.root);

    this.datasetSelect.addEventListener("change", this.emitChange);
    this.keySelect.addEventListener("change", this.emitChange);
    this.scaleSelect.addEventListener("change", this.emitChange);
    this.pitchWheel.slider.addEventListener("input", this.handlePitchBendInput);

    this.updateVisibility();
  }

  createSelect(labelText, options) {
    const label = document.createElement("label");
    label.textContent = labelText;

    const select = document.createElement("select");
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });

    label.appendChild(select);
    return select;
  }

  createPitchWheel() {
    const container = document.createElement("div");
    container.className = "pitch-wheel";

    const label = document.createElement("label");
    label.textContent = "Pitch Bend";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-2";
    slider.max = "2";
    slider.step = "0.01";
    slider.value = "0";
    slider.className = "pitch-bend-slider";

    const valueDisplay = document.createElement("span");
    valueDisplay.className = "pitch-bend-value";
    valueDisplay.textContent = "0.00 st";

    label.appendChild(slider);
    container.appendChild(label);
    container.appendChild(valueDisplay);

    return {
      container,
      slider,
      valueDisplay,
    };
  }

  handlePitchBendInput = () => {
    const value = parseFloat(this.pitchWheel.slider.value);
    this.pitchWheel.valueDisplay.textContent = `${value.toFixed(2)} st`;
    this.emitChange();
  };

  emitChange = () => {
    this.updateVisibility();
    this.onChange(this.getValue());
  };

  updateVisibility() {
    const isKeyScale = this.datasetSelect.value === "keyScale";
    this.keySelect.parentElement.style.display = isKeyScale ? "flex" : "none";
    this.scaleSelect.parentElement.style.display = isKeyScale ? "flex" : "none";
  }

  getValue() {
    return {
      dataset: this.datasetSelect.value,
      key: this.keySelect.value,
      scale: this.scaleSelect.value,
      pitchBend: parseFloat(this.pitchWheel.slider.value),
    };
  }
}
