import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../styles/SectionImporter.module.css";

// const SectionImporterOverlay = ({ onClose, onInsertSection }) => {
//   const [sectionTypes, setSectionTypes] = useState([]);
//   const [sections, setSections] = useState({});
//   const [activeSectionType, setActiveSectionType] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch all unique section types when the component mounts
//   useEffect(() => {

//     // This is a placeholder for your real API endpoint
//     const hardcodedTypes = [
//       "Call To Action",
//       "Services",
//       "Testimonials",
//       "Hero",
//       "Headers",
//       "Footers",
//     ];
//     setSectionTypes(hardcodedTypes);

//     axios.get(`${import.meta.env.VITE_TO_SERVER_API_URL}/template/all`)
//       .then(response => {
//         if (response.data.success) {
//           setSectionTypes(response.data.data);
//           console.log("SectionTypes for SectionImporterOverlay: ", sectionTypes)
//         }
//       })
//       .catch(err => {
//         console.error("Failed to fetch section types:", err);
//         setError('Could not load section types.');
//       });

//   }, []);

//   // Handle clicking on a section type in the left panel
//   const handleSectionTypeClick = (type) => {
//     setActiveSectionType(type);

//     // If we haven't fetched this type's sections yet, do it now
//     if (!sections[type]) {
//       setIsLoading(true);
//       setError("");

//       // TODO: Replace with a real API call to your Node.js backend
//       // This is a placeholder for your real API endpoint
//       console.log(`Fetching sections for type: ${type}`);
//       setTimeout(() => {
//         const demoSections = [
//           {
//             name: `${type} Design 1`,
//             json: {
//               /* Elementor JSON */
//             },
//             screenshot_url: "https://via.placeholder.com/300x150",
//           },
//           {
//             name: `${type} Design 2`,
//             json: {
//               /* Elementor JSON */
//             },
//             screenshot_url: "https://via.placeholder.com/300x150",
//           },
//         ];
//         setSections((prev) => ({ ...prev, [type]: demoSections }));
//         setIsLoading(false);
//       }, 500);

//       /*
//       axios.post(`${import.meta.env.VITE_NODE_SERVER_URL}/api/v1/template/fetch-sections-by-type`, { sectionType: type })
//         .then(response => {
//           if (response.data.success) {
//             setSections(prev => ({ ...prev, [type]: response.data.data }));
//           }
//         })
//         .catch(err => {
//           console.error(`Failed to fetch sections for ${type}:`, err);
//           setError(`Could not load sections for ${type}.`);
//         })
//         .finally(() => setIsLoading(false));
//       */
//     }
//   };

//   // This function gets called when a user clicks a screenshot
//   const handleSectionSelect = (section) => {
//     console.log("Section selected:", section.name);
//     // Call the function passed down from BlockPreview to send the data to the iframe
//     onInsertSection(section.json.content[0]);
//   };

//   return (
//     <div className={styles.overlayBackdrop}>
//       <div className={styles.overlayPanel}>
//         <button className={styles.closeButton} onClick={onClose}>
//           ✕
//         </button>

//         <div className={styles.importerContainer}>
//           {/* Left Panel: Section Types */}
//           <div className={styles.leftPanel}>
//             <h2>Sections</h2>
//             <ul>
//               {sectionTypes.map((type) => (
//                 <li
//                   key={type}
//                   className={activeSectionType === type ? styles.active : ""}
//                   onClick={() => handleSectionTypeClick(type)}
//                 >
//                   {type}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Right Panel: Section Previews */}
//           <div className={styles.rightPanel}>
//             <h3>
//               {activeSectionType
//                 ? `${activeSectionType} Designs`
//                 : "Select a Section Type"}
//             </h3>
//             <div className={styles.screenshotGrid}>
//               {isLoading && <p>Loading...</p>}
//               {error && <p style={{ color: "red" }}>{error}</p>}
//               {!isLoading &&
//                 activeSectionType &&
//                 sections[activeSectionType]?.map((section, index) => (
//                   <div
//                     key={index}
//                     className={styles.thumbnail}
//                     onClick={() => handleSectionSelect(section)}
//                   >
//                     <img
//                       src={section.screenshot_url}
//                       alt={`Preview of ${section.name}`}
//                     />
//                     <div className={styles.thumbnailTitle}>{section.name}</div>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
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
  const handleSectionSelect = (template) => {
    console.log("Section selected:", template.name);

    // Validate that the template has the correct JSON structure
    if (
      template.json &&
      Array.isArray(template.json.content) &&
      template.json.content.length > 0
    ) {
      // Pass the entire 'content' array to the parent component's function
      // This is the payload Elementor expects for importing sections
      onInsertSection(template.json.content);
      onClose(); // Optional: close the overlay after selection
    } else {
      console.error("Invalid template JSON structure:", template);
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
