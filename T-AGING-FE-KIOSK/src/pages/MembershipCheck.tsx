import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

const MembershipCheck = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("주문하기");
  }, [setTitle]);

  const goMember = () => navigate("/membership/verify-method");
  const goGuest = () => navigate("/order");

  return (
    <div className="relative flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto">
        {/* 캐릭터 + 질문 */}
        <div className="flex items-center pt-[8vh]">
          <img
            src="src/assets/images/masil.png"
            alt="masil"
            className="mb-[3vh] h-auto w-[30vw]"
          />

          <div className="mb-[2vh] rounded-2xl border-3 border-(--border-light) bg-white px-[10vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
            회원이신가요?
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex w-[60vw] flex-col items-center gap-[5vh]">
          <button
            onClick={goMember}
            className="w-full rounded-xl bg-(--color-primary) py-[4vh] text-[6vw] text-(--text-inverse) shadow-md transition active:scale-95"
          >
            회원으로 주문하기
          </button>

          <button
            onClick={goGuest}
            className="w-full rounded-xl bg-(--text-tertiary) py-[4vh] text-[6vw] text-(--text-inverse) shadow-md transition active:scale-95"
          >
            바로 주문할래요!
          </button>

          <p className="w-full rounded-xl bg-white py-[2vh] text-center text-[4vw] text-(--text-secondary) shadow-sm">
            💡 회원은 최근 기록을 통한 <br /> 주문이 가능해요!
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full justify-between border-t border-(--border-light) bg-white px-[6vw]">
        <button
          onClick={() => navigate(-1)}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>
        <button className="text-[5vw] text-(--text-primary)">직원 호출</button>
      </div>
    </div>
  );
};

export default MembershipCheck;
