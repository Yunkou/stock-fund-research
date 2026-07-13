# AGENTS.md · src/weekly-data/

单期周报数据文件。每周一加一份新报告就放这里。

## 目录约定

```
src/weekly-data/
├── AGENTS.md              ← 你正在读
├── 2026-07-07.js          ← 上一期（旧）
├── 2026-07-13.js          ← 最新
└── 2026-07-20.js          ← 本周新增（新建）
```

每个 `.js` 是一个 IIFE，挂载 `window.WEEKLY_DATA['YYYY-MM-DD']`。
文件命名 = issue 日期，`YYYY-MM-DD` 必须和 `meta.issue` 完全一致。

## 新增一周的流程（5 步）

1. **生成报告原文**：跑 `vibe-trading-mcp` 拉数据，落到 `reports/weekly-YYYY-MM-DD.md`
2. **复制 IIFE 模板**：
   ```bash
   cp src/weekly-data/2026-07-13.js src/weekly-data/2026-07-20.js
   ```
3. **改 issue 日期**：全文替换 `2026-07-13` → `2026-07-20`（meta.period 也跟着改）
4. **填数据**：把 `reports/weekly-YYYY-MM-DD.md` 里 7 个深度 / 5 板块 / 5 flows / 7 long / 5 avoid / 6 risks / 5 coverage 桶 填进对应 const 块
5. **挂到 manifest + index.html**：
   - 在 `src/weekly-data.js` 顶部的 `WEEKLY_ISSUES` 数组里加 `'2026-07-20'`
   - 在 `index.html` 的 `weekly-data/` script 列表里加一行：
     ```html
     <script src="src/weekly-data/2026-07-20.js"></script>
     ```
     位置：在 `<script src="src/weekly-data.js"></script>` **之前**

**漏写步骤 5 的症状**：tab 里看到 `ISSUE N/total` 但内容是上期 — 控制台 warn `[weekly-data] manifest 列出但未找到数据`。

## 数据契约（每期 IIFE 必须返回这 8 个 key）

```js
{
  meta: {
    issue: 'YYYY-MM-DD',           // 必须与文件名一致
    period: 'YYYY.M.DD — YYYY.M.DD',  // 数据基线区间
    periodDays: 7,                  // 周区间天数
    source: 'vibe-trading MCP',
    author: 'Yun.kou',
    upstream: N, infra: N, model: N, apps: N, embodied: N   // 覆盖标的数
  },
  narrative: { headline, beats: [5-7], catalysts: [6-7] },
  sectors: [{ id, name, emoji, tone, summary, picks: [{ ticker, tag, note, tag2? }] }],   // 5 个
  deepDives: [{ id, name, code, emblem, tone, tag, facts, margin?, valuation?, swarm?, call }],   // 7 个
  flows: [{ ticker, tone: 'enter'|'leave', delta, note }],   // 5 个
  recommendations: { long: [...7], avoid: [...5] },
  risks: [{ tag, level: 'high'|'mid', detail }],   // 5-6 个
  coverage: { upstream:{count, samples}, infra:{...}, model:{...}, apps:{...}, embodied:{...} }
}
```

## 验证（每周加完跑一遍）

```bash
# Node smoke test：检查每期数据完整 + alias 指向最新期
node -e "
const vm = require('vm');
const fs = require('fs');
const sb = { window: {}, console };
vm.createContext(sb);
['2026-07-07','2026-07-13','2026-07-20'].forEach(f => {
  try { vm.runInContext(fs.readFileSync('src/weekly-data/'+f+'.js','utf8'), sb); }
  catch (e) { console.error(f, e.message); }
});
vm.runInContext(fs.readFileSync('src/weekly-data.js','utf8'), sb);
const R = sb.window.WEEKLY_REPORTS;
console.log('issues:', Object.keys(R).sort().reverse().join(', '));
console.log('alias.issue:', sb.window.WEEKLY_REPORT.meta.issue);
Object.keys(R).forEach(k => console.log('  '+k, JSON.stringify({d:R[k].deepDives.length, s:R[k].sectors.length, r:R[k].risks.length})));
"

# 然后开 index.html 跑 weekly tab 检查渲染
```

## 已知坑

- **`<script>` 顺序**：每个 per-issue 文件必须在 `weekly-data.js` 之前加载（后者要读 `window.WEEKLY_DATA`）。
- **`WEEKLY_ISSUES` manifest 必填**：是显式 manifest，不是自动发现。这样能在加新文件前先在 manifest 占位（防止半成品上线），缺数据时 `console.warn` 提示。
- **IIFE 模板要完整复制**：包括头部的 `window.WEEKLY_DATA = window.WEEKLY_DATA || {};` 防御性赋值（多个文件链式加载时保留）。
- **`WEEKLY_REPORT`（单数别名）始终指向最新一期**：靠 `Object.keys(...).sort().pop()` 计算。新增期后无需手动更新。

## 不变量（改了会破坏渲染的硬约束）

| # | 不变量 | 验证 |
|---|---|---|
| ① | 每期 IIFE 返回值含 8 个 key：`meta / narrative / sectors / deepDives / flows / recommendations / risks / coverage` | Node smoke test |
| ② | `meta.issue` 与文件名 `YYYY-MM-DD` 完全一致 | grep + 比对 |
| ③ | `WEEKLY_REPORTS` 字典的 keys = `WEEKLY_ISSUES` 数组去掉缺失项 | Node smoke test |
| ④ | `WEEKLY_REPORT.issue` = 字典里日期最大的 key | Node smoke test |
| ⑤ | `index.html` 的 `<script>` 加载顺序：每个 `weekly-data/XXX.js` 必须在 `weekly-data.js` 之前 | 浏览器 Console / Network tab |
