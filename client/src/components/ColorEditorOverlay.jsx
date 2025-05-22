import React, { useState } from 'react';
import { SketchPicker } from 'react-color'; // Or your preferred color picker

const ColorEditorOverlay = ({
  isOpen,
  onClose,
  palette, // This is displayPalette from parent [{ id, originalHex, currentHex }, ...]
  onPaletteColorChange, // (paletteItemId (originalHex), newHexValue) => void
  onApplyChanges,
  // onSaveChangesToWordPress // If you have a separate save
}) => {
  if (!isOpen) return null;

  const [pickerVisibleFor, setPickerVisibleFor] = useState(null); // Stores the id (originalHex) of the color being edited
  const [pickerColor, setPickerColor] = useState('');

  const handleSwatchClick = (paletteItem) => {
    setPickerColor(paletteItem.currentHex);
    setPickerVisibleFor(paletteItem.id); // id is originalHex
  };

  const handlePickerChangeComplete = (color) => {
    // Update immediately in the picker for live feedback
    setPickerColor(color.hex);
    // Call parent to update the displayPalette state
    if (pickerVisibleFor) {
      onPaletteColorChange(pickerVisibleFor, color.hex);
    }
  };

  const handlePickerClose = () => {
    // The change is already committed by onPaletteColorChange via handlePickerChangeComplete
    setPickerVisibleFor(null);
  };


  return (
    <div style={{ position: 'fixed', top: '80px', right: '20px', width: '300px', maxHeight: '80vh', overflowY: 'auto', background: 'white', border: '1px solid #ccc', padding: '15px', zIndex: 1000, boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3>Edit Palette</h3>
        <button onClick={onClose} style={{background:'none', border:'none', fontSize:'1.5em', cursor:'pointer'}}>&times;</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {palette.map(item => (
          <li key={item.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div
                style={{
                  width: '30px', height: '30px',
                  backgroundColor: item.currentHex,
                  border: '1px solid #ddd', cursor: 'pointer',
                  marginRight: '10px'
                }}
                onClick={() => handleSwatchClick(item)}
              />
              <span>{item.originalHex} <small>(Initially)</small> &rarr; {item.currentHex}</span>
            </div>
            {pickerVisibleFor === item.id && (
              <div style={{ position: 'absolute', right: '100%', top: 0, zIndex: 1002 }}> {/* Position picker next to the panel */}
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex:1001 }} onClick={handlePickerClose} />
                <SketchPicker
                  color={pickerColor}
                  onChangeComplete={handlePickerChangeComplete}
                  // presetColors={[]} /* You can add preset colors */
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      <button onClick={onApplyChanges} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
        Apply Changes to Preview & Reload Iframe
      </button>
      {/* <button onClick={onSaveChangesToWordPress}>Save to WordPress</button> */}
    </div>
  );
};

export default ColorEditorOverlay;