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

  const fetchSessionHistory = async (selectedSessionId) => {
    try {
      const response = await fetch("http://localhost:9000/chatapi/getasessionhistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          session: selectedSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch session history");
      }

      const data = await response.json();
      const historyMessages = data.history.flatMap((item) => [
        {
          type: "user",
          content: item.question,
        },
        {
          type: "bot",
          content: item.answer,
          sources: item.sourcelist,
          searchResults: item.searchlist,
        },
      ]);

      setMessages(historyMessages);
    } catch (error) {
      console.error("Failed to fetch session history:", error);
    }
  };

  const handleSessionSelect = (selectedSessionId) => {
    setSessionId(selectedSessionId);
    fetchSessionHistory(selectedSessionId);
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
    <div className="flex h-full">
      {/* 왼쪽 사이드바 - 채팅 히스토리 */}
      <div className="w-1/4 h-full border-r border-gray-200">
        <ChatHistory
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
          currentSessionId={sessionId}
        />
      </div>

      {/* 오른쪽 채팅 영역 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 메시지 표시 영역 */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
        </div>

        {/* 메시지 입력 영역 */}
        <div className="border-t border-gray-200">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}