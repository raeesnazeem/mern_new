import React from 'react';
import styles from '../styles/AnswerDisplay.module.css';
const AnswerDisplay = () => {
  return (
    <div className={styles.answerContainer}>
      <h2 className={styles.title}><span> <img src="/bot-avatar.png" style={{maxWidth:'60px', marginBottom:'-25px'}} alt="g99 BuildBot" /></span>BuildBot</h2>
      <p className={styles.placeholder}>
       Let's get to know some details! Complete the conversation in the chat panel on the right and I'll be on my way building it out for you.
      </p>
    </div>
  );
};

export default AnswerDisplay;