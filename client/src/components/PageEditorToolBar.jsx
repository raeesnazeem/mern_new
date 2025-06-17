import React from 'react';
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
} from 'react-icons/fi';
import './PageEditorToolBar.css';

const actions = [
  { icon: <FiPlus />, label: 'Add Section', action: 'add_section' },
  { icon: <FiEdit />, label: 'Edit Text', action: 'edit_text' },
  { icon: <FiImage />, label: 'Replace Image', action: 'replace_image' },
  { icon: <FiLayout />, label: 'Insert Template', action: 'insert_template' },
  { icon: <FiMove />, label: 'Reorder', action: 'reorder' },
  { icon: <FiTrash2 />, label: 'Delete Section', action: 'delete_section' },
  { icon: <FiSave />, label: 'Save Changes', action: 'save' },
  { icon: <FiRefreshCcw />, label: 'Reset', action: 'reset' },
  { icon: <FiSettings />, label: 'Settings', action: 'settings' },
  { icon: <FiCode />, label: 'Insert Custom Code', action: 'custom_code' },
];

const PageEditorToolBar = ({ onAction }) => {
  return (
    <div className="elementor-toolbar">
      {actions.map(({ icon, label, action }) => (
        <button
          key={action}
          className="toolbar-btn"
          onClick={() => onAction(action)}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default PageEditorToolBar;
