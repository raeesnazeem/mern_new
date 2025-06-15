import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/template-form.css";

const EditTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_TO_SERVER_API_URL}/template/all`
        );
        setTemplates(response.data.data);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) return <p className="form-message">Loading templates...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="edit-template-list">
      <div className="form-container">
        <h2 className="form-title">Edit Templates</h2>

        <ul className="template-list">
          {templates.map((template) => (
            <li key={template._id} className="template-item">
              <Link
                to={`/template/edit/${template._id}`}
                className="template-link"
              >
                {template.name}
              </Link>
              <div className="template-info">
                Section Type:{" "}
                <span className="template-section-type">
                  {template.sectionType}
                </span>
              </div>

              {/* Show Preview */}
              {template.screenshot && (
                <img
                  src={template.screenshot}
                  alt="Preview"
                  className="template-preview-image"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditTemplateList;
