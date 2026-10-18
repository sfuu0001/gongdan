/**
 * 本地 Mock 订单数据源（映射前的原始 Order 形态）
 *
 * 来源：主工程 src/components/OrdersPageView.tsx
 *   L435-545 defaultInProgressOrders（4 条，原为已映射的卡片视图模型）
 *   L548-569 defaultDeliveredOrders
 *   L572-613 defaultHistoryOrders
 *
 * 说明：这里刻意还原为「原始 Order」形态，让它经 WorkOrderPage 内的
 * dynamicInProgress / dynamicDelivered 映射层（L616-688 / L690-731）后
 * 渲染出与原工程一致的卡片。首单 #UR-DIN-9821 严格对齐截图基准。
 */
import type { Order } from '../types';

/** 进行中订单（原始形态） */
export const MOCK_IN_PROGRESS_ORDERS: Order[] = [
  {
    id: 'ord-din-9821',
    orderNo: 'UR-DIN-9821',
    truckName: '黑曜石 01 号流动餐车',
    userId: 'tcb_u_88201948',
    userPhone: '138-8888-9201',
    customerName: '黑曜石先锋食客 #3F0EE6',
    channel: 'dine_in',
    channelType: 'dine_in',
    tableCode: 'A1',
    tableZone: '餐车外摆休闲区',
    serverName: '传菜专员小林',
    status: 'cooking',
    statusText: '餐车已接单 · 后厨现制中',
    createdTime: '12:20:15',
    estimatedDeliveryTime: '12:23',
    etaMinutes: 3,
    deliveryAddress: '餐车外摆 A1 号桌',
    progressPercent: 40,
    stepIndex: 1,
    totalAmount: 186.0,
    courierName: '传菜专员小林',
    courierPhone: '138-0012-9821',
    items: [
      {
        dishId: 'dish-burger-wagyu-slider',
        name: '碳烤和牛小汉堡双重奏',
        quantity: 2,
        price: 31.5,
        serveStatus: 'served',
        prepProgress: 100,
        station: '炭火炙烤档',
        serveTime: '12:35'
      },
      {
        dishId: 'dish-coldbrew-night',
        name: '黑曜极夜冷萃冰咖',
        quantity: 1,
        price: 22,
        serveStatus: 'served',
        prepProgress: 100,
        station: '冷饮现调档',
        serveTime: '12:26'
      },
      {
        dishId: 'dish-tiramisu-jasmine',
        name: '冷萃黑金茉莉提拉米苏',
        quantity: 1,
        price: 38,
        serveStatus: 'cooking',
        prepProgress: 75,
        station: '西点烘焙档'
      }
    ]
  },
  {
    id: 'ord-pk-8806',
    orderNo: 'UR-PK-8806',
    truckName: '黑曜石 01 号流动餐车',
    userId: 'tcb_u_88201948',
    userPhone: '138-8888-9201',
    customerName: '黑曜石先锋食客 #3F0EE6',
    channel: 'pickup',
    channelType: 'pickup',
    pickupCode: '8806',
    pickupShelfCode: '01 号智能保温取餐柜 (65℃恒温)',
    status: 'ready',
    statusText: '已制作完成 · 待取餐',
    createdTime: '12:30',
    estimatedDeliveryTime: '5 分钟',
    etaMinutes: 5,
    deliveryAddress: '黑曜石 01 号流动餐车 · 智能取餐柜',
    progressPercent: 50,
    stepIndex: 2,
    totalAmount: 87.0,
    courierName: '餐车吧台主理人',
    courierPhone: '138-1829-9201',
    items: [
      {
        dishId: 'dish-yakitori-pork-belly',
        name: '果木烟熏黑豚炙烤五花',
        quantity: 1,
        price: 55,
        serveStatus: 'ready_to_serve',
        prepProgress: 100,
        station: '01号智能保温格'
      },
      {
        dishId: 'dish-fries-truffle',
        name: '黑曜石松露金黄脆薯',
        quantity: 1,
        price: 32,
        serveStatus: 'ready_to_serve',
        prepProgress: 100,
        station: '01号智能保温格'
      }
    ]
  },
  {
    id: 'ord-ur-9821',
    orderNo: 'UR-DEL-9821',
    truckName: '黑曜石 01 号流动餐车',
    userId: 'tcb_u_88201948',
    userPhone: '138-8888-9201',
    customerName: '黑曜石先锋食客 #3F0EE6',
    channel: 'delivery',
    channelType: 'delivery',
    status: 'delivering',
    statusText: '骑手配送中 · 极速专送',
    createdTime: '12:40',
    estimatedDeliveryTime: '12:55:00',
    etaMinutes: 15,
    deliveryAddress: '云顶科创园 B 座 18F',
    progressPercent: 75,
    stepIndex: 3,
    totalAmount: 91.0,
    courierName: '陈志远 (专线骑手 R-8821)',
    courierPhone: '138-1829-9201',
    items: [
      {
        dishId: 'dish-coldbrew-oat-latte',
        name: '极夜燕麦拿铁',
        quantity: 1,
        price: 28,
        serveStatus: 'ready_to_serve',
        prepProgress: 100,
        station: '冷饮吧台'
      },
      {
        dishId: 'dish-dessert-cinnamon-roll',
        name: '现烤肉桂卷',
        quantity: 1,
        price: 35,
        serveStatus: 'ready_to_serve',
        prepProgress: 100,
        station: '烘焙烤箱'
      }
    ]
  },
  {
    id: 'ord-ur-9804',
    orderNo: 'UR-DEL-9804',
    truckName: '黑曜石 01 号流动餐车',
    userId: 'tcb_u_88201948',
    userPhone: '138-8888-9201',
    customerName: '黑曜石先锋食客 #3F0EE6',
    channel: 'delivery',
    channelType: 'delivery',
    status: 'cooking',
    statusText: '餐车已接单 · 后厨现制中',
    createdTime: '12:30',
    estimatedDeliveryTime: '12 分钟',
    etaMinutes: 12,
    deliveryAddress: '云顶科创园 A 座 6F',
    progressPercent: 40,
    stepIndex: 1,
    totalAmount: 87.0,
    courierName: '餐车吧台主理人',
    courierPhone: '138-1829-9201',
    items: [
      {
        dishId: 'dish-burger-double-wagyu',
        name: '黑曜石炭烤双层和牛堡',
        quantity: 1,
        price: 87,
        serveStatus: 'cooking',
        prepProgress: 45,
        station: '炭火炙烤档'
      }
    ]
  }
];

/** 近期送达订单（原始形态） */
export const MOCK_DELIVERED_ORDERS: Order[] = [
  {
    id: 'ord-ur-4890',
    orderNo: 'UR-DEL-4890',
    truckName: '黑曜石 01 号流动餐车',
    userId: 'tcb_u_88201948',
    userPhone: '138-8888-9201',
    customerName: '黑曜石先锋食客 #3F0EE6',
    channel: 'delivery',
    channelType: 'delivery',
    status: 'completed',
    statusText: '订单已妥投送达 · 感谢惠顾',
    createdTime: '11:00',
    estimatedDeliveryTime: '11:20',
    etaMinutes: 20,
    deliveryAddress: '云顶科创园 B 座 18F',
    progressPercent: 100,
    stepIndex: 7,
    totalAmount: 186.0,
    courierName: '陈志远 (专线骑手 R-8821)',
    courierPhone: '138-1829-9201',
    items: [
      { name: '炭烤伊比利亚猪排', quantity: 1, price: 88, serveStatus: 'served', prepProgress: 100, station: '炭火炙烤档' },
      { name: '温泉蛋牛油果沙拉', quantity: 1, price: 48, serveStatus: 'served', prepProgress: 100, station: '冷饮现调档' },
      { name: '气泡水', quantity: 2, price: 25, serveStatus: 'served', prepProgress: 100, station: '冷饮现调档' }
    ]
  }
];

/** 历史订单（原始形态，直接作为卡片视图模型使用） */
export const MOCK_HISTORY_ORDERS: any[] = [
  {
    id: 'ord-ur-4780',
    title: '黑曜石 01 号流动餐车',
    orderNo: 'UR-DEL-4780',
    channelType: 'delivery',
    channel: 'delivery',
    rawStatus: 'completed',
    status: 'DELIVERED',
    statusType: 'delivered',
    estArrival: '昨天 18:30',
    distance: '1.2 公里',
    itemsCount: 2,
    itemsSummary: '炭烤和牛小汉堡双重奏, 黑曜极夜冷萃冰咖',
    items: [
      { name: '炭烤和牛小汉堡双重奏', quantity: 1, price: 58, serveStatus: 'served', prepProgress: 100, station: '炭火炙烤档' },
      { name: '黑曜极夜冷萃冰咖', quantity: 1, price: 22, serveStatus: 'served', prepProgress: 100, station: '冷饮现调档' }
    ],
    totalAmount: 88.0,
    hasTopAccent: false,
    stepIndex: 4,
    isRecentlyUpdated: false,
    courierName: '陈志远 (专线骑手 R-8821)',
    courierPhone: '138-1829-9201',
    createdTime: '昨天 18:30'
  },
  {
    id: 'ord-ur-4652',
    title: '黑曜石 01 号流动餐车',
    orderNo: 'UR-DEL-4652',
    channelType: 'delivery',
    channel: 'delivery',
    rawStatus: 'completed',
    status: 'DELIVERED',
    statusType: 'delivered',
    estArrival: '前天 12:15',
    distance: '1.2 公里',
    itemsCount: 3,
    itemsSummary: '炭烤伊比利亚猪排, 温泉蛋牛油果沙拉, 气泡水 x 1',
    items: [
      { name: '炭烤伊比利亚猪排', quantity: 1, price: 88, serveStatus: 'served', prepProgress: 100, station: '炭火炙烤档' },
      { name: '温泉蛋牛油果沙拉', quantity: 1, price: 48, serveStatus: 'served', prepProgress: 100, station: '冷饮现调档' },
      { name: '气泡水', quantity: 1, price: 9, serveStatus: 'served', prepProgress: 100, station: '冷饮现调档' }
    ],
    totalAmount: 145.0,
    hasTopAccent: false,
    stepIndex: 4,
    isRecentlyUpdated: false,
    courierName: '陈志远 (专线骑手 R-8821)',
    courierPhone: '138-1829-9201',
    createdTime: '前天 12:15'
  }
];

/** 全量订单（原始形态），供筛选/计数使用 */
export const MOCK_ORDERS: Order[] = [
  ...MOCK_IN_PROGRESS_ORDERS,
  ...MOCK_DELIVERED_ORDERS
];

export interface FetchOrdersResult {
  success: true;
  functionName: 'orders';
  source: 'local_fallback';
  orders: Order[];
}

/**
 * 本地版「云函数拉取」：模拟 600ms 网络延迟后离线解析同一批数据
 */
export function fetchOrdersFromCloudFunction(
  _payload?: any,
  _uid?: string
): Promise<FetchOrdersResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        functionName: 'orders',
        source: 'local_fallback',
        orders: MOCK_ORDERS.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) }))
      });
    }, 600);
  });
}
