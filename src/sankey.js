// src/sankey.js
// 极简桑基图渲染器：纯 SVG，零依赖。
// v0.6 — 工具提示 + 平滑过渡

(function () {
  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent) {
    attrs = attrs || {};
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // ---- 配色 & 阵营映射 ----
  function toneOf(id) {
    // 第一大类：6 主权地区 + 其他（细分）
    if (/^US & Canada/.test(id) || /NVIDIA|Microsoft|Alphabet|Meta|Amazon|Apple|OpenAI|Anthropic|xAI|Broadcom|AMD|Marvell|Oracle|Salesforce|Cohere|Arista|Equinix|Micron|Constellation|Vistra|NextEra|GE Vernova|Bloom Energy|Vertiv|Intel|GlobalFoundries|Digital Realty|Iron Mountain|Lambda Labs|Crusoe|Snowflake|Duke Energy|Dominion Energy|Southern Company/.test(id)) return 'amber';
    if (/^Canada/.test(id)) return 'amber-2';
    if (/^Mainland China/.test(id) || /字节|腾讯|阿里|百度|华为|中芯|寒武纪|联想|小米|快手|商汤|宁德|阳光电源|国家电网|北方华创/.test(id)) return 'crimson';
    if (/^Taiwan/.test(id) || /^South Korea/.test(id) || /TSMC|Foxconn|MediaTek|Delta Electronics|三星|SK 海力士|Naver|SK Telecom/.test(id)) return 'moss';         // 台、韩：moss
    if (/^Japan/.test(id) || /软银|Tokyo Electron|Lasertec|Murata|Shin-Etsu|Kioxia|Advantest/.test(id)) return 'moss-3';                                    // 日本：最浅 moss
    if (/^Europe/.test(id) || /ASML|SAP|ARM|Mistral|诺基亚|Iberdrola|Infineon|Schneider/.test(id)) return 'slate';
    if (/^Others/.test(id) || /^Other \(n=/.test(id)) return 'ash';
    // 第二大类：5 层（与阵营色解耦，保留 Jensen 原始语义）
    if (/L1 Energy/.test(id)) return 'ash';
    if (/L2 Chip/.test(id)) return 'amber';
    if (/L3 Computing Infra/.test(id)) return 'slate';
    if (/L4 Model/.test(id)) return 'crimson';
    if (/L5 Application/.test(id)) return 'moss';
    return 'ash';
  }
  const COLOR_FOR = {
    amber:   '#FF7A45',  // US & Canada
    'amber-2': '#E8956A', // Canada 单独 (略浅琥珀)
    crimson: '#E0567A',  // Mainland China
    slate:   '#7BA7BC',  // Europe
    moss:    '#9CC68B',  // Taiwan + South Korea
    'moss-2': '#B8DBA7', // South Korea
    'moss-3': '#CFE6BD', // Japan (最浅)
    ash:     '#8A8F98',  // Others / L1 Energy
  };
  function colorFor(tone) { return COLOR_FOR[tone] || COLOR_FOR.ash; }

  // ---- 工具提示 ----
  function ensureTooltip(stage) {
    let tt = stage.querySelector('.sankey-tooltip');
    if (!tt) {
      tt = document.createElement('div');
      tt.className = 'sankey-tooltip';
      stage.appendChild(tt);
    }
    return tt;
  }

  function showTooltip(stage, node, pctStr) {
    const tt = ensureTooltip(stage);
    tt.innerHTML =
      '<div class="tt-name">' + escHtml(node.id) + '</div>' +
      '<div class="tt-stat">' + node.total.toFixed(1) + ' bn <span class="tt-val">' + pctStr + '</span></div>';
    tt.classList.add('is-visible');
  }

  function moveTooltip(stage, ev) {
    const tt = stage.querySelector('.sankey-tooltip');
    if (!tt) return;
    const rect = stage.getBoundingClientRect();
    let x = ev.clientX - rect.left + 14;
    let y = ev.clientY - rect.top - 10;
    // 防溢出
    if (x + tt.offsetWidth  > rect.width)  x = ev.clientX - rect.left - tt.offsetWidth - 14;
    if (y + tt.offsetHeight > rect.height) y = ev.clientY - rect.top - tt.offsetHeight - 14;
    tt.style.left = x + 'px';
    tt.style.top  = y + 'px';
  }

  function hideTooltip(stage) {
    const tt = stage.querySelector('.sankey-tooltip');
    if (tt) tt.classList.remove('is-visible');
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ---- 拓扑 ----
  function buildTopology(links) {
    const indexOf = new Map();
    const nodes = [];
    const ensure = (id) => {
      if (!indexOf.has(id)) {
        indexOf.set(id, nodes.length);
        nodes.push({ id: id, in: 0, out: 0, layer: 0 });
      }
      return indexOf.get(id);
    };
    links.forEach((l) => {
      const s = ensure(l.source);
      const t = ensure(l.target);
      nodes[s].out += l.value;
      nodes[t].in  += l.value;
    });

    const indeg = nodes.map((n) => n.in);
    const layer = new Array(nodes.length).fill(0);
    const queue = [];
    for (let i = 0; i < nodes.length; i++) if (indeg[i] === 0) { queue.push(i); layer[i] = 0; }
    while (queue.length) {
      const u = queue.shift();
      const outgoing = links.filter((l) => indexOf.get(l.source) === u);
      for (const l of outgoing) {
        const v = indexOf.get(l.target);
        layer[v] = Math.max(layer[v], layer[u] + 1);
        indeg[v] -= 1;
        if (indeg[v] === 0) queue.push(v);
      }
    }
    nodes.forEach((n, i) => { n.layer = layer[i]; });
    return { nodes: nodes, indexOf: indexOf };
  }

  function layout(nodes, links, width, height, margin) {
    margin = margin || { left: 0, right: 0 };
    const layers = {};
    nodes.forEach((n) => { (layers[n.layer] = layers[n.layer] || []).push(n); });
    const layerCount = Object.keys(layers).length;
    const pad = 28;
    const usableW = width - margin.left - margin.right;
    const colW = (usableW - pad * (layerCount - 1)) / layerCount;

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    nodes.forEach((n) => { n.total = Math.max(n.in, n.out); });

    Object.values(layers).forEach((arr) => {
      const isLayerCol = arr.length > 1 && arr.every((n) => /^L\d/.test(n.id));
      if (isLayerCol) {
        arr.sort((a, b) => parseInt(b.id.slice(1, 3), 10) - parseInt(a.id.slice(1, 3), 10));
      } else {
        arr.sort((a, b) => b.total - a.total);
      }
      const totalVal = arr.reduce((s, n) => s + n.total, 0);
      const usableH = height - (arr.length - 1) * 12;
      let y = 0;
      arr.forEach((n) => {
        n.h = Math.max(5, (n.total / totalVal) * usableH);
        n.y = y;
        y += n.h + 12;
      });
      const offset = (height - (y - 12)) / 2;
      arr.forEach((n) => { n.y += offset; });
    });

    Object.entries(layers).forEach(([l, arr]) => {
      const x = margin.left + parseInt(l, 10) * (colW + pad);
      arr.forEach((n) => { n.x = x; n.w = Math.min(colW, 26); });
    });

    const outCursor = new Map();
    const inCursor = new Map();
    links.forEach((l) => {
      const s = nodeById.get(l.source);
      const t = nodeById.get(l.target);
      const sy = (outCursor.get(s.id) !== undefined ? outCursor.get(s.id) : s.y);
      const ty = (inCursor.get(t.id) !== undefined ? inCursor.get(t.id) : t.y);
      const sh = (l.value / s.out) * s.h;
      const th = (l.value / t.in)  * t.h;
      l.sx = s.x + s.w;
      l.sy = sy;
      l.sh = sh;
      l.tx = t.x;
      l.ty = ty;
      l.th = th;
      outCursor.set(s.id, sy + sh);
      inCursor.set(t.id, ty + th);
    });
  }

  // ---- 尺寸测量 ----
  function measure(svgEl) {
    const rect = (svgEl.getBoundingClientRect && svgEl.getBoundingClientRect()) || null;
    return {
      w: Math.max(640, Math.round((rect && rect.width)  || svgEl.clientWidth  || 980)),
      h: Math.max(420, Math.round((rect && rect.height) || svgEl.clientHeight || 560)),
    };
  }

  function cssEscape(s) {
    if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c);
  }

  // ---- 渲染 ----
  function render(svgEl, links, opts) {
    opts = opts || {};
    const size = measure(svgEl);
    const width = size.w;
    const height = size.h;

    // 容器引用
    const stage = svgEl.parentNode;

    // 平滑过渡：先淡出
    if (stage && stage.classList) {
      stage.classList.add('is-switching');
    }

    // viewBox 向左扩展 180 容纳左标签，向右扩展 40 容纳右标签 padding
    svgEl.setAttribute('viewBox', '-180 0 ' + (width + 220) + ' ' + height);
    svgEl.style.overflow = 'visible';
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgEl.innerHTML = '';

    const topo = buildTopology(links);
    const nodes = topo.nodes;
    layout(nodes, links, width, height - 60, { left: 0, right: 0 });

    // 计算总量用于百分比
    const totalVal = links.reduce((s, l) => s + l.value, 0);

    const defs = el('defs', {}, svgEl);
    Object.keys(COLOR_FOR).forEach((k) => {
      const lg = el('linearGradient', {
        id: 'grad-' + k,
        x1: '0%', y1: '0%', x2: '100%', y2: '0%',
      }, defs);
      el('stop', { offset: '0%',   'stop-color': COLOR_FOR[k], 'stop-opacity': '0.55' }, lg);
      el('stop', { offset: '100%', 'stop-color': COLOR_FOR[k], 'stop-opacity': '0.85' }, lg);
    });

    // 估值代理公司集合：从 data.js 注入（data.js 加载顺序在 sankey.js 之前）
    const proxySet = (window.AI_PROFIT_DATA && window.AI_PROFIT_DATA.proxyCompanies) || new Set();
    const isProxy = (n) => proxySet.has(n);

    const gLinks  = el('g', { class: 'links'  }, svgEl);
    const gNodes  = el('g', { class: 'nodes'  }, svgEl);
    const gLabels = el('g', { class: 'labels' }, svgEl);

    links.forEach((l) => {
      const tone = toneOf(l.source);
      const midX = (l.sx + l.tx) / 2;
      const d =
        'M ' + l.sx + ',' + (l.sy + l.sh / 2) +
        ' C ' + midX + ',' + (l.sy + l.sh / 2) + ' ' + midX + ',' + (l.ty + l.th / 2) + ' ' + l.tx + ',' + (l.ty + l.th / 2);
      const proxyLink = isProxy(l.target);
      el('path', {
        d: d,
        fill: 'none',
        stroke: proxyLink ? tone : ('url(#grad-' + tone + ')'),
        'stroke-width': Math.max(0.6, Math.min(l.sh, l.th) * 0.95),
        'data-source': l.source,
        'data-target': l.target,
        class: 'link' + (proxyLink ? ' is-proxy' : ''),
        opacity: proxyLink ? 0.45 : 0.85,
        'stroke-dasharray': proxyLink ? '3 3' : null,
      }, gLinks);
    });

    nodes.forEach((n) => {
      const pct = n.total > 0 ? (n.total / totalVal * 100).toFixed(1) + '%' : '—';
      const proxy = isProxy(n.id);
      el('rect', {
        x: n.x, y: n.y, width: n.w, height: n.h,
        fill: colorFor(toneOf(n.id)),
        rx: 1, ry: 1,
        class: 'node' + (proxy ? ' is-proxy' : ''),
        'data-id': n.id,
        opacity: proxy ? 0.7 : 1,
        stroke: proxy ? 'var(--ink-dim)' : null,
        'stroke-width': proxy ? 0.75 : 0,
        'stroke-dasharray': proxy ? '2 1.5' : null,
      }, gNodes);
      // 原生 title 作为无障碍回退
      const tipTitle = gNodes.lastChild;
      el('title', {}, tipTitle).textContent =
        (proxy ? '▒ 估值代理 · ' : '') + n.id + ' · ' + n.total.toFixed(1) + ' bn · ' + pct;
    });

    const layerMax = nodes.reduce((m, x) => Math.max(m, x.layer), 0);
    nodes.forEach((n) => {
      const onRight = n.layer === layerMax;
      const x = onRight ? n.x + n.w + 10 : n.x - 10;
      const anchor = onRight ? 'start' : 'end';

      const proxyLbl = isProxy(n.id);
      const labelText = n.id + '  ' + n.total.toFixed(1) + ' bn';
      const t = el('text', {
        x: x, y: n.y + n.h / 2 + 4,
        'text-anchor': anchor,
        class: 'lbl-name' + (proxyLbl ? ' is-proxy' : ''),
        'dominant-baseline': 'middle',
      }, gLabels);
      t.textContent = labelText;
    });

    function highlight(id) {
      svgEl.querySelectorAll('.link, .node').forEach((e) => {
        e.classList.remove('is-focus');
        e.classList.add('is-dim');
      });
      svgEl.querySelectorAll(
        '.link[data-source="' + cssEscape(id) + '"], ' +
        '.link[data-target="' + cssEscape(id) + '"], ' +
        '.node[data-id="' + cssEscape(id) + '"]'
      ).forEach((e) => {
        e.classList.remove('is-dim');
        e.classList.add('is-focus');
      });
      svgEl.querySelectorAll('.lbl-name, .lbl-val').forEach((t) => {
        const hit = t.textContent === id;
        t.classList.toggle('is-focus', hit);
        t.classList.toggle('is-dim',  !hit);
      });
    }
    function clearHL() {
      svgEl.querySelectorAll('.link, .node, .lbl-name, .lbl-val').forEach((e) => {
        e.classList.remove('is-focus', 'is-dim');
      });
    }

    // ---- 工具提示事件 ----
    if (stage) {
      // 使用事件委托：在 svg 上监听节点 hover
      svgEl.addEventListener('mousemove', function(ev) {
        const nodeEl = ev.target.closest && ev.target.closest('.node');
        if (nodeEl) {
          const id = nodeEl.getAttribute('data-id');
          const n = nodes.find(function(x) { return x.id === id; });
          if (n) {
            const pct = n.total > 0 ? (n.total / totalVal * 100).toFixed(1) + '%' : '—';
            moveTooltip(stage, ev);
            showTooltip(stage, n, pct);
          }
        } else {
          hideTooltip(stage);
        }
      });
      svgEl.addEventListener('mouseleave', function() {
        hideTooltip(stage);
        clearHL();
      });
    }

    // ---- 点击 / 悬停高亮 ----
    svgEl.addEventListener('click', function(ev) {
      const id = ev.target.getAttribute && ev.target.getAttribute('data-id');
      if (id) { highlight(id); opts.onFocus && opts.onFocus(id); }
      else    { clearHL();    opts.onClear && opts.onClear(); }
    });

    const instance = { nodes: nodes, links: links, highlight: highlight, clearHL: clearHL };
    instance._size = { width: width, height: height };
    svgEl._sankeyInstance = instance;

    // 渲染完成后恢复透明度
    if (stage && stage.classList) {
      // 用 rAF 确保 DOM 已提交，再移除切换类触发淡入
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          stage.classList.remove('is-switching');
        });
      });
    }

    // 响应式：容器尺寸变化时自动重渲染
    if (svgEl._resizeObserver) { try { svgEl._resizeObserver.disconnect(); } catch (e) {} }
    if (typeof ResizeObserver !== 'undefined') {
      let raf = null;
      svgEl._resizeObserver = new ResizeObserver(function() {
        if (raf) return;
        raf = setTimeout(function() {
          raf = null;
          const m = measure(svgEl);
          if (Math.abs(m.w - instance._size.width)  < 8 &&
              Math.abs(m.h - instance._size.height) < 8) return;
          hideTooltip(stage);
          render(svgEl, links, opts);
        }, 150);
      });
      svgEl._resizeObserver.observe(svgEl.parentNode || svgEl);
    } else if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', function() { render(svgEl, links, opts); });
    }

    return instance;
  }

  window.Sankey = { render: render };
})();
