// List of keys that typically hold color values in your Elementor-like JSON
const COLOR_KEYS = [
  'background_color',
  'background_color_b', // For gradients
  'background_overlay_color',
  'background_overlay_color_b',
  'color_menu_item',
  'color_menu_item_hover',
  'pointer_color_menu_item_hover',
  'color_menu_item_active',
  'pointer_color_menu_item_active',
  'color_dropdown_item',
  'background_color_dropdown_item',
  'color_dropdown_item_hover',
  'background_color_dropdown_item_hover',
  'color_dropdown_item_active',
  'background_color_dropdown_item_active',
  'icon_color',
  'text_color',
  'title_color',
  'button_text_color',
  'button_background_hover_color',
  'button_hover_border_color',
  'border_color',
  // Add any other specific keys you've identified
];

// Regex for common color formats
const HEX_REGEX = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGBA_REGEX = /^rgba?\(\s*\d+%?\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d\.]+\s*)?\)$/;
const HSLA_REGEX = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d\.]+\s*)?\)$/;


// Helper to generate a somewhat user-friendly name for context
function generateContextName(node, key, path) {
  if (node._title) return `${node._title} - ${key}`;
  if (node.widgetType) return `${node.widgetType} (${node.id || 'N/A'}) - ${key}`;
  if (node.elType) return `${node.elType} (${node.id || 'N/A'}) - ${key}`;
  const pathParts = path.split('.');
  // Return last 2-3 parts of path for some context
  return pathParts.slice(Math.max(pathParts.length - 3, 0)).join(' > ');
}

// Recursive function to extract colors
export function extractColorsRecursively(node, currentPath, foundColors, idCounter) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      extractColorsRecursively(item, `${currentPath}[${index}]`, foundColors, idCounter);
    });
  } else if (typeof node === 'object' && node !== null) {
    // Check for __globals__ first. If a global is actively set for a key,
    // the hardcoded value might be a fallback or an old value.
    // We are interested in colors that are *actually* in effect.
    // If __globals__[key] is empty, it means the hardcoded value for 'key' is used.
    const globals = node.__globals__;

    for (const key in node) {
      if (key === '__globals__') { // Don't recurse into the __globals__ object itself for finding colors
        continue;
      }

      const value = node[key];
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (COLOR_KEYS.includes(key) && typeof value === 'string' && value.trim() !== '') {
        if (HEX_REGEX.test(value) || RGBA_REGEX.test(value) || HSLA_REGEX.test(value)) {
          // Check if this color key is actively overridden by a global setting
          const globalValueForThisKey = globals ? globals[key] : undefined;
          
          // We want to edit the color if:
          // 1. There's no corresponding global setting for this key OR
          // 2. There is a global setting, but it's an empty string (meaning "detach from global")
          if (globalValueForThisKey === undefined || globalValueForThisKey === "") {
            foundColors.push({
              id: `color-${idCounter.current++}`,
              path: newPath,
              originalValue: value,
              currentValue: value,
              contextName: generateContextName(node, key, newPath),
            });
          }
        }
      }
      // Recurse for nested objects/arrays, but not if the current value was already identified as a color string.
      if (typeof value === 'object' && value !== null) {
         extractColorsRecursively(value, newPath, foundColors, idCounter);
      }
    }
  }
  return foundColors;
}