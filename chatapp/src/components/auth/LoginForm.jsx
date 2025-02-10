// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  loginUser,
  selectAuthError,
  selectAuthLoading,
} from "../../store/slices/authSlice";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    new_passwd: "",
  });
  const [addUserMessage, setAddUserMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  const from = location.state?.from?.pathname || "/chat";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name === "password" ? "new_passwd" : name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9001/mgmt/add_user", newUserData);

      if (response.data.auth && response.data.status === "ok") {
        setAddUserMessage("사용자가 성공적으로 추가되었습니다.");
        setNewUserData({ email: "", new_passwd: "" });
        setTimeout(() => {
          setAddUserMessage("");
          setShowAddUser(false);
        }, 3000);
      }
    } catch (err) {
      setAddUserMessage("사용자 추가 중 오류가 발생했습니다.");
      console.error("Add user failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-end bg-gradient-to-b from-blue-50 to-[#f8e8d8] p-6">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-40 mb-6 rounded-full bg-[#f8e8d8] flex items-center justify-center p-4">
            <img
              src="/images/coding-sloth.png"
              alt="Coding Sloth"
              className="w-32 h-32 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            OpenAry~ 자료를 찾아줘
          </h2>
          <p className="text-sm text-gray-600">
            나무늘보와 함께 지식을 검색해봐요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white text-sm font-medium transition-all duration-200 ease-in-out
              ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
          >
            {isLoading ? (
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
                로그인 중...
              </span>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showAddUser ? "← 로그인으로 돌아가기" : "새 사용자 추가 →"}
          </button>
        </div>

        {showAddUser && (
          <form onSubmit={handleAddUser} className="mt-6 space-y-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="newEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  새 사용자 이메일
                </label>
                <input
                  id="newEmail"
                  name="email"
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  placeholder="새 사용자의 이메일을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  새 비밀번호
                </label>
                <input
                  id="newPassword"
                  name="password"
                  type="password"
                  required
                  value={newUserData.new_passwd}
                  onChange={handleNewUserChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-white text-sm font-medium bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
            >
              사용자 추가
            </button>
          </form>
        )}

        {addUserMessage && (
          <div className={`mt-4 p-4 rounded-lg ${
            addUserMessage.includes("성공")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            <p className="text-sm font-medium">{addUserMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}