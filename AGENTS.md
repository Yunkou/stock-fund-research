# AGENTS.md · 02-2026-stock-fund-research

> 这份文档给未来接手的 agent 用。读完它，你应该能：
> 1. 30 秒内知道项目在做什么、文件怎么组织、数据是什么；
> 2. 不重复踩我已经踩过的坑；
> 3. 改任何东西前先知道哪些**不变量**必须守住。

---

## 1. 项目一句话

单页 HTML 报告，**2026 年全球 AI 产业链利润分配**的两层桑基图：
- **第一大类**：6 大主权地区阵营（**美加 / 中国大陆 / 中国台湾 / 韩国 / 日本 / 欧洲**）+ 其他兜底
- **第二大类**：代表性公司（NVIDIA · TSMC · ASML · OpenAI · 字节 · 腾讯 · …）

**注意**：第一大类不是「亚太 / 欧美」这种合并块，**TSMC 必须在「中国台湾」、三星/SK 在「韩国」、软银在「日本」**——不要回退到「日韩台」合并。Micron 在「美加」。

顶部一键切到 **NVIDIA Five-Layer Cake** 视图（Energy / Chip / Computing Infra / Model / Application），口径来自 Jensen Huang @ Davos 2025。

> 用户原话：**「桑基图占面板主要布局」**。任何改动都不要把它压回小尺寸。

---

## 2. 目录与角色

```
.
├── AGENTS.md          ← 你正在读
├── README.md          ← 项目对外说明（设计取向、交互、关键结论）
├── index.html         ← 单页报告入口
├── src/
│   ├── data.js        ← 两套数据集（geoLinks / layerLinks）+ 元数据 + assertBalance
│   ├── sankey.js      ← 纯 SVG 桑基图渲染器（零依赖，含 ResizeObserver）
│   ├── filters.js     ← 视图切换 + TopN 聚合 + KPI / Layer Stack / 表刷新
│   ├── style.css      ← 设计 token + 布局
│   ├── upstream.js          ← 47 品类 × 68 公司（材料/设备/电算协同）— 平行于主报告
│   ├── upstream-view.js     ← 上游视图渲染器
│   ├── upstream.css         ← 上游视图样式
│   └── downstream.js        ← 37 赛道 × 61 公司（L5 之后的 6 组：云/行业模型/办公/行业 SaaS/C 端/机器人具身）
└── docs/
    ├── methodology.md              ← 数据来源、口径、已知偏差（主桑基 Σ=812 bn USD）
    ├── upstream-methodology.md     ← DOL × PricingPower + 国产替代阶段 + 卡脖子维度
    └── downstream-methodology.md   ← 平行的下游口径：moat × pricingPower + 商业化阶段
└── assets/            ← 预留（导出图、字体）
```

**JS 加载顺序**（写在 `index.html` 末尾）：
```html
<script src="src/data.js"></script>     <!-- 先暴露 window.AI_PROFIT_DATA -->
<script src="src/sankey.js"></script>   <!-- 后注册 window.Sankey.render -->
<script src="src/filters.js"></script>  <!-- 最后绑定事件，调用 window.initReport() -->
```

---

## 3. 不变量（改了会破坏报告的硬约束）

| # | 不变量 | 验证方式 |
|---|---|---|
| ① | `Σ geoLinks ≈ Σ layerLinks ≈ 812`（USD bn，round-1 严格相等；raw 浮点容差 ±0.06，由 `assertBalance` 检查） | `data.assertBalance()` 启动时控制台 warn |
| ② | 每个公司在两套视图里的总利润相等 | `data.companyTotals()` 全 0 mismatch |
| ③ | L1..L5 严格按 Jensen 顺序：Energy → Chip → Computing Infra → Model → Application | `data.layerGroups` 数组顺序 |
| ④ | Sankey 自下而上视觉顺序 = L1(底) → L5(顶) | sankey.js `isLayerCol` 分支 |
| ⑤ | Σ 总盘 = 812，公司切分不得引入 geo 中不存在的 target 名 | 把任一公司切到「L4 Model」时，target 必须已经出现在 geoLinks |
| ⑥ | `*` 标记公司必须显式归类到 `proxyCompanies` 或「realized」（带 `*` 但未盈利/按估值折算的进 proxy；带 `*` 但已上市盈利的留 realized） | `assertBalance` 启动时 console.warn 列出未归类的 `*` 公司 |

**改数据前必读** [`docs/methodology.md`](docs/methodology.md)，里面有每个口径的来源说明。

### 3.5 渲染时尾部合并（tail-merge，可读性优化）

**重要**：源数据 `src/data.js` 完全不动；尾部合并是**仅在渲染前**发生的纯前端聚合，由 `src/filters.js#compactLinks` 实现。

| Rank 按钮 | 渲染节点数 | 合并行为 |
|---|---|---|
| **Top 30** (default) | ~38 | 保留金额前 30 公司，剩下 ~50 家合并到 `Other (n=50)` |
| Top 12 | ~20 | 保留金额前 12，剩下 ~46 家合并 |
| Top 8 | ~16 | 保留前 8，剩 ~50 |
| Top 5 | ~13 | 保留前 5，剩 ~53 |
| **All 80** | ~87 | **无合并**，完整渲染 |

合并节点用 ash 色，与 `Others` 阵营同色；focus 时显示「Other (n=28) · 87.5 bn · 28 companies aggregated」。

**Top 3 / Top 10 / #1 Capturer KPI 排除 Other 节点**，按真实单家公司排名（避免 Other 排到第二污染头部叙事）。

**改默认 topN**：编辑 `src/filters.js` 第 14 行 `state.topN` 默认值。

### 3.7 三条 Observation 紧贴桑基（叙事落点）

**重要**：三条 observation callout（`.observations` 段）必须**紧贴 `.sankey-stage` 下方**，**不要**塞到 `.tables` 下面或 `.below` 末尾——这是 `PRODUCT.md` 30 秒叙事的落点位置。

- DOM 顺序：`sankey-stage` → `.observations` → `.tables` → 末尾
- 移动端 ≤1100px：自动 fallback 为 1 列堆叠
- 字号：标题 22px serif（Fraunces），正文 12px sans（Inter），数字 12.5px mono
- 配色：amber 用于 01/02/03 序号；strong 数字用 mono + ink 色

---

## 4. 设计 token（不要随便改）

```css
/* src/style.css :root */
--bg:     #0B0D10;   /* 近黑底，全局 */
--line:   #1F262F;   /* 卡片分隔 */
--ink:    #E8E6E1;   /* 主文字 */
--ink-dim:#8A8F98;   /* 次文字 */
--ink-mute:#4A4F58;  /* 静默文字（label/caption） */

--amber:   #FF7A45;  /* US & Canada / L2 Chip */
--crimson: #E0567A;  /* China / L4 Model */
--slate:   #7BA7BC;  /* Europe / L3 Computing Infra */
--moss:    #9CC68B;  /* JP·KR·TW / L5 Application */
--ash:     #8A8F98;  /* Others / L1 Energy */

--serif: 'Fraunces', Georgia, serif;       /* 标题、h2/h3 */
--sans:  'Inter', -apple-system, sans-serif; /* 正文 */
--mono:  'JetBrains Mono', Menlo, monospace; /* 数字、label、KPI */
```

**字体走 Google Fonts CDN**（在 `index.html` `<head>` 里），离线场景下会回退到系统字体，但布局不会崩。

---

## 5. 桑基图为绝对主角 — 布局红线

| 元素 | 尺寸 | 不可破坏 |
|---|---|---|
| `.sankey-stage` | `width:100%; height:78vh; min-height:560px` | ✅ 高度 |
| 左侧 rail | `width: 180px`（`--rail-w` token） | ❌ 不要扩回 320px |
| KPI 顶部 4 列 | 横排 `grid-template-columns: repeat(4, 1fr)` | ✅ 不要堆回侧栏 |

如果用户报「桑基图太小」，**先检查 `.sankey-stage` 高度是否被覆盖**，再看是否有外部 CSS 把它压扁了。

---

## 6. sankey.js 的关键技术点（接手必读）

### 6.1 响应式测量

```js
function measure(svgEl) {
  const rect = svgEl.getBoundingClientRect();
  return { w: ..., h: ... };
}
```

**不要回退到 `svgEl.clientWidth`** —— jsdom / 旧 Safari 里 SVG 元素的 `clientWidth` 为 0。`getBoundingClientRect` 才可靠。

### 6.2 viewBox 偏移

`viewBox="-180 0 (W+220) H"` —— 左 180 容纳**国家阵营标签**（anchor=end），右 220 容纳**公司标签**（anchor=start）。

配套 CSS：

```css
.sankey-stage { overflow: visible; }
#sankey { overflow: visible; width: 100%; height: 100%; }
```

**坑**：如果改回 `overflow: hidden`，左源标签立刻消失。

### 6.3 标签可读性的关键 CSS

```css
#sankey .lbl-name {
  font-family: var(--mono);
  font-size: 11px;
  fill: var(--ink);
  paint-order: stroke fill;          /* 关键：先描边再填充 */
  stroke: var(--bg);
  stroke-width: 3px;
  stroke-linejoin: round;
}
```

**没有 `paint-order: stroke fill` 这行，标签会被彩色曲线穿透、互相重叠。** 这是迭代过程中定下来的，别动。

### 6.4 ResizeObserver 自动重渲染

```js
svgEl._resizeObserver = new ResizeObserver(() => {
  // 150ms 节流，差值 < 8px 不重绘
});
svgEl._resizeObserver.observe(svgEl.parentNode || svgEl);
```

**注意监听的是 `parentNode`（即 `.sankey-stage`）而不是 svg 本身**——某些浏览器对 svg 自身的 resize 事件不敏感。

### 6.5 Layer 视图的 cake 顺序

```js
const isLayerCol = arr.length > 1 && arr.every((n) => /^L\d/.test(n.id));
if (isLayerCol) {
  arr.sort((a, b) => parseInt(b.id.slice(1, 3), 10) - parseInt(a.id.slice(1, 3), 10));
}
```

按 `L1, L2, L3, L4, L5` **降序**排 → y 小的在顶。配合 `height` 居中 offset，最终 **L5 在 SVG 顶部、L1 在底部**——这正是 Jensen cake 自下而上的方向。**别改成升序**，否则视觉反过来。

### 6.6 估值代理节点（未盈利，按一级市场估值折算）

`data.js` 维护 `proxyCompanies` 集合（7 家：OpenAI\* / Anthropic\* / xAI\* / Cohere\* / Lambda Labs\* / Crusoe\* / Mistral\*）。**注意带 `*` 的 Microsoft\* / ARM\* / Snowflake\* 是已上市盈利公司，未列入**。

`isProxy(n)` 在 sankey.js 渲染时查询该集合，给目标公司：

| 元素 | 视觉处理 |
|---|---|
| 节点 rect | `opacity: 0.7` + `stroke-dasharray: 2 1.5` 虚线描边 |
| 链路 path | `opacity: 0.45` + `stroke-dasharray: 3 3` 虚线 + 去掉 gradient 用纯色 |
| 节点 label | `<text class="lbl-name is-proxy">` → 灰色 + italic + `▒` 前缀（来自 CSS `::before`） |
| `<title>` | 前缀 `▒ 估值代理 · `（无障碍回退，hover tooltip 可见） |
| rail legend | 底部多一行 `▒ 估值代理 · 虚线节点`（鼠标悬停 title 列出 7 家公司） |

**契约**：`assertBalance` 启动时若发现 `*` 公司既不在 `proxyCompanies` 也不在白名单，会 warn 提示（不阻断）—— 防止「带 `*` 但忘了分类」的语义遗漏。

---

## 7. 数据校验流程

每次改 `data.js` 后：

```bash
# 1. 启动时自检（控制台）
node -e "
const vm = require('vm');
const sb = { window:{}, console };
vm.createContext(sb);
vm.runInContext(require('fs').readFileSync('src/data.js','utf8'), sb);
const D = sb.window.AI_PROFIT_DATA;
console.log('geo Σ', D.geoLinks.reduce((s,l)=>s+l.value,0));
console.log('layer Σ', D.layerLinks.reduce((s,l)=>s+l.value,0));
console.log('mismatches', Object.values(D.companyTotals()).filter(v => Math.abs(v.geo-v.layer)>1e-6).length);
"

# 2. 端到端 + 截图（需先 /tmp/verify-sankey 装好 jsdom + playwright）
node /tmp/verify-sankey/check.mjs
node /tmp/shot.mjs           # 1600x1000 桌面
node /tmp/shot-layer.mjs     # layer 视图
node /tmp/shot-responsive.mjs  # 1600 / 1024 / 420 三档
```

**期望输出**：
- `geo Σ` 与 `layer Σ` 打印 `812.0` 附近（浮点容差 ±0.06，参见不变量 ①）
- `mismatches` 打印 `0`
- 桌面截图 stage `1346 × 778`，左侧源标签和右侧公司标签全部可读

### 7.1 外部数据交叉校验（vibe-trading-mcp · stdio）

`vibe-trading-mcp`（本地 stdio 守护进程，路径 `vibe-trading-mcp`）可用作外部 sanity check。
一键脚本：`scripts/mcp-crosscheck.py`（node sandbox 解析 data.js → JSON-RPC 拉 eastmoney 财务数据 → 渲染 markdown 报告）。

```bash
python3 scripts/mcp-crosscheck.py              # stdout 出报告
python3 scripts/mcp-crosscheck.py --json out.json  # 同时落 JSON
```

最近一次产出：`docs/mcp-crosscheck-report.md`。

**校验要点**：
- 内部不变量（Σ=812、公司切分守恒、proxy 集合）必须 100% 通过，否则禁止改动 data.js。
- 外部量级是 **量级合理性** 检查：data.js 是 2026E **业务线分配利润**，MCP 给的是已实现 op income / net profit（**报表口径**），对比时不要做等式，只看量级。
- **已知盲区**：`.KS` / `.T` / `.TW` 原股走 auto source 会落到 tushare 但 token 未配置 → `_unresolved`，只能通过美股 ADR 覆盖。

**MCP 已知工具（节选）**：
- `get_market_data` — OHLCV；US/HK/A 股可用 auto，KR/JP/TW 用美股 ADR 替代
- `get_financial_statements` — `income` / `balance` / `cashflow` / `indicators`，period=`annual|quarter`
- `search_symbol` — 解析公司名 → ticker
- `trading_quote` / `trading_history` — 仅在已配 trading connection 时可用

---

## 8. 已知坑 & 调试经验

| 症状 | 原因 | 修法 |
|---|---|---|
| Stage 里只剩一根橙色柱 | 节点宽 18px + 5 个源节点堆叠，肉眼像一根 | 节点宽 `Math.min(colW, 26)`；**根因**是 viewBox 没预留左标签区 |
| 左侧源标签消失 | svg `overflow: hidden` 裁掉了 viewBox 负 x 区域的文字 | stage + svg 都设 `overflow: visible` |
| 右侧标签被截 | viewBox 没扩右 margin | `viewBox = "-180 0 (W+220) H"` |
| 标签在曲线上互相穿透 | 没有 stroke 描边 | `.lbl-name { paint-order: stroke fill; stroke: var(--bg); stroke-width: 3px; }` |
| jsdom 报 `Cannot read properties of undefined (reading 'prototype')` | jsdom 没暴露 `HTMLSVGElement` | mock 时直接对 svg 实例 `Object.defineProperty(svgEl, 'clientWidth', ...)`，不要碰 prototype |
| jsdom SVG 缺 `getBoundingClientRect` | jsdom 不实现 | 在测试脚本里给 `SVGElement.prototype` 打补丁返回 mock rect |
| `node clientWidth` 为 0 | SVG 元素特殊性 | 改用 `getBoundingClientRect()`（已写入 `sankey.js#measure`） |
| Sankey 渲染断断续续 | ResizeObserver 在 jsdom 里没实现 | `if (typeof ResizeObserver !== 'undefined')` 守卫 |

---

## 9. 未来工作候选（用户没明确要求，但下一轮可能被问）

按优先级：

1. ✓ 点击节点的 focus 联动（已实现）：点击 NVIDIA → 在 Layer Stack 表里**高亮**所有 NVIDIA 出现的层。代码位置：`filters.js#handleFocus`。
2. **导出 PNG / SVG**：按钮放在 `.sankey-stage` 右上角，复用 `viewBox` 直接 `XMLSerializer.serializeToString`。
3. **时间序列**：现在只有 2026E 单点；可加 2024 / 2025 / 2026 / 2027E 四态切换，桑基图过渡用 `<animate>` 或 D3 transition。
4. **真实数据接入**：替换 `data.js` 里的 stub 数字为 Bloomberg / FactSet pull。本地起一个 Node 脚本定期把结果写到 `data.js`。
5. **多语言**：label 硬编码了中英文混排，可抽到 `i18n.js`。

---

## 10. 与用户的协作规约

从这次会话里学到的几条规矩：

- **数字可改，命名别改**：用户对 `L1..L5` 的命名（按 Jensen 原文）很在意。改数字没问题，改层名要先确认。
- **桑基图尺寸** 是硬约束，**任何缩小都会被立刻否决**。
- **数据来源必须可追溯**：每个数字背后要么是 NVIDIA 官方口径，要么在 `methodology.md` 里说清楚。否则用户会追问。
- **改动前先校验**：跑一遍 §7 的 checklist，确认 Σ=812、mismatches=0、截图正常，再回报。
- **不要默默引入新公司**：geo 视图里没出现的公司名，不能在 layer 视图单独出现（会破坏公司层守恒）。要么 geo 也列，要么 layer 也不列。
