import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useKioskStore } from "@/store/useWebSocketStore";
import { useTTS } from "@/hooks/useTTS";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  const { cart, totalPrice, getCart } = useKioskStore();
  const { playTTS, stopTTS } = useTTS();

  const spokenRef = useRef(false);

  // 초기 설정 및 음성 재생
  useEffect(() => {
    setTitle("주문 확인");
    getCart();

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS("마지막으로 주문 내역을 확인해주세요. ");
    }
  }, [setTitle, getCart, playTTS]);

  // 화면 이탈 시 음성 중단
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 주문 완료 화면 이동
  const handleNext = () => {
    stopTTS();
    navigate("/order/complete", {
      state: { cart, totalPrice },
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-(--bg-primary)">
      {/* 상단 헤더 고정 */}
      <div className="flex items-center justify-center gap-[3vw] px-[4vw] pt-[1vh]">
        <img src={masil} alt="masil" className="h-auto w-[25vw]" />
        <div className="rounded-2xl border bg-white px-[6vw] py-[2vh] text-[4vw] shadow-md">
          화면을 아래로 천천히 내려서 <br /> 주문 내역을 확인해 주세요.
        </div>
      </div>

      {/* 주문 내역 스크롤 */}
      <div className="flex-1 overflow-y-auto px-[4vw] pb-[26vh]">
        <div className="w-full rounded-2xl bg-white px-[4vw] py-[3vh] shadow-md">
          {cart.map((item) => (
            <div
              key={item.orderDetailId}
              className="mb-[2vh] flex items-center justify-between rounded-xl border px-[5vw] py-[2vh] shadow-sm"
            >
              <div>
                <p className="text-[4.5vw] font-semibold">{item.menuName}</p>
                <p className="text-[3.5vw] text-(--text-secondary)">
                  {item.temperature} / {item.size}
                </p>

                {item.options.map((opt) => (
                  <p
                    key={opt.optionValueId}
                    className="text-[3.5vw] text-(--text-secondary)"
                  >
                    + {opt.optionValueName} ({opt.extraPrice}원)
                  </p>
                ))}
              </div>

              <p className="text-[4vw] font-semibold">
                {item.lineTotalPrice.toLocaleString()}원
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 총 금액 + 다음 버튼 고정 */}
      <div className="fixed bottom-[10vh] left-0 w-full border-t bg-white px-[4vw] py-[1.5vh] shadow-md">
        <div className="mb-[1.5vh] flex items-center justify-between">
          <p className="text-[4vw]">총 결제 금액</p>
          <p className="text-[6vw] font-bold">
            {totalPrice?.toLocaleString()}원
          </p>
        </div>

        <button
          onClick={handleNext}
          className="w-full rounded-xl bg-(--color-primary) py-[2.4vh] text-[4.5vw] font-semibold text-white shadow-md active:scale-95"
        >
          다음으로
        </button>
      </div>

      {/* 하단 footer 고정 */}
      <div className="fixed bottom-0 left-0 flex h-[10vh] w-full items-center justify-between border-t bg-white px-[4vw]">
        <button
          onClick={() => {
            stopTTS();
            navigate(-1);
          }}
          className="text-[5vw]"
        >
          ← 이전
        </button>

        <button className="rounded-xl bg-(--accent) px-[6vw] py-[2vh] text-[5vw] text-white">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
