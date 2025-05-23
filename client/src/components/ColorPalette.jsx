import "../styles/ColorPalette.css";

const ColorPalette = ({ colors }) => {
  return (
    <div className="color-palette">
      {colors.map((color, index) => (
        <div
          key={index}
          className="color-swatch"
          style={{ backgroundColor: color.currentHex }}
          title={color.originalHex}
        />
      ))}
    </div>
  );
};

export default ColorPalette;