// src/components/chat/ChatWindow.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { sendMessage, getSessionList } from "../../services/chatService";
import ChatHistory from "./ChatHistory";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import LoadingMessage from "./LoadingMessage";
import FileDashboard from "../../components/dashboard/FileDashboard";
import axios from "../../utils/axios";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
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
    setIsLoading(true);
    try {
      const response = await axios.post("/getasessionhistory", {
        email: user.email,
        session: selectedSessionId,
      });

      if (response.data) {
        const historyMessages = response.data.history.flatMap((item) => [
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
      }
    } catch (error) {
      console.error("Failed to fetch session history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (selectedSessionId) => {
    setSessionId(selectedSessionId);
    fetchSessionHistory(selectedSessionId);
  };

  const handleSendMessage = async (question) => {
    setIsLoading(true);
    try {
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: question,
        },
      ]);

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
      // 에러 발생 시 에러 메시지를 채팅창에 표시
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            "죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
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
          onToggleDashboard={() => setShowDashboard(!showDashboard)}
          showDashboard={showDashboard}
        />
      </div>

      {/* 오른쪽 영역 - 채팅 또는 대시보드 */}
      <div className="flex-1 flex flex-col h-full">
        {showDashboard ? (
          <FileDashboard />
        ) : (
          <>
            {/* 메시지 표시 영역 */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {messages.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
              {isLoading && <LoadingMessage />}
            </div>

            {/* 메시지 입력 영역 */}
            <div className="border-t border-gray-200">
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
