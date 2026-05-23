// src/pages/Admin/index.tsx
// 어드민 로그인 페이지

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WORKER = "https://tback.qrtappy.workers.dev";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { success: boolean };
      if (data.success) {
        // 세션에 로그인 상태 저장
        sessionStorage.setItem("admin_auth", "true");
        navigate("/admin/qr");
      } else {
        alert("비밀번호가 틀렸습니다!");
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-black mb-2 text-center text-gray-800">
          🔒 ADMIN
        </h1>
        <p className="text-center text-gray-400 text-sm mb-6">TapTapQ 관리자</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none text-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} text-white p-4 rounded-xl font-black transition-all shadow-lg`}
          >
            {isLoading ? "확인 중..." : "접속"}
          </button>
        </form>
      </div>
    </div>
  );
}
