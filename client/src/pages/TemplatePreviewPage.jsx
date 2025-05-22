import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProcessTemplateResults from "../components/ProcessTemplateResults"; // Adjust path
import DashboardLayout from "../components/DashboardLayout";             // Adjust path
import TopBar from "../components/TopBar";                               // Adjust path
// You might want a specific stylesheet for this page
// import styles from "../styles/PreviewPage.module.css";

const TemplatePreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [pageData, setPageData] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [currentTemplateTitle, setCurrentTemplateTitle] = useState("");

  useEffect(() => {
    // Check if data was passed via route state
    if (location.state && location.state.templatesOrderedBySection) {
      setPageData(location.state.templatesOrderedBySection);
    } else {
      // Handle cases where state is missing (e.g., direct navigation to /preview, or refresh)
      console.warn("No template data found in location state. Consider redirecting or fetching.");
      // Example: Redirect to dashboard if no data
      // navigate("/");
      // Or, display a message:
      // setPageData({ error: "No template data provided." });
    }
  }, [location.state, navigate]);

  const handleShowIframePreview = (url, template) => {
    setIframeUrl(url);
    setCurrentTemplateTitle(template.title || "Template Preview"); // Assuming template has a title
    setShowIframe(true);
  };

  const leftPanelContent = ( // Custom left panel for this page
    <div>
      <h3>{showIframe ? `Preview: ${currentTemplateTitle}` : "Template Results"}</h3>
      {showIframe && (
        <button onClick={() => setShowIframe(false)}>Back to Results</button>
      )}
      <button onClick={() => navigate("/")} style={{ marginTop: '10px' }}>Back to Main Dashboard</button>
      {showIframe && iframeUrl && (
        <p style={{marginTop: '20px'}}>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer">
            Open preview in new tab
          </a>
        </p>
      )}
    </div>
  );

  if (!pageData) {
    return (
      <DashboardLayout
        topBar={<TopBar />}
        leftPanel={<div>Loading...</div>}
        rightPanel={<div>Loading template data or no data provided...</div>}
      />
    );
  }

  if (pageData.error) { // Example error handling
     return (
      <DashboardLayout
        topBar={<TopBar />}
        leftPanel={<div>Error</div>}
        rightPanel={<div>{pageData.error} <button onClick={() => navigate("/")}>Go to Dashboard</button></div>}
      />
    );
  }

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={
        showIframe ? (
          <div className="iframe-container" style={{ height: "100vh", border: "1px solid #ccc" }}>
            <iframe
              src={iframeUrl}
              title={currentTemplateTitle}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              referrerPolicy="no-referrer"
              allow="fullscreen"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        ) : (
          <ProcessTemplateResults
            templatesOrderedBySection={pageData}
            onPreview={handleShowIframePreview}
          />
        )
      }
    />
  );
};

export default TemplatePreviewPage;