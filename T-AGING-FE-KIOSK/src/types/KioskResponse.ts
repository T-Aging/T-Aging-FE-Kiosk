// QR 로그인 응답 타입
export interface QrLoginResponse {
  type: "qr_login";
  login_success: boolean;
  message: string;
  userId: number;
  username: string;
}

// 전화번호 로그인 응답 타입
export interface PhoneNumLoginResponse {
  type: "phone_num_login";
  login_success: boolean;
  message: string;
  userId: number | null;
  username: string | null;
  maskedPhone: string | null;
}


// 옵션 아이템 타입
export interface OptionItem {
  optionGroupId: number;
  optionGroupName: string;
  optionValueId: number;
  optionValueName: string;
  extraPrice: number;
}

// 옵션 그룹 타입
export interface OptionGroup {
  groupName: string;
  maxSelect: number;
  options: {
    id: number;
    name: string;
    extraPrice: number;
  }[];
}

// 장바구니 아이템 타입
export interface CartItem {
  orderDetailId: number;
  menuId: number;
  menuName: string;
  menuImage: string;
  quantity: number;
  unitPrice: number;
  lineTotalPrice: number;
  temperature: string;
  size: string;
  options: OptionItem[];
}

// 기본 Response 타입
export interface BaseResponse {
  type: string;
  sessionId: string;
}

// start 응답
export interface StartResponse {
  type: "start";
  storeId: string;
  menuVersion: number;
  sessionId: string;
  menuCount: number;
}

// 최근 주문 내역 아이템 타입
export interface RecentOrderItem {
  orderId: number;
  totalPrice: number;
  orderDateTime: string;
  daysAgo: number;
  mainMenuName: string;
  mainMenuPrice: number;
  otherMenuCount: number;
}

// 최근 주문 응답 타입
export interface RecentOrdersResponse {
  type: "recent_orders";
  orders: RecentOrderItem[];
}

// 최근 주문 상세 옵션 아이템 타입
export interface RecentOrderDetailOptionItem {
  optionGroupId: number;
  optionGroupName: string;
  optionValueId: number;
  optionValueName: string;
  extraPrice: number;
}

// 최근 주문 상세 아이템 타입
export interface RecentOrderDetailItem {
  orderDetailId: number;
  menuId: number;
  menuName: string;
  menuImage: string;
  quantity: number;
  unitPrice: number;
  lineTotalPrice: number;
  temperature: string;
  size: string;
  options: RecentOrderDetailOptionItem[];
}

// 최근 주문 상세 응답 타입
export interface RecentOrderDetailResponse {
  type: "recent_order_detail";
  orderId: number;
  storeId: number;
  storeName: string;
  sessionId: string;
  orderDateTime: string;
  totalPrice: number;
  items: RecentOrderDetailItem[];
}

// 최근 주문 메뉴 장바구니 담기 응답 타입
export interface RecentOrderToCartResponse {
  type: "recent_order_to_cart";
  orderId: number;
  storeId: number;
  storeName: string;
  sessionId: string;
  orderDateTime: string;
  totalPrice: number;
  waitingNum: number | null;
  items: RecentOrderDetailItem[];
}

// converse 추천 메뉴 아이템 타입
export interface ConverseItem {
  name: string;
  price: number;
  menu_image: string;
}

// converse 응답
export interface ConverseResponse {
  type: "converse"; 
  storedId: string;
  menuVersion: number;
  sessionId: string;
  userText: string;
  reply: string;
  intent: string | null;
  reason: string | null;
  items?: ConverseItem[];
}



// order_start 응답
export interface OrderStartResponse {
  type: "order_start";
  menuName: string;
}

// 온도 선택 질문
export interface AskTemperatureResponse {
  type: "ask_temperature";
  menuName: string;
  question: string;
  choices: string[];
}

// 사이즈 선택 질문
export interface AskSizeResponse {
  type: "ask_size";
  menuName: string;
  temperature: string;
  question: string;
  choices: string[];
}

// 옵션 여부 질문
export interface AskDetailOptionYnResponse {
  type: "ask_detail_option_yn";
  menuName: string;
  temperature: string;
  size: string;
  question: string;
  choices: string[];
}

// 옵션 목록 표시
export interface ShowDetailOptionsResponse {
  type: "show_detail_options";
  menuName: string;
  optionGroups: OptionGroup[];
}

// 주문 항목 완료 응답
export interface OrderItemCompleteResponse {
  type: "order_item_complete";
  message: string;
}

// 장바구니 조회 응답
export interface CartResponse {
  type: "cart";
  storeId: number;
  sessionId: string;
  totalPrice: number;
  items: CartItem[];
}

// 장바구니 업데이트 응답 (삭제 이후)
export interface CartUpdatedResponse {
  type: "cart_updated";
  storeId: number;
  sessionId: string;
  totalPrice: number;
  items: CartItem[];
}

// 주문 확정 응답
export interface OrderConfirmResponse {
  type: "order_confirm";
  orderId: number;
  storeId: number;
  storeName: string;
  sessionId: string;
  orderDateTime: string;
  totalPrice: number;
  items: CartItem[];
}
// 세션 종료 응답
export interface SessionEndedResponse {
  type: "SESSION_ENDED";
  message: string;
}

// 전체 Response 타입
export type KioskResponse =
  | StartResponse
  | ConverseResponse
  | OrderStartResponse
  | AskTemperatureResponse
  | AskSizeResponse
  | AskDetailOptionYnResponse
  | ShowDetailOptionsResponse
  | OrderItemCompleteResponse
  | CartResponse
  | CartUpdatedResponse
  | OrderConfirmResponse
  | RecentOrdersResponse
  | RecentOrderDetailResponse
  | RecentOrderToCartResponse
  | SessionEndedResponse
  | QrLoginResponse
  | PhoneNumLoginResponse;