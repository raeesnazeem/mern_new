import { useEffect, useState } from 'react';

function ColorExtractor({ jsonData }) {
    const [colors, setColors] = useState([]);

    useEffect(() => {
        if (jsonData) {
            const extractedColors = extractColors(jsonData);
            setColors(extractedColors);
            console.log(jsonData)
            console.log(extractedColors)
        }
    }, [jsonData]);

    const extractColors = (data) => {
        const colorPatterns = [
            /^#[0-9A-Fa-f]{3,6}$/i, // Hex colors
            /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i, // RGB
            /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i, // RGBA
            /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i, // HSL
            /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i, // HSLA
        ];

        const colorKeywords = [
            'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 
            'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'transparent'
        ];

        const colors = new Set();

        const traverse = (obj) => {
            if (!obj || typeof obj !== 'object') return;

            Object.entries(obj).forEach(([key, value]) => {
                // Check if the key suggests it might contain color values
                const isColorKey = /color|background|background-color|bg|fill|overlay/i.test(key.toLowerCase());
                
                // Check string values
                if (typeof value === 'string') {
                    const trimmedValue = value.trim().toLowerCase();
                    
                    // Check for hex/rgb/hsl patterns
                    if (colorPatterns.some(pattern => pattern.test(trimmedValue))) {
                        colors.add(trimmedValue);
                    }
                    // Check for color keywords
                    else if (colorKeywords.includes(trimmedValue)) {
                        colors.add(trimmedValue);
                    }
                }
                // Check numeric values that might represent colors (like 0xFFFFFF)
                else if (typeof value === 'number' && value > 0 && key.toLowerCase().includes('color')) {
                    const hexValue = `#${value.toString(16).padStart(6, '0')}`;
                    if (/^#[0-9A-Fa-f]{6}$/i.test(hexValue)) {
                        colors.add(hexValue);
                    }
                }
                // Recursively check nested objects and arrays
                else if (typeof value === 'object' && value !== null) {
                    traverse(value);
                }
            });
        };

        traverse(data);
        return Array.from(colors).sort();
    };

    return (
        <div className="color-extractor">
            <h2>Extracted Colors ({colors.length}):</h2>
            {colors.length > 0 ? (
                <div className="color-grid">
                    {colors.map((color, index) => (
                        <div 
                            key={index} 
                            className="color-swatch"
                            style={{ 
                                backgroundColor: color,
                                color: getContrastColor(color)
                            }}
                            title={color}
                        >
                            {color}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No colors found in this template</p>
            )}
        </div>
    );
}

// Helper function to determine text color based on background
function getContrastColor(color) {
    if (color === 'transparent') return '#000';
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substr(0, 2), 16);
        const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substr(2, 2), 16);
        const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000' : '#fff';
    }
    if (color.startsWith('rgb') || color.startsWith('hsl')) {
        return '#fff'; // Default light text for complex color formats
    }
    // For named colors
    const darkColors = ['black', 'navy', 'darkblue', 'midnightblue', 'darkslategray'];
    return darkColors.includes(color.toLowerCase()) ? '#fff' : '#000';
}

export default ColorExtractor;