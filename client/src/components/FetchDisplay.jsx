import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/fetchdisplay.css'

const FetchTemplateDisplay = () => {
  const [sectionType, setSectionType] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Fetch templates from MongoDB
//   const fetchTemplates = async () => {
//     if (!sectionType.trim()) {
//       setError('Please enter a section type');
//       return;
//     }

//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.get(`http://localhost:3000/api/v1/template/fetch-template?sectionType=${sectionType}`, {
//         headers: {'Accept': 'application/json'}
//       });
//       setTemplates(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch templates');
//     } finally {
//       setLoading(false);
//     }
//   };
const fetchTemplates = async () => {
    if (!sectionType.trim()) {
      setError('Please enter a section type');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/template/fetch-template?sectionType=${sectionType}`, {
        headers: { 'Accept': 'application/json' }
      });
  
      console.log('API full response:', response.data); // Add this line
  
      // 👇 FIX: ensure you are setting an array
      const fetchedTemplates = Array.isArray(response.data.data)
        ? response.data.data
        : []

      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };


  // Send template to WordPress/Elementor
  const sendToElementor = async (template) => {
    setSelectedTemplate(template);

    console.log('Sending template to Elementor:', template)

    setLoading(true);

    console.log("expected template", template.json)
   
    const rawTemplate = template.json;

    const username = 'Onboarding'; // WordPress username
    const appPassword = 'Eccq j5vS z9rg PoCo 8LgN quC5'; // application password from WP admin
    const token = btoa(`${username}:${appPassword}`); // base64 encode


    try {
      const response = await axios.post('https://customlayout.gogroth.com/wp-json/custom-builder/v1/import-template', {
        name: template.name || "Untitled Section",
        json: {
            version: rawTemplate.version || "0.4",
            content: rawTemplate.content || []
        }
        },
        {
            headers: {
                Authorization: `Basic ${token}`,
                'Content-Type': 'application/json'
              }
        }
      )

      console.log('Elementor response:', response.data)
      
      const url = response.data?.preview_url
        setPreviewUrl(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-display-container">
      <h1>Template Preview System</h1>
      
      <div className="search-section">
        <div className="input-group">
          <input
            type="text"
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            placeholder="Enter section type (e.g., 'hero', 'footer')"
          />
          <button onClick={fetchTemplates} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Templates'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>
        }
      </div>


      {/* { templates.length > 0 && ( */}
        <div className="template-list">
          <h2>Templates for: {sectionType}</h2>
    
          <ul>
            {templates.map((template) => (
              <li 
                key={template.uuid} 
                className={selectedTemplate?._id === template._id ? 'active' : ''}
                onClick={() => sendToElementor(template)}
              >
                {template.name}
                <span className="preview-badge">Preview</span>
              </li>
            ))}
          </ul>
        </div>
      

      {previewUrl && (
        <div className="preview-section">
          <h2>Preview: {selectedTemplate?.name}</h2>
          <div className="iframe-container">
            <iframe 
              src={previewUrl} 
              title="Elementor Preview"
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          </div>
          <div className="preview-actions">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchTemplateDisplay;