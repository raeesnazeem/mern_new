import { useState } from 'react'
import styles from '../styles/PromptInput.module.css'

const PromptInput = ({ promptRead }) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    promptRead(prompt)
  };

  return (
    <div className={styles.promptContainer}>
      <h2 style={{display:"flex", justifyContent:"start"}}>Describe your website</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I need a modern, dark-themed website for my aesthetic clinic with sections for services, about us, and contact information..."
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