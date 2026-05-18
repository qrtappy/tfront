import { useState } from "react";

const WORKER = "https://tback.qrtappy.workers.dev";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // QR 생성
  const [count, setCount] = useState(1);
  const [adminKey, setAdminKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<{ id: string }[]>([]);

  // 스티커
  const [stickers, setStickers] = useState({
    urls: Array(12).fill(""),
    links: Array(12).fill(""),
  });
  const [savingStickers, setSavingStickers] = useState(false);

  // 어드민 로그인
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
        setIsLoggedIn(true);
        // 스티커 불러오기
        fetch(`${WORKER}/api/admin`)
          .then((r) => r.json())
          .then((d: any) => {
            if (d?.stickers) setStickers(d.stickers);
          });
      } else {
        alert("비밀번호가 틀렸습니다!");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // QR 생성
  const generateQR = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${WORKER}/api/qr/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminKey,
        },
        body: JSON.stringify({ count }),
      });
      const result = (await res.json()) as { success: boolean; data: any[] };
      if (result.success) {
        setResults((prev) => [
          ...result.data.map((d: any) => ({ id: d.id })),
          ...prev,
        ]);
        alert(`${result.data.length}개 QR 생성 완료`);
      } else {
        alert("생성 실패. 시크릿 키를 확인하세요.");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setGenerating(false);
    }
  };

  // 스티커 저장
  const saveStickers = async () => {
    setSavingStickers(true);
    await fetch(`${WORKER}/api/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "stickers", data: stickers }),
    });
    setSavingStickers(false);
    alert("스티커 저장 완료!");
  };

  const updateSticker = (
    index: number,
    field: "urls" | "links",
    value: string,
  ) => {
    const newData = { ...stickers };
    newData[field][index] = value;
    setStickers(newData);
  };

  // 로그인 전
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
          <h1 className="text-2xl font-black mb-6 text-center text-gray-800">
            🔒 ADMIN LOGIN
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} text-white p-4 rounded-xl font-black active:scale-95 transition-all shadow-lg`}
            >
              {isLoading ? "로그인 중..." : "관리자 접속"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 로그인 후
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* QR 생성 */}
      <div className="bg-white rounded-2xl p-6 shadow mb-6">
        <h2 className="text-xl font-bold mb-4">📋 QR 생성</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="password"
            placeholder="x-admin-secret 키"
            className="flex-1 p-3 border rounded-xl text-sm outline-none"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <input
  type="password"
  placeholder="x-admin-secret 키"
  className="flex-1 p-3 border rounded-xl text-sm outline-none"
  value={adminKey}
  onChange={(e) => setAdminKey(e.target.value)}
/>
          <button
            onClick={generateQR}
            disabled={generating}
            className={`px-6 py-3 rounded-xl text-white font-bold ${generating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {generating ? "생성중..." : "생성"}
          </button>
        </div>
        {results.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">날짜</th>
                  <th className="p-3 text-left">ID</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 text-gray-500">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono text-blue-600">{item.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 스티커 관리 */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🎨 스티커 관리</h2>
          <button
            onClick={saveStickers}
            disabled={savingStickers}
            className={`px-6 py-3 rounded-xl text-white font-bold ${savingStickers ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {savingStickers ? "저장중..." : "전체 저장"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-gray-500">
                Sticker #{i + 1}
              </span>
              <input
                placeholder="이미지 URL"
                className="w-full p-2 border rounded-lg text-sm outline-none"
                value={stickers.urls[i]}
                onChange={(e) => updateSticker(i, "urls", e.target.value)}
              />
              <input
                placeholder="링크 URL"
                className="w-full p-2 border rounded-lg text-sm outline-none"
                value={stickers.links[i]}
                onChange={(e) => updateSticker(i, "links", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
