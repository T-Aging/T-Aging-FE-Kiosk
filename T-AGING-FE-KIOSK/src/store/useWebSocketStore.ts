import { create } from "zustand";
import type { KioskRequest } from "@/types/KioskRequest";
import type {
  KioskResponse,
  AskTemperatureResponse,
  AskSizeResponse,
  AskDetailOptionYnResponse,
  ShowDetailOptionsResponse,
  OrderItemCompleteResponse,
  CartResponse,
  CartUpdatedResponse,
  OrderConfirmResponse,
  OptionGroup,
  CartItem,
  ConverseResponse,
} from "@/types/KioskResponse";

interface KioskState {
  socket: WebSocket | null;
  sessionId: string | null;

  // 대화 응답 (converse)
  lastReply: ConverseResponse | null;

  // 첫 단계 음성 입력 여부
  isVoiceStage: boolean; 

  // 주문 항목 담기 완료 메시지
  orderCompleteMessage: string | null;

  // 주문 흐름 상태
  currentStep: string | null;
  currentQuestion: string | null;
  choices: string[] | null;

  // 주문 선택 정보
  menuName: string | null;
  temperature: string | null;
  size: string | null;
  optionGroups: OptionGroup[] | null;

  // 장바구니 정보
  cart: CartItem[];
  totalPrice: number | null;

  connect: () => void;
  sendMessage: (msg: KioskRequest) => void;

  sendConverse: (text: string) => void;
  selectTemperature: (temperature: string) => void;
  selectSize: (size: string) => void;
  selectDetailOptionYn: (answer: string) => void;
  selectDetailOptions: (selected: number[]) => void;

  getCart: () => void;
  deleteCartItem: (orderDetailId: number) => void;

  orderConfirm: () => void;
}

export const useKioskStore = create<KioskState>((set, get) => ({
  socket: null,
  sessionId: null,

  lastReply: null,

  // 🔥 음성 단계 처음엔 true
  isVoiceStage: true,

  orderCompleteMessage: null,

  currentStep: null,
  currentQuestion: null,
  choices: null,

  menuName: null,
  temperature: null,
  size: null,
  optionGroups: null,

  cart: [],
  totalPrice: null,

  connect: () => {
    if (get().socket) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onopen = () => {
      const startMsg: KioskRequest = {
        type: "start",
        data: { storeId: "001", menuVersion: 1 },
      };
      ws.send(JSON.stringify(startMsg));
    };

    ws.onmessage = (event) => {
      const msg: KioskResponse = JSON.parse(event.data);
      console.log("WS Response:", msg);

      switch (msg.type) {
        case "start":
          set({ sessionId: msg.sessionId });
          break;

        // 대화 응답(converse)
        case "converse":
          set({
            lastReply: msg as ConverseResponse,
            isVoiceStage: false, 
          });
          break;

        // 주문 시작
        case "order_start":
          set({
            currentStep: "order_start",
            isVoiceStage: true, 
          });
          break;

        // 온도
        case "ask_temperature": {
          const res = msg as AskTemperatureResponse;
          set({
            currentStep: "ask_temperature",
            currentQuestion: res.question,
            choices: res.choices,
            menuName: res.menuName,
          });
          break;
        }

        // 사이즈
        case "ask_size": {
          const res = msg as AskSizeResponse;
          set({
            currentStep: "ask_size",
            currentQuestion: res.question,
            choices: res.choices,
            temperature: res.temperature,
            menuName: res.menuName,
          });
          break;
        }

        // 옵션 여부
        case "ask_detail_option_y": {
          const res = msg as AskDetailOptionYnResponse;
          set({
            currentStep: "detail_option_y",
            currentQuestion: res.question,
            choices: res.choices,
            menuName: res.menuName,
          });
          break;
        }

        // 옵션 목록
        case "show_detail_options": {
          const res = msg as ShowDetailOptionsResponse;
          set({
            currentStep: "detail_options",
            optionGroups: res.optionGroups,
          });
          break;
        }

        // 주문 항목 완료
        case "order_item_complete": {
          const res = msg as OrderItemCompleteResponse;
          set({
            currentStep: "order_item_complete",
            orderCompleteMessage: res.message,
          });
          break;
        }

        // 장바구니 조회
        case "cart": {
          const res = msg as CartResponse;
          set({
            cart: res.items,
            totalPrice: res.totalPrice,
          });
          break;
        }

        // 장바구니 갱신
        case "cart_updated": {
          const res = msg as CartUpdatedResponse;
          set({
            cart: res.items,
            totalPrice: res.totalPrice,
          });
          break;
        }

        // 주문 확정
        case "order_confirm": {
          const res = msg as OrderConfirmResponse;
          set({
            currentStep: "order_confirm",
            cart: res.items,
            totalPrice: res.totalPrice,
          });
          break;
        }
      }
    };

    ws.onclose = () => {
      console.warn("WebSocket 종료 → 재연결 시도");
      setTimeout(() => get().connect(), 2000);
    };

    set({ socket: ws });
  },

  sendMessage: (msg) => {
    const ws = get().socket;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  },

  sendConverse: (text) => {
    get().sendMessage({
      type: "converse",
      data: { userText: text },
    });
  },

  selectTemperature: (temperature) => {
    get().sendMessage({
      type: "select_temperature",
      data: { temperature },
    });
  },

  selectSize: (size) => {
    get().sendMessage({
      type: "select_size",
      data: { size },
    });
  },

  selectDetailOptionYn: (answer) => {
    get().sendMessage({
      type: "detail_option_y",
      data: { answer },
    });
  },

  selectDetailOptions: (selected) => {
    get().sendMessage({
      type: "select_detail_options",
      data: { selectedOptionValueIds: selected },
    });
  },

  getCart: () => {
    get().sendMessage({
      type: "get_cart",
      data: null,
    });
  },

  deleteCartItem: (orderDetailId) => {
    get().sendMessage({
      type: "delete_cart_item",
      data: { orderDetailId },
    });
  },

  orderConfirm: () => {
    get().sendMessage({
      type: "order_confirm",
      data: null,
    });
  },
}));
