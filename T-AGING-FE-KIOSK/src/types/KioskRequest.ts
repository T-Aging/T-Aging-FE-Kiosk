export type KioskRequest =
  | {
      type: "start";
      data: {
        storeId: string;
        menuVersion: number;
      };
    }
  | {
      type: "converse";
      data: {
        userText: string;
      };
    };
