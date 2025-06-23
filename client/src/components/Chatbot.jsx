import React, { useState, useEffect, useRef } from "react";
import "../styles/Chatbot.css"

const questions = [
  { id: "q1", text: "What is your name?", type: "text", required: true },
  { id: "q2", text: "Describe your project.", type: "textarea", required: false },
  { id: "q3", text: "What is your budget?", type: "number", required: true },
];

const ChatBot = ({ onComplete }) => {
  const [chat, setChat] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [thinking, setThinking] = useState(true);
  const [inputEnabled, setInputEnabled] = useState(false);
  const chatRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;

    setThinking(true);
    setInputEnabled(false);

    const timeout = setTimeout(() => {
      setChat((prev) => [...prev, { from: "bot", text: currentQuestion.text }]);
      setThinking(false);
      setInputEnabled(true);
    }, 800);

    return () => clearTimeout(timeout);
  }, [currentIndex]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat, thinking]);

  const handleSubmit = (skip = false) => {
    if (!skip && currentQuestion.required && inputValue.trim() === "") {
      alert("This is required.");
      return;
    }

    const answer = skip ? "(Skipped)" : inputValue.trim();
    setChat((prev) => [...prev, { from: "user", text: answer }]);
    setInputValue("");
    setInputEnabled(false);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setChat((prev) => [
          ...prev,
          { from: "bot", text: "Thanks! That's all the questions." },
        ]);
        onComplete?.();
      }
    }, 500);
  };

  const renderInput = () => {
    if (!inputEnabled || !currentQuestion) return null;

    let inputEl;
    switch (currentQuestion.type) {
      case "textarea":
        inputEl = (
          <textarea
            rows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type here..."
          />
        );
        break;
      case "number":
        inputEl = (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number"
          />
        );
        break;
      default:
        inputEl = (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Your answer"
          />
        );
    }

    return (
      <div style={{ marginTop: 10 }}>
        {inputEl}
        <div style={{ marginTop: 8, display: "flex", gap: "10px" }}>
          <button onClick={() => handleSubmit(false)}>Submit</button>
          {!currentQuestion.required && (
            <button onClick={() => handleSubmit(true)}>Skip</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          backgroundColor: "#f9f9f9",
        }}
      >
        {chat.map((msg, idx) => (
          <div
            key={idx}
            style={{
              maxWidth: "80%",
              padding: "10px 14px",
              marginBottom: "10px",
              borderRadius: msg.from === "bot" ? "12px 12px 12px 0" : "12px 12px 0 12px",
              backgroundColor: msg.from === "bot" ? "#e0f7fa" : "#d1ffd6",
              alignSelf: msg.from === "bot" ? "flex-start" : "flex-end",
            }}
          >
            {msg.text}
          </div>
        ))}
        {thinking && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#e0f7fa",
              borderRadius: "12px 12px 12px 0",
              width: "60px",
              marginBottom: "10px",
            }}
          >
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
      </div>
      <div style={{ padding: 16 }}>{renderInput()}</div>
    </div>
  );
};

export default ChatBot;
