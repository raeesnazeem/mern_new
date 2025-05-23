import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import InputMethodSelector from "../components/InputMethodSelector";
import CreateTemplate from "../components/CreateTemplate";
import PromptInput from "../components/PromptInput";
import Questionnaire from "../components/Questionnaire";
import TopBar from "../components/TopBar";

import styles from "../styles/DashboardPage.module.css";
import FetchTemplateDisplay from "../components/FetchDisplay";
import ProcessTemplateResults from "../components/ProcessTemplateResults";

import axios from "axios";



const DashboardPage = () => { 
  const navigate = useNavigate()
  const [inputMethod, setInputMethod] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [webpageId, setWebpageId] = useState(null);
  const [activeView, setActiveView] = useState("home");
  const [hasReset, setHasReset] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [matchedConditions, setMatchedConditions] = useState(null);
  const [templatesOrderedBySection, setTemplatesOrderedBySection] =
    useState(null);

  // reset function
  const resetEverything = () => {
    setInputMethod(null);
    setTemplates([]);
    setIsLoading(false);
    setCurrentPrompt("");
    setWebpageId(null);
  };

  // To select which input method (prompt box or questionnaire)
  const handlePromptOrQuestionnaire = (method) => {
    setInputMethod(method);
    setTemplates([]);
    setActiveView("home");
  };

  const handlePromptSubmit = async (prompt) => {
    setIsLoading(true);
    setCurrentPrompt(prompt);

    try { // This should return a data object with keys allTemplates, templatesOrderedBySection, suggestedOrder and matchedConditions object
      const response = await axios.post(
        `${
          import.meta.env.VITE_TO_SERVER_API_URL
        }/template/make-template-prompt`,
        { prompt }
      );

      // from the response data - Extract templatesOrderedBySection alone
      const templatesInOrder =
        response.data.data.templatesOrderedBySection;

      // console.log('These are the templates in order:', templatesInOrder);

      // /preview route renders TemplatePreview Component
      navigate("/preview", {
        state: { templatesOrderedBySection: templatesInOrder }
      });


    } catch (error) {
      console.error("Error:", error.message);
      alert("Failed to generate templates.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logic for rendering the right panel of the layout
  const renderRightPanel = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Generating your template...</p>
        </div>
      );
    }
    // change the state of activeView (rightpanel) as per the cases.
    switch (activeView) {
      case "home":
        if (!inputMethod) {
          return (
            <InputMethodSelector onMethodSelect={handlePromptOrQuestionnaire} />
          );
        }
        if (inputMethod === "prompt") {
          // return <PromptInput onSubmit={handlePromptSubmit} />;
          return <PromptInput onSubmit={handlePromptSubmit} />;;
        }
        if (inputMethod === "questionnaire") {
          return <Questionnaire onSubmit={handlePromptSubmit} />;
        }
        return null;

      case "allTemplates":  //when activeView state is set to allTemplates
        return (
          <div>
            <h2>All Templates (Coming Soon)</h2>
          </div>
        );

      case "addTemplate":  //when activeView state is set to addTemplate
        if (!hasReset) {
          resetEverything();
          setHasReset(true);
        }
        return <CreateTemplate />;

      case "fetchtemplate": //when activeView state is set to fecthTemplate
        if (!hasReset) {
          resetEverything();
          setHasReset(true);
        }
        return (
          <FetchTemplateDisplay
            onPreview={(url, template) => {
              //passing the onPreview function to the child component, to be called there
              setPreviewUrl(url);
              setSelectedTemplate(template);
              setActiveView("templatePreview"); // Switch view to preview
            }}
          />
        );

      case "templatePreview": //preview the template in an iframe - when activeView state is set to templatePreview
        return (
          <div className="">
            <div
              className="iframe-container"
              style={{ height: "100vh", border: "1px solid #ccc", marginTop:"0"}}
            >
              <iframe
                src={previewUrl}
                title="Elementor Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                referrerPolicy="no-referrer"
                allow="fullscreen"
                style={{
                  width: "100%",
                  height: "100vh",
                  border: "none",
                  // Hide scrollbar for Webkit browsers (Chrome, Edge, Safari)
                  scrollbarWidth: "none !important",
                  msOverflowStyle: "none",
                  overflow: "auto",
                }}
              />
            </div>

            <div className="preview-actions">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </div>
          </div>
        );
  
      default:
        return (
          <div>
            <p>Unknown view</p>
          </div>
        );
    }
  };

  const leftPanelContent = (
    <div className={styles.leftPanelContent}>
      <h3>Actions</h3>
      <ul className={styles.menuList}>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView("addTemplate")}>
            Add New Template(s)
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView("home")}>
            Generate Template
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView("fetchtemplate")}>
            See Template(s)
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button
            onClick={() => {
              resetEverything();
              setActiveView("home");
            }}
          >
            Reload
          </button>
        </li>
      </ul>

      {templates.length > 0 && (
        <div className={styles.currentInfo}>
          <h3>Current Page</h3>
          <p>ID: {webpageId || "Not generated"}</p>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={
        <div className={styles.rightPanelContent}>{renderRightPanel()}</div>
      }
    />
  );
};

export default DashboardPage;
