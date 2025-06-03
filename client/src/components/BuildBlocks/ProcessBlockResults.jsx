import { useState, useEffect, useRef } from "react"; 
import AiLoader from "../AiLoader"; 
import axios from "axios";

// Helper function - normalize image data without breaking dynamic fields
function normalizeImageData(data) {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeImageData(item));
  } else if (typeof data === "object" && data !== null) {
    if (
      "__dynamic__" in data ||
      (data.background_image && "id" in data.background_image) ||
      data.source === "library"
    ) {
      return data;
    }
    const result = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = normalizeImageData(data[key]);
      }
    }
    return result;
  }
  return data;
}

// Transform templates into a valid Elementor-compatible content array
const transformTemplatesToWorkingFormat = (templatesBySection) => {
  const finalContentArray = [];
  let processedFromReordered = false;

  console.log(
    "ProcessTemplateResults: Received templatesBySection:",
    templatesBySection
  );

  // 1. Prioritize 'reorderedGlobalSections'
  if (
    templatesBySection &&
    templatesBySection.reorderedGlobalSections &&
    Array.isArray(templatesBySection.reorderedGlobalSections) &&
    templatesBySection.reorderedGlobalSections.length > 0
  ) {
    console.log("ProcessTemplateResults: Using reorderedGlobalSections");
    templatesBySection.reorderedGlobalSections.forEach((section) => {
      if (
        section &&
        section.json?.content &&
        Array.isArray(section.json.content)
      ) {
        try {
          const normalizedSectionContent = normalizeImageData(
            section.json.content
          );
          finalContentArray.push(...normalizedSectionContent);
          processedFromReordered = true;
        } catch (err) {
          console.error(
            `Error normalizing content for a section in reorderedGlobalSections:`,
            err.message,
            section
          );
        }
      } else {
        console.warn(
          "Skipping section in reorderedGlobalSections due to missing or invalid json.content:",
          section
        );
      }
    });
  }
  // 2. Fallback to 'reorderedSections' if 'reorderedGlobalSections' is not present or empty
  else if (
    templatesBySection &&
    templatesBySection.reorderedSections &&
    Array.isArray(templatesBySection.reorderedSections) &&
    templatesBySection.reorderedSections.length > 0
  ) {
    console.log("ProcessTemplateResults: Using fallback reorderedSections");
    templatesBySection.reorderedSections.forEach((section) => {
      if (
        section &&
        section.json?.content &&
        Array.isArray(section.json.content)
      ) {
        try {
          const normalizedSectionContent = normalizeImageData(
            section.json.content
          );
          finalContentArray.push(...normalizedSectionContent);
          processedFromReordered = true;
        } catch (err) {
          console.error(
            `Error normalizing content for a section in reorderedSections:`,
            err.message,
            section
          );
        }
      } else {
        console.warn(
          "Skipping section in reorderedSections due to missing or invalid json.content:",
          section
        );
      }
    });
  }

  //  If no reordered list was processed, use the original fallback (random pick per type)
  if (
    !processedFromReordered &&
    typeof templatesBySection === "object" &&
    !Array.isArray(templatesBySection)
  ) {
    console.log(
      "ProcessTemplateResults: Using original fallback (random pick per type)"
    );
    const sectionKeys = Object.keys(templatesBySection).filter(
      (key) =>
        key !== "reorderedGlobalSections" &&
        key !== "reorderedSections" &&
        Array.isArray(templatesBySection[key])
    );
    console.log(
      "ProcessTemplateResults: Available section types for fallback:",
      sectionKeys
    );

    for (const sectionKey of sectionKeys) {
      const availableSectionsForType = templatesBySection[sectionKey];
      if (availableSectionsForType.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * availableSectionsForType.length
        );
        const chosenSectionObject = availableSectionsForType[randomIndex];
        if (
          chosenSectionObject &&
          chosenSectionObject.json?.content &&
          Array.isArray(chosenSectionObject.json.content)
        ) {
          try {
            const normalizedSectionContent = normalizeImageData(
              chosenSectionObject.json.content
            );
            finalContentArray.push(...normalizedSectionContent);
          } catch (err) {
            console.error(
              `Error normalizing content for ${sectionKey} (fallback):`,
              err.message
            );
          }
        } else {
          console.warn(
            `Invalid or missing .json.content for section type (fallback): ${sectionKey}`,
            chosenSectionObject
          );
        }
      } else {
        console.warn(`No usable sections found for (fallback): ${sectionKey}`);
      }
    }
  }

  console.log(
    "ProcessTemplateResults: Final content array to be sent:",
    finalContentArray
  );
  return finalContentArray;
};

const ProcessBlockResults = ({ templatesOrderedBySection, onPreview }) => {
  const [loading, setLoading] = useState(false); // Should be true initially if we auto-start
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState(null);
  const hasSentRequest = useRef(false); // To prevent multiple requests

  useEffect(() => {
    // Auto-send request when component mounts and receives templates
    if (templatesOrderedBySection && !hasSentRequest.current) {
      console.log(
        "ProcessTemplateResults: templatesOrderedBySection received, initiating sendToWordPress."
      );
      hasSentRequest.current = true; // Mark as sent immediately
      sendToWordPress(templatesOrderedBySection);
    }
  }, [templatesOrderedBySection]); // Dependency on templatesOrderedBySection

  const sendToWordPress = async (rawTemplatesBySection) => {
    setLoading(true);
    setShowLoader(true); // Show loader animation
    setError(null);

    try {
      const username = import.meta.env.VITE_WP_USERNAME;
      const appPassword = import.meta.env.VITE_WP_PASS;
      const token = btoa(`${username}:${appPassword}`);

      const transformedContent = transformTemplatesToWorkingFormat(
        rawTemplatesBySection
      );

      if (transformedContent.length === 0) {
        console.warn(
          "ProcessTemplateResults: Transformed content is empty. Adding fallback section."
        );
        transformedContent.push({
          id: "fallback-section-" + Date.now(), // Unique ID for fallback
          elType: "section",
          elements: [
            {
              id: "fallback-heading-" + Date.now(),
              elType: "widget",
              widgetType: "heading",
              settings: {
                title:
                  "No sections were processed or found based on your request.",
                alignment: "center",
              },
            },
          ],
        });
      }

      const fullJsonStructure = {
        content: transformedContent,
        page_settings: {
          external_header_footer: true,
          hide_title: true,
          page_layout: "full_width",
          ui_theme_style: "no",
        },
        version: "0.4",
        type: "wp-page",
      };

      const requestData = {
        name: `Generated Template ${Math.floor(Math.random() * 100000000000)}`,
        json: structuredClone(fullJsonStructure), // Send a deep clone
      };

      console.log(
        "ProcessTemplateResults: Sending to WordPress API:",
        requestData
      );

      const response = await axios.post(
        `${import.meta.env.VITE_WP_IMPORT_API_URL}`,
        requestData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.public_url) {
        throw new Error("No post URL returned from WordPress.");
      }
      console.log(
        "ProcessTemplateResults: WordPress API success:",
        response.data
      );

      // Ensure loader shows for a minimum duration for better UX
      const minimumLoadTime = 5000; // 5 seconds
      const loadStartTime = Date.now();

      const checkAndProceed = () => {
        const elapsedTime = Date.now() - loadStartTime;
        if (elapsedTime >= minimumLoadTime) {
          onPreview(response.data.public_url, {
            name: requestData.name, // Pass the name used
            json: fullJsonStructure, // Pass the structure that was sent
          });
          setShowLoader(false);
          setLoading(false);
        } else {
          setTimeout(checkAndProceed, minimumLoadTime - elapsedTime);
        }
      };
      checkAndProceed();
    } catch (err) {
      console.error("Error sending to WordPress:", err);
      let errorMessage = "Failed to import template.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "No response received from WordPress server.";
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setLoading(false); // Stop loading on error
      setShowLoader(false); // Hide loader on error
    }
    // `finally` block removed as setLoading(false) is handled in try/catch
  };

  if (showLoader || loading) {
    // Keep showing loader if showLoader is true or still loading
    return (
      <AiLoader
        heading="Your page is being generated"
        subHeading="powered by Buildbot from Growth99"
      />
    );
  }

  if (error) {
    return (
      <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
        ⚠️ Error: {error}
      </div>
    );
  }

  // If not loading, no error, and request has been attempted, but onPreview hasn't been called yet
  // (e.g. waiting for minimum load time), this component might render null briefly.
  // Or, if initial templates were never passed, it would render null.
  return null;
};

export default ProcessBlockResults;
