// import React, { useState } from "react";
// import axios from "axios";
// import "../styles/template-form.css";

// const sectionTypes = [
//   "full template",
//   "header",
//   "about",
//   "cta",
//   "features",
//   "testimonials",
//   "contact",
//   "footer",
//   "faq",
//   "map",
//   "breadcrumbs",
//   "services",
//   "conditions",
//   "gallery",
//   "before and afters",
//   "form",
//   "blog",
//   "cards",
//   "meet the team",
//   "social feed",
//   "mission and vision",
//   "herospace",
//   "herospace slider",
//   "about-expertise",
//   "about-introduction",
//   "about-teams",
//   "services-intro",
//   "services-faq",
//   "services-box",
//   "services-benefits",
//   "services-experience",
//   "contact-info",
//   "contact-share",
// ];

// const styles = ["modern", "classic", "minimalist", "bold", "elegant"];

// const CreateTemplateAndSS = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     sectionType: "",
//     style: "",
//     tags: "",
//     json: "{}",
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateJSON = (jsonString) => {
//     try {
//       JSON.parse(jsonString);
//       return true;
//     } catch (e) {
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setErrors({});
//     setSuccessMessage("");

//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = "Name is required";
//     if (!formData.sectionType)
//       newErrors.sectionType = "Section type is required";
//     if (!validateJSON(formData.json)) newErrors.json = "Invalid JSON format";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_TO_SERVER_API_URL}/template/create-and-preview`,
//         {
//           name: formData.name,
//           sectionType: formData.sectionType,
//           json: JSON.parse(formData.json),
//           style: formData.style || undefined,
//           tags: formData.tags
//             .split(",")
//             .map((tag) => tag.trim())
//             .filter((tag) => tag),
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       const createdTemplate = response.data.data;

//       setSuccessMessage("Template created successfully!");
//       setFormData({
//         name: "",
//         sectionType: "",
//         style: "",
//         tags: "",
//         json: "{}",
//       });
//     } catch (error) {
//       console.error("Error creating template:", error);
//       setErrors({
//         form: error.response?.data?.message || "Failed to create template",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="form-container">
//       <h2 className="form-title">Create New Template</h2>

//       {errors.form && <div className="form-error">{errors.form}</div>}
//       {successMessage && <div className="form-success">{successMessage}</div>}

//       <form
//         onSubmit={handleSubmit}
//         autoComplete="off"
//         className="template-form"
//       >
//         {/* Name */}
//         <div className="form-group">
//           <label htmlFor="name" className="form-label">
//             Template Name*
//           </label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             className={`form-input ${errors.name ? "form-input--invalid" : ""}`}
//             placeholder="Enter template name"
//           />
//           {errors.name && <p className="form-error-text">{errors.name}</p>}
//         </div>

//         {/* Section Type */}
//         <div className="form-group">
//           <label htmlFor="sectionType" className="form-label">
//             Section Type*
//           </label>
//           <select
//             id="sectionType"
//             name="sectionType"
//             value={formData.sectionType}
//             onChange={handleChange}
//             className={`form-select ${
//               errors.sectionType ? "form-input--invalid" : ""
//             }`}
//           >
//             <option value="">Select a section type</option>
//             {sectionTypes.map((type) => (
//               <option key={type} value={type}>
//                 {type.charAt(0).toUpperCase() + type.slice(1)}
//               </option>
//             ))}
//           </select>
//           {errors.sectionType && (
//             <p className="form-error-text">{errors.sectionType}</p>
//           )}
//         </div>

//         {/* Style */}
//         <div className="form-group">
//           <label htmlFor="style" className="form-label">
//             Style
//           </label>
//           <select
//             id="style"
//             name="style"
//             value={formData.style}
//             onChange={handleChange}
//             className="form-select"
//           >
//             <option value="">Select a style (optional)</option>
//             {styles.map((style) => (
//               <option key={style} value={style}>
//                 {style.charAt(0).toUpperCase() + style.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Tags */}
//         <div className="form-group">
//           <label htmlFor="tags" className="form-label">
//             Tags (comma separated)
//           </label>
//           <input
//             type="text"
//             id="tags"
//             name="tags"
//             value={formData.tags}
//             onChange={handleChange}
//             className="form-input"
//             placeholder="tag1, tag2, tag3"
//           />
//         </div>

//         {/* JSON Input */}
//         <div className="form-group">
//           <label htmlFor="json" className="form-label">
//             JSON Content*
//           </label>
//           <textarea
//             id="json"
//             name="json"
//             value={formData.json}
//             onChange={handleChange}
//             rows={8}
//             className={`form-textarea ${
//               errors.json ? "form-input--invalid" : ""
//             }`}
//             placeholder='{"key": "value"}'
//           />
//           {errors.json && <p className="form-error-text">{errors.json}</p>}
//         </div>

//         {/* Submit Button */}
//         <div className="form-group">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`form-button ${
//               isSubmitting ? "form-button--disabled" : ""
//             }`}
//           >
//             {isSubmitting ? "Creating..." : "Create Template"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateTemplateAndSS;
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import "../styles/template-form.css";

const sectionTypes = [
  "full template",
  "header",
  "about",
  "cta",
  "features",
  "testimonials",
  "contact",
  "footer",
  "faq",
  "map",
  "breadcrumbs",
  "services",
  "conditions",
  "gallery",
  "before and afters",
  "form",
  "blog",
  "cards",
  "meet the team",
  "social feed",
  "mission and vision",
  "herospace",
  "herospace slider",
  "about-expertise",
  "about-introduction",
  "about-teams",
  "services-intro",
  "services-faq",
  "services-box",
  "services-benefits",
  "services-experience",
  "contact-info",
  "contact-share",
];

const styles = ["modern", "classic", "minimalist", "bold", "elegant"];

function CreateTemplateAndSS() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    sectionType: "",
    style: "",
    tags: "",
    json: "{}",
    screenshot: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const isEditing = !!id;

  // Load template on mount if editing
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${id}`
        );
        const template = res.data.data;

        setFormData({
          name: template.name || "",
          sectionType: template.sectionType || "",
          style: template.style || "",
          tags: Array.isArray(template.tags)
            ? template.tags.join(", ")
            : template.tags || "",
          json: JSON.stringify(template.json, null, 2),
          screenshot: template.screenshot || null,
        });
      } catch (err) {
        console.error("Failed to load template:", err);
        setErrors({ form: "Failed to load template" });
      }
    };

    if (id) fetchTemplate();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sectionType)
      newErrors.sectionType = "Section type is required";
    if (!validateJSON(formData.json)) newErrors.json = "Invalid JSON format";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

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

    try {
      const method = isEditing ? "put" : "post";
      const url = isEditing
        ? `/template/edit/${id}`
        : "/template/create-and-preview";

      const response = await axios({
        method,
        url: `${import.meta.env.VITE_TO_SERVER_API_URL}${url}`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setSuccessMessage("Template saved successfully!");
      setIsSubmitting(false);

      if (!isEditing) {
        setFormData({
          name: "",
          sectionType: "",
          style: "",
          tags: "",
          json: "{}",
          screenshot: null,
        });
      } else {
        setTimeout(() => {
          window.location.href = "/templates"; // or use navigate()
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      setErrors({
        form:
          error.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} template`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">
        {isEditing ? "Edit Template" : "Create New Template"}
      </h2>

      {errors.form && <p className="form-error">{errors.form}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {/* Show current screenshot */}
      {isEditing && formData.screenshot && (
        <div className="form-screenshot-preview">
          <label className="form-label">Current Preview</label>
          <img
            src={formData.screenshot}
            alt="Current preview"
            className="form-image-preview"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off" className="form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Template Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? "form-input--invalid" : ""}`}
            placeholder="Enter template name"
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
              errors.sectionType ? "form-select--invalid" : ""
            }`}
          >
            <option value="">Select a section type</option>
            {sectionTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.sectionType && (
            <p className="form-error-text">{errors.sectionType}</p>
          )}
        </div>

        {/* Style */}
        <div className="form-group">
          <label htmlFor="style" className="form-label">
            Style (optional)
          </label>
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select a style</option>
            {styles.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
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
            rows={8}
            value={formData.json}
            onChange={handleChange}
            className={`form-textarea ${
              errors.json ? "form-textarea--invalid" : ""
            }`}
            placeholder='{"key": "value"}'
          />
          {errors.json && <p className="form-error-text">{errors.json}</p>}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`form-button ${
              isSubmitting ? "form-button--disabled" : ""
            }`}
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Template"
              : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTemplateAndSS;
