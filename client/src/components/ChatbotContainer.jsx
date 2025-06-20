import { useState, useEffect, useRef } from "react";
import ChatBot from "react-simple-chatbot";
import axios from "axios";
import ChatTyper from "./BotBubble";

const ChatbotContainer = ({ onComplete }) => {
  const [steps, setSteps] = useState(null);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const observer = useRef(null);

  // This function will scroll to the bottom and focus the input field.
  const handleBotTypingEnd = () => {
    const chatContainer = document.querySelector(".rsc-content");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Find all possible input types from react-simple-chatbot
    const input = document.querySelector(".rsc-input") || document.querySelector(".rsc-input[type='text']");
    if (input) {
      input.focus();
    }
  };

  useEffect(() => {
    // This MutationObserver is useful for scrolling after a USER action.
    const scrollToBottomAfterUser = (mutations) => {
      const chatContainer = document.querySelector(".rsc-content");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };

    const chatContainer = document.querySelector(".rsc-content");

    if (chatContainer) {
      observer.current = new MutationObserver(scrollToBottomAfterUser);
      observer.current.observe(chatContainer, { childList: true });
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [steps]);

  useEffect(() => {
    const buildSteps = (questions) => {
      if (!questions || questions.length === 0) return [];
      const chatSteps = [];

      questions.forEach((q) => {
        const nextStepId = q.next || "end-message";

        chatSteps.push({
          id: q.id,
          // CHANGED: Pass the new callback function as a prop
          component: (
            <ChatTyper
              message={q.text}
              avatarUrl="/bot-avatar.png"
              onTypingEnd={handleBotTypingEnd}
            />
          ),
          waitAction: true,
          trigger: `response-for-${q.id}`,
        });

        if (q.type === "multiple-choice") {
          chatSteps.push({
            id: `response-for-${q.id}`,
            options: q.options.map((opt) => ({
              value: opt,
              label: opt,
              trigger: nextStepId,
            })),
          });
        } else {
          chatSteps.push({
            id: `response-for-${q.id}`,
            user: true,
            trigger: nextStepId,
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
            // Note: No callback needed here as it's the end.
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
      contentStyle={{
        height: "calc(100% - 112px)",
        overflowY: "auto",
        paddingBottom: "20px",
      }}
      hideUserAvatar={true}
      hideBotAvatar={true}
      enableSmoothScroll={false}
    />
  );
};

export default ChatbotContainer;