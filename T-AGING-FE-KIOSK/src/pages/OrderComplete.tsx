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

  // 화면 나갈 때 TTS 자동 중단
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // order_confirm 응답 감지 → 대기번호 적용
  useEffect(() => {
    if (!lastReply || lastReply.type !== "order_confirm") return;

    const wNum = lastReply.waitingNum ?? null;
    setWaitingNum(wNum);

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS(`주문해주셔서 감사합니다! 주문 번호는 ${wNum}번입니다.`);
    }

    timerRef.current = setTimeout(() => {
      stopTTS();
      sendSessionEnd();
      resetState();
      navigate("/");
    }, 1000000000);
  }, [lastReply, playTTS, stopTTS, sendSessionEnd, resetState, navigate]);

  // 처음 화면으로 이동
  const goHome = () => {
    stopTTS();
    if (timerRef.current) clearTimeout(timerRef.current);
    sendSessionEnd();
    resetState();
    navigate("/");
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-(--bg-primary) px-[5vw] pt-[6vh]">
      <p className="text-center text-[6vw] font-bold">
        주문이 <br /> 완료되었습니다!
      </p>
      <p className="mt-[1vh] text-[4vw] text-(--text-secondary)">
        주문번호를 확인해주세요
      </p>

      {/* 정사각형 주문번호 박스 */}
      <div
        className="mt-[2vh] flex flex-col items-center justify-center rounded-4xl bg-[#f1f1f1] shadow-md"
        style={{
          width: "50vw",
          height: "50vw",
        }}
      >
        <p className="text-[4vw] text-(--text-secondary)">주문 번호</p>
        <p className="mt-[1vh] text-[14vw] font-bold text-blue-600">
          {waitingNum ?? "…"}
        </p>
      </div>

      {/* 마실이 + 말풍선 가운데 정렬 */}
      <div className="mt-[2vh] flex w-full items-center">
        <img src={masil} alt="masil" className="h-auto w-[40vw]" />

        <div className="rounded-xl bg-[#F9E7D2] px-[2vw] py-[2.5vh] text-left font-medium shadow-sm">
          <p className="text-[3.1vw] text-(--text-secondary)">
            메뉴가 나오면 주문번호가 호출됩니다
            <br />
            편한 자리에서 기다려주세요!
          </p>
        </div>
      </div>

      {/* 버튼 */}
      <button
        onClick={goHome}
        className="mt-[vh] w-[55vw] rounded-3xl bg-(--color-primary) py-[2.6vh] text-[5vw] text-white shadow-md active:scale-95"
      >
        처음으로 돌아가기
      </button>

      <p className="my-[2vh] text-[3.5vw] text-(--text-secondary)">
        10초 후 자동으로 처음 화면으로 돌아갑니다.
      </p>
    </div>
  );
};

export default OrderComplete;
