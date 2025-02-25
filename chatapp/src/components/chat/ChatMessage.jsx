import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function ChatMessage({
  type,
  content = "",
  sources = [],
  searchResults = [],
}) {
  const renderMarkdown = (text) => {
    if (!text) return "";

    // marked 라이브러리를 사용하여 마크다운을 HTML로 변환
    const rawHtml = marked.parse(text);

    // DOMPurify를 사용하여 XSS 공격 방지 (보안 강화)
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    return cleanHtml;
  };

  return (
    <div className={`mb-4 ${type === "user" ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block p-4 rounded-lg ${
          type === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="prose dark:prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content),
            }}
          />
        </div>
      </div>
      {type === "bot" && sources?.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold">참고 문서:</p>
          <ul className="list-disc list-inside">
            {sources.map((source, index) => (
              <li key={index}>{source}</li>
            ))}
          </ul>
        </div>
      )}
      {type === "bot" && searchResults?.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold">관련 검색:</p>
          <ul className="list-disc list-inside">
            {searchResults.map((result, index) => (
              <li key={index}>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
