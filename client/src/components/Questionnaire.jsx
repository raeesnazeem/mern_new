import { useState } from "react";
import styles from "../styles/Questionnaire.module.css";

const Questionnaire = ({ onSubmit }) => {
  const [answers, setAnswers] = useState({
    theme: "",
    feel: "",
    color: "",
    sections: [],
  });

  const themes = ["Dark", "Light"];
  const feels = ["Modern", "Minimalistic", "Aesthetic", "Trendy", "Elegant"];
  const colors = ["Blue", "Red", "Cream", "Purple", "Black", "Teal"];
  const sections = [
    "Header",
    "Footer",
    "CTA",
    "Services",
    "Conditions",
    "About Us",
    "Team",
    "Contact",
    "Shop",
    "Testimonial Feed",
  ];

  const handleChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionToggle = (section) => {
    setAnswers((prev) => {
      const newSections = prev.sections.includes(section)
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section];
      return { ...prev, sections: newSections };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Construct a prompt from the answers
    const prompt = `I want a ${answers.theme.toLowerCase()}-themed website with a ${answers.feel.toLowerCase()} feel and a primary color of ${
      answers.color || "default"
    }. It should include the following sections: ${answers.sections.join(
      ", "
    )}.`;
    onSubmit(prompt);
  };

  return (
    <div className={styles.questionnaire}>
      <h2>Tell us about your website</h2>
      <form onSubmit={handleSubmit}>
        {/* Theme */}
        <div className={styles.questionGroup}>
          <label>What is the theme you like for your website?</label>
          <div className={styles.options}>
            {themes.map((theme) => (
              <button
                key={theme}
                type="button"
                className={`${styles.optionButton} ${
                  answers.theme === theme ? styles.selected : ""
                }`}
                onClick={() => handleChange("theme", theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Feel */}
        <div className={styles.questionGroup}>
          <label>What is the feel?</label>
          <div className={styles.options}>
            {feels.map((feel) => (
              <button
                key={feel}
                type="button"
                className={`${styles.optionButton} ${
                  answers.feel === feel ? styles.selected : ""
                }`}
                onClick={() => handleChange("feel", feel)}
              >
                {feel}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className={styles.questionGroup}>
          <label>What primary color would you like to use?</label>
          <div className={styles.options}>
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`${styles.optionButton} ${
                  answers.color === color ? styles.selected : ""
                } ${styles.colorOption}`}
                title={color}
                onClick={() => handleChange("color", color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className={styles.questionGroup}>
          <label>What sections do you need on the page?</label>
          <div className={styles.sectionOptions}>
            {sections.map((section) => (
              <div key={section} className={styles.sectionCheckbox}>
                <input
                  type="checkbox"
                  id={`section-${section}`}
                  checked={answers.sections.includes(section)}
                  onChange={() => handleSectionToggle(section)}
                />
                <label htmlFor={`section-${section}`}>{section}</label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={
            !answers.theme || !answers.feel || answers.sections.length === 0
          }
        >
          Generate Templates
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;
