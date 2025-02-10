// src/components/chat/ChatHistory.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

export default function ChatHistory({
  sessions,
  onSessionSelect,
  currentSessionId,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 채팅 히스토리 섹션 */}
      <div className="flex-1 p-4 overflow-y-auto">
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

      {/* 사용자 정보 및 로그아웃 섹션 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="mb-3">
          <p className="text-sm text-gray-600">로그인 사용자:</p>
          <p className="text-sm font-medium text-gray-800">{user?.email}</p>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}