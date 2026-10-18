import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * 极简 Toast 系统（自带视觉）
 * 语义与主工程 src/components/ui/ToastContext.tsx 对齐：
 *   showToast(title, opts) / success / error / info / warning / dismissAll
 * 默认时长：success 3200ms、error 4200ms、warning 3800ms、info 3200ms
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (title: string, opts?: ToastOptions) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3200,
  error: 4200,
  warning: 3800,
  info: 3200
};

const MAX_TOASTS = 3;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, any>>({});
  const lastRef = useRef<{ key: string; at: number }>({ key: '', at: 0 });

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const dismissAll = useCallback(() => {
    Object.values(timersRef.current).forEach((t) => clearTimeout(t));
    timersRef.current = {};
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (title: string, opts?: ToastOptions) => {
      const type: ToastType = opts?.type || 'info';
      const message = opts?.message;
      const duration = opts?.duration ?? DEFAULT_DURATION[type];

      // 1.2s 内相同 title+type 去重
      const key = `${type}::${title}`;
      const now = Date.now();
      if (lastRef.current.key === key && now - lastRef.current.at < 1200) {
        return '';
      }
      lastRef.current = { key, at: now };

      const id = `toast_${now}_${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = { id, title, message, type, duration };

      setToasts((prev) => [...prev, item].slice(-MAX_TOASTS));

      timersRef.current[id] = setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (title: string, message?: string) => showToast(title, { message, type: 'success' }),
      error: (title: string, message?: string) => showToast(title, { message, type: 'error' }),
      warning: (title: string, message?: string) => showToast(title, { message, type: 'warning' }),
      info: (title: string, message?: string) => showToast(title, { message, type: 'info' }),
      dismissAll
    }),
    [showToast, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-2 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-[380px] bg-white border border-[#e5e5e0] rounded-xl shadow-lg px-3 py-2.5 flex items-start gap-2"
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : t.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1a1c1b] leading-tight">{t.title}</div>
                {t.message ? (
                  <div className="text-[11px] text-[#787770] mt-0.5 leading-snug break-words">{t.message}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 p-0.5 rounded text-[#a1a19a] hover:text-black transition-colors cursor-pointer"
                aria-label="关闭提示"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

export default ToastProvider;
