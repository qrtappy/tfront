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

  useEffect(() => {
    const handleHardwareBack = () => {
      navigate(-1);
    };

    window.addEventListener("popstate", handleHardwareBack);
    return () => {
      window.removeEventListener("popstate", handleHardwareBack);
    };
  }, [navigate]);

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
              {/* 눈 모양 아이콘 -> public 폴더 안의 pass1.png / pass2.png 이미지로 교체 */}
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // 비밀번호 보일 때: pass1.png
                  <img
                    src="/pass1.png"
                    alt="비밀번호 보이기"
                    className="w-[20px] h-auto object-contain"
                  />
                ) : (
                  // 비밀번호 안 보일 때: pass2.png
                  <img
                    src="/pass2.png"
                    alt="비밀번호 숨기기"
                    className="w-[20px] h-auto object-contain"
                  />
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
