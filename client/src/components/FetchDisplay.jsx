// import React, { useState } from 'react';
// import axios from 'axios';
// import '../styles/fetchdisplay.css';
// import ColorExtractor from './ColorExtractor';

// const FetchTemplateDisplay = ({ onPreview }) => {
//   const [sectionType, setSectionType] = useState('');
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [selectedTemplateForColors, setSelectedTemplateForColors] = useState(null);
//   const [showColorExtractor, setShowColorExtractor] = useState(false);

//   const fetchTemplates = async () => {
//     if (!sectionType.trim()) {
//       setError('Please enter a section type');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await axios.get(
//         `http://localhost:3000/api/v1/template/fetch-template?sectionType=${sectionType}`,
//         { headers: { 'Accept': 'application/json' } }
//       );

//       const fetchedTemplates = Array.isArray(response.data.data)
//         ? response.data.data
//         : [];

//       setTemplates(fetchedTemplates);
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.response?.data?.message || 'Failed to fetch templates');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendToElementor = async (template) => {
//     setSelectedTemplate(template);
//     setLoading(true);

//     const username = 'Onboarding';
//     const appPassword = 'Eccq j5vS z9rg PoCo 8LgN quC5';
//     const token = btoa(`${username}:${appPassword}`);

//     try {
//       const requestData = {
//         name: `${template.name} ${Math.floor(Math.random() * 90000000000 + 10000000000)}`,
//         json: template.json
//       };

//       const response = await axios.post(
//         'https://customlayout.gogroth.com/wp-json/custom-builder/v1/import-template',
//         requestData,
//         {
//           headers: {
//             Authorization: `Basic ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );


//       const postURL = `${response.data?.public_url}`
//       console.log(response.data)

//       if (!postURL) {
//         throw new Error('No post URL returned from WordPress');
//       }

//       // Instead of setting local state, call the parent
//       onPreview(postURL, template);
//     } catch (err) {
//       console.error('Error sending to WordPress:', err);
//       setError(err.response?.data?.message || 'Failed to create preview');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="template-display-container">
//       <h1>Template Preview System</h1>

//       <div className="search-section">
//         <div className="input-group">
//           <input
//             type="text"
//             value={sectionType}
//             onChange={(e) => setSectionType(e.target.value)}
//             placeholder="Enter section type (e.g., 'hero', 'footer')"
//           />
//           <button onClick={fetchTemplates} disabled={loading}>
//             {loading ? 'Loading...' : 'Fetch Templates'}
//           </button>
//         </div>

//         {error && <div className="error-message">{error}</div>}
//       </div>

//       {templates.length > 0 && (    //if template has any elements in it
//         <div className="template-list">
//           <h2>Templates for: {sectionType}</h2>
//           {/* <ul>
//             {templates.map((template) => ( //map through all tempates in the array to find the matching one
//               <li
//                 key={template.uuid}
//                 className={selectedTemplate?._id === template._id ? 'active' : ''}
//                 onClick={() => sendToElementor(template)}
//               >
//                 {template.name}
//                 <span className="preview-badge">Preview</span>
//               </li>
//             ))}
//           </ul> */}

//           <ul>
//             {templates.map((template) => (
//               <li
//                 key={template.uuid}
//                 className={selectedTemplate?._id === template._id ? 'active' : ''}
//               >
//                 <div className="template-item">
//                   <span
//                     className="template-name"
//                     onClick={() => sendToElementor(template)}
//                   >
//                     {template.name}
//                   </span>

//                   <div className="template-actions">
//                     <span className="preview-badge" onClick={() => sendToElementor(template)}>
//                       Preview
//                     </span>

//                     <button
//                       className="colors-button"
//                       onClick={() => {
//                         // Assuming you have a state setter for color extraction
//                         setSelectedTemplateForColors(template);
//                         setShowColorExtractor(true);
//                       }}
//                     >
//                       Go to Colors
//                     </button>
//                   </div>
//                 </div>
//               </li>

//             ))}
//           </ul>
//           {showColorExtractor && (
//             <ColorExtractor jsonData={selectedTemplateForColors} />
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FetchTemplateDisplay;
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/fetchdisplay.css';
import ColorExtractor from './ColorExtractor';

const FetchTemplateDisplay = ({ onPreview }) => {
  const [sectionType, setSectionType] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateForColors, setSelectedTemplateForColors] = useState(null);

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

      const theData = Array.isArray(response.data.data) ? response.data.data : []
      const normalizedData = normalizeImageData(theData)

      setTemplates(normalizedData)
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }


function normalizeImageData(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeImageData);
  } else if (data && typeof data === 'object') {
    // Check if it's an image object with id or source: library
    const isImage =
      ('url' in data && ('id' in data || (data.source && data.source === 'library')));

    if (isImage) {
      const { id, ...rest } = data;
      return {
        ...rest,
        source: 'external'
      };
    }

    // Recursively process all object properties
    const normalized = {};
    for (const key in data) {
      normalized[key] = normalizeImageData(data[key]);
    }
    return normalized;
  }

  // Return primitives as-is
  return data;
}


  const sendToElementor = async (template) => {
    setSelectedTemplate(template);
    setLoading(true);

    try {
      const username = 'Onboarding';
      const appPassword = 'Eccq j5vS z9rg PoCo 8LgN quC5';
      const token = btoa(`${username}:${appPassword}`);

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

      if (!response.data?.public_url) {
        throw new Error('No post URL returned from WordPress');
      }

      onPreview(response.data.public_url, template);
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
              >
                <div className="template-item">
                  <span
                    className="template-name"
                    onClick={() => sendToElementor(template)}
                  >
                    {template.name}
                  </span>

                  <div className="template-actions">
                    <button 
                      className="preview-badge"
                      onClick={() => sendToElementor(template)}
                    >
                      Preview
                    </button>

                    <button
                      className="colors-button"
                      onClick={() => setSelectedTemplateForColors(template.json)} // Send the JSON data directly
                    >
                      Go to Colors
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {selectedTemplateForColors && (
            <div className="color-extractor-container">
              <button 
                className="close-button"
                onClick={() => setSelectedTemplateForColors(null)}
              >
                Close Colors
              </button>
              <ColorExtractor jsonData={selectedTemplateForColors} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchTemplateDisplay;