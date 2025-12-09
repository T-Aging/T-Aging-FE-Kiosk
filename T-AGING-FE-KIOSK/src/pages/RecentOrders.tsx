import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";
import { useKioskStore } from "@/store/useWebSocketStore";
import type { RecentOrderItem } from "@/types/KioskResponse";

type OutletContextType = {
  setTitle: (v: string) => void;
};

const RecentOrders = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<OutletContextType>();
  const { playTTS, stopTTS } = useTTS();

  // WebSocket 상태
  const {
    recentOrders,
    recentOrderDetail,
    getRecentOrders,
    getRecentOrderDetail,
    recentOrderToCart,
  } = useKioskStore();

  // 음성 안내 중복 방지
  const spokenRef = useRef(false);

  // 상세 팝업
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setTitle("최근 주문");

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS(
        "최근 기록에서 선택하시면 바로 주문할 수 있습니다. 상세 보기로 내역을 확인할 수 있으며, 새로 주문하려면 아래 버튼을 선택해 주세요.",
      );
    }

    getRecentOrders();

    return () => stopTTS();
  }, [setTitle, playTTS, stopTTS, getRecentOrders]);

  // 최근 주문 선택
  const handleClickOrder = async (order: RecentOrderItem) => {
    stopTTS();
    recentOrderToCart(order.orderId);

    // recent_order_to_cart 응답이 오면 zustand에서 cart 업데이트됨
    // cart 화면으로 이동
    navigate("/cart");
  };

  // 상세보기 요청 & 팝업 열기
  const openDetail = (order: RecentOrderItem) => {
    stopTTS();
    setShowDetail(true);
    getRecentOrderDetail(order.orderId);
  };

  // 상세 닫기
  const closeDetail = () => {
    setShowDetail(false);
  };

  const handleNewOrder = () => {
    stopTTS();
    navigate("/order");
  };

  const handleGoBack = () => {
    stopTTS();
    navigate(-1);
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[8vh]">
        <div className="w-full rounded-2xl border border-(--border-soft) bg-white px-[4vw] py-[3vh] shadow-md">
          <div className="flex items-center">
            <img src={masil} alt="masil" className="mb-[1vh] h-auto w-[20vw]" />
            <div className="rounded-2xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
              최근에 주문했던 음료를 드릴까요?
            </div>
          </div>

          {/* 리스트 */}
          <div className="mt-[3vh] mb-[3vh] flex flex-col gap-[2vh]">
            {recentOrders?.length === 0 && (
              <p className="text-center text-[4vw] text-(--text-secondary)">
                최근 주문 내역이 없습니다.
              </p>
            )}

            {recentOrders?.map((order) => {
              const title =
                order.otherMenuCount > 0
                  ? `${order.mainMenuName} 외 ${order.otherMenuCount}개`
                  : order.mainMenuName;

              return (
                <div
                  key={order.orderId}
                  onClick={() => handleClickOrder(order)}
                  className="relative flex w-full cursor-pointer items-center gap-[3vw] rounded-2xl border-4 border-(--border-light) bg-white px-[4vw] py-[3vh] shadow-md transition active:scale-95"
                >
                  <div className="flex flex-col">
                    <p className="text-[5vw] font-semibold text-(--text-primary)">
                      {title}
                    </p>

                    <p className="text-[4.5vw] font-semibold text-blue-600">
                      {order.totalPrice.toLocaleString()}원
                    </p>

                    <p className="text-[3vw] text-(--text-secondary)">
                      {order.daysAgo}일 전
                    </p>
                  </div>

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

      {/* 상세보기 팝업 (API 기반) */}
      {showDetail && recentOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[80vw] rounded-2xl bg-white p-[5vw] shadow-xl">
            <p className="mb-[3vh] text-[6vw] font-semibold text-(--text-primary)">
              {recentOrderDetail.items[0]?.menuName}
            </p>

            <p className="text-[4vw] text-(--text-secondary)">
              {new Date(recentOrderDetail.orderDateTime).toLocaleString()}
            </p>

            <div className="mt-[2vh] border-t border-(--border-light) pt-[2vh]">
              {recentOrderDetail.items.map((item) => (
                <div key={item.orderDetailId} className="mb-[2vh]">
                  <p className="text-[5vw] font-bold">{item.menuName}</p>

                  <p className="text-[4vw]">
                    {item.temperature} / {item.size}
                  </p>

                  {item.options.length > 0 && (
                    <div className="mt-[1vh] ml-[2vw]">
                      {item.options.map((op) => (
                        <p
                          key={op.optionValueId}
                          className="text-[3.5vw] text-(--text-secondary)"
                        >
                          • {op.optionGroupName}: {op.optionValueName} (+
                          {op.extraPrice}원)
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="mt-[1vh] text-[4.5vw] font-semibold">
                    {item.lineTotalPrice.toLocaleString()}원
                  </p>
                </div>
              ))}
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
