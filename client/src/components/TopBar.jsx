import React from 'react'
import styles from '../styles/TopBar.module.css'
import logo from '../assets/growth99-black-logo.svg'

const TopBar = () => {
  return (
    <div className={styles.topBar}>
      <div className="logoClass">
        <img src={logo} alt="Growth99 Logo" />
      </div>
      <div className={styles.userControls}>
        <button className={styles.loginButton}>Login</button>
      </div>
    </div>
  )
}

export default TopBar