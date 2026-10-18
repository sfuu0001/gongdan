# 顾客端「工单」页 · 独立源码包

从 UrbanRadar 主工程 `C:\Users\Public\wb-p0-ws` 抽取出的**自包含**源码目录，只含「实时订单」这一屏，可脱离主工程独立运行。

- **抽取日期**：2026-10-19
- **源组件**：`src/components/OrdersPageView.tsx`（1525 行）+ `src/components/RealTimeOrderCard.tsx`（1219 行）
- **渲染区间**：`OrdersPageView.tsx` 的 `L771–1280`（根 motion.div → 列表容器结束）
- **产物行数**：3923 行（13 个 ts/tsx/css 文件）

---

## 快速开始

```bash
npm install
npm run dev        # http://127.0.0.1:5180
npm run build      # 产物 dist/
npm run preview    # 预览构建产物，同端口 5180
```

---

## 文件树

```
orders-workorder-standalone/
├── index.html                 入口（含内联 SVG favicon；引 /fonts/*.css）
├── package.json               react19 / motion13 / lucide0.546 / qrcode / vite6 / tailwind4
├── vite.config.ts             react + @tailwindcss/vite，端口 5180
├── public/fonts/              fonts-main.css + fonts-hanken.css + 10 个 woff2
└── src/
    ├── main.tsx               10   createRoot + import './index.css'
    ├── App.tsx                22   430px 手机壳 + ToastProvider
    ├── index.css             277   样式底座（见下「样式来源」）
    ├── types.ts              108   Order / OrderItemRecord / UserProfile / TabType
    ├── components/
    │   ├── WorkOrderPage.tsx          854   L771-1280 渲染区 + 状态机 + 映射层
    │   ├── RealTimeOrderCard.tsx     1146   工单卡（原 1219 → 裁剪至 1146）
    │   └── HorizontalStepsScroller.tsx 408  履约时序横向步进器
    ├── data/
    │   ├── orders.ts          305   MOCK_ORDERS（原始 Order 形态）+ 本地 fetch 模拟
    │   ├── statusConfig.ts    305   15 状态全量表（源 orderFlowEngine L3-297 本地化）
    │   └── dishImages.ts      181   import.meta.glob 菜品图匹配 + 关键词兜底
    ├── ui/ToastProvider.tsx   159   自带 Toast（API 同主工程）
    └── utils/
        ├── qrCode.ts           27   qrcode.toDataURL
        └── useCardScrollReveal.tsx 121  卡片入场显现
```

---

## 样式来源（`src/index.css`，277 行）

每段上方标注主工程 `src/index.css` 的原行号，**取值未做任何修改**：

| 本包段 | 主工程原行号 | 内容 |
|---|---|---|
| `@theme` A | L258–336 | 权威令牌集：断点、page-bg/card-bg、border、text-*、status-olive/terracotta、radius-console*、shadow-console*、signal-* |
| `@theme` B | L487–538 | Order Summary DS：ink/on-ink、success/warning/danger、canvas/hairline、radius-ds-*、height-action/tag、font-* |
| 补充 | L143–144 | `--color-obsidian` / `--color-surface-card`（卡片 16+4 处在用） |
| `.font-amount` 等 | L541–552 | 金额类 9 个选择器（含 `.price-text` `[data-amount]` 等别名） |
| `.rounded-custom` | L845 | 4px 微圆角 |
| `.no-scrollbar` | L935–941 | 局部隐藏滚动条 |
| `@layer base` | L981–1002 | body 底色 `#f9f9f7`、字色 `#1a1c1b`、`letter-spacing:-0.01em`、Space Grotesk 栈 |
| 全局滚条 | L1045–1071 | 全域隐藏滚动条（含 `.hide-scrollbar`） |
| motion | L2488–2494 | `--transition-duration-*` / `--ease-*`（`duration-normal` 4 处在用） |
| `.animate-pulse-dot` | L1511–1517 | 在线脉冲点 |
| `.organic-card-reveal` | L1773–1798 | 卡片三态入场 |

**刻意剔除**：`.merchant-workspace-readable`（商家端字号覆盖层，本屏不用）、`@media print` 热敏小票、`material-symbols` 图标字体（本屏用 lucide）、`--color-deck-*` / `--color-rad-*` / `--color-console-*` 色板、design-tokens 三份 import。

---

## 与主工程的依赖替换

| 原依赖 | 替代 |
|---|---|
| `../utils/cloudbase` 的 `fetchOrdersFromCloudFunction` | `data/orders.ts` 本地 async（600ms，`source:'local_fallback'`） |
| `../context/DevSimulationContext` | 删除（原仅用于门控云函数监控按钮，按钮已删） |
| `./user/CloudFunctionMonitorModal` | 删除（屏外） |
| `./chat/UnifiedOmniChatModal`（lazy） | 删除（屏外） |
| 退单 Modal（原 L1292–1508） | 删除；卡片「申请退单」改为 Toast 提示 |
| `../utils/orderFlowEngine` | `data/statusConfig.ts`（15 状态本地化） |
| `../utils/orderNormalizer` | 删除（原仅用于 mock 去重，独立包不再走该分支） |
| `../utils/dishImageMatcher` | `data/dishImages.ts`（`import.meta.glob` + 关键词匹配） |
| `../utils/qrCodeEngine` | `utils/qrCode.ts`（`qrcode.toDataURL`） |
| `../types` | `src/types.ts`（仅本屏字段） |
| `./ui/ToastContext` | `ui/ToastProvider.tsx`（API 同款，自带视觉） |

---

## Mock 数据

`data/orders.ts` 的 `MOCK_ORDERS` 是**原始 Order 形态**（`status: 'cooking'` / `stepIndex` / `items[]`），会走一遍 `WorkOrderPage` 里的 `dynamicInProgress` 映射层，产出与截图一致的卡片。

首卡基准（`#UR-DIN-9821`，已实测）：

| 字段 | 值 |
|---|---|
| 单号 / UID | `#UR-DIN-9821` / `tcb_u_88...` |
| 桌号 / 渠道 | `A1桌` / 堂食现制 |
| 餐车 / 进度 | 黑曜石 01 号流动餐车 / 40% |
| 徽章 / 金额 | `PREPARING` / `¥186.00` |
| 时序 | 12:20:15 开台下单 → **12:21 后厨接单（当前）** → 预计12:23 |
| 明细 | 碳烤和牛小汉堡双重奏 x2（已上桌 12:35）／黑曜极夜冷萃冰咖 x1（已上桌 12:26）／冷萃黑金茉莉提拉米苏 x1（现制 75%） |

`estimatedDeliveryTime` 填纯时间（如 `'12:23'`），因为卡片模板会自行加「预计」前缀。

---

## 验证结果

| 项 | 结果 |
|---|---|
| `vite build` | ✅ 493KB JS（gzip 153KB）/ 59.65KB CSS |
| 控制台错误 | ✅ 0 |
| 资源 4xx | ✅ 0（24 张 webp 全部 200 且 `naturalWidth > 0`） |
| 死依赖残留 | ✅ `grep cloudbase\|DevSimulation\|CloudFunctionMonitor\|SimulationProbe\|orderFlowEngine\|orderNormalizer` = 0 |
| body 底色 / 字距 | ✅ `rgb(249,249,247)` / `-0.16px`（与主工程一致） |
| 卡片几何 | ✅ 白底 / 16px 圆角（与主工程一致） |

**与原主工程的已知差异**（均为预期）：
1. 后 3 张卡数据不同 —— 主工程走真实 localStorage 订单，本包固定用 mock 的另外 3 条
2. 无底部导航栏 —— 独立壳只保留 430px 手机视口
3. 计数不同（专属 5 / 全网 5 vs 主工程 0 / 9）—— mock 全部归属同一 UID，过滤后仍是 5 条
4. 云函数监控 / 退单表单 / 消息中心 均无落地页（Toast 提示代替）

---

## 已知问题（源自原工程，未修）

1. `statusConfig.ts` 的 `refund_pending` 分支返回 `cancel_requested` 的配置（源 `orderFlowEngine.ts` L265 即如此），徽章会显示 `CANCEL REQUESTED` 而非 `REFUND PENDING`
2. `dynamicDelivered` 里 `o.status === 'delivered'` 判断冗余（`completed` 已在前置分支）
3. 卡片标题在 430px 下必然截断（`黑曜石 01 号流动…`）—— 原工程同宽同样截断，是设计如此，非缺陷

---

## 回滚 / 溯源

- 本包为**只读抽取**，主工程 `wb-p0-ws` 下任何文件均未被修改（源文件 md5：`OrdersPageView.tsx` = `5310b1fa0b517945fd41092273a35a3e`，`RealTimeOrderCard.tsx` = `54528566efc3eac162225c5ef377c2c3`，`index.css` = `b0eee86ba9076b8c9e0e556a949b0382`）
- 抽取前的空白备份目录：`C:\Users\Public\wb-backup-orders-extract-20261019001421`
- 基准对照截图：`C:\Users\Public\wb-orders-baseline\`（主工程实拍）、`C:\Users\Public\wb-orders-standalone-shots\`（本包实拍）
- 验证脚本：`C:\Users\Public\wb-verify-standalone.mjs`
