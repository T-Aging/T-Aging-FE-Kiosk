import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";
import { useKioskStore } from "@/store/useWebSocketStore";

const OrderComplete = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  const { playTTS, stopTTS } = useTTS();

  const orderConfirm = useKioskStore((s) => s.orderConfirm);
  const lastReply = useKioskStore((s) => s.lastReply); // order_confirm 수신
  const sendSessionEnd = useKioskStore((s) => s.sendSessionEnd);

  // 상태 전체 초기화
  const resetState = useKioskStore((s) => s.resetState);

  const [waitingNum, setWaitingNum] = useState<number | null>(null);

  const spokenRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // 페이지 진입 시 서버에 주문 확정 요청
  useEffect(() => {
    setTitle("주문 완료");
    orderConfirm();
  }, [setTitle, orderConfirm]);

  // order_confirm 응답 감지 → 대기번호 적용
  useEffect(() => {
    if (!lastReply || lastReply.type !== "order_confirm") return;

    const wNum = lastReply.waitingNum ?? null;
    setWaitingNum(wNum);

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS(`주문이 접수되었어요. 대기번호는 ${wNum}번입니다.`);
    }

    timerRef.current = setTimeout(() => {
      stopTTS();
      sendSessionEnd();
      resetState(); // 자동 이동 시 상태 초기화
      navigate("/");
    }, 10000);
  }, [lastReply, playTTS, stopTTS, sendSessionEnd, resetState, navigate]);

  // 버튼 클릭 → 처음 화면으로 이동
  const goHome = () => {
    stopTTS();
    if (timerRef.current) clearTimeout(timerRef.current);
    sendSessionEnd();
    resetState(); // 버튼 이동 시도 상태 초기화
    navigate("/");
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[8vh]">
        <div className="mb-[6vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[20vw]" />
          <div className="rounded-2xl border bg-white px-[6vw] py-[2vh] text-[4vw] shadow-md">
            주문이 접수되었어요.
          </div>
        </div>

        <div className="flex w-full flex-col items-center rounded-2xl border bg-white px-[4vw] py-[4vh] shadow-md">
          <p className="text-[4vw] text-(--text-secondary)">대기번호</p>

          <p className="mt-[1vh] text-[15vw] font-bold">{waitingNum ?? "…"}</p>

          <p className="mt-[4vh] text-center text-[4vw] text-(--text-secondary)">
            주문하신 음료가 준비되면
            <br />
            화면과 음성으로 안내해드립니다.
          </p>
        </div>

        <button
          onClick={goHome}
          className="mt-[5vh] w-[50vw] rounded-xl bg-(--color-primary) py-[2.6vh] text-[5vw] text-white shadow-md active:scale-95"
        >
          처음으로 돌아가기
        </button>

        <p className="mt-[2vh] text-[3.5vw] text-(--text-secondary)">
          10초 후 자동으로 시작 화면으로 이동합니다.
        </p>
      </div>
    </div>
  );
};

export default OrderComplete;
