// src/pages/Admin/QR.tsx
// QR 코드 생성 전용 페이지

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";

const WORKER = "https://tback.qrtappy.workers.dev";
const SITE_URL = "https://taptapq.com";

// ── 타입 ─────────────────────────────────────────────────
interface QRSession {
  date: string; // 생성 날짜
  count: number; // 요청 개수
  success: number; // 성공 개수
  ids: string[]; // uniqueId 목록
}

interface HiddenQRProps {
  id: string;
  url: string;
  onReady: (id: string, png: string) => void;
}

// ── 숨겨진 QR Canvas (PNG 추출용) ────────────────────────
function HiddenQR({ id, url, onReady }: HiddenQRProps) {
  return (
    <div style={{ position: "absolute", left: -9999, top: -9999 }}>
      <QRCodeCanvas
        id={`qr-${id}`}
        value={url}
        size={512}
        level="M"
        includeMargin={true}
        imageSettings={{
          src: "/icon-192x192.png",
          height: 80,
          width: 80,
          excavate: true,
          x: 216,
          y: 216,
        }}
        ref={() => {
          setTimeout(() => {
            const canvas = document.getElementById(
              `qr-${id}`,
            ) as HTMLCanvasElement;
            if (canvas) onReady(id, canvas.toDataURL("image/png"));
          }, 50);
        }}
      />
    </div>
  );
}

export default function AdminQR() {
  const navigate = useNavigate();

  // 로그인 확인
  useEffect(() => {
    if (!sessionStorage.getItem("admin_auth")) navigate("/admin");
  }, [navigate]);

  const [adminKey, setAdminKey] = useState("");
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessions, setSessions] = useState<QRSession[]>([]);
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const [pngMap, setPngMap] = useState<Record<string, string>>({});
  const [zipping, setZipping] = useState(false);

  const pngMapRef = useRef<Record<string, string>>({});
  const totalRef = useRef(0);

  // ── QR 생성 ───────────────────────────────────────────
  const handleGenerate = async () => {
    if (!adminKey) return alert("x-admin-secret 키를 입력해주세요.");
    if (count < 1 || count > 500)
      return alert("1~500 사이 숫자를 입력해주세요.");

    setGenerating(true);
    setProgress(0);
    setPngMap({});
    pngMapRef.current = {};
    totalRef.current = count;

    const date = new Date().toLocaleString("ko-KR");

    // uniqueId 배열 한 번에 생성
    const ids = Array.from({ length: count }, () =>
      crypto.randomUUID().replace(/-/g, "").toUpperCase(),
    );

    try {
      // Worker에 한 덩어리로 전송 — D1 batch + KV 병렬 1회
      const res = await fetch(`${WORKER}/api/qr/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminKey,
        },
        body: JSON.stringify({ ids }),
      });

      const result = (await res.json()) as {
        success: boolean;
        registered?: number;
        message?: string;
      };

      // 세션 기록
      setSessions((prev) => [
        {
          date,
          count,
          success: result.success ? (result.registered ?? 0) : 0,
          ids,
        },
        ...prev,
      ]);

      if (!result.success) {
        alert(`등록 실패: ${result.message}`);
        setGenerating(false);
        return;
      }

      // Canvas QR 렌더링 시작
      setCurrentIds(ids);
    } catch {
      alert("서버 오류가 발생했습니다.");
      setGenerating(false);
    }
  };

  // ── PNG 준비 콜백 ─────────────────────────────────────
  const handleQRReady = (id: string, png: string) => {
    pngMapRef.current[id] = png;
    const ready = Object.keys(pngMapRef.current).length;
    setProgress(Math.round((ready / totalRef.current) * 100));
    setPngMap({ ...pngMapRef.current });
    if (ready === totalRef.current) setGenerating(false);
  };

  // ── ZIP 압축 다운로드 ─────────────────────────────────
  const downloadZip = async () => {
    if (!currentIds.length) return;
    setZipping(true);

    const zip = new JSZip();
    const folder = zip.folder("QR_codes");

    currentIds.forEach((id) => {
      const png = pngMapRef.current[id];
      if (!png || !folder) return;
      // base64 데이터만 추출
      const base64 = png.split(",")[1];
      folder.file(`QR_${id}.png`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${new Date().toISOString().slice(0, 10)}_${currentIds.length}개.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setZipping(false);
  };

  // ── 총 생성 개수 ──────────────────────────────────────
  const totalGenerated = sessions.reduce((sum, s) => sum + s.success, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 숨겨진 QR Canvas */}
      {currentIds.map((id) => (
        <HiddenQR
          key={id}
          id={id}
          url={`${SITE_URL}/send?id=${id}`}
          onReady={handleQRReady}
        />
      ))}

      {/* 헤더 */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-800">📋 QR 생성</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/stickers")}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200"
          >
            스티커 관리
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

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* 총 생성 개수 */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 flex justify-between items-center">
          <div>
            <div className="text-sm opacity-80">총 생성된 QR 개수</div>
            <div className="text-4xl font-black">
              {totalGenerated.toLocaleString()}
            </div>
          </div>
          <div className="text-6xl opacity-20">📱</div>
        </div>

        {/* QR 생성 입력 */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-lg font-bold mb-4">새 QR 생성</h2>
          <div className="flex gap-3 flex-wrap">
            <input
              type="password"
              placeholder="x-admin-secret 키"
              className="flex-1 min-w-[200px] p-3 border rounded-xl text-sm outline-none focus:border-blue-400"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
            <div className="flex items-center gap-2 border rounded-xl px-4">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                개수
              </span>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-20 p-2 text-sm outline-none text-center"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`px-8 py-3 rounded-xl text-white font-bold transition-all ${generating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {generating ? `생성 중... ${progress}%` : "생성"}
            </button>
          </div>

          {/* 진행바 */}
          {generating && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>PNG 생성 중...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 다운로드 버튼 */}
          {currentIds.length > 0 && !generating && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={downloadZip}
                disabled={
                  zipping || Object.keys(pngMap).length < currentIds.length
                }
                className={`px-6 py-3 rounded-xl text-white font-bold transition-all ${zipping ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
              >
                {zipping
                  ? "압축 중..."
                  : `📦 ZIP 다운로드 (${currentIds.length}개)`}
              </button>
            </div>
          )}
        </div>

        {/* 생성 히스토리 */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold">생성 히스토리</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-gray-500 font-medium">
                    생성 날짜
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    요청
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    성공
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-gray-600">{s.date}</td>
                    <td className="p-4 text-center font-mono">{s.count}</td>
                    <td className="p-4 text-center font-mono text-green-600">
                      {s.success}
                    </td>
                    <td className="p-4 text-center">
                      {s.success === s.count ? (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                          ✅ 성공
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                          ❌ 실패
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
