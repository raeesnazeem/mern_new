import { useState, useEffect, useRef } from "react";
import AiLoader from "./AiLoader";
import axios from "axios";

import ColorExtractor from "./ColorExtractor";

// Helper functions to transform the template data

// 1 -  normalizeImageData function
function normalizeImageData(data) {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeImageData(item)); // Recursively call for each item in the array
  } else if (data && typeof data === "object") {
    // Check if this object represents an image data structure
    const isImage =
      "url" in data && // Must have a URL
      (data.hasOwnProperty("id") || (data.source && data.source === "library")); // And an ID or source:library

    if (isImage) {
      // Create a new object, copying all properties except 'id' (if it exists)
      // and explicitly setting 'source' to "external".
      const { id, ...restOfData } = data; // Destructure to separate 'id' (it will be undefined if not present)
      return {
        ...restOfData, // Spread the rest of the properties
        source: "external", // Force source to external
      };
    }

    // If not an image object that meets the criteria, recursively normalize its properties
    const normalizedSubObject = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Process only own properties
        normalizedSubObject[key] = normalizeImageData(data[key]);
      }
    }
    return normalizedSubObject;
  }

  // Return data unchanged if it's not an array or a processable object (e.g., string, number, boolean, null)
  return data;
}

// 2 - helper function
const transformTemplatesToWorkingFormat = (templatesBySectionType) => {
  const finalContentArray = [];
  // Define the order in which section types should appear on the page.
  // For each type, ONE template variation will be randomly selected if multiple exist.
  // const sectionOrder = [
  //   "header",
  //   "herospace",
  //   "about",
  //   "services",
  //   "cta",
  //   "testimonials",
  //   "map",
  //   "footer",
  // ];

  const sectionOrder = Object.keys(templatesBySectionType).filter(key =>
  ["full template", "header", "about", "cta", "features", "testimonials", "contact", "footer", "faq", "map", "breadcrumbs", "services", "conditions", "gallery", "before and afters", "form", "blog", "cards", "meet the team", "social feed", "mission and vision", "herospace", "herospace slider"].includes(key.toLowerCase())
);

  sectionOrder.forEach((sectionKey) => {
    const availableSectionsForType = templatesBySectionType?.[sectionKey];

    if (
      availableSectionsForType &&
      Array.isArray(availableSectionsForType) &&
      availableSectionsForType.length > 0
    ) {
      // If there are one or more sections for this type, randomly pick one.
      const randomIndex = Math.floor(
        Math.random() * availableSectionsForType.length
      );
      const chosenSectionObject = availableSectionsForType[randomIndex];

      // Check if the chosen section object and its json.content are valid
      if (
        chosenSectionObject &&
        chosenSectionObject.json &&
        Array.isArray(chosenSectionObject.json.content)
      ) {
        // BEFORE pushing, normalize the image data within this section's content
        const normalizedSectionContent = normalizeImageData(
          chosenSectionObject.json.content
        );
        finalContentArray.push(...normalizedSectionContent);
      } else {
        console.warn(
          `The randomly chosen section for '${sectionKey}' is missing or has invalid 'json.content'. Chosen object:`,
          chosenSectionObject
        );
      }
    } else if (
      templatesBySectionType &&
      Object.prototype.hasOwnProperty.call(templatesBySectionType, sectionKey)
    ) {
      // This condition means the key exists, but it's not a non-empty array.
      console.warn(
        `No usable sections found for section type '${sectionKey}'. Expected a non-empty array, but found:`,
        availableSectionsForType
      );
    }
    // If templatesBySectionType[sectionKey] does not exist, it's silently skipped.
  });

  return finalContentArray;
};

const ProcessTemplateResults = ({ templatesOrderedBySection, onPreview }) => {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false); // To control minimum display time
  const [error, setError] = useState(null);

  //make sure that the request is sent only once
  const hasSentRequest = useRef(false);

  // Start loading when templates are available
  useEffect(() => {
    // Only proceed if:
    // - templates exist
    // - request hasn't already been sent
    // - we're not already loading
    if (templatesOrderedBySection && !hasSentRequest.current && !loading) {
      hasSentRequest.current = true; // Mark as called
      sendToWordPress(templatesOrderedBySection);
    }
  }, [templatesOrderedBySection]);

  const sendToWordPress = async (rawTemplatesBySection) => {
    // console.log("sendToWordPress called with:", rawTemplatesBySection);
    setLoading(true);
    setShowLoader(true); // Show loader immediately
    setError(null);

    try {
      const username = `${import.meta.env.VITE_WP_USERNAME}`;
      const appPassword = `${import.meta.env.VITE_WP_PASS}`;
      const token = btoa(`${username}:${appPassword}`);
      

      const transformedContent = transformTemplatesToWorkingFormat(
        rawTemplatesBySection
      );

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
        json: fullJsonStructure,
      };

      // console.log(
      //   "Sending to WordPress:",
      //   JSON.stringify(requestData, null, 2)
      // );

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

      // console.log('returned data from wordpress api:', response.data)

      if (!response.data?.public_url) {
        throw new Error(
          "No post URL returned from WordPress. Response: " +
            JSON.stringify(response.data)
        );
      }

      // Delay hiding the loader if less than 8s have passed
      const timer = setTimeout(() => {
        onPreview(response.data.public_url, {
          name: requestData.name,
          json: fullJsonStructure,
        });
        setShowLoader(false);
      }, 8000);

      return () => clearTimeout(timer);
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
    } finally {
      setLoading(false);
    }
  };

  // Always show loader for at least 5s if loading was triggered
  if (showLoader || loading) {
    return (
      <AiLoader
        heading="Your page is being generated"
        subHeading="powered by Buildbot from Growth99"
      />
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return null;
};

export default ProcessTemplateResults; 