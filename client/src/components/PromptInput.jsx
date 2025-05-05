import React, { useState } from 'react'
import styles from '../styles/PromptInput.module.css'

const PromptInput = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(prompt)
  };

  return (
    <div className={styles.promptContainer}>
      <h2>Describe your website</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I need a modern, dark-themed website for my law firm with sections for services, about us, and contact information..."
          className={styles.promptTextarea}
          rows={5}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Generate Templates
        </button>
      </form>
    </div>
  )
}

export default PromptInput