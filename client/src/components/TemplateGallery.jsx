import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiExternalLink, FiEdit3, FiTrash2, FiZoomIn } from "react-icons/fi";

import "../styles/template-form.css";

const TemplateGallery = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_TO_SERVER_API_URL}/template/all`
        );
        setTemplates(response.data.data || []);
      } catch (err) {
        setError("Failed to load templates");
        console.error("Error loading templates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTemplates();
  }, []);

  // Open lightbox
  const openLightbox = (imgSrc) => {
    setSelectedImage(imgSrc);
    setLightboxOpen(true);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage("");
  };

  // Handle delete click
  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_TO_SERVER_API_URL}/template/delete/${
          templateToDelete._id
        }`
      );
      setTemplates(templates.filter((t) => t._id !== templateToDelete._id));
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Failed to delete template.");
    } finally {
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (loading) return <p className="form-message">Loading templates...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="template-gallery">
      <h2>All Templates</h2>

      <div className="gallery-grid">
        {templates.map((template) => (
          <div key={template._id} className="template-card">
            <div className="template-card__image-wrapper">
              {/* Image or fallback */}
              {template.screenshot ? (
                <img src={template.screenshot} alt="Preview" />
              ) : (
                <div className="no-preview">No Preview</div>
              )}

              {/* Overlay with actions */}
              <div className="template-card__overlay">
                <div className="overlay-buttons">
                  {/* View Larger - Lightbox */}
                  {template.screenshot && (
                    <button
                      type="button"
                      className="icon-button"
                      title="View Larger"
                      onClick={() => openLightbox(template.screenshot)}
                    >
                      <FiZoomIn />
                      <span className="tooltip-text">View Larger</span>
                    </button>
                  )}

                  {/* Edit Template in App */}
                  <Link
                    to={`/template/edit/${template._id}`}
                    className="icon-button"
                    title="Edit Template"
                  >
                    <FiEdit3 />
                    <span className="tooltip-text">Edit Template</span>
                  </Link>

                  {/* Edit in WordPress */}
                  {template.edit_url && (
                    <a
                      href={template.edit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-button"
                      title="Edit in WordPress"
                    >
                      <FiExternalLink />
                      <span className="tooltip-text">Edit in WordPress</span>
                    </a>
                  )}

                  {/* Delete Template */}
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    title="Delete Template"
                    onClick={() => handleDeleteClick(template)}
                  >
                    <FiTrash2 />
                    <span className="tooltip-text">Delete Template</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card Info Below */}
            <div className="card-body">
              <div className="card-title">{template.name}</div>
              <div className="card-subtitle">{template.sectionType}</div>
              <div className="card-tags">
                {Array.isArray(template.tags) &&
                  template.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                {template.tags?.length > 3 && (
                  <span className="tag">+{template.tags.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full preview"
              className="lightbox-image"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete "{templateToDelete.name}"?</p>
            <div className="modal-actions">
              <button
                className="modal-button modal-button--secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button modal-button--danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
