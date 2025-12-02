import { create } from "zustand";
import type { KioskRequest } from "@/types/KioskRequest";
import type { KioskResponse } from "@/types/KioskResponse";


interface KioskState {
  socket: WebSocket | null;
  sessionId: string | null;

  connect: () => void;
  sendMessage: (msg: KioskRequest) => void;
}

export const useKioskStore = create<KioskState>((set, get) => ({
  socket: null,
  sessionId: null,

  connect: () => {
    if (get().socket) return;

    const ws = new WebSocket(import.meta.env.VITE_API_URL);

    ws.onopen = () => {
      // 연결되면 자동 start 요청
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

      if ("sessionId" in msg) {
        set({ sessionId: msg.sessionId });
      }
    };

    set({ socket: ws });
  },

  sendMessage: (msg) => {
    const ws = get().socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  },
}));
