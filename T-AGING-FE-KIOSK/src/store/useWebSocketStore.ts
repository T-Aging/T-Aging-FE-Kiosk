import { create } from "zustand";
import type { KioskRequest } from "@/types/KioskRequest";
import type {
  KioskResponse,
  OptionGroup,
  CartItem,
  ConverseResponse,
  RecentOrderDetailResponse,
  RecentOrdersResponse,
  QrLoginResponse,
  PhoneNumLoginResponse,
  OrderConfirmResponse,
} from "@/types/KioskResponse";

interface KioskState {
  socket: WebSocket | null;
  sessionId: string | null;
  lastReply: ConverseResponse | QrLoginResponse | PhoneNumLoginResponse | OrderConfirmResponse | null;
  isVoiceStage: boolean;
  orderCompleteMessage: string | null;
  currentStep: string | null;
  currentQuestion: string | null;
  choices: string[] | null;
  menuName: string | null;
  temperature: string | null;
  size: string | null;
  optionGroups: OptionGroup[] | null;
  currentOptionGroupIndex: number;
  selectedOptionIds: number[];
  cart: CartItem[];
  totalPrice: number | null;
  recentOrders: RecentOrdersResponse["orders"] | null;
  recentOrderDetail: RecentOrderDetailResponse | null;

  isFirstOrder: boolean;
  setIsFirstOrder: (v: boolean) => void;

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

  getRecentOrders: () => void;
  getRecentOrderDetail: (orderId: number) => void;
  recentOrderToCart: (orderId: number) => void;

  sendSessionEnd: () => void;

  resetState: () => void;
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

  recentOrders: null,
  recentOrderDetail: null,

  // ⬇⬇⬇ 신규 필드 초기값
  isFirstOrder: true,
  setIsFirstOrder: (v) => set({ isFirstOrder: v }),

  connect: () => {
    if (get().socket) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onopen = () => {
      console.log("WebSocket 연결 성공");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("WS Response:", msg);

      if (msg.type === "qr_login") {
        set({ lastReply: msg as QrLoginResponse });
        return;
      }

      if (msg.type === "phone_num_login") {
        set({ lastReply: msg as PhoneNumLoginResponse });
        return;
      }

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
            items: msg.items ?? []
          },
          isVoiceStage: false
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
            isVoiceStage: false
          });
          break;

        case "order_start":
          set({
            currentStep: "order_start",
            isVoiceStage: true
          });
          break;

        case "ask_temperature":
          set({
            currentStep: "ask_temperature",
            currentQuestion: typedMsg.question,
            choices: typedMsg.choices,
            menuName: typedMsg.menuName
          });
          break;

        case "ask_size":
          set({
            currentStep: "ask_size",
            currentQuestion: typedMsg.question,
            choices: typedMsg.choices,
            temperature: typedMsg.temperature,
            menuName: typedMsg.menuName
          });
          break;

        case "ask_detail_option_yn":
          set({
            currentStep: "ask_detail_option_yn",
            currentQuestion: typedMsg.question,
            choices: typedMsg.choices,
            menuName: typedMsg.menuName,
            temperature: typedMsg.temperature,
            size: typedMsg.size
          });
          break;

        case "show_detail_options":
          set({
            currentStep: "show_detail_options",
            optionGroups: typedMsg.optionGroups,
            currentOptionGroupIndex: 0,
            selectedOptionIds: []
          });
          break;

        case "order_item_complete":
          set({
            currentStep: "order_item_complete",
            orderCompleteMessage: typedMsg.message
          });
          break;

        case "cart":
          set({
            currentStep: "cart",
            cart: typedMsg.items,
            totalPrice: typedMsg.totalPrice,
            isVoiceStage: false
          });
          break;

        case "cart_updated":
          set({
            currentStep: "cart",
            cart: typedMsg.items,
            totalPrice: typedMsg.totalPrice,
            isVoiceStage: false
          });
          break;

        case "order_confirm":
          set({
            currentStep: "order_confirm",
            lastReply: typedMsg,
            cart: typedMsg.items,
            totalPrice: typedMsg.totalPrice
          });
          break;

        case "recent_orders":
          set({
            currentStep: "recent_orders",
            recentOrders: typedMsg.orders,
            isVoiceStage: true
          });
          break;

        case "recent_order_detail":
          set({
            currentStep: "recent_order_detail",
            recentOrderDetail: typedMsg,
            isVoiceStage: true
          });
          break;

        case "recent_order_to_cart":
          set({
            currentStep: "recent_order_to_cart",
            cart: typedMsg.items,
            totalPrice: typedMsg.totalPrice,
            isVoiceStage: true
          });
          break;

        case "SESSION_ENDED":
          set({
            sessionId: null,
            currentStep: "session_end"
          });
          break;
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
      data: { userText: text }
    });
  },

  selectTemperature: (temperature) => {
    get().sendMessage({
      type: "select_temperature",
      data: { temperature }
    });
  },

  selectSize: (size) => {
    get().sendMessage({
      type: "select_size",
      data: { size }
    });
  },

  selectDetailOptionYn: (answer) => {
    get().sendMessage({
      type: "detail_option_yn",
      data: { answer }
    });
  },

  nextOptionGroup: (selectedOptionId) => {
    const state = get();

    if (selectedOptionId !== null) {
      set({
        selectedOptionIds: [...state.selectedOptionIds, selectedOptionId]
      });
    }

    const nextIndex = state.currentOptionGroupIndex + 1;
    const total = state.optionGroups?.length ?? 0;

    if (nextIndex >= total) {
      get().sendMessage({
        type: "select_detail_options",
        data: { selectedOptionValueIds: get().selectedOptionIds }
      });

      get().sendMessage({
        type: "get_cart",
        data: null
      });

      set({
        currentOptionGroupIndex: 0,
        selectedOptionIds: []
      });

      return;
    }

    set({
      currentOptionGroupIndex: nextIndex
    });
  },

  selectDetailOptions: (selected) => {
    get().sendMessage({
      type: "select_detail_options",
      data: { selectedOptionValueIds: selected }
    });
  },

  getCart: () => {
    get().sendMessage({
      type: "get_cart",
      data: null
    });
  },

  deleteCartItem: (orderDetailId) => {
    get().sendMessage({
      type: "delete_cart_item",
      data: { orderDetailId }
    });
  },

  orderConfirm: () => {
    get().sendMessage({
      type: "order_confirm",
      data: null
    });
  },

  getRecentOrders: () => {
    get().sendMessage({
      type: "recent_orders",
      data: null
    });
  },

  getRecentOrderDetail: (orderId) => {
    get().sendMessage({
      type: "recent_order_detail",
      data: { orderId }
    });
  },

  recentOrderToCart: (orderId) => {
    get().sendMessage({
      type: "recent_order_to_cart",
      data: { orderId }
    });
  },

  sendSessionEnd: () => {
    const ws = get().socket;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "session_end", data: null }));
    }
    set({
      sessionId: null,
      currentStep: "session_end",
      isVoiceStage: false
    });
  },

  resetState: () =>
    set({
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

      recentOrders: null,
      recentOrderDetail: null,

      isFirstOrder: true,
    }),
}));
