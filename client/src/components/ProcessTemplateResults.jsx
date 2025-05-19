import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is imported

// Helper function to transform the template data
const transformTemplatesToWorkingFormat = (templatesBySectionType) => {
  const finalContentArray = [];
  // Define the order in which sections should appear.
  // Adjust this array if you have different section types or a different preferred order.
  const sectionOrder = ["header", "herospace", "cta", "footer"]; // Example order

  sectionOrder.forEach((sectionKey) => {
    if (
      templatesBySectionType &&
      templatesBySectionType[sectionKey] &&
      Array.isArray(templatesBySectionType[sectionKey])
    ) {
      templatesBySectionType[sectionKey].forEach((sectionObject) => {
        // Each sectionObject is expected to have a 'json' key,
        // which in turn has a 'content' array.
        if (
          sectionObject &&
          sectionObject.json &&
          Array.isArray(sectionObject.json.content)
        ) {
          finalContentArray.push(...sectionObject.json.content);
        } else {
          console.warn(
            `Skipping section in '${sectionKey}' due to missing or invalid 'json.content':`,
            sectionObject
          );
        }
      });
    }
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
