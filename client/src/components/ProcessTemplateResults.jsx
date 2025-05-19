import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is imported


// Helper functions to transform the template data


// 1 - Your provided normalizeImageData function
function normalizeImageData(data) {
  if (Array.isArray(data)) {
    return data.map(item => normalizeImageData(item)); // Recursively call for each item in the array
  } else if (data && typeof data === "object") {
    // Check if this object represents an image data structure
    // Elementor image data often has 'url'.
    // It might have an 'id' if it was from the media library of the source site.
    // 'source: "library"' is also a good indicator.
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
        // id: undefined // Explicitly ensure id is not carried over if that's desired, otherwise removing it via destructuring is enough
      };
    }

    // If not an image object that meets the criteria, recursively normalize its properties
    const normalizedSubObject = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) { // Process only own properties
        normalizedSubObject[key] = normalizeImageData(data[key]);
      }
    }
    return normalizedSubObject;
  }

  // Return data unchanged if it's not an array or a processable object (e.g., string, number, boolean, null)
  return data;
}

// 2 - helper function transformTemplatesToWorkingFormat function
const transformTemplatesToWorkingFormat = (templatesBySectionType) => {
  const finalContentArray = [];
  // Define the order in which section types should appear on the page.
  // For each type, ONE template variation will be randomly selected if multiple exist.
  const sectionOrder = ['header', 'herospace', 'about', 'services', 'cta', 'testimonials', 'map', 'footer'];

  sectionOrder.forEach((sectionKey) => {
    const availableSectionsForType = templatesBySectionType?.[sectionKey];

    if (
      availableSectionsForType &&
      Array.isArray(availableSectionsForType) &&
      availableSectionsForType.length > 0
    ) {
      // If there are one or more sections for this type, randomly pick one.
      const randomIndex = Math.floor(Math.random() * availableSectionsForType.length);
      const chosenSectionObject = availableSectionsForType[randomIndex];

      // Check if the chosen section object and its json.content are valid
      if (
        chosenSectionObject &&
        chosenSectionObject.json &&
        Array.isArray(chosenSectionObject.json.content)
      ) {
        // BEFORE pushing, normalize the image data within this section's content
        const normalizedSectionContent = normalizeImageData(chosenSectionObject.json.content);
        finalContentArray.push(...normalizedSectionContent);
      } else {
        console.warn(
          `The randomly chosen section for '${sectionKey}' is missing or has invalid 'json.content'. Chosen object:`,
          chosenSectionObject
        );
      }
    } else if (templatesBySectionType && Object.prototype.hasOwnProperty.call(templatesBySectionType, sectionKey)) {
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (templatesOrderedBySection) {
      sendToWordPress(templatesOrderedBySection);
    }
  }, [templatesOrderedBySection, onPreview]); // Added onPreview to dependency array as it's used in sendToWordPress

  const sendToWordPress = async (rawTemplatesBySection) => {
    console.log("sendToWordPress called with:", rawTemplatesBySection); // See what data it's getting each time
    setLoading(true);
    setError(null); // Reset error on new attempt
    try {
      const username = "Onboarding";
      const appPassword = "Eccq j5vS z9rg PoCo 8LgN quC5";
      const token = btoa(`${username}:${appPassword}`);

      // Transform the input data to the "working" format
      const transformedContent = transformTemplatesToWorkingFormat(
        rawTemplatesBySection
      );

      // Check if transformation resulted in any content
      if (transformedContent.length === 0) {
        console.warn(
          "Transformation resulted in an empty content array. Check your input data and sectionOrder in the helper function.",
          rawTemplatesBySection
        );
        // Optionally, you could throw an error here or handle it as appropriate
        // For now, we'll proceed, but WordPress might reject an empty page.
      }

      const fullJsonStructure = {
        content: transformedContent, // Use the transformed array here
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

      console.log(
        "Sending to WordPress with requestData:",
        JSON.stringify(requestData, null, 2)
      ); // For debugging

      const response = await axios.post(
        "https://customlayout.gogroth.com/wp-json/custom-builder/v1/import-template",
        requestData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.public_url) {
        throw new Error(
          "No post URL returned from WordPress. Response: " +
            JSON.stringify(response.data)
        );
      }

      onPreview(response.data.public_url, {
        name: requestData.name,
        json: fullJsonStructure,
      });
    } catch (err) {
      console.error("Error sending to WordPress:", err);
      let errorMessage = "Failed to import template.";
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", err.response.data);
        console.error("Error status:", err.response.status);
        console.error("Error headers:", err.response.headers);
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request:", err.request);
        errorMessage = "No response received from WordPress server.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", err.message);
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Importing template into WordPress...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return null;
};

export default ProcessTemplateResults; // Assuming this is a default export
