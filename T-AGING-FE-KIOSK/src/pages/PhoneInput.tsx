import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";

const PhoneInput = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  const [phone, setPhone] = useState("");

  const { playTTS, stopTTS } = useTTS();
  const spokenRef = useRef(false); // 음성 안내 1회 제한

  useEffect(() => {
    setTitle("전화번호 입력");

    // 화면 진입 시 음성 안내 (1회만)
    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS(
        "전화번호를 입력해주시고 확인을 눌러주시면 회원 인증이 진행됩니다.",
      );
    }

    // 다른 화면으로 이동할 때 음성 중단
    return () => {
      stopTTS();
    };
  }, [setTitle, playTTS, stopTTS]);

  // 전화번호 자동 하이픈 적용
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  // 숫자 클릭 시 입력
  const handleNumberClick = (num: string) => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length >= 11) return;
    setPhone((prev) => formatPhone(prev + num));
  };

  // 마지막 숫자 삭제
  const handleDelete = () => {
    const digitsOnly = phone.replace(/\D/g, "");
    setPhone(formatPhone(digitsOnly.slice(0, -1)));
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) return;

    stopTTS(); // 음성 안내 중단
    navigate("/recent-orders");
  };

  // 뒤로가기
  const handleGoBack = () => {
    stopTTS();
    navigate(-1);
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto pt-[1vh]">
        {/* 상단 안내 */}
        <div className="mb-[3vh] flex w-full flex-col items-center">
          <div className="flex items-center">
            <img src={masil} alt="masil" className="mb-[1vh] h-auto w-[25vw]" />
            <div className="rounded-2xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[5vw] text-(--text-primary) shadow-md">
              전화번호를 입력해주세요
            </div>
          </div>

          {/* 입력 박스 + 삭제 버튼 */}
          <div className="flex w-full items-center justify-center gap-[2vw]">
            <div className="flex h-[15vw] w-[70vw] items-center justify-center rounded-2xl border-4 border-(--border-light) bg-white px-[3vw] shadow-md">
              <span className="overflow-hidden text-[7vw] font-semibold text-ellipsis whitespace-nowrap text-(--text-primary)">
                {phone.length > 0 ? phone : ""}
              </span>
            </div>

            <button
              onClick={handleDelete}
              className="flex h-[15vw] w-[15vw] items-center justify-center rounded-2xl bg-(--text-tertiary) text-[4vw] text-(--text-inverse) shadow-md active:scale-95"
            >
              삭제
            </button>
          </div>
        </div>

        {/* 숫자 키패드 */}
        <div className="grid w-[80vw] grid-cols-3 grid-rows-3 gap-[2vw]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((n) => (
            <button
              key={n}
              onClick={() => handleNumberClick(n)}
              className="flex items-center justify-center rounded-4xl border-4 bg-white py-[1vh] text-[10vw] text-(--text-secondary) transition active:scale-95"
            >
              {n}
            </button>
          ))}

          {/* 확인 버튼 */}
          <button
            onClick={handleConfirm}
            className={`col-span-2 col-start-2 flex items-center justify-center rounded-4xl py-[1vh] text-[10vw] font-semibold shadow-md transition active:scale-95 ${
              phone.replace(/\D/g, "").length >= 10
                ? "bg-(--color-primary) text-(--text-inverse)"
                : "pointer-events-none bg-(--color-primary) text-white"
            }`}
          >
            확인
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[4vw]">
        <button
          onClick={handleGoBack}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>

        <button className="flex items-center justify-center rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default PhoneInput;
