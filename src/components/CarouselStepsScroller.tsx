import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ShoppingBag,
  ChefHat,
  CookingPot,
  Flame,
  Package,
  UtensilsCrossed,
  PackageCheck,
  Bike,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

export interface CarouselStepsScrollerProps {
  order: any;
  stepIndex: number;
  onToggleViewMode?: () => void;
}

export const CarouselStepsScroller: React.FC<CarouselStepsScrollerProps> = ({
  order,
  stepIndex,
  onToggleViewMode
}) => {
  const toast = useToast();
  const channel =
    order?.channelType ||
    order?.channel ||
    (order?.tableCode ? 'dine_in' : order?.pickupCode ? 'pickup' : 'delivery');
  const isDineIn = channel === 'dine_in';
  const isPickup = channel === 'pickup';

  const steps = isDineIn
    ? [
        { key: 'placed', label: '开台下单', desc: '微信扫码开台支付成功' },
        { key: 'accepted', label: '后厨接单', desc: '炭火档与冷饮档同步排产' },
        { key: 'cooking', label: '炭火现制', desc: '高温炭火慢烘炙烤' },
        { key: 'serving', label: '陆续上菜', desc: '传菜专员核验出餐上桌' },
        { key: 'all_served', label: '餐品齐备', desc: '全单菜品上齐，客享盛宴' }
      ]
    : isPickup
    ? [
        { key: 'placed', label: '提交订单', desc: '支付成功已入库' },
        { key: 'accepted', label: '餐车接单', desc: '餐车主理人排产确认' },
        { key: 'cooking', label: '现制包装', desc: '炭火现制与双层锁鲜封签' },
        { key: 'ready', label: '出餐待取', desc: '放入恒温取餐柜生成取餐码' },
        { key: 'completed', label: '到店已取', desc: '顾客核销取餐履约完成' }
      ]
    : [
        { key: 'placed', label: '下单支付', desc: '已提交微信支付' },
        { key: 'accepted', label: '商家接单', desc: '餐车后厨备料制作' },
        { key: 'cooking', label: '现制出餐', desc: '出餐完毕待骑手核验' },
        { key: 'delivering', label: '极速专送', desc: '恒温箱极速配送' },
        { key: 'delivered', label: '妥投送达', desc: '餐品妥投存证' }
      ];

  const isDelivered =
    order?.statusType === 'delivered' ||
    order?.status === 'DELIVERED' ||
    order?.status === 'completed' ||
    stepIndex >= 4;

  const safeStep = isDelivered ? 4 : Math.max(0, Math.min(stepIndex, 4));

  const stepTimestamps = isDineIn
    ? [order.createdTime || '12:20:15', order.acceptedTime || '12:21', '预计12:23', '预计12:26', '预计12:30']
    : isPickup
    ? [order.createdTime || '12:20:15', order.acceptedTime || '12:22', '预计12:28', '已入恒温柜', '预计已取']
    : [order.createdTime || '12:20:15', order.acceptedTime || '12:25', '预计12:35', '预计12:45', order.estArrival || '预计12:55'];

  // 当前旋转木马焦点所处节点
  const [activeIdx, setActiveIdx] = useState<number>(safeStep);
  const [countdown, setCountdown] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // 当订单改变时重设为 safeStep
  useEffect(() => {
    setActiveIdx(safeStep);
  }, [safeStep, order?.id, order?.orderNo]);

  // 清除定时器
  const clearAutoReturn = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(0);
  }, []);

  useEffect(() => {
    return () => clearAutoReturn();
  }, [clearAutoReturn]);

  // 用户点击或滑动切换节点
  const handleSelectStep = (idx: number) => {
    if (idx < 0 || idx >= steps.length) return;
    setActiveIdx(idx);

    if (idx !== safeStep) {
      clearAutoReturn();
      setCountdown(8);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        setActiveIdx(safeStep);
        setCountdown(0);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }, 8000);
    } else {
      clearAutoReturn();
    }
  };

  const handleReturnToSafeStep = () => {
    clearAutoReturn();
    setActiveIdx(safeStep);
    toast.info('已回正至当前履约执行阶段');
  };

  // 渲染图标
  const renderIconForStep = (idx: number, isCenter: boolean) => {
    const iconClass = isCenter ? 'w-6 h-6' : 'w-4 h-4';
    switch (idx) {
      case 0:
        return <ShoppingBag className={`${iconClass} text-amber-500`} />;
      case 1:
        return isDineIn || isPickup ? (
          <ChefHat className={`${iconClass} text-amber-500`} />
        ) : (
          <CookingPot className={`${iconClass} text-amber-500`} />
        );
      case 2:
        return isDineIn || isPickup ? (
          <Flame className={`${iconClass} text-amber-500`} />
        ) : (
          <Package className={`${iconClass} text-sky-500`} />
        );
      case 3:
        return isDineIn ? (
          <UtensilsCrossed className={`${iconClass} text-emerald-500`} />
        ) : isPickup ? (
          <PackageCheck className={`${iconClass} text-emerald-500`} />
        ) : (
          <Bike className={`${iconClass} text-emerald-500`} />
        );
      case 4:
        return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
      default:
        return <Check className={`${iconClass} text-emerald-500`} />;
    }
  };

  const prevStep = activeIdx > 0 ? steps[activeIdx - 1] : null;
  const currentStep = steps[activeIdx];
  const nextStep = activeIdx < steps.length - 1 ? steps[activeIdx + 1] : null;

  return (
    <div className="relative w-full py-2 my-0.5 select-none" data-purpose="carousel-stepper">
      {/* 头部信息与控制栏 */}
      <div className="flex items-center justify-between px-1 mb-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[#059669] font-black tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>履约时序流转</span>
          </span>
          <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 font-bold">
            旋转木马
          </span>
        </div>

        <div className="flex items-center gap-2">
          {countdown > 0 ? (
            <button
              type="button"
              onClick={handleReturnToSafeStep}
              className="inline-flex items-center gap-1 bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] px-2 py-0.5 rounded-full tabular-nums text-[9.5px] font-bold active:scale-95 transition-transform cursor-pointer shadow-2xs"
              title="点击立即回正到实际执行节点"
            >
              <RotateCcw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{countdown}s 后回正</span>
            </button>
          ) : activeIdx !== safeStep ? (
            <button
              type="button"
              onClick={handleReturnToSafeStep}
              className="text-[9.5px] text-[#059669] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>回正当前</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[9.5px] text-[#888880] tabular-nums font-medium">
              阶段 {safeStep + 1}/{steps.length}
            </span>
          )}

          {onToggleViewMode && (
            <button
              type="button"
              onClick={onToggleViewMode}
              className="text-[9.5px] text-[#787770] hover:text-black font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#e5e5e0] bg-white transition-colors cursor-pointer"
              title="点击切回经典横滑视图"
            >
              <span>切为横滑</span>
            </button>
          )}
        </div>
      </div>

      {/* 旋转木马主舞台容器 (精准还原截图设计) */}
      <div className="relative w-full rounded-2xl bg-[#FAF9F7] border border-[#ecece8] p-4 shadow-2xs overflow-hidden min-h-[148px] flex flex-col justify-center">
        {/* 舞台背景贯穿轨道线 */}
        <div className="absolute top-[68px] left-10 right-10 h-[2px] bg-[#e5e7eb] z-0 pointer-events-none" />

        {/* 已完成路段的翡翠色高亮连接线 */}
        <div
          className="absolute top-[68px] left-10 h-[2.5px] bg-[#10b981] z-0 pointer-events-none transition-all duration-300"
          style={{
            width: activeIdx === 0 ? '0%' : activeIdx === 1 ? '40%' : activeIdx === 2 ? '60%' : '100%'
          }}
        />

        {/* 旋转木马左右切换按钮 */}
        {activeIdx > 0 && (
          <button
            type="button"
            onClick={() => handleSelectStep(activeIdx - 1)}
            aria-label="查看上一节点"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 border border-[#e5e5e0] shadow-xs flex items-center justify-center text-[#666] hover:text-black hover:bg-white active:scale-90 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {activeIdx < steps.length - 1 && (
          <button
            type="button"
            onClick={() => handleSelectStep(activeIdx + 1)}
            aria-label="查看下一节点"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 border border-[#e5e5e0] shadow-xs flex items-center justify-center text-[#666] hover:text-black hover:bg-white active:scale-90 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 3 节点视口栅格 (前驱 · 中心聚焦 · 后继) */}
        <div className="relative z-10 grid grid-cols-3 items-center justify-items-center w-full">
          {/* 左侧节点 (Previous Step) */}
          <div className="w-full flex flex-col items-center justify-center text-center">
            {prevStep ? (
              <motion.div
                key={`prev-${activeIdx - 1}`}
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectStep(activeIdx - 1)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* 时间戳 */}
                <span className="text-[10px] tabular-nums font-semibold text-[#059669] mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  {stepTimestamps[activeIdx - 1]}
                </span>

                {/* 节点气泡 */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                    activeIdx - 1 <= safeStep
                      ? 'bg-[#10b981] text-white border border-[#059669]'
                      : 'bg-white border border-[#d1d5db] text-[#888880]'
                  }`}
                >
                  {activeIdx - 1 <= safeStep ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className="text-[11px] font-bold">{activeIdx}</span>
                  )}
                </div>

                {/* 节点名称 */}
                <span className="text-[11px] font-bold text-[#444440] group-hover:text-black mt-1.5 transition-colors">
                  {prevStep.label}
                </span>
              </motion.div>
            ) : (
              <div className="w-full opacity-0 pointer-events-none" />
            )}
          </div>

          {/* 中间核心聚焦节点 (Center Stage Active Step - 旋转木马主角) */}
          <div className="w-full flex flex-col items-center justify-center text-center relative px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`center-${activeIdx}`}
                initial={{ opacity: 0, scale: 0.85, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -4 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex flex-col items-center relative"
              >
                {/* 核心光晕层 (Halo Gradient Effect) */}
                <div className="absolute top-2 w-20 h-20 rounded-full bg-emerald-400/15 blur-md pointer-events-none -z-10 animate-pulse" />

                {/* 顶部时间胶囊徽章 */}
                <div className="mb-1.5">
                  <span className="inline-flex items-center text-[10px] tabular-nums font-black text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full shadow-2xs">
                    {stepTimestamps[activeIdx]}
                  </span>
                </div>

                {/* 核心高保真放大圆环 */}
                <div className="relative">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white border-[2.5px] border-[#10b981] shadow-[0_4px_14px_rgba(16,185,129,0.25)] flex items-center justify-center transition-transform">
                    {renderIconForStep(activeIdx, true)}
                  </div>

                  {/* 正在进行微脉冲点 */}
                  {activeIdx === safeStep && !isDelivered && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#059669] ring-2 ring-white"></span>
                    </span>
                  )}
                </div>

                {/* 核心节点标题 */}
                <span className="text-xs sm:text-[13px] font-black text-obsidian tracking-tight mt-1.5 leading-snug">
                  {currentStep.label}
                </span>

                {/* 底部状态微标签 (当前阶段 / 已完成 / 待履约) */}
                <div className="mt-1">
                  {activeIdx === safeStep ? (
                    <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] shadow-2xs">
                      当前阶段
                    </span>
                  ) : activeIdx < safeStep ? (
                    <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] shadow-2xs">
                      已完成
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#f4f4f2] border border-[#e5e5e0] text-[#787770]">
                      待履约
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 右侧节点 (Next Step) */}
          <div className="w-full flex flex-col items-center justify-center text-center">
            {nextStep ? (
              <motion.div
                key={`next-${activeIdx + 1}`}
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectStep(activeIdx + 1)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* 时间戳 */}
                <span className="text-[10px] tabular-nums font-medium text-[#888880] mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {stepTimestamps[activeIdx + 1]}
                </span>

                {/* 节点气泡 */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                    activeIdx + 1 <= safeStep
                      ? 'bg-[#10b981] text-white border border-[#059669]'
                      : 'bg-white border border-[#d1d5db] text-[#888880]'
                  }`}
                >
                  {activeIdx + 1 <= safeStep ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className="text-[11px] font-bold text-[#888880]">{activeIdx + 2}</span>
                  )}
                </div>

                {/* 节点名称 */}
                <span className="text-[11px] font-medium text-[#787770] group-hover:text-black mt-1.5 transition-colors">
                  {nextStep.label}
                </span>
              </motion.div>
            ) : (
              <div className="w-full opacity-0 pointer-events-none" />
            )}
          </div>
        </div>

        {/* 底部 5 节点微型走马灯分页点 (Pagination Dots Indicator) */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-[#f0f0ec]">
          {steps.map((st, i) => {
            const isCur = i === activeIdx;
            const isDone = i <= safeStep;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => handleSelectStep(i)}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  isCur
                    ? 'w-5 h-1.5 bg-[#10b981]'
                    : isDone
                    ? 'w-1.5 h-1.5 bg-[#6ee7b7]'
                    : 'w-1.5 h-1.5 bg-[#d1d5db]'
                }`}
                title={`跳转查看：${st.label}`}
                aria-label={st.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarouselStepsScroller;
