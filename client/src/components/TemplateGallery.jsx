import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/template-form.css";
import { Link } from "react-router-dom";

const TemplateGallery = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_TO_SERVER_API_URL}/template/all`);
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

  if (loading) return <p>Loading templates...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="template-gallery">
      <h2>All Templates</h2>
      <div className="gallery-grid">
        {templates.map((template) => (
          <Link
            key={template._id}
            to={`${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${template._id}`}
            className="template-card"
          >
            {template.screenshot ? (
              <img src={template.screenshot} alt="Preview" />
            ) : (
              <div style={{ height: "160px", backgroundColor: "#f7fafc", textAlign: "center", paddingTop: "60px", color: "#a0aec0" }}>
                No Preview
              </div>
            )}
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;