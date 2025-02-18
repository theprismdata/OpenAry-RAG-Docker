import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { sendMessage, getSessionList } from "../../services/chatService";
import ChatHistory from "./ChatHistory";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import LoadingMessage from "./LoadingMessage";
import FileDashboard from "../../components/dashboard/FileDashboard";
import axios from "../../utils/axios_chatapi";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(() => {
    const saved = sessionStorage.getItem("dashboardView");
    return saved ? JSON.parse(saved) : false;
  });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  // TTS 초기화
  const initTTS = useCallback(() => {
    if ("speechSynthesis" in window) {
      const synthesis = window.speechSynthesis;
      const voices = synthesis.getVoices();
      const koreanVoice = voices.find((voice) => voice.lang.includes("ko"));
      return {
        synthesis,
        voice: koreanVoice || voices[0],
      };
    }
    return null;
  }, []);

  // 텍스트 읽기 함수
  const speak = useCallback(
    (text) => {
      const tts = initTTS();
      if (!tts) {
        alert("죄송합니다. 이 브라우저는 음성 합성을 지원하지 않습니다.");
        return;
      }

      // 이전 음성이 재생 중이라면 중지
      if (isSpeaking) {
        tts.synthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = tts.voice;
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error("TTS Error:", event);
        setIsSpeaking(false);
      };

      tts.synthesis.speak(utterance);
    },
    [isSpeaking]
  );

  // 음성 중지
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (question) => {
      setIsLoading(true);
      try {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "bot",
            content: response.answer,
            sources: response.sourcelist,
            searchResults: response.searchlist,
          },
        ]);

        if (sessionId === 0) {
          setSessionId(response.chat_session);
          setSessions((prev) => [
            {
              [response.chat_session]: question.substring(0, 30) + "...",
            },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "bot",
            content:
              "죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, user.email, token]
  );

  // ChatMessage 컴포넌트에 TTS 버튼 추가를 위한 렌더 함수
  const renderMessage = (message) => (
    <div key={message.id} className="flex items-start space-x-2">
      <ChatMessage {...message} />
      {message.type === "bot" && (
        <button
          onClick={() => speak(message.content)}
          className={`p-2 rounded-full ${
            isSpeaking
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}
    </div>
  );

  // 컴포넌트가 언마운트될 때 음성 중지
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const recognition = useCallback(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";
      return recognition;
    }
    return null;
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) {
      alert("죄송합니다. 이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognitionInstance = recognition();

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognitionInstance.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        handleSendMessage(transcript.trim());
        setTranscript("");
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionInstance.start();
  }, [recognition, handleSendMessage, transcript]);

  const stopListening = useCallback(() => {
    if (recognition) {
      const recognitionInstance = recognition();
      recognitionInstance.stop();
      setIsListening(false);
    }
  }, [recognition]);

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
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "user",
            content: item.question,
          },
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  const handleSessionSelect = useCallback((selectedSessionId) => {
    setSessionId(selectedSessionId);
    fetchSessionHistory(selectedSessionId);
  }, []);

  const handleToggleDashboard = useCallback((isDocs) => {
    sessionStorage.setItem("dashboardView", JSON.stringify(isDocs));
    setShowDashboard(isDocs);
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        await fetchSessionList();
      } catch (error) {
        console.error("Session fetch error:", error);
      }
    };

    fetchSessions();
  }, [user.email, token]);

  return (
    <div className="flex h-full">
      <div className="w-1/4 h-full border-r border-gray-200">
        <ChatHistory
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
          currentSessionId={sessionId}
          onToggleDashboard={handleToggleDashboard}
          showDashboard={showDashboard}
        />
      </div>

      <div className="flex-1 flex flex-col h-full">
        {showDashboard ? (
          <FileDashboard />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {messages.map(renderMessage)}
              {isLoading && <LoadingMessage />}
            </div>

            <div className="border-t border-gray-200 flex items-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 mx-2 rounded-full ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
              <div className="flex-1">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  transcript={transcript}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
