import React from 'react'
import styles from '../styles/TemplateDisplay.module.css'

const TemplateDisplay = ({ templates, onRegenerateSection, onExport }) => {
  return (
    <div className={styles.templateDisplay}>
      <h2>Generated Templates</h2>
      <div className={styles.templateSections}>
        {templates.map((template, index) => (
          <div key={index} className={styles.templateSection}>
            <h3>{template.sectionType}</h3>
            <div className={styles.templatePreview}>
              {/* This would be replaced with actual template preview rendering */}
              <p>Preview of {template.sectionType} section</p>
            </div>
            <button 
              onClick={() => onRegenerateSection(template.sectionType)}
              className={styles.regenerateButton}
            >
              Regenerate
            </button>
          </div>
        ))}
      </div>
      <button onClick={onExport} className={styles.exportButton}>
        Export Full Page
      </button>
    </div>
  )
}

export default TemplateDisplay