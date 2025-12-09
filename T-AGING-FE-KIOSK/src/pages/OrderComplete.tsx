import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";
import { useKioskStore } from "@/store/useWebSocketStore";

const OrderComplete = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();
  const { playTTS, stopTTS } = useTTS();

  const sendSessionEnd = useKioskStore((s) => s.sendSessionEnd);

  const spokenRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setTitle("주문 완료");

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS("주문이 접수되었어요! 편한 자리에서 잠시만 기다려주세요!");
    }

    // 8초 후 세션 종료 + 홈 이동
    timerRef.current = setTimeout(() => {
      stopTTS();
      sendSessionEnd();
      navigate("/");
    }, 8000);

    return () => {
      stopTTS();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setTitle, playTTS, stopTTS, navigate, sendSessionEnd]);

  const goHome = () => {
    stopTTS();
    if (timerRef.current) clearTimeout(timerRef.current);
    sendSessionEnd();
    navigate("/");
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[8vh]">
        <div className="mb-[6vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[20vw]" />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[6vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-md">
            주문이 접수되었어요!
          </div>
        </div>

        <div className="flex w-full flex-col items-center rounded-2xl border border-(--border-light) bg-white px-[4vw] py-[4vh] shadow-md">
          <p className="text-[4vw] text-(--text-secondary)">대기번호</p>

          <p className="mt-[1vh] text-[15vw] leading-none font-bold text-(--text-primary)">
            27
          </p>

          <p className="mt-[4vh] text-center text-[4vw] leading-snug text-(--text-secondary)">
            주문하신 음료가 준비되면
            <br />
            화면과 음성으로 안내드릴게요
          </p>
        </div>

        <button
          onClick={goHome}
          className="mt-[5vh] w-[50vw] rounded-xl bg-(--color-primary) py-[2.6vh] text-[5vw] text-(--text-inverse) shadow-md active:scale-95"
        >
          처음으로 돌아가기
        </button>

        <p className="mt-[2vh] text-[3.5vw] text-(--text-secondary)">
          10초 후 자동으로 시작 화면으로 이동합니다
        </p>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[4vw]">
        <button
          className="text-[5vw] text-(--text-primary) opacity-40"
          disabled
        >
          ← 이전
        </button>

        <button className="rounded-xl bg-(--accent) px-[6vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default OrderComplete;
