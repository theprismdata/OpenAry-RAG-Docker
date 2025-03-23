import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function MainLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  // 모바일 화면 여부 확인
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 화면 크기 변화 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 체크
    checkMobile();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", checkMobile);

    // 클린업
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 - 모바일에서는 작게 */}
      <header className="bg-white border-b border-gray-200 px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f8e8d8] flex items-center justify-center mr-2 md:mr-3">
            <img
              src="/images/coding-sloth.png"
              alt="OpenAry Logo"
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            OpenAry
          </h1>
          {isMobile && (
            <span className="ml-auto text-xs text-gray-500">모바일 버전</span>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
