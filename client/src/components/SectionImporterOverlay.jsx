import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../styles/SectionImporter.module.css";

const SectionImporterOverlay = ({ onClose, onInsertSection }) => {
  const [sectionTypes, setSectionTypes] = useState([]);
  const [sections, setSections] = useState({});
  const [activeSectionType, setActiveSectionType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all unique section types when the component mounts
  useEffect(() => {

    // This is a placeholder for your real API endpoint
    const hardcodedTypes = [
      "Call To Action",
      "Services",
      "Testimonials",
      "Hero",
      "Headers",
      "Footers",
    ];
    setSectionTypes(hardcodedTypes);

    
    
    axios.get(`${import.meta.env.VITE_TO_SERVER_API_URL}/template/all`)
      .then(response => {
        if (response.data.success) {
          setSectionTypes(response.data.data);
          console.log("SectionTypes for SectionImporterOverlay: ", sectionTypes)
        }
      })
      .catch(err => {
        console.error("Failed to fetch section types:", err);
        setError('Could not load section types.');
      });
    
  }, []);

  // Handle clicking on a section type in the left panel
  const handleSectionTypeClick = (type) => {
    setActiveSectionType(type);

    // If we haven't fetched this type's sections yet, do it now
    if (!sections[type]) {
      setIsLoading(true);
      setError("");

      // TODO: Replace with a real API call to your Node.js backend
      // This is a placeholder for your real API endpoint
      console.log(`Fetching sections for type: ${type}`);
      setTimeout(() => {
        const demoSections = [
          {
            name: `${type} Design 1`,
            json: {
              /* Elementor JSON */
            },
            screenshot_url: "https://via.placeholder.com/300x150",
          },
          {
            name: `${type} Design 2`,
            json: {
              /* Elementor JSON */
            },
            screenshot_url: "https://via.placeholder.com/300x150",
          },
        ];
        setSections((prev) => ({ ...prev, [type]: demoSections }));
        setIsLoading(false);
      }, 500);

      /*
      axios.post(`${import.meta.env.VITE_NODE_SERVER_URL}/api/v1/template/fetch-sections-by-type`, { sectionType: type })
        .then(response => {
          if (response.data.success) {
            setSections(prev => ({ ...prev, [type]: response.data.data }));
          }
        })
        .catch(err => {
          console.error(`Failed to fetch sections for ${type}:`, err);
          setError(`Could not load sections for ${type}.`);
        })
        .finally(() => setIsLoading(false));
      */
    }
  };

  // This function gets called when a user clicks a screenshot
  const handleSectionSelect = (section) => {
    console.log("Section selected:", section.name);
    // Call the function passed down from BlockPreview to send the data to the iframe
    onInsertSection(section.json.content[0]);
  };

  return (
    <div className={styles.overlayBackdrop}>
      <div className={styles.overlayPanel}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.importerContainer}>
          {/* Left Panel: Section Types */}
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

          {/* Right Panel: Section Previews */}
          <div className={styles.rightPanel}>
            <h3>
              {activeSectionType
                ? `${activeSectionType} Designs`
                : "Select a Section Type"}
            </h3>
            <div className={styles.screenshotGrid}>
              {isLoading && <p>Loading...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {!isLoading &&
                activeSectionType &&
                sections[activeSectionType]?.map((section, index) => (
                  <div
                    key={index}
                    className={styles.thumbnail}
                    onClick={() => handleSectionSelect(section)}
                  >
                    <img
                      src={section.screenshot_url}
                      alt={`Preview of ${section.name}`}
                    />
                    <div className={styles.thumbnailTitle}>{section.name}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionImporterOverlay;
