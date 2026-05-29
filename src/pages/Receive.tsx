// src/pages/Receive.tsx
// 로그인 부분 제거 — 나머지 기능 그대로 유지
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WORKER = "https://tback.qrtappy.workers.dev";

interface LogItem {
  id: string;
  src: string;
  displayTime?: string;
  timestamp?: number;
}

export default function Receive() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [viewDetail, setViewDetail] = useState<string | null>(null);

  const isLongPress = useRef(false);
  const timerRef = useRef<number | null>(null);

  const hiddenLogs: string[] = JSON.parse(
    localStorage.getItem("hidden_logs") || "[]",
  );

  const triggerHaptic = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  // 2. 이제 loadPhotos 함수가 온전히 시작됨
  const loadPhotos = async (uniqueId: string) => {
    const savedPw = localStorage.getItem("password") || "";
    if (!savedPw) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${WORKER}/api/qr/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: uniqueId, password: savedPw }),
      });

      if (!res.ok) {
        // 비번 틀리면 로그인 페이지로
        navigate("/login");
        return;
      }

      interface Photo {
        key: string;
        uploaded: string;
        url: string;
      }
      interface ReceiveResponse {
        firstTime: boolean;
        photos: Photo[];
        nextCursor: string | null;
      }

      const data = (await res.json()) as ReceiveResponse;
      const photos = data.photos || [];

      const newLogs: LogItem[] = photos
        .map((p: Photo) => ({
          id: p.key,
          src: `${WORKER}/api/photo/view/${encodeURIComponent(p.key)}`,
          displayTime: new Date(p.uploaded).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: new Date(p.uploaded).getTime(),
        }))
        .filter((log: LogItem) => !hiddenLogs.includes(log.id));

      setLogs(newLogs);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem("uniqueId");
    const currentUrl = decodeURIComponent(window.location.href);

    // 🚨 다른 방 주소(유저 ID)로 강제 진입 시 카톡식 원천 차단
    if (savedId && !currentUrl.includes(savedId)) {
      alert("Only one room allowed.");
      navigate("/login"); // 즉시 로그인 페이지로 튕겨내기
      return;
    }

    if (!savedId) {
      navigate("/login");
      return;
    }
    // 이제 에러 없이 정상 호출됩니다.
    const fetchAsync = async () => {
      await loadPhotos(savedId);
    };
    fetchAsync();
  }, [navigate]);

  const toggleSelect = (logId: string) => {
    triggerHaptic();
    setSelectedIds((prev) =>
      prev.includes(logId) ? prev.filter((i) => i !== logId) : [...prev, logId],
    );
  };

  const handlePointerDown = (logId: string) => {
    isLongPress.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setIsDeleteMode(true);
      toggleSelect(logId);
    }, 500);
  };

  const handlePointerUp = (e: React.PointerEvent, log: LogItem) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (isLongPress.current) {
      e.preventDefault();
      return;
    }
    if (isDeleteMode) {
      toggleSelect(log.id);
    } else {
      triggerHaptic();
      setViewDetail(log.src);
    }
  };

  const handleDelete = () => {
    triggerHaptic();
    if (selectedIds.length === 0) return;
    setLogs(logs.filter((l) => !selectedIds.includes(l.id)));
    const currentHidden = JSON.parse(
      localStorage.getItem("hidden_logs") || "[]",
    );
    localStorage.setItem(
      "hidden_logs",
      JSON.stringify([...currentHidden, ...selectedIds]),
    );
    setSelectedIds([]);
    setIsDeleteMode(false);
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

        {/* 사진 그리드 */}

        <div className="grow p-4 grid grid-cols-4 gap-2 h-fit">
          {logs.map((log) => (
            <div
              key={log.id}
              //  이미 상단에 완벽하게 만들어 두신 원래의 포인터 함수들로 연결합니다.
              onPointerDown={() => handlePointerDown(log.id)}
              onPointerUp={(e) => handlePointerUp(e, log)}
              onContextMenu={(e) => e.preventDefault()} // 모바일 우클릭 메뉴 방지
              className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border transition-all select-none [-webkit-tap-highlight-color:transparent] ${
                selectedIds.includes(log.id)
                  ? "ring-2 ring-[#F9D015] scale-95"
                  : ""
              }`}
            >
              <img
                src={log.src}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                {log.displayTime}
              </div>
              {isDeleteMode && (
                <div className="absolute top-1 left-1 w-6 h-6 rounded-full border-2 border-white bg-black/20 flex items-center justify-center">
                  {selectedIds.includes(log.id) && (
                    <div className="w-4 h-4 bg-[#F9D015] rounded-full text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 사진 확대 */}
        {viewDetail && (
          <div className="fixed inset-0 bg-white/95 z-[70] flex flex-col items-center justify-center p-4 pb-32">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic();
                setViewDetail(null);
              }}
              className="absolute top-10 right-8 w-12 h-12 bg-gray-200/50 rounded-full text-2xl font-bold z-[110] flex items-center justify-center active:scale-90"
            >
              ✕
            </button>
            <div
              className="relative w-full h-full max-w-[430px]"
              onClick={() => setViewDetail(null)}
            >
              <img
                src={viewDetail}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 flex justify-between items-center px-10 py-6 z-50">
          <button
            onClick={() => {
              triggerHaptic();
              if (isDeleteMode) {
                setIsDeleteMode(false);
                setSelectedIds([]);
              } else {
                window.history.back();
              }
            }}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <img
              src="/icon6.png"
              alt=""
              width={25}
              height={25}
              className="object-contain"
            />
          </button>
          <button
            onClick={() => {
              triggerHaptic();
              setIsDeleteMode(false);
              setSelectedIds([]);
            }}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <img
              src="/ICON2.png"
              alt=""
              width={25}
              height={25}
              className="object-contain"
            />
          </button>
          <button
            onClick={handleDelete}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <img
              src="/ICON4.png"
              alt=""
              width={25}
              height={25}
              className="object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
