import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import InputMethodSelector from "../components/InputMethodSelector";
import CreateTemplate from "../components/CreateTemplate";
import PromptInput from "../components/PromptInput";
import Questionnaire from "../components/Questionnaire";
import TopBar from "../components/TopBar";
import {
  FiPlus,
  FiLayers,
  FiGrid,
  FiLayout,
  FiCopy,
  FiFolderPlus,
} from "react-icons/fi";
import AddSectionForm from "../components/AddSectionForm";

import styles from "../styles/DashboardPage.module.css";
import FetchTemplateDisplay from "../components/FetchDisplay";
import ProcessTemplateResults from "../components/ProcessTemplateResults";
import "../styles/AddSectionForm.module.css";

import axios from "axios";

const DashboardPage = () => {
  const navigate = useNavigate();
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // reset function
  const resetEverything = () => {
    setInputMethod(null);
    setTemplates([]);
    setIsLoading(false);
    setCurrentPrompt("");
    setWebpageId(null);
  };

  // to toggle left collapsible bar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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

    try {
      // This should return a data object with keys allTemplates, templatesOrderedBySection, suggestedOrder and matchedConditions object
      const response = await axios.post(
        `${
          import.meta.env.VITE_TO_SERVER_API_URL
        }/template/make-template-prompt`,
        { prompt }
      );

      // from the response data - Extract templatesOrderedBySection alone
      const templatesInOrder = response.data.data.templatesOrderedBySection;

      // console.log('These are the templates in order:', templatesInOrder);

      // /preview route renders TemplatePreview Component
      navigate("/preview", {
        state: { templatesOrderedBySection: templatesInOrder },
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
    return (
      <div className={styles.rightPanelWrapper}>
        {/* Top Bar */}
        <div className={styles.topBarTitle}>
          <h4>G99-BuildBot-1.0.1</h4>
        </div>

        {/* Main Content Area */}
        <div className={styles.rightPanelContent}>
          {/* logic for rendering different views */}
          {isLoading ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>Generating your template...</p>
            </div>
          ) : (
            (() => {
              switch (activeView) {
                case "home":
                  if (!inputMethod) {
                    return (
                      <InputMethodSelector
                        onMethodSelect={handlePromptOrQuestionnaire}
                      />
                    );
                  }
                  if (inputMethod === "prompt") {
                    return <PromptInput onSubmit={handlePromptSubmit} />;
                  }
                  if (inputMethod === "questionnaire") {
                    return <Questionnaire onSubmit={handlePromptSubmit} />;
                  }
                  return null;

                case "allTemplates":
                  return <h2>All Templates (Coming Soon)</h2>;

                case "addTemplate":
                  if (!hasReset) {
                    resetEverything();
                    setHasReset(true);
                  }
                  return <CreateTemplate />;

                case "fetchtemplate":
                  if (!hasReset) {
                    resetEverything();
                    setHasReset(true);
                  }
                  return (
                    <FetchTemplateDisplay
                      onPreview={(url, template) => {
                        setPreviewUrl(url);
                        setSelectedTemplate(template);
                        setActiveView("templatePreview");
                      }}
                    />
                  );

                case "templatePreview":
                  return (
                    <div>
                      <div
                        className="iframe-container"
                        style={{ height: "100vh", border: "1px solid #ccc" }}
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
                            scrollbarWidth: "none !important",
                            msOverflowStyle: "none",
                            overflow: "auto",
                          }}
                        />
                      </div>

                      <div className="preview-actions">
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  );

                case "addSectionForm":
                  return <AddSectionForm />;

                default:
                  return <p>Unknown view</p>;
              }
            })()
          )}
        </div>
      </div>
    );
  };

const leftPanelContent = (
  <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
    {/* Sidebar Header */}
    <div className={styles.sidebarHeader}>
      {!isCollapsed && <h3>Actions</h3>}
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        <FiLayout />
      </button>
    </div>

    {/* Flex container for content + admin */}
    <div className={styles.sidebarBody}>
      {/* Main Menu Items */}
      <ul className={styles.sidebarMenu}>
        {/* Generate Template */}
        <li>
          <button
            className={`${styles.sidebarItem} ${
              activeView === "home" ? styles.active : ""
            }`}
            onClick={() => {
              resetEverything();
              setActiveView("home");
            }}
            title={isCollapsed ? "Generate Template" : ""}
          >
            <span className={styles.icon}>
              <FiLayers />
            </span>
            {!isCollapsed && <span>Generate Template</span>}
          </button>
        </li>


        {/* Frame Builder */}
        <li>
          <button
            className={styles.sidebarItem}
            onClick={() => navigate("/frame-builder")}
          >
            <span className={styles.icon}>
              <FiCopy />
            </span>
            {!isCollapsed && <span>Frame Builder</span>}
          </button>
        </li>
      </ul>

      {/* Bottom Section: Admin Area */}
      <div className={styles.sidebarFooterSection}>
        <hr className={styles.divider} />

        {/* Admin Toggle */}
        <div className={styles.adminSection}>
          <div className={styles.adminToggleContainer}>
            {!isCollapsed && <span>Admin</span>}
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        {/* Conditional Admin Actions */}
        {isAdmin && (
          <ul className={styles.sidebarMenu}>
            {/* Add New Template */}
            <li>
              <button
                className={`${styles.sidebarItem} ${
                  activeView === "addTemplate" ? styles.active : ""
                }`}
                onClick={() => setActiveView("addTemplate")}
                title={isCollapsed ? "Add New Template(s)" : ""}
              >
                <span className={styles.icon}>
                  <FiPlus />
                </span>
                {!isCollapsed && <span>Add New Template(s)</span>}
              </button>
            </li>

            {/* See Template(s) */}
            <li>
              <button
                className={`${styles.sidebarItem} ${
                  activeView === "fetchtemplate" ? styles.active : ""
                }`}
                onClick={() => setActiveView("fetchtemplate")}
                title={isCollapsed ? "See Template(s)" : ""}
              >
                <span className={styles.icon}>
                  <FiGrid />
                </span>
                {!isCollapsed && <span>See Template(s)</span>}
              </button>
            </li>

            {/* Add Sections (Builder) */}
            <li>
              <button
                className={styles.sidebarItem}
                onClick={() => setActiveView("addSectionForm")}
              >
                <span className={styles.icon}>
                  <FiFolderPlus />
                </span>
                {!isCollapsed && <span>Add Sections (Builder)</span>}
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
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
