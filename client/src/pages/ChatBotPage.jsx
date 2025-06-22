import React from "react";
import ChatBoardLayout from "@/components/ChatBoardLayout";
import ChatBot from "../components/Chatbot";

const ChatBotPage = () => {
  return (
    <ChatBoardLayout
      topBar={<div style={{ padding: "1rem", fontWeight: "bold" }}>Custom Bot</div>}
      leftPanel={<div>Navigation or Instructions</div>}
      rightPanel={<ChatBot />}
    />
  );
};

export default ChatBotPage;
