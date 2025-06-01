import React, { useState } from 'react';
import axios from 'axios';
import '../styles/template-form.css';

const CreateTemplate = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    sectionType: '',
    style: '',
    tags: '',
    json: '{}'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const sectionTypes = ["full template", "header", "about", "cta", "features", "testimonials", "contact", "footer", "faq", "map", "breadcrumbs", "services", "conditions", "gallery", "before and afters", "form", "blog", "cards", "meet the team", "social feed", "mission and vision", "herospace", "herospace slider"]

  const styles = [
    'modern', 'classic', 'minimalist', 'bold', 'elegant'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    // Validate form
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sectionType) newErrors.sectionType = 'Section type is required';
    if (!validateJSON(formData.json)) newErrors.json = 'Invalid JSON format';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare payload
      const payload = {
        name: formData.name,
        sectionType: formData.sectionType,
        json: JSON.parse(formData.json),
        style: formData.style || undefined,
        tags: formData.tags 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : []
      };

      const response = await axios.post(`${import.meta.env.VITE_TO_SERVER_API_URL}/template/create-template`, payload, {
        withCredentials: true, // If you need to send cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setSuccessMessage('Template created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        sectionType: '',
        style: '',
        tags: '',
        json: '{}'
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // console.log('Template created:', response.data);
    } catch (error) {
      console.error('Error creating template:', error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setErrors({ 
            ...errors, 
            form: 'A template with this name and section type already exists' 
          });
        } else if (error.response.data.errors) {
          setErrors({ 
            ...errors, 
            ...error.response.data.errors 
          });
        } else {
          setErrors({ 
            ...errors, 
            form: error.response.data.message || 'Failed to create template' 
          });
        }
      } else {
        setErrors({ 
          ...errors, 
          form: 'Network error or server unavailable' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Template</h2>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Template Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter template name"
            autoComplete="off"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="sectionType">
            Section Type*
          </label>
          <select
            id="sectionType"
            name="sectionType"
            value={formData.sectionType}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.sectionType ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select a section type</option>
            {sectionTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.sectionType && <p className="text-red-500 text-sm mt-1">{errors.sectionType}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="style">
            Style
          </label>
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a style (optional)</option>
            {styles.map(style => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="tags">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="json">
            JSON Content*
          </label>
          <textarea
            id="json"
            name="json"
            value={formData.json}
            onChange={handleChange}
            rows={8}
            className={`w-full p-2 border rounded font-mono text-sm ${errors.json ? 'border-red-500' : 'border-gray-300'}`}
            placeholder='{"key": "value"}'
          />
          {errors.json && <p className="text-red-500 text-sm mt-1">{errors.json}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplate;