import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import masil from "@/assets/images/masil.png";
import micIcon from "@/assets/images/conversational_order_mic_icon.png";
import { useTTS } from "@/hooks/useTTS";
import { useSTT } from "@/hooks/useSTT";
import { useKioskStore } from "@/store/useWebSocketStore";
import type { ConverseItem, ConverseResponse } from "@/types/KioskResponse";

/* 메시지 타입 */
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

  /* 채팅 메시지 리스트 */
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "무엇을 도와드릴까요? 주문을 말씀해주세요!", sender: "bot" },
  ]);

  /* 추천 메뉴 */
  const [recommendedItems, setRecommendedItems] = useState<ConverseItem[]>([]);

  /* 음성 인식 상태 */
  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* 옵션 안내 문구 1회 출력 */
  const [optionIntroSpoken, setOptionIntroSpoken] = useState(false);

  /* 추천 메뉴가 떠 있을 때 '다시 말하기' 버튼 노출 여부 */
  const [canRetryConverse, setCanRetryConverse] = useState(false);

  /* title 지정 */
  useEffect(() => {
    setTitle("대화 주문");
  }, [setTitle]);

  /* 버튼 선택 처리 */
  const handleChoiceSelect = (label: string, callback: () => void) => {
    setMessages((prev): Message[] => [
      ...prev,
      { id: Date.now(), sender: "user", text: label },
    ]);

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    callback();
  };

  /* converse 응답 처리 */
  useEffect(() => {
    if (!lastReply || lastReply.type !== "converse") return;

    const res = lastReply as ConverseResponse;

    setMessages((prev): Message[] => [
      ...prev,
      { id: Date.now(), sender: "bot", text: res.reply },
    ]);

    playTTS(res.reply);

    if (res.items && res.items.length > 0) {
      setRecommendedItems(res.items);
      setCanRetryConverse(true);
    } else {
      setRecommendedItems([]);
      setCanRetryConverse(false);
    }
  }, [lastReply, playTTS]);

  /* 옵션 단계에서는 currentQuestion을 읽지 않음 */
  const shouldSpeakQuestion = () => {
    if (!currentStep || !currentQuestion) return false;
    if (currentStep === "show_detail_options") return false;
    return true;
  };

  /* 질문 출력 */
  useEffect(() => {
    if (!shouldSpeakQuestion()) return;

    const safeText = currentQuestion ?? "";

    const exists = messages.some((m) => m.text === safeText);
    if (!exists) {
      setMessages((prev): Message[] => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text: safeText,
        },
      ]);
    }

    if (safeText.length > 0) {
      playTTS(safeText);
    }
  }, [
    currentStep,
    currentQuestion,
  ]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* 스크롤 아래 유지 */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 추천 메뉴 선택 */
  const startOrder = (menuName: string) => {
    setMessages((prev): Message[] => [
      ...prev,
      { id: Date.now(), sender: "user", text: `${menuName} 선택` },
    ]);

    useKioskStore.getState().sendMessage({
      type: "order_start",
      data: { menuName },
    });

    setRecommendedItems([]);
    setCanRetryConverse(false);
  };

  /* 음성 녹음 */
  const startRecording = async () => {
    setIsListening(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = async () => {
      setIsListening(false);
      const blob = new Blob(chunks, { type: "audio/webm" });
      const text = await playSTT(blob);

      if (text) handleUserMessage(text);
      else {
        setMessages((prev): Message[] => [
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

  /* 사용자 입력 */
  const handleUserMessage = (msg: string) => {
    setMessages((prev): Message[] => [
      ...prev,
      { id: Date.now(), sender: "user", text: msg },
    ]);

    sendConverse(msg);
    setRecommendedItems([]);
    setCanRetryConverse(false);
  };

  /* 추천 재시도 */
  const retryConverse = () => {
    setMessages((prev): Message[] => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        text: "어떤 메뉴를 원하시나요? 다시 말씀해주세요!",
      },
    ]);

    playTTS("어떤 메뉴를 원하시나요? 다시 말씀해주세요!");
    setRecommendedItems([]);
    setCanRetryConverse(false);
  };

  /* 주문 초기화 */
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

    setOptionIntroSpoken(false);
  };

  /* 옵션 BottomSheet */
  const renderBottomSheet = () => {
    if (!currentStep) return null;

    /* 온도 */
    if (currentStep === "ask_temperature") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c) => (
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

    /* 사이즈 */
    if (currentStep === "ask_size") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c) => (
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

    /* 옵션 여부 */
    if (currentStep === "ask_detail_option_yn") {
      return (
        <BottomSheet title={currentQuestion ?? ""}>
          {choices?.map((c) => (
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

    /* 옵션 선택 */
    if (currentStep === "show_detail_options") {
      if (!optionGroups || optionGroups.length === 0) {
        nextOptionGroup(null);
        return null;
      }

      const group = optionGroups[currentOptionGroupIndex];

      if (!group || group.options.length === 0) {
        nextOptionGroup(null);
        return null;
      }

      if (!optionIntroSpoken) {
        playTTS(`이 메뉴는 총 ${optionGroups.length}개의 옵션이 있어요.`);
        setOptionIntroSpoken(true);
      }

      return (
        <BottomSheet title={`옵션 선택: ${group.groupName}`}>
          {group.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() =>
                handleChoiceSelect(opt.name, () => nextOptionGroup(opt.id))
              }
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
            {currentOptionGroupIndex + 1} / {optionGroups.length} 단계
          </p>
        </BottomSheet>
      );
    }

    /* 담김 */
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

    /* 장바구니 */
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
                setOptionIntroSpoken(false);
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
            {canRetryConverse && (
              <button
                onClick={retryConverse}
                className="mb-[2vh] w-full rounded-xl bg-(--accent) px-[4vw] py-[2vh] text-[4vw] text-white shadow-md active:scale-95"
              >
                다시 말하기
              </button>
            )}

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

/* BottomSheet */
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

/* 버튼 */
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
