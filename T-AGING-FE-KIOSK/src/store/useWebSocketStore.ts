import { create } from "zustand";
import type { KioskRequest } from "@/types/KioskRequest";
import type { KioskResponse } from "@/types/KioskResponse";

interface KioskState {
  socket: WebSocket | null;
  sessionId: string | null;
  lastReply: string | null; // 응답 저장

  connect: () => void;
  sendMessage: (msg: KioskRequest) => void;
  sendConverse: (text: string) => void; //converse 요청
}

export const useKioskStore = create<KioskState>((set, get) => ({
  socket: null,
  sessionId: null,
  lastReply: null,

  connect: () => {
    if (get().socket) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onopen = () => {
      const startMsg: KioskRequest = {
        type: "start",
        data: {
          storeId: "001",
          menuVersion: 1,
        },
      };
      ws.send(JSON.stringify(startMsg));
    };

    ws.onmessage = (event) => {
      const msg: KioskResponse = JSON.parse(event.data);

      // 🔹 START 응답
      if ("sessionId" in msg) {
        set({ sessionId: msg.sessionId });
      }

      // 🔹 CONVERSE 응답
      if ("reply" in msg) {
        set({ lastReply: msg.reply });
      }
    };

    set({ socket: ws });
  },

  sendMessage: (msg) => {
    const ws = get().socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  },

  //converse 요청 전용 함수
  sendConverse: (text) => {
    const ws = get().socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const msg: KioskRequest = {
      type: "converse",
      data: { userText: text },
    };

    ws.send(JSON.stringify(msg));
  },
}));
