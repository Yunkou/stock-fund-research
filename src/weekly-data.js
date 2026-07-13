/* ============================================================
   src/weekly-data.js — 周报数据 orchestrator（多期）
   ------------------------------------------------------------
   每周新增一期周报，只需 2 步：
     1. 新建 src/weekly-data/YYYY-MM-DD.js（参考 2026-07-13.js 的 IIFE 模板）
     2. 在下方 WEEKLY_ISSUES 数组里加一项 'YYYY-MM-DD'
   渲染器（src/weekly.js）完全不需要改。

   加载顺序（index.html 已配）：
     <script src="src/weekly-data/2026-07-07.js"></script>
     <script src="src/weekly-data/2026-07-13.js"></script>
     <script src="src/weekly-data.js"></script>     ← 聚合 window.WEEKLY_REPORTS
   单期文件暴露：window.WEEKLY_DATA['YYYY-MM-DD'] = { meta, narrative, sectors, deepDives, flows, recommendations, risks, coverage }

   暴露两个全局：
     window.WEEKLY_REPORTS = { 'YYYY-MM-DD': {...} }   (推荐；多期，按 issue 倒序)
     window.WEEKLY_REPORT  = window.WEEKLY_REPORTS[latest]  (向后兼容单期引用)
   ============================================================ */

// 新增一周：在数组里加 'YYYY-MM-DD'（按时间顺序写，便于 review；倒序在运行时算）
window.WEEKLY_ISSUES = ['2026-07-07', '2026-07-13'];

window.WEEKLY_REPORTS = (function () {
  'use strict';
  const map = window.WEEKLY_DATA || {};
  // 按 issue 倒序 merge（最新在最上）
  const ordered = window.WEEKLY_ISSUES.slice().sort().reverse();
  const out = {};
  const missing = [];
  ordered.forEach(function (issue) {
    if (map[issue]) {
      out[issue] = map[issue];
    } else {
      missing.push(issue);
    }
  });
  if (missing.length) {
    console.warn('[weekly-data] manifest 列出但未找到数据：', missing);
  }
  if (Object.keys(out).length === 0) {
    console.warn('[weekly-data] WEEKLY_REPORTS 为空 — 检查 src/weekly-data/*.js 是否在 index.html 里 <script> 加载');
  }
  return out;
})();

// 向后兼容：旧代码引用 window.WEEKLY_REPORT 时取最新期
window.WEEKLY_REPORT = (function () {
  var dates = Object.keys(window.WEEKLY_REPORTS).sort();
  return window.WEEKLY_REPORTS[dates[dates.length - 1]];
})();
