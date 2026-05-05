import { KEYS, SCALES } from "../music/scales.js";

export class ControlPanel {
  constructor(onChange) {
    this.onChange = onChange;
    this.root = document.createElement("div");
    this.root.id = "control-panel";
    this.isMenuOpen = true;

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

    this.pitchRangeSelect = this.createSelect("Range", [
      { value: "2", label: "+/- 2 st" },
      { value: "4", label: "+/- 4 st" },
      { value: "6", label: "+/- 6 st" },
      { value: "8", label: "+/- 8 st" },
      { value: "12", label: "+/- 12 st" },
      { value: "24", label: "+/- 24 st" },
    ]);
this.autoReturnCheckbox = document.createElement("input");
    this.autoReturnCheckbox.type = "checkbox";
    this.autoReturnCheckbox.checked = true;
    this.autoReturnLabel = document.createElement("label");
    this.autoReturnLabel.textContent = "Auto Return";
    this.autoReturnLabel.prepend(this.autoReturnCheckbox);

    this.returnTimeSelect = this.createSelect("Return Time (ms)", [
      { value: "100", label: "100 ms" },
      { value: "200", label: "200 ms" },
      { value: "300", label: "300 ms" },
      { value: "500", label: "500 ms" },
      { value: "1000", label: "1000 ms" },
    ]);
    this.returnTimeSelect.value = "200";
    this.returnTimeSelect.parentElement.style.display = "flex";

    this.pitchWheel = this.createPitchWheel();
    this.rotationLocked = false;
    this.sustainActive = false;
    this.returnAnimationId = null;

    this.menuToggleButton = document.createElement("button");
    this.menuToggleButton.type = "button";
    this.menuToggleButton.className = "control-menu-toggle";
    this.menuToggleButton.textContent = "Show Settings";

    this.lockNavigationButton = this.createToggleButton(
      "Lock Navigation",
      "Unlock Navigation"
    );
    this.sustainButton = this.createToggleButton("Sustain On", "Sustain Off");

    this.datasetSelect.value = "keyScale";
    this.keySelect.value = "D";
    this.scaleSelect.value = "mixolydian";
    this.pitchRangeSelect.value = "2";
    this.pitchWheel.slider.value = "0";
    this.pitchWheel.valueDisplay.textContent = "0.00 st";

    const headerRow = document.createElement("div");
    headerRow.className = "control-header";
    const title = document.createElement("div");
    title.className = "control-title";
    title.textContent = "Settings";
    headerRow.appendChild(title);
    headerRow.appendChild(this.menuToggleButton);

    const buttonRow = document.createElement("div");
    buttonRow.className = "control-button-row";
    buttonRow.appendChild(this.lockNavigationButton);
    buttonRow.appendChild(this.sustainButton);

    this.collapsible = document.createElement("div");
    this.collapsible.className = "control-collapsible";
    this.collapsible.hidden = !this.isMenuOpen;

    const modeSection = this.createSection("Mode", [
      this.datasetSelect.parentElement,
      this.keySelect.parentElement,
      this.scaleSelect.parentElement,
    ]);
     const pitchSettingsSection = this.createSection("Pitch Bend Wheel", [
       this.autoReturnLabel,
       this.returnTimeSelect.parentElement,
       this.pitchRangeSelect.parentElement,
     ]);

    this.collapsible.appendChild(modeSection);
    this.collapsible.appendChild(pitchSettingsSection);

    this.root.appendChild(headerRow);
    this.root.appendChild(buttonRow);
    this.root.appendChild(this.collapsible);
    this.root.appendChild(this.pitchWheel.container);
    document.body.appendChild(this.root);

    this.menuToggleButton.addEventListener("click", this.handleMenuToggle);
    this.datasetSelect.addEventListener("change", this.emitChange);
    this.keySelect.addEventListener("change", this.emitChange);
    this.scaleSelect.addEventListener("change", this.emitChange);
    this.pitchRangeSelect.addEventListener("change", this.handlePitchRangeChange);
    this.autoReturnCheckbox.addEventListener("change", this.handleAutoReturnChange);
    this.returnTimeSelect.addEventListener("change", this.emitChange);
    this.pitchWheel.slider.addEventListener("input", this.handlePitchBendInput);
    this.pitchWheel.slider.addEventListener("pointerup", this.handlePitchWheelRelease);
    this.pitchWheel.slider.addEventListener("pointercancel", this.handlePitchWheelRelease);
    this.pitchWheel.slider.addEventListener("mouseup", this.handlePitchWheelRelease);
    this.lockNavigationButton.addEventListener("click", this.handleRotationToggle);
    this.sustainButton.addEventListener("click", this.handleSustainToggle);

    this.updateVisibility();
    this.handlePitchRangeChange();
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

  createSection(titleText, elements) {
    const section = document.createElement("div");
    section.className = "control-section";

    const heading = document.createElement("div");
    heading.className = "control-section-heading";
    heading.textContent = titleText;
    section.appendChild(heading);

    elements.forEach((item) => section.appendChild(item));
    return section;
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

    container.appendChild(label);
    container.appendChild(slider);
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

  handleMenuToggle = () => {
    this.isMenuOpen = !this.isMenuOpen;
    this.collapsible.hidden = !this.isMenuOpen;
    this.menuToggleButton.textContent = this.isMenuOpen
      ? "Hide Settings"
      : "Show Settings";
  };

  handleRotationToggle = () => {
    this.rotationLocked = !this.rotationLocked;
    this.lockNavigationButton.textContent = this.rotationLocked
      ? this.lockNavigationButton.dataset.activeText
      : this.lockNavigationButton.dataset.inactiveText;
    this.emitChange();
  };

  handleSustainToggle = () => {
    this.sustainActive = !this.sustainActive;
    this.sustainButton.textContent = this.sustainActive
      ? this.sustainButton.dataset.activeText
      : this.sustainButton.dataset.inactiveText;
    this.emitChange();
  };

   handlePitchRangeChange = () => {
     const range = parseFloat(this.pitchRangeSelect.value);
     const slider = this.pitchWheel.slider;
     slider.min = String(-range);
     slider.max = String(range);

     const currentValue = parseFloat(slider.value);
     if (currentValue > range) {
       slider.value = String(range);
     }
     if (currentValue < -range) {
       slider.value = String(-range);
     }

     this.updatePitchValueDisplay();
     this.emitChange();
   };

   handleAutoReturnChange = () => {
     this.returnTimeSelect.parentElement.style.display = this.autoReturnCheckbox.checked
       ? "flex"
       : "none";
     this.cancelReturnAnimation();
     this.emitChange();
   };

   handlePitchBendInput = () => {
     this.cancelReturnAnimation();
     this.updatePitchValueDisplay();
     this.emitChange();
   };

   cancelReturnAnimation = () => {
     if (this.returnAnimationId !== null) {
       cancelAnimationFrame(this.returnAnimationId);
       this.returnAnimationId = null;
     }
   };

handlePitchWheelRelease = () => {
    if (this.autoReturnCheckbox.checked) {
      this.cancelReturnAnimation();
      const startValue = parseFloat(this.pitchWheel.slider.value);
      const duration = parseInt(this.returnTimeSelect.value);
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newValue = startValue * (1 - progress);
        this.pitchWheel.slider.value = newValue;
        this.updatePitchValueDisplay();
        this.emitChange();

        if (progress < 1) {
          this.returnAnimationId = requestAnimationFrame(animate);
        } else {
          this.returnAnimationId = null;
        }
      };

      this.returnAnimationId = requestAnimationFrame(animate);
    }
  };

  updatePitchValueDisplay() {
    const value = parseFloat(this.pitchWheel.slider.value);
    this.pitchWheel.valueDisplay.textContent = `${value.toFixed(2)} st`;
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
       pitchBend: parseFloat(this.pitchWheel.slider.value),
       pitchRange: parseFloat(this.pitchRangeSelect.value),
       pitchAutoReturn: this.autoReturnCheckbox.checked,
       rotationLocked: this.rotationLocked,
       sustain: this.sustainActive,
       pitchReturnTime: parseInt(this.returnTimeSelect.value),
     };
   }
}
