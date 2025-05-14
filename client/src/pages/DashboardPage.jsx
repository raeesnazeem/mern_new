import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import InputMethodSelector from '../components/InputMethodSelector'
import CreateTemplate from '../components/CreateTemplate'
import PromptInput from '../components/PromptInput'
import Questionnaire from '../components/Questionnaire'
import TopBar from '../components/TopBar'

import styles from '../styles/DashboardPage.module.css'
import FetchTemplateDisplay from '../components/FetchDisplay'

const DashboardPage = () => {
  const [inputMethod, setInputMethod] = useState(null)
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [webpageId, setWebpageId] = useState(null)
  const [activeView, setActiveView] = useState('home')
  const [hasReset, setHasReset] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // reset function
  const resetEverything = () => {
    setInputMethod(null)
    setTemplates([])
    setIsLoading(false)
    setCurrentPrompt('')
    setWebpageId(null)
  }

  // To select which input method (prompt box or questionnare)
  const handleMethodSelect = (method) => {
    setInputMethod(method)
    setTemplates([])
    setActiveView('home')
  }

  // Logic for prompt handling through textarea or questionnare
  const handlePromptSubmit = async (prompt) => {
    setIsLoading(true)
    setCurrentPrompt(prompt)
  }

  // Logic for rendering the righ panel of the layout
  const renderRightPanel = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Generating your template...</p>
        </div>
      )
    }
    // chnage the state of activeView (rightpanel) as per the cases.
    switch (activeView) {
      case 'home':
        if (!inputMethod) {
          return <InputMethodSelector onMethodSelect={handleMethodSelect} />
        }
        if (inputMethod === 'prompt') {
          return <PromptInput onSubmit={handlePromptSubmit} />
        }
        if (inputMethod === 'questionnaire') {
          return <Questionnaire onSubmit={handlePromptSubmit} />
        }
        return null

      case 'allTemplates':
        return <div><h2>All Templates (Coming Soon)</h2></div>


      case 'addTemplate':
          if (!hasReset) {
            resetEverything()
            setHasReset(true)
          }
          return <CreateTemplate />


      case 'fetchtemplate':
        if (!hasReset) {
          resetEverything()
          setHasReset(true)
        }
        return (
          <FetchTemplateDisplay
            onPreview={(url, template) => {
              setPreviewUrl(url)
              setSelectedTemplate(template)
              setActiveView('templatePreview') // Switch view to preview
            }}
          />
        )

      // case 'templatePreview':
      //     return (
      //       <div className="preview-section">
      //         <h2>Preview: {selectedTemplate?.name}</h2>
      //         <div className="iframe-container">
      //           <iframe 
      //             src={previewUrl}
      //             title="Elementor Preview"
      //             sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
      //             referrerPolicy="no-referrer"
      //           />
      //         </div>
      //         <div className="preview-actions">
      //           <a href={previewUrl} target="_blank" rel="noopener noreferrer">
      //             Open in new tab
      //           </a>
      //         </div>
      //       </div>
      //     )

      case 'templatePreview':
      return (
        <div className="preview-section">
          <h2>Preview: {selectedTemplate?.name}</h2>
          <div className="iframe-container" style={{ height: '80vh', border: '1px solid #ccc' }}>
            <iframe 
              src={previewUrl}
              title="Elementor Preview"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              referrerPolicy="no-referrer"
              allow="fullscreen"
              width="100%"
              height="100%"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
          <div className="preview-actions">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
        </div>
      )

      default:
        return <div><p>Unknown view</p></div>
    }
  }

  const leftPanelContent = (
    <div className={styles.leftPanelContent}>
      <h3>Actions</h3>
      <ul className={styles.menuList}>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView('addTemplate')}>
            Add New Template(s)
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView('home')}>
            Generate Template
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView('fetchtemplate')}>
            See Template(s)
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => {
            resetEverything()
            setActiveView('home')
          }}>
            Reload
          </button>
        </li>
      </ul>

      {templates.length > 0 && (
        <div className={styles.currentInfo}>
          <h3>Current Page</h3>
          <p>ID: {webpageId || 'Not generated'}</p>
        </div>
      )}
    </div>
  )

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={leftPanelContent}
      rightPanel={
        <div className={styles.rightPanelContent}>
          {renderRightPanel()}
        </div>
      }
    />
  )
}

export default DashboardPage
