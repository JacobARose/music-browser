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

    this.octaveMinSelect = this.createSelect("Min", [
      { value: "0", label: "0" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
      { value: "7", label: "7" },
      { value: "8", label: "8" },
    ]);

    this.octaveMaxSelect = this.createSelect("Max", [
      { value: "0", label: "0" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
      { value: "7", label: "7" },
      { value: "8", label: "8" },
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
    this.pitchWheelIsDragging = false;

    this.menuToggleButton = document.createElement("button");
    this.menuToggleButton.type = "button";
    this.menuToggleButton.className = "control-menu-toggle";
    this.menuToggleButton.textContent = "Hide Settings";

    this.lockNavigationButton = this.createToggleButton(
      "Lock Navigation",
      "Unlock Navigation"
    );
    this.sustainButton = this.createToggleButton("Sustain On", "Sustain Off");

    this.datasetSelect.value = "keyScale";
    this.keySelect.value = "D";
    this.scaleSelect.value = "mixolydian";
    this.pitchRangeSelect.value = "2";
    this.octaveMinSelect.value = "2";
    this.octaveMaxSelect.value = "5";
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

    const octaveSection = this.createSection("Octave", [
      this.octaveMinSelect.parentElement,
      this.octaveMaxSelect.parentElement,
    ]);

    const modeSection = this.createSection("Mode", [
      this.datasetSelect.parentElement,
      this.keySelect.parentElement,
      this.scaleSelect.parentElement,
      octaveSection,
    ]);

    const pitchSettingsSection = this.createSection("Pitch Bend Wheel", [
      this.autoReturnLabel,
      this.returnTimeSelect.parentElement,
      this.pitchRangeSelect.parentElement,
    ]);

    this.decayTimeSelect = this.createSelect("Note Decay (s)", [
      { value: "0.5", label: "0.5 s" },
      { value: "1.0", label: "1.0 s" },
      { value: "1.5", label: "1.5 s" },
      { value: "2.0", label: "2.0 s" },
    ]);
    this.decayTimeSelect.value = "0.5";
    const decaySection = this.createSection("Note Decay (Sustain Off)", [
      this.decayTimeSelect.parentElement,
    ]);

    this.collapsible.appendChild(modeSection);
    this.collapsible.appendChild(pitchSettingsSection);
    this.collapsible.appendChild(decaySection);

    this.root.appendChild(headerRow);
    this.root.appendChild(buttonRow);
    this.root.appendChild(this.collapsible);
    document.body.appendChild(this.root);
    document.body.appendChild(this.pitchWheel.container);

    this.menuToggleButton.addEventListener("click", this.handleMenuToggle);
    this.datasetSelect.addEventListener("change", this.emitChange);
    this.keySelect.addEventListener("change", this.emitChange);
    this.scaleSelect.addEventListener("change", this.emitChange);
    this.octaveMinSelect.addEventListener("change", this.handleOctaveBoundsChange);
    this.octaveMaxSelect.addEventListener("change", this.handleOctaveBoundsChange);
    this.pitchRangeSelect.addEventListener("change", this.handlePitchRangeChange);
    this.autoReturnCheckbox.addEventListener("change", this.handleAutoReturnChange);
    this.returnTimeSelect.addEventListener("change", this.emitChange);
    this.decayTimeSelect.addEventListener("change", this.emitChange);
    this.pitchWheel.slider.addEventListener("pointerdown", this.handlePitchWheelDown);
    this.pitchWheel.slider.addEventListener("pointermove", this.handlePitchWheelMove);
    this.pitchWheel.slider.addEventListener("input", this.handlePitchBendInput);
    this.pitchWheel.slider.addEventListener("pointerup", this.handlePitchWheelRelease);
    this.pitchWheel.slider.addEventListener("pointercancel", this.handlePitchWheelRelease);
    this.pitchWheel.slider.addEventListener("touchmove", this.handleTouchMove, { passive: false });
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

     const currentValue = -parseFloat(slider.value);
     const clampedValue = Math.max(Math.min(currentValue, range), -range);
     slider.value = String(-clampedValue);

     this.updatePitchValueDisplay();
     this.emitChange();
   };

   handleOctaveBoundsChange = () => {
     const minValue = parseInt(this.octaveMinSelect.value, 10);
     const maxValue = parseInt(this.octaveMaxSelect.value, 10);
     const lowerValue = Math.min(minValue, maxValue);
     const upperValue = Math.max(minValue, maxValue);

     this.octaveMinSelect.value = String(lowerValue);
     this.octaveMaxSelect.value = String(upperValue);
     this.emitChange();
   };

   handleAutoReturnChange = () => {
     this.emitChange();
   };

   handlePitchWheelDown = (event) => {
     this.cancelReturnAnimation();
     this.pitchWheelIsDragging = true;
     
     const slider = this.pitchWheel.slider;
     if (event.target === slider) {
       try {
         event.target.setPointerCapture(event.pointerId);
       } catch (e) {
         // ignore capture failures
       }
     }
   };

   handlePitchWheelMove = (event) => {
     if (!this.pitchWheelIsDragging) {
       return;
     }
     
     this.cancelReturnAnimation();
     this._updatePitchWheelFromPointer(event);
   };

   handleTouchMove = (event) => {
     if (!this.pitchWheelIsDragging) {
       return;
     }
     
     event.preventDefault();
   };

   _updatePitchWheelFromPointer = (event) => {
     const slider = this.pitchWheel.slider;
     const rect = slider.getBoundingClientRect();
     const clientY = event.clientY || event.touches?.[0]?.clientY;
     
     if (clientY === undefined) {
       return;
     }
     
     const clickY = clientY - rect.top;
     const trackHeight = rect.height;
     const min = parseFloat(slider.min);
     const max = parseFloat(slider.max);
     const thumbHeight = 24;
     const thumbRadius = thumbHeight / 2;
     const usableTrackStart = thumbRadius;
     const usableTrackHeight = trackHeight - thumbHeight;

     let targetRatio = Math.max(
       0,
       Math.min(1, 1 - (clickY - usableTrackStart) / usableTrackHeight)
     );

     const targetValue = min + targetRatio * (max - min);
     slider.value = String(-targetValue);
     this.updatePitchValueDisplay();
     this.emitChange();
   };

   animatePitchToValue = (targetValue, duration) => {
     this.cancelReturnAnimation();

     const slider = this.pitchWheel.slider;
     const startValue = -parseFloat(slider.value);
     const delta = targetValue - startValue;
     const startTime = performance.now();

     if (duration <= 0 || delta === 0) {
       slider.value = String(-targetValue);
       this.updatePitchValueDisplay();
       this.emitChange();
       return;
     }

     const animate = (currentTime) => {
       const elapsed = currentTime - startTime;
       const progress = Math.min(elapsed / duration, 1);
       slider.value = String(-(startValue + delta * progress));
    this.updatePitchValueDisplay();
    this.emitChange();
    if (progress < 1) {
      this.returnAnimationId = requestAnimationFrame(animate);
    } else {
      this.returnAnimationId = null;
    }
  };

  this.returnAnimationId = requestAnimationFrame(animate);
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
     this.pitchWheelIsDragging = false;
     
     try {
       this.pitchWheel.slider.releasePointerCapture?.(event?.pointerId);
     } catch (e) {
       // ignore release failures
     }
     
     if (this.autoReturnCheckbox.checked) {
       this.cancelReturnAnimation();
       const startValue = -parseFloat(this.pitchWheel.slider.value);
       const duration = parseInt(this.returnTimeSelect.value, 10);
       const startTime = performance.now();

       const animate = (currentTime) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / duration, 1);
         const newValue = startValue * (1 - progress);
         this.pitchWheel.slider.value = String(-newValue);
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

updatePitchValueDisplay = () => {
    const value = -parseFloat(this.pitchWheel.slider.value);
    this.pitchWheel.valueDisplay.textContent = `${value.toFixed(2)} st`;
  };

  emitChange = () => {
    this.updateVisibility();
    this.onChange(this.getValue());
  };

  updateVisibility = () => {
    const isKeyScale = this.datasetSelect.value === "keyScale";
    this.keySelect.parentElement.style.display = isKeyScale ? "flex" : "none";
    this.scaleSelect.parentElement.style.display = isKeyScale ? "flex" : "none";
  };

  getValue = () => {
      return {
        dataset: this.datasetSelect.value,
        key: this.keySelect.value,
        scale: this.scaleSelect.value,
        octaveMin: parseInt(this.octaveMinSelect.value, 10),
        octaveMax: parseInt(this.octaveMaxSelect.value, 10),
        pitchBend: -parseFloat(this.pitchWheel.slider.value),
        pitchRange: parseFloat(this.pitchRangeSelect.value),
        pitchAutoReturn: this.autoReturnCheckbox.checked,
        rotationLocked: this.rotationLocked,
        sustain: this.sustainActive,
        pitchReturnTime: parseInt(this.returnTimeSelect.value),
        noteDecayTime: parseFloat(this.decayTimeSelect.value),
      };
    };
  }

