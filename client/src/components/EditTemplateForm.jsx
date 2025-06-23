import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/template-form.css";

const EditTemplateForm = ({ match }) => {
  const { id } = match.params;
  const [formData, setFormData] = useState({
    name: "",
    sectionType: "",
    style: "",
    tags: "",
    json: "{}",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${id}`
        );
        const template = response.data.data;

        setFormData({
          name: template.name || "",
          sectionType: template.sectionType || "",
          style: template.style || "",
          tags: Array.isArray(template.tags)
            ? template.tags.join(", ")
            : template.tags || "",
          json: JSON.stringify(template.json, null, 2),
        });

      } catch (err) {
        console.error("Error fetching template:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sectionType) newErrors.sectionType = "Section type is required";
    if (!validateJSON(formData.json)) newErrors.json = "Invalid JSON format";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        sectionType: formData.sectionType,
        style: formData.style || undefined,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        json: JSON.parse(formData.json),
      };

      const response = await axios.put(
        `${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${id}`,
        payload
      );

      setSuccessMessage("Template updated successfully!");
      setTimeout(() => {
        window.location.href = "/templates"; // Redirect after success
      }, 1500);

    } catch (error) {
      console.error("Error updating template:", error);
      setErrors({
        form: error.response?.data?.message || "Failed to update template",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="edit-template-form">
      <h2>Edit Template</h2>
      {errors.form && <div className="form-error">{errors.form}</div>}
      {successMessage && <div className="form-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">Template Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? "form-input--invalid" : ""}`}
          />
          {errors.name && <p className="form-error-text">{errors.name}</p>}
        </div>

        {/* Section Type */}
        <div className="form-group">
          <label htmlFor="sectionType" className="form-label">
            Section Type*
          </label>
          <select
            id="sectionType"
            name="sectionType"
            value={formData.sectionType}
            onChange={handleChange}
            className={`form-select ${
              errors.sectionType ? "form-input--invalid" : ""
            }`}
          >
            <option value="">Select a section type</option>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
            <option value="hero">Hero</option>
            {/* Add more options dynamically if needed */}
          </select>
          {errors.sectionType && (
            <p className="form-error-text">{errors.sectionType}</p>
          )}
        </div>

        {/* Style */}
        <div className="form-group">
          <label htmlFor="style" className="form-label">
            Style
          </label>
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select a style (optional)</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimalist">Minimalist</option>
            <option value="bold">Bold</option>
            <option value="elegant">Elegant</option>
          </select>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="form-input"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        {/* JSON Input */}
        <div className="form-group">
          <label htmlFor="json" className="form-label">
            JSON Content*
          </label>
          <textarea
            id="json"
            name="json"
            rows={10}
            value={formData.json}
            onChange={handleChange}
            className={`form-textarea ${errors.json ? "form-input--invalid" : ""}`}
            placeholder='{"key": "value"}'
          />
          {errors.json && (
            <p className="form-error-text">{errors.json}</p>
          )}
        </div>

        {/* Screenshot Preview */}
        {formData.screenshot && (
          <div className="form-group">
            <label className="form-label">Current Preview</label>
            <img
              src={formData.screenshot}
              alt="Current preview"
              className="w-full h-auto max-h-64 object-cover rounded border"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="form-group">
          <button
            type="submit"
            disabled={submitting}
            className={`form-button ${
              submitting ? "form-button--disabled" : ""
            }`}
          >
            {submitting ? "Updating..." : "Update Template"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTemplateForm;