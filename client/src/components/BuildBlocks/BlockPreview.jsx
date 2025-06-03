import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ProcessBlockResults from "./ProcessBlockResults";
import DashboardLayout from "../../components/DashboardLayout"
import TopBar from "../../components/TopBar"; // Assuming this path is correct
import ColorEditorOverlay from "../../components/ColorEditorOverlay"; // Assuming this path is correct
import AILoader from "../../components/AiLoader"; // Assuming this path is correct

// Assuming these CSS files exist and paths are correct
import "../../styles/TemplatePreviewPage.css"; 
import "../../styles/ColorEditorOverlay.css";

import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// Helper: Check transparent white colors
const isTransparentWhite = (color) =>
  ["#fff", "#ffffff", "#FFFFFF"].includes(color?.toLowerCase());

const BlockPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // State
  const [initialRawTemplates, setInitialRawTemplates] = useState(null);
  const [originalJsonProcessed, setOriginalJsonProcessed] = useState(null); // This will store the full {name, json: {content, page_settings,...}}
  const [iframeUrl, setIframeUrl] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [allColorInstances, setAllColorInstances] = useState([]); // All found color instances with paths
  const [categorizedColorPalette, setCategorizedColorPalette] = useState({}); // Unique colors for palette UI
  const [isColorEditorOpen, setIsColorEditorOpen] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [currentTemplateTitle, setCurrentTemplateTitle] = useState("Loading...");
  
  // Extract color instances from layout JSON
  const extractColorsRecursively = useCallback((node, path = "", results = [], idCounter = { current: 0 }) => {
    if (Array.isArray(node)) {
      node.forEach((child, index) => {
        extractColorsRecursively(child, `${path}[${index}]`, results, idCounter);
      });
    } else if (typeof node === "object" && node !== null) {
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          if (key === "color" || key === "text_color" || key === "background_color") {
            const value = node[key];
            if (typeof value === "string" && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)) {
              results.push({
                path: `${path}.${key}`, // Full path to the color
                originalValue: value,
                id: `color-${idCounter.current++}`, // Unique ID for React keys
              });
            }
          }
          extractColorsRecursively(node[key], `${path}.${key}`, results, idCounter);
        }
      }
    }
    return results;
  }, []);

  // Categorize unique color instances for palette display
  const getCategorizedPalette = useCallback((colorInstances) => {
    if (!Array.isArray(colorInstances) || colorInstances.length === 0) {
      return { "All Colors": [] };
    }
    const uniqueColors = {};
    colorInstances.forEach(instance => {
      const color = instance.originalValue.toLowerCase();
      if (!isTransparentWhite(color) && !uniqueColors[color]) {
        uniqueColors[color] = instance; // Store the first instance of each unique color
      }
    });
    return { "All Colors": Object.values(uniqueColors) };
  }, []);


  // Load raw template data from route state
  useEffect(() => {
    console.log("TemplatePreviewPage location.state:", location.state);
    if (location.state && location.state.templatesOrderedBySection) {
      const { templatesOrderedBySection } = location.state;
      setInitialRawTemplates(templatesOrderedBySection);
      setShowIframe(false); 
      setOriginalJsonProcessed(null); 
      setIsPageLoading(true); 
    } else {
      console.warn("No templatesOrderedBySection in location.state on TemplatePreviewPage");
      setInitialRawTemplates(null);
      setIsPageLoading(false); 
    }
  }, [location.state]);

  // Process layout JSON once templates are ready
  // This effect should produce `originalJsonProcessed` which is the full {name, json: {...}} structure
  useEffect(() => {
    if (!initialRawTemplates) {
        if(isPageLoading) setIsPageLoading(false);
        return;
    }
    
    console.log("Processing initialRawTemplates for page structure:", initialRawTemplates);
    const finalContentArray = [];
    let processedSomething = false;
    let pageName = `Generated Template ${Date.now()}`; // Default page name

    // Determine the source of sections and potentially a name
    let sectionsToProcess = [];
    if (initialRawTemplates.reorderedGlobalSections && Array.isArray(initialRawTemplates.reorderedGlobalSections) && initialRawTemplates.reorderedGlobalSections.length > 0) {
      console.log("Using reorderedGlobalSections for page structure");
      sectionsToProcess = initialRawTemplates.reorderedGlobalSections;
      if(initialRawTemplates.name) pageName = initialRawTemplates.name; // If a name was passed with the object
    } else if (initialRawTemplates.reorderedSections && Array.isArray(initialRawTemplates.reorderedSections) && initialRawTemplates.reorderedSections.length > 0) {
      console.log("Using fallback reorderedSections for page structure");
      sectionsToProcess = initialRawTemplates.reorderedSections;
      if(initialRawTemplates.name) pageName = initialRawTemplates.name;
    } else if (typeof initialRawTemplates === 'object' && !Array.isArray(initialRawTemplates)) {
      console.log("Using fallback: iterating object keys of initialRawTemplates for page structure");
      const sectionKeys = Object.keys(initialRawTemplates).filter(key => Array.isArray(initialRawTemplates[key]));
      for (const sectionKey of sectionKeys) {
        const availableSectionsForType = initialRawTemplates[sectionKey];
        if (availableSectionsForType.length > 0) {
          const chosenSectionObject = availableSectionsForType[0]; 
          if (chosenSectionObject && chosenSectionObject.json?.content && Array.isArray(chosenSectionObject.json.content)) {
            sectionsToProcess.push(chosenSectionObject); // Add the whole section object
          }
        }
      }
    }

    sectionsToProcess.forEach((section) => {
        if (section && section.json?.content && Array.isArray(section.json.content)) {
          finalContentArray.push(...section.json.content);
          processedSomething = true;
        } else {
          console.warn("Skipping section due to missing or invalid json.content:", section);
        }
    });

    if (!processedSomething || finalContentArray.length === 0) {
      console.warn("No valid content found after transformation. initialRawTemplates was:", initialRawTemplates);
      setOriginalJsonProcessed(null); 
      setIsPageLoading(false); 
      return;
    }

    const fullJsonStructure = {
      content: finalContentArray,
      page_settings: {
        external_header_footer: true,
        hide_title: true,
        page_layout: "full_width",
        ui_theme_style: "no",
      },
      version: "0.4",
      type: "wp-page",
    };

    const completePageDataObject = {
        name: pageName,
        json: fullJsonStructure
    };

    console.log("Setting originalJsonProcessed (complete page data object):", completePageDataObject);
    setOriginalJsonProcessed(completePageDataObject);
    // setIsPageLoading(false); // ProcessBlockResults will handle this after API call
  }, [initialRawTemplates]);


  // Extract colors from processed layout (originalJsonProcessed.json.content)
  useEffect(() => {
    if (originalJsonProcessed && originalJsonProcessed.json && originalJsonProcessed.json.content) {
      console.log("Extracting colors from:", originalJsonProcessed.json.content);
      const idCounter = { current: 0 }; // Reset counter for each extraction
      const extracted = extractColorsRecursively(originalJsonProcessed.json.content, "json.content", [], idCounter);
      console.log("Extracted color instances:", extracted);
      setAllColorInstances(extracted);
      const categorized = getCategorizedPalette(extracted);
      console.log("Categorized palette for UI:", categorized);
      setCategorizedColorPalette(categorized);
    } else {
      console.log("No originalJsonProcessed.json.content to extract colors from, resetting color states.");
      setAllColorInstances([]);
      setCategorizedColorPalette({});
    }
  }, [originalJsonProcessed, extractColorsRecursively, getCategorizedPalette]);

  // Handle success response from ProcessBlockResults
  const handleWordPressPageGenerated = useCallback((url, processedPageDataObject) => {
    console.log("WordPress page generated by ProcessBlockResults:", url, processedPageDataObject);
    setIframeUrl(url);
    setCurrentTemplateTitle(processedPageDataObject.name || "WordPress Preview");
    // The processedPageDataObject IS the originalJsonProcessed for this preview
    setOriginalJsonProcessed(structuredClone(processedPageDataObject)); 
    setShowIframe(true);
    setIsPageLoading(false); 
  }, []);


  // Apply modified color palette
  const handleApplyPreviewChangesToBackend = useCallback(async (modifiedPageJson) => {
    // modifiedPageJson here is expected to be the `json` part of originalJsonProcessed,
    // but with colors updated.
    console.log("Applying color changes to backend with modified JSON content:", modifiedPageJson);
    setIsPageLoading(true); 

    if (!originalJsonProcessed || !originalJsonProcessed.name) {
        console.error("Cannot apply changes, original page data or name is missing.");
        setIsPageLoading(false);
        alert("Error: Original page data is missing. Cannot apply color changes.");
        return;
    }

    try {
      const username = import.meta.env.VITE_WP_USERNAME;
      const appPassword = import.meta.env.VITE_WP_PASS;
      const token = btoa(`${username}:${appPassword}`);

      const requestData = {
        name: originalJsonProcessed.name, // Use the original name for updating
        json: modifiedPageJson, // This should be the {content, page_settings, version, type} object
      };
      
      console.log("Request data for color update:", requestData);

      const response = await axios.post(
        `${import.meta.env.VITE_WP_IMPORT_API_URL}`,
        requestData,
        { headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" } }
      );

      if (!response.data?.public_url) {
        throw new Error("No post URL returned from WordPress after color update.");
      }

      const newSrc = response.data.public_url + "?t=" + Date.now();
      setIframeUrl(newSrc);
      if (iframeRef.current) iframeRef.current.src = newSrc; 
      
      // Update originalJsonProcessed to reflect the newly saved state with color changes
      setOriginalJsonProcessed(prev => ({...prev, json: modifiedPageJson })); 
      setIsColorEditorOpen(false); 

    } catch (err) {
      console.error("Error updating template with color changes:", err);
      alert("Error updating template with color changes.");
    } finally {
      setIsPageLoading(false);
    }
  }, [originalJsonProcessed]); // Include originalJsonProcessed for its name

  const handleEditColorsClick = () => {
    // Use categorizedColorPalette for the check, as it represents unique displayable colors
    if (originalJsonProcessed && categorizedColorPalette["All Colors"] && categorizedColorPalette["All Colors"].length > 0) {
      setIsColorEditorOpen(true);
    } else {
      alert("Cannot edit colors: No valid colors found or template not processed.");
      console.log("Cannot open color editor. originalJsonProcessed:", originalJsonProcessed, "categorizedColorPalette:", categorizedColorPalette);
    }
  };

  const leftPanelContent = (
    <div className="template-preview-left-panel" style={{padding: '20px', background: '#f9f9f9', borderRight: '1px solid #eee'}}>
      <h3 style={{marginTop: 0, marginBottom: '20px'}}>
        {showIframe ? `Preview: ${currentTemplateTitle}` : (isPageLoading && !originalJsonProcessed ? "Processing Templates..." : "Template Setup")}
      </h3>

      {originalJsonProcessed && (
        <button
          className="editColorsButton"
          onClick={handleEditColorsClick}
          disabled={!(categorizedColorPalette["All Colors"] && categorizedColorPalette["All Colors"].length > 0)}
          style={{
            display: 'block', width: '100%', padding: '10px', marginBottom: '15px', 
            backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          Edit Colors{" "}
          {categorizedColorPalette["All Colors"] && categorizedColorPalette["All Colors"].length > 0
            ? `(${categorizedColorPalette["All Colors"].length} unique)`
            : "(No colors found)"}
        </button>
      )}
      <hr style={{margin: '20px 0'}}/>
      <button 
        className="backToReorderButton" // Changed class name for clarity
        onClick={() => navigate(-1)} // Navigate back to the previous page (IntermediateComponent)
        style={{
            display: 'block', width: '100%', padding: '10px', marginBottom: '15px', 
            backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}
      >
        Back to Reorder Sections
      </button>
      {showIframe && iframeUrl && (
        <p style={{fontSize: '0.9em'}}>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer">
            Open preview in new tab
          </a>
        </p>
      )}
    </div>
  );

  let rightPanelDisplay;
  const shouldProcessBlock = initialRawTemplates && (!originalJsonProcessed || !showIframe) && !isPageLoading;

  if (isPageLoading && !showIframe && !shouldProcessBlock) { 
    rightPanelDisplay = <AILoader heading="Updating Preview..." subHeading="Please wait a moment." />;
  } else if (showIframe && iframeUrl) { 
    rightPanelDisplay = (
      <div className="iframe-container" style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <div className="iframe-wrapper" style={{flexGrow: 1, border: '1px solid #ccc', overflow: 'hidden'}}>
          <iframe
            ref={iframeRef} src={iframeUrl} title={currentTemplateTitle}
            style={{width: '100%', height: '100%', border: 'none'}}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            referrerPolicy="no-referrer" allow="fullscreen"
          ></iframe>
        </div>
      </div>
    );
  } else if (shouldProcessBlock) { 
     rightPanelDisplay = (
      <ProcessBlockResults
        templatesOrderedBySection={initialRawTemplates} 
        onPreview={handleWordPressPageGenerated}
      />
    );
  } else if (!initialRawTemplates && !isPageLoading) { 
    rightPanelDisplay = (
       <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
        <p>No template data found to preview.</p>
        <p>Please go back and select/reorder sections.</p>
      </div>
    );
  } else { 
     rightPanelDisplay = <AILoader heading="Preparing Preview..." subHeading="Please wait." />;
  }

  return (
    <DashboardLayout
      topBar={<TopBar />} 
      leftPanel={leftPanelContent}
      rightPanel={rightPanelDisplay}
    >
      {isColorEditorOpen && originalJsonProcessed && categorizedColorPalette && (
        <ColorEditorOverlay
          isOpen={isColorEditorOpen}
          onClose={() => setIsColorEditorOpen(false)}
          // Pass unique colors for the palette UI
          categorizedPalette={categorizedColorPalette} 
          // Pass all instances for modification logic (to know all paths)
          allColorInstances={allColorInstances} 
          // Pass the 'json' part of originalJsonProcessed for modification
          originalPageJson={originalJsonProcessed.json} 
          onApplyChanges={handleApplyPreviewChangesToBackend} 
        />
      )}
    </DashboardLayout>
  );
};

export default BlockPreview;
