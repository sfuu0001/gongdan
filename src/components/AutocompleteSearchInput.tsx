import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Clock,
  History,
  TrendingUp,
  UtensilsCrossed,
  Hash,
  User,
  ShoppingBag,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { Order } from '../types';

export interface AutocompleteSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  orders: Order[];
  currentUid: string;
  placeholder?: string;
}

export const AutocompleteSearchInput: React.FC<AutocompleteSearchInputProps> = ({
  value,
  onChange,
  orders,
  currentUid,
  placeholder = '输入 UID / 订单号 / 菜品 / 姓名筛选...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 最近搜索记录
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('urban_radar_recent_searches');
      if (saved) return JSON.parse(saved);
      return ['UR-DIN-9821', '和牛小汉堡', '冷萃冰咖', 'A1桌'];
    } catch {
      return ['UR-DIN-9821', '和牛小汉堡', '冷萃冰咖', 'A1桌'];
    }
  });

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('urban_radar_recent_searches', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('urban_radar_recent_searches');
    } catch (e) {
      console.warn(e);
    }
  };

  // 点击外部收起联想菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 快速推荐词条 (快捷联想热搜)
  const quickHotTags = [
    { label: '首单 #9821', value: 'UR-DIN-9821', type: 'order' },
    { label: '和牛小汉堡', value: '和牛', type: 'dish' },
    { label: '冷萃冰咖', value: '冷萃', type: 'dish' },
    { label: 'A1桌 (堂食)', value: 'A1', type: 'table' },
    { label: '极速雷达专送', value: 'delivery', type: 'channel' }
  ];

  // 联想建议列表匹配计算
  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return null;

    const matchedOrders: Array<{
      orderNo: string;
      title: string;
      status: string;
      channel: string;
      tableCode?: string;
      pickupCode?: string;
      amount?: number;
    }> = [];

    const matchedDishes: Array<{
      name: string;
      price: number;
      orderNo: string;
      station?: string;
    }> = [];

    const matchedUsers: Array<{
      name: string;
      uid: string;
    }> = [];

    const seenOrders = new Set<string>();
    const seenDishes = new Set<string>();

    orders.forEach((o) => {
      const orderNo = o.orderNo || '';
      const custName = o.customerName || '';
      const uid = o.userId || '';
      const table = o.tableCode || '';
      const pickup = o.pickupCode || '';

      // 订单匹配
      if (
        (orderNo.toLowerCase().includes(q) ||
          table.toLowerCase().includes(q) ||
          pickup.toLowerCase().includes(q)) &&
        !seenOrders.has(orderNo)
      ) {
        seenOrders.add(orderNo);
        matchedOrders.push({
          orderNo,
          title: o.truckName || '黑曜石01号流动餐车',
          status: o.status || '制作中',
          channel: o.channelType || o.channel || 'delivery',
          tableCode: o.tableCode,
          pickupCode: o.pickupCode,
          amount: o.totalAmount
        });
      }

      // 食客 / UID 匹配
      if (custName.toLowerCase().includes(q) || uid.toLowerCase().includes(q)) {
        if (!matchedUsers.some((u) => u.uid === uid && u.name === custName)) {
          matchedUsers.push({
            name: custName || '先锋食客',
            uid: uid || currentUid
          });
        }
      }

      // 菜品明细匹配
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const dName = item.name || '';
          if (dName.toLowerCase().includes(q) && !seenDishes.has(dName)) {
            seenDishes.add(dName);
            matchedDishes.push({
              name: dName,
              price: item.price || 0,
              orderNo,
              station: item.station
            });
          }
        });
      }
    });

    return {
      orders: matchedOrders.slice(0, 4),
      dishes: matchedDishes.slice(0, 4),
      users: matchedUsers.slice(0, 2),
      totalMatches: matchedOrders.length + matchedDishes.length + matchedUsers.length
    };
  }, [value, orders, currentUid]);

  const handleSelectSuggestion = (text: string) => {
    onChange(text);
    saveRecentSearch(text);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // 高亮匹配文字
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="text-emerald-700 font-black bg-emerald-100/80 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 搜索输入框 */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-[#888880] absolute left-2.5 pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              saveRecentSearch(value.trim());
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-7.5 pr-7 py-1.5 text-xs bg-[#FAF9F7] border border-[#e5e5e0] rounded-xl focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-black focus:border-black transition placeholder:text-[#999990] text-[#141413] font-medium shadow-2xs"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="absolute right-2 text-[10.5px] text-neutral-400 hover:text-black p-0.5 rounded-full hover:bg-neutral-100 cursor-pointer transition-colors"
              title="清空搜索内容"
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 联想输入下拉弹出面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-[#e5e5e0] overflow-hidden text-left divide-y divide-[#f4f4f0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模式 A：用户正在输入，展示实时联想匹配建议 */}
            {suggestions ? (
              <div className="p-2 space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                {suggestions.totalMatches === 0 ? (
                  <div className="py-6 px-4 text-center space-y-1">
                    <Search className="w-5 h-5 text-neutral-400 mx-auto" />
                    <p className="text-xs font-bold text-neutral-800">未匹配到相关结果</p>
                    <p className="text-[10.5px] text-[#888880]">
                      可尝试输入订单号后4位、菜品名称、或台位号（如 A1）
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 匹配到的订单单据 */}
                    {suggestions.orders.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-[#888880] flex items-center gap-1">
                          <Hash className="w-3 h-3 text-emerald-600" />
                          <span>匹配订单 ({suggestions.orders.length})</span>
                        </div>
                        {suggestions.orders.map((o) => (
                          <div
                            key={o.orderNo}
                            onClick={() => handleSelectSuggestion(o.orderNo)}
                            className="px-2.5 py-1.5 rounded-xl hover:bg-[#f6f6f4] active:bg-[#eeeee9] transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shrink-0 font-bold text-[10px]">
                                #
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-obsidian truncate">
                                  {highlightMatch(o.orderNo, value.trim())}
                                </div>
                                <p className="text-[10px] text-[#888880] truncate">
                                  {o.channel === 'dine_in'
                                    ? `堂食现制 · ${o.tableCode || 'A1'}桌`
                                    : o.channel === 'pickup'
                                    ? `到店自提 · 取餐码 #${o.pickupCode || '8806'}`
                                    : '极速雷达专送'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-1.5">
                              {o.amount !== undefined && (
                                <span className="text-[11px] font-bold font-amount text-obsidian">
                                  ¥{Number(o.amount).toFixed(2)}
                                </span>
                              )}
                              <ChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-black transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 匹配到的菜品 */}
                    {suggestions.dishes.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-[#f4f4f0]">
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-[#888880] flex items-center gap-1">
                          <UtensilsCrossed className="w-3 h-3 text-amber-600" />
                          <span>匹配菜品 ({suggestions.dishes.length})</span>
                        </div>
                        {suggestions.dishes.map((d, dIdx) => (
                          <div
                            key={`${d.name}-${dIdx}`}
                            onClick={() => handleSelectSuggestion(d.name)}
                            className="px-2.5 py-1.5 rounded-xl hover:bg-[#f6f6f4] active:bg-[#eeeee9] transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[#ea580c] shrink-0">
                                <UtensilsCrossed className="w-3 h-3" />
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-obsidian truncate">
                                  {highlightMatch(d.name, value.trim())}
                                </div>
                                <span className="text-[10px] text-[#888880]">
                                  {d.station || '炭火炙烤/现制档'} · 关联单据 #{d.orderNo.slice(-4)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                筛选此菜
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 匹配到的食客与UID */}
                    {suggestions.users.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-[#f4f4f0]">
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-[#888880] flex items-center gap-1">
                          <User className="w-3 h-3 text-sky-600" />
                          <span>匹配食客</span>
                        </div>
                        {suggestions.users.map((u, uIdx) => (
                          <div
                            key={uIdx}
                            onClick={() => handleSelectSuggestion(u.uid)}
                            className="px-2.5 py-1.5 rounded-xl hover:bg-[#f6f6f4] active:bg-[#eeeee9] transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                                <User className="w-3 h-3 text-emerald-400" />
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-obsidian truncate">
                                  {highlightMatch(u.name, value.trim())}
                                </div>
                                <span className="text-[10px] font-mono text-[#888880]">
                                  UID: {highlightMatch(u.uid, value.trim())}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-neutral-400 group-hover:text-black">
                              筛选UID →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* 模式 B：未输入时，展示历史记录与快捷热搜推荐 */
              <div className="p-2.5 space-y-3">
                {/* 快捷热搜推荐 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10.5px] font-bold text-neutral-700 px-1">
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span>猜你想搜 · 快速联想</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-0.5">
                    {quickHotTags.map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => handleSelectSuggestion(tag.value)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF9F7] hover:bg-[#f2f2ee] text-[#333330] text-[10.5px] font-bold border border-[#e5e5e0] transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                      >
                        {tag.type === 'dish' ? (
                          <UtensilsCrossed className="w-2.5 h-2.5 text-amber-600" />
                        ) : tag.type === 'order' ? (
                          <Hash className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                        )}
                        <span>{tag.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 最近搜索历史 */}
                {recentSearches.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#f4f4f0]">
                    <div className="flex items-center justify-between text-[10.5px] px-1">
                      <span className="font-bold text-neutral-700 flex items-center gap-1">
                        <History className="w-3 h-3 text-[#707068]" />
                        <span>最近检索</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[10px] text-[#888880] hover:text-red-600 transition-colors cursor-pointer"
                      >
                        清空历史
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 px-0.5">
                      {recentSearches.map((keyword, kIdx) => (
                        <button
                          key={kIdx}
                          type="button"
                          onClick={() => handleSelectSuggestion(keyword)}
                          className="px-2 py-0.5 rounded-md bg-[#f6f6f4] hover:bg-[#e8e8e4] text-[#40403c] text-[10px] font-medium transition cursor-pointer flex items-center gap-1 active:scale-95 border border-[#ecece8]"
                        >
                          <Clock className="w-2.5 h-2.5 text-[#888880]" />
                          <span>{keyword}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 底部小提示 */}
            <div className="px-3 py-1.5 bg-[#FAF9F7] text-[10px] text-[#888880] flex items-center justify-between">
              <span>支持按单号、菜品、台位、UID 模糊联想</span>
              <span className="tabular-nums">共 {orders.length} 笔订单可查</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutocompleteSearchInput;
