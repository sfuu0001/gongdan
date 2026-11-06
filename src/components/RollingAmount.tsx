import React from 'react';
import { motion } from 'motion/react';

interface RollingAmountProps {
  value: number;
  triggerKey?: string | number;
  className?: string;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * 金额数字滚动跳变组件：按位独立滚轮，支持首次加载与刷新/变更时的机械式滚动跳变
 */
export const RollingAmount: React.FC<RollingAmountProps> = ({
  value,
  triggerKey = 0,
  className = '',
}) => {
  const formatted = Number(value || 0).toFixed(2);
  const chars = formatted.split('');

  return (
    <span className={`inline-flex items-baseline tabular-nums font-amount ${className}`}>
      <span className="mr-[0.5px]">¥</span>
      {chars.map((char, index) => {
        const digit = Number(char);
        if (Number.isNaN(digit)) {
          return (
            <span key={`sep-${index}`} className="inline-block">
              {char}
            </span>
          );
        }

        return (
          <span
            key={`digit-${index}-${triggerKey}`}
            className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15em]"
          >
            <motion.span
              initial={{ y: '0%' }}
              animate={{ y: `-${digit * 10}%` }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 26,
                mass: 0.75,
                delay: index * 0.035,
              }}
              className="flex flex-col"
            >
              {DIGITS.map((d) => (
                <span key={d} className="h-[1.15em] leading-[1.15em] flex items-center justify-center">
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
};
