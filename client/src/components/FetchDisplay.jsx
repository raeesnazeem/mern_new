import React, { useState } from "react";
import axios from "axios";
import "../styles/fetchdisplay.css";
import ColorExtractor from "./ColorExtractor";

const FetchTemplateDisplay = ({ onPreview }) => {
  const [sectionType, setSectionType] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateForColors, setSelectedTemplateForColors] =
    useState(null);

  const fetchTemplates = async () => {
    if (!sectionType.trim()) {
      setError("Please enter a section type");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/template/fetch-template?sectionType=${sectionType}`,
        { headers: { Accept: "application/json" } }
      );

      const theData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log("rawdb fetched data", theData);

      // Clean each template's JSON data individually
      const cleanedTemplates = theData.map((template) => ({
        ...template,
        json: prepareTemplateForImport(template.json),
      }));

      console.log("Json Cleaned Template:", cleanedTemplates); // Debugging
      setTemplates(cleanedTemplates);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  function prepareTemplateForImport(templateJson) {
    // Parse JSON if it's a string
    let parsedJson = templateJson;
    if (typeof templateJson === "string") {
      try {
        parsedJson = JSON.parse(templateJson);
      } catch (err) {
        console.error("Failed to parse template JSON:", err);
        return templateJson;
      }
    }

    // Extract the content array from the template structure
    let content = parsedJson.content || parsedJson;

    // First normalize image data in the content
    const normalizedContent = normalizeImageData(content);

    // Then remove unwanted sections
    const cleanedContent = removeUnwantedSections(normalizedContent);

    // Return the full Elementor template structure
    return {
      content: cleanedContent,
      page_settings: {
        external_header_footer: true,
        hide_title: true,
        page_layout: "full_width",
        ui_theme_style: "no",
      },
      version: "0.4",
      type: "wp-page",
    };
  }

  function normalizeImageData(data) {
    if (Array.isArray(data)) {
      return data.map(normalizeImageData);
    } else if (data && typeof data === "object") {
      const isImage =
        "url" in data &&
        ("id" in data || (data.source && data.source === "library"));

      if (isImage) {
        const { id, ...rest } = data;
        return {
          ...rest,
          source: "external",
        };
      }

      const normalized = {};
      for (const key in data) {
        normalized[key] = normalizeImageData(data[key]);
      }
      return normalized;
    }

    return data;
  }

  function removeUnwantedSections(elements) {
    if (!Array.isArray(elements)) return elements;

    return elements
      .filter((el) => {
        const pageTitle = (el.title || "").toLowerCase();
        // const widgetType = (el.widgetType || "").toLowerCase();

        return !(
          pageTitle.includes("title") ||
          pageTitle.includes("header") ||
          pageTitle.includes("footer")
        );
      })
      .map((el) => ({
        ...el,
        elements: el.elements ? removeUnwantedSections(el.elements) : undefined,
      }));
  }

  const sendToElementor = async (template) => {
    setSelectedTemplate(template);
    setLoading(true);

    try {
      const username = "Onboarding";
      const appPassword = "Eccq j5vS z9rg PoCo 8LgN quC5";
      const token = btoa(`${username}:${appPassword}`);

      const requestData = {
        name: `${template.name} ${Math.floor(
          Math.random() * 90000000000 + 10000000000
        )}`,
        json: template.json,
      };

      console.log('single Template Data', requestData)
      
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
        throw new Error("No post URL returned from WordPress");
      }

      onPreview(response.data.public_url, template);
      
    } catch (err) {
      console.error("Error sending to WordPress:", err);
      setError(err.response?.data?.message || "Failed to create preview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-display-container">
      <h1>Template Preview System</h1>

      <div className="search-section">
        <div className="input-group">
          <input
            type="text"
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            placeholder="Enter section type (e.g., 'hero', 'footer')"
          />
          <button onClick={fetchTemplates} disabled={loading}>
            {loading ? "Loading..." : "Fetch Templates"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {templates.length > 0 && (
        <div className="template-list">
          <h2>Templates for: {sectionType}</h2>
          <ul>
            {templates.map((template) => (
              <li
                key={template.uuid}
                className={
                  selectedTemplate?._id === template._id ? "active" : ""
                }
              >
                <div className="template-item">
                  <span
                    className="template-name"
                    onClick={() => sendToElementor(template)}
                  >
                    {template.name}
                  </span>

                  <div className="template-actions">
                    <button
                      className="preview-badge"
                      onClick={() => sendToElementor(template)}
                    >
                      Preview
                    </button>

                    <button
                      className="colors-button"
                      onClick={() =>
                        setSelectedTemplateForColors(template.json)
                      } // Send the JSON data directly
                    >
                      Go to Colors
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {selectedTemplateForColors && (
            <div className="color-extractor-container">
              <button
                className="close-button"
                onClick={() => setSelectedTemplateForColors(null)}
              >
                Close Colors
              </button>
              <ColorExtractor jsonData={selectedTemplateForColors} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchTemplateDisplay;
