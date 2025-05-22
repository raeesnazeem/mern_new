// src/pages/TemplatePreviewPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProcessTemplateResults from "../components/ProcessTemplateResults";
import DashboardLayout from "../components/DashboardLayout";
import TopBar from "../components/TopBar";
import ColorEditorOverlay from "../components/ColorEditorOverlay";

// ----- Helper Constants and Functions (COLOR_KEYS, REGEXES, generateContextName, extractColorsRecursively, setValueByPath) -----
// (Keep these as they were from the previous full code example)
// For brevity, I'm not re-pasting them again here. Ensure they are present.
// -------------------------------------------------------------------------------------------------------------------------------
const COLOR_KEYS = [
  'background_color', 'background_color_b', 'background_overlay_color',
  'background_overlay_color_b', 'color_menu_item', 'color_menu_item_hover',
  'pointer_color_menu_item_hover', 'color_menu_item_active',
  'pointer_color_menu_item_active', 'color_dropdown_item',
  'background_color_dropdown_item', 'color_dropdown_item_hover',
  'background_color_dropdown_item_hover', 'color_dropdown_item_active',
  'background_color_dropdown_item_active', 'icon_color', 'text_color',
  'title_color', 'button_text_color', 'button_background_hover_color',
  'button_hover_border_color', 'border_color', 'hover_color'
];
const HEX_REGEX = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGBA_REGEX = /^rgba?\(\s*\d+%?\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d\.]+\s*)?\)$/;
const HSLA_REGEX = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d\.]+\s*)?\)$/;

function generateContextName(node, key, path) {
  if (node._title) return `${node._title} - ${key}`;
  if (node.widgetType) return `${node.widgetType} (${node.id || 'N/A'}) - ${key}`;
  if (node.elType) return `${node.elType} (${node.id || 'N/A'}) - ${key}`;
  const pathParts = path.split('.');
  return pathParts.slice(Math.max(pathParts.length - 3, 0)).join(' > ');
}

function extractColorsRecursively(node, currentPath, foundColors, idCounter) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      extractColorsRecursively(item, `${currentPath}[${index}]`, foundColors, idCounter);
    });
  } else if (typeof node === "object" && node !== null) {
    const globals = node.__globals__;
    for (const key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key) || key === '__globals__') continue;
      const value = node[key];
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (COLOR_KEYS.includes(key) && typeof value === 'string' && value.trim() !== '') {
        if (HEX_REGEX.test(value) || RGBA_REGEX.test(value) || HSLA_REGEX.test(value)) {
          const globalValueForThisKey = globals ? globals[key] : undefined;
          if (globalValueForThisKey === undefined || globalValueForThisKey === "") {
            foundColors.push({
              id: `instance-${idCounter.current++}`,
              path: newPath,
              originalValue: value,
              contextName: generateContextName(node, key, newPath),
            });
          }
        }
      }
      if (typeof value === 'object' && value !== null) {
        extractColorsRecursively(value, newPath, foundColors, idCounter);
      }
    }
  }
  return foundColors;
}

const setValueByPath = (obj, path, value) => {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKeyIsArrayIndex = !isNaN(parseInt(keys[i + 1], 10));
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = nextKeyIsArrayIndex ? [] : {};
    }
    current = current[key];
  }
   if (current && typeof current === 'object' && keys.length > 0) {
    current[keys[keys.length - 1]] = value;
  } else if (keys.length === 1 && typeof obj === 'object' && obj !== null) {
    obj[keys[0]] = value;
  } else {
    console.error(`Cannot set value for path ${path}. Parent is not an object or path is invalid.`);
  }
};
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

  console.log("TemplatePreviewPage RENDER - States:", {
    isPageLoading,
    initialRawTemplates: !!initialRawTemplates,
    originalJsonProcessed: !!originalJsonProcessed,
    showIframe,
    isColorEditorOpen,
    displayPaletteLength: displayPalette.length
  });

  useEffect(() => {
    console.log("Effect for location.state - location.state exists:", !!location.state);
    if (location.state && location.state.templatesOrderedBySection) {
      console.log("Setting initialRawTemplates from location.state");
      setInitialRawTemplates(location.state.templatesOrderedBySection);
      setShowIframe(false);
      setOriginalJsonProcessed(null);
      setAllColorInstances([]);
      setDisplayPalette([]);
      setIsPageLoading(false);
    } else {
      console.warn("No templatesOrderedBySection in location.state for PreviewPage.");
      setInitialRawTemplates(null);
      setIsPageLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    console.log("Effect for color extraction - originalJsonProcessed changed:", !!originalJsonProcessed);
    if (originalJsonProcessed && originalJsonProcessed.json && originalJsonProcessed.json.content) {
      const idCounter = { current: 0 };
      const extractedInstances = [];
      extractColorsRecursively(
        originalJsonProcessed.json.content,
        'json.content',
        extractedInstances,
        idCounter
      );
      console.log("All Extracted Color Instances:", extractedInstances);
      setAllColorInstances(extractedInstances);

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
      console.log("Display Palette for UI:", newDisplayPalette);
    } else {
      setAllColorInstances([]);
      setDisplayPalette([]);
    }
  }, [originalJsonProcessed]);

  const handleWordPressPageGenerated = (url, processedPageDataObject) => {
    console.log("handleWordPressPageGenerated called. URL:", url, "Data:", !!processedPageDataObject);
    setIframeUrl(url);
    setCurrentTemplateTitle(processedPageDataObject.name || "WordPress Preview");
    setOriginalJsonProcessed(JSON.parse(JSON.stringify(processedPageDataObject)));
    setShowIframe(true);
    // isPageLoading should already be false from the first useEffect, or ProcessTemplateResults has finished.
    // If ProcessTemplateResults had its own loading that set isPageLoading true, then set it false here.
    // For now, assuming ProcessTemplateResults does not alter this page's isPageLoading.
  };

  const handlePaletteColorChange = (originalHexId, newHexValue) => {
    // ... (function remains the same)
    setDisplayPalette((prevPalette) =>
      prevPalette.map((pItem) =>
        pItem.id === originalHexId
          ? { ...pItem, currentHex: newHexValue }
          : pItem
      )
    );
  };

  const handleApplyPreviewChangesToBackend = async () => {
    // ... (function remains the same)
    if (!originalJsonProcessed || !allColorInstances.length) {
      alert("Original JSON data or color instance data is missing. Cannot apply changes.");
      return;
    }
    let modifiedJsonStructure = JSON.parse(JSON.stringify(originalJsonProcessed));
    const colorChangesMap = new Map();
    displayPalette.forEach((pItem) => {
      if (pItem.originalHex !== pItem.currentHex) {
        colorChangesMap.set(pItem.originalHex, pItem.currentHex);
      }
    });
    if (colorChangesMap.size === 0) {
      alert("No colors have been changed in the palette.");
      return;
    }
    setIsPageLoading(true);
    let changesApplied = 0;
    allColorInstances.forEach((instance) => {
      if (colorChangesMap.has(instance.originalValue)) {
        const newColor = colorChangesMap.get(instance.originalValue);
        setValueByPath(modifiedJsonStructure, instance.path, newColor);
        changesApplied++;
      }
    });
    console.log(`${changesApplied} color instances updated in JSON.`);
    console.log("Sending globally modified JSON to backend:", modifiedJsonStructure);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Simulated API call successful. WordPress page would be updated. Reloading iframe...");
      if (iframeRef.current) {
        const newSrc = iframeUrl.split("?")[0] + "?t=" + new Date().getTime();
        iframeRef.current.src = newSrc;
      }
      setOriginalJsonProcessed(modifiedJsonStructure);
      setDisplayPalette((prevPalette) =>
        prevPalette.map((pItem) => ({
          ...pItem,
          originalHex: pItem.currentHex,
        }))
      );
    } catch (error) {
      console.error("Error applying global color changes to WordPress:", error);
      alert("Failed to apply global color changes to WordPress.");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleEditColorsClick = () => {
    console.log("Edit Colors button clicked!");
    console.log("Current state before opening overlay: originalJsonProcessed:", !!originalJsonProcessed, "displayPalette length:", displayPalette.length);
    if (originalJsonProcessed && displayPalette.length > 0) {
        setIsColorEditorOpen(true);
    } else {
        alert("Cannot edit colors: Processed JSON data is not ready or no colors were found.");
        console.log("Cannot open color editor. originalJsonProcessed:", originalJsonProcessed, "displayPalette:", displayPalette);
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
      {showIframe && originalJsonProcessed && (
        <>
          <button
            onClick={handleEditColorsClick} // Use the new handler
            style={{ marginTop: "10px", display: "block", width: "100%" }}
            disabled={displayPalette.length === 0 && !!originalJsonProcessed} // Only disable if processed and NO colors
          >
            Edit Colors{" "}
            {originalJsonProcessed && displayPalette.length === 0 ? "(No colors found)" : 
             displayPalette.length > 0 ? `(${displayPalette.length})` : ""}
          </button>
          <hr style={{ margin: "10px 0" }} />
        </>
      )}
      <button
        onClick={() => navigate("/")}
        style={{ marginTop: "10px", display: "block", width: "100%" }}
      >
        Back to Main Dashboard
      </button>
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
    rightPanelDisplay = ( /* ... iframe JSX ... */
      <div className="iframe-container" style={{ height: "100vh", border: "1px solid #ccc" }}>
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
    );
  } else if (initialRawTemplates) {
    rightPanelDisplay = (
      <ProcessTemplateResults
        templatesOrderedBySection={initialRawTemplates}
        onPreview={handleWordPressPageGenerated}
      />
    );
  } else { // This means !initialRawTemplates but isPageLoading is true (very initial render)
    rightPanelDisplay = <div>Preparing template generation...</div>;
  }

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={rightPanelDisplay}
    >
      {originalJsonProcessed && (
        <ColorEditorOverlay
          isOpen={isColorEditorOpen}
          onClose={() => {
            console.log("Closing ColorEditorOverlay");
            setIsColorEditorOpen(false);
          }}
          palette={displayPalette}
          onPaletteColorChange={handlePaletteColorChange}
          onApplyChanges={handleApplyPreviewChangesToBackend}
        />
      )}
    </DashboardLayout>
  );
};

export default TemplatePreviewPage;