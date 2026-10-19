import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  RefreshCw,
  Bell,
  User,
  Search,
  Cloud,
  ChevronRight,
  Clock,
  CheckCircle2,
  CookingPot,
  UtensilsCrossed,
  ChevronDown,
  SlidersHorizontal,
  Check,
  Layers,
  X,
  ShoppingBag,
  Zap,
  Orbit,
  Sparkles,
  Tag,
  CornerDownLeft
} from 'lucide-react';
import { useToast } from '../ui/ToastProvider';
import { HorizontalStepsScroller } from './HorizontalStepsScroller';
import { CarouselStepsScroller } from './CarouselStepsScroller';
import { RealTimeOrderCard } from './RealTimeOrderCard';
import { getOrderStatusConfig } from '../data/statusConfig';
import { MOCK_ORDERS, MOCK_DELIVERED_ORDERS, MOCK_HISTORY_ORDERS, fetchOrdersFromCloudFunction } from '../data/orders';
import type { Order, UserProfile, TabType } from '../types';

export interface WorkOrderPageProps {
  userProfile?: UserProfile;
  onGoToMenu?: () => void;
  onOpenVIP?: () => void;
  onOpenMessageCenter?: (orderNo: string) => void;
  onTrackRadar?: (orderNo: string) => void;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  uid: 'tcb_u_88201948',
  nickname: '黑曜石先锋食客 #3F0EE6',
  phone: ''
};

interface AutoSuggestItem {
  id: string;
  type: 'order' | 'dish' | 'customer' | 'code' | 'tag';
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    className: string;
  };
  fillValue: string;
  order?: Order;
}

const renderHighlighted = (text: string, query: string) => {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return text;
  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);
  return (
    <>
      {before}
      <span className="text-[#3F0EE6] bg-indigo-50 font-bold px-0.5 rounded">
        {match}
      </span>
      {after}
    </>
  );
};

export const WorkOrderPage: React.FC<WorkOrderPageProps> = ({
  userProfile = DEFAULT_USER_PROFILE,
  onGoToMenu,
  onOpenVIP,
  onOpenMessageCenter,
  onTrackRadar
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('in_progress');
  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  // Collapsible Dropdown state for Dish Preparation & Order Status Details (设计成下拉菜单)
  const [expandedProgressIds, setExpandedProgressIds] = useState<Record<string, boolean>>({});

  // 出餐进度抽屉展开模式 (全部自动展开 / 仅首单展开 / 全部保持折叠)
  const [drawerExpandMode, setDrawerExpandMode] = useState<'all' | 'first' | 'none'>(() => {
    try {
      const saved = localStorage.getItem('urban_radar_drawer_mode');
      if (saved === 'all' || saved === 'first' || saved === 'none') return saved;
      const legacy = localStorage.getItem('urban_radar_auto_open_drawer');
      if (legacy !== null) return legacy === 'true' ? 'all' : 'none';
      return 'all';
    } catch {
      return 'all';
    }
  });

  // 履约时序流转视图模式 (旋转木马 / 经典横滑，对应截图切换需求)
  const [timelineMode, setTimelineMode] = useState<'carousel' | 'horizontal'>(() => {
    try {
      const saved = localStorage.getItem('urban_radar_timeline_mode');
      if (saved === 'carousel' || saved === 'horizontal') return saved;
      return 'carousel';
    } catch {
      return 'carousel';
    }
  });

  const handleToggleTimelineMode = () => {
    setTimelineMode((prev) => {
      const next = prev === 'carousel' ? 'horizontal' : 'carousel';
      try {
        localStorage.setItem('urban_radar_timeline_mode', next);
      } catch (e) {
        console.warn(e);
      }
      toast.success(
        next === 'carousel'
          ? '已切换为「旋转木马」履约时序视图'
          : '已切换为「经典横滑」履约时序视图'
      );
      return next;
    });
  };

  const [isDrawerDropdownOpen, setIsDrawerDropdownOpen] = useState<boolean>(false);
  const drawerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDrawerDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (drawerDropdownRef.current && !drawerDropdownRef.current.contains(e.target as Node)) {
        setIsDrawerDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerDropdownOpen]);

  const handleSelectDrawerMode = (mode: 'all' | 'first' | 'none') => {
    setDrawerExpandMode(mode);
    try {
      localStorage.setItem('urban_radar_drawer_mode', mode);
      localStorage.setItem('urban_radar_auto_open_drawer', mode === 'none' ? 'false' : 'true');
    } catch (e) {
      console.warn(e);
    }
    setExpandedProgressIds({});
    setIsDrawerDropdownOpen(false);
    if (mode === 'all') {
      toast.success('已切换为「全部自动展开」出餐抽屉');
    } else if (mode === 'first') {
      toast.info('已切换为「仅首单展开」模式 (其余紧凑折叠)');
    } else {
      toast.info('已切换为「全部保持折叠」紧凑模式');
    }
  };

  const handleExpandAllDrawers = () => {
    const nextMap: Record<string, boolean> = {};
    currentDisplayList.forEach((o, i) => {
      nextMap[String(o.id || o.orderNo || i)] = true;
    });
    setExpandedProgressIds(nextMap);
    setIsDrawerDropdownOpen(false);
    toast.success(`已展开当前全部 ${currentDisplayList.length} 笔订单制作抽屉`);
  };

  const handleCollapseAllDrawers = () => {
    const nextMap: Record<string, boolean> = {};
    currentDisplayList.forEach((o, i) => {
      nextMap[String(o.id || o.orderNo || i)] = false;
    });
    setExpandedProgressIds(nextMap);
    setIsDrawerDropdownOpen(false);
    toast.info('已收起当前所有订单制作抽屉');
  };

  const toggleProgressDropdown = (id: string) => {
    setExpandedProgressIds((prev) => {
      let isCurrentlyExpanded = false;
      if (prev[id] !== undefined) {
        isCurrentlyExpanded = prev[id];
      } else {
        if (drawerExpandMode === 'all') isCurrentlyExpanded = true;
        else if (drawerExpandMode === 'first') {
          const firstKey = currentDisplayList[0] ? String(currentDisplayList[0].id || currentDisplayList[0].orderNo || '0') : '';
          isCurrentlyExpanded = id === firstKey;
        } else {
          isCurrentlyExpanded = false;
        }
      }
      return {
        ...prev,
        [id]: !isCurrentlyExpanded
      };
    });
  };

  // UID-based filtering and prefix judgment
  const currentUid = userProfile?.uid || 'tcb_u_88201948';
  const [uidScope, setUidScope] = useState<'my_uid' | 'all'>('my_uid');
  const [uidSearchPrefix, setUidSearchPrefix] = useState<string>('');

  // 联想输入交互状态
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [selectedSuggestIndex, setSelectedSuggestIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 点击外部区域自动收起联想建议浮层
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 热门搜索推荐词
  const quickPresetTags = [
    { label: '我的订单', value: currentUid.slice(0, 8), icon: User },
    { label: '和牛小汉堡', value: '和牛', icon: UtensilsCrossed },
    { label: '提拉米苏', value: '提拉米苏', icon: Sparkles },
    { label: '8806 取餐码', value: '8806', icon: Tag },
    { label: '01号餐车', value: '01号', icon: ShoppingBag }
  ];

  // 联想搜索建议结果计算
  const suggestItems = useMemo<AutoSuggestItem[]>(() => {
    const query = uidSearchPrefix.trim().toLowerCase();

    // 当搜索框为空且获得焦点时，推荐当前活跃订单快速直达
    if (!query) {
      return orders.slice(0, 3).map((o) => {
        const cfg = getOrderStatusConfig(o.status);
        const dishes = o.items.map((i) => i.name).join('、');
        return {
          id: `recent-${o.id || o.orderNo}`,
          type: 'order',
          title: o.orderNo,
          subtitle: `${dishes.slice(0, 20)}${dishes.length > 20 ? '...' : ''} · ¥${o.totalAmount}`,
          badge: {
            text: cfg.label,
            className: cfg.stageGroup === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'
          },
          fillValue: o.orderNo,
          order: o
        };
      });
    }

    const results: AutoSuggestItem[] = [];

    // 1. 匹配单号、取餐码、台号
    orders.forEach((o) => {
      const cfg = getOrderStatusConfig(o.status);
      if (o.orderNo.toLowerCase().includes(query)) {
        results.push({
          id: `ord-${o.id || o.orderNo}`,
          type: 'order',
          title: o.orderNo,
          subtitle: `${o.truckName} · ¥${o.totalAmount} · ${o.items.length} 件菜品`,
          badge: {
            text: cfg.label,
            className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
          },
          fillValue: o.orderNo,
          order: o
        });
      }
      if (o.pickupCode && o.pickupCode.toLowerCase().includes(query)) {
        results.push({
          id: `code-${o.id || o.orderNo}`,
          type: 'code',
          title: `取餐码: ${o.pickupCode}`,
          subtitle: `对应单号: ${o.orderNo} · ${o.truckName}`,
          badge: {
            text: '取餐凭证',
            className: 'bg-amber-50 text-amber-700 border-amber-200'
          },
          fillValue: o.pickupCode,
          order: o
        });
      }
      if (o.tableCode && o.tableCode.toLowerCase().includes(query)) {
        results.push({
          id: `tbl-${o.id || o.orderNo}`,
          type: 'code',
          title: `桌号: ${o.tableCode}`,
          subtitle: `对应单号: ${o.orderNo} (${o.tableZone || '堂食区'})`,
          badge: {
            text: '堂食台号',
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
          },
          fillValue: o.tableCode,
          order: o
        });
      }
    });

    // 2. 匹配菜品名称
    const seenDishes = new Set<string>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.name.toLowerCase().includes(query) && !seenDishes.has(item.name)) {
          seenDishes.add(item.name);
          results.push({
            id: `dish-${item.dishId || item.name}`,
            type: 'dish',
            title: item.name,
            subtitle: `在订单 ${o.orderNo} 中 · ¥${item.price} · ${item.station || '后厨出品'}`,
            badge: {
              text: '菜品明细',
              className: 'bg-rose-50 text-rose-700 border-rose-200'
            },
            fillValue: item.name,
            order: o
          });
        }
      });
    });

    // 3. 匹配食客与联系方式
    orders.forEach((o) => {
      if (o.customerName && o.customerName.toLowerCase().includes(query)) {
        results.push({
          id: `cust-${o.id}`,
          type: 'customer',
          title: o.customerName,
          subtitle: `手机号: ${o.userPhone || '未填写'} · UID: ${o.userId?.slice(0, 10)}...`,
          badge: {
            text: '食客档案',
            className: 'bg-purple-50 text-purple-700 border-purple-200'
          },
          fillValue: o.customerName,
          order: o
        });
      } else if (o.userId && o.userId.toLowerCase().includes(query)) {
        results.push({
          id: `uid-${o.id}`,
          type: 'customer',
          title: o.userId,
          subtitle: `食客: ${o.customerName || '先锋食客'} · 单号 ${o.orderNo}`,
          badge: {
            text: '用户 UID',
            className: 'bg-blue-50 text-blue-700 border-blue-200'
          },
          fillValue: o.userId,
          order: o
        });
      } else if (o.userPhone && o.userPhone.includes(query)) {
        results.push({
          id: `phone-${o.id}`,
          type: 'customer',
          title: o.userPhone,
          subtitle: `绑定食客: ${o.customerName || '先锋食客'} · 单号 ${o.orderNo}`,
          badge: {
            text: '联系手机',
            className: 'bg-teal-50 text-teal-700 border-teal-200'
          },
          fillValue: o.userPhone,
          order: o
        });
      }
    });

    return results.slice(0, 6);
  }, [orders, uidSearchPrefix]);

  const handleSelectSuggest = (item: AutoSuggestItem) => {
    setUidSearchPrefix(item.fillValue);
    setIsSuggestOpen(false);
    toast.success(`已应用联想筛选: ${item.title}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsSuggestOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestIndex((prev) => (prev < suggestItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestIndex((prev) => (prev > 0 ? prev - 1 : suggestItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestIndex >= 0 && selectedSuggestIndex < suggestItems.length) {
        handleSelectSuggest(suggestItems[selectedSuggestIndex]);
      } else {
        setIsSuggestOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSuggestOpen(false);
    }
  };

  // Filter orders according to UID scope and search prefix
  const scopedOrders = useMemo(() => {
    let list = orders;
    if (uidScope === 'my_uid') {
      list = list.filter((o) => {
        // If order has no userId (legacy/mock), treat as current user's or check if userId matches
        if (!o.userId) return true;
        return (
          o.userId === currentUid ||
          o.userId.startsWith(currentUid) ||
          o.userId === 'tcb_u_88201948' ||
          o.orderNo.includes(currentUid.slice(-4))
        );
      });
    }

    if (uidSearchPrefix.trim()) {
      const prefix = uidSearchPrefix.trim().toLowerCase();
      list = list.filter(
        (o) =>
          (o.userId && o.userId.toLowerCase().includes(prefix)) ||
          o.orderNo.toLowerCase().includes(prefix) ||
          (o.customerName && o.customerName.toLowerCase().includes(prefix)) ||
          (o.userPhone && o.userPhone.includes(prefix)) ||
          (o.pickupCode && o.pickupCode.toLowerCase().includes(prefix)) ||
          (o.tableCode && o.tableCode.toLowerCase().includes(prefix)) ||
          (o.truckName && o.truckName.toLowerCase().includes(prefix)) ||
          (o.statusText && o.statusText.toLowerCase().includes(prefix)) ||
          (o.items && o.items.some((item) => item.name.toLowerCase().includes(prefix)))
      );
    }

    if (list.length === 0 && orders.length > 0 && !uidSearchPrefix.trim()) {
      return orders;
    }

    return list;
  }, [orders, uidScope, currentUid, uidSearchPrefix]);

  // Pull orders directly from local fallback (原云函数 `orders` / `getOrders`)
  const handlePullFromCloudFunction = async () => {
    setIsPullingCloud(true);
    toast.info('正在调用云函数 [orders] 同步最新订单...');
    try {
      const res = await fetchOrdersFromCloudFunction(undefined, uidScope === 'my_uid' ? currentUid : undefined);
      if (res.success && res.orders) {
        if (res.orders.length > 0) {
          setOrders(res.orders);
        }
        toast.success(`云函数 [${res.functionName || 'orders'}] 同步成功`, `已同步 UID: ${currentUid.slice(-6)} 下的 ${res.orders.length} 笔订单`);
      } else {
        toast.info('已拉取本地双轨订单', '云函数暂未部署或受网络保护，已启用本地持久化存储');
      }
    } catch (err: any) {
      toast.error('拉取异常', err?.message);
    } finally {
      setIsPullingCloud(false);
    }
  };

  const dynamicInProgress = scopedOrders
    .filter((o) => {
      const s = (o.status || '') as string;
      return s !== 'completed' && s !== 'delivered' && s !== 'refunded' && s !== 'cancelled' && o.stepIndex !== 7;
    })
    .map((o) => {
      const cfg = getOrderStatusConfig(o.status);
      const isDelivering = o.status === 'delivering';
      const isRefundPending = o.status === 'refund_pending' || o.refundStatus === 'pending' || o.status === 'cancel_requested';

      // 5-stage progress indicator index
      let displayStepIndex = 0;
      if (typeof o.stepIndex === 'number') {
        if (o.stepIndex >= 7) displayStepIndex = 4;
        else if (o.stepIndex >= 6) displayStepIndex = 3;
        else if (o.stepIndex >= 4) displayStepIndex = 2;
        else if (o.stepIndex >= 1) displayStepIndex = 1;
        else displayStepIndex = 0;
      } else if (isDelivering) {
        displayStepIndex = 3;
      } else if (cfg.key === 'ready' || cfg.key === 'waiting_pickup' || cfg.key === 'picked_up') {
        displayStepIndex = 2;
      } else if (cfg.key === 'cooking' || cfg.key === 'rider_heading') {
        displayStepIndex = 1;
      }

      const isJustUpdated = Boolean(
        o.isRecentlyUpdated ||
        (o as any)._justUpdated ||
        (o.statusUpdatedAt && Date.now() - new Date(o.statusUpdatedAt).getTime() < 45000)
      );

      return {
        id: o.id,
        title: o.truckName || '黑曜石 01 号流动餐车',
        orderNo: o.orderNo,
        userId: o.userId || currentUid,
        userPhone: o.userPhone || userProfile?.phone || '138-8888-9201',
        customerName: o.customerName || userProfile?.nickname || '先锋食客',
        channelType: o.channelType || o.channel || 'delivery',
        channel: o.channelType || o.channel || 'delivery',
        tableCode: o.tableCode,
        tableZone: o.tableZone,
        serverName: o.serverName,
        pickupCode: o.pickupCode,
        pickupShelfCode: o.pickupShelfCode,
        items: o.items || [],
        rawOrder: o,
        rawStatus: o.status,
        statusConfig: cfg,
        status: cfg.badgeText || cfg.label,
        statusType: o.status,
        estArrival: o.estimatedDeliveryTime?.replace('约', '')?.replace('后', '')?.trim() || (isDelivering ? '12:55:00' : '10-15 分钟'),
        distance: o.channelType === 'dine_in' ? '堂食台位' : o.channelType === 'pickup' ? '智能取餐柜' : '1.2 公里',
        itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
        itemsSummary: o.items.map((i) => `${i.name} x ${i.quantity}`).join(', '),
        totalAmount: o.totalAmount,
        hasTopAccent: cfg.key === 'delivering' || cfg.key === 'picked_up' || isDelivering,
        stepIndex: displayStepIndex,
        isRecentlyUpdated: isJustUpdated,
        courierName: o.courierName || (isDelivering ? '陈志远 (专线骑手 R-8821)' : '餐车吧台主理人'),
        courierPhone: o.courierPhone || '138-1829-9201',
        createdTime: o.createdTime || '刚刚',
        nonRefundable: o.nonRefundable,
        refundStatus: o.refundStatus,
        refundReason: o.refundReason,
        refundFeedback: o.refundFeedback,
        refundPassedStep: o.refundPassedStep,
        refundRejectReason: o.refundRejectReason
      };
    });

  const dynamicDelivered = scopedOrders
    .filter((o) => o.status === 'completed' || (o.status as string) === 'delivered' || o.status === 'refunded' || o.stepIndex === 7 || o.stepIndex === 4)
    .map((o) => {
      const cfg = getOrderStatusConfig(o.status || 'completed');
      const isJustUpdated = Boolean(
        o.isRecentlyUpdated ||
        (o as any)._justUpdated ||
        (o.statusUpdatedAt && Date.now() - new Date(o.statusUpdatedAt).getTime() < 45000)
      );
      return {
        id: o.id,
        title: o.truckName || '黑曜石 01 号流动餐车',
        orderNo: o.orderNo,
        userId: o.userId || currentUid,
        userPhone: o.userPhone || userProfile?.phone || '138-8888-9201',
        customerName: o.customerName || userProfile?.nickname || '先锋食客',
        channelType: o.channelType || 'delivery',
        rawStatus: o.status,
        statusConfig: cfg,
        status: cfg.badgeText || (o.status === 'refunded' ? '已退款' : '已送达'),
        statusType: o.status === 'refunded' ? 'refunded' : 'delivered',
        estArrival: o.status === 'refunded' ? '已全额退款' : (o.estimatedDeliveryTime || o.createdTime || '已送达'),
        distance: '1.2 公里',
        itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
        itemsSummary: o.items.map((i) => `${i.name} x ${i.quantity}`).join(', '),
        totalAmount: o.totalAmount,
        hasTopAccent: false,
        stepIndex: 4,
        isRecentlyUpdated: isJustUpdated,
        courierName: o.courierName || '陈志远 (专线骑手 R-8821)',
        courierPhone: o.courierPhone || '138-1829-9201',
        createdTime: o.createdTime || '已送达',
        nonRefundable: o.nonRefundable,
        refundStatus: o.refundStatus,
        refundReason: o.refundReason,
        refundFeedback: o.refundFeedback,
        refundPassedStep: o.refundPassedStep,
        refundRejectReason: o.refundRejectReason
      };
    });

  const hasRealScopedOrders = scopedOrders.length > 0;

  /* -------------------------------------------------------------------------
   * 原工程 syncedDefaultInProgress（L734-742）用于在「云函数返回空 + 回落到
   * defaultInProgressOrders」时剔除已在实时单中完成的兜底单。独立包中 orders
   * 始终等于 MOCK_ORDERS（非空），hasRealScopedOrders 恒为 true，该分支永不
   * 生效；为保证「不引入外部订单规范化依赖」，此处保留结构但改为空数组。
   * ---------------------------------------------------------------------- */
  const syncedDefaultInProgress: any[] = [];

  const inProgressList = hasRealScopedOrders ? dynamicInProgress : syncedDefaultInProgress;
  const recentlyDeliveredList = hasRealScopedOrders ? dynamicDelivered : MOCK_DELIVERED_ORDERS;
  const historyList = MOCK_HISTORY_ORDERS;

  const currentDisplayList: any[] =
    activeTab === 'in_progress'
      ? inProgressList
      : activeTab === 'recently_delivered'
      ? recentlyDeliveredList
      : historyList;

  const handleTrackRadar = (order: any) => {
    onTrackRadar?.(order.orderNo || order.id);
  };

  const handleBellClick = () => {
    toast.success('订单实时状态推送已开启', '已启用自动监听与状态声效提醒');
  };

  // 履约时序流转组件：支持旋转木马设计与经典横滑双布局
  const renderHorizontalSteps = (order: any, stepIndex: number) => {
    if (timelineMode === 'carousel') {
      return (
        <CarouselStepsScroller
          order={order}
          stepIndex={stepIndex}
          onToggleViewMode={handleToggleTimelineMode}
        />
      );
    }
    return (
      <HorizontalStepsScroller
        order={order}
        stepIndex={stepIndex}
        onToggleViewMode={handleToggleTimelineMode}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="w-full max-w-5xl mx-auto min-h-full flex-1 bg-[#f9f9f7] text-[#1a1c1b] px-2.5 sm:px-4 pt-1.5 pb-20 sm:pb-24 flex flex-col font-sans select-none"
    >
      {/* Header Bar */}
      <div className="pt-2 pb-2 px-0.5 flex items-center justify-between gap-2 sticky top-0 z-20 bg-[#f9f9f7]/95 backdrop-blur-xs border-b border-[#e6e6e4]/60">
        <div className="flex items-center gap-2">
          {onGoToMenu && (
            <button
              type="button"
              id="orders-header-back-btn"
              onClick={onGoToMenu}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e6e6e4] rounded-lg text-xs font-bold text-[#1a1c1b] hover:bg-neutral-100 hover:border-neutral-400 active:scale-95 transition shadow-2xs cursor-pointer group shrink-0"
              title="返回点餐"
              aria-label="返回点餐"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-800 transition-transform group-hover:-translate-x-0.5" />
              <span>返回</span>
            </button>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-black flex items-center gap-1.5">
              <span>实时订单</span>
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 履约时序流转切换按钮 (截图所指位置) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleTimelineMode}
            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs ${
              timelineMode === 'carousel'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30'
                : 'bg-white text-black border-[#e6e6e4] hover:bg-neutral-100'
            }`}
            title="点击切换履约时序流转视图样式（旋转木马 / 经典横滑）"
            aria-label="切换履约时序流转视图样式"
          >
            <Orbit
              className={`w-3 h-3 ${
                timelineMode === 'carousel' ? 'text-emerald-600 animate-spin' : 'text-neutral-600'
              }`}
              style={{ animationDuration: '8s' }}
            />
            <span>{timelineMode === 'carousel' ? '木马时序' : '横滑时序'}</span>
          </motion.button>

          {/* Pull from Cloud Function Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePullFromCloudFunction}
            disabled={isPullingCloud}
            className="px-2.5 py-1 rounded-full bg-white border border-[#e6e6e4] text-black hover:bg-neutral-100 active:scale-95 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
            title="调用云函数拉取最新订单"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-600 ${isPullingCloud ? 'animate-spin' : ''}`} />
            <span>{isPullingCloud ? '拉取中' : '云端拉取'}</span>
          </motion.button>

          {/* Bell Icon */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleBellClick}
            className="w-7 h-7 rounded-full bg-white border border-[#e6e6e4] text-black hover:bg-neutral-100 active:scale-95 transition cursor-pointer relative flex items-center justify-center shadow-2xs shrink-0"
            title="通知"
          >
            <Bell className="w-3.5 h-3.5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
          </motion.button>
        </div>
      </div>

      {/* UID First Judgment & Account Binding Filter Bar with Animation */}
      <motion.div
        layout
        className="my-1 p-2 bg-white border border-[#e2e3e1] rounded-none shadow-2xs space-y-1.5 transition-shadow hover:shadow-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#141413] truncate max-w-[80px] sm:max-w-[120px]">
                {userProfile?.nickname || '先锋食客'}
              </span>
              <span className="text-[9.5px] px-1 py-0.2 rounded bg-[#f4f4f2] text-[#55544d] tabular-nums font-semibold border border-[#e2e3df] shrink-0">
                UID: {currentUid.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Segmented Switcher with Clean Tactile Pill Style */}
          <div className="inline-flex items-center p-0.5 bg-[#FAF9F7] rounded-lg border border-[#e5e5e1] gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setUidScope('my_uid')}
              className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                uidScope === 'my_uid'
                  ? 'bg-white text-black shadow-2xs font-bold'
                  : 'text-[#6e6d66] hover:text-black'
              }`}
            >
              <span>专属</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  uidScope === 'my_uid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#e2e2de] text-[#666]'
                }`}
              >
                {orders.filter((o) => !o.userId || o.userId === currentUid || o.userId.startsWith(currentUid) || o.orderNo.includes(currentUid.slice(-4))).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setUidScope('all')}
              className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                uidScope === 'all'
                  ? 'bg-white text-black shadow-2xs font-bold'
                  : 'text-[#6e6d66] hover:text-black'
              }`}
            >
              <span>全网</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  uidScope === 'all'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-[#e2e2de] text-[#666]'
                }`}
              >
                {orders.length}
              </span>
            </button>
          </div>
        </div>

        {/* UID Prefix / Order Search Input with Predictive Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative flex items-center">
          <Search className="w-3 h-3 text-[#999990] absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={uidSearchPrefix}
            onChange={(e) => {
              setUidSearchPrefix(e.target.value);
              setIsSuggestOpen(true);
              setSelectedSuggestIndex(-1);
            }}
            onFocus={() => setIsSuggestOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="输入 UID / 订单号 / 菜品 / 取餐码联想..."
            className="w-full pl-6.5 pr-6 py-1 text-[11px] bg-[#FAF9F7] border border-[#e5e5e0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition placeholder:text-[#999990] text-[#141413] font-medium"
          />
          <AnimatePresence>
            {uidSearchPrefix && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => {
                  setUidSearchPrefix('');
                  setSelectedSuggestIndex(-1);
                }}
                className="absolute right-1.5 text-[10px] text-neutral-400 hover:text-black p-0.5 rounded cursor-pointer"
                title="清空输入"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>

          {/* 联想输入下拉浮层 */}
          <AnimatePresence>
            {isSuggestOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e2e2dd] rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-[#f0f0eb]"
              >
                {/* 顶栏：联想说明与状态 */}
                <div className="px-2.5 py-1.5 bg-[#FAF9F7] flex items-center justify-between text-[10px] text-[#787770]">
                  <div className="flex items-center gap-1 font-semibold text-[#3F0EE6]">
                    <Sparkles className="w-3 h-3 text-[#3F0EE6]" />
                    <span>智能联想推荐</span>
                  </div>
                  {uidSearchPrefix.trim() ? (
                    <span className="tabular-nums text-[#888880]">
                      找到 {suggestItems.length} 条建议
                    </span>
                  ) : (
                    <span className="text-[#888880]">常用快捷词</span>
                  )}
                </div>

                {/* 快捷推荐词胶囊 (输入为空时展示) */}
                {!uidSearchPrefix.trim() && (
                  <div className="p-2 bg-white">
                    <div className="text-[9.5px] font-bold text-[#888880] mb-1.5 px-0.5">
                      热门推荐
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPresetTags.map((tag) => {
                        const TagIcon = tag.icon;
                        return (
                          <button
                            key={tag.label}
                            type="button"
                            onClick={() => {
                              setUidSearchPrefix(tag.value);
                              setIsSuggestOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] bg-[#F4F4F0] hover:bg-[#e8e8e2] text-[#44443e] rounded-full font-medium transition cursor-pointer border border-[#e5e5de]"
                          >
                            <TagIcon className="w-2.5 h-2.5 text-[#666660]" />
                            <span>{tag.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 联想匹配建议列表 */}
                <div className="max-h-60 overflow-y-auto divide-y divide-[#f5f5f0] p-1">
                  {suggestItems.length > 0 ? (
                    suggestItems.map((item, index) => {
                      const isSelected = selectedSuggestIndex === index;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSuggest(item)}
                          onMouseEnter={() => setSelectedSuggestIndex(index)}
                          className={`w-full px-2 py-1.5 rounded-lg text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected ? 'bg-indigo-50/80 border border-indigo-200/60' : 'hover:bg-[#FAF9F7]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11.5px] font-bold text-[#141413] truncate">
                                {renderHighlighted(item.title, uidSearchPrefix)}
                              </span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-semibold border shrink-0 ${item.badge.className}`}
                                >
                                  {item.badge.text}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-[10px] text-[#787770] truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center text-[#999990]">
                            <CornerDownLeft className="w-3 h-3 opacity-60" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-[10.5px] text-[#999990]">
                      未匹配到相关订单或菜品，回车可按全文检索
                    </div>
                  )}
                </div>

                {/* 底栏快捷操作提示 */}
                <div className="px-2.5 py-1 bg-[#FAF9F7] flex items-center justify-between text-[9.5px] text-[#8e8d85]">
                  <span>按 ↑↓ 切换 · 回车确认</span>
                  <button
                    type="button"
                    onClick={() => setIsSuggestOpen(false)}
                    className="hover:text-black cursor-pointer"
                  >
                    收起
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>


      {/* Tabs Row with Unified Selection State & Drawer Auto-Open Switch */}
      <div className="pt-0.5 pb-1 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('in_progress')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              activeTab === 'in_progress'
                ? 'bg-sky-50/80 text-sky-600 border-2 border-sky-500 shadow-2xs'
                : 'text-[#55554f] bg-[#eeeee9] border-transparent hover:bg-[#e4e4de]'
            }`}
          >
            <CookingPot className={`w-3.5 h-3.5 ${activeTab === 'in_progress' ? 'text-sky-600' : 'text-[#787770]'}`} />
            <span>进行中</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-black ${
                activeTab === 'in_progress' ? 'bg-sky-500 text-white' : 'bg-white text-black'
              }`}
            >
              {inProgressList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recently_delivered')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              activeTab === 'recently_delivered'
                ? 'bg-emerald-50/80 text-emerald-600 border-2 border-emerald-500 shadow-2xs'
                : 'text-[#55554f] bg-[#eeeee9] border-transparent hover:bg-[#e4e4de]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'recently_delivered' ? 'text-emerald-600' : 'text-[#787770]'}`} />
            <span>近期送达</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-black ${
                activeTab === 'recently_delivered' ? 'bg-emerald-500 text-white' : 'bg-white text-black'
              }`}
            >
              {recentlyDeliveredList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              activeTab === 'history'
                ? 'bg-amber-50/80 text-amber-600 border-2 border-amber-500 shadow-2xs'
                : 'text-[#55554f] bg-[#eeeee9] border-transparent hover:bg-[#e4e4de]'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-amber-600' : 'text-[#787770]'}`} />
            <span>历史订单</span>
          </button>
        </div>

        {/* 出餐进度抽屉下拉菜单 (设计为下拉菜单，对应选中的元素) */}
        <div ref={drawerDropdownRef} className="shrink-0 relative flex items-center pl-1">
          <button
            type="button"
            onClick={() => setIsDrawerDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={isDrawerDropdownOpen}
            aria-label="出餐制作抽屉视图配置"
            className={`w-7 h-7 rounded-full border transition cursor-pointer flex items-center justify-center shadow-2xs select-none shrink-0 group ${
              isDrawerDropdownOpen
                ? 'bg-black text-white border-black ring-2 ring-black/10'
                : drawerExpandMode === 'all'
                ? 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c] hover:bg-[#ffedd5]'
                : drawerExpandMode === 'first'
                ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#dbeafe]'
                : 'bg-white border-[#e5e5e0] text-[#55554f] hover:bg-[#f6f6f4] hover:text-black'
            }`}
            title={
              drawerExpandMode === 'all'
                ? '抽屉模式: 全部自动展开'
                : drawerExpandMode === 'first'
                ? '抽屉模式: 仅首单展开'
                : '抽屉模式: 全部折叠'
            }
          >
            <SlidersHorizontal
              className={`w-3.5 h-3.5 shrink-0 ${
                isDrawerDropdownOpen
                  ? 'text-white'
                  : drawerExpandMode === 'all'
                  ? 'text-[#ea580c]'
                  : drawerExpandMode === 'first'
                  ? 'text-[#2563eb]'
                  : 'text-[#787770] group-hover:text-black'
              }`}
            />
          </button>

          {/* 出餐进度抽屉下拉菜单 (Dropdown Menu) */}
          <AnimatePresence>
            {isDrawerDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full right-0 mt-1.5 z-50 w-72 bg-white rounded-xl shadow-xl border border-[#e5e5e0] p-2.5 text-left divide-y divide-[#f2f2ee]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 顶部指示小三角 */}
                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-[#e5e5e0] rotate-45 pointer-events-none" />

                {/* 菜单标题与说明 */}
                <div className="pb-2 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-obsidian tracking-tight flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-obsidian" />
                      出餐制作抽屉视图
                    </span>
                    <span className="text-[10px] text-[#787770] tabular-nums">下拉菜单</span>
                  </div>
                  <p className="text-[10.5px] text-[#787770] mt-0.5 leading-snug">
                    设置订单卡片制作进度与配料明细的默认展开状态
                  </p>
                </div>

                {/* 选项列表 */}
                <div className="py-2 space-y-1">
                  {/* 全部自动展开 */}
                  <button
                    type="button"
                    onClick={() => handleSelectDrawerMode('all')}
                    className={`w-full px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                      drawerExpandMode === 'all' ? 'bg-[#fff7ed] text-[#9a3412]' : 'hover:bg-[#f6f6f4] text-[#333330]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-obsidian">全部自动展开</span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#ea580c]/10 text-[#c2410c]">
                          默认推荐
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#787770] mt-0.5 leading-tight">
                        所有进行中订单自动拉开做餐抽屉，实时掌握火候与出餐耗时
                      </p>
                    </div>
                    {drawerExpandMode === 'all' && <Check className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />}
                  </button>

                  {/* 仅首单展开 */}
                  <button
                    type="button"
                    onClick={() => handleSelectDrawerMode('first')}
                    className={`w-full px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                      drawerExpandMode === 'first' ? 'bg-[#eff6ff] text-[#1e40af]' : 'hover:bg-[#f6f6f4] text-[#333330]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-obsidian">仅首单展开</span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700">
                          聚焦最新
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#787770] mt-0.5 leading-tight">
                        仅置顶第一笔订单展示做餐细节，后续单据紧凑折叠保持清爽
                      </p>
                    </div>
                    {drawerExpandMode === 'first' && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                  </button>

                  {/* 全部折叠 */}
                  <button
                    type="button"
                    onClick={() => handleSelectDrawerMode('none')}
                    className={`w-full px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                      drawerExpandMode === 'none' ? 'bg-[#f4f4f2] text-obsidian' : 'hover:bg-[#f6f6f4] text-[#333330]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-obsidian">全部默认折叠</span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-100 text-[#60605a]">
                          紧凑模式
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#787770] mt-0.5 leading-tight">
                        以极简卡片排布节省高度，点击任意订单抽屉时再展开查看
                      </p>
                    </div>
                    {drawerExpandMode === 'none' && <Check className="w-4 h-4 text-black shrink-0 mt-0.5" />}
                  </button>
                </div>

                {/* 快捷批处理操作 */}
                <div className="pt-2 px-1 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleExpandAllDrawers}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#fafaf8] hover:bg-[#f0f0ed] text-[#40403c] text-[10.5px] font-bold border border-[#e5e5e0] transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Layers className="w-3 h-3 text-[#707068]" />
                    <span>一键全开</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCollapseAllDrawers}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#fafaf8] hover:bg-[#f0f0ed] text-[#40403c] text-[10.5px] font-bold border border-[#e5e5e0] transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <X className="w-3 h-3 text-[#707068]" />
                    <span>一键收起</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orders List Content with Staggered Motion Cards */}
      <div className="space-y-2 pt-0.5 pb-3">
        {currentDisplayList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-none border border-[#e2e3e1] p-6 text-center space-y-2"
          >
            <ShoppingBag className="w-8 h-8 mx-auto text-[#8c8b84]" />
            <p className="text-xs font-bold text-black">暂无制作中或配送中的进行中订单</p>
            {activeTab === 'in_progress' && recentlyDeliveredList.length > 0 ? (
              <div className="pt-2 pb-1 space-y-2">
                <p className="text-[11px] text-emerald-800 font-bold bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
                  订单已妥投送达！已实时同步归档至「近期送达」
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('recently_delivered')}
                    className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-black rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>查看近期已送达订单 ({recentlyDeliveredList.length}) →</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#787770]">随时可以通过上方「云端拉取」同步最新记录</p>
            )}
            {onGoToMenu && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onGoToMenu}
                className="mt-1 px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-neutral-800"
              >
                浏览流动餐车菜单
              </motion.button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {currentDisplayList.map((order, idx) => {
              const orderKey = String(order.id || order.orderNo || idx);
              const defaultExpanded = drawerExpandMode === 'all' ? true : drawerExpandMode === 'first' ? idx === 0 : false;
              const isExpanded = expandedProgressIds[orderKey] !== undefined ? expandedProgressIds[orderKey] : defaultExpanded;

              return (
                <RealTimeOrderCard
                  key={`cust-ord-${order.id || order.orderNo || idx}-${idx}`}
                  order={order}
                  idx={idx}
                  isExpanded={isExpanded}
                  onToggleExpand={toggleProgressDropdown}
                  onTrackRadar={handleTrackRadar}
                  onOpenRefund={(ord) => {
                    if (ord.statusType === 'refund_pending') {
                      toast.info('退单审核进行中', ord.refundReason || '临时有事 / 行程变更');
                    } else if (ord.nonRefundable) {
                      toast.warning('该订单不可自助退单', '餐品已进入后厨制作流程，需联系餐车主理人申诉');
                    } else {
                      toast.info('退单入口', '演示版工单页未内置退单申请表单');
                    }
                  }}
                  onOpenChat={(ord) => onOpenMessageCenter?.(ord.orderNo || ord.id)}
                  renderHorizontalSteps={renderHorizontalSteps}
                />
              );
            })}
          </AnimatePresence>
        )}

        {/* Bottom Promo Banner: Need it faster? */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenVIP}
          className="bg-black text-white rounded-none p-3 sm:p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:bg-neutral-900 transition-colors mt-1.5"
        >
          <div className="space-y-0.5 pr-2">
            <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
              需要更快送达？
            </h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">
              下次下单开启极速专送与流动餐车站台优先排期
            </p>
          </div>

          <div className="w-8 h-8 rounded-none bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#22c55e] fill-[#22c55e]" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WorkOrderPage;
