import { useState, useEffect, useRef, useCallback } from "react";
import ProcessBlockResults from "./ProcessBlockResults";
import DashboardLayout from "../../components/DashboardLayout";
import TopBar from "../../components/TopBar";
import ColorEditorOverlay from "../../components/ColorEditorOverlay";
import AILoader from "../../components/AiLoader";
import "../../styles/TemplatePreviewPage.css";
import "../../styles/ColorEditorOverlay.css";
import styles from "../../styles/BlockPreviewModals.module.css"; // CSS Modules for modals


import { useLocation, useNavigate } from "react-router-dom";

// ----- Helper Constants and Functions -----
// (isTransparentWhite, COLOR_KEYS, REGEXES, generateContextName, setValueByPath - from previous correct version)
function isTransparentWhite(color) {
  if (typeof color !== "string") return true;
  color = color.trim().toLowerCase();
  if (color === "#ffffff" || color === "#fff" || color === "white")
    return false;
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
    console.error("setValueByPath Error: Path is empty", { obj, path, value });
    return false;
  }
  if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
    console.error(
      `setValueByPath Error: Initial obj not valid (is ${typeof obj}). Path: ${path}`,
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
        `setValueByPath Error: Traverse fail. Seg for "${keys
          .slice(0, i)
          .join(".")}" not object/array. Path: ${path}. Curr:`,
        current
      );
      return false;
    }
    if (Array.isArray(current)) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey) || numKey < 0) {
        console.error(
          `setValueByPath Error: Non-numeric key "${key}" on array. Path: ${path}`
        );
        return false;
      }
      while (numKey >= current.length) {
        current.push(null);
      }
      if (!current[numKey] || typeof current[numKey] !== "object") {
        current[numKey] = nextKeyIsArrayIndex ? [] : {};
      }
      current = current[numKey];
    } else {
      if (
        !current.hasOwnProperty(key) ||
        (typeof current[key] !== "object" && current[key] !== null)
      ) {
        current[key] = nextKeyIsArrayIndex ? [] : {};
      } else if (nextKeyIsArrayIndex && !Array.isArray(current[key])) {
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
    const numFinalKey = parseInt(finalKey, 10);
    if (Array.isArray(current) && !isNaN(numFinalKey) && numFinalKey >= 0) {
      while (numFinalKey >= current.length) current.push(null);
      current[numFinalKey] = value;
    } else if (!Array.isArray(current)) {
      current[finalKey] = value;
    } else {
      console.error(
        `setValueByPath Error: Cannot set final key "${finalKey}" on array. Path: ${path}`
      );
      return false;
    }
    return true;
  } else {
    console.error(
      `setValueByPath Error: Failed set final key "${finalKey}" for path "${path}". Curr not object/array or finalKey undef. Curr:`,
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const locationTemplatesRef = useRef(null);
  const initialRawTemplatesFromLocationCacheRef = useRef(null);
  const allowNextPopState = useRef(false); // Ref to manage programmatic back navigation

  // Effect to manage browser back button behavior
  useEffect(() => {
    // Push a new state to history on mount, specific to this page instance
    // This ensures that the first back button press will trigger our popstate handler
    window.history.pushState(
      { page: "BlockPreviewLoaded" },
      "",
      window.location.href
    );
    console.log(
      "[BlockPreview] Initial history state pushed for popstate trapping."
    );

    const handleBrowserBack = (event) => {
      // Check if this popstate was expected due to an in-app back navigation
      if (allowNextPopState.current) {
        console.log(
          "[BlockPreview] Popstate allowed (flagged as programmatic navigation)."
        );
        allowNextPopState.current = false; // Reset the flag
        // Do NOT pushState here; let the browser complete the back navigation.
        // The component might unmount if navigation is successful.
        return;
      }

      // If the flag is not set, this was a user-initiated browser back button press.
      // Prevent it by pushing the current state again.
      console.log(
        "[BlockPreview] Popstate trapped (user browser back). Pushing state again to stay."
      );
      window.history.pushState(
        { page: "BlockPreviewLoaded" },
        "",
        window.location.href
      );
      // Optionally, you could show a custom message to the user here if desired,
      // but often just preventing the back navigation is sufficient.
    };

    window.addEventListener("popstate", handleBrowserBack);
    console.log("[BlockPreview] Popstate listener ADDED.");

    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
      console.log("[BlockPreview] Popstate listener REMOVED.");
      // When the component unmounts (e.g., user navigates away via an in-app link
      // other than our special back buttons), allowNextPopState should ideally be false.
      // If allowNextPopState.current is true when unmounting, it means we programmatically
      // initiated a back navigation, and it's proceeding.
    };
  }, []); // Empty dependency array: run on mount and cleanup on unmount only.

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
      return;
    }
    let pageSettings = initialRawTemplates.reorderedGlobalSections[0]?.json
      ?.page_settings || {
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
  }, [initialRawTemplates]);

  useEffect(() => {
    // Effect 3
    if (originalJsonProcessed?.json) {
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
      // console.groupCollapsed("[BlockPreview] applyChangesAndRegenerate");
      // console.log("Applying changesArray:", changesArray);

      const modifiedPageJson = structuredClone(originalJsonProcessed.json);
      let actualModificationsCount = 0;
      changesArray.forEach(({ originalHex, currentHex }) => {
        allColorInstances
          .filter((inst) => inst.originalValue === originalHex)
          .forEach((inst) => {
            let relativePath = inst.path;
            let targetObjectForSetValue;
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
              targetObjectForSetValue = modifiedPageJson;
            }
            if (targetObjectForSetValue === undefined) {
              return;
            }
            if (
              setValueByPath(targetObjectForSetValue, relativePath, currentHex)
            )
              actualModificationsCount++;
            else {
              console.error(
                `setValueByPath FAILED for inst.path="${inst.path}"`
              );
            }
          });
      });
      // console.log(`Total successful calls to setValueByPath: ${actualModificationsCount}`);
      // console.log("VERIFY THIS: `modifiedPageJson` after all changes:", JSON.parse(JSON.stringify(modifiedPageJson)));

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
      // console.groupEnd();
    },
    [
      originalJsonProcessed,
      allColorInstances,
      categorizeColorInstances,
      initialRawTemplatesFromLocationCacheRef,
    ]
  );

  const handleAttemptEditColors = () => {
    const hasDisplayableColors =
      categorizedColorPalette &&
      Object.values(categorizedColorPalette).some((arr) => arr.length > 0);
    if (originalJsonProcessed && hasDisplayableColors) {
      setIsConfirmModalOpen(true);
    } else {
      alert(
        hasDisplayableColors
          ? "Page data not ready."
          : "No editable colors found."
      );
    }
  };

  const handleConfirmFinalizeAndEdit = () => {
    setIsConfirmModalOpen(false);
    setIsColorEditorOpen(true);
  };

  const handleProgrammaticBackNavigation = () => {
    // New handler for in-app back
    allowNextPopState.current = true;
    navigate(-1);
  };

  const handleCancelFinalize = () => {
    setIsConfirmModalOpen(false);
    handleProgrammaticBackNavigation(); // Use the new handler
  };

  const leftPanelContent = (
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
          onClick={handleAttemptEditColors}
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
            backgroundColor: "teal", // Teal color
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
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
        onClick={handleProgrammaticBackNavigation} // Use the new handler
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
        Back to Reorder Sections
      </button>
      <button
        className="backToDashboardButton"
        onClick={() => navigate("/")} // Standard navigation, popstate listener will handle if user tries to "back" into this page
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
        Back to Dashboard
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

  const renderConfirmModal = () => {
    if (!isConfirmModalOpen) return null;
    return (
      <div className={styles.modalBackdrop}>
        {" "}
        {/* Uses CSS Module */}
        <div className={styles.modalContent}>
          <h4>Finalize Section Order?</h4>
          <p>
            Color customization is available only after the section order is
            finalized. You won't be able to reorder sections in this preview
            once you proceed.
          </p>
          <div className={styles.modalActions}>
            <button
              onClick={handleCancelFinalize}
              className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
            >
              Back to Reorder
            </button>
            <button
              onClick={handleConfirmFinalizeAndEdit}
              className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
            >
              Finalize & Edit Colors
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={rightPanelDisplay}
    >
      {renderConfirmModal()}
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
