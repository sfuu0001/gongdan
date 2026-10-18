/**
 * 工单页（实时订单流）独立包 —— 本屏实际用到的类型子集
 * 来源：主工程 src/types.ts（Order / OrderItemRecord）+ src/types/user.ts（UserProfile）
 * 仅保留本屏渲染与状态机所需的字段，未改动任何字段语义。
 */

export type TabType = 'in_progress' | 'recently_delivered' | 'history';

/** 抽屉默认展开模式 */
export type DrawerExpandMode = 'all' | 'first' | 'none';

/** 订单项（菜品）记录 */
export interface OrderItemRecord {
  dishId?: string;
  name: string;
  quantity: number;
  price: number;
  options?: string[];
  variantName?: string;
  variantPrice?: number;
  imageUrl?: string;
  serveStatus?: 'preparing' | 'cooking' | 'ready_to_serve' | 'served' | 'urged';
  prepProgress?: number;
  station?: string;
  serveTime?: string;
  isStruckOff?: boolean;
  struckOffReason?: string;
  struckOffAt?: string;
  struckOffOperator?: string;
  compensationType?: string;
  compensationDetail?: string;
  compensationAmount?: number;
  isCompensatoryGift?: boolean;
  replacedFromDishName?: string;
  addedBy?: string;
  addedByAvatar?: string;
  participantId?: string;
}

/** 订单状态（英文 key，与状态配置表的 GranularOrderStatus 一致） */
export type OrderStatus =
  | 'pending'
  | 'cooking'
  | 'ready'
  | 'rider_heading'
  | 'waiting_pickup'
  | 'picked_up'
  | 'delivering'
  | 'completed'
  | 'cancel_requested'
  | 'merchant_rejected'
  | 'rider_rejected'
  | 'reassigning_rider'
  | 'refund_pending'
  | 'refunded'
  | 'cancelled';

/** 原始订单（映射前的数据形态） */
export interface Order {
  id: string;
  orderNo: string;
  truckName: string;
  items: OrderItemRecord[];
  totalAmount: number;
  status: OrderStatus | string;
  statusText?: string;
  createdTime: string;
  updatedAt?: string;
  estimatedDeliveryTime?: string;
  etaMinutes?: number;
  courierName?: string;
  courierPhone?: string;
  deliveryAddress?: string;
  progressPercent?: number;
  /** 原始履约节点（1-7），映射层会压缩为 0-4 级 */
  stepIndex?: number;
  channelType?: 'delivery' | 'dine_in' | 'pickup';
  channel?: 'delivery' | 'dine_in' | 'pickup' | string;
  // 渠道附属信息
  tableCode?: string;
  tableZone?: string;
  serverName?: string;
  pickupCode?: string;
  pickupShelfCode?: string;
  // 食客信息
  userId?: string;
  userPhone?: string;
  customerName?: string;
  // 退单相关
  nonRefundable?: boolean;
  refundStatus?: string;
  refundReason?: string;
  refundFeedback?: string;
  refundAppliedAt?: string;
  refundRejectReason?: string;
  refundPassedStep?: number;
  // 运行期标记
  isRecentlyUpdated?: boolean;
  statusUpdatedAt?: string;
}

/** 当前登录食客 */
export interface UserProfile {
  uid: string;
  nickname: string;
  phone: string;
  avatar?: string;
}
