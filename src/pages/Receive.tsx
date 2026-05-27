import { useState, useRef } from "react";

const WORKER = "https://tback.qrtappy.workers.dev";

interface LogItem {
  id: string;
  src: string;
  displayTime?: string;
  timestamp?: number;
}

export default function Receive() {
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState(localStorage.getItem("uniqueId") || "");
  const [password, setPassword] = useState(
    localStorage.getItem("autoSave") === "true"
      ? localStorage.getItem("password") || ""
      : "",
  );
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("autoSave") === "true",
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [viewDetail, setViewDetail] = useState<string | null>(null);

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

  const handleAuth = async (inputPw: string) => {
    if (!inputPw || !id) return;
    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const res = await fetch(`${WORKER}/api/qr/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: inputPw }),
      });

      if (res.ok) {
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

        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }

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
        setIsAuthenticated(true);
        localStorage.setItem("uniqueId", id);
        if (autoSave) {
          localStorage.setItem("password", inputPw);
          localStorage.setItem("autoSave", "true");
        } else {
          localStorage.removeItem("password");
          localStorage.setItem("autoSave", "false");
        }
      } else {
        setAuthError(true);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

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
        <div className="p-6 pb-2 flex justify-center items-center relative z-10">
          <div className="w-full bg-gray-100 rounded-full px-4 py-2 border border-gray-200 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-mono truncate">
              {currentUrl}
            </span>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="grow flex flex-col items-center justify-center p-8 bg-white z-[60]">
            <div className="w-full max-w-[320px] flex flex-col items-center">
              <input
                type="text"
                value={id}
                onChange={(e) => {
                  triggerHaptic();
                  setId(e.target.value);
                }}
                className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all mb-4 shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
                placeholder="ID ADDRESS"
              />

              <div className="w-full relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    triggerHaptic();
                    setPassword(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth(password)}
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-5 text-center text-sm focus:outline-none focus:border-gray-400 transition-all shadow-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
                  placeholder="PASSWORD"
                />
                <button
                  type="button"
                  className="absolute right-4 top-5 text-[10px] text-gray-400 uppercase"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              <label className="flex items-center gap-2 mb-8 text-[10px] text-gray-500 cursor-pointer">
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
                />
                자동 저장
              </label>
              <button
                onClick={() => handleAuth(password)}
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
              {authError && (
                <p className="text-red-500 text-[10px] mt-6 font-bold tracking-tight">
                  INVALID PASSWORD. PLEASE TRY AGAIN.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grow p-4 grid grid-cols-4 gap-2 h-fit">
            {logs.map((log) => (
              <div
                key={log.id}
                onPointerDown={() => handlePointerDown(log.id)}
                onPointerUp={(e) => handlePointerUp(e, log)}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border transition-all select-none ${
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
        )}

        {viewDetail && (
          <div className="fixed inset-0 bg-white/95 z-[40] flex flex-col items-center justify-center p-4 pb-32">
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

          {/* 아이콘 2 */}
          <button
            onClick={() => {
              triggerHaptic();
              setIsDeleteMode(false);
              setSelectedIds([]);
            }}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <img
              src="/icon2.png"
              alt=""
              width={25}
              height={25}
              className="object-contain"
            />
          </button>

          {/* 아이콘 4 */}
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
