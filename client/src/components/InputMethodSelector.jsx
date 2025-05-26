import React, { useState } from "react";
import styles from "../styles/InputMethodSelector.module.css";

const InputMethodSelector = ({ onMethodSelect }) => {
  return (
    <div className={styles.methodSelectorWrapper}>
      <div className={styles.methodSelector}>
        <h2>How would you like to create your template?</h2>
        <div className={styles.buttons}>
          <button
            className={styles.methodButton}
            onClick={() => onMethodSelect("prompt")}
          >
            Enter a Prompt
          </button>
          <button
            className={styles.methodButton}
            onClick={() => onMethodSelect("questionnaire")}
          >
            Answer Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputMethodSelector;
