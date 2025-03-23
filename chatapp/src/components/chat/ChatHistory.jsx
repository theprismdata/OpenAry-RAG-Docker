import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import axios from "../../utils/axios_chatapi";
import { X, MessageCircle, FileText, Paperclip } from "lucide-react";

export default function ChatHistory({
  sessions,
  onSessionSelect,
  currentSessionId,
  onToggleDashboard,
  showDashboard,
}) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 모바일용 파일 업로드 섹션 상태
  const [showUploadSection, setShowUploadSection] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (showDashboard) {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.post(
            "/getdocs",
            {
              email: user.email,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setDocuments(response.data.fileinfo || []);
        } catch (err) {
          setError("문서 목록을 불러오는데 실패했습니다.");
          console.error("Error fetching documents:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDocuments();
  }, [showDashboard, user.email, token]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setUploadStatus(null);
    event.target.value = "";
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setUploadStatus({
        type: "error",
        message: "선택된 파일이 없습니다.",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("email", user.email);

    selectedFiles.forEach((file) => {
      formData.append("upload_files", file);
    });

    try {
      const response = await axios({
        method: "post",
        url: "/files/upload/",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;
      setUploadStatus({
        type: "success",
        message: `${result.total_files}개 파일 업로드 완료 (총 ${(
          result.total_size / 1024
        ).toFixed(1)}KB)`,
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: "파일 업로드 중 오류가 발생했습니다.",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // 파일 업로드 섹션
  const renderUploadSection = () => (
    <div className="border-t border-gray-200 p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">파일 업로드</h3>
          {/* 모바일에서만 보이는 토글 버튼 */}
          <button
            onClick={() => setShowUploadSection(!showUploadSection)}
            className="md:hidden text-sm text-blue-600"
          >
            {showUploadSection ? "접기" : "펼치기"}
          </button>
        </div>

        {/* 데스크톱 또는 모바일에서 펼쳐진 경우 표시 */}
        <div className={`${showUploadSection ? "block" : "hidden md:block"}`}>
          <label className="block">
            <div className="relative">
              <div className="relative flex items-center w-full">
                <div className="relative overflow-hidden flex-1">
                  <div className="flex items-center p-2 border border-gray-200 bg-white rounded-lg">
                    <Paperclip className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      {selectedFiles.length === 0
                        ? "파일을 선택하세요"
                        : `${selectedFiles.length}개 파일 선택됨`}
                    </span>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </label>

          {selectedFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                선택된 파일 ({selectedFiles.length}개):
              </p>
              <ul className="text-xs text-gray-600 space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
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

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium mt-3
              ${
                uploading || selectedFiles.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              }
            `}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                파일 전송 중...
              </span>
            ) : (
              "파일 전송"
            )}
          </button>

          {uploadStatus && (
            <div
              className={`mt-3 p-2 rounded-lg text-xs ${
                uploadStatus.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 사용자 정보 및 로그아웃 섹션
  const renderUserSection = () => (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="mb-3">
        <p className="text-xs text-gray-600">로그인 사용자:</p>
        <p className="text-sm font-medium text-gray-800 truncate">
          {user?.email}
        </p>
      </div>
      <button
        onClick={() => {
          sessionStorage.removeItem("dashboardView");
          dispatch(logout());
        }}
        className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
      >
        로그아웃
      </button>
    </div>
  );
}
