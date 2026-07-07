// ============================================================
// embodied-view.js — AI 终端·具身与硬件 视图渲染 + 筛选逻辑
// ============================================================
// 与 upstream-view.js / downstream-view.js 完全平行
//   substage：量产阶段（研发样品/小批量/规模出货）
//   moat + pricingPower（护城河×定价权框架）
//
// 依赖：window.EMBODIED_DATA (embodied.js)
// 暴露：window.initEmbodiedView()
// 样式复用 src/upstream.css
// ============================================================

(function () {
  'use strict';

  const D = () => window.EMBODIED_DATA;
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const state = {
    groupFilter: null, stageFilter: null, marketFilter: null,
    moatFilter: null, pricingFilter: null,
    searchQuery: '', sortKey: 'elasticity', sortDir: -1, expandedRow: null
  };

  const GROUP_ZH = { '机器人': '机器人与具身', '智驾与硬件': '智能驾驶与AI硬件' };

  function stageLabel(stage) {
    if (stage === 'L3') return '规模出货';
    if (stage === 'L2') return '小批量';
    if (stage === 'L1') return '研发样品';
    return '';
  }

  const MOAT_ZH = { strong: '强护城河', medium: '中护城河', weak: '弱护城河' };
  const PRICING_ZH = { expanding: '提价中', flat: '价格稳', compressing: '被压价' };

  function renderElasticityBar(elasticity) {
    if (elasticity === null || elasticity === undefined) return '<span class="elasticity-na">待校准</span>';
    const clamped = Math.max(0.5, Math.min(6.5, elasticity));
    const pct = ((clamped - 0.5) / 6.0) * 92 + 8;
    const tier = elasticity >= 3.5 ? 'elasticity-high' : elasticity >= 2.0 ? 'elasticity-medium' : 'elasticity-low';
    return `<span class="elasticity-bar-wrap"><span class="elasticity-bar ${tier}" style="width:${pct}px"></span><span class="elasticity-value">${elasticity.toFixed(1)}x</span></span>`;
  }

  function renderMarketBadge(market) {
    return `<span class="upstream-badge market-badge ${market === 'A股' ? 'a-share' : 'hk-share'}">${market}</span>`;
  }

  function renderSubstageBadge(stage) {
    return `<span class="upstream-badge substage-badge ${stage}">${stage} ${stageLabel(stage)}</span>`;
  }

  function renderGroupBadge(group) {
    const clsMap = { '机器人': 'gases', '智驾与硬件': 'power-coupling' };
    return `<span class="upstream-badge group-badge ${clsMap[group] || ''}">${GROUP_ZH[group] || group}</span>`;
  }

  function renderMoatBadge(moat) {
    if (!moat) return '';
    return `<span class="upstream-badge moat-badge moat-${moat}">${MOAT_ZH[moat] || moat}</span>`;
  }

  function renderPricingBadge(pricing) {
    if (!pricing) return '';
    return `<span class="upstream-badge pricing-badge pricing-${pricing}">${PRICING_ZH[pricing] || pricing}</span>`;
  }

  function filteredCategories() {
    const { categories } = D();
    let ids = Object.keys(categories);
    if (state.groupFilter) ids = ids.filter(id => categories[id].group === state.groupFilter);
    if (state.stageFilter) ids = ids.filter(id => categories[id].substage === state.stageFilter);
    if (state.moatFilter) ids = ids.filter(id => categories[id].moat === state.moatFilter);
    if (state.pricingFilter) ids = ids.filter(id => categories[id].pricingPower === state.pricingFilter);
    if (state.marketFilter) ids = ids.filter(id => categories[id].companies.some(cid => { const co = D().companies[cid]; return co && co.market === state.marketFilter; }));
    if (state.searchQuery) {
      const q = state.searchQuery;
      ids = ids.filter(id => {
        const cat = categories[id];
        if (cat.name.toLowerCase().includes(q) || cat.id.includes(q) || (cat.note && cat.note.toLowerCase().includes(q))) return true;
        return cat.companies.some(cid => { const co = D().companies[cid]; return co && (co.name.toLowerCase().includes(q) || co.ticker.toLowerCase().includes(q)); });
      });
    }
    return ids;
  }

  function sortCategories(ids) {
    const { categories } = D();
    return ids.sort((a, b) => {
      const ca = categories[a], cb = categories[b];
      let va, vb;
      switch (state.sortKey) {
        case 'name': va = ca.name; vb = cb.name; break;
        case 'substage': va = ca.substage; vb = cb.substage; break;
        case 'elasticity': va = ca.elasticity || 0; vb = cb.elasticity || 0; break;
        case 'moat': va = ca.moat || ''; vb = cb.moat || ''; break;
        case 'pricing': va = ca.pricingPower || ''; vb = cb.pricingPower || ''; break;
        case 'cats': va = ca.companies.length; vb = cb.companies.length; break;
        default: va = ca.elasticity || 0; vb = cb.elasticity || 0;
      }
      if (va < vb) return -1 * state.sortDir;
      if (va > vb) return 1 * state.sortDir;
      return 0;
    });
  }

  function renderTable() {
    const filtered = filteredCategories();
    const sorted = sortCategories(filtered);
    const { categories, companies } = D();
    const tbody = $('#embodied-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (sorted.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--ink-dim);padding:40px">无匹配结果</td></tr>';
      updateKPIs(sorted);
      return;
    }

    sorted.forEach(catId => {
      const cat = categories[catId];
      const cos = (cat.companies || []).map(cid => companies[cid]).filter(Boolean);
      const aShare = cos.filter(c => c.market === 'A股');
      const hkShare = cos.filter(c => c.market === '港股');
      const marketsHtml = [
        aShare.length ? `<span class="upstream-badge market-badge a-share">A股×${aShare.length}</span>` : '',
        hkShare.length ? `<span class="upstream-badge market-badge hk-share">港股×${hkShare.length}</span>` : ''
      ].filter(Boolean).join(' ');

      const tr = document.createElement('tr');
      tr.className = 'cat-row';
      tr.dataset.catId = catId;
      tr.innerHTML = `
        <td>${renderGroupBadge(cat.group)}</td>
        <td><span class="cat-name">${cat.name}</span></td>
        <td>${renderSubstageBadge(cat.substage)}</td>
        <td>${renderMoatBadge(cat.moat)}</td>
        <td>${renderPricingBadge(cat.pricingPower)}</td>
        <td>${renderElasticityBar(cat.elasticity)}</td>
        <td>${marketsHtml || '<span class="upstream-badge" style="opacity:0.5">—</span>'}</td>
        <td class="note-cell">${cat.note || ''}</td>
      `;
      tr.addEventListener('click', () => toggleExpand(catId));
      tbody.appendChild(tr);

      if (state.expandedRow === catId) {
        cos.forEach(co => {
          const coTr = document.createElement('tr');
          coTr.className = 'expanded-row';
          coTr.innerHTML = `
            <td></td><td colspan="7">
              <div class="expanded-detail">
                <span class="co-ticker">${co.ticker}</span>
                <span class="co-name">${co.name}</span>
                ${renderMarketBadge(co.market)}
                ${renderSubstageBadge(co.substage)}
                <span class="co-financials">固成比 ${(co.financials.fixedCostRatio * 100).toFixed(0)}% · AI营收 ${(co.financials.aiRevenuePct * 100).toFixed(0)}% · DOL ${co.financials.dol.toFixed(2)}</span>
                <span class="co-note">${co.note || ''}</span>
              </div>
            </td>
          `;
          tbody.appendChild(coTr);
        });
      }
    });

    updateKPIs(sorted);
  }

  function toggleExpand(catId) {
    state.expandedRow = state.expandedRow === catId ? null : catId;
    renderTable();
  }

  function updateKPIs(filteredCatIds) {
    const stats = D().getStats();
    const elCats = $('#embodied-kpi-cats');
    const elCos = $('#embodied-kpi-companies');
    const elL3 = $('#embodied-kpi-l3');
    const elElasticity = $('#embodied-kpi-elasticity');
    const elFiltered = $('#embodied-kpi-filtered');

    if (elCats) elCats.innerHTML = `<span class="upstream-kpi-value">${filteredCatIds.length}</span><span class="upstream-kpi-sub">/ ${stats.totalCategories} 赛道</span>`;
    if (elCos) elCos.innerHTML = `<span class="upstream-kpi-value">${stats.totalCompanies}</span><span class="upstream-kpi-sub">A股 ${stats.aShare} · 港股 ${stats.hkShare}</span>`;
    if (elL3) elL3.innerHTML = `<span class="upstream-kpi-value">${stats.l3Categories}</span><span class="upstream-kpi-sub">L3 规模出货 · L2 ${stats.l2Categories} · L1 ${stats.l1Categories}</span>`;
    if (elElasticity && stats.avgElasticity) {
      elElasticity.innerHTML = `<span class="upstream-kpi-value">${stats.avgElasticity.toFixed(2)}x</span><span class="upstream-kpi-sub">${stats.calibratedCount}/${stats.totalCategories} 已校准</span>`;
    } else if (elElasticity) {
      elElasticity.innerHTML = `<span class="upstream-kpi-value" style="color:var(--ink-mute)">—</span><span class="upstream-kpi-sub">待校准</span>`;
    }
    if (elFiltered) {
      elFiltered.style.display = (state.groupFilter || state.stageFilter || state.marketFilter || state.moatFilter || state.pricingFilter || state.searchQuery) ? 'block' : 'none';
      elFiltered.textContent = `筛选: ${filteredCatIds.length} 赛道`;
    }
  }

  function bindEvents() {
    const container = $('#embodied-view');
    if (!container) return;

    $$('[data-group]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-group]', container).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.groupFilter = btn.dataset.group === 'all' ? null : btn.dataset.group;
        renderTable();
      });
    });
    $$('[data-stage]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-stage]', container).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.stageFilter = btn.dataset.stage === 'all' ? null : btn.dataset.stage;
        renderTable();
      });
    });
    $$('[data-moat]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-moat]', container).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.moatFilter = btn.dataset.moat === 'all' ? null : btn.dataset.moat;
        renderTable();
      });
    });
    $$('[data-pricing]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-pricing]', container).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.pricingFilter = btn.dataset.pricing === 'all' ? null : btn.dataset.pricing;
        renderTable();
      });
    });
    $$('[data-market]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-market]', container).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.marketFilter = btn.dataset.market === 'all' ? null : btn.dataset.market;
        renderTable();
      });
    });

    const searchInput = $('#embodied-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchQuery = searchInput.value.toLowerCase().trim();
        renderTable();
      });
    }

    $$('#embodied-table-head .sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (state.sortKey === key) { state.sortDir *= -1; }
        else { state.sortKey = key; state.sortDir = -1; }
        renderTable();
        $$('#embodied-table-head .sortable').forEach(t => t.classList.remove('sorted-asc', 'sorted-desc'));
        th.classList.add(state.sortDir === 1 ? 'sorted-asc' : 'sorted-desc');
      });
    });
  }

  function init() {
    bindEvents();
    renderTable();
    D().validate();
  }

  window.initEmbodiedView = init;

})();
