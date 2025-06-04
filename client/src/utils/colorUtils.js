// utils/colorUtils.js

export const COLOR_KEYS = [
  "background_color", "text_color", "title_color", "button_text_color"
];

export function extractColorsRecursively(node, currentPath, foundColors, idCounter) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      extractColorsRecursively(item, `${currentPath}[${index}]`, foundColors, idCounter);
    });
  } else if (typeof node === "object" && node !== null) {
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const value = node[key];
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (COLOR_KEYS.includes(key) && typeof value === "string" && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value)) {
          foundColors.push({
            id: `instance-${idCounter.current++}`,
            path: newPath,
            originalValue: value,
          });
        }

        if (typeof value === "object") {
          extractColorsRecursively(value, newPath, foundColors, idCounter);
        }
      }
    }
  }
  return foundColors;
}

export function categorizeColorInstances(colorInstances) {
  const categories = {
    background: [],
    text: [],
    button: [],
  };

  colorInstances.forEach(instance => {
    const key = instance.path.split(".").pop();
    if (key.includes("background")) {
      categories.background.push(instance);
    } else if (key.includes("text")) {
      categories.text.push(instance);
    } else if (key.includes("button")) {
      categories.button.push(instance);
    }
  });

  return categories;
}