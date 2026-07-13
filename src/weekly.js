/* ============================================================
   src/weekly.js — 周报视图渲染器
   - 数据源：window.WEEKLY_REPORT (from src/weekly-data.js)
   - 图：beautiful-mermaid (esm.sh CDN)
   - 严格无副作用：仅在 window.initWeeklyView() 时挂载
   ============================================================ */

// mermaid 在 renderMermaid() 内 dynamic import 加载（避免 module 顶层 import 在 file:// 下被 CORS 拦）

(function () {
  'use strict';

  // ============== 工具函数 ==============
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        if (typeof c === 'string' || typeof c === 'number') n.appendChild(document.createTextNode(String(c)));
        else n.appendChild(c);
      });
    }
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // 涨跌幅 → tone class
  function pctTone(pct) {
    if (pct > 5)   return 'is-hot';
    if (pct > 0)   return 'is-up';
    if (pct < -5)  return 'is-down';
    if (pct < 0)   return 'is-neu';
    return 'is-neu';
  }
  // delta 字段 ('+453%' / '-88.6%' / '扭亏为盈') → tone class
  function deltaTone(d) {
    if (typeof d !== 'string') return '';
    if (d.startsWith('+')) return 'delta-up';
    if (d.startsWith('-') || d.indexOf('亏') >= 0 || d === '估值极端') return 'delta-down';
    if (d === '—' || d === '扭亏为盈') return '';
    return '';
  }

  // ============== 4 个 mermaid 图 ==============
  // 1. 叙事时间线
  function mermaidTimeline(D) {
    const beats = D.narrative.beats;
    let body = 'flowchart LR\n';
    body += '  classDef hot fill:#1c1410,stroke:#FF7A45,color:#FF7A45,stroke-width:1.5px\n';
    body += '  classDef up fill:#101a12,stroke:#9CC68B,color:#9CC68B,stroke-width:1.5px\n';
    body += '  classDef down fill:#1a1014,stroke:#E0567A,color:#E0567A,stroke-width:1.5px\n';
    body += '  classDef neutral fill:#151A21,stroke:#4A4F58,color:#8A8F98,stroke-width:1px\n\n';
    beats.forEach(function (b, i) {
      const id = 'B' + i;
      const safeText = b.text.replace(/"/g, "'").replace(/\n/g, ' ');
      body += '  ' + id + '["' + b.date + '<br/>' + safeText + '"]\n';
      const cls = b.tone === 'hot' ? 'hot' : b.tone === 'up' ? 'up' : b.tone === 'down' ? 'down' : 'neutral';
      body += '  class ' + id + ' ' + cls + '\n';
      if (i > 0) body += '  B' + (i - 1) + ' --> ' + id + '\n';
    });
    return body;
  }

  // 2. 寒武纪融资融券流程（8 天 trend）
  function mermaidMargin(D) {
    const dive = D.deepDives.find(function (d) { return d.id === 'cambricon'; });
    if (!dive || !dive.margin) return null;
    let body = 'flowchart LR\n';
    body += '  classDef up fill:#101a12,stroke:#9CC68B,color:#9CC68B,stroke-width:1.5px\n';
    body += '  classDef down fill:#1a1014,stroke:#E0567A,color:#E0567A,stroke-width:1.5px\n';
    body += '  classDef neutral fill:#151A21,stroke:#4A4F58,color:#8A8F98,stroke-width:1px\n\n';
    dive.margin.forEach(function (m, i) {
      const id = 'M' + i;
      const sign = m.net > 0 ? '+' : '';
      body += '  ' + id + '["' + m.date + '<br/>净 ' + sign + m.net.toFixed(1) + ' 亿<br/>余额 ' + m.balance.toFixed(1) + ' 亿"]\n';
      if (m.net > 5)  body += '  class ' + id + ' up\n';
      else if (m.net < -3) body += '  class ' + id + ' down\n';
      else body += '  class ' + id + ' neutral\n';
      if (i > 0) body += '  M' + (i - 1) + ' --> ' + id + '\n';
    });
    return body;
  }

  // 3. Swarm 决策流程（4-agent pipeline）— 自动取有 swarm 字段的标的
  function mermaidSwarmGeneric(D, dive) {
    if (!dive.swarm) return null;
    const s = dive.swarm;
    let body = 'flowchart TD\n';
    body += '  classDef ok fill:#101a12,stroke:#9CC68B,color:#9CC68B,stroke-width:1.5px\n';
    body += '  classDef warn fill:#1a1014,stroke:#E0567A,color:#E0567A,stroke-width:1.5px\n';
    body += '  classDef amber fill:#1c1410,stroke:#FF7A45,color:#FF7A45,stroke-width:1.5px\n';
    body += '  classDef neutral fill:#151A21,stroke:#4A4F58,color:#8A8F98,stroke-width:1px\n\n';
    body += '  Q["' + dive.name + '<br/>' + dive.code + '"]:::neutral\n';
    body += '  B["🐂 Bull<br/>' + s.bull.rel + '/5<br/>' + s.bull.verdict.replace(/"/g, "'") + '"]\n';
    body += '  R["🐻 Bear<br/>' + s.bear.rel + '/5<br/>' + s.bear.verdict.replace(/"/g, "'") + '"]\n';
    body += '  C["⚖ CRO<br/>' + s.cro.rel + '/5<br/>' + s.cro.verdict.replace(/"/g, "'") + '"]\n';
    body += '  P["💼 PM<br/>' + s.pm.rel + '/5<br/>' + s.pm.verdict.replace(/"/g, "'") + '"]\n';
    // tone
    if (s.bull.rel >= 4) body += '  class B ok\n'; else body += '  class B neutral\n';
    if (s.bear.rel >= 4) body += '  class R warn\n'; else body += '  class R neutral\n';
    if (s.cro.rel >= 4) body += '  class C ok\n'; else body += '  class C amber\n';
    if (s.pm.rel >= 4) body += '  class P ok\n'; else body += '  class P warn\n';
    body += '  Q --> B\n';
    body += '  Q --> R\n';
    body += '  B --> C\n';
    body += '  R --> C\n';
    body += '  C --> P\n';
    return body;
  }

  // 4. 仓位拓扑 — 8 long + 4 avoid
  function mermaidPositioning(D) {
    const R = D.recommendations;
    let body = 'flowchart LR\n';
    body += '  classDef ok fill:#101a12,stroke:#9CC68B,color:#9CC68B,stroke-width:1.5px\n';
    body += '  classDef warn fill:#1a1014,stroke:#E0567A,color:#E0567A,stroke-width:1.5px\n';
    body += '  classDef hot fill:#1c1410,stroke:#FF7A45,color:#FF7A45,stroke-width:1.5px\n\n';
    body += '  subgraph LONG["✅ 维持 / 新增（81.5% NAV）"]\n';
    R.long.forEach(function (r, i) {
      const w = r.weight.toString();
      const id = 'L' + i;
      body += '    ' + id + '["' + r.sector.replace(/[()]/g, '') + '<br/>' + w + '% NAV"]\n';
      if (r.star === 3) body += '    class ' + id + ' hot\n';
      else if (r.star === 2) body += '    class ' + id + ' ok\n';
      else body += '    class ' + id + ' ok\n';
    });
    body += '  end\n';
    body += '  subgraph AVOID["⚠️ 回避 / 减仓"]\n';
    R.avoid.forEach(function (r, i) {
      const id = 'A' + i;
      body += '    ' + id + '["' + r.sector.replace(/[()]/g, '') + '"]\n';
      body += '    class ' + id + ' warn\n';
    });
    body += '  end\n';
    return body;
  }

  // ============== 渲染单个 mermaid（dynamic import 避免 file:// CORS） ==============
  let _mermaidPromise = null;
  function loadMermaid() {
    if (_mermaidPromise) return _mermaidPromise;
    _mermaidPromise = import('https://esm.sh/beautiful-mermaid@1.1.3')
      .then(function (mod) { return mod.renderMermaidSVG; })
      .catch(function (err) {
        _mermaidPromise = null;  // retry next time
        throw err;
      });
    return _mermaidPromise;
  }
  function renderMermaid(target, code, caption, theme) {
    const wrap = el('div', { class: 'weekly-mermaid' });
    if (caption) wrap.appendChild(el('div', { class: 'weekly-mermaid__cap', text: caption }));
    const opts = {
      bg: 'transparent',
      fg: '#E8E6E1',
      line: '#4A4F58',
      accent: '#FF7A45',
      muted: '#8A8F98',
      surface: '#151A21',
      border: '#2A323D',
      font: 'JetBrains Mono, Inter, -apple-system, sans-serif',
      nodeSpacing: 28,
      layerSpacing: 50,
      transparent: true
    };
    target.appendChild(wrap);
    loadMermaid().then(function (render) {
      try {
        const svg = render(code, opts);
        wrap.insertAdjacentHTML('beforeend', svg);
      } catch (e) {
        wrap.classList.add('is-err');
        wrap.appendChild(el('pre', { text: '⚠ mermaid 渲染失败：\n' + (e && e.message ? e.message : e) + '\n\n--- source ---\n' + code }));
      }
    }).catch(function (err) {
      wrap.classList.add('is-err');
      wrap.appendChild(el('pre', { text: '⚠ mermaid 加载失败（file:// CORS 或网络问题）：\n' + (err && err.message ? err.message : err) + '\n\n降级：周报文字与表格仍可阅读，mermaid 图渲染需要外网。' }));
    });
  }

  // ============== 渲染各 section ==============
  function renderHeader(D) {
    const m = D.meta;
    return el('header', { class: 'weekly-head' }, [
      el('div', null, [
        el('div', { class: 'weekly-head__kicker', text: 'Weekly Note · 2026·W27 · 投资建议' }),
        el('h1', { class: 'weekly-head__title', html: 'AI 产业链 <em>周度</em> 投资建议 · <em>' + m.issue + '</em>' }),
        el('p', { class: 'weekly-head__sub', text: '两周期表现 + 7 关键标的深度拆解 + Swarm 多智能体校验 — ' + m.source + ' 财务数据 + 融资融券' })
      ]),
      el('div', { class: 'weekly-head__meta' }, [
        el('div', { html: '报告日期  <b>' + m.issue + '</b>' }),
        el('div', { html: '覆盖周期  <b>' + m.period + '</b>' }),
        el('div', { html: '作者      <b>' + m.author + '</b>' }),
        el('div', { html: 'v1.0 · 内部研究备忘录' })
      ])
    ]);
  }

  function renderKPI(D) {
    const m = D.meta;
    const total = m.upstream + m.infra + m.model + m.apps + m.embodied;
    return el('div', { class: 'weekly-kpi' }, [
      cellKPI('上游供应', m.upstream + ' 只', 'is-ash'),
      cellKPI('中游 Infra', m.infra + ' 只', 'is-amber'),
      cellKPI('中游 Model', m.model + ' 只', 'is-crimson'),
      cellKPI('下游 Apps + Embodied', (m.apps + m.embodied) + ' 只', 'is-moss', m.apps + ' + ' + m.embodied)
    ]);
  }
  function cellKPI(k, v, vClass, sub) {
    const c = el('div', { class: 'weekly-kpi__cell' });
    c.appendChild(el('div', { class: 'weekly-kpi__k', text: k }));
    c.appendChild(el('div', { class: 'weekly-kpi__v ' + (vClass || ''), text: v }));
    if (sub) c.appendChild(el('div', { class: 'weekly-kpi__sub', text: sub }));
    return c;
  }

  function renderObservations(D) {
    // 3 个签名 callout — 从 narrative 提取 3 个最具叙事性的 beats
    const beats = D.narrative.beats;
    const obs = [
      { num: '01', title: '万亿后冷静 · 杠杆撤退',
        body: '<b>寒武纪</b> 6/30 触及 1,620 元后紧急发布风险提示，融资余额 7 天从 261 亿 → 240 亿（<b>-8%</b>），杠杆资金趁反弹撤离。' },
      { num: '02', title: '光模块全线溃败 · 资金切换',
        body: '<b>中际旭创 -14.4% / 光迅科技 -16.9%</b>，Q1 新易盛环比 -13.25% 已现裂痕。资金从光模块切换到 <b>AI 服务器 + 国产 CPU</b>。' },
      { num: '03', title: '机器人 0→1 加速 · 政策双催化',
        body: '<b>绿的谐波 +22.7%</b> 领涨，工信部 + 国资委人形机器人专项行动 + 德银上调 2026 出货预测至 5 万台 — <b>本周最强主线</b>。' }
    ];
    const grid = el('div', { class: 'weekly-observations' });
    obs.forEach(function (o) {
      const c = el('div', { class: 'weekly-obs' });
      c.appendChild(el('div', { class: 'weekly-obs__num', text: o.num }));
      c.appendChild(el('h3', { class: 'weekly-obs__title', text: o.title }));
      c.appendChild(el('p', { class: 'weekly-obs__body', html: o.body }));
      grid.appendChild(c);
    });
    return grid;
  }

  function renderBeats(D) {
    const grid = el('div', { class: 'weekly-beats' });
    D.narrative.beats.forEach(function (b) {
      const cell = el('div', { class: 'weekly-beat is-' + b.tone });
      cell.appendChild(el('div', { class: 'weekly-beat__date', html: '<b>' + b.date + '</b>' }));
      const toneLabel = b.tone === 'hot' ? '高潮' : b.tone === 'up' ? '反弹' : b.tone === 'down' ? '回调' : '中性';
      cell.appendChild(el('span', { class: 'weekly-beat__tone', text: toneLabel }));
      cell.appendChild(el('p', { class: 'weekly-beat__text', text: b.text }));
      grid.appendChild(cell);
    });
    return grid;
  }

  function renderCatalysts(D) {
    const tbl = el('table', { class: 'weekly-catalysts' });
    const thead = el('thead');
    const trh = el('tr');
    ['事件', '影响', '时间'].forEach(function (h) { trh.appendChild(el('th', { text: h })); });
    thead.appendChild(trh);
    tbl.appendChild(thead);
    const tbody = el('tbody');
    D.narrative.catalysts.forEach(function (c) {
      const tr = el('tr');
      tr.appendChild(el('td', null, c.event));
      const dirLabel = c.dir === 'up' ? '↑ 利好' : c.dir === 'down' ? '↓ 利空' : '— 中性';
      tr.appendChild(el('td', { class: 'cat-dir is-' + c.dir, text: dirLabel }));
      tr.appendChild(el('td', { class: 'cat-date', text: c.date }));
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    return tbl;
  }

  function renderSectors(D) {
    const grid = el('div', { class: 'weekly-sectors' });
    D.sectors.forEach(function (s) {
      const card = el('article', { class: 'weekly-sector' });
      card.appendChild(el('div', { class: 'weekly-sector__head' }, [
        el('h3', { class: 'weekly-sector__name', html: '<em>' + s.emoji + '</em>' + s.name }),
        el('span', { class: 'weekly-sector__count', text: s.picks.length + ' 只' })
      ]));
      card.appendChild(el('p', { class: 'weekly-sector__summary', text: s.summary }));

      const bars = el('div', { class: 'weekly-sector__bars' });
      // 取前 6 涨跌幅 extremes + 关键标的
      s.picks.slice(0, 6).forEach(function (p) {
        const row = el('div', { class: 'weekly-bar' });
        row.appendChild(el('div', { class: 'weekly-bar__name', html: p.name + ' <b>' + p.code + '</b>' }));
        const sign = p.pct > 0 ? '+' : '';
        row.appendChild(el('div', { class: 'weekly-bar__pct ' + (p.tone || pctTone(p.pct)), text: sign + p.pct.toFixed(1) + '%' }));
        bars.appendChild(row);
      });
      card.appendChild(bars);
      grid.appendChild(card);
    });
    return grid;
  }

  function renderDive(D, dive) {
    const card = el('article', { class: 'weekly-dive is-' + (dive.tone || 'mixed') });

    // Tag
    if (dive.tag) {
      const t = el('span', { class: 'weekly-dive__tag is-' + (dive.tone || 'mixed'), text: dive.tag });
      card.appendChild(t);
    }

    // Head
    card.appendChild(el('div', { class: 'weekly-dive__head' }, [
      el('h3', { class: 'weekly-dive__name', html: dive.name + ' <b>' + dive.code + '</b>' }),
      el('span', { class: 'weekly-dive__emblem', text: dive.emblem || '' })
    ]));

    // Swarm 4-agent grid
    if (dive.swarm) {
      const sw = el('div', { class: 'weekly-swarm' });
      ['bull', 'bear', 'cro', 'pm'].forEach(function (k) {
        const cell = el('div', { class: 'weekly-swarm__cell' });
        const nameMap = { bull: '🐂 Bull', bear: '🐻 Bear', cro: '⚖ CRO', pm: '💼 PM' };
        const s = dive.swarm[k];
        cell.appendChild(el('div', { class: 'weekly-swarm__name' }, [
          el('span', null, nameMap[k]),
          el('span', { class: 'weekly-swarm__rel', text: s.rel + '/5' })
        ]));
        cell.appendChild(el('p', { class: 'weekly-swarm__verdict', text: s.verdict }));
        sw.appendChild(cell);
      });
      card.appendChild(sw);
    }

    // Fact table
    if (dive.facts) {
      const f = dive.facts;
      const keys = Object.keys(f);
      const rows = keys.map(function (k) {
        const o = f[k];
        return { metric: metricName(k), y2024: o.y2024, y2025: o.y2025, delta: o.delta };
      });
      const tbl = el('table', { class: 'weekly-dive__facts' });
      const thead = el('thead');
      const trh = el('tr');
      ['指标', '2024', '2025', 'YoY'].forEach(function (h) { trh.appendChild(el('th', { text: h })); });
      thead.appendChild(trh); tbl.appendChild(thead);
      const tbody = el('tbody');
      rows.forEach(function (r) {
        const tr = el('tr');
        tr.appendChild(el('td', null, r.metric));
        tr.appendChild(el('td', null, formatNum(r.y2024)));
        tr.appendChild(el('td', null, formatNum(r.y2025)));
        tr.appendChild(el('td', { class: deltaTone(r.delta), text: r.delta }));
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      card.appendChild(tbl);
    }

    // Margin trend (for Cambricon)
    if (dive.margin) {
      const tbl = el('table', { class: 'weekly-dive__facts' });
      const thead = el('thead');
      const trh = el('tr');
      ['日期', '融资买入', '偿还', '净买入', '余额'].forEach(function (h) { trh.appendChild(el('th', { text: h })); });
      thead.appendChild(trh); tbl.appendChild(thead);
      const tbody = el('tbody');
      dive.margin.forEach(function (m) {
        const tr = el('tr');
        tr.appendChild(el('td', null, m.date));
        tr.appendChild(el('td', null, m.buy.toFixed(1)));
        tr.appendChild(el('td', null, m.repay.toFixed(1)));
        const sign = m.net > 0 ? '+' : '';
        tr.appendChild(el('td', { class: deltaTone(sign + m.net), text: sign + m.net.toFixed(1) }));
        tr.appendChild(el('td', null, m.balance.toFixed(1)));
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      card.appendChild(tbl);
    }

    // Call / verdict
    if (dive.call) {
      const dl = el('dl', { class: 'weekly-dive__call' });
      dl.appendChild(el('dt', null, 'Verdict'));
      const v = el('dd', null, [
        el('span', { class: 'verdict is-' + (dive.call.verdictTone || 'caution'), text: dive.call.verdict })
      ]);
      dl.appendChild(v);
      if (dive.call.target && dive.call.target !== '—') { dl.appendChild(el('dt', null, '目标')); dl.appendChild(el('dd', null, dive.call.target)); }
      if (dive.call.hard && dive.call.hard !== '—')     { dl.appendChild(el('dt', null, '止损')); dl.appendChild(el('dd', null, dive.call.hard)); }
      if (dive.call.position)                            { dl.appendChild(el('dt', null, '仓位')); dl.appendChild(el('dd', null, dive.call.position)); }
      if (dive.call.note)                                { dl.appendChild(el('dt', null, '说明')); dl.appendChild(el('dd', null, dive.call.note)); }
      card.appendChild(dl);
    }

    return card;
  }
  function metricName(k) {
    return ({
      revenue: '营收', netIncome: '归母净利润', nonGAAP: '扣非净利润',
      eps: 'EPS', roe: 'ROE', gross: '毛利率', rnd: '研发费用', rndRatio: '研发人员占比',
      ocf: '经营现金流', pe: 'PE', pb: 'PB', ps: 'PS'
    })[k] || k;
  }
  function formatNum(v) {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'number') {
      if (v < 0) return Math.abs(v).toFixed(1);
      return v.toFixed(1);
    }
    return String(v);
  }

  function renderDeepDives(D, container) {
    D.deepDives.forEach(function (dive) {
      container.appendChild(renderDive(D, dive));
    });
  }

  function renderRecommendations(D) {
    const wrap = el('div', { class: 'weekly-rec' });
    // Long column
    const long = el('div', { class: 'weekly-rec__col is-long' });
    long.appendChild(el('h4', null, [el('span', { class: 'dot' }), '维持 / 新增（按优先级）']));
    D.recommendations.long.forEach(function (r) {
      const row = el('div', { class: 'weekly-rec-row' });
      const left = el('div', null, [
        el('div', { class: 'weekly-rec-row__name', html: '★'.repeat(r.star) + ' <b>' + r.code + '</b> ' + r.sector }),
        el('p', { class: 'weekly-rec-row__tldr', text: r.tldr })
      ]);
      row.appendChild(left);
      const right = el('div', null, [
        el('div', { class: 'weekly-rec-row__tag is-' + (r.tag.indexOf('🆕') >= 0 ? 'hot' : r.tag.indexOf('⚠') >= 0 ? 'warn' : 'ok'), text: r.tag }),
        el('div', { class: 'weekly-rec-row__weight', html: r.weight + '<small>% NAV</small>' })
      ]);
      row.appendChild(right);
      long.appendChild(row);
    });
    wrap.appendChild(long);

    // Avoid column
    const avd = el('div', { class: 'weekly-rec__col is-avoid' });
    avd.appendChild(el('h4', null, [el('span', { class: 'dot' }), '回避 / 减仓']));
    D.recommendations.avoid.forEach(function (r) {
      const row = el('div', { class: 'weekly-rec-row' });
      const left = el('div', null, [
        el('div', { class: 'weekly-rec-row__name', html: r.sector + ' <b>' + r.code + '</b>' }),
        el('p', { class: 'weekly-rec-row__tldr', text: r.note })
      ]);
      row.appendChild(left);
      const right = el('div', null, [
        el('div', { class: 'weekly-rec-row__tag is-warn', text: r.tag })
      ]);
      row.appendChild(right);
      avd.appendChild(row);
    });
    wrap.appendChild(avd);

    return wrap;
  }

  function renderRisks(D) {
    const grid = el('div', { class: 'weekly-risks' });
    D.risks.forEach(function (r) {
      const card = el('div', { class: 'weekly-risk is-' + r.level });
      card.appendChild(el('div', { class: 'weekly-risk__bar' }));
      const main = el('div', null, [
        el('div', { class: 'weekly-risk__head' }, [
          el('span', { class: 'weekly-risk__tag', text: r.tag }),
          el('span', { class: 'weekly-risk__level', text: r.level === 'high' ? 'HIGH' : 'MID' })
        ]),
        el('p', { class: 'weekly-risk__detail', text: r.detail })
      ]);
      card.appendChild(main);
      grid.appendChild(card);
    });
    return grid;
  }

  function renderCoverage(D) {
    const m = D.meta;
    const grid = el('div', { class: 'weekly-cov' });
    const order = ['upstream', 'infra', 'model', 'apps', 'embodied'];
    const names = { upstream: '上游', infra: '中游 Infra', model: '中游 Model', apps: '下游 Apps', embodied: '终端' };
    order.forEach(function (k) {
      const c = D.coverage[k];
      const col = el('div', { class: 'weekly-cov__col' });
      col.appendChild(el('h5', null, [el('span', null, names[k]), el('b', null, c.count + ' 只')]));
      const list = el('ul', { class: 'weekly-cov__list' });
      c.samples.forEach(function (s) {
        const parts = s.split(' ');
        const code = parts[0];
        const name = parts.slice(1).join(' ');
        list.appendChild(el('li', null, [el('b', null, code), document.createTextNode(name)]));
      });
      col.appendChild(list);
      col.appendChild(el('div', { class: 'weekly-cov__more', text: '+ ' + (c.count - c.samples.length) + ' 只 · 完整列表见 reports/weekly-' + m.issue + '.md 附录 A' }));
      grid.appendChild(col);
    });
    return grid;
  }

  // ============== 顶层 ==============
  function buildView(D) {
    const root = el('div', { class: 'weekly-root' });
    const m = D.meta;

    // 1. Header + KPI
    root.appendChild(renderHeader(D));
    root.appendChild(renderKPI(D));

    // 2. 3 签名 observation（紧贴 KPI，叙事落点）
    root.appendChild(renderObservations(D));

    // ── Section 1: 宏观叙事 ──
    const s1 = section('1', '宏观背景与市场叙事', m.period + ' · 两周期');
    s1.appendChild(renderBeats(D));
    s1.appendChild(renderCatalysts(D));
    root.appendChild(s1);

    // ── mermaid 图 1: 叙事时间线 ──
    const m1 = el('div');
    renderMermaid(m1, mermaidTimeline(D), '图 1 · 两周期叙事时间线（按 tone 着色）');
    root.appendChild(m1);

    // ── Section 2: 分层两周期表现 ──
    const s2 = section('2', '分层两周期表现与深度分析', '5 大板块 · 6 标的卡片');
    s2.appendChild(renderSectors(D));
    root.appendChild(s2);

    // ── Section 3: 关键标的深度拆解 ──
    const s3 = section('3', '关键标的深度拆解', '7 标的 · 4-agent Swarm 校验');
    const ddGrid = el('div', { class: 'weekly-deepdives' });
    renderDeepDives(D, ddGrid);
    s3.appendChild(ddGrid);
    root.appendChild(s3);

    // ── mermaid 图 2: 寒武纪融资融券流程 ──
    const code2 = mermaidMargin(D);
    if (code2) {
      const m2 = el('div');
      renderMermaid(m2, code2, '图 2 · 寒武纪融资融券趋势 · ' + m.period);
      root.appendChild(m2);
    }

    // ── mermaid 图 3: Swarm 决策流程（以 iflytek 为例） ──
    const iflytek = D.deepDives.find(function (d) { return d.id === 'iflytek'; });
    const code3 = iflytek ? mermaidSwarmGeneric(D, iflytek) : null;
    if (code3) {
      const m3 = el('div');
      renderMermaid(m3, code3, '图 3 · Swarm 多智能体投委会流程（科大讯飞 🔴 否决案例 · Bull/Bear/CRO/PM 各 5 分制）');
      root.appendChild(m3);
    }

    // ── Section 4: 资金流向 ──
    const s4 = section('4', '产业链资金流向与情绪面', '杠杆撤退 / 板块切换 / 机构观点');
    const flows = el('div', { class: 'weekly-risks' });
    D.flows.forEach(function (f) {
      const card = el('div', { class: 'weekly-risk is-' + (f.tone === 'enter' ? 'mid' : 'high') });
      card.appendChild(el('div', { class: 'weekly-risk__bar' }));
      const main = el('div', null, [
        el('div', { class: 'weekly-risk__head' }, [
          el('span', { class: 'weekly-risk__tag', text: f.ticker }),
          el('span', { class: 'weekly-risk__level', text: f.tone === 'enter' ? '流入' : '流出' })
        ]),
        el('p', { class: 'weekly-risk__detail', html: '<b>' + f.delta + '</b> — ' + f.note })
      ]);
      card.appendChild(main);
      flows.appendChild(card);
    });
    s4.appendChild(flows);
    root.appendChild(s4);

    // ── Section 5: 投资建议 ──
    const s5 = section('5', '本周投资建议总结', 'Swarm PM 校验 · 仓位 81.5% / 现金 18.5%');
    s5.appendChild(renderRecommendations(D));
    root.appendChild(s5);

    // ── mermaid 图 4: 仓位拓扑 ──
    const m4 = el('div');
    renderMermaid(m4, mermaidPositioning(D), '图 4 · 仓位拓扑（8 维持 / 新增 + 4 回避 / 减仓 · 颜色按 Swarm 态度）');
    root.appendChild(m4);

    // ── Section 6: 风险 ──
    const s6 = section('6', '风险提示', '5 项结构化风险 · 已按等级排序');
    s6.appendChild(renderRisks(D));
    root.appendChild(s6);

    // ── Section 7: 附录 覆盖标的 ──
    const s7 = section('附录 A', '覆盖标的全列表（5 大板块）', '总 134 只 · 仅展示前 5 / 板块');
    s7.appendChild(renderCoverage(D));
    root.appendChild(s7);

    // Foot
    root.appendChild(el('footer', { class: 'weekly-foot' }, [
      el('span', { text: 'v1.0 · ' + m.issue + ' · Generated with vibe-trading MCP + Claude Code' }),
      el('span', { text: '数据源：yfinance / Eastmoney · 仅供内部研究使用' })
    ]));

    return root;
  }

  function section(num, title, kicker) {
    const s = el('section', { class: 'weekly-section' });
    const head = el('div', { class: 'weekly-section__head' });
    head.appendChild(el('span', { class: 'weekly-section__num', text: num }));
    head.appendChild(el('h2', { class: 'weekly-section__title', text: title }));
    if (kicker) head.appendChild(el('span', { class: 'weekly-section__kicker', text: kicker }));
    s.appendChild(head);
    return s;
  }

  // ============== 挂载入口（子 tab 切换） ==============
  // 周报视图顶部显示子 tab 栏，每个 issue 一个 tab；默认选中最新一期。
  // 仅渲染当前选中 issue 的内容，切换时按需懒渲染。
  function initWeeklyView() {
    const view = document.getElementById('weekly-view');
    if (!view) return;
    if (view._weeklyInitialized) return;
    const REPORTS = window.WEEKLY_REPORTS;
    if (!REPORTS || Object.keys(REPORTS).length === 0) {
      view.innerHTML = '<p style="color:var(--crimson);padding:24px">⚠ WEEKLY_REPORTS 数据未加载</p>';
      return;
    }
    view.innerHTML = '';

    // 按时间倒序排序（最新在最上面 / 第一个 tab）
    const issues = Object.keys(REPORTS).sort().reverse();

    // ── 子 tab 栏 ──
    const tabBar = el('div', { class: 'weekly-subtabs' });

    // ── 内容区（每个 issue 一个容器，仅 active 可见） ──
    const contentArea = el('div', { class: 'weekly-content' });
    var rendered = {};     // issue → bool（是否已渲染）
    var containers = {};   // issue → DOM wrapper

    issues.forEach(function (issue, idx) {
      var D = REPORTS[issue];
      var period = D.meta && D.meta.period ? D.meta.period : issue;
      var isActive = idx === 0;

      // --- 子 tab 按钮 ---
      var tab = el('button', {
        class: 'weekly-subtab' + (isActive ? ' is-active' : ''),
        'data-issue': issue
      });
      tab.appendChild(el('span', { class: 'weekly-subtab__date', text: issue }));
      tab.appendChild(el('span', { class: 'weekly-subtab__period', text: period }));
      tab.addEventListener('click', function () {
        if (tab.classList.contains('is-active')) return;
        // 切换激活态
        tabBar.querySelectorAll('.weekly-subtab').forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        // 隐藏所有内容容器
        Object.keys(containers).forEach(function (k) { containers[k].style.display = 'none'; });
        // 懒渲染 + 展示目标 issue
        if (!rendered[issue]) {
          try {
            containers[issue].appendChild(buildView(REPORTS[issue]));
            rendered[issue] = true;
          } catch (e) {
            containers[issue].appendChild(el('pre', { class: 'weekly-issue__err', text: '⚠ 渲染 ' + issue + ' 失败：\n' + (e && e.message ? e.message : e) }));
          }
        }
        containers[issue].style.display = '';
      });
      tabBar.appendChild(tab);

      // --- 内容容器（非 active 的 display:none） ---
      var wrap = el('div', { class: 'weekly-issue', 'data-issue': issue });
      if (!isActive) wrap.style.display = 'none';
      containers[issue] = wrap;
      contentArea.appendChild(wrap);
    });

    view.appendChild(tabBar);
    view.appendChild(contentArea);

    // 渲染最新一期（第一个 tab，默认激活）
    try {
      containers[issues[0]].appendChild(buildView(REPORTS[issues[0]]));
      rendered[issues[0]] = true;
    } catch (e) {
      containers[issues[0]].appendChild(el('pre', { class: 'weekly-issue__err', text: '⚠ 渲染 ' + issues[0] + ' 失败：\n' + (e && e.message ? e.message : e) }));
    }

    view._weeklyInitialized = true;
  }
  window.initWeeklyView = initWeeklyView;
})();
