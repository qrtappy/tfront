import { useState } from "react";

const WORKER = "https://tback.qrtappy.workers.dev";

export default function Login() {
  const [id, setId] = useState(localStorage.getItem("uniqueId") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("autoSave") === "true",
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!id || !password) return alert("아이디와 비밀번호를 입력해주세요.");

    setIsLoggingIn(true);

    try {
      // 폰 자체 내장 기능을 이용해 비밀번호를 SHA-256으로 암호화하는 함수
      const encodePassword = async (rawPassword: string) => {
        const msgBuffer = new TextEncoder().encode(rawPassword);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      };

      // 입력한 비밀번호를 전송/저장 전에 암호화 처리
      const encryptedPassword = await encodePassword(password);

      const res = await fetch(`${WORKER}/api/qr/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: encryptedPassword }), // 암호화된 비번 전송
      });

      if (res.ok) {
        localStorage.setItem("uniqueId", id);
        if (autoSave) {
          localStorage.setItem("password", encryptedPassword); // 암호화된 비번 저장
          localStorage.setItem("autoSave", "true");
        } else {
          localStorage.removeItem("password");
          localStorage.setItem("autoSave", "false");
        }
        // 방문 기록을 덮어써서 뒤로가기 시 로그인 창이 안 나오도록 수정
        window.history.replaceState(null, "", "/receive");
        window.location.reload();
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 select-none">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col relative shadow-xl overflow-hidden p-8 justify-center">
        <h1 className="text-center text-sm font-bold tracking-[0.2em] mb-8 text-gray-800">
          LOGIN
        </h1>

        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all mb-4 shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
          placeholder="ID ADDRESS"
        />

        <div className="w-full relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
            placeholder="PASSWORD"
          />
          <button
            type="button"
            className="absolute right-6 top-6 w-5 h-5 flex items-center justify-center active:scale-90"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img
              src={showPassword ? "/pass1.png" : "/pass2.png"}
              alt="Toggle Password"
              className="w-full h-full object-contain"
            />
          </button>
        </div>

        <label className="flex items-center gap-2 mb-8 text-[10px] text-gray-500 cursor-pointer pl-2">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
          />
          자동 저장
        </label>

        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-[65px] h-[65px] border-[3px] border-black rounded-full flex items-center justify-center group hover:bg-black active:bg-black transition-all duration-300 active:scale-90 shadow-md"
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
        </div>
      </div>
    </div>
  );
}
