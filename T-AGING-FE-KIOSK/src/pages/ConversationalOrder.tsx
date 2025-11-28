import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import micIcon from "@/assets/images/conversational_order_mic_icon.png";
import { useTTS } from "@/hooks/useTTS";
import { useSTT } from "@/hooks/useSTT";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
};

const ConversationalOrder = () => {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<{ setTitle: (v: string) => void }>();

  const { playTTS } = useTTS();
  const { playSTT } = useSTT();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "무엇을 도와드릴까요? 주문을 말씀해주세요!", sender: "bot" },
  ]);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setTitle("대화 주문");
  }, [setTitle]);

  // =============================
  // 1. 음성 녹음 → Blob 생성
  // =============================
  const startRecording = async () => {
    setIsListening(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setIsListening(false);

      console.log("녹음된 blob:", blob);

      const text = await playSTT(blob);
      console.log("STT 결과:", text);

      if (text) {
        handleUserMessage(text);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: "음성을 인식하지 못했어요. 조금 더 또렷하게 말씀해 주세요! ☺️",
          },
        ]);
      }
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 3000);
  };

  // =============================
  // 2. 채팅 반영 + 주문 AI 응답
  // =============================
  const handleUserMessage = async (msg: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: msg, sender: "user" },
    ]);

    const botReply = await requestOrderAI(msg);

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, text: botReply, sender: "bot" },
    ]);

    playTTS(botReply);
  };

  // =============================
  // 3. 주문 AI 서버 응답
  // =============================
  const requestOrderAI = async (text: string) => {
    const res = await fetch("나중에 axio로 api 반영 예정", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    return data.reply;
  };

  return (
    <div className="flex h-full w-full flex-col bg-(--bg-primary)">
      {/* CONTENT */}
      <div className="flex flex-1 flex-col items-center overflow-hidden px-[4vw] pt-[6vh]">
        {/* 테스트 버튼 영역 */}
        <div className="mb-[2vh] flex gap-[2vw]">
          <button
            onClick={() => {
              playTTS("안녕하세요. TTS가 정상적으로 작동합니다.");
            }}
            className="rounded-xl bg-green-500 px-4 py-2 text-[3vw] text-white"
          >
            TTS 테스트
          </button>

          <button
            onClick={async () => {
              // STT는 Blob이 필요하므로 샘플 blob 생성
              const sampleBlob = new Blob(["TEST"], { type: "audio/webm" });
              console.log("STT TEST blob:", sampleBlob);

              const text = await playSTT(sampleBlob);
              console.log("STT TEST 결과:", text);
            }}
            className="rounded-xl bg-blue-500 px-4 py-2 text-[3vw] text-white"
          >
            STT 테스트
          </button>
        </div>

        {/* 마실 + 말풍선 */}
        <div className="mb-[4vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[22vw]" />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-md">
            주문을 말씀해주세요!
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="w-full flex-1 overflow-y-auto px-[1vw] pb-[2vh]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-[2vh] flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-[4vw] py-[2vh] text-[4vw] leading-snug shadow-sm ${
                  m.sender === "user"
                    ? "bg-(--color-primary) text-(--text-inverse)"
                    : "border border-(--border-light) bg-white text-(--text-primary)"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* 추천 버튼 */}
        <div className="mt-[2vh] flex w-full justify-center gap-[3vw]">
          <button
            onClick={() => handleUserMessage("아메리카노 한 잔 주세요")}
            className="rounded-xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-sm active:scale-95"
          >
            ☕ 아메리카노 추천
          </button>

          <button
            onClick={() => handleUserMessage("라떼 하나요")}
            className="rounded-xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-sm active:scale-95"
          >
            🥤 라떼 추천
          </button>
        </div>

        {/* 마이크 버튼 */}
        <button
          onClick={startRecording}
          className="mt-[4vh] flex h-[20vw] w-[20vw] items-center justify-center rounded-full bg-(--color-primary) shadow-lg active:scale-95"
        >
          <img src={micIcon} alt="mic" className="w-[10vw]" />
        </button>

        {isListening && (
          <p className="mt-[2vh] text-[3vw] text-(--text-secondary)">
            🎤 듣고 있어요...
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex h-[10vh] w-full items-center border-t border-(--border-light) bg-white px-[4vw]">
        <div className="flex w-full items-center gap-[3vw]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-xl border border-(--border-light) bg-(--color-primary) px-[4vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm"
          >
            ← 이전
          </button>

          <div
            onClick={() => navigate("/order/confirmation")}
            className="flex flex-1 items-center justify-center rounded-xl py-[2vh] text-[5vw] active:scale-95"
          >
            주문 확인하기
          </div>

          <button className="flex items-center justify-center rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[5vw] text-(--text-inverse) shadow-sm">
            직원 호출
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalOrder;
