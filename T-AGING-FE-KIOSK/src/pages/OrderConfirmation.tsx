import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";

type OrderItem = {
  id: number;
  name: string;
  detail: string;
  price: number;
};

const mockOrder: OrderItem[] = [
  { id: 1, name: "아메리카노", detail: "ICE / 연하게", price: 4500 },
  { id: 2, name: "샌드위치", detail: "햄 & 치즈", price: 5500 },
];

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("주문 확인");
  }, [setTitle]);

  const totalPrice = mockOrder.reduce((a, c) => a + c.price, 0);

  const handleConfirmOrder = () => {
    navigate("/order/complete", {
      state: { order: mockOrder, totalPrice },
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT — 스크롤 영역 */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[8vh]">
        {/* 상단: 마실 + 말풍선 */}
        <div className="mb-[5vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[25vw]" />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[6vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-md">
            이대로 주문할까요?
          </div>
        </div>

        {/* 주문 내역 카드 */}
        <div className="w-full rounded-2xl border border-(--border-light) bg-white px-[4vw] py-[3vh] shadow-md">
          <p className="mb-[3vh] text-[5vw] font-semibold text-(--text-primary)">
            주문 내역
          </p>

          <div className="flex flex-col gap-[2vh]">
            {mockOrder.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-(--border-soft) bg-white px-[3vw] py-[2vh] shadow-sm"
              >
                <div>
                  <p className="text-[4vw] font-semibold text-(--text-primary)">
                    {item.name}
                  </p>
                  <p className="text-[3vw] text-(--text-secondary)">
                    {item.detail}
                  </p>
                </div>
                <p className="text-[4vw] font-semibold text-(--text-primary)">
                  {item.price.toLocaleString()}원
                </p>
              </div>
            ))}
          </div>

          {/* 총 금액 */}
          <div className="mt-[4vh] flex items-center justify-between border-t border-(--border-light) pt-[3vh]">
            <p className="text-[4vw] text-(--text-primary)">총 결제 금액</p>
            <p className="text-[5vw] font-bold text-(--text-primary)">
              {totalPrice.toLocaleString()}원
            </p>
          </div>

          {/* 옵션 수정 */}
          <button
            onClick={() => navigate("/order")}
            className="mt-[3vh] w-full rounded-xl border border-(--border-light) bg-white py-[2.2vh] text-[4vw] text-(--text-primary) shadow-sm active:scale-95"
          >
            옵션 수정하기
          </button>

          {/* 주문 확정 */}
          <button
            onClick={handleConfirmOrder}
            className="mt-[2vh] w-full rounded-xl bg-(--color-primary) py-[2.4vh] text-[4.5vw] font-semibold text-(--text-inverse) shadow-md active:scale-95"
          >
            주문 확정하기
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[4vw]">
        <button
          onClick={() => navigate(-1)}
          className="text-[5vw] text-(--text-primary)"
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

export default OrderConfirmation;
