// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
//   useLayoutEffect,
// } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import LogoComponent from "../LogoComponent";
// import { FiCheckCircle } from "react-icons/fi";

// // --- (ICONS) ---
// const ZoomInIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="11" cy="11" r="8"></circle>
//     <line x1="11" y1="8" x2="11" y2="14"></line>
//     <line x1="8" y1="11" x2="14" y2="11"></line>
//   </svg>
// );
// const ZoomOutIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="11" cy="11" r="8"></circle>
//     <line x1="8" y1="11" x2="14" y2="11"></line>
//   </svg>
// );
// const LockIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//     <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//   </svg>
// );
// const UnlockIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//     <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
//   </svg>
// );

// const ResetIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="12" cy="12" r="10"></circle>
//     <path d="M12 6.75L7.25 12l5.25 5.25M7.25 12H16.75"></path>
//   </svg>
// );

// const TrashIcon = () => (
//   <svg
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2.5"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <polyline points="3 6 5 6 21 6"></polyline>
//     <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//   </svg>
// );
// const ChevronLeftIcon = () => (
//   <svg
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="3"
//   >
//     <polyline points="15 18 9 12 15 6"></polyline>
//   </svg>
// );
// const ChevronRightIcon = () => (
//   <svg
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="3"
//   >
//     <polyline points="9 18 15 12 9 6"></polyline>
//   </svg>
// );

// const AVAILABLE_SECTION_TYPES = [];

// // --- UPDATED STYLES ---
// const listStyles = `
//   /* --- STYLES --- */
//   .reorder-list-app-container {
//   width: 100%;
//   height: 100vh;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 0;
//   box-sizing: border-box;
//   background-color: #f0f0f0;
//   background-image: radial-gradient(circle, #d7d7d7 1px, transparent 1px);
//   background-size: 25px 25px;
//   overflow: hidden;
//   cursor: grab;
// }

// /* Styles for the top-left info panel */
// .canvas-info-panel {
//   position: fixed;
//   top: 25%;
//   left: 5%;
//   background-color: white;
//   border-radius: 8px;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//   padding: 15px;
//   z-index: 1000;
//   display: flex;
//   flex-direction: column;
//   gap: 15px;
//   max-width: 280px;
//   opacity:0.6;
// }

// .canvas-info-panel:hover{
//   opacity:1;
// }


// .prompt-display-box {
//   background-color: white;
//   border: 1px solid #e0e0e0;
//   border-radius: 6px;
//   padding: 10px;
//   font-size: 13px;
//   color: #333;
//   line-height: 1.4;
//   max-height: 150px;
//   overflow-y: auto;
//   font-family: 'Courier New', Courier, monospace;
//   min-width:250px;
// }

// .refine-prompt-button {
//   background-color: teal;
//   border: 1px solid #dee2e6;
//   color: #fff;
//   font-size:14px;
//   padding: 8px 12px;
//   border-radius: 6px;
//   cursor: pointer;
//   font-weight: 600;
//   font-size:12px;
//   text-align: center;
//   transition: background-color 0.2s ease;
// }

// .refine-prompt-button:hover{
//   background: teal !important;
//   color: #fff;  
// }

// .refine-prompt-button:hover {
//   background-color: #dde2e7;
// }


// .reorder-list-app-container.is-panning {
//   cursor: grabbing;
// }

// .reorder-list-app-container.pan-locked {
//   cursor: default;
// }

// .reorder-list-content {
//   width: 100%;
//   max-width: 550px;
//   min-width: 450px;
//   background-color: #ffffff;
//   padding: 50px;
//   border-radius: 16px;
//   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
//   flex-shrink: 0;
//   position: relative;
//   z-index: 1;
//   border: 1px solid #e0e0e0;
//   transition: opacity 0.3s ease, filter 0.3s ease;
// }

// .reorder-list-content h2 {
//   text-align: center;
//   color: #333;
//   margin-top: 0;
//   margin-bottom: 20px;
// }

// .sections-list-html5 {
//   list-style: none;
//   padding: 0;
//   margin: 0;
// }

// .section-item-html5-wrapper.drag-over-placeholder::before {
//   content: '';
//   display: block;
//   height: 10px;
//   background-color: teal;
//   margin: -2px 0 2px 0;
//   border-radius: 4px;
// }

// .section-item-html5-content {
//   padding: 10px 0px 10px 12px;
//   margin: 4px 0;
//   background-color: #f8f9fa;
//   border: 1px solid #ddd;
//   border-radius: 6px;
//   user-select: none;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// }

// .section-item-html5-content.dragging-item {
//   background-color: #e3f2fd !important;
//   border: 1px dashed teal !important;
//   opacity: 0.5;
// }

// .section-info {
//   flex-grow: 1;
// }

// .section-name {
//   font-weight: bold;
//   font-size: 14px;
//   color: #333;
//   pointer-events: none;
// }

// .section-type-changer {
//   font-size: 9px;
//   color: teal !important;
//   text-transform: uppercase;
//   margin-top: 2px;
//   cursor: pointer;
//   font-weight: 700;
//   letter-spacing: 0.035rem;
//   display: inline-block;
//   padding: 2px 4px;
//   border-radius: 3px;
//   background-color: #E0F2F1;
// }

// .section-description{
//   margin-top:10px;
//   padding: 0 100px 10px 0;
//   font-size: 11px;
//   font-weight:normal;
//   text-transform: math-auto !important;
// }

// .section-controls-html5 {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   padding-right: 8px;
// }

// .control-buttons-group-html5 {
//   display: flex;
//   flex-direction: column;
//   gap: 2px;
// }

// .move-button-html5 {
//   background: none;
//   border: 1px solid #ccc;
//   border-radius: 4px;
//   cursor: pointer;
//   padding: 2px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   line-height: 1;
//   width: 24px;
//   height: 24px;
// }

// .move-button-html5:disabled {
//   opacity: 0.4;
//   cursor: not-allowed;
// }

// .delete-button:hover {
//   background-color: #ffebee;
//   border-color: #e57373;
//   color: #c62828;
// }

// .drag-handle-html5 {
//   width: 24px;
//   height: 40px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: grab;
// }

// .pannable-content-wrapper {
//   display: flex;
//   flex-direction: column;
//   gap: 80px;
//   align-items: center;
//   padding: 20px;
//   transition: transform 0.05s ease-out;
//   position: relative;
//   transform-origin: center center;
// }

// .subpage-row {
//   display: flex;
//   gap: 40px;
//   width: 100%;
//   justify-content: center;
// }

// .canvas-toolbar {
//   position: fixed;
//   top: 20px;
//   right: 20px;
//   background-color: white;
//   border-radius: 8px;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//   display: flex;
//   align-items: center;
//   padding: 5px;
//   z-index: 1000;
// }

// .toolbar-button {
//   background: none;
//   border: none;
//   cursor: pointer;
//   padding: 8px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   border-radius: 4px;
//   color: #333;
// }

// .toolbar-button:hover {
//   background-color: #f0f0f0;
// }

// .toolbar-separator {
//   width: 1px;
//   height: 20px;
//   background-color: #e0e0e0;
//   margin: 0 5px;
// }

// .zoom-display {
//   font-size: 12px;
//   font-weight: 500;
//   padding: 0 8px;
//   color: #555;
// }

// .reset-icon {
//   transition: transform 0.3s ease;
// }

// .reset-icon:hover {
//   transform: rotate(90deg);
// }

// .reorder-list-content.is-inactive {
//   opacity: 0.6;
//   filter: grayscale(100%);
// }

// .inactive-overlay {
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-color: rgba(248, 249, 250, 0.6);
//   backdrop-filter: blur(2px);
//   border-radius: 16px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 2;
// }

// .activate-button {
//   background-color: #fff;
//   color: #333;
//   border: 1px solid #ccc;
//   padding: 10px 20px;
//   border-radius: 8px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: pointer;
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//   transition: all 0.2s ease;
// }

// .activate-button:hover {
//   background-color: #f0f0f0;
//   border-color: #aaa;
// }

// /* Styles for the new section cycler */
// .section-cycler {
//   display: flex;
//   align-items: center;
//   gap: 4px;
// }

// .cycle-button {
//   background: #e9ecef;
//   border: 1px solid #dee2e6;
//   color: #495057;
//   width: 20px;
//   height: 20px;
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
// }

// .cycle-button:disabled {
//   opacity: 0.3;
//   cursor: not-allowed;
// }

// .cycle-count {
//   font-size: 11px;
//   color: #6c757d;
//   font-weight: 500;
//   min-width: 35px;
//   text-align: center;
// }
// .toast-message {
//   position: fixed;
//   top: 24px;
//   left: 50%;
//   transform: translateX(-50%);
//   background-color: #e0f2f2;
//   color: #108888;
//   padding: 12px 20px;
//   border-radius: 12px;
//   box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
//   font-size: 0.8rem;
//   font-weight: 600;
//   z-index: 9999;
//   opacity: 0;
//   animation: fadeToast 2s ease-in-out forwards;
//   pointer-events: none;
// }

// .toast-message.warning {
//   background-color: #ffe5e5;
//   color: #a80000;
// }

// @keyframes fadeToast {
//   0% {
//     opacity: 0;
//     transform: translate(-50%, -8px);
//   }
//   10% {
//     opacity: 1;
//     transform: translate(-50%, 0);
//   }
//   90% {
//     opacity: 1;
//     transform: translate(-50%, 0);
//   }
//   100% {
//     opacity: 0;
//     transform: translate(-50%, -8px);
//   }
// }
// `;

// if (!document.getElementById("reorder-list-styles")) {
//   const styleSheet = document.createElement("style");
//   styleSheet.id = "reorder-list-styles";
//   styleSheet.type = "text/css";
//   styleSheet.innerText = listStyles;
//   document.head.appendChild(styleSheet);
// }

// // --- (SectionItemHTML5 and SectionListContainer)
// const SectionItemHTML5 = React.memo(
//   ({
//     sectionSlot,
//     index,
//     isFirst,
//     isLast,
//     onDragStartItem,
//     onDragOverItem,
//     onDropItem,
//     onDragEndItem,
//     onDragLeaveItem,
//     onMoveUp,
//     onMoveDown,
//     onChangeType,
//     onDeleteItem,
//     onCycle, // New prop for cycling
//     isDraggingThisItem,
//     dragOverIndex,
//   }) => {
//     // The currently active section is derived from the slot
//     const section = sectionSlot.options[sectionSlot.currentIndex];
//     const canCycle = sectionSlot.options.length > 1;

//     const isDirectDragOverTarget =
//       dragOverIndex === index && !isDraggingThisItem;
//     return (
//       <div
//         className={`section-item-html5-wrapper ${
//           isDirectDragOverTarget ? "drag-over-placeholder" : ""
//         }`}
//         onDragOver={(e) => onDragOverItem(e, index)}
//         onDrop={(e) => onDropItem(e, index)}
//         onDragLeave={onDragLeaveItem}
//       >
//         <div
//           className={`section-item-html5-content ${
//             isDraggingThisItem ? "dragging-item" : ""
//           }`}
//         >
//           <div className="section-info">
//             <div className="section-name">
//               {section.sectionType.toUpperCase() + " SECTION"}
//             </div>
//             <div
//               className="section-type-changer"
//               onClick={() => onChangeType(index)}
//               onMouseDown={(e) => e.stopPropagation()}
//             >
//               {section.sectionType}
//             </div>
//             <div className="section-description">{section.description}</div>
//           </div>

//           <div className="section-controls-html5">
//             {/* --- Section Cycler UI --- */}
//             {canCycle && (
//               <div className="section-cycler">
//                 <button
//                   className="cycle-button"
//                   onClick={() => onCycle(index, -1)}
//                   disabled={sectionSlot.currentIndex === 0}
//                 >
//                   <ChevronLeftIcon />
//                 </button>
//                 <span className="cycle-count">
//                   {sectionSlot.currentIndex + 1} of {sectionSlot.options.length}
//                 </span>
//                 <button
//                   className="cycle-button"
//                   onClick={() => onCycle(index, 1)}
//                   disabled={
//                     sectionSlot.currentIndex === sectionSlot.options.length - 1
//                   }
//                 >
//                   <ChevronRightIcon />
//                 </button>
//               </div>
//             )}
//             <button
//               title="Delete Section"
//               className="move-button-html5 delete-button"
//               onClick={() => onDeleteItem(index)}
//               onMouseDown={(e) => e.stopPropagation()}
//             >
//               <TrashIcon />
//             </button>
//             <div className="control-buttons-group-html5">
//               <button
//                 title="Move Up"
//                 className="move-button-html5"
//                 onClick={() => onMoveUp(index)}
//                 disabled={isFirst}
//                 onMouseDown={(e) => e.stopPropagation()}
//               >
//                 <svg
//                   width="12"
//                   height="12"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <polyline points="18 15 12 9 6 15"></polyline>
//                 </svg>
//               </button>
//               <button
//                 title="Move Down"
//                 className="move-button-html5"
//                 onClick={() => onMoveDown(index)}
//                 disabled={isLast}
//                 onMouseDown={(e) => e.stopPropagation()}
//               >
//                 <svg
//                   width="12"
//                   height="12"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <polyline points="6 9 12 15 18 9"></polyline>
//                 </svg>
//               </button>
//             </div>
//             <div
//               className="drag-handle-html5"
//               draggable
//               onDragStart={(e) => onDragStartItem(e, index)}
//               onDragEnd={onDragEndItem}
//               onMouseDown={(e) => e.stopPropagation()}
//             >
//               <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//               >
//                 <circle cx="9" cy="4" r="1.5" />
//                 <circle cx="15" cy="4" r="1.5" />
//                 <circle cx="9" cy="12" r="1.5" />
//                 <circle cx="15" cy="12" r="1.5" />
//                 <circle cx="9" cy="20" r="1.5" />
//                 <circle cx="15" cy="20" r="1.5" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// const SectionListContainer = React.forwardRef(
//   (
//     { title, sections, onSectionsChange, onApplyOrder, isActive, onActivate },
//     ref
//   ) => {
//     const [draggingItemIndex, setDraggingItemIndex] = useState(null);
//     const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
//     const handleDragStartItem = useCallback(
//       (e, index) => setDraggingItemIndex(index),
//       []
//     );
//     const handleDragEndItem = useCallback(() => {
//       setDraggingItemIndex(null);
//       setDragOverItemIndex(null);
//     }, []);
//     const handleDragLeaveItem = useCallback(
//       () => setDragOverItemIndex(null),
//       []
//     );
//     const handleDragOverItem = useCallback(
//       (e, index) => {
//         e.preventDefault();
//         if (index !== draggingItemIndex) {
//           setDragOverItemIndex(index);
//         }
//       },
//       [draggingItemIndex]
//     );
//     const handleDropItem = useCallback(
//       (e, dropIndex) => {
//         e.preventDefault();
//         const draggedIndex = draggingItemIndex;
//         if (draggedIndex === null || draggedIndex === dropIndex) {
//           setDragOverItemIndex(null);
//           return;
//         }
//         const newSections = [...sections];
//         const [draggedItem] = newSections.splice(draggedIndex, 1);
//         const adjustedDropIndex =
//           draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
//         newSections.splice(adjustedDropIndex, 0, draggedItem);
//         onSectionsChange(newSections);
//         setDragOverItemIndex(null);
//         setDraggingItemIndex(null);
//       },
//       [draggingItemIndex, sections, onSectionsChange]
//     );
//     const handleMove = useCallback(
//       (index, direction) => {
//         const newSections = [...sections];
//         if (
//           (direction === -1 && index === 0) ||
//           (direction === 1 && index === newSections.length - 1)
//         )
//           return;
//         const [itemToMove] = newSections.splice(index, 1);
//         newSections.splice(index + direction, 0, itemToMove);
//         onSectionsChange(newSections);
//       },
//       [sections, onSectionsChange]
//     );
//     const handleMoveUp = useCallback(
//       (index) => handleMove(index, -1),
//       [handleMove]
//     );
//     const handleMoveDown = useCallback(
//       (index) => handleMove(index, 1),
//       [handleMove]
//     );
//     const handleChangeType = useCallback(
//       (index) => console.log(`Change type for item ${index} in "${title}"`),
//       [title]
//     );
//     const handleDeleteItem = useCallback(
//       (indexToDelete) =>
//         onSectionsChange(
//           sections.filter((_, index) => index !== indexToDelete)
//         ),
//       [sections, onSectionsChange]
//     );

//     // --- NEW: Handler for cycling through section options ---
//     const handleCycleSection = useCallback(
//       (slotIndex, direction) => {
//         const newSections = [...sections];
//         const slot = newSections[slotIndex];
//         const newIndex = slot.currentIndex + direction;
//         if (newIndex >= 0 && newIndex < slot.options.length) {
//           slot.currentIndex = newIndex;
//           onSectionsChange(newSections);
//         }
//       },
//       [sections, onSectionsChange]
//     );

//     return (
//       <div
//         className={`reorder-list-content ${!isActive ? "is-inactive" : ""}`}
//         ref={ref}
//       >
//         {!isActive && (
//           <div className="inactive-overlay">
//             <button className="activate-button" onClick={onActivate}>
//               Activate
//             </button>
//           </div>
//         )}
//         <h2>{title}</h2>
//         <div
//           className="sections-list-html5"
//           style={{ pointerEvents: !isActive ? "none" : "auto" }}
//         >
//           {sections.map((sectionSlot, index) => (
//             <SectionItemHTML5
//               key={sectionSlot.options[sectionSlot.currentIndex]._id}
//               sectionSlot={sectionSlot}
//               index={index}
//               isFirst={index === 0}
//               isLast={sections.length - 1}
//               isDraggingThisItem={draggingItemIndex === index}
//               dragOverIndex={dragOverItemIndex}
//               onDragStartItem={handleDragStartItem}
//               onDragOverItem={handleDragOverItem}
//               onDropItem={handleDropItem}
//               onDragEndItem={handleDragEndItem}
//               onDragLeaveItem={handleDragLeaveItem}
//               onMoveUp={handleMoveUp}
//               onMoveDown={handleMoveDown}
//               onChangeType={handleChangeType}
//               onDeleteItem={handleDeleteItem}
//               onCycle={handleCycleSection} // Pass the new cycle handler
//             />
//           ))}
//         </div>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             marginTop: "20px",
//           }}
//         >
//           <button
//             onClick={onApplyOrder}
//             disabled={sections.length === 0}
//             style={{
//               padding: "12px 24px",
//               backgroundColor: sections.length === 0 ? "#cccccc" : "teal",
//               color: "white",
//               border: "none",
//               borderRadius: "8px",
//               cursor:
//                 sections.length === 0 || !isActive ? "not-allowed" : "pointer",
//               fontSize: "1rem",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//               opacity: !isActive ? 0.5 : 1,
//             }}
//           >
//             Apply & Preview
//           </button>
//         </div>
//       </div>
//     );
//   }
// );

// // --- (buildPageSections and other helpers) ---
// const parseColorFromPrompt = (prompt) => {
//   if (!prompt) return null;
//   const colors = [
//     "blue",
//     "red",
//     "green",
//     "black",
//     "white",
//     "purple",
//     "orange",
//     "yellow",
//     "teal",
//     "pink",
//   ];
//   const promptLowerCase = prompt.toLowerCase();
//   for (const color of colors) {
//     if (promptLowerCase.includes(color)) return color;
//   }
//   return null;
// };

// const buildPageSections = (
//   allSections,
//   pageTags,
//   priorityColor,
//   pageName // NEW: pageName to determine sorting
// ) => {
//   // Filter candidates based on page-specific tags
//   const candidates = allSections.filter((s) =>
//     pageTags.some((tag) => s.tags?.includes(tag))
//   );

//   // Group candidates by their sectionType
//   const groupedByType = candidates.reduce((acc, section) => {
//     const type = section.sectionType || "unknown";
//     if (!acc[type]) acc[type] = [];
//     acc[type].push(section);
//     return acc;
//   }, {});

//   // Create the final section slots
//   let finalSectionSlots = [];
//   for (const type in groupedByType) {
//     const options = groupedByType[type];
//     let bestMatchIndex = 0; // Default to the first option

//     if (priorityColor) {
//       const coloredIndex = options.findIndex((s) =>
//         s.tags?.includes(priorityColor)
//       );
//       if (coloredIndex !== -1) {
//         bestMatchIndex = coloredIndex;
//       }
//     }

//     finalSectionSlots.push({
//       sectionType: type,
//       options: options,
//       currentIndex: bestMatchIndex,
//     });
//   }

//   // --- NEW: Default Sorting Logic ---
//   const sortOrderConfig = {
//     home: {
//       by: "sectionType",
//       order: [
//         "header",
//         "herospace",
//         "about",
//         "features",
//         "gallery",
//         "before and afters",
//         "meet the team",
//         "mission and vision",
//         "testimonials",
//         "cta",
//         "map",
//         "footer",
//       ],
//       equivalents: { "herospace slider": "herospace", services: "features" },
//     },
//     about: {
//       by: "tagOrType",
//       order: ["header", "breadcrumbs", "about-intro", "team", "footer"],
//       equivalents: { "about-introduction": "about-intro" },
//     },
//     services: {
//       by: "tagOrType",
//       order: [
//         "header",
//         "breadcrumbs",
//         "service-intro",
//         "features",
//         "faq",
//         "cta",
//         "footer",
//       ],
//       equivalents: { "service-introduction": "service-intro" },
//     },
//     // ADD THIS NEW CONFIGURATION FOR THE CONTACT PAGE
//     contact: {
//       by: "sectionType",
//       order: ["header", "contact", "map", "cta", "footer"],
//       equivalents: {},
//     },
//   };
//   const pageConfig = sortOrderConfig[pageName];

//   if (pageConfig) {
//     const getSortIndex = (slot) => {
//       if (pageConfig.by === "sectionType") {
//         let type = slot.sectionType;
//         if (pageConfig.equivalents[type]) {
//           type = pageConfig.equivalents[type];
//         }
//         const index = pageConfig.order.indexOf(type);
//         return index === -1 ? Infinity : index;
//       }

//       if (pageConfig.by === "tagOrType") {
//         // Prioritize sectionType match
//         let typeIndex = pageConfig.order.indexOf(slot.sectionType);
//         if (typeIndex !== -1) return typeIndex;

//         // Then check tags
//         const currentSection = slot.options[slot.currentIndex];
//         const tags = currentSection.tags || [];
//         for (let tag of tags) {
//           if (pageConfig.equivalents[tag]) {
//             tag = pageConfig.equivalents[tag];
//           }
//           const tagIndex = pageConfig.order.indexOf(tag);
//           if (tagIndex !== -1) return tagIndex;
//         }
//         return Infinity; // Not found in order array
//       }
//       return Infinity;
//     };

//     finalSectionSlots.sort((a, b) => getSortIndex(a) - getSortIndex(b));
//   }

//   return finalSectionSlots;
// };

// // --- Actual Component---
// const IntermediateComponent = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [scale, setScale] = useState(0.5);
//   const [isPanLocked, setIsPanLocked] = useState(false);
//   const [isPanning, setIsPanning] = useState(false);
//   const [panStart, setPanStart] = useState({ x: 0, y: 0 });
//   const [transform, setTransform] = useState({ x: 0, y: 0 });
//   const [svgPaths, setSvgPaths] = useState([]);
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState("success"); // or "warning"
//   const [activePages, setActivePages] = useState({
//     home: false,
//     about: false,
//     services: false,
//     contact: false,
//   });

//   const homeContainerRef = useRef(null);
//   const aboutContainerRef = useRef(null);
//   const servicesContainerRef = useRef(null);
//   const contactContainerRef = useRef(null);

//   const allAvailableSections = useMemo(() => {
//     const state = location.state || {};
//     const allMatchingTemplates = state.allMatchingTemplatesFromController || [];
//     return allMatchingTemplates.map((s, i) => ({
//       ...s,
//       _id: s._id || `gen-${i}-${Math.random()}`,
//     }));
//   }, [location.state]);

//   const priorityColor = useMemo(
//     () => parseColorFromPrompt(location.state?.originalPrompt),
//     [location.state?.originalPrompt]
//   );

//   const getToastContent = (icon, message) => (
//     <div>
//       <span style={{ verticalAlign: "middle", fontSize:"0.9rem" }}>{icon} </span> {message}
//     </div>
//   );

//   useEffect(() => {
//     const checkIsActive = (tag) =>
//       allAvailableSections.some((section) => section.tags?.includes(tag));
//     setActivePages({
//       home: checkIsActive("home-page"),
//       about: checkIsActive("about-page"),
//       services: checkIsActive("services-page"),
//       contact: checkIsActive("contact-page"),
//     });
//   }, [allAvailableSections]);

//   //useEffect that sets activePages to show the correct toast
//   useEffect(() => {
//     const checkIsActive = (tag) =>
//       allAvailableSections.some((section) => section.tags?.includes(tag));

//     const hasTemplates = allAvailableSections.length > 0;

//     setActivePages({
//       home: checkIsActive("home-page"),
//       about: checkIsActive("about-page"),
//       services: checkIsActive("services-page"),
//       contact: checkIsActive("contact-page"),
//     });

//     // Show toast
//     if (hasTemplates) {
//       setToastMessage(
//         getToastContent(<FiCheckCircle />, " Yay! We got some templates generated for you!")
//       );
//       setToastType("success");
//     } else {
//       setToastMessage(
//         getToastContent(<FiCheckCircle />, " No Templates to load!")
//       );
//       setToastType("warning");
//     }

//     const timer = setTimeout(() => setToastMessage(null), 6000); // 6 seconds only
//     return () => clearTimeout(timer);
//   }, [allAvailableSections]);

//   const [homeSections, setHomeSections] = useState(() =>
//     buildPageSections(
//       allAvailableSections,
//       ["home-page", "general"],
//       priorityColor,
//       "home" // Specify page for sorting
//     )
//   );
//   const [aboutSections, setAboutSections] = useState(() =>
//     buildPageSections(
//       allAvailableSections,
//       ["about-page", "general"],
//       priorityColor,
//       "about" // Specify page for sorting
//     )
//   );
//   const [servicesSections, setServicesSections] = useState(() =>
//     buildPageSections(
//       allAvailableSections,
//       ["services-page", "general"],
//       priorityColor,
//       "services" // Specify page for sorting
//     )
//   );

//   const [contactSections, setContactSections] = useState(() =>
//     buildPageSections(
//       allAvailableSections,
//       ["contact-page", "general"],
//       priorityColor,
//       "contact" // Pass the page name to enable sorting
//     )
//   );

//   useLayoutEffect(() => {
//     const refs = [
//       homeContainerRef,
//       aboutContainerRef,
//       servicesContainerRef,
//       contactContainerRef,
//     ];
//     if (refs.every((ref) => ref.current)) {
//       const homeNode = homeContainerRef.current;
//       const subNodes = [
//         aboutContainerRef.current,
//         servicesContainerRef.current,
//         contactContainerRef.current,
//       ];
//       const homeExit = {
//         x: homeNode.offsetLeft + homeNode.offsetWidth / 2,
//         y: homeNode.offsetTop + homeNode.offsetHeight,
//       };
//       const newPaths = subNodes.map((node) => {
//         const entry = {
//           x: node.offsetLeft + node.offsetWidth / 2,
//           y: node.offsetTop,
//         };
//         const midY = homeExit.y + (entry.y - homeExit.y) / 2;
//         return `M ${homeExit.x},${homeExit.y} V ${midY} H ${entry.x} V ${entry.y}`;
//       });
//       setSvgPaths(newPaths);
//     }
//   }, [
//     homeSections,
//     aboutSections,
//     servicesSections,
//     contactSections,
//     transform,
//     scale,
//   ]);

//   const handlePanMouseDown = (e) => {
//     if (!isPanLocked && e.button === 0) {
//       setPanStart({
//         x: e.clientX / scale - transform.x,
//         y: e.clientY / scale - transform.y,
//       });
//       setIsPanning(true);
//     }
//   };
//   const handlePanMouseMove = (e) => {
//     if (isPanning && !isPanLocked) {
//       e.preventDefault();
//       setTransform({
//         x: e.clientX / scale - panStart.x,
//         y: e.clientY / scale - panStart.y,
//       });
//     }
//   };
//   const handlePanMouseUpOrLeave = () => setIsPanning(false);
//   const handleWheel = (e) => {
//     e.preventDefault();
//     const zoomSensitivity = 0.001;
//     setScale((s) => Math.min(Math.max(s - e.deltaY * zoomSensitivity, 0.2), 2));
//   };
//   const zoom = (dir) =>
//     setScale((s) =>
//       Math.min(Math.max(dir === "in" ? s + 0.1 : s - 0.1, 0.2), 2)
//     );
//   const resetView = () => {
//     setScale(0.5);
//     setTransform({ x: 0, y: 0 });
//   };
//   const handleActivatePage = (pageName) =>
//     setActivePages((prev) => ({ ...prev, [pageName]: true }));

//   const handleNavigateWithSections = (sectionSlots, title) => {
//     // Before navigating, we need to flatten the selected sections from the slots
//     const sectionsToApply = sectionSlots.map(
//       (slot) => slot.options[slot.currentIndex]
//     );
//     const stateToNavigate = {
//       templatesOrderedBySection: {
//         ...location.state?.templatesOrderedBySection,
//         reorderedGlobalSections: sectionsToApply,
//         name: `${title} Page - ${Date.now()}`,
//       },
//       originalPrompt: location.state?.originalPrompt || "No prompt.",
//       allMatchingTemplatesFromController: allAvailableSections,
//     };
//     navigate("/builder-block-preview-main", { state: stateToNavigate });
//   };

//   // Handler for the refine prompt button
//   const handleRefinePrompt = useCallback(() => {
//     // Navigate one step back in the history stack
//     navigate(-1);
//   }, [navigate]);

//   return (
//     <div
//       className={`reorder-list-app-container ${isPanning ? "is-panning" : ""} ${
//         isPanLocked ? "pan-locked" : ""
//       }`}
//       onMouseDown={handlePanMouseDown}
//       onMouseMove={handlePanMouseMove}
//       onMouseUp={handlePanMouseUpOrLeave}
//       onMouseLeave={handlePanMouseUpOrLeave}
//       onWheel={handleWheel}
//     >
//       {/*Top-left info panel */}
//       <LogoComponent />
//       {toastMessage && (
//         <div
//           className={`toast-message ${
//             toastType === "warning" ? "warning" : ""
//           }`}
//         >
//           {toastMessage}
//         </div>
//       )}
//       <div className="canvas-info-panel">
//         <div className="prompt-display-box">
//           {location.state?.originalPrompt || "No prompt provided."}
//         </div>
//         <button className="refine-prompt-button" onClick={handleRefinePrompt}>
//           Refine Prompt
//         </button>
//       </div>

//       <div className="canvas-toolbar">
//         <button
//           className="toolbar-button"
//           title="Zoom In"
//           onClick={() => zoom("in")}
//         >
//           <ZoomInIcon />
//         </button>
//         <span className="zoom-display">{Math.round(scale * 100)}%</span>
//         <button
//           className="toolbar-button"
//           title="Zoom Out"
//           onClick={() => zoom("out")}
//         >
//           <ZoomOutIcon />
//         </button>
//         <div className="toolbar-separator"></div>
//         <button
//           className="toolbar-button"
//           title="Reset View"
//           onClick={resetView}
//         >
//           <ResetIcon />
//         </button>
//         <div className="toolbar-separator"></div>
//         <button
//           className="toolbar-button"
//           title={isPanLocked ? "Unlock Pan" : "Lock Pan"}
//           onClick={() => setIsPanLocked((prev) => !prev)}
//           style={{ color: isPanLocked ? "crimson" : "inherit" }}
//         >
//           {isPanLocked ? <LockIcon /> : <UnlockIcon />}
//         </button>
//       </div>
//       <div
//         className="pannable-content-wrapper"
//         style={{
//           transform: `scale(${scale}) translate(${transform.x}px, ${transform.y}px)`,
//         }}
//       >
//         <svg
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//             zIndex: 0,
//             overflow: "visible",
//           }}
//         >
//           {svgPaths.map((path, i) => (
//             <path
//               key={i}
//               d={path}
//               stroke="#b0bec5"
//               strokeWidth="2"
//               fill="none"
//               strokeDasharray="6,6"
//             />
//           ))}
//         </svg>
//         <SectionListContainer
//           ref={homeContainerRef}
//           title="Home Page"
//           sections={homeSections}
//           onSectionsChange={setHomeSections}
//           onApplyOrder={() => handleNavigateWithSections(homeSections, "Home")}
//           isActive={activePages.home}
//           onActivate={() => handleActivatePage("home")}
//         />
//         <div className="subpage-row">
//           <SectionListContainer
//             ref={aboutContainerRef}
//             title="About Page"
//             sections={aboutSections}
//             onSectionsChange={setAboutSections}
//             onApplyOrder={() =>
//               handleNavigateWithSections(aboutSections, "About")
//             }
//             isActive={activePages.about}
//             onActivate={() => handleActivatePage("about")}
//           />
//           <SectionListContainer
//             ref={servicesContainerRef}
//             title="Services Page"
//             sections={servicesSections}
//             onSectionsChange={setServicesSections}
//             onApplyOrder={() =>
//               handleNavigateWithSections(servicesSections, "Services")
//             }
//             isActive={activePages.services}
//             onActivate={() => handleActivatePage("services")}
//           />
//           <SectionListContainer
//             ref={contactContainerRef}
//             title="Contact Page"
//             sections={contactSections}
//             onSectionsChange={setContactSections}
//             onApplyOrder={() =>
//               handleNavigateWithSections(contactSections, "Contact")
//             }
//             isActive={activePages.contact}
//             onActivate={() => handleActivatePage("contact")}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IntermediateComponent;
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import ReactDOM from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import LogoComponent from "../LogoComponent";
import { FiCheckCircle } from "react-icons/fi";

// --- (ICONS) ---
// ... (Icon components remain unchanged)
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
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6.75L7.25 12l5.25 5.25M7.25 12H16.75"></path>
  </svg>
);

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);


const AVAILABLE_SECTION_TYPES = [];

// --- UPDATED STYLES ---
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

/* Styles for the top-left info panel */
.canvas-info-panel {
  position: fixed;
  top: 25%;
  left: 5%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 15px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 280px;
  opacity:0.6;
}

.canvas-info-panel:hover{
  opacity:1;
}


.prompt-display-box {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  max-height: 150px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  min-width:250px;
}

.refine-prompt-button {
  background-color: teal;
  border: 1px solid #dee2e6;
  color: #fff;
  font-size:14px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size:12px;
  text-align: center;
  transition: background-color 0.2s ease;
}

.refine-prompt-button:hover{
  background: teal !important;
  color: #fff;  
}

.refine-prompt-button:hover {
  background-color: #dde2e7;
}


.reorder-list-app-container.is-panning {
  cursor: grabbing;
}

.reorder-list-app-container.pan-locked {
  cursor: default;
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
  transition: opacity 0.3s ease, filter 0.3s ease;
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

.section-description{
  margin-top:10px;
  padding: 0 100px 10px 0;
  font-size: 11px;
  font-weight:normal;
  text-transform: math-auto !important;
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

.delete-button:hover {
  background-color: #ffebee;
  border-color: #e57373;
  color: #c62828;
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
}

.reset-icon {
  transition: transform 0.3s ease;
}

.reset-icon:hover {
  transform: rotate(90deg);
}

.reorder-list-content.is-inactive {
  opacity: 0.6;
  filter: grayscale(100%);
}

.inactive-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(248, 249, 250, 0.6);
  backdrop-filter: blur(2px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.activate-button {
  background-color: #fff;
  color: #333;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.activate-button:hover {
  background-color: #f0f0f0;
  border-color: #aaa;
}

/* Styles for the new section cycler */
.section-cycler {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cycle-button {
  background: #e9ecef;
  border: 1px solid #dee2e6;
  color: #495057;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cycle-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cycle-count {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  min-width: 35px;
  text-align: center;
}
.toast-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e0f2f2;
  color: #108888;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 9999;
  opacity: 0;
  animation: fadeToast 2s ease-in-out forwards;
  pointer-events: none;
}

.toast-message.warning {
  background-color: #ffe5e5;
  color: #a80000;
}

@keyframes fadeToast {
  0% {
    opacity: 0;
    transform: translate(-50%, -8px);
  }
  10% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  90% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -8px);
  }
}

/* --- STYLES FOR SINGLE SECTION PREVIEW --- */
.single-section-preview {
  position: fixed;
  width: 280px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  animation: fadeInPreview 0.2s ease-out;
  border: 1px solid #e0e0e0;
  padding: 0;
  overflow: hidden;
}

@keyframes fadeInPreview {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-item-screenshot {
  width: 100%;
  height: auto;
  object-fit: cover;
  background-color: #f0f0f0;
  display: block;
}

.preview-item-details {
  padding: 12px;
}

.preview-item-name {
  font-weight: bold;
  font-size: 13px;
  color: #333;
  text-transform: uppercase;
}

.preview-item-description {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  white-space: normal;
  line-height: 1.3;
}
`;

if (!document.getElementById("reorder-list-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "reorder-list-styles";
  styleSheet.type = "text/css";
  styleSheet.innerText = listStyles;
  document.head.appendChild(styleSheet);
}

// --- (NEW: Simplified SectionPreview Component) ---
const SectionPreview = ({ option, position, onMouseEnter, onMouseLeave }) => {
  if (!position || !option) return null;

  const style = {
    top: `${position.top}px`,
    left: `${position.left}px`,
  };

  return (
    <div
      className="single-section-preview"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {option.screenshot && (
        <img
          src={option.screenshot}
          alt={`Preview of ${option.sectionType}`}
          className="preview-item-screenshot"
        />
      )}
      <div className="preview-item-details">
        <div className="preview-item-name">{option.sectionType.toUpperCase()}</div>
        <div className="preview-item-description">{option.description}</div>
      </div>
    </div>
  );
};

// --- (SectionItemHTML5 and SectionListContainer)
// ... (These components are unchanged from the previous version)
const SectionItemHTML5 = React.memo(
  ({
    sectionSlot,
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
    onDeleteItem,
    onCycle,
    isDraggingThisItem,
    dragOverIndex,
    onShowPreview,
    onHidePreview,
  }) => {
    const section = sectionSlot.options[sectionSlot.currentIndex];
    const canCycle = sectionSlot.options.length > 1;
    const isDirectDragOverTarget = dragOverIndex === index && !isDraggingThisItem;

    const showLeftPreview = sectionSlot.currentIndex > 0;
    const showRightPreview = sectionSlot.currentIndex < sectionSlot.options.length - 1;

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
              {section.sectionType.toUpperCase() + " SECTION"}
            </div>
            <div
              className="section-type-changer"
              onClick={() => onChangeType(index)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {section.sectionType}
            </div>
            <div className="section-description">{section.description}</div>
          </div>

          <div className="section-controls-html5">
            {canCycle && (
              <div className="section-cycler">
                <button
                  className="cycle-button"
                  onClick={() => onCycle(index, -1)}
                  disabled={!showLeftPreview}
                  onMouseEnter={(e) =>
                    showLeftPreview && onShowPreview(index, e.currentTarget, -1)
                  }
                  onMouseLeave={onHidePreview}
                >
                  <ChevronLeftIcon />
                </button>
                <span className="cycle-count">
                  {sectionSlot.currentIndex + 1} of {sectionSlot.options.length}
                </span>
                <button
                  className="cycle-button"
                  onClick={() => onCycle(index, 1)}
                  disabled={!showRightPreview}
                  onMouseEnter={(e) =>
                    showRightPreview && onShowPreview(index, e.currentTarget, 1)
                  }
                  onMouseLeave={onHidePreview}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            )}
            <button
              title="Delete Section"
              className="move-button-html5 delete-button"
              onClick={() => onDeleteItem(index)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <TrashIcon />
            </button>
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
  (
    { title, sections, onSectionsChange, onApplyOrder, isActive, onActivate },
    ref
  ) => {
    const [draggingItemIndex, setDraggingItemIndex] = useState(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
    const [previewedSection, setPreviewedSection] = useState(null);
    const hidePreviewTimeoutRef = useRef(null);

    useEffect(() => () => clearTimeout(hidePreviewTimeoutRef.current), []);

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
    const handleDeleteItem = useCallback(
      (indexToDelete) =>
        onSectionsChange(
          sections.filter((_, index) => index !== indexToDelete)
        ),
      [sections, onSectionsChange]
    );

    const handleCycleSection = useCallback(
      (slotIndex, direction) => {
        const newSections = [...sections];
        const slot = newSections[slotIndex];
        const newIndex = slot.currentIndex + direction;
        if (newIndex >= 0 && newIndex < slot.options.length) {
          slot.currentIndex = newIndex;
          onSectionsChange(newSections);
        }
      },
      [sections, onSectionsChange]
    );

    const handleShowPreview = useCallback(
      (slotIndex, anchorEl, direction) => {
        clearTimeout(hidePreviewTimeoutRef.current);
        const slot = sections[slotIndex];
        const previewIndex = slot.currentIndex + direction;
        if (
          slot &&
          slot.options.length > 1 &&
          previewIndex >= 0 &&
          previewIndex < slot.options.length
        ) {
          setPreviewedSection({ index: slotIndex, anchorEl, direction });
        }
      },
      [sections]
    );

    const handleHidePreview = useCallback(() => {
      hidePreviewTimeoutRef.current = setTimeout(() => {
        setPreviewedSection(null);
      }, 100); // Shortened delay
    }, []);

    let portalContent = null;
    if (previewedSection && previewedSection.anchorEl) {
      const { index, anchorEl, direction } = previewedSection;
      const slot = sections[index];
      const optionToPreview = slot.options[slot.currentIndex + direction];

      if (optionToPreview) {
        const rect = anchorEl.getBoundingClientRect();
        const position = {
          top: rect.bottom + 5, // Position below the button
          left: rect.left,
        };

        portalContent = ReactDOM.createPortal(
          <SectionPreview
            option={optionToPreview}
            position={position}
            onMouseEnter={() => clearTimeout(hidePreviewTimeoutRef.current)}
            onMouseLeave={handleHidePreview}
          />,
          document.body
        );
      }
    }

    return (
      <>
        <div
          className={`reorder-list-content ${!isActive ? "is-inactive" : ""}`}
          ref={ref}
        >
          {!isActive && (
            <div className="inactive-overlay">
              <button className="activate-button" onClick={onActivate}>
                Activate
              </button>
            </div>
          )}
          <h2>{title}</h2>
          <div
            className="sections-list-html5"
            style={{ pointerEvents: !isActive ? "none" : "auto" }}
          >
            {sections.map((sectionSlot, index) => (
              <SectionItemHTML5
                key={sectionSlot.options[sectionSlot.currentIndex]._id}
                sectionSlot={sectionSlot}
                index={index}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
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
                onDeleteItem={handleDeleteItem}
                onCycle={handleCycleSection}
                onShowPreview={handleShowPreview}
                onHidePreview={handleHidePreview}
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
                cursor:
                  sections.length === 0 || !isActive
                    ? "not-allowed"
                    : "pointer",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                opacity: !isActive ? 0.5 : 1,
              }}
            >
              Apply & Preview
            </button>
          </div>
        </div>
        {portalContent}
      </>
    );
  }
);


// --- (buildPageSections and other helpers) ---
const parseColorFromPrompt = (prompt) => {
  if (!prompt) return null;
  const colors = [
    "blue",
    "red",
  "green",
    "black",
    "white",
    "purple",
    "orange",
    "yellow",
    "teal",
    "pink",
  ];
  const promptLowerCase = prompt.toLowerCase();
  for (const color of colors) {
    if (promptLowerCase.includes(color)) return color;
  }
  return null;
};

const buildPageSections = (
  allSections,
  pageTags,
  priorityColor,
  pageName // NEW: pageName to determine sorting
) => {
  // Filter candidates based on page-specific tags
  const candidates = allSections.filter((s) =>
    pageTags.some((tag) => s.tags?.includes(tag))
  );

  // Group candidates by their sectionType
  const groupedByType = candidates.reduce((acc, section) => {
    const type = section.sectionType || "unknown";
    if (!acc[type]) acc[type] = [];
    acc[type].push(section);
    return acc;
  }, {});

  // Create the final section slots
  let finalSectionSlots = [];
  for (const type in groupedByType) {
    const options = groupedByType[type];
    let bestMatchIndex = 0; // Default to the first option

    if (priorityColor) {
      const coloredIndex = options.findIndex((s) =>
        s.tags?.includes(priorityColor)
      );
      if (coloredIndex !== -1) {
        bestMatchIndex = coloredIndex;
      }
    }

    finalSectionSlots.push({
      sectionType: type,
      options: options,
      currentIndex: bestMatchIndex,
    });
  }

  // --- NEW: Default Sorting Logic ---
  const sortOrderConfig = {
    home: {
      by: "sectionType",
      order: [
        "header",
        "herospace",
        "about",
        "features",
        "gallery",
        "before and afters",
        "meet the team",
        "mission and vision",
        "testimonials",
        "cta",
        "map",
        "footer",
      ],
      equivalents: { "herospace slider": "herospace", services: "features" },
    },
    about: {
      by: "tagOrType",
      order: ["header", "breadcrumbs", "about-intro", "team", "footer"],
      equivalents: { "about-introduction": "about-intro" },
    },
    services: {
      by: "tagOrType",
      order: [
        "header",
        "breadcrumbs",
        "service-intro",
        "features",
        "faq",
        "cta",
        "footer",
      ],
      equivalents: { "service-introduction": "service-intro" },
    },
    // ADD THIS NEW CONFIGURATION FOR THE CONTACT PAGE
    contact: {
      by: "sectionType",
      order: ["header", "contact", "map", "cta", "footer"],
      equivalents: {},
    },
  };
  const pageConfig = sortOrderConfig[pageName];

  if (pageConfig) {
    const getSortIndex = (slot) => {
      if (pageConfig.by === "sectionType") {
        let type = slot.sectionType;
        if (pageConfig.equivalents[type]) {
          type = pageConfig.equivalents[type];
        }
        const index = pageConfig.order.indexOf(type);
        return index === -1 ? Infinity : index;
      }

      if (pageConfig.by === "tagOrType") {
        // Prioritize sectionType match
        let typeIndex = pageConfig.order.indexOf(slot.sectionType);
        if (typeIndex !== -1) return typeIndex;

        // Then check tags
        const currentSection = slot.options[slot.currentIndex];
        const tags = currentSection.tags || [];
        for (let tag of tags) {
          if (pageConfig.equivalents[tag]) {
            tag = pageConfig.equivalents[tag];
          }
          const tagIndex = pageConfig.order.indexOf(tag);
          if (tagIndex !== -1) return tagIndex;
        }
        return Infinity; // Not found in order array
      }
      return Infinity;
    };

    finalSectionSlots.sort((a, b) => getSortIndex(a) - getSortIndex(b));
  }

  return finalSectionSlots;
};


// --- Actual Component---
const IntermediateComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // NEW: Function to determine initial scale based on screen width
  const getInitialScale = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth > 2000) { // For 2K+ screens
      return 0.85;
    }
    if (screenWidth > 1800) { // For Full HD screens
      return 0.65;
    }
    return 0.5; // For laptop and other smaller screens
  };

  const [scale, setScale] = useState(getInitialScale); // UPDATED
  const [isPanLocked, setIsPanLocked] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [svgPaths, setSvgPaths] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // or "warning"
  const [activePages, setActivePages] = useState({
    home: false,
    about: false,
    services: false,
    contact: false,
  });

  const homeContainerRef = useRef(null);
  const aboutContainerRef = useRef(null);
  const servicesContainerRef = useRef(null);
  const contactContainerRef = useRef(null);

  const allAvailableSections = useMemo(() => {
    const state = location.state || {};
    const allMatchingTemplates = state.allMatchingTemplatesFromController || [];
    return allMatchingTemplates.map((s, i) => ({
      ...s,
      _id: s._id || `gen-${i}-${Math.random()}`,
    }));
  }, [location.state]);

  const priorityColor = useMemo(
    () => parseColorFromPrompt(location.state?.originalPrompt),
    [location.state?.originalPrompt]
  );

  const getToastContent = (icon, message) => (
    <div>
      <span style={{ verticalAlign: "middle", fontSize:"0.9rem" }}>{icon} </span> {message}
    </div>
  );

  useEffect(() => {
    const checkIsActive = (tag) =>
      allAvailableSections.some((section) => section.tags?.includes(tag));
    setActivePages({
      home: checkIsActive("home-page"),
      about: checkIsActive("about-page"),
      services: checkIsActive("services-page"),
      contact: checkIsActive("contact-page"),
    });
  }, [allAvailableSections]);

  //useEffect that sets activePages to show the correct toast
  useEffect(() => {
    const checkIsActive = (tag) =>
      allAvailableSections.some((section) => section.tags?.includes(tag));

    const hasTemplates = allAvailableSections.length > 0;

    setActivePages({
      home: checkIsActive("home-page"),
      about: checkIsActive("about-page"),
      services: checkIsActive("services-page"),
      contact: checkIsActive("contact-page"),
    });

    // Show toast
    if (hasTemplates) {
      setToastMessage(
        getToastContent(<FiCheckCircle />, " Yay! We got some templates generated for you!")
      );
      setToastType("success");
    } else {
      setToastMessage(
        getToastContent(<FiCheckCircle />, " No Templates to load!")
      );
      setToastType("warning");
    }

    const timer = setTimeout(() => setToastMessage(null), 6000); // 6 seconds only
    return () => clearTimeout(timer);
  }, [allAvailableSections]);

  const [homeSections, setHomeSections] = useState(() =>
    buildPageSections(
      allAvailableSections,
      ["home-page", "general"],
      priorityColor,
      "home" // Specify page for sorting
    )
  );
  const [aboutSections, setAboutSections] = useState(() =>
    buildPageSections(
      allAvailableSections,
      ["about-page", "general"],
      priorityColor,
      "about" // Specify page for sorting
    )
  );
  const [servicesSections, setServicesSections] = useState(() =>
    buildPageSections(
      allAvailableSections,
      ["services-page", "general"],
      priorityColor,
      "services" // Specify page for sorting
    )
  );

  const [contactSections, setContactSections] = useState(() =>
    buildPageSections(
      allAvailableSections,
      ["contact-page", "general"],
      priorityColor,
      "contact" // Pass the page name to enable sorting
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
    setScale(0.5); // Reset will always go back to the standard 50%
    setTransform({ x: 0, y: 0 });
  };
  const handleActivatePage = (pageName) =>
    setActivePages((prev) => ({ ...prev, [pageName]: true }));

  const handleNavigateWithSections = (sectionSlots, title) => {
    // Before navigating, we need to flatten the selected sections from the slots
    const sectionsToApply = sectionSlots.map(
      (slot) => slot.options[slot.currentIndex]
    );
    const stateToNavigate = {
      templatesOrderedBySection: {
        ...location.state?.templatesOrderedBySection,
        reorderedGlobalSections: sectionsToApply,
        name: `${title} Page - ${Date.now()}`,
      },
      originalPrompt: location.state?.originalPrompt || "No prompt.",
      allMatchingTemplatesFromController: allAvailableSections,
    };
    navigate("/builder-block-preview-main", { state: stateToNavigate });
  };

  // Handler for the refine prompt button
  const handleRefinePrompt = useCallback(() => {
    // Navigate one step back in the history stack
    navigate(-1);
  }, [navigate]);

  return (
    <div
      className={`reorder-list-app-container ${isPanning ? "is-panning" : ""} ${
        isPanLocked ? "pan-locked" : ""
      }`}
      onMouseDown={handlePanMouseDown}
      onMouseMove={handlePanMouseMove}
      onMouseUp={handlePanMouseUpOrLeave}
      onMouseLeave={handlePanMouseUpOrLeave}
      onWheel={handleWheel}
    >
      {/*Top-left info panel */}
      <LogoComponent />
      {toastMessage && (
        <div
          className={`toast-message ${
            toastType === "warning" ? "warning" : ""
          }`}
        >
          {toastMessage}
        </div>
      )}
      <div className="canvas-info-panel">
        <div className="prompt-display-box">
          {location.state?.originalPrompt || "No prompt provided."}
        </div>
        <button className="refine-prompt-button" onClick={handleRefinePrompt}>
          Refine Prompt
        </button>
      </div>

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
          isActive={activePages.home}
          onActivate={() => handleActivatePage("home")}
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
            isActive={activePages.about}
            onActivate={() => handleActivatePage("about")}
          />
          <SectionListContainer
            ref={servicesContainerRef}
            title="Services Page"
            sections={servicesSections}
            onSectionsChange={setServicesSections}
            onApplyOrder={() =>
              handleNavigateWithSections(servicesSections, "Services")
            }
            isActive={activePages.services}
            onActivate={() => handleActivatePage("services")}
          />
          <SectionListContainer
            ref={contactContainerRef}
            title="Contact Page"
            sections={contactSections}
            onSectionsChange={setContactSections}
            onApplyOrder={() =>
              handleNavigateWithSections(contactSections, "Contact")
            }
            isActive={activePages.contact}
            onActivate={() => handleActivatePage("contact")}
          />
        </div>
      </div>
    </div>
  );
};

export default IntermediateComponent;