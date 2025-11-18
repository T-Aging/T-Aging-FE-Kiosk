import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("마실이 키오스크");
  }, [setTitle]);

  const handleStart = () => {
    navigate("/membership");
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-(--bg-primary)">
      <img
        src="src/assets/images/masil.png"
        alt="masil-logo"
        className="mb-6 h-[50vw] w-[50vw]"
      />

      <h1 className="text-[6rem] font-semibold text-(--text-primary) mb-2">
        환영합니다
      </h1>

      <p className="text-[3rem] text-(--text-secondary) mb-10 text-center leading-tight">
        주문을 시작하려면 <br /> 화면을 터치하세요
      </p>

      <button
        onClick={handleStart}
        className="bg-(--color-primary) text-(--text-inverse) text-[3rem] font-medium
        px-12 py-4 rounded-xl shadow-md active:scale-95 transition"
      >
        주문 시작하기
      </button>

      <footer className="h-[12vh] flex items-center justify-center text-[3vw] text-(--text-tertiary)">
        🔊 음성 안내 중입니다
      </footer>
    </div>
  );
};

export default SplashScreen;
