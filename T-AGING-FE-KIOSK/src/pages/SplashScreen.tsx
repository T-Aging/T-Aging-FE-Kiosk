import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useKioskStore } from "@/store/useWebSocketStore";
import { useTTS } from "@/hooks/useTTS";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();
  const connect = useKioskStore((s) => s.connect);
  const { playTTS } = useTTS();

  const startedRef = useRef(false);

  useEffect(() => {
    setTitle("마실이 키오스크");
  }, [setTitle]);

  const handleStart = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    connect();

    playTTS("마실이 키오스크에 오신 걸 환영합니다!", () => {
      navigate("/membership");
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={masil} alt="masil-logo" className="mb-6 h-[60vw] w-[60vw]" />

        <h1 className="mb-2 text-[12vw] font-semibold text-(--text-primary)">
          환영합니다
        </h1>

        <p className="mb-10 text-center text-[6vw] leading-tight text-(--text-secondary)">
          주문을 시작하려면 <br /> 화면을 터치하세요
        </p>

        <button
          onClick={handleStart}
          className="rounded-xl bg-(--color-primary) px-12 py-4 text-[8vw] font-medium text-(--text-inverse) shadow-md transition active:scale-95"
        >
          주문 시작하기
        </button>
      </div>

      {/* FOOTER */}
      <footer className="flex h-[10vh] w-full items-center justify-start pl-[3vw] text-[4.5vw] text-(--text-tertiary)">
        🔊 음성 안내 중입니다
      </footer>
    </div>
  );
};

export default SplashScreen;
