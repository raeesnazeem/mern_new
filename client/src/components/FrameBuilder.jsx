import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../styles/FrameBuilder.module.css";
import { AiOutlineDelete } from "react-icons/ai";

const FrameBuilder = () => {
  const [screenshotsBySection, setScreenshotsBySection] = useState({});
  const [hoveredSectionType, setHoveredSectionType] = useState(null);
  const [selectedScreenshots, setSelectedScreenshots] = useState([]);

  const rightPanelRef = useRef(null);

  // Fetch screenshots grouped by sectionType
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_TO_SERVER_API_URL}/frame-builder/get-all-sections`)
      .then((response) => {
        const data = response.data.data;

        if (!data || !Array.isArray(data)) return;

        const grouped = data.reduce((acc, screenshot) => {
          const { sectionType } = screenshot;
          if (!acc[sectionType]) acc[sectionType] = [];
          acc[sectionType].push(screenshot.imageUrl);
          return acc;
        }, {});

        setScreenshotsBySection(grouped);
      })
      .catch((error) => {
        console.error("Error fetching screenshots:", error);
      });
  }, []);

  // Handle hover over section types on the left panel
  const handleSectionHover = (sectionType) => {
    setHoveredSectionType(sectionType);
  };

  // Add selected image to right panel
  const handleAddScreenshot = (url) => {
    setSelectedScreenshots((prev) => [...prev, url]);
    setHoveredSectionType(null); // Hide middle panel after selection
  };

  // Remove image from right panel
  const handleRemoveScreenshot = (index) => {
    setSelectedScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Derive unique section types
  const sectionTypes = Object.keys(screenshotsBySection);

  // Left Panel Content
  const leftPanelContent = (
    <div className={styles.three_leftPanel}>
      <h2>Sections</h2>
      <ul className={styles.sectionList}>
        {sectionTypes.map((sectionType) => (
          <li
            key={sectionType}
            className={`${styles.sectionItem} ${
              hoveredSectionType === sectionType ? styles.hovered : ""
            }`}
            onMouseEnter={() => handleSectionHover(sectionType)}
          >
            {sectionType}
          </li>
        ))}
      </ul>
    </div>
  );

  // Middle Panel Content
  const middlePanelContent = hoveredSectionType &&
    screenshotsBySection[hoveredSectionType] && (
      <div className={styles.three_middlePanel}>
        {/* Close Button */}
        <button
          className={styles.middlePanelCloseButton}
          onClick={() => setHoveredSectionType(null)}
        >
          ✕
        </button>

        <h3>{hoveredSectionType}</h3>
        <div className={styles.screenshotGrid}>
          {screenshotsBySection[hoveredSectionType]?.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Preview ${index}`}
              className={styles.thumbnail}
              onClick={() => handleAddScreenshot(url)}
            />
          ))}
        </div>
      </div>
    );

  // Right Panel Content
  const rightPanelContent = (
    <div ref={rightPanelRef} className={styles.three_rightPanel}>
      {!selectedScreenshots && <h2>Selected Screenshots</h2>}
      <div className={styles.selectedStack}>
        {selectedScreenshots.length > 0 ? (
          selectedScreenshots.map((url, index) => (
            <div key={index} className={styles.selectedItem}>
              <img
                src={url}
                alt="Selected"
                className={styles.selectedImage}
              />
              <button
                className={styles.deleteButton}
                onClick={() => handleRemoveScreenshot(index)}
              >
                <AiOutlineDelete size={18} />
              </button>
            </div>
          ))
        ) : (
          <p>No sections added yet.</p>
        )}
      </div>
    </div>
  );

  return {
    leftPanelContent,
    middlePanelContent,
    rightPanelContent,
  };
};

export default FrameBuilder;