// import { useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ChatBoardLayout from '../components/ChatBoardLayout';
// import AnswerDisplay from '../components/AnswerDisplay';
// import ChatbotContainer from '../components/ChatbotContainer';
// import TopBar from '../components/TopBar';
// import styles from '../styles/WelcomePage.module.css';

// const WelcomePage = () => {
//   const navigate = useNavigate();
//   const [mode, setMode] = useState('initial'); // 'initial', 'briefing', 'processing'

//   const handleStartBriefing = () => {
//     setMode('briefing');
//   };

//   const handleSkipBriefing = () => {
//     navigate('/dashboard');
//   };

//   const handleConversationComplete = useCallback((finalAnswers) => {
//     setMode('processing');

//     let finalPrompt = "New Project Briefing based on user input:\n\n";
//     finalAnswers.forEach(item => {
//       finalPrompt += `--- QUESTION ---\n${item.question}\n--- ANSWER ---\n${item.answer}\n\n`;
//     });

//     console.log("Generated Prompt:", finalPrompt); // For debugging

//     // Here call backend API
//     // axios.post(`${import.meta.env.VITE_TO_SERVER_API_URL}/api/process-brief`, { answers: finalAnswers });

//     setTimeout(() => {
//       navigate('/dashboard', { state: { prompt: finalPrompt } });
//     }, 2000);
//   }, [navigate]);

//   if (mode === 'initial') {
//     return (
//       <div className={styles.welcomeContainer}>
//         <h1>Hi from Growth99 BuildBot</h1>
//         <p>To help me get started, please complete a short project briefing. You can also skip this step and proceed to tell us what you need through prompts too.</p>
//         <div className={styles.buttonGroup}>
//           <button onClick={handleStartBriefing} className={styles.startButton}>Ok, let's talk</button>
//           <button onClick={handleSkipBriefing} className={styles.skipButton}>No, I'd like to see other options</button>
//         </div>
//       </div>
//     );
//   }

//   if (mode === 'processing') {
//     return (
//       <div className={styles.welcomeContainer}>
//         <h1>Thank you!</h1>
//         <p>We're processing your answers and preparing your dashboard...</p>
//         <div className={styles.loader}></div>
//       </div>
//     );
//   }

//   return (
//     <ChatBoardLayout
//       topBar={<TopBar />}
//       leftPanel={<AnswerDisplay />}
//       rightPanel={<ChatbotContainer onComplete={handleConversationComplete} />}
//     />
//   );
// };

// export default WelcomePage;

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatBoardLayout from "../components/ChatBoardLayout";
import AnswerDisplay from "../components/AnswerDisplay";
import ChatbotContainer from "../components/ChatbotContainer";
import TopBar from "../components/TopBar";
import styles from "../styles/WelcomePage.module.css";
import nodemailer from "nodemailer";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("initial"); // 'initial', 'briefing', 'processing', 'confirmation'
  const [finalAnswers, setFinalAnswers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleStartBriefing = () => {
    setMode("briefing");
  };

  const handleSkipBriefing = () => {
    navigate("/dashboard");
  };

  const handleConversationComplete = useCallback((answers) => {
    setFinalAnswers(answers);
    setShowModal(true);
  }, []);

  const sendEmail = async (prompt) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: "raees@raeescodes.xyz",
        pass: `${import.meta.env.VITE_EMAIL_PASS}`,
      },
      // tls: {
      //   rejectUnauthorized: false, // Uncomment only if certificate issues arise
      // },
    });

    const mailOptions = {
      from: "raees@raeescodes.xyz",
      to: "raees.nazeem@growth99.com",
      subject: "Project Briefing Results",
      text: prompt,
    };

    try {
      // Verify transporter configuration
      await transporter.verify();
      console.log("Server is ready to send emails");

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      return true; // Indicate success
    } catch (error) {
      console.error("Error sending email:", error);
      if (error.response) console.error("Response:", error.response);
      return false; // Indicate failure
    }
  };

  const handleConfirmSubmission = async () => {
    setShowModal(false);
    setMode("processing");

    let finalPrompt = "New Project Briefing based on user input:\n\n";
    finalAnswers.forEach((item) => {
      finalPrompt += `--- QUESTION ---\n${item.question}\n--- ANSWER ---\n${item.answer}\n\n`;
    });

    // Send email using Nodemailer
    await sendEmail(finalPrompt);

    console.log("Generated Prompt:", finalPrompt); // For debugging

    setTimeout(() => {
      navigate("/dashboard", { state: { prompt: finalPrompt } });
    }, 2000);
  };

  const handleEditSubmission = () => {
    setShowModal(false);
    setMode("briefing"); // Return to briefing mode to edit
  };

  if (mode === "initial") {
    return (
      <div className={styles.welcomeContainer}>
        <h1>Hi from Growth99 BuildBot</h1>
        <p>
          To help me get started, please complete a short project briefing. You
          can also skip this step and proceed to tell us what you need through
          prompts too.
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={handleStartBriefing} className={styles.startButton}>
            Ok, let's talk
          </button>
          <button onClick={handleSkipBriefing} className={styles.skipButton}>
            No, I'd like to see other options
          </button>
        </div>
      </div>
    );
  }

  if (mode === "processing") {
    return (
      <div className={styles.welcomeContainer}>
        <h1>Thank you!</h1>
        <p>We're processing your answers and preparing your dashboard...</p>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <ChatBoardLayout
      topBar={<TopBar />}
      leftPanel={<AnswerDisplay />}
      rightPanel={<ChatbotContainer onComplete={handleConversationComplete} />}
    >
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Submission</h2>
            <p>Are you sure you want to submit the following answers?</p>
            <ul>
              {finalAnswers.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.question}</strong>: {item.answer}
                </li>
              ))}
            </ul>
            <div className={styles.modalButtons}>
              <button
                onClick={handleConfirmSubmission}
                className={styles.confirmButton}
              >
                Submit
              </button>
              <button
                onClick={handleEditSubmission}
                className={styles.editButton}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </ChatBoardLayout>
  );
};

export default WelcomePage;
