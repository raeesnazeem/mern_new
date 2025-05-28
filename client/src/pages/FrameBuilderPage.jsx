import { useState, useEffect } from "react";
import styles from "../styles/FrameBuilder.module.css";
import axios from "axios";

const FrameBuilder = () => {
  const [screenshotsBySection, setScreenshotsBySection] = useState({}); // Grouped by sectionType
  const [selectedSectionType, setSelectedSectionType] = useState(null);
  const [selectedScreenshots, setSelectedScreenshots] = useState([]);
  const [hoveredSectionType, setHoveredSectionType] = useState(null);

  // Fetch screenshots grouped by section type
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_TO_SERVER_API_URL}/frame-builder/get-all-sections`)
      .then((response) => {
        const data = response.data.data;

        const grouped = data.reduce((acc, screenshot) => {
          const { sectionType } = screenshot;
          if (!acc[sectionType]) acc[sectionType] = [];
          acc[sectionType].push(screenshot);
          return acc;
        }, {});

        setScreenshotsBySection(grouped);
      })
      .catch((error) => {
        console.error("Error fetching screenshots:", error);
      });
  }, []);

  // Handle section click
  const handleSectionClick = (sectionType) => {
    setSelectedSectionType(sectionType);
  };

  // Add screenshot to right panel
  const handleScreenshotSelect = (screenshotUrl) => {
    setSelectedScreenshots((prev) => [...prev, screenshotUrl]);
  };

  // Drag & Drop handlers
  const handleDragStart = (event, url) => {
    event.dataTransfer.setData("text/plain", url);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();
    const draggedUrl = event.dataTransfer.getData("text/plain");
    const updatedList = [...selectedScreenshots];
    const draggedIndex = updatedList.indexOf(draggedUrl);

    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      const [removed] = updatedList.splice(draggedIndex, 1);
      updatedList.splice(targetIndex, 0, removed);
      setSelectedScreenshots(updatedList);
    }
  };

  // Delete handler
  const handleDeleteScreenshot = (index) => {
    setSelectedScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Derive unique section types
  const sectionTypes = Object.keys(screenshotsBySection);

  // Left Panel Content (for DashboardLayout)
  const leftPanelContent = (
    <div className={styles.leftPanel}>
      <h2>Sections</h2>
      <ul className={styles.sectionList}>
        {sectionTypes.length > 0 &&
          sectionTypes.map((sectionType) => (
            <li
              key={sectionType}
              className={`${styles.sectionItem} ${
                hoveredSectionType === sectionType ? styles.hovered : ""
              }`}
              onMouseEnter={() => setHoveredSectionType(sectionType)}
              onMouseLeave={() => setHoveredSectionType(null)}
              onClick={() => handleSectionClick(sectionType)}
            >
              <span className={styles.sectionName}>{sectionType}</span>
            </li>
          ))}
      </ul>

      {/* Overlay Panel for Screenshot Preview */}
      {hoveredSectionType && screenshotsBySection[hoveredSectionType] && (
        <div className={styles.overlayPanel}>
          <h3>Screenshots for {hoveredSectionType}</h3>
          <div className={styles.screenshotGrid}>
            {screenshotsBySection[hoveredSectionType].map((screenshot, index) => (
              <div
                key={screenshot._id || index}
                className={styles.screenshotPreview}
                onClick={() => handleScreenshotSelect(screenshot.imageUrl)}
              >
                <img
                  src={screenshot.imageUrl}
                  alt={`Preview ${screenshot.sectionType}`}
                  className={styles.previewImage}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Right Panel Content (for DashboardLayout)
  const rightPanelContent = (
    <div className={styles.rightPanel}>
      {selectedScreenshots.length > 0 ? (
        <div className={styles.selectedScreenshots}>
          {selectedScreenshots.map((screenshotUrl, index) => (
            <div
              key={index}
              className={styles.selectedScreenshot}
              draggable
              onDragStart={(e) => handleDragStart(e, screenshotUrl)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <img
                src={screenshotUrl}
                alt={`Selected ${index}`}
                className={styles.selectedImage}
              />
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteScreenshot(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Select a section and choose screenshots to start building.</p>
      )}
    </div>
  );

  // Return only the content to be injected into layout
  return { leftPanelContent, rightPanelContent };
};

export default FrameBuilder;