import { useState, useEffect } from "react";

export default function Home() {
  const [installEvent, setInstallEvent] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleInstallClick = () => {
    triggerHaptic();
    if (installEvent) {
      installEvent.prompt();
    } else {
      alert(
        "The app is already installed or your browser doesn't support installation.",
      );
    }
  };

  return (
    <main
      className="min-h-[100dvh] bg-[#F2C12E] flex flex-col items-center p-4 relative font-sans overflow-x-hidden"
      style={{ zoom: "0.8" }}
    >
      <div className="bg-[#F2C12E] rounded-3xl p-6 my-auto w-full max-w-[380px] flex flex-col items-center relative">
        <div className="text-center mb-2 w-full">
          <p className="text-white text-[15px] font-bold tracking-widest mb-1 opacity-90 uppercase">
            Your Secret QRCode
          </p>
          <h1 className="text-white text-6xl font-black tracking-widest mb-2 italic">
            TAPTAPQR
          </h1>
          <div className="relative w-full aspect-square max-w-[320px] mx-auto scale-110">
            <img
              src="/main22.png"
              alt="Mascot"
              className="object-contain px-4 w-full h-full"
            />
          </div>
        </div>
        <div className="w-full mt-4 flex flex-col items-center text-center text-white font-bold space-y-1">
          <p className="text-2xl font-black italic">Download now</p>
          <p className="text-lg opacity-90">protect your privacy.</p>
          <p className="text-sm opacity-80">
            Print your QR and use it anywhere.
          </p>
          <p className="text-sm opacity-80 pb-4">Auto-deleted in 24 hours.</p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleInstallClick}
              className="group rounded-full p-4 active:scale-95 transition-all duration-300 shadow-lg flex items-center justify-center w-[80px] h-[80px] bg-white hover:bg-black"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-[#FDBE19] group-hover:stroke-white transition-colors"
                strokeWidth="5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
