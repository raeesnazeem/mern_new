import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import InputMethodSelector from '../components/InputMethodSelector'
import CreateTemplate from '../components/CreateTemplate'
import PromptInput from '../components/PromptInput'
import Questionnaire from '../components/Questionnaire'
import TemplateDisplay from '../components/TemplateDisplay'
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

  const handleMethodSelect = (method) => {
    setInputMethod(method)
    setTemplates([])
    setActiveView('home')
  }

  const handlePromptSubmit = async (prompt) => {
    setIsLoading(true)
    setCurrentPrompt(prompt)

    try {
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
        setActiveView('templateDisplay')
      } else {
        console.error('Error generating templates:', data.message)
      }
    } catch (error) {
      console.error('API call failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateSection = async (sectionType) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webpageId: webpageId,
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
  }

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
        const blob = new Blob([JSON.stringify(data.data)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
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
    if (isLoading) {
      return (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Generating your template...</p>
        </div>
      )
    }

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

      case 'templateDisplay':
        return (
          <TemplateDisplay
            templates={templates}
            onRegenerateSection={handleRegenerateSection}
            onExport={handleExport}
          />
        )

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

      case 'templatePreview':
          return (
            <div className="preview-section">
              <h2>Preview: {selectedTemplate?.name}</h2>
              <div className="iframe-container">
                <iframe 
                  src={previewUrl}
                  title="Elementor Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                  referrerPolicy="no-referrer"
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
            Add Template(s)
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView('templateDisplay')}>
            Generate Template
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => setActiveView('fetchtemplate')}>
            See All Templates
          </button>
        </li>
        <li className={styles.dashboardoptions}>
          <button onClick={() => {
            resetEverything()
            setActiveView('home')
          }}>
            Reset
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
