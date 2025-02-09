// src/components/chat/ChatHistory.jsx
import React from "react";

export default function ChatHistory({
  sessions,
  onSessionSelect,
  currentSessionId,
}) {
  return (
    <div className="h-full bg-gray-50 p-4">
      <h2 className="text-xl font-bold mb-4">채팅 히스토리</h2>
      <div className="space-y-2">
        {sessions.map((session) => {
          const [sessionId, title] = Object.entries(session)[0];
          return (
            <button
              key={sessionId}
              onClick={() => onSessionSelect(sessionId)}
              className={`w-full text-left p-3 rounded-lg ${
                currentSessionId === sessionId
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
              }`}
            >
              {title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
