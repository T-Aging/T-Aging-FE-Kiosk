import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import micIcon from "@/assets/images/conversational_order_mic_icon.png";
import { useTTS } from "@/hooks/useTTS";
import { useSTT } from "@/hooks/useSTT";
import { useKioskStore } from "@/store/useWebSocketStore";
import type { ConverseItem, ConverseResponse } from "@/types/KioskResponse";

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
  const { sendConverse, lastReply, isVoiceStage } = useKioskStore();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "무엇을 도와드릴까요? 주문을 말씀해주세요!", sender: "bot" },
  ]);

  // 추천 메뉴 아이템 상태
  const [recommendedItems, setRecommendedItems] = useState<ConverseItem[]>([]);

  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTitle("대화 주문");
  }, [setTitle]);

  // 서버의 converse 응답 처리
  useEffect(() => {
    if (!lastReply) return;

    const res = lastReply as ConverseResponse;

    // reply → 채팅 메시지 추가
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "bot", text: res.reply },
    ]);

    // 음성 출력
    playTTS(res.reply);

    // 추천 메뉴 카드 업데이트
    if (res.items && res.items.length > 0) {
      setRecommendedItems(res.items);
    } else {
      setRecommendedItems([]);
    }
  }, [lastReply, playTTS]);

  // 메시지 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 음성 녹음
  const startRecording = async () => {
    setIsListening(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      setIsListening(false);

      const blob = new Blob(chunks, { type: "audio/webm" });
      const text = await playSTT(blob);

      if (text) {
        handleUserMessage(text);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: "음성을 인식하지 못했습니다. 다시 말씀해주세요.",
          },
        ]);
      }
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 3000);
  };

  // 유저 입력 처리
  const handleUserMessage = (msg: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: msg },
    ]);

    sendConverse(msg);

    // 새 유저 입력 들어오면 이전 추천 초기화
    setRecommendedItems([]);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center overflow-hidden px-[4vw] pt-[6vh]">
        {/* 캐릭터 말풍선 */}
        <div className="mb-[4vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[22vw]" />
          <div className="rounded-2xl border border-(--border-light) bg-white px-[5vw] py-[2vh] text-[4vw] text-(--text-primary) shadow-md">
            주문을 말씀해주세요.
          </div>
        </div>
        {/* 메시지 리스트 */}
        <div className="w-full flex-1 overflow-y-auto px-[1vw] pb-[2vh]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-[2vh] flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
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

          <div ref={bottomRef} />
        </div>
        {/* 추천 메뉴 카드 */}
        {recommendedItems.length > 0 && (
          <div className="mt-[3vh] w-full px-[2vw]">
            <p className="mb-[2vh] text-center text-[4vw] font-semibold text-(--text-primary)">
              아래에서 메뉴를 선택해보세요!
            </p>

            <div className="grid w-full grid-cols-2 gap-[3vw]">
              {recommendedItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUserMessage(`${item.name} 주세요`)}
                  className="flex flex-col rounded-2xl border border-(--border-light) bg-white p-[2vw] shadow-md active:scale-95"
                >
                  <img
                    src={item.menu_image}
                    alt={item.name}
                    className="mb-[2vh] h-[22vw] w-full rounded-xl object-cover"
                  />

                  <p className="text-[4vw] font-semibold text-(--text-primary)">
                    {item.name}
                  </p>

                  <p className="text-[3.5vw] text-(--text-secondary)">
                    {item.price.toLocaleString()}원
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* 마이크 */}
        {isVoiceStage && (
          <>
            <button
              onClick={startRecording}
              className="mt-[4vh] flex h-[20vw] w-[20vw] items-center justify-center rounded-full bg-(--color-primary) shadow-lg active:scale-95"
            >
              <img src={micIcon} alt="mic" className="w-[10vw]" />
            </button>

            {isListening && (
              <p className="mt-[2vh] text-[3vw] text-(--text-secondary)">
                듣고 있습니다...
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex h-[10vh] w-full items-center justify-between border-t border-(--border-light) bg-white px-[6vw]">
        <button
          onClick={() => navigate(-1)}
          className="text-[5vw] text-(--text-primary)"
        >
          ← 이전
        </button>

        <div
          onClick={() => navigate("/order/confirmation")}
          className="text-[5vw] text-(--text-primary)"
        >
          주문 확인하기
        </div>

        <button className="text-[5vw] text-(--text-primary)">직원 호출</button>
      </div>
    </div>
  );
};

export default ConversationalOrder;
