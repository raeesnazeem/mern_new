import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProcessTemplateResults from "../components/ProcessTemplateResults";
import DashboardLayout from "../components/DashboardLayout";
import TopBar from "../components/TopBar";
import ColorPalette from "../components/ColorPalette";
import CategorizedColorPalette from "../components/CategorizedColorPalette";
import ColorEditorOverlay from "../components/ColorEditorOverlay";
import "../styles/TemplatePreviewPage.css";
import "../styles/ColorEditorOverlay.css";

// ----- Helper Constants and Functions (COLOR_KEYS, REGEXES, generateContextName, extractColorsRecursively, setValueByPath) -----

// -------------------------------------------------------------------------------------------------------------------------------
const COLOR_KEYS = [
  "background_color",
  "background_color_b",
  "background_overlay_color",
  "background_overlay_color_b",
  "color_menu_item",
  "color_menu_item_hover",
  "pointer_color_menu_item_hover",
  "color_menu_item_active",
  "pointer_color_menu_item_active",
  "color_dropdown_item",
  "background_color_dropdown_item",
  "color_dropdown_item_hover",
  "background_color_dropdown_item_hover",
  "color_dropdown_item_active",
  "background_color_dropdown_item_active",
  "icon_color",
  "text_color",
  "title_color",
  "button_text_color",
  "button_background_hover_color",
  "button_hover_border_color",
  "border_color",
  "hover_color",
];
const HEX_REGEX = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGBA_REGEX =
  /^rgba?\(\s*\d+%?\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d\.]+\s*)?\)$/;
const HSLA_REGEX =
  /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d\.]+\s*)?\)$/;

function generateContextName(node, key, path) {
  if (node._title) return `${node._title} - ${key}`;
  if (node.widgetType)
    return `${node.widgetType} (${node.id || "N/A"}) - ${key}`;
  if (node.elType) return `${node.elType} (${node.id || "N/A"}) - ${key}`;
  const pathParts = path.split(".");
  return pathParts.slice(Math.max(pathParts.length - 3, 0)).join(" > ");
}

function extractColorsRecursively(node, currentPath, foundColors, idCounter) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      extractColorsRecursively(
        item,
        `${currentPath}[${index}]`,
        foundColors,
        idCounter
      );
    });
  } else if (typeof node === "object" && node !== null) {
    const globals = node.__globals__;
    for (const key in node) {
      if (
        !Object.prototype.hasOwnProperty.call(node, key) ||
        key === "__globals__"
      )
        continue;
      const value = node[key];
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (
        COLOR_KEYS.includes(key) &&
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        if (
          HEX_REGEX.test(value) ||
          RGBA_REGEX.test(value) ||
          HSLA_REGEX.test(value)
        ) {
          const globalValueForThisKey = globals ? globals[key] : undefined;
          if (
            globalValueForThisKey === undefined ||
            globalValueForThisKey === ""
          ) {
            foundColors.push({
              id: `instance-${idCounter.current++}`,
              path: newPath,
              originalValue: value,
              contextName: generateContextName(node, key, newPath),
            });
          }
        }
      }
      if (typeof value === "object" && value !== null) {
        extractColorsRecursively(value, newPath, foundColors, idCounter);
      }
    }
  }
  return foundColors;
}

const setValueByPath = (obj, path, value) => {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKeyIsArrayIndex = !isNaN(parseInt(keys[i + 1], 10));
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = nextKeyIsArrayIndex ? [] : {};
    }
    current = current[key];
  }
  if (current && typeof current === "object" && keys.length > 0) {
    current[keys[keys.length - 1]] = value;
  } else if (keys.length === 1 && typeof obj === "object" && obj !== null) {
    obj[keys[0]] = value;
  } else {
    console.error(
      `Cannot set value for path ${path}. Parent is not an object or path is invalid.`
    );
  }
};

// Helper: Categorize color instances by semantic role
function categorizeColorInstances(colorInstances) {
  const categories = {
    background: [],
    backgroundOverlay: [],
    menuDropdown: [],
    text: [],
    button: [],
    border: [],
  };

  // Helper to check if a color is fully transparent white
  // Process all color instances
  // Helper to check if a color is transparent or semi-transparent white
  function isTransparentWhite(color) {
    color = color.trim().toLowerCase();

    // Match rgba(r,g,b,a)
    const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
    if (rgbaMatch) {
      const [r, g, b, a] = rgbaMatch[1]
        .split(",")
        .map((v) => parseFloat(v.trim()));
      return r === 255 && g === 255 && b === 255 && a < 1;
    }

    // Match hex with alpha channel (#RRGGBBAA)
    const hexAlphaMatch = /^#([0-9a-f]{8})$/i.test(color);
    if (hexAlphaMatch) {
      const alphaChannel = color.slice(-2).toLowerCase();
      return (
        color.startsWith("#ffffff") &&
        [
          "00",
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "08",
          "09",
          "0a",
          "0b",
          "0c",
          "0d",
          "0e",
          "0f",
        ].includes(alphaChannel)
      );
    }

    // Match basic #FFFFFF or #FFF
    const solidWhiteHex = /^#([Ff]{6}|[Ff]{3})$/;
    if (solidWhiteHex.test(color)) {
      return false; // Keep pure white
    }

    // Match named "white"
    if (color === "white") {
      return false; // Keep pure white
    }

    return false; // All other colors are fine
  }

  // Process all color instances
  const seenColors = new Set();

  colorInstances.forEach((instance) => {
    const color = instance.originalValue;

    // Skip if already seen in this category
    if (seenColors.has(color)) return;

    // Skip if it's transparent/semi-transparent white
    if (isTransparentWhite(color)) return;

    seenColors.add(color);

    const key = instance.path.split(".").pop(); // Get last part of path

    if (
      key.includes("background") &&
      !key.includes("overlay") &&
      !key.includes("dropdown")
    ) {
      categories.background.push(instance);
    } else if (key.includes("background") && key.includes("overlay")) {
      categories.backgroundOverlay.push(instance);
    } else if (
      key.includes("menu") ||
      key.includes("dropdown") ||
      key.includes("pointer_color_menu_item")
    ) {
      categories.menuDropdown.push(instance);
    } else if (
      key.includes("text") ||
      key.includes("title") ||
      key.includes("icon")
    ) {
      categories.text.push(instance);
    } else if (
      key.includes("button") ||
      key.includes("hover") ||
      key.includes("active")
    ) {
      categories.button.push(instance);
    } else if (key.includes("border")) {
      categories.border.push(instance);
    }
  });
  // Deduplicate and filter each category
  for (const category in categories) {
    const seenColors = new Set();

    categories[category] = categories[category].filter((instance) => {
      const color = instance.originalValue.trim().toLowerCase();

      // Skip transparent white
      if (isTransparentWhite(color)) {
        return false;
      }

      // Skip duplicates
      if (seenColors.has(color)) {
        return false;
      }

      seenColors.add(color);
      return true;
    });
  }

  return categories;
}
// ----- END OF HELPERS -----

const TemplatePreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [initialRawTemplates, setInitialRawTemplates] = useState(null);
  const [originalJsonProcessed, setOriginalJsonProcessed] = useState(null);
  const [allColorInstances, setAllColorInstances] = useState([]);
  const [displayPalette, setDisplayPalette] = useState([]);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [currentTemplateTitle, setCurrentTemplateTitle] = useState("");
  const [isColorEditorOpen, setIsColorEditorOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [categorizedColorInstances, setCategorizedColorInstances] =
    useState(null);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [hasColorChanges, setHasColorChanges] = useState(false);

  console.log("TemplatePreviewPage RENDER - States:", {
    isPageLoading,
    initialRawTemplates: !!initialRawTemplates,
    originalJsonProcessed: !!originalJsonProcessed,
    showIframe,
    isColorEditorOpen,
    displayPaletteLength: displayPalette.length,
  });

  useEffect(() => {
    console.log(
      "Effect for location.state - location.state exists:",
      !!location.state
    );
    if (location.state && location.state.templatesOrderedBySection) {
      // console.log("Setting initialRawTemplates from location.state");
      setInitialRawTemplates(location.state.templatesOrderedBySection); // initial raw templates to be compared for change from colorpicker
      setShowIframe(false);
      setOriginalJsonProcessed(null);
      setAllColorInstances([]);
      setDisplayPalette([]);
      setIsPageLoading(false);
    } else {
      console.warn(
        "No templatesOrderedBySection in location.state for PreviewPage."
      );
      setInitialRawTemplates(null);
      setIsPageLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    console.log(
      "Effect for color extraction - originalJsonProcessed changed:",
      !!originalJsonProcessed
    );
    if (
      originalJsonProcessed &&
      originalJsonProcessed.json &&
      originalJsonProcessed.json.content
    ) {
      const idCounter = { current: 0 };
      const extractedInstances = [];
      extractColorsRecursively(
        originalJsonProcessed.json.content,
        "json.content",
        extractedInstances,
        idCounter
      );
      setAllColorInstances(extractedInstances);
      console.log("extracted colors firstly", extractedInstances);

      const uniqueOriginalColors = new Map();
      extractedInstances.forEach((instance) => {
        if (!uniqueOriginalColors.has(instance.originalValue)) {
          uniqueOriginalColors.set(instance.originalValue, {
            id: instance.originalValue,
            originalHex: instance.originalValue,
            currentHex: instance.originalValue,
          });
        }
      });
      const newDisplayPalette = Array.from(uniqueOriginalColors.values());
      setDisplayPalette(newDisplayPalette);

      const categorizedColorInstances =
        categorizeColorInstances(extractedInstances);
      console.log(
        "extractedInstances which needs to be passed onto categorization",
        extractedInstances
      );
      setCategorizedColorInstances(categorizedColorInstances);
      console.log("categorized colors", categorizedColorInstances);
    } else {
      setAllColorInstances([]);
      setDisplayPalette([]);
      setCategorizedColorInstances(null);
    }
  }, [originalJsonProcessed]);

  const handleWordPressPageGenerated = (url, processedPageDataObject) => {
    // console.log(
    //   "handleWordPressPageGenerated called. URL:",
    //   url,
    //   "Data:",
    //   !!processedPageDataObject
    // );
    setIframeUrl(url);
    setCurrentTemplateTitle(
      processedPageDataObject.name || "WordPress Preview"
    );
    setOriginalJsonProcessed(
      JSON.parse(JSON.stringify(processedPageDataObject))
    );
    setShowIframe(true);
    // isPageLoading should already be false from the first useEffect, or ProcessTemplateResults has finished.
    // If ProcessTemplateResults had its own loading that set isPageLoading true, then set it false here.
    // For now, assuming ProcessTemplateResults does not alter this page's isPageLoading.
  };

  const handlePaletteColorChange = (originalHexId, newHexValue) => {
    setDisplayPalette((prevPalette) =>
      prevPalette.map((pItem) =>
        pItem.id === originalHexId
          ? { ...pItem, currentHex: newHexValue }
          : pItem
      )
    );

    // Set flag if any color differs from original
    setHasColorChanges((prev) => {
      return (
        prev ||
        displayPalette.some((item) => item.originalHex !== item.currentHex)
      );
    });

    // Force update showApplyButton based on current state
    setTimeout(() => {
      setShowApplyButton(
        displayPalette.some((item) => item.originalHex !== item.currentHex)
      );
    }, 0);
  };

  const handleApplyPreviewChangesToBackend = async (changes = []) => {
    if (
      !originalJsonProcessed ||
      !allColorInstances.length ||
      changes.length === 0
    ) {
      alert("No valid changes or JSON data available.");
      return;
    }

    let modifiedJsonStructure = JSON.parse(
      JSON.stringify(originalJsonProcessed)
    );

    let changesApplied = 0;

    changes.forEach(({ originalHex, currentHex }) => {
      allColorInstances.forEach((instance) => {
        if (instance.originalValue === originalHex) {
          setValueByPath(modifiedJsonStructure, instance.path, currentHex);
          changesApplied++;
        }
      });
    });

    console.log(`${changesApplied} color instances updated in JSON`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Colors applied successfully. Reloading preview...");

      if (iframeRef.current) {
        const newSrc = iframeUrl.split("?")[0] + "?t=" + new Date().getTime();
        iframeRef.current.src = newSrc;
      }

      // Update displayPalette with applied values
      setDisplayPalette((prevPalette) =>
        prevPalette.map((pItem) => {
          const match = changes.find(
            (change) => change.originalHex === pItem.originalHex
          );
          return match ? { ...pItem, originalHex: match.currentHex } : pItem;
        })
      );

      setOriginalJsonProcessed(modifiedJsonStructure);
    } catch (error) {
      console.error("Error applying color changes:", error);
      alert("Failed to apply color changes.");
    }
  };

  const handleEditColorsClick = () => {
    console.log("Edit Colors button clicked!");
    console.log(
      "Current state before opening overlay: originalJsonProcessed:",
      !!originalJsonProcessed,
      "displayPalette length:",
      displayPalette.length
    );
    if (originalJsonProcessed && displayPalette.length > 0) {
      setIsColorEditorOpen(true);
    } else {
      alert(
        "Cannot edit colors: Processed JSON data is not ready or no colors were found."
      );
      console.log(
        "Cannot open color editor. originalJsonProcessed:",
        originalJsonProcessed,
        "displayPalette:",
        displayPalette
      );
    }
  };

  const leftPanelContent = (
    <div>
      <h3>
        {showIframe
          ? `Preview: ${currentTemplateTitle}`
          : !initialRawTemplates && !isPageLoading
          ? "No Data"
          : "Processing Templates"}
      </h3>

      {/* Edit Colors Button - appears only after preview loads */}
      {originalJsonProcessed && (
        <button
          onClick={handleEditColorsClick}
          style={{
            marginTop: "10px",
            display: "block",
            width: "100%",
            padding: "10px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          disabled={displayPalette.length === 0 && !!originalJsonProcessed}
        >
          Edit Colors{" "}
          {originalJsonProcessed && displayPalette.length === 0
            ? "(No colors found)"
            : displayPalette.length > 0
            ? `(${displayPalette.length})`
            : ""}
        </button>
      )}

      <hr style={{ margin: "10px 0" }} />

      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "10px",
          display: "block",
          width: "100%",
          padding: "10px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>

      {/* Open in New Tab Link */}
      {showIframe && iframeUrl && (
        <p style={{ marginTop: "20px" }}>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer">
            Open preview in new tab
          </a>
        </p>
      )}
    </div>
  );

  if (!initialRawTemplates && !isPageLoading) {
    return (
      <DashboardLayout
        topBar={<TopBar />}
        leftPanel={leftPanelContent}
        rightPanel={
          <div>
            No template data received. Please go back to the dashboard and
            generate new templates.
          </div>
        }
      />
    );
  }

  let rightPanelDisplay;
  if (showIframe) {
    rightPanelDisplay = (
      /* ... iframe JSX ... */

      <div className="iframe-container">
        <div className="iframe-wrapper">
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title={currentTemplateTitle}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />
        </div>
      </div>
    );
  } else if (initialRawTemplates) {
    rightPanelDisplay = (
      <ProcessTemplateResults
        templatesOrderedBySection={initialRawTemplates}
        onPreview={handleWordPressPageGenerated}
      />
    );
  } else {
    // This means !initialRawTemplates but isPageLoading is true (very initial render)
    rightPanelDisplay = <div>Preparing template generation...</div>;
  }

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={
        showIframe ? (
          <div
            className="iframe-container"
            style={{ height: "100vh", border: "1px solid #ccc" }}
          >
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              title={currentTemplateTitle}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              referrerPolicy="no-referrer"
              allow="fullscreen"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        ) : initialRawTemplates ? (
          <ProcessTemplateResults
            templatesOrderedBySection={initialRawTemplates}
            onPreview={handleWordPressPageGenerated}
          />
        ) : (
          <div>Preparing template generation...</div>
        )
      }
    >
      {console.log(
        "categorizeColorInstances before passing onto ColorEditorOverlay:",
        categorizeColorInstances
      )}
      {originalJsonProcessed && categorizedColorInstances && (
        <ColorEditorOverlay
          isOpen={isColorEditorOpen}
          onClose={() => setIsColorEditorOpen(false)}
          categorizedPalette={categorizedColorInstances}
          onPaletteColorChange={handlePaletteColorChange}
          onApplyChanges={handleApplyPreviewChangesToBackend}
        />
      )}
    </DashboardLayout>
  );
};

export default TemplatePreviewPage;
