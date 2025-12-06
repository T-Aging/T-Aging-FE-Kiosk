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
  } = useKioskStore();

  const { currentOptionGroupIndex, nextOptionGroup } = useKioskStore.getState();

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "무엇을 도와드릴까요? 주문을 말씀해주세요!", sender: "bot" },
  ]);

  const [recommendedItems, setRecommendedItems] = useState<ConverseItem[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTitle("대화 주문");
  }, [setTitle]);

  // =============================
  // 선택 버튼을 눌렀을 때 채팅 메시지 추가 + bot follow-up + 기존 TTS 종료
  // =============================
  const handleChoiceSelect = async (label: string, callback: () => void) => {
    // 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: label },
    ]);

    // 현재 재생 중인 TTS 종료 (지원 시)
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // 기존 선택 로직 실행 (온도/사이즈/옵션 등)
    callback();

    // follow-up bot 메시지
    const follow = "선택하셨어요!";

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, sender: "bot", text: follow },
    ]);

    playTTS(follow);
  };

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

  // 옵션/온도/사이즈 등을 묻는 질문을 채팅 메시지로 자동 추가
  useEffect(() => {
    if (!currentStep || !currentQuestion) return;

    // 이미 같은 질문이 있으면 중복 추가 방지
    setMessages((prev) => {
      const exists = prev.some((m) => m.text === currentQuestion);
      if (exists) return prev;

      return [
        ...prev,
        { id: Date.now(), sender: "bot", text: currentQuestion },
      ];
    });

    // 질문을 음성으로 읽기
    playTTS(currentQuestion);
  }, [currentStep, currentQuestion, playTTS]);

  // 스크롤 유지
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 추천 메뉴 선택 시 order_start 요청
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

  // 주문 완료 후 초기화
  const resetForNewOrder = () => {
    setMessages([
      {
        id: 1,
        text: "무엇을 도와드릴까요? 주문을 말씀해주세요!",
        sender: "bot",
      },
    ]);

    useKioskStore.setState({
      currentStep: null,
      currentQuestion: null,
      choices: null,
      optionGroups: null,
      isVoiceStage: true,
    });
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
              handleChoiceSelect={handleChoiceSelect}
            />
          ))}
        </BottomSheet>
      );
    }

    if (currentStep === "ask_size") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c: string) => (
            <ChoiceButton
              key={c}
              label={c}
              onClick={() => selectSize(c)}
              handleChoiceSelect={handleChoiceSelect}
            />
          ))}
        </BottomSheet>
      );
    }

    if (currentStep === "ask_detail_option_yn") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c: string) => (
            <ChoiceButton
              key={c}
              label={c}
              onClick={() => selectDetailOptionYn(c)}
              handleChoiceSelect={handleChoiceSelect}
            />
          ))}
        </BottomSheet>
      );
    }

    if (currentStep === "show_detail_options") {
      const group = optionGroups?.[currentOptionGroupIndex];
      if (!group) return null;

      return (
        <BottomSheet title={`옵션 선택: ${group.groupName}`}>
          {group.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                handleChoiceSelect(opt.name, () => nextOptionGroup(opt.id));
              }}
              className="mb-[1vh] w-full rounded-xl border bg-white px-[3vw] py-[2vh] text-left"
            >
              {opt.name} (+{opt.extraPrice}원)
            </button>
          ))}

          <ChoiceButton
            label="선택 안함"
            onClick={() => nextOptionGroup(null)}
            handleChoiceSelect={handleChoiceSelect}
          />

          <p className="mt-[2vh] text-center text-[3.2vw] text-(--text-secondary)">
            {currentOptionGroupIndex + 1} / {optionGroups?.length} 단계
          </p>
        </BottomSheet>
      );
    }

    if (currentStep === "order_item_complete") {
      return (
        <BottomSheet title="주문이 담겼습니다">
          <p className="mb-[3vh] text-[4vw] font-semibold">
            {useKioskStore.getState().orderCompleteMessage}
          </p>

          <ChoiceButton
            label="장바구니 보기"
            onClick={() => useKioskStore.getState().getCart()}
            handleChoiceSelect={handleChoiceSelect}
          />

          <ChoiceButton
            label="추가 주문하기"
            onClick={resetForNewOrder}
            handleChoiceSelect={handleChoiceSelect}
          />
        </BottomSheet>
      );
    }

    if (currentStep === "cart") {
      const { cart, totalPrice } = useKioskStore.getState();

      return (
        <BottomSheet title="현재 주문 내역">
          {cart.map((item) => (
            <div
              key={item.orderDetailId}
              className="relative mb-[2vh] rounded-xl border bg-white p-[3vw]"
            >
              <button
                onClick={() =>
                  useKioskStore.getState().deleteCartItem(item.orderDetailId)
                }
                className="absolute top-[2vw] right-[2vw] text-[3.5vw] text-red-500"
              >
                삭제
              </button>

              <p className="text-[4vw] font-semibold">{item.menuName}</p>
              <p className="text-[3.5vw]">
                {item.temperature} / {item.size}
              </p>

              {item.options.map((opt) => (
                <p
                  key={opt.optionValueId}
                  className="text-[3vw] text-(--text-secondary)"
                >
                  + {opt.optionValueName} ({opt.extraPrice}원)
                </p>
              ))}

              <p className="mt-[1vh] text-[4vw] font-semibold">
                {item.lineTotalPrice.toLocaleString()}원
              </p>
            </div>
          ))}

          <p className="mt-[1vh] text-[4.5vw] font-bold">
            총 금액: {totalPrice}원
          </p>

          <div className="mt-[3vh] flex gap-[3vw]">
            <button
              className="flex-1 rounded-xl bg-green-600 px-[4vw] py-[2vh] text-[4vw] text-white shadow-md active:scale-95"
              onClick={() => {
                useKioskStore.setState({
                  currentStep: null,
                  currentQuestion: null,
                  choices: null,
                  optionGroups: null,
                  isVoiceStage: true,
                });
              }}
            >
              더 주문할게요
            </button>

            <button
              className="flex-1 rounded-xl bg-blue-600 px-[4vw] py-[2vh] text-[4vw] text-white shadow-md active:scale-95"
              onClick={() => navigate("/order/confirmation")}
            >
              주문 완료
            </button>
          </div>
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
  handleChoiceSelect,
}: {
  label: string;
  onClick: () => void;
  handleChoiceSelect: (label: string, callback: () => void) => void;
}) => (
  <button
    onClick={() => handleChoiceSelect(label, onClick)}
    className="w-full rounded-xl bg-(--color-primary) px-[4vw] py-[2vh] text-[4vw] text-white shadow-md active:scale-95"
  >
    {label}
  </button>
);
