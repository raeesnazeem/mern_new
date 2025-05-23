import React, { useState } from "react";
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

  if (!isOpen || !categorizedPalette) return null;

  const handleSwatchClick = (colorObj) => {
    setPickerColor(colorObj.currentHex || colorObj.originalValue);
    setPickerVisibleFor(colorObj.id); // id = originalHex
  };

  const handlePickerChangeComplete = (color) => {
    setPickerColor(color.hex);
    if (pickerVisibleFor) {
      onPaletteColorChange(pickerVisibleFor, color.hex);
    }
  };

  const handlePickerClose = () => {
    setPickerVisibleFor(null);
  };

  const formatCategoryTitle = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("background", "Background")
      .replace("overlay", "Overlay")
      .replace("menuDropdown", "Menu & Dropdown");
  };

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
                {colors.map((colorObj) => (
                  <div key={colorObj.id} className="swatch-wrapper">
                    <div
                      className="swatch"
                      style={{
                        backgroundColor:
                          colorObj.currentHex || colorObj.originalValue,
                      }}
                      title={colorObj.originalValue}
                      onClick={() => handleSwatchClick(colorObj)}
                    />
                    {pickerVisibleFor === colorObj.id && (
                      <div className="color-picker-popup">
                        <div
                          className="backdrop"
                          onClick={handlePickerClose}
                        />
                        <SketchPicker
                          color={pickerColor}
                          onChangeComplete={handlePickerChangeComplete}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overlay-footer">
        <button onClick={onApplyChanges} className="apply-btn">
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default ColorEditorOverlay;