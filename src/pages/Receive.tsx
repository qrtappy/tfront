import { useState, useRef, useEffect } from "react";

const WORKER = "https://tback.qrtappy.workers.dev";

interface LogItem {
  id: string;
  src: string;
  displayTime?: string;
  timestamp?: number;
}

export default function Receive() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [zoomedLog, setZoomedLog] = useState<LogItem | null>(null);

  const isLongPress = useRef(false);
  const timerRef = useRef<number | null>(null);

  const currentUrl = window.location.href;

  const hiddenLogs: string[] =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hidden_logs") || "[]")
      : [];

  const triggerHaptic = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => console.log("서비스 워커 등록 완료!"))
        .catch((err) => console.error("등록 실패:", err));
    }
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get("id");

    const savedId = localStorage.getItem("uniqueId");
    const savedPw = localStorage.getItem("password"); // 실제 패스워드 대신 발행받은 입장권 사용

    if (urlId && savedId && urlId !== savedId) {
      alert("Another room is saved. Please log out first");
      return;
    }

    if (savedId && savedPw) {
      fetch(`${WORKER}/api/qr/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId, password: savedPw }), // 패스워드 입력칸에 안전하게 입장권 전달
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("인증 실패");
        })
        .then((data: { photos?: { key: string; uploaded: string }[] }) => {
          const photos = data.photos || [];
          const newLogs: LogItem[] = photos
            .map((p: { key: string; uploaded: string }) => ({
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
        })
        .catch((error) => {
          console.error("데이터 로드 실패:", error);
          window.location.href = "/login";
        });
    } else {
      window.location.href = "/login";
    }
  }, []);

  const toggleSelect = (logId: string) => {
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
    }, 1500);
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
      setZoomedLog(log);
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
        <div className="p-6 pb-2 flex justify-center items-center relative z-10">
          <div className="w-full bg-gray-100 rounded-full px-4 py-2 border border-gray-200 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-mono truncate">
              {currentUrl}
            </span>
          </div>
        </div>

        {/* 삼항연산자 분기 제거, 로그인 확인 없이 바로 데이터 목록 레이아웃을 렌더링 */}
        <div className="grow p-4 grid grid-cols-2 gap-2 content-start h-fit">
          {logs.map((log) => (
            <div
              key={log.id}
              onPointerDown={() => handlePointerDown(log.id)}
              onPointerUp={(e) => handlePointerUp(e, log)}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden transition-all select-none ${
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
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded-sm">
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
            <img src="/ICON2.png" alt="" className="object-contain" />
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

          {zoomedLog && (
            // 수정 후: top-0으로 변경하여 상단을 꽉 채움
            <div className="fixed top-0 left-0 right-0 bottom-[73px] bg-white z-30 flex items-center justify-center animate-fade-in">
              <div className="relative w-full max-w-[430px] p-4 h-full flex items-center justify-center">
                {/* 우측 상단 엑스 동그라미 닫기 버튼 */}
                <button
                  onClick={() => setZoomedLog(null)}
                  className="absolute top-6 right-6 z-40 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center shadow-md transition-colors"
                  aria-label="닫기"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>

                {/* 화면에 맞춰 온전히 확대되고 멈추는 사진 (클릭 전파 차단) */}
                <img
                  src={zoomedLog.src}
                  alt=""
                  className="w-full h-full object-contain rounded-lg shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
