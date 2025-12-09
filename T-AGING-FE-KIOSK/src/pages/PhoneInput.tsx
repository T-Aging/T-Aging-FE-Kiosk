import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import { useTTS } from "@/hooks/useTTS";
import { useKioskStore } from "@/store/useWebSocketStore";

// PhoneInput 내부 전용 타입
interface LocalPhoneLoginRequest {
  type: "phone_num_login";
  data: {
    phoneNumber: string;
  };
}

interface LocalPhoneLoginResponse {
  type: "phone_num_login";
  login_success: boolean;
  message: string;
  userId: number | null;
  username: string | null;
  maskedPhone: string | null;
}

const PhoneInput = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  const [phone, setPhone] = useState("");

  const { playTTS, stopTTS } = useTTS();
  const spokenRef = useRef(false);

  // WebSocket store
  const sendMessage = useKioskStore((s) => s.sendMessage);
  const lastReply = useKioskStore((s) => s.lastReply);

  useEffect(() => {
    setTitle("전화번호 입력");

    if (!spokenRef.current) {
      spokenRef.current = true;
      playTTS(
        "전화번호를 입력해주시고 확인을 눌러주시면 회원 인증이 진행됩니다.",
      );
    }

    return () => stopTTS();
  }, [setTitle, playTTS, stopTTS]);

  // 전화번호 포맷팅
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 4) return digits;
    if (digits.length < 7) return digits.slice(0, 3) + "-" + digits.slice(3);
    return (
      digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7, 11)
    );
  };

  const handleNumberClick = (num: string) => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length >= 11) return;
    setPhone((prev) => formatPhone(prev + num));
  };

  const handleDelete = () => {
    const digitsOnly = phone.replace(/\D/g, "");
    setPhone(formatPhone(digitsOnly.slice(0, -1)));
  };

  // 확인 버튼 WebSocket 요청
  const handleConfirm = () => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) return;

    const msg: LocalPhoneLoginRequest = {
      type: "phone_num_login",
      data: { phoneNumber: digitsOnly },
    };

    sendMessage(msg as never);
    stopTTS();
  };

  // WebSocket 응답 처리
  useEffect(() => {
    if (!lastReply) return;

    const reply = lastReply as unknown as LocalPhoneLoginResponse;

    if (reply.type === "phone_num_login") {
      if (reply.login_success) {
        stopTTS();
        navigate("/recent-orders");
      } else {
        playTTS("인증에 실패했습니다. 다시 입력해주세요.");
      }
    }
  }, [lastReply, navigate, playTTS, stopTTS]);

  const handleGoBack = () => {
    stopTTS();
    navigate(-1);
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center overflow-y-auto pt-[1vh]">
        <div className="mb-[3vh] flex w-full flex-col items-center">
          <div className="flex items-center">
            <img src={masil} alt="masil" className="mb-[1vh] h-auto w-[25vw]" />
            <div className="rounded-2xl border bg-white px-[5vw] py-[2vh] text-[5vw] shadow-md">
              전화번호를 입력해주세요
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-[2vw]">
            <div className="flex h-[15vw] w-[70vw] items-center justify-center rounded-2xl border-4 bg-white px-[3vw] shadow-md">
              <span className="overflow-hidden text-[7vw] font-semibold">
                {phone}
              </span>
            </div>

            <button
              onClick={handleDelete}
              className="flex h-[15vw] w-[15vw] items-center justify-center rounded-2xl bg-(--text-tertiary) text-[4vw] text-white shadow-md active:scale-95"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="grid w-[80vw] grid-cols-3 grid-rows-3 gap-[2vw]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((n) => (
            <button
              key={n}
              onClick={() => handleNumberClick(n)}
              className="flex items-center justify-center rounded-4xl border-4 bg-white py-[1vh] text-[10vw] text-(--text-secondary) active:scale-95"
            >
              {n}
            </button>
          ))}

          <button
            onClick={handleConfirm}
            className={`col-span-2 col-start-2 flex items-center justify-center rounded-4xl py-[1vh] text-[10vw] font-semibold shadow-md active:scale-95 ${
              phone.replace(/\D/g, "").length >= 10
                ? "bg-(--color-primary) text-white"
                : "pointer-events-none bg-(--color-primary) text-white opacity-40"
            }`}
          >
            확인
          </button>
        </div>
      </div>

      <div className="flex h-[10vh] w-full items-center justify-between border-t bg-white px-[4vw]">
        <button
          onClick={handleGoBack}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>

        <button className="rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[5vw] text-white shadow-sm">
          직원 호출
        </button>
      </div>
    </div>
  );
};

export default PhoneInput;
