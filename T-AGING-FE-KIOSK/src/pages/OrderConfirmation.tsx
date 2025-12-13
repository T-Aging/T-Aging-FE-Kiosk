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

  useEffect(() => {
    setTitle("주문 확인");

    // cart 요청
    getCart();

    // 안내 음성 1회만
    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS("마지막으로 주문 내역을 확인해주세요.");
    }
  }, [setTitle, getCart, playTTS, stopTTS]);

  // 화면 나갈 때 TTS 자동 중단
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleNext = () => {
    stopTTS();
    navigate("/order/complete", {
      state: { cart, totalPrice },
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[4vh]">
        <div className="mb-[3vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[25vw]" />
          <div className="rounded-2xl border bg-white px-[6vw] py-[2vh] text-[4vw] shadow-md">
            이대로 주문할까요?
          </div>
        </div>

        <div className="w-full rounded-2xl border bg-white px-[4vw] py-[3vh] shadow-md">
          <p className="mb-[3vh] text-[5vw] font-semibold">주문 내역</p>

          {cart.map((item) => (
            <div
              key={item.orderDetailId}
              className="flex items-center justify-between rounded-xl border px-[3vw] py-[2vh] shadow-sm"
            >
              <div>
                <p className="text-[4vw] font-semibold">{item.menuName}</p>
                <p className="text-[3vw] text-(--text-secondary)">
                  {item.temperature} / {item.size}
                </p>

                {item.options.map((opt) => (
                  <p
                    key={opt.optionValueId}
                    className="text-[3vw] text-(--text-secondary)"
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

          <div className="mt-[4vh] flex items-center justify-between border-t pt-[3vh]">
            <p className="text-[4vw]">총 결제 금액</p>
            <p className="text-[5vw] font-bold">
              {totalPrice?.toLocaleString()}원
            </p>
          </div>

          <button
            onClick={handleNext}
            className="mt-[2vh] w-full rounded-xl bg-(--color-primary) py-[2.4vh] text-[4.5vw] font-semibold text-white shadow-md active:scale-95"
          >
            다음으로
          </button>
        </div>
      </div>

      <div className="flex h-[10vh] items-center justify-between border-t bg-white px-[4vw]">
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
