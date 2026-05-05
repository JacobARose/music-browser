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
    this.rotationLocked = false;
    this.sustainActive = false;
    this.lockRotationButton = this.createToggleButton("Lock Rotation", "Unlock Rotation");
    this.sustainButton = this.createToggleButton("Sustain On", "Sustain Off");

    this.datasetSelect.value = "random";
    this.keySelect.value = "C";
    this.scaleSelect.value = "major";
    this.pitchWheel.slider.value = "0";
    this.pitchWheel.valueDisplay.textContent = "0.00 st";

    const buttonRow = document.createElement("div");
    buttonRow.className = "control-button-row";
    buttonRow.appendChild(this.lockRotationButton);
    buttonRow.appendChild(this.sustainButton);

    this.root.appendChild(this.datasetSelect.parentElement);
    this.root.appendChild(this.keySelect.parentElement);
    this.root.appendChild(this.scaleSelect.parentElement);
    this.root.appendChild(buttonRow);
    this.root.appendChild(this.pitchWheel.container);
    document.body.appendChild(this.root);

    this.datasetSelect.addEventListener("change", this.emitChange);
    this.keySelect.addEventListener("change", this.emitChange);
    this.scaleSelect.addEventListener("change", this.emitChange);
    this.pitchWheel.slider.addEventListener("input", this.handlePitchBendInput);
    this.lockRotationButton.addEventListener("click", this.handleRotationToggle);
    this.sustainButton.addEventListener("click", this.handleSustainToggle);

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

  createToggleButton(labelText, activeText) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-toggle-button";
    button.textContent = labelText;
    button.dataset.activeText = activeText;
    button.dataset.inactiveText = labelText;
    return button;
  }

  handleRotationToggle = () => {
    this.rotationLocked = !this.rotationLocked;
    this.lockRotationButton.textContent = this.rotationLocked
      ? this.lockRotationButton.dataset.activeText
      : this.lockRotationButton.dataset.inactiveText;
    this.emitChange();
  };

  handleSustainToggle = () => {
    this.sustainActive = !this.sustainActive;
    this.sustainButton.textContent = this.sustainActive
      ? this.sustainButton.dataset.activeText
      : this.sustainButton.dataset.inactiveText;
    this.emitChange();
  };

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
      rotationLocked: this.rotationLocked,
      sustain: this.sustainActive,
    };
  }
}
