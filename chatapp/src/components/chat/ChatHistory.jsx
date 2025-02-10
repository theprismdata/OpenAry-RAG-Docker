// src/components/chat/ChatHistory.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import axios from 'axios';
import { X } from 'lucide-react';

export default function ChatHistory({
  sessions,
  onSessionSelect,
  currentSessionId,
}) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setUploadStatus(null);
    // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
    event.target.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setUploadStatus({
        type: 'error',
        message: '선택된 파일이 없습니다.'
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('email', user.email);

    selectedFiles.forEach(file => {
      formData.append('upload_files', file);
    });

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:9000/files/upload/',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = response.data;
      setUploadStatus({
        type: 'success',
        message: `${result.total_files}개 파일 업로드 완료 (총 ${(result.total_size / 1024).toFixed(1)}KB)`
      });
      setSelectedFiles([]); // 업로드 성공 후 선택된 파일 목록 초기화
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: '파일 업로드 중 오류가 발생했습니다.'
      });
    } finally {
      setUploading(false);
      // 5초 후 상태 메시지 제거
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  // 파일 크기를 보기 좋게 변환하는 함수
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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

      {/* 파일 업로드 섹션 */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-4">
          <label className="block">
            <span className="sr-only">파일 선택</span>
            <div className="relative">
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </label>
        </div>

        {/* 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">선택된 파일 ({selectedFiles.length}개):</p>
            <ul className="text-sm text-gray-600 space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="flex items-center justify-center p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors duration-200"
                    title="파일 삭제"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 전송 버튼 */}
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium
            ${uploading || selectedFiles.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transition-colors duration-200'
            }
          `}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              파일 전송 중...
            </span>
          ) : (
            '파일 전송'
          )}
        </button>

        {/* 업로드 상태 메시지 */}
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            uploadStatus.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {uploadStatus.message}
          </div>
        )}
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