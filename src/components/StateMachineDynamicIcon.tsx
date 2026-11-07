import React from 'react';
import { motion } from 'motion/react';

export type StateMachineType =
  | 'in_progress'
  | 'pending'
  | 'cooking'
  | 'ready'
  | 'rider_heading'
  | 'waiting_pickup'
  | 'picked_up'
  | 'delivering'
  | 'completed'
  | 'delivered'
  | 'refund_pending'
  | 'refunded'
  | 'cancelled';

export interface StateMachineDynamicIconProps {
  status?: string;
  size?: number; // size in px, defaults to 14
  className?: string;
  overrideColor?: string;
}

/**
 * 状态机动态矢量图标组件 (State Machine Dynamic Animated Icon)
 * 专为餐饮工单履约引擎打造的高质感矢量微动效图标，严格对齐视觉基准规范：
 * - 进行中: 经典带盖餐盘/餐盖锅 (Cloche Pot)
 * - 近期送达: 极简圆形勾选 (Circle Check)
 * - 现制中: 炭火炙烤火苗 (Flame Outline)
 * - 待取餐: 3D 轴测保温出餐箱 (Isometric Box)
 * - 配送中: 极速专送货车 (Delivery Truck)
 */
export const StateMachineDynamicIcon: React.FC<StateMachineDynamicIconProps> = ({
  status = 'pending',
  size = 14,
  className = '',
  overrideColor
}) => {
  const normStatus = (status || 'pending').toLowerCase();

  // 0. 进行中 / 备餐中 (In Progress / Cloche Pot)
  if (
    normStatus === 'in_progress' ||
    normStatus.includes('progress') ||
    normStatus.includes('进行')
  ) {
    const clocheColor = overrideColor || 'currentColor';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke={clocheColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 ${className}`}
        aria-label="进行中图标"
      >
        <path d="M6.5 4C6.5 2.6 9.5 2.6 9.5 4" />
        <line x1="2.2" y1="5.2" x2="13.8" y2="5.2" />
        <path d="M3.2 6.5L4.1 11.6C4.2 12.3 4.8 12.8 5.5 12.8H10.5C11.2 12.8 11.8 12.3 11.9 11.6L12.8 6.5" />
      </svg>
    );
  }

  // 1. 现制中 / 炭火炙烤 / 后厨备餐 (Cooking Flame) - 严格对齐基准设计 Flame 线框
  if (
    normStatus.includes('cook') ||
    normStatus.includes('prep') ||
    normStatus.includes('现制') ||
    normStatus.includes('炙烤') ||
    normStatus.includes('制作')
  ) {
    const flameColor = overrideColor || '#b45309';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={flameColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 ${className}`}
        aria-label="现制中图标"
      >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    );
  }

  // 2. 配送中 / 骑手专送 (Delivery Truck) - 严格对齐基准设计 Truck 货车线框
  if (
    normStatus.includes('deliver') ||
    normStatus.includes('en_route') ||
    normStatus.includes('heading') ||
    normStatus.includes('配送') ||
    normStatus.includes('专送') ||
    normStatus.includes('骑手')
  ) {
    const truckColor = overrideColor || '#0284c7';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={truckColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 ${className}`}
        aria-label="配送中图标"
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    );
  }

  // 3. 待取餐 / 恒温保温 (Isometric Package Box) - 严格对齐基准设计 Package 3D 箱体
  if (
    normStatus.includes('ready') ||
    normStatus.includes('waiting') ||
    normStatus.includes('待取') ||
    normStatus.includes('备齐') ||
    normStatus.includes('保温')
  ) {
    const boxColor = overrideColor || '#b45309';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={boxColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 ${className}`}
        aria-label="待取餐图标"
      >
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  // 4. 已妥投送达 / 近期送达 (Circle Check) - 严格对齐基准设计 CheckCircle2
  if (
    normStatus.includes('complet') ||
    normStatus.includes('delivered') ||
    normStatus.includes('送达') ||
    normStatus.includes('妥投') ||
    normStatus.includes('闭环')
  ) {
    const doneColor = overrideColor || '#059669';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={doneColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 ${className}`}
        aria-label="送达完成图标"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  // 5. 退款 / 售后 / 取消 (RotateCcw)
  if (
    normStatus.includes('refund') ||
    normStatus.includes('cancel') ||
    normStatus.includes('reject') ||
    normStatus.includes('退款') ||
    normStatus.includes('取消') ||
    normStatus.includes('拒单')
  ) {
    const warnColor = overrideColor || '#dc2626';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={warnColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 ${className}`}
        aria-label="退单图标"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    );
  }

  // 6. 待接单 / 历史订单 / 队列等待 (Clock)
  const pendColor = overrideColor || '#64748b';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={pendColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      aria-label="时钟等待图标"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

export default StateMachineDynamicIcon;
