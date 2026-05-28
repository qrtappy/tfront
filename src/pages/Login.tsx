// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WORKER = "https://tback.qrtappy.workers.dev";

export default function Login() {
  const navigate = useNavigate();

  const [id, setId] = useState(localStorage.getItem("uniqueId") || "");
  const [password, setPassword] = useState(
    localStorage.getItem("autoSave") === "true"
      ? localStorage.getItem("password") || ""
      : "",
  );
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("autoSave") === "true",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 재방문 시 자동 로그인

  useEffect(() => {
    const savedId = localStorage.getItem("uniqueId");
    const savedPw = localStorage.getItem("password");
    const savedAuto = localStorage.getItem("autoSave") === "true";

    if (savedId && savedPw && savedAuto) {
      handleAuth(savedId, savedPw);
    }
  }, []);

  const handleAuth = async (inputId: string, inputPw: string) => {
    if (!inputId || !inputPw) return;
    setIsLoading(true);
    setAuthError(false);

    try {
      const res = await fetch(`${WORKER}/api/qr/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inputId, password: inputPw }),
      });

      if (res.ok) {
        // localStorage 저장 (리시브 페이지 진입을 위해 password도 필수 저장)
        localStorage.setItem("uniqueId", inputId);
        localStorage.setItem("password", inputPw);

        if (autoSave) {
          localStorage.setItem("autoSave", "true");
        } else {
          localStorage.setItem("autoSave", "false");
        }
        // 사진함으로 이동
        navigate("/receive");
      } else {
        setAuthError(true);
      }
    } catch (error) {
      console.error("error:", error);
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 select-none">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col relative shadow-xl overflow-hidden">
        {/* 상단 URL 표시 */}
        <div className="p-6 pb-2 flex justify-center items-center relative z-10">
          <div className="w-full bg-gray-100 rounded-full px-4 py-2 border border-gray-200 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-mono truncate">
              {window.location.href}
            </span>
          </div>
        </div>

        {/* 로그인 폼 */}
        <div className="grow flex flex-col items-center justify-center p-8 bg-white">
          <div className="w-full max-w-[320px] flex flex-col items-center">
            {/* ID 입력 */}
            <input
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setAuthError(false);
              }}
              className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all mb-4 shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
              placeholder="ID ADDRESS"
            />

            {/* 비밀번호 입력 */}
            <div className="w-full relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAuth(id, password)}
                className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
                placeholder="PASSWORD"
              />
              {/* 눈 모양 아이콘 */}
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // 눈 닫힘
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  // 눈 열림
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* 자동저장 체크박스 */}
            <label className="flex items-center gap-2 mb-8 text-[10px] text-gray-500 cursor-pointer self-start ml-2">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => {
                  setAutoSave(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem("password");
                    localStorage.setItem("autoSave", "false");
                  }
                }}
                className="w-3 h-3"
              />
              자동 저장
            </label>

            {/* 화살표 버튼 */}
            <button
              onClick={() => handleAuth(id, password)}
              disabled={isLoading}
              className="w-[65px] h-[65px] border-[3px] border-black rounded-full flex items-center justify-center group hover:bg-black active:bg-black transition-all duration-300 active:scale-90 shadow-md disabled:opacity-50"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-black group-hover:stroke-white group-active:stroke-white transition-colors"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* 에러 메시지 */}
            {authError && (
              <p className="text-red-500 text-[10px] mt-6 font-bold tracking-tight">
                INVALID PASSWORD. PLEASE TRY AGAIN.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
