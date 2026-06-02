// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { messaging, getToken } from "../firebase";

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

  // 1. 상태 변수 설정
  const [fcmToken, setFcmToken] = useState("");
  // 추가: 재요청 방지용 상태 (전송 클릭 시 딱 한 번만 권한 창을 띄우기 위함)
  const [hasRequested, setHasRequested] = useState(false);

  // 2. 토큰 발급 로직
  const requestPermission = async (isRetry = false) => {
    try {
      // 권한 요청 시도
      const permission = await Notification.requestPermission();
      if (permission === "granted" && messaging) {
        const token = await getToken(messaging, {
          vapidKey:
            "BB_EG243UCmE4XHpd1LkM4RsVLeqN-KXRayAomJPklo0rwEgDEhqcyOqep4Gh_b3O1FhecdsPsfDbaOYolwmY-4",
        });
        if (token) setFcmToken(token);
      } else if (isRetry) {
        // 전송 버튼 클릭 후의 재시도인 경우에만 경고
        alert("Turn on notifications to get updates");
      }
    } catch (e) {
      console.error("FCM 토큰 발급 실패", e);
    }
  };

  // 페이지 진입 시 최초 1회 요청
  useEffect(() => {
    const initializeNotification = async () => {
      await requestPermission();
    };

    initializeNotification();
  }, []);

  // 3. 로그인 함수 (로그인을 막지 않음)
  const handleAuth = async (inputId: string, inputPw: string) => {
    if (!inputId || !inputPw) return;

    // 토큰이 없는 경우에만 로직 수행
    if (!fcmToken) {
      if (!hasRequested) {
        // 전송 버튼 클릭 시 처음이라면 권한 요청 + 경고
        await requestPermission(true);
        setHasRequested(true);
      } else {
        // 이미 한번 시도했으면 경고 메시지만 출력
        alert("Notifications are off");
      }
    }

    // 알림 여부와 상관없이 로그인 프로세스 진행
    setIsLoading(true);
    setAuthError(false);

    try {
      const res = await fetch(`${WORKER}/api/qr/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: inputId,
          password: inputPw,
          token: fcmToken || null, // 토큰이 없으면 null 전달
        }),
      });

      if (res.ok) {
        localStorage.setItem("uniqueId", inputId);
        localStorage.setItem("password", inputPw);
        localStorage.setItem("autoSave", autoSave ? "true" : "false");
        navigate("/receive");
      } else {
        setAuthError(true);
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 select-none">
      {/* 배경색을 이미지와 동일한 노란색(#E9C043)으로 변경 */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#E9C043] flex flex-col relative shadow-xl overflow-hidden">
        {/* 상단 URL 표시 */}
        <div className="p-6 pb-2 flex justify-center items-center relative z-10">
          <div className="w-full bg-[#F8E297] rounded-full px-4 py-2 flex items-center justify-center shadow-sm">
            <span className="text-[10px] text-gray-400 font-mono truncate">
              {window.location.href}
            </span>
          </div>
        </div>

        {/* 로그인 폼 */}
        <div className="grow flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-[320px] flex flex-col items-center">
            {/* 꼬깔 이미지 및 타이틀 추가 */}
            <img
              src="/main22.png"
              alt="Cones"
              className="w-[140px] h-auto object-contain mb-6"
            />
            <span className="text-white text-[11px] font-bold tracking-[0.15em] uppercase mb-1 opacity-90">
              YOUR SECRET QRCODE
            </span>
            <h1 className="text-white text-4xl font-black italic tracking-wide mb-8">
              TAPTAPQR
            </h1>

            {/* ID 입력 (테두리 제거, 플레이스홀더 변경) */}
            <input
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setAuthError(false);
              }}
              className="w-full bg-white rounded-2xl px-6 py-5 text-center text-sm focus:outline-none transition-all mb-4 shadow-sm placeholder:text-sm placeholder:text-gray-300"
              placeholder="Unique ID"
            />

            {/* 비밀번호 입력 (테두리 제거, 플레이스홀더 변경) */}
            <div className="w-full relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAuth(id, password)}
                className="w-full bg-white rounded-2xl px-6 py-5 text-center text-sm focus:outline-none transition-all shadow-sm placeholder:text-sm placeholder:text-gray-300"
                placeholder="Password"
              />
              {/* 눈 모양 아이콘 (onMouseDown과 onTouchStart로 자판 유지 설정) */}
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={() => {
                  navigator.vibrate?.(10); // 약한 진동
                  setShowPassword(!showPassword); // 기본 클릭 토글로 복구
                }}
              >
                {showPassword ? (
                  <img
                    src="/pass1.png"
                    alt="비밀번호 보이기"
                    className="w-[20px] h-auto object-contain opacity-40"
                  />
                ) : (
                  <img
                    src="/pass2.png"
                    alt="비밀번호 숨기기"
                    className="w-[20px] h-auto object-contain opacity-40"
                  />
                )}
              </button>
            </div>

            {/* 자동저장 체크박스 (영문 Auto Save 변경 및 흰색 글씨화) */}
            <label className="flex items-center gap-2 mb-8 text-[11px] text-white font-medium cursor-pointer self-start ml-2">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => {
                  navigator.vibrate?.(10);
                  setAutoSave(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem("password");
                    localStorage.setItem("autoSave", "false");
                  }
                }}
                className="w-4 h-4 appearance-none bg-white rounded-[4px] border-0 cursor-pointer flex items-center justify-center checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-gray-700 checked:after:font-bold focus:outline-none"
              />
              Auto Save
            </label>

            {/* 화살표 버튼 (흰색 바탕, 커서/클릭 시 연한 회색 및 크기 확대 효과) */}
            <button
              onClick={() => {
                navigator.vibrate?.(10); // 약한 진동
                handleAuth(id, password);
              }}
              disabled={isLoading}
              className="w-[65px] h-[65px] bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 hover:scale-110 active:scale-110 shadow-md disabled:opacity-50"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-[#E9C043]"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* 에러 메시지 */}
            {authError && (
              <p className="text-red-600 text-[10px] mt-6 font-bold tracking-tight">
                INVALID PASSWORD. PLEASE TRY AGAIN.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
