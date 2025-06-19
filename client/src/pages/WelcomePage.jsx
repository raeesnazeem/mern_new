import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ChatBoardLayout from '../components/ChatBoardLayout';
import AnswerDisplay from '../components/AnswerDisplay';
import ChatbotContainer from '../components/ChatbotContainer';
import TopBar from '../components/TopBar';
import styles from '../styles/WelcomePage.module.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('initial'); // 'initial', 'briefing', 'processing'

  const handleStartBriefing = () => {
    setMode('briefing');
  };

  const handleSkipBriefing = () => {
    navigate('/dashboard');
  };

  const handleConversationComplete = useCallback((finalAnswers) => {
    setMode('processing');

    let finalPrompt = "New Project Briefing based on user input:\n\n";
    finalAnswers.forEach(item => {
      finalPrompt += `--- QUESTION ---\n${item.question}\n--- ANSWER ---\n${item.answer}\n\n`;
    });
    
    console.log("Generated Prompt:", finalPrompt); // For debugging

    // Here call backend API
    // axios.post(`${import.meta.env.VITE_TO_SERVER_API_URL}/api/process-brief`, { answers: finalAnswers });
    
    setTimeout(() => {
      navigate('/dashboard', { state: { prompt: finalPrompt } });
    }, 2000);
  }, [navigate]);

  if (mode === 'initial') {
    return (
      <div className={styles.welcomeContainer}>
        <h1>Hi from Growth99 BuildBot</h1>
        <p>To help me get started, please complete a short project briefing. You can also skip this step and proceed to tell us what you need through prompts too.</p>
        <div className={styles.buttonGroup}>
          <button onClick={handleStartBriefing} className={styles.startButton}>Ok, let's talk</button>
          <button onClick={handleSkipBriefing} className={styles.skipButton}>No, I'd like to see other options</button>
        </div>
      </div>
    );
  }

  if (mode === 'processing') {
    return (
      <div className={styles.welcomeContainer}>
        <h1>Thank you!</h1>
        <p>We're processing your answers and preparing your dashboard...</p>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      topBar={<TopBar />}
      leftPanel={<AnswerDisplay />}
      rightPanel={<ChatbotContainer onComplete={handleConversationComplete} />}
    />
  );
};

export default WelcomePage;