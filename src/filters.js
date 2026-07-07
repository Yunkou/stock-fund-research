// src/filters.js
// 视图切换 + 尾部数据合并 + 排名筛选 + 摘要面板 + 层总盘表
// v0.7 — 键盘快捷键 + localStorage + KPI 动画 + 上下文焦点线 + 输入校验
//
// 「尾部合并」逻辑（关键可读性优化）：
//   - 默认 state.topN = 30：只保留 top-30 公司，尾部合并到 "Other (n=36)"
//   - 用户点 Top 5 / Top 8 时进一步收紧
//   - 用户点 All 时显示全部 80 个公司（无合并）
//   - 合并后的 "Other" 节点 hover 显示被合并的清单
// 源数据 src/data.js 完全不动；合并仅发生在渲染前。

(function () {
  const data = window.AI_PROFIT_DATA;
  const STORAGE_KEY = 'ai-profit-sankey-prefs';
  const VALID_VIEWS = ['geo', 'layer'];
  const VALID_TOPNS = [30, 12, 8, 5, 0];
  const VALID_PAGES = ['sankey', 'upstream', 'infra', 'model-platform', 'apps', 'embodied'];

  // ---- 从 localStorage 恢复偏好（含 schema 校验）----
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // schema 校验：防止损坏/恶意 JSON 导致异常状态
      if (!VALID_VIEWS.includes(parsed.view)) return null;
      if (typeof parsed.topN !== 'number' || !VALID_TOPNS.includes(parsed.topN)) return null;
      if (parsed.page && !VALID_PAGES.includes(parsed.page)) return null;
      return parsed;
    } catch (e) { /* ignore */ }
    return null;
  }
  function savePrefs(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ view: s.view, topN: s.topN, page: s.page }));
    } catch (e) { /* ignore */ }
  }

  const saved = loadPrefs();
  const state = {
    view: (saved && saved.view) || 'geo',     // 'geo' | 'layer'
    topN: (saved && saved.topN !== undefined) ? saved.topN : 30,
    page: (saved && saved.page) || 'sankey',  // 'sankey' | 'upstream' | 'downstream'
  };

  // 暴露给其他模块（debug 用）
  window.AI_PROFIT_STATE = state;

  // ---- KPI 计数动画 ----
  function animateValue(el, newText, duration) {
    duration = duration || 360;
    // 如果不是纯数字，直接设置
    if (!/^[\d.]+/.test(newText)) {
      el.textContent = newText;
      el.classList.add('is-updated');
      setTimeout(function() { el.classList.remove('is-updated'); }, 600);
      return;
    }
    const target = parseFloat(newText);
    const current = parseFloat(el.textContent) || 0;
    if (Math.abs(target - current) < 0.05) {
      el.textContent = newText;
      return;
    }
    const suffix = newText.replace(/^[\d.]+/, '');
    const start = performance.now();
    el.classList.add('is-updated');
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const val = current + (target - current) * eased;
      el.textContent = val.toFixed(1) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = newText; // 确保精确
        setTimeout(function() { el.classList.remove('is-updated'); }, 600);
      }
    }
    requestAnimationFrame(tick);
  }

  function currentLinks() {
    return state.view === 'geo' ? data.geoLinks : data.layerLinks;
  }

  // 把尾部 target 合并到 "Other (n=N)"
  // 返回 { links, mergedTargets, keptTargets }
  function compactLinks(links) {
    if (!state.topN) {
      return { links: links.slice(), mergedTargets: [], keptTargets: [] };
    }
    const totals = new Map();
    links.forEach(function(l) { totals.set(l.target, (totals.get(l.target) || 0) + l.value); });
    const sorted = Array.from(totals.entries()).sort(function(a, b) { return b[1] - a[1]; });

    const keep = new Set(sorted.slice(0, state.topN).map(function(kv) { return kv[0]; }));
    const dropped = sorted.slice(state.topN).map(function(kv) { return kv[0]; });

    const buckets = new Map();  // source -> value
    links.forEach(function(l) {
      if (!keep.has(l.target)) {
        buckets.set(l.source, (buckets.get(l.source) || 0) + l.value);
      }
    });

    const mergedSet = new Set(dropped);
    const mergedTotal = dropped.reduce(function(s, kv) { return s + kv[1]; }, 0);
    const mergedBySource = new Map();
    links.forEach(function(l) {
      if (mergedSet.has(l.target)) {
        mergedBySource.set(l.source, (mergedBySource.get(l.source) || 0) + l.value);
      }
    });

    // 用 "Other (n)" 节点统一接收所有合并（按 source 拆分成多条 link）
    const otherLinks = [];
    mergedBySource.forEach(function(v, source) {
      otherLinks.push({ source: source, target: 'Other (n=' + dropped.length + ')', value: v });
    });

    const keptLinks = links.filter(function(l) { return keep.has(l.target); });
    return {
      links: keptLinks.concat(otherLinks),
      mergedTargets: dropped,
      keptTargets: Array.from(keep),
      mergedTotal: mergedTotal,
    };
  }

  function refresh() {
    const result = compactLinks(currentLinks());
    const svg = document.getElementById('sankey');
    if (!svg) { console.warn('[filters] #sankey element not found'); return; }
    const rendered = window.Sankey.render(svg, result.links, {
      onFocus: handleFocus,
      onClear: handleClear,
    });
    renderSummary(result.links, rendered.nodes, result.mergedTotal);
    renderLayerStack();
    toggleLegend();
    syncButtons();
    savePrefs(state);
  }

  // ---- 摘要面板 ----
  // 「Top N」指标按"单家公司"口径计算，剔除 Other (n=...) 聚合节点
  function renderSummary(links, nodes, mergedTotal) {
    var total = links.reduce(function(s, l) { return s + l.value; }, 0);
    var companyTotals = new Map();
    links.forEach(function(l) { companyTotals.set(l.target, (companyTotals.get(l.target) || 0) + l.value); });
    var sorted = Array.from(companyTotals.entries()).sort(function(a, b) { return b[1] - a[1]; });
    var sortedReal = sorted.filter(function(kv) { return !/^Other \(n=/.test(kv[0]); });

    var elTotal = document.getElementById('total-bn');
    var elTop1  = document.getElementById('top1');
    var elTop3  = document.getElementById('top3');
    var elTop10 = document.getElementById('top10');

    if (elTotal) animateValue(elTotal, total.toFixed(1) + ' bn');

    var top1 = sortedReal[0];
    if (elTop1 && top1) {
      animateValue(elTop1, top1[0] + ' · ' + (top1[1] / total * 100).toFixed(1) + '%');
    }
    if (elTop3) {
      var t3 = sortedReal.slice(0, 3);
      animateValue(elTop3, t3.map(function(x) { return x[0]; }).join(' + ') + ' · ' + (t3.reduce(function(s, kv) { return s + kv[1]; }, 0) / total * 100).toFixed(1) + '%');
    }
    if (elTop10) {
      animateValue(elTop10, (sortedReal.slice(0, 10).reduce(function(s, kv) { return s + kv[1]; }, 0) / total * 100).toFixed(1) + '%');
    }

    var tbody = document.getElementById('ledger-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    sortedReal.slice(0, 12).forEach(function(kv, i) {
      var name = kv[0];
      var v = kv[1];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="num">' + String(i + 1).padStart(2, '0') + '</td>' +
        '<td class="name">' + name + '</td>' +
        '<td class="num">' + v.toFixed(1) + '</td>' +
        '<td class="num">' + (v / total * 100).toFixed(1) + '%</td>';
      tbody.appendChild(tr);
    });
  }

  // ---- Layer Stack 表 ----
  function renderLayerStack() {
    var tbody = document.getElementById('layer-stack-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    var totals = data.layerTotals();
    var totalAll = Object.values(totals).reduce(function(s, v) { return s + v; }, 0);
    data.layerGroups.forEach(function(g) {
      var v = totals[g.id] || 0;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="name">' + g.zh + '</td>' +
        '<td class="num">' + v.toFixed(1) + '</td>' +
        '<td class="num">' + (v / totalAll * 100).toFixed(1) + '%</td>';
      tbody.appendChild(tr);
    });
    var sumTr = document.createElement('tr');
    sumTr.style.borderTop = '1px solid var(--line)';
    sumTr.innerHTML =
      '<td class="name" style="color:var(--ink-dim)">Σ Total</td>' +
      '<td class="num" style="color:var(--ink)">' + totalAll.toFixed(1) + '</td>' +
      '<td class="num" style="color:var(--ink)">100.0%</td>';
    tbody.appendChild(sumTr);
  }

  // ---- 图例切换 ----
  function toggleLegend() {
    var geo = document.getElementById('legend-geo');
    var layer = document.getElementById('legend-layer');
    if (geo && layer) {
      geo.hidden   = state.view !== 'geo';
      layer.hidden = state.view !== 'layer';
    }
    var hint = document.getElementById('view-hint');
    if (hint) {
      var topnLabel = state.topN === 0 ? 'All' : (state.topN === 30 ? 'Top 30 (default)' : 'Top ' + state.topN);
      hint.textContent = state.view === 'layer'
        ? '— view: Layer → Company · ' + topnLabel
        : '— view: Country → Company · ' + topnLabel;
    }
  }

  // ---- 焦点线 ----
  function handleFocus(id) {
    var result = compactLinks(currentLinks());
    var links = result.links;
    var total = links.reduce(function(s, l) { return s + l.value; }, 0);
    var incoming = links.filter(function(l) { return l.target === id; });
    var outgoing = links.filter(function(l) { return l.source === id; });
    var sum = incoming.concat(outgoing).reduce(function(s, l) { return s + l.value; }, 0);
    var suffix = '';
    if (id.indexOf('Other (n=') === 0) {
      var m = id.match(/n=(\d+)/);
      suffix = ' · ' + (m ? m[1] : '?') + ' companies aggregated';
    }
    var el = document.getElementById('focus-line');
    if (el) {
      el.textContent = id + suffix + ' · ' + sum.toFixed(1) + ' bn (' + (sum / total * 100).toFixed(1) + '% of view)';
      el.classList.add('is-active');
    }
  }
  function handleClear() {
    var el = document.getElementById('focus-line');
    if (el) {
      el.textContent = '— hover / click any node  ·  Esc to clear  ·  G geo  L layer  1–5 rank';
      el.classList.remove('is-active');
    }
  }

  // ---- 同步按钮状态（用于键盘快捷键）-—
  function syncButtons() {
    document.querySelectorAll('[data-view]').forEach(function(b) {
      b.classList.toggle('is-active', b.dataset.view === state.view);
    });
    document.querySelectorAll('[data-topn]').forEach(function(b) {
      var btnN = parseInt(b.dataset.topn, 10);
      b.classList.toggle('is-active', btnN === state.topN);
    });
  }

  function setView(view) {
    if (!VALID_VIEWS.includes(view)) return;
    state.view = view;
    refresh();
  }
  function setTopN(n) {
    if (!VALID_TOPNS.includes(n)) return;
    state.topN = n;
    refresh();
  }
  function setPage(page) {
    if (!VALID_PAGES.includes(page)) return;
    state.page = page;

    // 隐藏所有视图
    ['sankey', 'upstream', 'infra', 'model-platform', 'apps', 'embodied'].forEach(function(p) {
      var el = document.getElementById(p + '-view');
      if (el) el.hidden = (page !== p);
    });

    // 同步 tab 按钮状态
    document.querySelectorAll('.view-tab').forEach(function(b) {
      b.classList.toggle('is-active', b.dataset.page === page);
    });

    // 切换到对应视图时初始化（幂等）
    var initMap = {
      'upstream':       { fn: window.initUpstreamView,       flag: '_upstreamInitialized' },
      'infra':          { fn: window.initInfraView,          flag: '_infraInitialized' },
      'model-platform': { fn: window.initModelPlatformView,  flag: '_modelPlatformInitialized' },
      'apps':           { fn: window.initAppsView,           flag: '_appsInitialized' },
      'embodied':       { fn: window.initEmbodiedView,       flag: '_embodiedInitialized' }
    };
    var target = initMap[page];
    if (target && target.fn) {
      window[target.flag] = true;
      target.fn();
    }

    savePrefs(state);
  }

  // ---- 事件绑定 ----
  document.querySelectorAll('[data-view]').forEach(function(b) {
    b.addEventListener('click', function() {
      setView(b.dataset.view);
    });
  });
  document.querySelectorAll('[data-topn]').forEach(function(b) {
    b.addEventListener('click', function() {
      setTopN(parseInt(b.dataset.topn, 10));
    });
  });
  document.querySelectorAll('[data-page]').forEach(function(b) {
    b.addEventListener('click', function() {
      setPage(b.dataset.page);
    });
  });

  // ---- 键盘快捷键 ----
  document.addEventListener('keydown', function(ev) {
    // 忽略输入框内的按键
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.isContentEditable)) return;

    var key = ev.key;
    var handled = true;

    if (key === 'g' || key === 'G') {
      setView('geo');
    } else if (key === 'l' || key === 'L') {
      setView('layer');
    } else if (key === 'Escape') {
      var svg = document.getElementById('sankey');
      if (svg && svg._sankeyInstance) {
        svg._sankeyInstance.clearHL();
      }
      handleClear();
    } else if (key === '1') {
      setTopN(30); // Top 30 (default)
    } else if (key === '2') {
      setTopN(12); // Top 12
    } else if (key === '3') {
      setTopN(8);  // Top 8
    } else if (key === '4') {
      setTopN(5);  // Top 5
    } else if (key === '5') {
      setTopN(0);  // All 80
    } else if (key === 'u' || key === 'U') {
      setPage(state.page === 'upstream' ? 'sankey' : 'upstream');
    } else if (key === 'i' || key === 'I') {
      setPage(state.page === 'infra' ? 'sankey' : 'infra');
    } else if (key === 'm' || key === 'M') {
      setPage(state.page === 'model-platform' ? 'sankey' : 'model-platform');
    } else if (key === 'a' || key === 'A') {
      setPage(state.page === 'apps' ? 'sankey' : 'apps');
    } else if (key === 'e' || key === 'E') {
      setPage(state.page === 'embodied' ? 'sankey' : 'embodied');
    } else {
      handled = false;
    }

    if (handled) {
      ev.preventDefault();
    }
  });

  window.initReport = function() {
    handleClear(); // 显示快捷键提示
    refresh();
    // 恢复上次页面
    if (state.page !== 'sankey') {
      setPage(state.page);
    }
  };
})();
