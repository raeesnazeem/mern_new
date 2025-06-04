import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// React Flow imports are removed

const AVAILABLE_SECTION_TYPES = [ //for implement change in sectionType
  // "Verse",
  // "Chorus",
  // "Bridge",
  // "Intro",
  // "Outro",
  // "Solo",
];



// Styles for the reorderable list
const listStyles = `
  .reorder-list-app-container { /* Renamed for clarity */
    width: 100%;
    min-height: 100vh; /* Ensure it takes full viewport height */
    display: flex;
    flex-direction: column;
    align-items: center; /* Center the list container */
    padding: 20px;
    box-sizing: border-box;
    background-color: #f0f0f0;
    /* Simple dot grid background */
    background-image: radial-gradient(circle, #d7d7d7 1px, transparent 1px);
    background-size: 20px 20px; /* Slightly larger dots */
  }
  .reorder-list-content { /* Wrapper for list and button */
    width: 100%;
    max-width: 550px; /* Max width for the content area */
    background-color: #ffffff; /* White background for the list area */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .reorder-list-app h2 {
    text-align: center;
    color: #333;
    margin-top: 0; /* Remove default margin */
    margin-bottom: 20px;
  }
  .sections-list-html5 {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .section-item-html5-wrapper { 
    /* border-top: 2px solid transparent; For drag over indication */
  }
  .section-item-html5-wrapper.drag-over {
    /* Visual cue for dropping *onto* an item, making it look like it's inserting before */
    /* border-top: 3px solid teal; */
    /* padding-top: 3px; */
    /* margin-top: -3px; */
    /* background-color: #e9f5ff; */ /* Light highlight on the item being hovered over */
  }
  .section-item-html5-wrapper.drag-over-placeholder::before {
    content: '';
    display: block;
    height: 10px; /* Placeholder height */
    background-color: teal; /* Blue placeholder */
    margin: -2px 0 2px 0; /* Adjust to fit nicely */
    border-radius: 4px;
  }


  .section-item-html5-content {
    padding: 10px 0px 10px 12px;
    margin: 4px 0;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 6px;
    transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .section-item-html5-content.dragging-item {
    background-color: #e3f2fd !important; /* Use important to ensure override */
    border: 1px dashed teal !important;
    opacity: 0.5;
  }
  .section-info { flex-grow: 1; }
  .section-name { font-weight: bold; font-size: 14px; color: #333; pointer-events: none; }
  .section-type-changer {
    font-size: 9px; color: teal !important; text-transform: uppercase; margin-top: 2px;
    cursor: pointer; font-weight:700; letter-spacing:0.035rem; display: inline-block; padding: 2px 4px;
    border-radius: 3px; background-color: #E0F2F1;
  }
  .section-controls-html5 { display: flex; align-items: center; gap: 8px; padding-right: 8px;}
  .control-buttons-group-html5 { display: flex; flex-direction: column; gap: 2px; }
  .move-button-html5 {
    background: none; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; padding: 2px;
    display: flex; align-items: center; justifyContent: center;
    line-height: 1; width: 24px; height: 24px;
  }
  .move-button-html5:disabled { opacity: 0.4; cursor: not-allowed; }
  .drag-handle-html5 {
    width: 24px; height: 40px; display: flex; align-items: center;
    justify-content: center; cursor: grab; border-radius: 4px; padding-left: 4px;
  }
  .drag-handle-html5:active { cursor: grabbing; }
  body.dragging-active-html5 { /* Applied to body during drag */
    /* cursor: grabbing !important; */ /* Example: global grabbing cursor */
  }
  .drop-zone-end-html5 {
    height: 40px; /* Increased height for better drop target */
    border: 2px dashed #ccc;
    border-radius: 6px;
    margin: 8px 0; /* More margin */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    font-size: 13px;
    transition: all 0.2s ease;
  }
  .drop-zone-end-html5.drag-over {
    border-color: teal;
    background-color: #e3f2fd;
  }
`;

// Inject styles once
if (!document.getElementById("reorder-list-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "reorder-list-styles";
  styleSheet.type = "text/css";
  styleSheet.innerText = listStyles;
  document.head.appendChild(styleSheet);
}

// SectionItemHTML5 Component (for HTML5 Drag and Drop)
const SectionItemHTML5 = ({
  section,
  index,
  isFirst,
  isLast,
  isDraggingThisItem,
  dragOverIndex = null, // Prop name is dragOverIndex
  onDragStartItem,
  onDragOverItem,
  onDropItem,
  onDragEndItem,
  onDragLeaveItem,
  onMoveUp,
  onMoveDown,
  onChangeType,
}) => {
  const handleDragStartOnHandle = (e) => {
    // console.log(`SectionItemHTML5: DragStart on handle for index ${index}`);
    onDragStartItem(e, index);
    document.body.classList.add("dragging-active-html5");
  };

  const handleDragEndOnHandle = (e) => {
    // console.log(`SectionItemHTML5: DragEnd on handle for index ${index}`);
    onDragEndItem(e);
    document.body.classList.remove("dragging-active-html5");
  };

  // Determine if this item is the direct drop target (for visual cue)
  const isDirectDragOverTarget = dragOverIndex === index && !isDraggingThisItem;

  return (
    <div
      id={`section-item-wrapper-${section._id}`}
      className={`section-item-html5-wrapper ${
        isDirectDragOverTarget ? "drag-over-placeholder" : ""
      }`}
      onDragOver={(e) => onDragOverItem(e, index)}
      onDrop={(e) => onDropItem(e, index)}
      onDragLeave={onDragLeaveItem}
    >
      <div
        id={`section-item-content-${section._id}`}
        className={`section-item-html5-content ${
          isDraggingThisItem ? "dragging-item" : ""
        }`}
      >
        <div className="section-info">
          <div className="section-name">{section.sectionType.toUpperCase() + " SECTION" }</div>
          <div
            className="section-type-changer"
            // onClick={() => onChangeType(index)}  // will activate when implementing section change in node
            onMouseDown={(e) => e.stopPropagation()}
          >
            {section.sectionType}
          </div>
        </div>

        <div className="section-controls-html5">
          <div className="control-buttons-group-html5">
            <button
              title="Move Up"
              className="move-button-html5"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button
              title="Move Down"
              className="move-button-html5"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div
            className="drag-handle-html5"
            draggable
            onDragStart={handleDragStartOnHandle}
            onDragEnd={handleDragEndOnHandle}
            onMouseDown={(e) => {
              // console.log("DragHandleHTML5: MouseDown on handle");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="4" r="1.5" />
              <circle cx="15" cy="4" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="15" cy="20" r="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// This component now directly manages the reorderable list using HTML5 D&D
const IntermediateComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [draggingItemIndex, setDraggingItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  const initialSectionsFromLocation = useMemo(() => {
    const state = location.state || {};
    const controllerData = state.templatesOrderedBySection || {};
    let orderToUse = state.suggestedOrder || [];

    console.log("IntermediateComponent: Received from location state:");
    console.log("templatesOrderedBySection (controllerData):", controllerData);
    console.log("suggestedOrder from state:", orderToUse);

    // If reorderedGlobalSections exists (e.g., coming back from preview page), use that directly.
    if (
      controllerData.reorderedGlobalSections &&
      Array.isArray(controllerData.reorderedGlobalSections) &&
      controllerData.reorderedGlobalSections.length > 0
    ) {
      console.log("Using reorderedGlobalSections from location state.");
      return controllerData.reorderedGlobalSections.map((s) => ({
        ...s,
        _id: s._id || `gen-${Math.random().toString(36).substr(2, 9)}`,
        sectionType: s.sectionType || AVAILABLE_SECTION_TYPES[0],
      }));
    }

    // If suggestedOrder is empty, but controllerData has keys, create a fallback order from controllerData keys
    if (
      orderToUse.length === 0 &&
      typeof controllerData === "object" &&
      Object.keys(controllerData).length > 0
    ) {
      console.warn(
        "`suggestedOrder` is empty. Using keys from `templatesOrderedBySection` as fallback order."
      );
      // Attempt a somewhat logical default order if common keys are present
      const preferredOrder = [
        "header",
        "herospace",
        "hero",
        "cta",
        "services",
        "about",
        "testimonials",
        "contact",
        "footer",
      ];
      const availableKeys = Object.keys(controllerData);

      const sortedKeys = [];
      preferredOrder.forEach((prefKey) => {
        if (
          availableKeys.includes(prefKey.toLowerCase()) ||
          availableKeys.includes(prefKey)
        ) {
          // Find the actual key name (case-insensitive for common types)
          const actualKey =
            availableKeys.find(
              (k) => k.toLowerCase() === prefKey.toLowerCase()
            ) || availableKeys.find((k) => k === prefKey);
          if (actualKey && !sortedKeys.includes(actualKey)) {
            sortedKeys.push(actualKey);
          }
        }
      });
      availableKeys.forEach((key) => {
        if (
          !sortedKeys.includes(key) &&
          key !== "reorderedGlobalSections" &&
          key !== "reorderedSections"
        ) {
          // Exclude helper keys
          sortedKeys.push(key);
        }
      });
      orderToUse = sortedKeys;
      console.log(
        "Fallback order created from controllerData keys:",
        orderToUse
      );
    }

    // Build the initial list based on the orderToUse (either suggestedOrder or fallback)
    const initialOrderedList = [];
    if (orderToUse.length > 0 && typeof controllerData === "object") {
      console.log("Building initial list using order:", orderToUse);
      orderToUse.forEach((sectionTypeKey) => {
        // Try to match sectionTypeKey case-insensitively from controllerData keys
        const actualKeyInController =
          Object.keys(controllerData).find(
            (k) => k.toLowerCase() === sectionTypeKey.toLowerCase()
          ) || sectionTypeKey;
        const sectionsForType = controllerData[actualKeyInController];

        if (Array.isArray(sectionsForType) && sectionsForType.length > 0) {
          const chosenSection = sectionsForType[0]; // Pick the first template for this type
          initialOrderedList.push({
            ...chosenSection,
            _id:
              chosenSection._id ||
              `gen-${Math.random().toString(36).substr(2, 9)}`,
            sectionType: chosenSection.sectionType || sectionTypeKey, // Ensure sectionType is consistent
          });
        } else {
          console.warn(
            `No templates found in controllerData for type: ${sectionTypeKey} (tried key: ${actualKeyInController})`
          );
        }
      });
      if (initialOrderedList.length > 0) {
        console.log(
          "Successfully built initialOrderedList:",
          initialOrderedList.map((s) => s.name)
        );
        return initialOrderedList;
      }
    }

    console.warn(
      "Could not build initial list from suggestedOrder or fallbacks. Returning empty array."
    );
    return [];
  }, [location.state]);

  const [currentSections, setCurrentSections] = useState(
    initialSectionsFromLocation
  );

  useEffect(() => {
    console.log(
      "Effect for initialSectionsFromLocation running. New initial:",
      initialSectionsFromLocation.map((s) => s.name)
    );
    if (
      JSON.stringify(initialSectionsFromLocation) !==
      JSON.stringify(currentSections)
    ) {
      console.log(
        "Updating currentSections from new location state because initialSectionsFromLocation changed."
      );
      setCurrentSections(initialSectionsFromLocation);
    }
  }, [initialSectionsFromLocation]);

  const handleDragStartItem = useCallback((e, index) => {
    setDraggingItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }, []);

  const handleDragOverItem = useCallback(
    (e, index) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

      if (index !== draggingItemIndex) {
        if (index !== dragOverItemIndex) {
          setDragOverItemIndex(index);
        }
      } else if (index === draggingItemIndex && dragOverItemIndex !== null) {
        setDragOverItemIndex(null);
      }
    },
    [draggingItemIndex, dragOverItemIndex]
  );

  const handleDragLeaveItem = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverItemIndex(null);
    }
  }, []);

  const handleDragEndItem = useCallback(() => {
    setDraggingItemIndex(null);
    setDragOverItemIndex(null);
  }, []);

  const handleDropItem = useCallback(
    (e, dropTargetOriginalIndex) => {
      e.stopPropagation();
      e.preventDefault();
      const draggedOriginalIndex = draggingItemIndex;
      const callId = Math.random().toString(36).substr(2, 5);

      console.groupCollapsed(
        `Drop Event (Call ID: ${callId}) - Item: ${
          currentSections[draggedOriginalIndex]?.name || "N/A"
        }`
      );
      console.log(
        `[${callId}] Current sections before drop:`,
        currentSections.map((s) => s.name)
      );
      console.log(
        `[${callId}] Dragged Original Index (from state): ${draggedOriginalIndex}`
      );
      console.log(
        `[${callId}] Drop Target Original Index (from event target): ${dropTargetOriginalIndex}`
      );

      if (draggedOriginalIndex === null) {
        console.warn(
          `[${callId}] No item was being dragged (draggingItemIndex is null).`
        );
        setDragOverItemIndex(null);
        console.groupEnd();
        return;
      }

      const isDroppingOnEndZone = e.currentTarget.classList.contains(
        "drop-zone-end-html5"
      );
      console.log(`[${callId}] Is dropping on end zone?`, isDroppingOnEndZone);

      if (
        !isDroppingOnEndZone &&
        draggedOriginalIndex === dropTargetOriginalIndex
      ) {
        console.log(`[${callId}] Dropped on itself (not end zone). No change.`);
        setDraggingItemIndex(null);
        setDragOverItemIndex(null);
        console.groupEnd();
        return;
      }

      const tempSections = [...currentSections];
      console.log(
        `[${callId}] 1. tempSections (copy of current):`,
        tempSections.map((s) => s.name)
      );

      if (
        draggedOriginalIndex < 0 ||
        draggedOriginalIndex >= tempSections.length
      ) {
        console.error(
          `[${callId}] Invalid draggedOriginalIndex: ${draggedOriginalIndex}. Aborting drop.`
        );
        setDraggingItemIndex(null);
        setDragOverItemIndex(null);
        console.groupEnd();
        return;
      }
      const draggedItem = tempSections.splice(draggedOriginalIndex, 1)[0];
      console.log(`[${callId}] 2. draggedItem (removed):`, draggedItem.name);
      console.log(
        `[${callId}] 3. tempSections (after splice, length ${tempSections.length}):`,
        tempSections.map((s) => s.name)
      );

      let finalInsertionIndex;

      if (isDroppingOnEndZone) {
        finalInsertionIndex = tempSections.length;
        console.log(
          `[${callId}] 4a. Dropped on end zone. finalInsertionIndex (tempSections.length):`,
          finalInsertionIndex
        );
      } else {
        if (draggedOriginalIndex < dropTargetOriginalIndex) {
          finalInsertionIndex = dropTargetOriginalIndex - 1;
        } else {
          finalInsertionIndex = dropTargetOriginalIndex;
        }
        console.log(
          `[${callId}] 4b. Dropped on an item. Calculated finalInsertionIndex:`,
          finalInsertionIndex
        );
      }

      finalInsertionIndex = Math.max(
        0,
        Math.min(finalInsertionIndex, tempSections.length)
      );
      console.log(
        `[${callId}] 5. finalInsertionIndex (bounds corrected):`,
        finalInsertionIndex
      );

      tempSections.splice(finalInsertionIndex, 0, draggedItem);
      console.log(
        `[${callId}] 6. tempSections (after insertion):`,
        tempSections.map((s) => s.name)
      );

      setCurrentSections(tempSections);
      console.log(
        `[${callId}] 7. Called setCurrentSections. State update will be async.`
      );

      setDraggingItemIndex(null);
      setDragOverItemIndex(null);
      console.groupEnd();
    },
    [currentSections, draggingItemIndex]
  );

  const handleMove = useCallback(
    (index, direction) => {
      const newSections = [...currentSections];
      if (
        (direction === -1 && index === 0) ||
        (direction === 1 && index === newSections.length - 1)
      ) {
        return;
      }
      const itemToMove = newSections.splice(index, 1)[0];
      newSections.splice(index + direction, 0, itemToMove);
      setCurrentSections(newSections);
    },
    [currentSections]
  );

  const handleMoveUp = useCallback(
    (index) => handleMove(index, -1),
    [handleMove]
  );
  const handleMoveDown = useCallback(
    (index) => handleMove(index, 1),
    [handleMove]
  );

  const handleChangeType = useCallback((index) => {
    setCurrentSections((prevSections) => {
      const newSections = [...prevSections];
      const section = newSections[index];
      if (!section) return prevSections;
      const currentTypeIndex = AVAILABLE_SECTION_TYPES.indexOf(
        section.sectionType
      );
      const nextTypeIndex =
        (currentTypeIndex + 1) % AVAILABLE_SECTION_TYPES.length;
      newSections[index] = {
        ...section,
        sectionType: AVAILABLE_SECTION_TYPES[nextTypeIndex],
      };
      return newSections;
    });
  }, []);

  const handleApplyOrder = () => {
    console.log(
      "Applying final order:",
      currentSections.map((s) => ({ name: s.name, type: s.sectionType }))
    );
    navigate("/builder-block-preview-main", {
      state: {
        templatesOrderedBySection: {
          ...(location.state?.templatesOrderedBySection || {}),
          reorderedGlobalSections: currentSections,
        },
      },
    });
  };

  return (
    <div className="reorder-list-app-container">
      <div className="reorder-list-content">
   
        <h2>Reorder Your Sections</h2>
        <div className="sections-list-html5">
          {currentSections.map((section, index) => (
            <SectionItemHTML5
              key={section._id}
              section={section}
              index={index}
              isFirst={index === 0}
              isLast={index === currentSections.length - 1}
              isDraggingThisItem={draggingItemIndex === index}
              dragOverIndex={dragOverItemIndex}
              onDragStartItem={handleDragStartItem}
              onDragOverItem={handleDragOverItem}
              onDropItem={handleDropItem}
              onDragEndItem={handleDragEndItem}
              onDragLeaveItem={handleDragLeaveItem}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onChangeType={handleChangeType}
            />
          ))}
          {currentSections.length > 0 && draggingItemIndex !== null && (
            <div
              className={`drop-zone-end-html5 ${
                dragOverItemIndex === currentSections.length ? "drag-over" : ""
              }`}
              onDragOver={(e) => handleDragOverItem(e, currentSections.length)}
              onDrop={(e) => handleDropItem(e, currentSections.length)}
              onDragLeave={handleDragLeaveItem}
            >
              {dragOverItemIndex === currentSections.length
                ? "Drop at end"
                : "Drag here to add to end"}
            </div>
          )}
          {currentSections.length === 0 && draggingItemIndex !== null && (
            <div
              className={`drop-zone-end-html5 ${
                dragOverItemIndex === 0 ? "drag-over" : ""
              }`}
              style={{ minHeight: "60px" }}
              onDragOver={(e) => handleDragOverItem(e, 0)}
              onDrop={(e) => handleDropItem(e, 0)}
              onDragLeave={handleDragLeaveItem}
            >
              {dragOverItemIndex === 0 ? "Drop here" : "Drag section to start"}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleApplyOrder}
            disabled={currentSections.length === 0}
            style={{
              padding: "12px 24px",
              backgroundColor:
                currentSections.length === 0 ? "#cccccc" : "teal",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: currentSections.length === 0 ? "not-allowed" : "pointer",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Apply Order & Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntermediateComponent;

