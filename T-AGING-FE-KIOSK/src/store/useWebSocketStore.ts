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
  RecentOrderDetailResponse,
  RecentOrdersResponse,
  RecentOrderToCartResponse
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

  // 옵션 그룹 전체
  optionGroups: OptionGroup[] | null;

  // 옵션 그룹 순차 선택을 위한 인덱스
  currentOptionGroupIndex: number;

  // 선택한 옵션 ID 누적
  selectedOptionIds: number[];

  // 장바구니 정보
  cart: CartItem[];
  totalPrice: number | null;

  // 최근 주문 목록
  recentOrders: RecentOrdersResponse["orders"] | null;

  // 최근 주문 상세 정보
  recentOrderDetail: RecentOrderDetailResponse | null;

  connect: () => void;
  sendMessage: (msg: KioskRequest) => void;

  sendConverse: (text: string) => void;
  selectTemperature: (temperature: string) => void;
  selectSize: (size: string) => void;
  selectDetailOptionYn: (answer: string) => void;

  nextOptionGroup: (selectedOptionId: number | null) => void;

  selectDetailOptions: (selected: number[]) => void;

  getCart: () => void;
  deleteCartItem: (orderDetailId: number) => void;
  orderConfirm: () => void;

  // 최근 주문 요청
  getRecentOrders: () => void;

  // 최근 주문 상세 조회
  getRecentOrderDetail: (orderId: number) => void;

  // 최근 주문 선택 → 장바구니 담기
  recentOrderToCart: (orderId: number, orderDetailId: number) => void;
}

export const useKioskStore = create<KioskState>((set, get) => ({
  socket: null,
  sessionId: null,

  lastReply: null,

  isVoiceStage: true,

  orderCompleteMessage: null,

  currentStep: null,
  currentQuestion: null,
  choices: null,

  menuName: null,
  temperature: null,
  size: null,
  optionGroups: null,

  currentOptionGroupIndex: 0,
  selectedOptionIds: [],

  cart: [],
  totalPrice: null,

  // 최근 주문 초기값
  recentOrders: null,

  // 최근 주문 상세 값 초기화
  recentOrderDetail: null,

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
      const msg = JSON.parse(event.data);
      console.log("WS Response:", msg);

      if (
        typeof msg === "object" &&
        msg !== null &&
        "reply" in msg &&
        typeof msg.reply === "string"
      ) {
        set({
          lastReply: {
            type: "converse",
            storedId: msg.storedId,
            menuVersion: msg.menuVersion,
            sessionId: msg.sessionId,
            userText: msg.userText,
            reply: msg.reply,
            intent: msg.intent ?? null,
            reason: msg.reason ?? null,
            items: msg.items ?? [],
          },
          isVoiceStage: false,
        });
        return;
      }

      if (
        typeof msg === "object" &&
        msg !== null &&
        "sessionId" in msg &&
        !("type" in msg)
      ) {
        set({ sessionId: msg.sessionId });
        return;
      }

      const typedMsg = msg as KioskResponse;

      switch (typedMsg.type) {
        case "start":
          set({ sessionId: typedMsg.sessionId });
          break;

        case "converse":
          set({
            lastReply: { ...(typedMsg as ConverseResponse) },
            isVoiceStage: false,
          });
          break;

        case "order_start":
          set({
            currentStep: "order_start",
            isVoiceStage: true,
          });
          break;

        case "ask_temperature": {
          const res = typedMsg as AskTemperatureResponse;
          set({
            currentStep: "ask_temperature",
            currentQuestion: res.question,
            choices: res.choices,
            menuName: res.menuName,
          });
          break;
        }

        case "ask_size": {
          const res = typedMsg as AskSizeResponse;
          set({
            currentStep: "ask_size",
            currentQuestion: res.question,
            choices: res.choices,
            temperature: res.temperature,
            menuName: res.menuName,
          });
          break;
        }

        case "ask_detail_option_yn": {
          const res = typedMsg as AskDetailOptionYnResponse;
          set({
            currentStep: "ask_detail_option_yn",
            currentQuestion: res.question,
            choices: res.choices,
            menuName: res.menuName,
            temperature: res.temperature,
            size: res.size,
          });
          break;
        }

        case "show_detail_options": {
          const res = typedMsg as ShowDetailOptionsResponse;
          set({
            currentStep: "show_detail_options",
            optionGroups: res.optionGroups,
            currentOptionGroupIndex: 0,
            selectedOptionIds: [],
          });
          break;
        }

        case "order_item_complete": {
          const res = typedMsg as OrderItemCompleteResponse;
          set({
            currentStep: "order_item_complete",
            orderCompleteMessage: res.message,
          });
          break;
        }

        case "cart": {
          const res = typedMsg as CartResponse;
          set({
            currentStep: "cart",
            cart: res.items,
            totalPrice: res.totalPrice,
            isVoiceStage: false,
          });
          break;
        }

        case "cart_updated": {
          const res = typedMsg as CartUpdatedResponse;
          set({
            currentStep: "cart",
            cart: res.items,
            totalPrice: res.totalPrice,
            isVoiceStage: false,
          });
          break;
        }

        case "order_confirm": {
          const res = typedMsg as OrderConfirmResponse;
          set({
            currentStep: "order_confirm",
            cart: res.items,
            totalPrice: res.totalPrice,
          });
          break;
        }

        // 최근 주문 응답 처리
        case "recent_orders": {
          const res = typedMsg as RecentOrdersResponse;
          set({
            currentStep: "recent_orders",
            recentOrders: res.orders,
            isVoiceStage: false,
          });
          break;
        }

        // 최근 주문 상세 응답 처리
        case "recent_order_detail": {
          const res = typedMsg as RecentOrderDetailResponse;
          set({
            currentStep: "recent_order_detail",
            recentOrderDetail: res,
            isVoiceStage: false,
          });
          break;
        }

        // 최근 주문 선택 → 장바구니 담기 응답 처리
        case "recent_order_to_cart": {
          const res = typedMsg as RecentOrderToCartResponse;
          set({
            currentStep: "recent_order_to_cart",
            cart: res.items,
            totalPrice: res.totalPrice,
            isVoiceStage: false,
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
      type: "detail_option_yn",
      data: { answer },
    });
  },

  nextOptionGroup: (selectedOptionId: number | null) => {
    const state = get();

    if (selectedOptionId !== null) {
      set({
        selectedOptionIds: [...state.selectedOptionIds, selectedOptionId],
      });
    }

    const nextIndex = state.currentOptionGroupIndex + 1;
    const total = state.optionGroups?.length ?? 0;

    if (nextIndex >= total) {
      get().sendMessage({
        type: "select_detail_options",
        data: { selectedOptionValueIds: get().selectedOptionIds },
      });

      get().sendMessage({
        type: "get_cart",
        data: null,
      });

      set({
        currentOptionGroupIndex: 0,
        selectedOptionIds: [],
      });

      return;
    }

    set({
      currentOptionGroupIndex: nextIndex,
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

  // 최근 주문 요청
  getRecentOrders: () => {
    get().sendMessage({
      type: "recent_orders",
      data: null,
    });
  },

  // 최근 주문 상세 조회
  getRecentOrderDetail: (orderId: number) => {
    get().sendMessage({
      type: "recent_order_detail",
      data: { orderId },
    });
  },

  // 장바구니 담기
  recentOrderToCart: (orderId: number, orderDetailId: number) => {
    get().sendMessage({
      type: "recent_order_to_cart",
      data: { orderId, orderDetailId },
    });
  },
}));
