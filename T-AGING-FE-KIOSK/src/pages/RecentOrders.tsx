import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";

type OutletContextType = {
  setTitle: (v: string) => void;
};

type RecentItem = {
  id: number;
  name: string;
  detail: string;
  price: number;
};

type RecentOrder = {
  id: number;
  items: RecentItem[];
  date: string;
  totalPrice: number;
};

const recentOrdersMock: RecentOrder[] = [
  {
    id: 1,
    items: [
      { id: 101, name: "아메리카노", detail: "ICE / 연하게", price: 4500 },
      { id: 102, name: "샌드위치", detail: "햄 & 치즈", price: 5500 },
    ],
    date: "2일 전",
    totalPrice: 10000,
  },
  {
    id: 2,
    items: [
      { id: 201, name: "카페라떼", detail: "ICE", price: 4800 },
      { id: 202, name: "브런치 세트", detail: "샌드위치 + 음료", price: 5500 },
    ],
    date: "5일 전",
    totalPrice: 10300,
  },
];

const RecentOrders = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<OutletContextType>();

  const { playTTS, stopTTS } = useTTS();

  // TTS가 여러 번 재생되는 것을 막기 위해 사용
  const spokenRef = useRef(false);

  // 상세보기 팝업 상태
  const [showDetail, setShowDetail] = useState(false);
  const [detailOrder, setDetailOrder] = useState<RecentOrder | null>(null);

  const openDetail = (order: RecentOrder) => {
    setDetailOrder(order);
    setShowDetail(true);
  };

  const closeDetail = () => setShowDetail(false);

  useEffect(() => {
    setTitle("최근 주문");

    // 진입 시 단 한 번만 음성 안내 재생
    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS(
        "최근 기록에서 선택하시면 바로 주문할 수 있습니다. 상세 보기로 내역을 확인할 수 있으며, 새로 주문하려면 아래 버튼을 선택해 주세요.",
      );
    }

    // 화면을 떠날 때 남아 있는 음성을 중단
    return () => {
      stopTTS();
    };
  }, [setTitle, playTTS, stopTTS]);

  // 최근 주문 항목을 선택하면 음성을 중단하고 다음 화면으로 이동
  const handleClickOrder = (order: RecentOrder) => {
    stopTTS();
    navigate("/order/confirmation", {
      state: {
        type: "recent",
        order,
      },
    });
  };

  // 새로 주문하기 선택 시에도 음성 중단 후 이동
  const handleNewOrder = () => {
    stopTTS();
    navigate("/order");
  };

  // 뒤로가기 선택 시 음성 중단 후 이동
  const handleGoBack = () => {
    stopTTS();
    navigate(-1);
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[8vh]">
        <div className="w-full rounded-2xl border border-(--border-soft) bg-white px-[4vw] py-[3vh] shadow-md">
          {/* 상단 안내 영역 */}
          <div className="flex items-center">
            <img src={masil} alt="masil" className="mb-[1vh] h-auto w-[20vw]" />
            <div className="rounded-2xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
              최근에 주문했던 음료를 드릴까요?
            </div>
          </div>

          {/* 최근 주문 리스트 */}
          <div className="mt-[3vh] mb-[3vh] flex flex-col gap-[2vh]">
            {recentOrdersMock.map((order) => {
              const firstItem = order.items[0];
              const extraCount = order.items.length - 1;
              const title =
                extraCount > 0
                  ? `${firstItem.name} 외 ${extraCount}개`
                  : firstItem.name;

              return (
                <div
                  key={order.id}
                  onClick={() => handleClickOrder(order)}
                  className="relative w-full cursor-pointer rounded-2xl border-4 border-(--border-light) bg-white px-[4vw] py-[3vh] text-left shadow-md transition active:scale-95"
                >
                  <p className="text-[5vw] font-semibold text-(--text-primary)">
                    {title}
                  </p>

                  <p className="text-[4.5vw] font-semibold text-blue-600">
                    {order.totalPrice.toLocaleString()}원
                  </p>

                  <p className="text-[3vw] text-(--text-secondary)">
                    {order.date}
                  </p>

                  {/* 상세보기 버튼 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(order);
                    }}
                    className="absolute top-1/2 right-[4vw] -translate-y-1/2 text-[4vw] text-(--color-primary)"
                  >
                    상세보기 →
                  </button>
                </div>
              );
            })}
          </div>

          {/* 새로 주문하기 버튼 */}
          <button
            type="button"
            onClick={handleNewOrder}
            className="mt-[1vh] w-full rounded-xl bg-(--color-primary) py-[2.4vh] text-[5vw] font-semibold text-(--text-inverse) shadow-md active:scale-95"
          >
            새로 주문하기
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center border-t border-(--border-light) bg-white px-[4vw]">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={handleGoBack}
            className="flex items-center justify-center rounded-xl border border-(--border-light) bg-white px-[3vw] py-[1.8vh] text-[5vw] text-(--text-primary) shadow-sm"
          >
            ← 이전
          </button>

          <button
            type="button"
            className="flex items-center justify-center rounded-xl bg-(--accent) px-[3vw] py-[1.8vh] text-[5vw] text-(--text-inverse) shadow-sm"
          >
            직원 호출
          </button>
        </div>
      </div>

      {/* 상세보기 팝업 */}
      {showDetail && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[80vw] rounded-2xl bg-white p-[5vw] shadow-xl">
            <p className="mb-[3vh] text-[6vw] font-semibold text-(--text-primary)">
              {detailOrder.items[0].name}
              {detailOrder.items.length > 1 &&
                ` 외 ${detailOrder.items.length - 1}개`}
            </p>

            <div className="mb-[3vh] flex flex-col gap-[2vh]">
              {detailOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-(--border-light) px-[3vw] py-[2vh]"
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

            <div className="mt-[2vh] flex items-center justify-between">
              <p className="text-[4vw] text-(--text-secondary)">총 금액</p>
              <p className="text-[5vw] font-bold text-(--text-primary)">
                {detailOrder.totalPrice.toLocaleString()}원
              </p>
            </div>

            <button
              onClick={closeDetail}
              className="mt-[4vh] w-full rounded-xl bg-(--color-primary) py-[2.5vh] text-[5vw] text-(--text-inverse)"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
