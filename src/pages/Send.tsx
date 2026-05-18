import { useState, useRef, useEffect } from "react";

const WORKER = "https://tback.qrtappy.workers.dev";

export default function Send() {
  const [icons, setIcons] = useState<
    { src: string; link: string; id: number }[]
  >([]);
  const [selectedIconId, setSelectedIconId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
    fetch(`${WORKER}/api/admin`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data?.stickers?.urls) {
          setIcons(
            data.stickers.urls.map((url: string, i: number) => ({
              id: i,
              src: url || "/default-sticker.png",
              link: data.stickers.links?.[i] || "",
            })),
          );
        }
      });
  }, []);

  useEffect(() => {
    if (!previewImage) {
      const startCamera = async () => {
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
          console.error("카메라 접근 실패:", err);
        }
      };
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setTimeout(() => setStream(null), 0);
      }
    }
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [previewImage]);

  const capturePhoto = () => {
    triggerHaptic();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const scale = 1024 / video.videoWidth;
      canvas.width = 1024;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPreviewImage(canvas.toDataURL("image/jpeg", 0.7));
      }
    }
  };

  const handleSend = async () => {
    triggerHaptic();
    if (!previewImage) return alert("Take a photo");
    const targetId = new URLSearchParams(window.location.search).get("id");
    if (!targetId) return alert("No ID");
    setUploading(true);
    try {
      const response = await fetch(`${WORKER}/api/send-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: previewImage, targetId }),
      });
      if (!response.ok) throw new Error("서버 전송 실패");
      alert("complete");
      setPreviewImage(null);
    } catch (error) {
      console.error("전송 실패:", error);
      alert("failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-white antialiased select-none">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col relative shadow-2xl">
        <div className="px-6 mt-10 mb-6 relative z-10">
          <div
            onClick={() => !previewImage && capturePhoto()}
            className="relative w-full aspect-square bg-gray-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden shadow-inner"
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-xs bg-black/40 px-3 py-1 rounded-full">
                    Click
                  </span>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex-grow overflow-y-auto p-6 pt-2 pb-32">
          <div className="grid grid-cols-3 gap-4">
            {icons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  if (icon.link) window.open(icon.link, "_blank");
                }}
                className={`relative aspect-square bg-white rounded-2xl transition-all border hover:border-[#F9D015] hover:scale-105 hover:z-20 cursor-pointer ${
                  selectedIconId === icon.id
                    ? "border-[#F9D015] scale-105 shadow-md z-20"
                    : "border-transparent"
                }`}
              >
                <img
                  src={icon.src}
                  alt="sticker"
                  className="object-contain p-2 w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 flex justify-between items-center px-10 py-6 z-50 h-[80px]">
          <button
            onClick={() => {
              triggerHaptic();
              window.history.back();
            }}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <img
              src="/icon6.png"
              alt="Back"
              className="object-contain w-full h-full"
            />
          </button>
          <button
            onClick={handleSend}
            disabled={uploading}
            className={`w-[30px] h-[30px] relative active:scale-90 ${uploading ? "opacity-30" : ""}`}
          >
            <img
              src="/ICON2.png"
              alt="Send"
              className="object-contain w-full h-full"
            />
          </button>
          <button
            onClick={() => {
              triggerHaptic();
              setPreviewImage(null);
              setSelectedIconId(null);
            }}
            className="w-[25px] h-[25px] relative active:scale-90"
          >
            <img
              src="/ICON3.png"
              alt="Reset"
              className="object-contain w-full h-full"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
