// src/pages/Admin/Stickers.tsx
// 스티커 관리 전용 페이지

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WORKER = "https://tback.qrtappy.workers.dev";

export default function AdminStickers() {
  const navigate = useNavigate();

  // 로그인 확인
  useEffect(() => {
    if (!sessionStorage.getItem("admin_auth")) navigate("/admin");
  }, [navigate]);

  const [stickers, setStickers] = useState({
    urls: Array(12).fill(""),
    links: Array(12).fill(""),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 스티커 불러오기
  useEffect(() => {
    fetch(`${WORKER}/api/admin`)
      .then((r) => r.json())
      .then((d: any) => {
        if (d?.stickers) setStickers(d.stickers);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateSticker = (i: number, field: "urls" | "links", value: string) => {
    const next = { ...stickers };
    next[field][i] = value;
    setStickers(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${WORKER}/api/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "stickers", data: stickers }),
      });
      alert("저장 완료!");
    } catch {
      alert("저장 실패. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-800">🎨 스티커 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/qr")}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200"
          >
            QR 생성
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-xl text-white text-sm font-bold transition-all ${saving ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {saving ? "저장 중..." : "전체 저장"}
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate("/admin");
            }}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-sm text-gray-500 mb-6">
          Send 페이지에 표시될 광고 스티커를 관리합니다. 이미지 URL과 클릭 시
          이동할 링크를 입력하세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow space-y-3">
              {/* 스티커 번호 + 미리보기 */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Sticker #{i + 1}
                </span>
                {stickers.urls[i] ? (
                  <img
                    src={stickers.urls[i]}
                    alt={`sticker-${i + 1}`}
                    className="w-10 h-10 object-contain rounded-lg border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">
                    🖼️
                  </div>
                )}
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  이미지 URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  value={stickers.urls[i]}
                  onChange={(e) => updateSticker(i, "urls", e.target.value)}
                />
              </div>

              {/* 링크 URL */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  클릭 링크
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  value={stickers.links[i]}
                  onChange={(e) => updateSticker(i, "links", e.target.value)}
                />
              </div>

              {/* 비어있으면 표시 */}
              {!stickers.urls[i] && !stickers.links[i] && (
                <div className="text-center text-xs text-gray-300 py-1">
                  비어있음
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
