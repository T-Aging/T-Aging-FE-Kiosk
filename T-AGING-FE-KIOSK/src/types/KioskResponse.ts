export type BaseResponse = {
  storeId: string;
  menuVersion: number;
  sessionId: string;
};

export type KioskStartResponse = BaseResponse & {
  menuCount: number;
};

export type KioskConverseResponse = BaseResponse & {
  userText: string;
  reply: string;
  cacheHit: boolean;
};

export type KioskResponse =
  | KioskStartResponse
  | KioskConverseResponse;
