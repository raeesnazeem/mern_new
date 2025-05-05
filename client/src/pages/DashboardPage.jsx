import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import InputMethodSelector from '../components/InputMethodSelector'
import PromptInput from '../components/PromptInput'
import Questionnaire from '../components/Questionnaire'
import TemplateDisplay from '../components/TemplateDisplay'
import TopBar from '../components/TopBar'
// Add this at the top with other imports
import styles from '../styles/DashboardPage.module.css'

const DashboardPage = () => {
  const [inputMethod, setInputMethod] = useState(null)
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [webpageId, setWebpageId] = useState(null);


  // reset function
  const resetEverything = () => {
    setInputMethod(null);
    setTemplates([]);
    setIsLoading(false);
    setCurrentPrompt('');
    setWebpageId(null);
  };

  const handleMethodSelect = (method) => {
    setInputMethod(method)
    setTemplates([])
  };

  const handlePromptSubmit = async (prompt) => {
    setIsLoading(true)
    setCurrentPrompt(prompt)
    
    try {
      // Call your backend API
      const response = await fetch('/api/generate-webpage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      
      const data = await response.json()
      if (data.success) {
        setTemplates(data.data.sections)
        setWebpageId(data.data.webpageId)
      } else {
        console.error('Error generating templates:', data.message)
      }
    } catch (error) {
      console.error('API call failed:', error)
    } finally {
      setIsLoading(false)
    }
  };

  const handleRegenerateSection = async (sectionType) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webpageId: webpageId, // You'd track this in state
          currentSections: templates,
          sectionToRegenerate: sectionType,
          prompt: currentPrompt,
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setTemplates(data.data.sections)
      } else {
        console.error('Error regenerating section:', data.message)
      }
    } catch (error) {
      console.error('API call failed:', error)
    } finally {
      setIsLoading(false)
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export-webpage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: templates }),
      })
      
      const data = await response.json()
      if (data.success) {
        // Trigger download
        const blob = new Blob([JSON.stringify(data.data)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url;
        a.download = `elementor-template-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        console.error('Error exporting:', data.message)
      }
    } catch (error) {
      console.error('API call failed:', error)
    }
  }


  const renderRightPanel = () => {
    if (templates.length > 0) {
      return (
        <TemplateDisplay 
          templates={templates} 
          onRegenerateSection={handleRegenerateSection}
          onExport={handleExport}
        />
      )
    }

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
  }

  const leftPanelContent = (
    <div className={styles.leftPanelContent}>
      <h3>Actions</h3>
      <button 
        onClick={resetEverything}
        className={styles.resetButton}
        disabled={!inputMethod && templates.length === 0}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.resetIcon}
        >
          <path
            d="M4 12C4 7.58172 7.58172 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315L15 9H21V3L18.6569 5.34315C16.8284 3.51472 14.4853 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12H20C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z"
            fill="currentColor"
          />
        </svg>
        Reset Everything
      </button>
      
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
          {isLoading ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>Generating your template...</p>
            </div>
          ) : (
            renderRightPanel()
          )}
        </div>
      }
    />
  )
}

export default DashboardPage