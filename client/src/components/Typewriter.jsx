import { useState, useEffect } from 'react';
import styles from '../styles/Typewriter.module.css'; // Adjust path if needed

const Typewriter = ({ text, speed = 30, onFinished }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when the text prop changes
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text || currentIndex >= text.length) {
      // Call onFinished callback if provided, once typing is complete
      if (currentIndex >= text.length && typeof onFinished === 'function') {
        onFinished();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText((prevText) => prevText + text[currentIndex]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, speed);

    // Cleanup timer on component unmount or before re-running effect
    return () => clearTimeout(timer);
  }, [text, currentIndex, speed, onFinished]);

  return (
    <div className={styles.typewriterContainer}>
      <p className={styles.typewriterText}>
        {displayText}
        {currentIndex < (text?.length || 0) && <span className={styles.cursor}>|</span>}
      </p>
    </div>
  );
};

export default Typewriter;