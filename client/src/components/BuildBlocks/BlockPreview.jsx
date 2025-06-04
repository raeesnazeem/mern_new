// BlockPreview.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import ProcessBlockResults from "./ProcessBlockResults"; // Your ProcessBlockResults.jsx (File 4 from your last prompt)
import DashboardLayout from "../../components/DashboardLayout";
import TopBar from "../../components/TopBar";
import ColorEditorOverlay from "../../components/ColorEditorOverlay"; // Your ColorEditorOverlay.jsx (File 1 from your last prompt)
import AILoader from "../../components/AiLoader";
import "../../styles/TemplatePreviewPage.css";
import "../../styles/ColorEditorOverlay.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// ----- Helper Constants and Functions -----
function isTransparentWhite(color) {
  if (typeof color !== "string") return true;
  color = color.trim().toLowerCase();
  if (color === "#ffffff" || color === "#fff" || color === "white")
    return false; // KEEP solid white
  if (color === "transparent") return true;
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(",").map((v) => parseFloat(v.trim()));
    return (
      parts.length === 4 &&
      parts[0] === 255 &&
      parts[1] === 255 &&
      parts[2] === 255 &&
      parts[3] < 1
    );
  }
  const hexAlphaMatch = /^#([0-9a-f]{8})$/i.test(color);
  if (hexAlphaMatch) {
    const alphaChannelHex = color.slice(-2).toLowerCase();
    const alphaValue = parseInt(alphaChannelHex, 16);
    return color.startsWith("#ffffff") && alphaValue < 255;
  }
  return false;
}
const COLOR_KEYS = [
  /* Your list from previous file */ "background_color",
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
  "color",
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

const setValueByPath = (obj, path, value) => {
  if (typeof path !== "string" || path.trim() === "") {
    console.error("setValueByPath Error: Path is empty or not a string.", {
      obj,
      path,
      value,
    });
    return false;
  }
  if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
    // Allow obj to be an array
    console.error(
      `setValueByPath Error: Initial object is not valid (is ${typeof obj}). Path: ${path}`,
      { obj, path, value }
    );
    return false;
  }

  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const nextKeyIsArrayIndex = !isNaN(parseInt(nextKey, 10));

    if (!current || (typeof current !== "object" && !Array.isArray(current))) {
      console.error(
        `setValueByPath Error: Cannot traverse. Current segment for "${keys
          .slice(0, i)
          .join(".")}" is not an object/array. Path: ${path}. Current:`,
        current
      );
      return false;
    }

    if (Array.isArray(current)) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey) || numKey < 0) {
        console.error(
          `setValueByPath Error: Trying to access non-numeric or invalid key "${key}" on an array. Path: ${path}`
        );
        return false;
      }
      // Ensure array is long enough, fill with null if needed (or objects/arrays based on nextKeyIsArrayIndex)
      while (numKey >= current.length) {
        current.push(null);
      }
      if (!current[numKey] || typeof current[numKey] !== "object") {
        // console.log(`setValueByPath: Creating segment at array index "${numKey}" as ${nextKeyIsArrayIndex ? "array" : "object"}`);
        current[numKey] = nextKeyIsArrayIndex ? [] : {};
      }
      current = current[numKey];
    } else {
      // current is an object
      if (
        !current.hasOwnProperty(key) ||
        (typeof current[key] !== "object" && current[key] !== null)
      ) {
        // Allow null to be overwritten
        // console.log(`setValueByPath: Creating object segment "${key}" as ${nextKeyIsArrayIndex ? "array" : "object"}`);
        current[key] = nextKeyIsArrayIndex ? [] : {};
      } else if (nextKeyIsArrayIndex && !Array.isArray(current[key])) {
        // console.warn(`setValueByPath: Overwriting non-array with array at "${key}" for path: ${path}`);
        current[key] = [];
      }
      current = current[key];
    }
  }

  const finalKey = keys[keys.length - 1];
  if (
    current &&
    (typeof current === "object" || Array.isArray(current)) &&
    finalKey !== undefined
  ) {
    const numFinalKey = parseInt(finalKey, 10); // For arrays
    if (Array.isArray(current) && !isNaN(numFinalKey) && numFinalKey >= 0) {
      while (numFinalKey >= current.length) current.push(null);
      current[numFinalKey] = value;
    } else if (!Array.isArray(current)) {
      current[finalKey] = value;
    } else {
      console.error(
        `setValueByPath Error: Cannot set final key "${finalKey}" on array with non-numeric key. Path: ${path}`
      );
      return false;
    }
    return true;
  } else {
    console.error(
      `setValueByPath Error: Failed to set final key "${finalKey}" for path "${path}". 'current' is not an object/array or finalKey undefined. Current:`,
      current,
      "FinalKey:",
      finalKey
    );
    return false;
  }
};
// ----- END OF HELPERS -----

const BlockPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const [initialRawTemplates, setInitialRawTemplates] = useState(null);
  const [originalJsonProcessed, setOriginalJsonProcessed] = useState(null);
  const [iframeUrl, setIframeUrl] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [allColorInstances, setAllColorInstances] = useState([]);
  const [categorizedColorPalette, setCategorizedColorPalette] = useState({});
  const [isColorEditorOpen, setIsColorEditorOpen] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [currentTemplateTitle, setCurrentTemplateTitle] =
    useState("Loading...");

  const locationTemplatesRef = useRef(null);
  const initialRawTemplatesFromLocationCacheRef = useRef(null);

  const extractColorsRecursively = useCallback(
    (node, currentPath, foundColors, idCounter) => {
      if (Array.isArray(node)) {
        node.forEach((item, index) =>
          extractColorsRecursively(
            item,
            `${currentPath}[${index}]`,
            foundColors,
            idCounter
          )
        );
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
            let isValidColor = true;
            if (
              !HEX_REGEX.test(value) &&
              !RGBA_REGEX.test(value) &&
              !HSLA_REGEX.test(value)
            )
              isValidColor = false;
            else if (isTransparentWhite(value)) isValidColor = false;
            const globalValue = globals?.[key];
            if (globalValue) isValidColor = false;
            if (isValidColor) {
              foundColors.push({
                id: value.toLowerCase() + `-` + idCounter.current++,
                path: newPath,
                originalValue: value.toLowerCase(),
                contextName: generateContextName(node, key, newPath),
              });
            }
          }
          if (typeof value === "object" && value !== null)
            extractColorsRecursively(value, newPath, foundColors, idCounter);
        }
      }
      return foundColors;
    },
    []
  );

  const categorizeColorInstances = useCallback((colorInstances) => {
    const categories = {
      background: [],
      backgroundOverlay: [],
      menuDropdown: [],
      text: [],
      button: [],
      border: [],
      other: [],
    };
    const seenOverall = new Set();
    colorInstances.forEach((inst) => {
      if (seenOverall.has(inst.originalValue)) return;
      seenOverall.add(inst.originalValue);
      const pk = inst.path.split(".").pop().toLowerCase();
      let assigned = false;
      if (
        pk.includes("background_color_b") ||
        (pk.includes("background") &&
          !pk.includes("overlay") &&
          !pk.includes("dropdown"))
      ) {
        categories.background.push(inst);
        assigned = true;
      } else if (pk.includes("background_overlay_color")) {
        categories.backgroundOverlay.push(inst);
        assigned = true;
      } else if (
        pk.includes("menu") ||
        pk.includes("dropdown") ||
        pk.includes("pointer_color_menu_item")
      ) {
        categories.menuDropdown.push(inst);
        assigned = true;
      } else if (
        pk.includes("text_color") ||
        pk.includes("title_color") ||
        pk.includes("icon_color") ||
        (pk === "color" &&
          (inst.contextName.toLowerCase().includes("text") ||
            inst.contextName.toLowerCase().includes("heading") ||
            inst.contextName.toLowerCase().includes("icon")))
      ) {
        categories.text.push(inst);
        assigned = true;
      } else if (
        pk.includes("button") ||
        pk.includes("hover_color") ||
        pk.includes("active_color") ||
        (pk === "color" && inst.contextName.toLowerCase().includes("button"))
      ) {
        categories.button.push(inst);
        assigned = true;
      } else if (pk.includes("border_color")) {
        categories.border.push(inst);
        assigned = true;
      }
      if (!assigned) categories.other.push(inst);
    });
    return categories;
  }, []);

  useEffect(() => {
    // Effect 1
    const newLocationTemplatesData = location.state?.templatesOrderedBySection;
    const newLocationTemplatesString = newLocationTemplatesData
      ? JSON.stringify(newLocationTemplatesData)
      : null;
    if (
      newLocationTemplatesString &&
      newLocationTemplatesString !== locationTemplatesRef.current
    ) {
      locationTemplatesRef.current = newLocationTemplatesString;
      initialRawTemplatesFromLocationCacheRef.current = structuredClone(
        newLocationTemplatesData
      );
      setInitialRawTemplates(newLocationTemplatesData);
      setOriginalJsonProcessed(null);
      setShowIframe(false);
      setIframeUrl("");
      setIsPageLoading(true);
    } else if (!newLocationTemplatesString && initialRawTemplates !== null) {
      locationTemplatesRef.current = null;
      initialRawTemplatesFromLocationCacheRef.current = null;
      setInitialRawTemplates(null);
      setOriginalJsonProcessed(null);
      setShowIframe(false);
      setIframeUrl("");
      setIsPageLoading(false);
    } else if (
      isPageLoading &&
      !newLocationTemplatesString &&
      !initialRawTemplates
    ) {
      setIsPageLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    // Effect 2
    if (!initialRawTemplates) {
      if (originalJsonProcessed !== null) setOriginalJsonProcessed(null);
      if (isPageLoading && !location.state?.templatesOrderedBySection)
        setIsPageLoading(false);
      return;
    }
    if (!isPageLoading) setIsPageLoading(true);
    // console.groupCollapsed("[BlockPreview] Effect_BuildOJP: Processing initialRawTemplates");
    const finalContentArray = [];
    let processedSomething = false;
    let pageName =
      initialRawTemplates.name ||
      `Generated Page ${Math.floor(Date.now() / 1000)}`;
    let sectionsToProcess =
      initialRawTemplates.reorderedGlobalSections?.length > 0
        ? initialRawTemplates.reorderedGlobalSections
        : [];

    sectionsToProcess.forEach((section, idx) => {
      if (
        section?.json?.content &&
        Array.isArray(section.json.content) &&
        section.json.content.length > 0
      ) {
        finalContentArray.push(...section.json.content);
        processedSomething = true;
      } else {
        console.error(
          `[BlockPreview] Effect_BuildOJP: Section ${idx} (ID: ${section?._id}, Type: ${section?.sectionType}) invalid json.content.`
        );
      }
    });
    if (!processedSomething || finalContentArray.length === 0) {
      setOriginalJsonProcessed(null);
      setIsPageLoading(false);
      /*console.groupEnd();*/ return;
    }
    let pageSettings = {
      external_header_footer: true,
      hide_title: true,
      page_layout: "elementor_canvas",
      ui_theme_style: "no",
    };
    if (
      sectionsToProcess.length === 1 &&
      sectionsToProcess[0]?.sectionType === "fullPageContentUpdate" &&
      sectionsToProcess[0]?.json?.page_settings
    ) {
      pageSettings = sectionsToProcess[0].json.page_settings;
    }
    const fullJsonStructure = {
      content: finalContentArray,
      page_settings: pageSettings,
      version: "0.4",
      type: "wp-page",
    };
    setOriginalJsonProcessed({ name: pageName, json: fullJsonStructure });
    // console.groupEnd();
  }, [initialRawTemplates]);

  useEffect(() => {
    // Effect 3
    if (originalJsonProcessed?.json) {
      // console.groupCollapsed("[BlockPreview] Effect_ColorExtraction");
      const idCounter = { current: 0 };
      const foundColors = [];
      if (originalJsonProcessed.json.content) {
        extractColorsRecursively(
          originalJsonProcessed.json.content,
          "json.content",
          foundColors,
          idCounter
        );
      }
      if (originalJsonProcessed.json.page_settings) {
        extractColorsRecursively(
          originalJsonProcessed.json.page_settings,
          "json.page_settings",
          foundColors,
          idCounter
        );
      }
      setAllColorInstances(foundColors);
      setCategorizedColorPalette(categorizeColorInstances(foundColors));
      // console.groupEnd();
    } else {
      setAllColorInstances([]);
      setCategorizedColorPalette({});
    }
  }, [
    originalJsonProcessed,
    extractColorsRecursively,
    categorizeColorInstances,
  ]);

  const handleWordPressPageGenerated = useCallback(
    (url, pageDataObjectFromWP) => {
      setIframeUrl(url);
      setCurrentTemplateTitle(pageDataObjectFromWP.name || "WordPress Preview");
      setOriginalJsonProcessed(structuredClone(pageDataObjectFromWP));
      setShowIframe(true);
      setIsPageLoading(false);
    },
    []
  );

  const applyChangesAndRegenerate = useCallback(
    async (changesArray) => {
      if (!originalJsonProcessed?.json) {
        alert("Error: Original page data missing.");
        setIsColorEditorOpen(false);
        return;
      }
      if (!changesArray?.length) {
        alert("No color changes selected.");
        setIsColorEditorOpen(false);
        return;
      }

      console.groupCollapsed("[BlockPreview] applyChangesAndRegenerate");
      console.log("Applying changesArray:", changesArray);
      console.log(
        "OJP.json (BEFORE MODIFICATION):",
        JSON.parse(JSON.stringify(originalJsonProcessed.json))
      );

      const modifiedPageJson = structuredClone(originalJsonProcessed.json);
      let actualModificationsCount = 0;

      console.log("--- Starting modification loop for setValueByPath ---");
      changesArray.forEach(({ originalHex, currentHex }) => {
        console.log(`Processing change: ${originalHex} -> ${currentHex}`);
        allColorInstances
          .filter((inst) => inst.originalValue === originalHex)
          .forEach((inst) => {
            let relativePath = inst.path;
            let targetObjectForSetValue;
            console.log(
              `  Attempting to modify instance at path: ${inst.path}`
            );

            if (relativePath.startsWith("json.content")) {
              relativePath = relativePath.substring("json.content.".length);
              targetObjectForSetValue = modifiedPageJson.content;
            } else if (relativePath.startsWith("json.page_settings")) {
              relativePath = relativePath.substring(
                "json.page_settings.".length
              );
              targetObjectForSetValue = modifiedPageJson.page_settings;
            } else if (relativePath.startsWith("json.")) {
              relativePath = relativePath.substring("json.".length);
              targetObjectForSetValue = modifiedPageJson;
            } else {
              console.warn(
                `  Path "${inst.path}" does not start with "json.*". Using modifiedPageJson as target.`
              );
              targetObjectForSetValue = modifiedPageJson;
            }

            if (targetObjectForSetValue === undefined) {
              console.error(
                `  Target object for path prefix of "${inst.path}" is UNDEFINED. Cannot set value. Skipping.`
              );
              return;
            }
            // console.log(`    Calling setValueByPath on target (type ${typeof targetObjectForSetValue}) with relativePath: "${relativePath}"`);

            if (
              setValueByPath(targetObjectForSetValue, relativePath, currentHex)
            ) {
              actualModificationsCount++;
              // console.log(`    SUCCESS: setValueByPath for ${inst.path}`);
            } else {
              console.error(
                `    FAILED: setValueByPath for ${inst.path} (relative: ${relativePath})`
              );
            }
          });
      });
      console.log(
        `--- Finished modification loop. Total successful setValueByPath calls: ${actualModificationsCount} ---`
      );

      // **** MOST IMPORTANT LOG TO VERIFY THE ACTUAL MODIFICATION ****
      console.log(
        "VERIFY THIS OBJECT (modifiedPageJson after ALL changes):",
        JSON.parse(JSON.stringify(modifiedPageJson))
      );
      // For easier debugging, you can pick one known path that *should* have changed and log its value
      // For example, if changesArray[0] was { originalHex: '#ABCDEF', currentHex: '#123456' }
      // and allColorInstances had an entry with originalValue '#abcdef' at path 'json.content[0].settings.color'
      if (changesArray.length > 0 && allColorInstances.length > 0) {
        const firstChangeToVerify = changesArray[0];
        const instanceToVerify = allColorInstances.find(
          (inst) => inst.originalValue === firstChangeToVerify.originalHex
        );
        if (instanceToVerify) {
          let pathToVerify = instanceToVerify.path;
          let tempObj = modifiedPageJson;
          if (pathToVerify.startsWith("json.content")) {
            tempObj = tempObj.content;
            pathToVerify = pathToVerify.substring("json.content.".length);
          } else if (pathToVerify.startsWith("json.page_settings")) {
            tempObj = tempObj.page_settings;
            pathToVerify = pathToVerify.substring("json.page_settings.".length);
          } else if (pathToVerify.startsWith("json.")) {
            pathToVerify = pathToVerify.substring("json.".length);
          }
          try {
            const valAfter = pathToVerify
              .split(".")
              .reduce((o, k) => o && o[k.replace(/\[(\d+)\]/g, "$1")], tempObj);
            console.log(
              `VERIFICATION LOG: Path ${instanceToVerify.path} - Expected New: ${firstChangeToVerify.currentHex}, Value in modifiedPageJson: ${valAfter}`
            );
            if (valAfter !== firstChangeToVerify.currentHex) {
              console.error(
                "!!!!! VERIFICATION FAILED: Color at path did not change as expected. !!!!!"
              );
            }
          } catch (e) {
            console.error("Error during verification log reduce:", e);
          }
        }
      }

      const newPageName = `${originalJsonProcessed.name || "Page"} (Colors V${
        Date.now() % 10000
      })`;
      const updatedPageAsSingleSection = {
        _id: `updated-page-${Date.now()}`,
        name: newPageName,
        sectionType: "fullPageContentUpdate",
        json: modifiedPageJson,
      };

      const baseRawTemplatesSource =
        initialRawTemplatesFromLocationCacheRef.current || {};
      const newInitialRawTemplates = {
        ...baseRawTemplatesSource,
        reorderedGlobalSections: [updatedPageAsSingleSection],
        name: newPageName,
      };

      setIsPageLoading(true);
      setShowIframe(false);
      setIframeUrl("");
      setOriginalJsonProcessed(null);
      setInitialRawTemplates(newInitialRawTemplates);

      const newAllColors = allColorInstances.map((i) => {
        const chg = changesArray.find((c) => c.originalHex === i.originalValue);
        return chg ? { ...i, originalValue: chg.currentHex.toLowerCase() } : i;
      });
      setAllColorInstances(newAllColors);
      setCategorizedColorPalette(categorizeColorInstances(newAllColors));
      setIsColorEditorOpen(false);
      console.groupEnd();
    },
    [
      originalJsonProcessed,
      allColorInstances,
      categorizeColorInstances,
      initialRawTemplatesFromLocationCacheRef,
    ]
  );

  const handleEditColorsClick = () => {
    const hasDisplayableColors =
      categorizedColorPalette &&
      Object.values(categorizedColorPalette).some((arr) => arr.length > 0);
    if (originalJsonProcessed && hasDisplayableColors) {
      setIsColorEditorOpen(true);
    } else {
      alert(
        hasDisplayableColors
          ? "Page data not ready."
          : "No editable colors found."
      );
    }
  };

  const leftPanelContent = (
    /* ... Same ... */
    <div
      className="template-preview-left-panel"
      style={{
        padding: "20px",
        background: "#f9f9f9",
        borderRight: "1px solid #eee",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
        {showIframe
          ? `Preview: ${currentTemplateTitle}`
          : isPageLoading
          ? "Processing..."
          : "Setup"}
      </h3>
      {originalJsonProcessed && showIframe && (
        <button
          className="editColorsButton"
          onClick={handleEditColorsClick}
          disabled={
            !(
              categorizedColorPalette &&
              Object.values(categorizedColorPalette).some(
                (arr) => arr.length > 0
              )
            ) || isPageLoading
          }
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {" "}
          Edit Colors{" "}
          {categorizedColorPalette &&
          Object.values(categorizedColorPalette).some((arr) => arr.length > 0)
            ? `(Colors Available)`
            : "(No editable colors found)"}
        </button>
      )}
      <hr style={{ margin: "20px 0" }} />
      <button
        className="backToReorderButton"
        onClick={() => navigate(-1)}
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {" "}
        Back to Reorder Sections{" "}
      </button>
      <button
        className="backToDashboardButton"
        onClick={() => navigate("/")}
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          backgroundColor: "#5a6268",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {" "}
        Back to Dashboard{" "}
      </button>
      {showIframe && iframeUrl && (
        <p style={{ fontSize: "0.9em", marginTop: "15px" }}>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer">
            {" "}
            Open preview in new tab{" "}
          </a>
        </p>
      )}
    </div>
  );

  let rightPanelDisplay;
  if (showIframe && iframeUrl) {
    rightPanelDisplay = (
      <div
        className="iframe-container"
        style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {" "}
        <div
          className="iframe-wrapper"
          style={{ flexGrow: 1, border: "1px solid #ccc", overflow: "hidden" }}
        >
          {" "}
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title={currentTemplateTitle}
            style={{ width: "100%", height: "100%", border: "none" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />{" "}
        </div>{" "}
      </div>
    );
  } else if (initialRawTemplates && originalJsonProcessed && !showIframe) {
    rightPanelDisplay = (
      <ProcessBlockResults
        templatesOrderedBySection={initialRawTemplates}
        onPreview={handleWordPressPageGenerated}
      />
    );
  } else if (isPageLoading) {
    rightPanelDisplay = (
      <AILoader heading="Loading Preview..." subHeading="Please wait..." />
    );
  } else if (initialRawTemplates && !originalJsonProcessed && !isPageLoading) {
    rightPanelDisplay = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {" "}
        <h4>⚠️ Error Processing Templates</h4>{" "}
        <p>Could not prepare page content.</p>
      </div>
    );
  } else if (!initialRawTemplates && !isPageLoading) {
    rightPanelDisplay = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {" "}
        <p>No template data found.</p>{" "}
      </div>
    );
  } else {
    rightPanelDisplay = (
      <AILoader heading="Preparing Interface..." subHeading="Please wait." />
    );
  }

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={rightPanelDisplay}
    >
      {isColorEditorOpen && (
        <ColorEditorOverlay
          isOpen={isColorEditorOpen}
          onClose={() => setIsColorEditorOpen(false)}
          categorizedPalette={categorizedColorPalette}
          onApplyChanges={applyChangesAndRegenerate}
        />
      )}
    </DashboardLayout>
  );
};
export default BlockPreview;
