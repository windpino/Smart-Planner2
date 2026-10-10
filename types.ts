export interface ProductDefinition {
  id: string;
  name: string;
  shortcut: string;
  category: string; // 카테고리 추가
  price?: number; // 금액 추가
  memo?: string; // 메모 추가
}

export interface ClientDefinition {
  id: string;
  name: string; // 거래처명
  shortcut?: string; // 거래처단축명
  phone?: string; // 전화번호
  category?: string; // 카테고리
  memo?: string; // 메모 추가
  sequence?: number; // 순번
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: string; // 품목의 카테고리 복사본
  unitQuantity: number; // 낱개 수량 (박스 제거)
  isLoaded: boolean;
  isUnregistered?: boolean;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  memo?: string; // 메모 필드 추가
  date: string; // YYYY-MM-DD
  createdAt: number;
  isDelivered?: boolean; // 납품 완료 여부
}

export interface FinancialRecord {
  date: string; // YYYY-MM-DD
  cash: number;
  transfer: number;
  card: number;
  note: number;
  expense?: number; // 지출 추가
  expenseMemo?: string; // 지출 내역
  isClosed?: boolean; // 마감 확인
}

export interface ScheduleEvent {
  id: string;
  title: string; // 일정 제목
  content?: string; // 내용 추가
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  alarm?: number; // 알람 (분 단위)
  createdAt: number;
}

export type ViewMode = 'CALENDAR' | 'DAY_DETAIL';