import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

const OrderComplete = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("주문 완료");
  }, [setTitle]);

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[4vw] pt-[8vh]">
        {/* 상단 마실이 + 말풍선 */}
        <div className="mb-[6vh] flex items-center gap-[3vw]">
          <img
            src="src/assets/images/masil.png"
            alt="masil"
            className="h-auto w-[20vw]"
          />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[6vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-md">
            주문이 접수되었어요!
          </div>
        </div>

        {/* 대기번호 박스 */}
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

        {/* 처음으로 돌아가기 */}
        <button
          onClick={() => navigate("/")}
          className="mt-[5vh] w-[50vw] rounded-xl bg-(--color-primary) py-[2.6vh] text-[5vw] text-(--text-inverse) shadow-md active:scale-95"
        >
          처음으로 돌아가기
        </button>
      </div>

      {/* FOOTER 고정 */}
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

export default OrderComplete;
