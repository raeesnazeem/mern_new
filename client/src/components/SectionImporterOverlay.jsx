import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../styles/SectionImporter.module.css";


const SectionImporterOverlay = ({ onClose, onInsertSection }) => {
  // State to hold all templates fetched from the API
  const [allTemplates, setAllTemplates] = useState([]);

  // State to hold the unique, sorted list of section types for the left panel
  const [sectionTypes, setSectionTypes] = useState([]);

  // State to track the currently selected section type
  const [activeSectionType, setActiveSectionType] = useState(null);

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch ALL templates once when the component mounts
  useEffect(() => {
    const fetchAllTemplates = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_TO_SERVER_API_URL}/template/all`
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          const templates = response.data.data;
          setAllTemplates(templates);

          // Derive unique section types from the fetched data
          const uniqueTypes = [...new Set(templates.map((t) => t.sectionType))];
          uniqueTypes.sort(); // Sort alphabetically for a clean UI
          setSectionTypes(uniqueTypes);
        } else {
          setError("Received invalid data from the server.");
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        setError("Could not load templates. Please check the connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTemplates();
  }, []); // Empty dependency array ensures this runs only once

  // 2. Handle clicking a section type in the left panel
  const handleSectionTypeClick = (type) => {
    setActiveSectionType(type);
  };

  // 3. Handle selecting a specific section screenshot in the right panel
  // const handleSectionSelect = (template) => {
  //   console.log("Section selected:", template.name);

  //   // Validate that the template has the correct JSON structure
  //   if (
  //     template.json &&
  //     Array.isArray(template.json.content) &&
  //     template.json.content.length > 0
  //   ) {
  //     // Pass the entire 'content' array to the parent component's function
  //     // This is the payload Elementor expects for importing sections
  //     onInsertSection(template.json.content);
  //     onClose(); // Optional: close the overlay after selection
  //   } else {
  //     console.error("Invalid template JSON structure:", template);
  //     alert(
  //       "Error: This template is missing valid content and cannot be imported."
  //     );
  //   }
  // };
  const handleSectionSelect = (template) => {
    // --- DEBUG LOG 1 ---
    console.log("--- Step 1: handleSectionSelect fired ---");
    console.log("Template Data:", template);

    // Validate that the template has the correct JSON structure
    if (
      template.json &&
      Array.isArray(template.json.content) &&
      template.json.content.length > 0
    ) {
      // --- DEBUG LOG 2 ---
      console.log(
        "--- Step 2: Template JSON is VALID. Calling onInsertSection ---"
      );
      console.log("Payload being sent up:", template.json.content);

      onInsertSection(template.json.content);
      onClose(); // Optional: close the overlay after selection
    } else {
      console.error(
        "CRITICAL ERROR: Invalid or missing template.json.content. Data structure is wrong.",
        template
      );
      alert(
        "Error: This template is missing valid content and cannot be imported."
      );
    }
  };

  // Filter templates to display in the right panel based on the active section type
  const filteredTemplates = activeSectionType
    ? allTemplates.filter((t) => t.sectionType === activeSectionType)
    : [];

  return (
    <div className={styles.overlayBackdrop} onClick={onClose}>
      <div className={styles.overlayPanel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.importerContainer}>
          {/* Left Panel: Section Types List */}
          <div className={styles.leftPanel}>
            <h2>Sections</h2>
            <ul>
              {sectionTypes.map((type) => (
                <li
                  key={type}
                  className={activeSectionType === type ? styles.active : ""}
                  onClick={() => handleSectionTypeClick(type)}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Panel: Section Previews Grid */}
          <div className={styles.rightPanel}>
            <h3>
              {activeSectionType
                ? `${activeSectionType} Designs`
                : "Select a Section Type"}
            </h3>

            {isLoading && <p>Loading Templates...</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}

            {!isLoading && !error && (
              <div className={styles.screenshotGrid}>
                {filteredTemplates.length > 0
                  ? filteredTemplates.map((template) => (
                      <div
                        key={template._id} // Use the unique database ID as the key
                        className={styles.thumbnail}
                        onClick={() => handleSectionSelect(template)}
                      >
                        <img
                          src={template.screenshot} // Assuming 'screenshot' field contains the direct URL
                          alt={`Preview of ${template.name}`}
                          loading="lazy"
                        />
                        <div className={styles.thumbnailTitle}>
                          {template.name}
                        </div>
                      </div>
                    ))
                  : activeSectionType && (
                      <p>No templates found for this section type.</p>
                    )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionImporterOverlay;
