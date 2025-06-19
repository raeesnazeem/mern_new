import React from 'react';
import '../styles/ConfirmationModal.css'; 

function ConfirmationModal({ message, onConfirm, onCancel, isOpen }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="modal-btn cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn confirm">
            Leave Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;