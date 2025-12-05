import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import micIcon from "@/assets/images/conversational_order_mic_icon.png";
import { useTTS } from "@/hooks/useTTS";
import { useSTT } from "@/hooks/useSTT";
import { useKioskStore } from "@/store/useWebSocketStore";
import type {
  ConverseItem,
  ConverseResponse,
  OptionGroup,
} from "@/types/KioskResponse";

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

  const {
    sendConverse,
    lastReply,
    isVoiceStage,

    currentStep,
    currentQuestion,
    choices,
    optionGroups,
    selectTemperature,
    selectSize,
    selectDetailOptionYn,
    selectDetailOptions,
  } = useKioskStore();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "무엇을 도와드릴까요? 주문을 말씀해주세요!", sender: "bot" },
  ]);

  const [recommendedItems, setRecommendedItems] = useState<ConverseItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTitle("대화 주문");
  }, [setTitle]);

  // converse 응답 처리
  useEffect(() => {
    if (!lastReply) return;

    const res: ConverseResponse = lastReply;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "bot", text: res.reply },
    ]);

    playTTS(res.reply);

    if (res.items && res.items.length > 0) setRecommendedItems(res.items);
    else setRecommendedItems([]);
  }, [lastReply, playTTS]);

  // 스크롤 유지
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 추천 메뉴 선택 시 order_start 요청을 보냄
  const startOrder = (menuName: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: `${menuName} 선택` },
    ]);

    useKioskStore.getState().sendMessage({
      type: "order_start",
      data: { menuName },
    });

    setRecommendedItems([]);
  };

  // 음성 녹음
  const startRecording = async () => {
    setIsListening(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e: BlobEvent) => {
      chunks.push(e.data);
    };

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

  // 사용자 메시지 전송
  const handleUserMessage = (msg: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: msg },
    ]);
    sendConverse(msg);
    setRecommendedItems([]);
  };

  // BottomSheet 렌더링
  const renderBottomSheet = () => {
    if (!currentStep) return null;

    if (currentStep === "ask_temperature") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c: string) => (
            <ChoiceButton
              key={c}
              label={c}
              onClick={() => selectTemperature(c)}
            />
          ))}
        </BottomSheet>
      );
    }

    if (currentStep === "ask_size") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c: string) => (
            <ChoiceButton key={c} label={c} onClick={() => selectSize(c)} />
          ))}
        </BottomSheet>
      );
    }

    if (currentStep === "detail_option_y") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c: string) => (
            <ChoiceButton
              key={c}
              label={c}
              onClick={() => selectDetailOptionYn(c)}
            />
          ))}
        </BottomSheet>
      );
    }

    if (currentStep === "detail_options") {
      return (
        <BottomSheet title="옵션을 선택하세요">
          {optionGroups?.map((group: OptionGroup) => (
            <div key={group.groupName} className="mb-[3vh]">
              <p className="mb-[1vh] text-[4vw] font-semibold">
                {group.groupName}
              </p>

              {group.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptions((prev) =>
                      prev.includes(opt.id)
                        ? prev.filter((v) => v !== opt.id)
                        : [...prev, opt.id],
                    );
                  }}
                  className={`mb-[1vh] w-full rounded-xl border px-[3vw] py-[2vh] text-left ${
                    selectedOptions.includes(opt.id)
                      ? "bg-(--color-primary) text-white"
                      : "border-(--border-light) bg-white"
                  }`}
                >
                  {opt.name} (+{opt.extraPrice}원)
                </button>
              ))}
            </div>
          ))}

          <ChoiceButton
            label="선택 완료"
            onClick={() => selectDetailOptions(selectedOptions)}
          />
        </BottomSheet>
      );
    }

    return null;
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-(--bg-primary)">
      <div className="flex flex-1 flex-col items-center overflow-hidden px-[4vw] pt-[6vh]">
        <div className="mb-[4vh] flex items-center gap-[3vw]">
          <img src={masil} alt="masil" className="h-auto w-[22vw]" />
          <div className="rounded-2xl border bg-white px-[5vw] py-[2vh] text-[4vw] shadow-md">
            주문을 말씀해주세요.
          </div>
        </div>

        <div className="w-full flex-1 overflow-y-auto px-[1vw] pb-[2vh]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-[2vh] flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-[4vw] py-[2vh] text-[4vw] shadow-sm ${
                  m.sender === "user"
                    ? "bg-(--color-primary) text-white"
                    : "border bg-white"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {recommendedItems.length > 0 && (
          <div className="mt-[3vh] w-full px-[2vw]">
            <p className="mb-[2vh] text-center text-[4vw] font-semibold">
              아래에서 메뉴를 선택해보세요!
            </p>
            <div className="grid grid-cols-2 gap-[3vw]">
              {recommendedItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => startOrder(item.name)}
                  className="flex flex-col rounded-2xl border bg-white p-[2vw] shadow-md"
                >
                  <img
                    src={item.menu_image}
                    alt={item.name}
                    className="mb-[2vh] h-[22vw] w-full rounded-xl object-cover"
                  />
                  <p className="text-[4vw] font-semibold">{item.name}</p>
                  <p className="text-[3.5vw] text-(--text-secondary)">
                    {item.price.toLocaleString()}원
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isVoiceStage && (
          <>
            <button
              onClick={startRecording}
              className="mt-[4vh] flex h-[20vw] w-[20vw] items-center justify-center rounded-full bg-(--color-primary) shadow-lg"
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

      {renderBottomSheet()}

      <div className="flex h-[10vh] w-full items-center justify-between border-t bg-white px-[6vw]">
        <button onClick={() => navigate(-1)} className="text-[5vw]">
          ← 이전
        </button>

        <div
          onClick={() => navigate("/order/confirmation")}
          className="text-[5vw]"
        >
          주문 확인하기
        </div>

        <button className="text-[5vw]">직원 호출</button>
      </div>
    </div>
  );
};

export default ConversationalOrder;

// BottomSheet
const BottomSheet = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="fixed bottom-0 left-0 w-full rounded-t-3xl bg-white p-[4vw] shadow-xl">
    <p className="mb-[3vw] text-[4.5vw] font-semibold">{title}</p>
    <div className="flex flex-col gap-[2vw]">{children}</div>
  </div>
);

// Choice button
const ChoiceButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full rounded-xl bg-(--color-primary) px-[4vw] py-[2vh] text-[4vw] text-white shadow-md active:scale-95"
  >
    {label}
  </button>
);
