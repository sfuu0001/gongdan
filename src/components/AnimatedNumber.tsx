import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  triggerKey?: string | number;
  className?: string;
}

/**
 * 指标数字跳变联动组件：在数值变化、状态流转或手动刷新时触发弹跳落定动效
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, triggerKey = 0, className = '' }) => {
  return (
    <span className={`relative inline-flex items-center justify-center overflow-hidden tabular-nums ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${value}-${triggerKey}`}
          initial={{ y: 10, opacity: 0, scale: 0.78 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -10, opacity: 0, scale: 0.78 }}
          transition={{
            type: 'spring',
            stiffness: 520,
            damping: 18,
            mass: 0.65,
          }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
