import React from 'react'
import styles from '../styles/TopBar.module.css'

const TopBar = () => {
  return (
    <div className={styles.topBar}>
      <h1>Elementor Template Generator</h1>
      <div className={styles.userControls}>
        <button className={styles.loginButton}>Login</button>
      </div>
    </div>
  )
}

export default TopBar