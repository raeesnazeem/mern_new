import { useState, useEffect } from "react";
import ChatBot from "react-simple-chatbot";
import axios from "axios";
import ChatTyper from "./BotBubble";

const ChatbotContainer = ({ onComplete }) => {
  const [steps, setSteps] = useState(null);
  const [originalQuestions, setOriginalQuestions] = useState([]);

  useEffect(() => {
    const buildSteps = (questions) => {
      if (!questions || questions.length === 0) return [];
      const chatSteps = [];

      // This is the new, simplified logic
      questions.forEach((q) => {
         console.log(`Inside buildSteps, text for question ${q.id} is:`, q.text);
        const nextStepId = q.next || "end-message";

        // Step 1: The bot asks the question using the self-contained ChatTyper.
        // This component handles its own "thinking -> typing" animation.
        chatSteps.push({
          id: q.id,
          component: <ChatTyper message={q.text} avatarUrl="/bot-avatar.png" />,
          waitAction: true,
          // The trigger points to the user response step.
          trigger: `response-for-${q.id}`,
        });

        // Step 2: The bot waits for the user's response.
        // This step is triggered AFTER the ChatTyper is completely finished.
        if (q.type === "multiple-choice") {
          chatSteps.push({
            id: `response-for-${q.id}`,
            options: q.options.map((opt) => ({
              value: opt,
              label: opt,
              trigger: nextStepId, // Go to the next question after user chooses
            })),
          });
        } else {
          chatSteps.push({
            id: `response-for-${q.id}`,
            user: true,
            trigger: nextStepId, // Go to the next question after user types
          });
        }
      });

      const endMessageStep = {
        id: "end-message",
        component: (
          <ChatTyper
            message={
              "Thank you! That's all the questions I have. Processing your answers now..."
            }
            avatarUrl="/bot-avatar.png"
          />
        ),
        waitAction: true,
        end: true,
      };
      chatSteps.push(endMessageStep);

      setSteps(chatSteps);
    };
    axios
      .get("/questions.json")
      .then((response) => {
         console.log("Data received from server:", response.data);
        setOriginalQuestions(response.data);
        buildSteps(response.data);
      })
      .catch((error) => console.error("Failed to load questions:", error));
  }, []);

  const handleEnd = ({ values }) => {
    const answers = values.map((value, index) => ({
      question: originalQuestions[index].text,
      answer: value,
    }));
    onComplete(answers);
  };

  if (!steps) {
    return <div>Loading Briefing...</div>;
  }

  return (
    <ChatBot
      steps={steps}
      handleEnd={handleEnd}
      width="100%"
      height="100vh"
      contentStyle={{ height: "calc(100% - 112px)" }}
      hideUserAvatar={true}
      hideBotAvatar={true}
    />
  );
};

export default ChatbotContainer;
