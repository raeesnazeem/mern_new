import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- ICONS for the Toolbar ---
const ZoomInIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);
const ZoomOutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);
const LockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
const UnlockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
  </svg>
);
const ResetIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v6h6" />
    <path d="M21 22v-6h-6" />
    <path d="M3 10.25a9 9 0 0 1 15.34-5.22l3.66 1.93a9 9 0 0 1-5.21 15.34l-1.94-3.66" />
  </svg>
);

const AVAILABLE_SECTION_TYPES = [];

const listStyles = `
  /* --- STYLES --- */
  .reorder-list-app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-sizing: border-box;
    background-color: #f0f0f0;
    background-image: radial-gradient(circle, #d7d7d7 1px, transparent 1px);
    background-size: 25px 25px;
    overflow: hidden;
    cursor: grab;
}

.reorder-list-app-container.is-panning{
  cursor:grabbing;
}

.reorder-list-app-container.pan-locked{
  cursor:default;
}

.reorder-list-content {
    width: 100%;
    max-width: 550px;
    min-width: 450px;
    background-color: #ffffff;
    padding: 50px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    border: 1px solid #e0e0e0;
}

.reorder-list-content h2 {
    text-align: center;
    color: #333;
    margin-top: 0;
    margin-bottom: 20px;
}

.sections-list-html5 {
    list-style: none;
    padding: 0;
    margin: 0;
}

.section-item-html5-wrapper.drag-over-placeholder::before {
    content: '';
    display: block;
    height: 10px;
    background-color: teal;
    margin: -2px 0 2px 0;
    border-radius: 4px;
}

.section-item-html5-content {
    padding: 10px 0px 10px 12px;
    margin: 4px 0;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 6px;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-item-html5-content.dragging-item {
    background-color: #e3f2fd !important;
    border: 1px dashed teal !important;
    opacity: 0.5;
}

.section-info {
    flex-grow: 1;
}

.section-name {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    pointer-events: none;
}

.section-type-changer {
    font-size: 9px;
    color: teal !important;
    text-transform: uppercase;
    margin-top: 2px;
    cursor: pointer;
    font-weight: 700;
    letter-spacing: 0.035rem;
    display: inline-block;
    padding: 2px 4px;
    border-radius: 3px;
    background-color: #E0F2F1;
}

.section-controls-html5 {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 8px;
}

.control-buttons-group-html5 {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.move-button-html5 {
    background: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    width: 24px;
    height: 24px;
}

.move-button-html5:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.drag-handle-html5 {
    width: 24px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
}

.pannable-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 80px;
    align-items: center;
    padding: 20px;
    transition: transform 0.05s ease-out;
    position: relative;
    transform-origin: center center;
}

.subpage-row {
    display: flex;
    gap: 40px;
    width: 100%;
    justify-content: center;
}

.canvas-toolbar {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    padding: 5px;
    z-index: 1000;
}

.toolbar-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #333;
}

.toolbar-button:hover {
    background-color: #f0f0f0;
}

.toolbar-separator {
    width: 1px;
    height: 20px;
    background-color: #e0e0e0;
    margin: 0 5px;
}

.zoom-display {
    font-size: 12px;
    font-weight: 500;
    padding: 0 8px;
    color: #555;
}`;

if (!document.getElementById("reorder-list-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "reorder-list-styles";
  styleSheet.type = "text/css";
  styleSheet.innerText = listStyles;
  document.head.appendChild(styleSheet);
}

const SectionItemHTML5 = React.memo(
  ({
    section,
    index,
    isFirst,
    isLast,
    onDragStartItem,
    onDragOverItem,
    onDropItem,
    onDragEndItem,
    onDragLeaveItem,
    onMoveUp,
    onMoveDown,
    onChangeType,
    isDraggingThisItem,
    dragOverIndex,
  }) => {
    const isDirectDragOverTarget =
      dragOverIndex === index && !isDraggingThisItem;
    return (
      <div
        className={`section-item-html5-wrapper ${
          isDirectDragOverTarget ? "drag-over-placeholder" : ""
        }`}
        onDragOver={(e) => onDragOverItem(e, index)}
        onDrop={(e) => onDropItem(e, index)}
        onDragLeave={onDragLeaveItem}
      >
        <div
          className={`section-item-html5-content ${
            isDraggingThisItem ? "dragging-item" : ""
          }`}
        >
          <div className="section-info">
            <div className="section-name">
              {section.name || section.sectionType.toUpperCase() + " SECTION"}
            </div>
            <div
              className="section-type-changer"
              onClick={() => onChangeType(index)}
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
              onDragStart={(e) => onDragStartItem(e, index)}
              onDragEnd={onDragEndItem}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
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
  }
);

const SectionListContainer = React.forwardRef(
  ({ title, sections, onSectionsChange, onApplyOrder }, ref) => {
    const [draggingItemIndex, setDraggingItemIndex] = useState(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
    const handleDragStartItem = useCallback(
      (e, index) => setDraggingItemIndex(index),
      []
    );
    const handleDragEndItem = useCallback(() => {
      setDraggingItemIndex(null);
      setDragOverItemIndex(null);
    }, []);
    const handleDragLeaveItem = useCallback(
      () => setDragOverItemIndex(null),
      []
    );
    const handleDragOverItem = useCallback(
      (e, index) => {
        e.preventDefault();
        if (index !== draggingItemIndex) {
          setDragOverItemIndex(index);
        }
      },
      [draggingItemIndex]
    );
    const handleDropItem = useCallback(
      (e, dropIndex) => {
        e.preventDefault();
        const draggedIndex = draggingItemIndex;
        if (draggedIndex === null || draggedIndex === dropIndex) {
          setDragOverItemIndex(null);
          return;
        }
        const newSections = [...sections];
        const [draggedItem] = newSections.splice(draggedIndex, 1);
        const adjustedDropIndex =
          draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newSections.splice(adjustedDropIndex, 0, draggedItem);
        onSectionsChange(newSections);
        setDragOverItemIndex(null);
        setDraggingItemIndex(null);
      },
      [draggingItemIndex, sections, onSectionsChange]
    );
    const handleMove = useCallback(
      (index, direction) => {
        const newSections = [...sections];
        if (
          (direction === -1 && index === 0) ||
          (direction === 1 && index === newSections.length - 1)
        )
          return;
        const [itemToMove] = newSections.splice(index, 1);
        newSections.splice(index + direction, 0, itemToMove);
        onSectionsChange(newSections);
      },
      [sections, onSectionsChange]
    );
    const handleMoveUp = useCallback(
      (index) => handleMove(index, -1),
      [handleMove]
    );
    const handleMoveDown = useCallback(
      (index) => handleMove(index, 1),
      [handleMove]
    );
    const handleChangeType = useCallback(
      (index) => console.log(`Change type for item ${index} in "${title}"`),
      [title]
    );

    return (
      <div className="reorder-list-content" ref={ref}>
        <h2>{title}</h2>
        <div className="sections-list-html5">
          {sections.map((section, index) => (
            <SectionItemHTML5
              key={section._id}
              section={section}
              index={index}
              isFirst={index === 0}
              isLast={sections.length - 1}
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
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onApplyOrder}
            disabled={sections.length === 0}
            style={{
              padding: "12px 24px",
              backgroundColor: sections.length === 0 ? "#cccccc" : "teal",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: sections.length === 0 ? "not-allowed" : "pointer",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Apply & Preview
          </button>
        </div>
      </div>
    );
  }
);

const IntermediateComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [scale, setScale] = useState(0.5);
  const [isPanLocked, setIsPanLocked] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [svgPaths, setSvgPaths] = useState([]);

  const homeContainerRef = useRef(null);
  const aboutContainerRef = useRef(null);
  const servicesContainerRef = useRef(null);
  const contactContainerRef = useRef(null);

  const allAvailableSections = useMemo(() => {
    const state = location.state || {};
    const controllerData = state.templatesOrderedBySection || {};
    let initialList =
      controllerData.reorderedGlobalSections?.length > 0
        ? controllerData.reorderedGlobalSections
        : [];
    if (initialList.length === 0) {
      let orderToUse = state.suggestedOrder || [];
      if (orderToUse.length === 0 && Object.keys(controllerData).length > 0) {
        const p = [
          "header",
          "herospace",
          "about",
          "services",
          "cta",
          "testimonials",
          "contact",
          "footer",
        ];
        const a = Object.keys(controllerData);
        const s = [];
        p.forEach((k) => {
          const x = a.find((y) => y.toLowerCase() === k.toLowerCase());
          if (x && !s.includes(x)) s.push(x);
        });
        a.forEach((k) => {
          if (
            !s.includes(k) &&
            k !== "reorderedGlobalSections" &&
            k !== "reorderedSections"
          )
            s.push(k);
        });
        orderToUse = s;
      }
      orderToUse.forEach((k) => {
        const s = controllerData[k];
        if (s?.length > 0) {
          initialList.push({ ...s[0], sectionType: s[0].sectionType || k });
        }
      });
    }

    // --- REFINEMENT: Removed all dummy tag generation ---
    // The component now trusts that the `tags` property exists on your incoming data.
    return initialList.map((s, i) => ({
      ...s,
      _id: s._id || `gen-${i}-${Math.random()}`,
    }));
    // ----------------------------------------------------
  }, [location.state]);

  // Filtering logic now uses optional chaining `?.` for safety and relies on the real tags from your data.
  const [homeSections, setHomeSections] = useState(() =>
    allAvailableSections.filter(
      (s) => s.tags?.includes("home") || s.tags?.includes("general")
    )
  );
  const [aboutSections, setAboutSections] = useState(() =>
    allAvailableSections.filter(
      (s) => s.tags?.includes("about") || s.tags?.includes("general")
    )
  );
  const [servicesSections, setServicesSections] = useState(() =>
    allAvailableSections.filter(
      (s) => s.tags?.includes("services") || s.tags?.includes("general")
    )
  );
  const [contactSections, setContactSections] = useState(() =>
    allAvailableSections.filter(
      (s) => s.tags?.includes("contact") || s.tags?.includes("general")
    )
  );

  useLayoutEffect(() => {
    const refs = [
      homeContainerRef,
      aboutContainerRef,
      servicesContainerRef,
      contactContainerRef,
    ];
    if (refs.every((ref) => ref.current)) {
      const homeNode = homeContainerRef.current;
      const subNodes = [
        aboutContainerRef.current,
        servicesContainerRef.current,
        contactContainerRef.current,
      ];
      const homeExit = {
        x: homeNode.offsetLeft + homeNode.offsetWidth / 2,
        y: homeNode.offsetTop + homeNode.offsetHeight,
      };
      const newPaths = subNodes.map((node) => {
        const entry = {
          x: node.offsetLeft + node.offsetWidth / 2,
          y: node.offsetTop,
        };
        const midY = homeExit.y + (entry.y - homeExit.y) / 2;
        return `M ${homeExit.x},${homeExit.y} V ${midY} H ${entry.x} V ${entry.y}`;
      });
      setSvgPaths(newPaths);
    }
  }, [
    homeSections,
    aboutSections,
    servicesSections,
    contactSections,
    transform,
    scale,
  ]);

  const handlePanMouseDown = (e) => {
    if (!isPanLocked && e.button === 0) {
      setPanStart({
        x: e.clientX / scale - transform.x,
        y: e.clientY / scale - transform.y,
      });
      setIsPanning(true);
    }
  };
  const handlePanMouseMove = (e) => {
    if (isPanning && !isPanLocked) {
      e.preventDefault();
      setTransform({
        x: e.clientX / scale - panStart.x,
        y: e.clientY / scale - panStart.y,
      });
    }
  };
  const handlePanMouseUpOrLeave = () => setIsPanning(false);
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    setScale((s) => Math.min(Math.max(s - e.deltaY * zoomSensitivity, 0.2), 2));
  };
  const zoom = (dir) =>
    setScale((s) =>
      Math.min(Math.max(dir === "in" ? s + 0.1 : s - 0.1, 0.2), 2)
    );
  const resetView = () => {
    setScale(1);
    setTransform({ x: 0, y: 0 });
  };

  const handleNavigateWithSections = (sectionsToApply, title) => {
    const stateToNavigate = {
      templatesOrderedBySection: {
        ...location.state?.templatesOrderedBySection,
        reorderedGlobalSections: sectionsToApply,
        name: `${title} Page - ${Date.now()}`,
      },
      originalPrompt: location.state?.originalPrompt || "No prompt.",
    };
    navigate("/builder-block-preview-main", { state: stateToNavigate });
  };

  return (
    <div
      className="reorder-list-app-container"
      onMouseDown={handlePanMouseDown}
      onMouseMove={handlePanMouseMove}
      onMouseUp={handlePanMouseUpOrLeave}
      onMouseLeave={handlePanMouseUpOrLeave}
      onWheel={handleWheel}
    >
      <div className="canvas-toolbar">
        <button
          className="toolbar-button"
          title="Zoom In"
          onClick={() => zoom("in")}
        >
          <ZoomInIcon />
        </button>
        <span className="zoom-display">{Math.round(scale * 100)}%</span>
        <button
          className="toolbar-button"
          title="Zoom Out"
          onClick={() => zoom("out")}
        >
          <ZoomOutIcon />
        </button>
        <div className="toolbar-separator"></div>
        <button
          className="toolbar-button"
          title="Reset View"
          onClick={resetView}
        >
          <ResetIcon />
        </button>
        <div className="toolbar-separator"></div>
        <button
          className="toolbar-button"
          title={isPanLocked ? "Unlock Pan" : "Lock Pan"}
          onClick={() => setIsPanLocked((prev) => !prev)}
          style={{ color: isPanLocked ? "crimson" : "inherit" }}
        >
          {isPanLocked ? <LockIcon /> : <UnlockIcon />}
        </button>
      </div>

      <div
        className="pannable-content-wrapper"
        style={{
          transform: `scale(${scale}) translate(${transform.x}px, ${transform.y}px)`,
        }}
      >
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
            overflow: "visible",
          }}
        >
          {svgPaths.map((path, i) => (
            <path
              key={i}
              d={path}
              stroke="#b0bec5"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6,6"
            />
          ))}
        </svg>

        <SectionListContainer
          ref={homeContainerRef}
          title="Home Page"
          sections={homeSections}
          onSectionsChange={setHomeSections}
          onApplyOrder={() => handleNavigateWithSections(homeSections, "Home")}
        />
        <div className="subpage-row">
          <SectionListContainer
            ref={aboutContainerRef}
            title="About Page"
            sections={aboutSections}
            onSectionsChange={setAboutSections}
            onApplyOrder={() =>
              handleNavigateWithSections(aboutSections, "About")
            }
          />
          <SectionListContainer
            ref={servicesContainerRef}
            title="Services Page"
            sections={servicesSections}
            onSectionsChange={setServicesSections}
            onApplyOrder={() =>
              handleNavigateWithSections(servicesSections, "Services")
            }
          />
          <SectionListContainer
            ref={contactContainerRef}
            title="Contact Page"
            sections={contactSections}
            onSectionsChange={setContactSections}
            onApplyOrder={() =>
              handleNavigateWithSections(contactSections, "Contact")
            }
          />
        </div>
      </div>
    </div>
  );
};

export default IntermediateComponent;
