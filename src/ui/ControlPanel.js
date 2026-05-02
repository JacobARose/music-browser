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

    this.datasetSelect.value = "random";
    this.keySelect.value = "C";
    this.scaleSelect.value = "major";

    this.root.appendChild(this.datasetSelect.parentElement);
    this.root.appendChild(this.keySelect.parentElement);
    this.root.appendChild(this.scaleSelect.parentElement);
    document.body.appendChild(this.root);

    this.datasetSelect.addEventListener("change", this.emitChange);
    this.keySelect.addEventListener("change", this.emitChange);
    this.scaleSelect.addEventListener("change", this.emitChange);

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
    };
  }
}
