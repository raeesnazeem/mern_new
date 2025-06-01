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
      .get(
        `${
          import.meta.env.VITE_TO_SERVER_API_URL
        }/frame-builder/get-all-sections`
      )
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

  // Handle mouse enter in right panel - hide middle panel immediately
useEffect(() => {
  const rightPanelElement = rightPanelRef.current;

  const handleMouseEnter = () => {
    setHoveredSectionType(null); 
  };

  if (rightPanelElement) {
    rightPanelElement.addEventListener("mouseenter", handleMouseEnter);
  }

  return () => {
    if (rightPanelElement) {
      rightPanelElement.removeEventListener("mouseenter", handleMouseEnter);
    }
  };
}, [hoveredSectionType]);

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

  // Handle reorder actions
  const handleReorder = (index, direction) => {
    if (direction === "up" && index > 0) {
      // Swap with previous item
      const updatedScreenshots = [...selectedScreenshots];
      const temp = updatedScreenshots[index - 1];
      updatedScreenshots[index - 1] = selectedScreenshots[index];
      updatedScreenshots[index] = temp;
      setSelectedScreenshots(updatedScreenshots);
    } else if (direction === "down" && index < selectedScreenshots.length - 1) {
      // Swap with next item
      const updatedScreenshots = [...selectedScreenshots];
      const temp = updatedScreenshots[index + 1];
      updatedScreenshots[index + 1] = selectedScreenshots[index];
      updatedScreenshots[index] = temp;
      setSelectedScreenshots(updatedScreenshots);
    }
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
      <div className={styles.selectedStack}>
        {selectedScreenshots.length > 0 ? (
          selectedScreenshots.map((url, index) => (
            <div key={index} className={styles.selectedItem}>
              {/* Reorder controls */}
              <div className={styles.reorderControls}>
                {/* Up arrow */}
                {index > 0 && (
                  <button
                    className={styles.reorderButton}
                    onClick={() => handleReorder(index, "up")}
                  >
                    ↑
                  </button>
                )}

                {/* Down arrow */}
                {index < selectedScreenshots.length - 1 && (
                  <button
                    className={styles.reorderButton}
                    onClick={() => handleReorder(index, "down")}
                  >
                    ↓
                  </button>
                )}
              </div>

              {/* Preview image */}
              <img src={url} alt="Selected" className={styles.selectedImage} />

              {/* Delete button */}
              <button
                className={styles.deleteButton}
                onClick={() => handleRemoveScreenshot(index)}
              >
                <AiOutlineDelete size={18} />
              </button>
            </div>
          ))
        ) : (
          <div style={{textAlign:"center", display:"flex", flexDirection:"column"}}>
            <h2>Start Building!!</h2>
            <p>No sections added yet.</p>
          </div>
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
