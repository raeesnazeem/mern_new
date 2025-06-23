import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";
import ChatBoardLayout from "../components/ChatBoardLayout";
import styles from "../styles/ChatBoardLayout.module.css";

// InputField Component
const InputField = ({ type, value, onChange, options, placeholder, inputRef, onSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && type !== "select") {
      if (type === "textarea") {
        e.preventDefault();
      }
      onSubmit?.();
    }
  };

  switch (type) {
    case "textarea":
      return (
        <textarea
          ref={inputRef}
          rows={4}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
      );
    case "number":
      return (
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
      );
    case "select":
      return (
        <select ref={inputRef} value={value} onChange={onChange} autoFocus>
          <option value="">-- Select --</option>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
      );
  }
};

// Memoized ChatBubble Component
const ChatBubble = memo(({ msg, isThinking }) => {
  const bubbleRef = useRef(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    const bubble = bubbleRef.current;
    if (bubble) {
      bubble.classList.add(styles.animateBubble);
      const handleAnimationEnd = () => {
        bubble.classList.remove(styles.animateBubble);
      };
      bubble.addEventListener("animationend", handleAnimationEnd);
      return () => {
        bubble.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, []);

  return (
    <div
      ref={bubbleRef}
      data-message-id={msg.id}
      data-from={msg.from}
      className={styles.bubbleContainer}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: msg.from === "bot" ? "flex-start" : "flex-end",
      }}
    >
      {msg.from === "bot" && (
        <img
          src="/bot-avatar.png"
          alt="Bot Avatar"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            marginRight: "8px",
            flexShrink: 0,
          }}
        />
      )}
      <div
        style={{
          maxWidth: "70%",
          padding: "10px 14px",
          borderRadius: msg.from === "bot" ? "0 12px 12px 12px" : "12px 0 12px 12px",
          backgroundColor: msg.from === "bot" ? "#e0f7fa" : "#d1ffd6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          whiteSpace: "normal",
          position: "relative",
        }}
      >
        {isThinking ? (
          <>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </>
        ) : msg.from === "bot" ? (
          <>
            <TypeAnimation
              sequence={[
                msg.text,
                () => setIsTypingComplete(true), // Mark typing as complete
              ]}
              speed={{ type: "keyStrokeDelayInMs", value: 60 }} // Average 60ms per character
              repeat={0}
              cursor={false}
              style={{ display: "inline" }}
            />
            {!isTypingComplete && <span className={styles.typingCursor}>|</span>}
          </>
        ) : (
          msg.text
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.msg.id === nextProps.msg.id &&
    prevProps.isThinking === nextProps.isThinking
  );
});

// RenderInput Component
const RenderInput = memo(({ question, value, onChange, onSubmit, inputRef }) => {
  if (!question) return null;

  return (
    <div className={styles.inputContainer}>
      <InputField
        type={question.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSubmit={() => onSubmit(value, false)}
        options={question.options}
        placeholder={
          question.type === "textarea"
            ? "Type here..."
            : question.type === "number"
            ? "Enter a number"
            : "Your answer"
        }
        inputRef={inputRef}
      />
      <div className={styles.buttonContainer}>
        <button onClick={() => onSubmit(value, false)} style={{backgroundColor:'teal'}}>Submit</button>
        {!question.required && (
          <button onClick={() => onSubmit(value, true)} style={{backgroundColor:'#13121f'}}>Skip</button>
        )}
      </div>
    </div>
  );
});

const ChatbotContainer = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [chat, setChat] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [thinking, setThinking] = useState(true);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [answers, setAnswers] = useState([]);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    axios
      .get("/questions.json")
      .then((res) => {
        setQuestions(res.data || []);
      })
      .catch((err) => console.error("Failed to load questions:", err));
  }, []);

  useEffect(() => {
    if (!questions[currentIndex]) return;

    setThinking(true);
    setInputEnabled(false);

    const messageId = Date.now().toString();
    const timeout = setTimeout(() => {
      setChat((prev) => [
        ...prev,
        { from: "bot", text: questions[currentIndex].text, id: messageId },
      ]);
      setThinking(false);
      setInputEnabled(true);
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [currentIndex, questions]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chat, thinking]);

  const handleSubmit = useCallback(
    (currentValue, skip = false) => {
      const q = questions[currentIndex];
      if (!q) return;

      if (!skip && q.required && currentValue.trim() === "") {
        alert("This is required.");
        return;
      }

      const messageId = Date.now().toString();
      const answer = skip ? "(Skipped)" : currentValue.trim();
      setChat((prev) => [...prev, { from: "user", text: answer, id: messageId }]);
      setAnswers((prev) => [...prev, { question: q.text, answer }]);
      setInputValue("");
      setInputEnabled(false);

      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          const finalMessageId = Date.now().toString();
          setChat((prev) => [
            ...prev,
            { from: "bot", text: "Thank you! That's all the questions I have.", id: finalMessageId },
          ]);
          onComplete?.();
        }
      }, 500);
    },
    [currentIndex, questions, onComplete]
  );

  const rightPanelContent = useMemo(
    () => (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          borderRadius:'16px',
        }}
      >
        <div
          ref={chatRef}
          className="react-chatbot-kit-chat-message-container"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 32,
            borderRadius:'32px',
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {chat.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          {thinking && (
            <ChatBubble
              key={`thinking-${currentIndex}`}
              msg={{ from: "bot", text: "", id: `thinking-${currentIndex}` }}
              isThinking
            />
          )}
        </div>
        <div style={{ padding: 16 }}>
          {inputEnabled && (
            <RenderInput
              question={questions[currentIndex]}
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              inputRef={inputRef}
            />
          )}
        </div>
      </div>
    ),
    [chat, thinking, inputEnabled, currentIndex, questions, handleSubmit, inputValue]
  );

  return (
    <ChatBoardLayout
      leftPanel={
        <div className="leftChatPanel">
          <h3>Project Setup</h3>
          <ul>
            <li>Answer all required fields</li>
            <li>You can skip optional ones</li>
            <li>Once done, we’ll process your answers</li>
          </ul>
          <div>
            <h4>Your Answers</h4>
            <ul style={{ fontSize: "14px", lineHeight: "1.5" }}>
              {answers.map((a, idx) => (
                <li key={idx}>
                  <strong>{a.question}</strong>
                  <br />
                  {a.answer}
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
      rightPanel={rightPanelContent}
    />
  );
};

export default ChatbotContainer;