import "../styles/CategorizedColorPalette.css";

const CategorizedColorPalette = ({ categorizedColors }) => {
  const renderCategory = (categoryName, instances) => {
    if (!instances || instances.length === 0) return null;

    return (
      <div className="palette-category" key={categoryName}>
        <h4>{categoryName}</h4>
        <div className="color-palette">
          {instances.map((instance, index) => (
            <div
              key={index}
              className="color-swatch"
              style={{ backgroundColor: instance.originalValue }}
              title={instance.originalValue}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="categorized-color-palette">
      {renderCategory("Background Colors", categorizedColors.background)}
      {renderCategory(
        "Background Overlay Colors",
        categorizedColors.backgroundOverlay
      )}
      {renderCategory("Menu & Dropdown Colors", categorizedColors.menuDropdown)}
      {renderCategory("Text Colors", categorizedColors.text)}
      {renderCategory("Button Colors", categorizedColors.button)}
      {renderCategory("Border Colors", categorizedColors.border)}
    </div>
  );
};

export default CategorizedColorPalette;
