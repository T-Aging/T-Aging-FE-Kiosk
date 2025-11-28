import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import phoneIcon from "@/assets/images/verificationMethod_phone_number.png";
import qrIcon from "@/assets/images/verificationMethod_qr.png";

const VerificationMethod = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  useEffect(() => {
    setTitle("회원 인증");
  }, [setTitle]);

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center pt-[8vh]">
        {/* 상단 캐릭터 + 질문 */}
        <div className="mb-[6vh] flex items-center">
          <img src={masil} alt="masil" className="mb-[3vh] h-auto w-[30vw]" />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
            어떻게 인증하시겠어요?
          </div>
        </div>

        {/* 인증 방식 버튼 2개 */}
        <div className="mt-[4vh] flex gap-[4vw]">
          {/* 전화번호 입력 */}
          <button
            onClick={() => navigate("/membership/phone")}
            className="flex h-[40vw] w-[40vw] flex-col items-center justify-center gap-[6vw] rounded-xl bg-(--color-primary) pt-[4vw] shadow-md transition active:scale-95"
          >
            <img
              src={phoneIcon}
              alt="전화번호 인증 아이콘"
              className="mb-[1vh] h-[13vw] w-[13vw]"
            />
            <div className="text-[5vw] font-semibold text-white">
              전화번호 입력
            </div>
          </button>

          {/* QR 인증 */}
          <button
            onClick={() => navigate("/membership/qr")}
            className="flex h-[40vw] w-[40vw] flex-col items-center justify-center gap-[3vw] rounded-xl bg-(--accent) pt-[3vw] shadow-md transition active:scale-95"
          >
            <img
              src={qrIcon}
              alt="qr 인증 아이콘"
              className="mb-[1vh] h-[15vw] w-[15vw]"
            />{" "}
            <div className="mt-[1vh] text-[5vw] font-semibold text-white">
              멤버스 QR 인증
            </div>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[4vw]">
        {/* ← 이전 */}
        <button
          onClick={() => navigate(-1)}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>

        {/* 회원 인증 */}
        <button className="text-[5vw] text-(--text-primary)">회원 인증</button>

        {/* 직원 호출 */}
        <button className="flex items-center justify-center rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default VerificationMethod;
