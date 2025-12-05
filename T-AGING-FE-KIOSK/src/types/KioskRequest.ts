// start 요청
export interface StartRequest {
  type: "start";
  data: {
    storeId: string;
    menuVersion: number;
  };
}

// converse 요청
export interface ConverseRequest {
  type: "converse";
  data: {
    userText: string;
  };
}

// 온도 선택 요청
export interface SelectTemperatureRequest {
  type: "select_temperature";
  data: {
    temperature: string;
  };
}

// 사이즈 선택 요청
export interface SelectSizeRequest {
  type: "select_size";
  data: {
    size: string;
  };
}

// 옵션 여부(Y/N) 요청
export interface DetailOptionYnRequest {
  type: "detail_option_y";
  data: {
    answer: string;
  };
}

// 옵션 상세 선택 요청
export interface SelectDetailOptionsRequest {
  type: "select_detail_options";
  data: {
    selectedOptionValueIds: number[];
  };
}

// 장바구니 조회 요청
export interface GetCartRequest {
  type: "get_cart";
  data: null;
}

// 장바구니 항목 삭제 요청
export interface DeleteCartItemRequest {
  type: "delete_cart_item";
  data: {
    orderDetailId: number;
  };
}

// 주문 확정 요청
export interface OrderConfirmRequest {
  type: "order_confirm";
  data: null;
}

// 전체 Request 타입 묶기
export type KioskRequest =
  | StartRequest
  | ConverseRequest
  | SelectTemperatureRequest
  | SelectSizeRequest
  | DetailOptionYnRequest
  | SelectDetailOptionsRequest
  | GetCartRequest
  | DeleteCartItemRequest
  | OrderConfirmRequest;
