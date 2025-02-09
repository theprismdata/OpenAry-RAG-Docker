// src/components/chat/ChatWindow.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { sendMessage, getSessionList } from "../../services/chatService";
import ChatHistory from "./ChatHistory";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(0);
  const [sessions, setSessions] = useState([]);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSessionList();
  }, []);

  const fetchSessionList = async () => {
    try {
      const response = await getSessionList(user.email, token);
      setSessions(response.session_list);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const handleSendMessage = async (question) => {
    try {
      const response = await sendMessage(
        {
          email: user.email,
          question,
          session_id: sessionId,
          isnewsession: sessionId === 0,
        },
        token
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: question,
        },
        {
          type: "bot",
          content: response.answer,
          sources: response.sourcelist,
          searchResults: response.searchlist,
        },
      ]);

      if (sessionId === 0) {
        setSessionId(response.chat_session);
        fetchSessionList();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <ChatHistory
          sessions={sessions}
          onSessionSelect={setSessionId}
          currentSessionId={sessionId}
        />
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
