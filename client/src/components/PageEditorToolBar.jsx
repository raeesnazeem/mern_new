import React from "react";
import {
  FiPlus,
  FiEdit,
  FiImage,
  FiSave,
  FiTrash2,
  FiRefreshCcw,
  FiMove,
  FiCode,
  FiLayout,
  FiSettings,
  FiX,
} from "react-icons/fi";
import "../styles/PageEditorToolBar.css";

const actions = [
  { icon: <FiPlus />, label: "Add Section", action: "add_section" },
  { icon: <FiEdit />, label: "Edit Text", action: "edit_text" },
  { icon: <FiImage />, label: "Replace Image", action: "replace_image" },
  { icon: <FiLayout />, label: "Insert Template", action: "insert_template" },
  { icon: <FiMove />, label: "Reorder", action: "reorder" },
  { icon: <FiTrash2 />, label: "Delete Section", action: "delete_section" },
  { icon: <FiSave />, label: "Save Changes", action: "save" },
  { icon: <FiRefreshCcw />, label: "Reset", action: "reset" },
  { icon: <FiSettings />, label: "Settings", action: "settings" },
  { icon: <FiCode />, label: "Insert Custom Code", action: "custom_code" },
];

const PageEditorToolBar = ({ onAction }) => {
  return (
    <div className="elementor-toolbar">
      <div>
        <button
          className="toolBarCloseButton"
          style={{
            position: "absolute",
            top: "12px",
            right: "30px",
            background: "none",
            border: "none",
            color: "red",
            fontSize: "20px",
            cursor: "pointer",
          }}
          onClick={() => window.dispatchEvent(new Event("closeEditorToolbar"))}
          title="Close"
        >
          <FiX />
        </button>
      </div>
      {actions.map(({ icon, label, action }) => (
        <div className="tooltip-wrapper" key={action}>
          <button
            className="toolbar-btn"
            onClick={() => {
              onAction(action);
              console.log("Toolbar button clicked:", action);
            }}
            aria-label={label}
          >
            {icon}
          </button>
          <span className="custom-tooltip">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default PageEditorToolBar;
