import React, { useState, useEffect, useRef } from "react";
import { SketchPicker } from "react-color";

const ColorEditorOverlay = ({
  isOpen,
  onClose,
  categorizedPalette,
  onPaletteColorChange,
  onApplyChanges,
}) => {
  const [pickerVisibleFor, setPickerVisibleFor] = useState(null);
  const [pickerColor, setPickerColor] = useState("");
  const [changesMap, setChangesMap] = useState(new Map());

  useEffect(() => {
    if (!isOpen) {
      setPickerVisibleFor(null);
      setChangesMap(new Map());
    }
  }, [isOpen]);

  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        handlePickerClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerVisibleFor]);

  if (!isOpen || !categorizedPalette) return null;

  const handleSwatchClick = (colorObj) => {
    setPickerColor(colorObj.originalValue);
    setPickerVisibleFor(colorObj.id); // id = originalHex
  };

  const handlePickerChangeComplete = (color, colorObj) => {
    const newHex = color.hex;
    console.log("Picker changed:", colorObj.originalValue, "→", newHex);

    setPickerColor(newHex);

    // Store change locally
    setChangesMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(colorObj.originalValue, newHex);
      return newMap;
    });
  };

  const handlePickerClose = () => {
    setPickerVisibleFor(null);
  };

  const handleApply = () => {
    if (changesMap.size === 0) {
      alert("No changes to apply.");
      return;
    }

    const changesArray = Array.from(changesMap.entries()).map(
      ([originalHex, newHex]) => ({
        originalHex,
        currentHex: newHex,
      })
    );

    onApplyChanges(changesArray);
    setChangesMap(new Map());
    onClose();
  };

  const formatCategoryTitle = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("background", "Background")
      .replace("overlay", "Overlay")
      .replace("menuDropdown", "Menu & Dropdown");

  return (
    <div className="color-editor-overlay">
      <div className="overlay-header">
        <h3>Edit Palette</h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>

      {/* Render Each Category */}
      <div className="category-sections">
        {Object.entries(categorizedPalette).map(([categoryName, colors]) => {
          if (!colors || colors.length === 0) return null;

          return (
            <div key={categoryName} className="category-group">
              <h4>{formatCategoryTitle(categoryName)}</h4>
              <div className="swatch-palette">
                {colors.map((colorObj) => {
                  const currentHex =
                    changesMap.get(colorObj.originalValue) ||
                    colorObj.originalValue;

                  return (
                    <div key={colorObj.id} className="swatch-wrapper">
                      <div
                        className="swatch"
                        style={{ backgroundColor: currentHex }}
                        title={colorObj.originalValue}
                        onClick={() => handleSwatchClick(colorObj)}
                      />
                      {pickerVisibleFor === colorObj.id && (
                        <div ref={pickerRef} className="color-picker-popup">
                          <div
                            className="backdrop"
                            onClick={handlePickerClose}
                          />
                          <SketchPicker
                            color={currentHex}
                            onChangeComplete={(color) =>
                              handlePickerChangeComplete(color, colorObj)
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overlay-footer">
        <button onClick={handleApply} className="apply-btn">
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default ColorEditorOverlay;
