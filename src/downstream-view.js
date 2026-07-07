// ============================================================
// downstream-view.js — AI 下游应用链视图 渲染 + 筛选逻辑
// ============================================================
// 与 upstream-view.js 完全平行，但语义倒置：
//   - substage：商业化阶段（Pre-Revenue / Early Commercial / Scale-Profit）
//   - moat（替代 policyBoost）：护城河强度
//   - pricingPower（替代 chokepoint）：定价权趋势
//
// 依赖：window.DOWNSTREAM_DATA (downstream.js)
// 暴露：window.initDownstreamView()
//
// 样式复用 src/upstream.css（共用 .filter-chip / .upstream-badge / .elasticity-bar 等）
// ============================================================

(function () {
  'use strict';

  const D = () => window.DOWNSTREAM_DATA;
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  // ── 视图状态 ────────────────────────────────────────────
  const state = {
    groupFilter: null,    // null = all, or 云算力分发|行业模型|办公创作|行业SaaS|C端平台|机器人具身
    stageFilter: null,    // null = all, or L1|L2|L3   ← 注意：下游 L=商业化阶段，非国产
    marketFilter: null,   // null = all, or A股|港股
    moatFilter: null,     // null = all, or strong|medium|weak    ← 下游新增
    pricingFilter: null,  // null = all, or expanding|flat|compressing
    searchQuery: '',
    sortKey: 'elasticity',
    sortDir: -1,
    expandedRow: null
  };

  // ── 组别中文 ────────────────────────────────────────────
  const GROUP_ZH = {
    '云算力分发': '云与算力分发',
    '行业模型':   '行业大模型',
    '办公创作':   '办公与创作',
    '行业SaaS':   '行业垂直 SaaS',
    'C端平台':    '消费与内容',
    '机器人具身': '机器人与具身'
  };

  // ── 商业化阶段 label ──────────────────────────────────
  function stageLabel(stage) {
    if (stage === 'L3') return '规模盈利';
    if (stage === 'L2') return '早起商业';
    if (stage === 'L1') return 'Pre-Rev';
    return '';
  }

  // ── 护城河 label / 定价权 label ───────────────────────
  const MOAT_ZH = { strong: '强护城河', medium: '中护城河', weak: '弱护城河' };
  const PRICING_ZH = { expanding: '提价中', flat: '价格稳', compressing: '被压价' };

  // ── 弹性条（同上游版本）───────────────────────────────
  function renderElasticityBar(elasticity) {
    if (elasticity === null || elasticity === undefined) {
      return '<span class="elasticity-na">待校准</span>';
    }
    const clamped = Math.max(0.5, Math.min(6.5, elasticity));
    const pct = ((clamped - 0.5) / 6.0) * 92 + 8;
    const tier = elasticity >= 3.5 ? 'elasticity-high' :
                 elasticity >= 2.0 ? 'elasticity-medium' : 'elasticity-low';
    return `<span class="elasticity-bar-wrap">
      <span class="elasticity-bar ${tier}" style="width:${pct}px"></span>
      <span class="elasticity-value">${elasticity.toFixed(1)}x</span>
    </span>`;
  }

  // ── 徽章 ────────────────────────────────────────────────
  function renderGroupBadge(group) {
    const clsMap = {
      '云算力分发': 'metals',     // 复用 amber 系列色
      '行业模型':   'gases',      // crimson
      '办公创作':   'materials',  // slate
      '行业SaaS':   'components', // moss
      'C端平台':    'power-coupling',
      '机器人具身': 'gases'
    };
    const cls = clsMap[group] || '';
    return `<span class="upstream-badge group-badge ${cls}">${GROUP_ZH[group] || group}</span>`;
  }

  function renderMarketBadge(market) {
    const cls = market === 'A股' ? 'a-share' : 'hk-share';
    return `<span class="upstream-badge market-badge ${cls}">${market}</span>`;
  }

  function renderSubstageBadge(stage) {
    return `<span class="upstream-badge substage-badge ${stage}">${stage} ${stageLabel(stage)}</span>`;
  }

  function renderMoatBadge(moat) {
    const cls = `moat-${moat}`;
    return `<span class="upstream-badge ${cls}">${MOAT_ZH[moat] || moat}</span>`;
  }

  function renderPricingBadge(pp) {
    const cls = `pricing-${pp}`;
    return `<span class="upstream-badge ${cls}">${PRICING_ZH[pp] || pp}</span>`;
  }

  // ── 过滤 ────────────────────────────────────────────────
  function filteredCategories() {
    const { categories } = D();
    let ids = Object.keys(categories);

    if (state.groupFilter)   ids = ids.filter(id => categories[id].group === state.groupFilter);
    if (state.stageFilter)   ids = ids.filter(id => categories[id].substage === state.stageFilter);
    if (state.moatFilter)    ids = ids.filter(id => categories[id].moat === state.moatFilter);
    if (state.pricingFilter) ids = ids.filter(id => categories[id].pricingPower === state.pricingFilter);

    if (state.marketFilter) {
      ids = ids.filter(id => {
        const cos = D().getCompaniesByCategory(id);
        return cos.some(c => c.market === state.marketFilter);
      });
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      ids = ids.filter(id => {
        const cat = categories[id];
        const cos = D().getCompaniesByCategory(id);
        return cat.name.toLowerCase().includes(q) ||
               cat.id.toLowerCase().includes(q) ||
               (cat.note && cat.note.toLowerCase().includes(q)) ||
               cos.some(c =>
                 c.name.toLowerCase().includes(q) ||
                 c.ticker.toLowerCase().includes(q) ||
                 (c.note && c.note.toLowerCase().includes(q))
               );
      });
    }

    return ids;
  }

  // ── 排序 ────────────────────────────────────────────────
  function sortedCategoryIds(ids) {
    const { categories } = D();
    const arr = ids.slice();

    arr.sort((a, b) => {
      let va, vb;
      switch (state.sortKey) {
        case 'elasticity':
          va = categories[a].elasticity ?? -1;
          vb = categories[b].elasticity ?? -1;
          break;
        case 'name':
          va = categories[a].name;
          vb = categories[b].name;
          return state.sortDir * va.localeCompare(vb, 'zh');
        case 'substage': {
          const order = { 'L3': 3, 'L2': 2, 'L1': 1 };
          va = order[categories[a].substage] || 0;
          vb = order[categories[b].substage] || 0;
          break;
        }
        case 'moat': {
          const order = { strong: 3, medium: 2, weak: 1 };
          va = order[categories[a].moat] || 0;
          vb = order[categories[b].moat] || 0;
          break;
        }
        case 'pricing': {
          const order = { expanding: 3, flat: 2, compressing: 1 };
          va = order[categories[a].pricingPower] || 0;
          vb = order[categories[b].pricingPower] || 0;
          break;
        }
        case 'cats':
          va = categories[a].companies.length;
          vb = categories[b].companies.length;
          break;
        default:
          va = 0; vb = 0;
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return state.sortDir * (va - vb);
      }
      return 0;
    });

    return arr;
  }

  // ── 展开行（与 upstream 完全同构：3 列 × h4）───────────
  function renderExpandRow(catId) {
    const cos = D().getCompaniesByCategory(catId);

    if (cos.length === 0) {
      return `<tr class="expand-row"><td colspan="8">
        <div class="expand-detail">
          <p>暂无 A/H 直接上市公司。此赛道由 OpenAI* / Anthropic* / 智元等海外或未上市主体主导，下游 A/H 暂无直接映射。</p>
        </div>
      </td></tr>`;
    }

    const items = cos.map(co => {
      const relatedCats = D().getCategoriesByCompany(co.id)
        .map(c => `<span class="upstream-badge substage-badge ${c.substage}" style="cursor:pointer"
                        data-cat="${c.id}">${c.name}</span>`)
        .join('');

      const dol = co.financials?.dol || null;
      const fixedRatio = co.financials?.fixedCostRatio || null;
      const aiPct = co.financials?.aiRevenuePct || null;
      const moat = MOAT_ZH[co.id] || '';  // 注：此处仅示意，下游 moat 在赛道级

      // 下游专有：moat + pricingPower 来自赛道而非公司（公司级只有 substage）
      // 这里取"该公司主隶属的赛道"的维度
      const homeCat = D().categories[catId];
      const catMoat = MOAT_ZH[homeCat.moat] || homeCat.moat;
      const catPricing = PRICING_ZH[homeCat.pricingPower] || homeCat.pricingPower;

      return `<div class="expand-detail">
        <div>
          <h4>公司信息</h4>
          <p>
            <strong>${co.name}</strong> &nbsp; ${renderMarketBadge(co.market)} &nbsp; ${renderSubstageBadge(co.substage)}<br>
            <span class="ticker-link">${co.ticker}</span>
          </p>
          ${co.note ? `<p style="margin-top:6px">${co.note}</p>` : ''}
        </div>
        <div>
          <h4>DOL 经营杠杆分解</h4>
          <div class="dol-breakdown">
            ${dol !== null ? `
              DOL = 1 + (固定成本/EBIT) = <strong>${dol.toFixed(2)}x</strong><br>
              <span>固定成本占比: ${fixedRatio !== null ? (fixedRatio * 100).toFixed(0) + '%' : '—'}</span><br>
              <span>AI 收入占比: ${aiPct !== null ? (aiPct * 100).toFixed(0) + '%' : '—'}</span><br>
              <span>护城河: <strong style="color:var(--ink)">${catMoat}</strong></span><br>
              <span>定价权趋势: <strong style="color:var(--ink)">${catPricing}</strong></span>
            ` : '<span class="elasticity-na">财务数据待填充</span>'}
          </div>
        </div>
        <div>
          <h4>关联赛道 (${co.categories.length})</h4>
          <div class="related-cats">${relatedCats}</div>
        </div>
      </div>`;
    }).join('');

    return `<tr class="expand-row"><td colspan="8">${items}</td></tr>`;
  }

  // ── 主表渲染 ────────────────────────────────────────────
  function renderTable() {
    const tbody = $('#downstream-table-body');
    if (!tbody) return;

    const filtered = filteredCategories();
    const sorted = sortedCategoryIds(filtered);
    const { categories } = D();

    if (sorted.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="8">
        没有匹配的赛道。试试调整筛选条件。
      </td></tr>`;
      return;
    }

    let html = '';
    for (const catId of sorted) {
      const cat = categories[catId];
      const cos = D().getCompaniesByCategory(catId);
      const isExpanded = state.expandedRow === catId;
      const aCount = cos.filter(c => c.market === 'A股').length;
      const hCount = cos.filter(c => c.market === '港股').length;
      const marketTags = [
        aCount ? `<span class="upstream-badge market-badge a-share">A股×${aCount}</span>` : '',
        hCount ? `<span class="upstream-badge market-badge hk-share">港股×${hCount}</span>` : ''
      ].filter(Boolean).join(' ');

      // 2030 目标区间
      const tgt = cat.target2030 ? `${cat.target2030.low}-${cat.target2030.high}` : '—';

      html += `<tr data-cat="${catId}" class="${isExpanded ? 'is-expanded' : ''}">
        <td>${renderGroupBadge(cat.group)}</td>
        <td><strong>${cat.name}</strong></td>
        <td>${renderSubstageBadge(cat.substage)}</td>
        <td>${renderMoatBadge(cat.moat)}</td>
        <td>${renderPricingBadge(cat.pricingPower)}</td>
        <td>${renderElasticityBar(cat.elasticity)}</td>
        <td>${marketTags || '<span style="color:var(--ink-mute)">暂无</span>'}</td>
        <td style="font-size:10px;color:var(--ink-dim);max-width:260px">${cat.note || ''}</td>
      </tr>`;

      if (isExpanded) html += renderExpandRow(catId);
    }

    tbody.innerHTML = html;

    // 绑定行点击展开
    $$('tr[data-cat]', tbody).forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('upstream-badge')) return;
        const catId = row.dataset.cat;
        state.expandedRow = state.expandedRow === catId ? null : catId;
        renderTable();
      });
    });

    // 展开行内的赛道徽章点击 = 跳转到那个赛道
    $$('.related-cats .upstream-badge', tbody).forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = badge.dataset.cat;
        state.groupFilter = null;
        state.stageFilter = null;
        state.marketFilter = null;
        state.moatFilter = null;
        state.pricingFilter = null;
        state.searchQuery = '';
        state.expandedRow = catId;
        syncFilterUI();
        renderAll();
      });
    });
  }

  // ── 表头排序 ────────────────────────────────────────────
  function renderSortIndicator(th) {
    $$('th.sortable').forEach(h => h.removeAttribute('aria-sort'));
    if (th) th.setAttribute('aria-sort', state.sortDir === -1 ? 'descending' : 'ascending');
  }
  function setupSortableHeaders() {
    const thead = $('#downstream-table-head');
    if (!thead) return;
    thead.addEventListener('click', (e) => {
      const th = e.target.closest('th.sortable');
      if (!th) return;
      const key = th.dataset.sort;
      if (!key) return;
      if (state.sortKey === key) state.sortDir *= -1;
      else { state.sortKey = key; state.sortDir = (key === 'name') ? 1 : -1; }
      renderSortIndicator(th);
      renderTable();
    });
  }

  // ── KPI 渲染 ────────────────────────────────────────────
  function renderKPIs() {
    const stats = D().getStats();
    const filtered = filteredCategories();

    const kpi1 = $('#downstream-kpi-tracks');
    if (kpi1) {
      kpi1.innerHTML = `<span class="upstream-kpi-value">${stats.mappedCategories}</span>
        <span class="upstream-kpi-sub">/ ${stats.totalCategories} 赛道</span>`;
    }

    const kpi2 = $('#downstream-kpi-companies');
    if (kpi2) {
      kpi2.innerHTML = `<span class="upstream-kpi-value">${stats.totalCompanies}</span>
        <span class="upstream-kpi-sub">A股 ${stats.aShare} · 港股 ${stats.hkShare}</span>`;
    }

    // KPI 3：商业化阶段分布
    const kpi3 = $('#downstream-kpi-stage');
    if (kpi3) {
      kpi3.innerHTML = `<span class="upstream-kpi-value">${stats.l3Categories}</span>
        <span class="upstream-kpi-sub">L3 规模盈利 · L2 ${stats.l2Categories} · L1 ${stats.l1Categories}</span>`;
    }

    // KPI 4：定价权为 expanding 的赛道数（代表可提价能力）
    const expandingN = D().getCategoriesByPricing('expanding').length;
    const kpi4 = $('#downstream-kpi-pricing');
    if (kpi4) {
      kpi4.innerHTML = `<span class="upstream-kpi-value">${expandingN}</span>
        <span class="upstream-kpi-sub">定价权 expanding 赛道 · avg 弹性 ${stats.avgElasticity ? stats.avgElasticity.toFixed(1) : '—'}x</span>`;
    }

    // 筛选反馈
    const fStats = {
      exp: filtered.filter(id => D().categories[id].pricingPower === 'expanding').length,
      flat: filtered.filter(id => D().categories[id].pricingPower === 'flat').length,
      comp: filtered.filter(id => D().categories[id].pricingPower === 'compressing').length
    };
    const fb = $('#downstream-kpi-filtered');
    if (fb && (state.groupFilter || state.stageFilter || state.marketFilter ||
               state.moatFilter || state.pricingFilter || state.searchQuery)) {
      fb.textContent = `当前筛选: ${filtered.length} 赛道 · 提价 ${fStats.exp} · 稳价 ${fStats.flat} · 被压价 ${fStats.comp}`;
      fb.style.display = '';
    } else if (fb) {
      fb.style.display = 'none';
    }
  }

  // ── 同步筛选 UI ─────────────────────────────────────────
  function syncFilterUI() {
    $$('.filter-chip[data-group]').forEach(c => c.classList.toggle('is-active', c.dataset.group === state.groupFilter));
    $$('.filter-chip[data-stage]').forEach(c => c.classList.toggle('is-active', c.dataset.stage === state.stageFilter));
    $$('.filter-chip[data-market]').forEach(c => c.classList.toggle('is-active', c.dataset.market === state.marketFilter));
    $$('.filter-chip[data-moat]').forEach(c => c.classList.toggle('is-active', c.dataset.moat === state.moatFilter));
    $$('.filter-chip[data-pricing]').forEach(c => c.classList.toggle('is-active', c.dataset.pricing === state.pricingFilter));
    const s = $('#downstream-search');
    if (s) s.value = state.searchQuery;
  }

  // ── 筛选事件 ────────────────────────────────────────────
  function setupFilters() {
    $$('.filter-chip[data-group]').forEach(chip => chip.addEventListener('click', () => toggleFilter(chip, 'groupFilter', chip.dataset.group)));
    $$('.filter-chip[data-stage]').forEach(chip => chip.addEventListener('click', () => toggleFilter(chip, 'stageFilter', chip.dataset.stage)));
    $$('.filter-chip[data-market]').forEach(chip => chip.addEventListener('click', () => toggleFilter(chip, 'marketFilter', chip.dataset.market)));
    $$('.filter-chip[data-moat]').forEach(chip => chip.addEventListener('click', () => toggleFilter(chip, 'moatFilter', chip.dataset.moat)));
    $$('.filter-chip[data-pricing]').forEach(chip => chip.addEventListener('click', () => toggleFilter(chip, 'pricingFilter', chip.dataset.pricing)));

    function toggleFilter(chip, key, val) {
      const cur = state[key];
      state[key] = (val === 'all') ? null : (cur === val ? null : val);
      state.expandedRow = null;
      syncFilterUI();
      renderAll();
    }

    // Search
    const searchInput = $('#downstream-search');
    if (searchInput) {
      let timer;
      searchInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.searchQuery = searchInput.value.trim();
          state.expandedRow = null;
          renderAll();
        }, 250);
      });
    }
  }

  // ── 全量渲染 ────────────────────────────────────────────
  function renderAll() {
    renderKPIs();
    renderTable();
    const sortTh = $(`th.sortable[data-sort="${state.sortKey}"]`);
    renderSortIndicator(sortTh);
    const note = $('#downstream-last-updated');
    if (note) note.textContent = `数据版本 ${D().meta.version} · 更新于 ${D().meta.lastUpdated}`;
  }

  // ── 入口 ────────────────────────────────────────────────
  function initDownstreamView() {
    setupFilters();
    setupSortableHeaders();
    renderAll();
    D().validate();
  }

  window.initDownstreamView = initDownstreamView;

})();
