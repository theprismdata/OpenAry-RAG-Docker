import { useState, useEffect, useRef } from "react";

export default function MessageInput({ onSendMessage, isLoading, transcript }) {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);
  const MAX_ROWS = 5;

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      adjustTextareaHeight();
    }
  }, [transcript]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 20; // 대략적인 한 줄 높이
      const newRows = Math.min(Math.floor(scrollHeight / lineHeight), MAX_ROWS);

      setRows(newRows);
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        lineHeight * MAX_ROWS
      )}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      // 메시지 전송 후 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        setRows(1);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Enter 키를 누르되 Shift 키는 누르지 않은 경우에만 제출
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 md:p-3 w-full">
      <div className="flex space-x-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isLoading}
          rows={rows}
        />
        <button
          type="submit"
          className={`px-3 py-2 rounded-lg ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white min-w-[60px] md:min-w-[70px] flex-shrink-0`}
          disabled={isLoading}
        >
          전송
        </button>
      </div>
    </form>
  );
}
