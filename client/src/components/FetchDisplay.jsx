import React, { useState } from 'react';
import axios from 'axios';
import '../styles/fetchdisplay.css';

const FetchTemplateDisplay = ({ onPreview }) => {
  const [sectionType, setSectionType] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = async () => {
    if (!sectionType.trim()) {
      setError('Please enter a section type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/template/fetch-template?sectionType=${sectionType}`,
        { headers: { 'Accept': 'application/json' } }
      );

      const fetchedTemplates = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const sendToElementor = async (template) => {
    setSelectedTemplate(template);
    setLoading(true);

    const username = 'Onboarding';
    const appPassword = 'Eccq j5vS z9rg PoCo 8LgN quC5';
    const token = btoa(`${username}:${appPassword}`);

    try {
      const requestData = {
        name: `${template.name} ${Math.floor(Math.random() * 90000000000 + 10000000000)}`,
        json: template.json
      };

      const response = await axios.post(
        'https://customlayout.gogroth.com/wp-json/custom-builder/v1/import-template',
        requestData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const authParam = encodeURIComponent(token);
      const postURL = `${response.data?.preview_url}&auth=${authParam}`;

      if (!postURL) {
        throw new Error('No post URL returned from WordPress');
      }

      // 🔁 Instead of setting local state, call the parent
      onPreview(postURL, template);
    } catch (err) {
      console.error('Error sending to WordPress:', err);
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

        {error && <div className="error-message">{error}</div>}
      </div>

      {templates.length > 0 && (
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
      )}
    </div>
  );
};

export default FetchTemplateDisplay;
