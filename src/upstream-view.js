// ============================================================
// upstream-view.js — AI上游供应链视图 渲染 + 筛选逻辑
// ============================================================
// 依赖：window.UPSTREAM_DATA (upstream.js)
// 暴露：window.initUpstreamView()
// ============================================================

(function () {
  'use strict';

  const D = () => window.UPSTREAM_DATA;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  // ── 视图状态 ────────────────────────────────────────────
  const state = {
    groupFilter: null,    // null = all, or 金属组|特气组|材料组|零件组
    stageFilter: null,    // null = all, or L1|L2|L3
    marketFilter: null,   // null = all, or A股|港股
    searchQuery: '',
    sortKey: 'elasticity', // elasticity | name | substage | cats | market
    sortDir: -1,          // -1 = desc (highest elasticity first), 1 = asc
    expandedRow: null     // currently expanded company row
  };

  // ── 品类 ID → 中文组名映射 ──────────────────────────────
  const GROUP_ZH = {
    '金属组':   '算力金属组',   '特气组': '算力特气组',
    '材料组':   '算力材料组',   '零件组': '算力零件组',
    '电算协同': '电算协同组'
  };

  // ── 弹性系数可视化条 ────────────────────────────────────
  function renderElasticityBar(elasticity) {
    if (elasticity === null || elasticity === undefined) {
      return '<span class="elasticity-na">待校准</span>';
    }
    // 映射 0.5-6.5 到 8%-100% 宽度
    const clamped = Math.max(0.5, Math.min(6.5, elasticity));
    const pct = ((clamped - 0.5) / 6.0) * 92 + 8;
    const tier = elasticity >= 3.5 ? 'elasticity-high' :
                 elasticity >= 2.0 ? 'elasticity-medium' : 'elasticity-low';
    return `<span class="elasticity-bar-wrap">
      <span class="elasticity-bar ${tier}" style="width:${pct}px"></span>
      <span class="elasticity-value">${elasticity.toFixed(1)}x</span>
    </span>`;
  }

  // ── 市场徽章 ────────────────────────────────────────────
  function renderMarketBadge(market) {
    const cls = market === 'A股' ? 'a-share' : 'hk-share';
    return `<span class="upstream-badge market-badge ${cls}">${market}</span>`;
  }

  // ── 国产替代阶段徽章 ────────────────────────────────────
  function renderSubstageBadge(stage) {
    return `<span class="upstream-badge substage-badge ${stage}">${stage} ${stageLabel(stage)}</span>`;
  }

  function stageLabel(stage) {
    if (stage === 'L3') return '国产主导';
    if (stage === 'L2') return '国产突破';
    if (stage === 'L1') return '国产起步';
    return '';
  }

  // ── 组别徽章 ────────────────────────────────────────────
  function renderGroupBadge(group) {
    const clsMap = { '金属组': 'metals', '特气组': 'gases', '材料组': 'materials', '零件组': 'components', '电算协同': 'power-coupling' };
    const cls = clsMap[group] || '';
    return `<span class="upstream-badge group-badge ${cls}">${GROUP_ZH[group] || group}</span>`;
  }

  // ── 过滤逻辑 ────────────────────────────────────────────
  function filteredCategories() {
    const { categories } = D();
    let ids = Object.keys(categories);

    if (state.groupFilter) {
      ids = ids.filter(id => categories[id].group === state.groupFilter);
    }
    if (state.stageFilter) {
      ids = ids.filter(id => categories[id].substage === state.stageFilter);
    }
    if (state.marketFilter) {
      // 品类关联了公司，按公司市场过滤
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
               cat.note.toLowerCase().includes(q) ||
               cos.some(c => c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q));
      });
    }

    return ids;
  }

  // ── 排序逻辑 ────────────────────────────────────────────
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
        case 'cats': // 关联公司数
          va = categories[a].companies.length;
          vb = categories[b].companies.length;
          break;
        case 'market':
          // 按是否有 A 股公司排序
          va = D().getCompaniesByCategory(a).some(c => c.market === 'A股') ? 2 :
               D().getCompaniesByCategory(a).some(c => c.market === '港股') ? 1 : 0;
          vb = D().getCompaniesByCategory(b).some(c => c.market === 'A股') ? 2 :
               D().getCompaniesByCategory(b).some(c => c.market === '港股') ? 1 : 0;
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

  // ── 公司展开行 ──────────────────────────────────────────
  function renderExpandRow(catId) {
    const cos = D().getCompaniesByCategory(catId);
    if (cos.length === 0) {
      return `<tr class="expand-row"><td colspan="7">
        <div class="expand-detail">
          <p>暂无已映射公司。待 Vibe-Trading 筛选数据填充。</p>
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
              <span>AI 上游营收占比: ${aiPct !== null ? (aiPct * 100).toFixed(0) + '%' : '—'}</span>
            ` : '<span class="elasticity-na">财务数据待填充</span>'}
          </div>
        </div>
        <div>
          <h4>关联品类 (${co.categories.length})</h4>
          <div class="related-cats">${relatedCats}</div>
        </div>
      </div>`;
    }).join('');

    return `<tr class="expand-row"><td colspan="7">${items}</td></tr>`;
  }

  // ── 渲染主表 ────────────────────────────────────────────
  function renderTable() {
    const tbody = $('#upstream-table-body');
    if (!tbody) return;

    const filtered = filteredCategories();
    const sorted = sortedCategoryIds(filtered);
    const { categories } = D();

    if (sorted.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="7">
        没有匹配的品类。试试调整筛选条件。
      </td></tr>`;
      return;
    }

    let html = '';
    for (const catId of sorted) {
      const cat = categories[catId];
      const cos = D().getCompaniesByCategory(catId);
      const isExpanded = state.expandedRow === catId;
      const aShareCos = cos.filter(c => c.market === 'A股');
      const hkCos = cos.filter(c => c.market === '港股');
      const marketTags = [
        aShareCos.length > 0 ? `<span class="upstream-badge market-badge a-share">A股×${aShareCos.length}</span>` : '',
        hkCos.length > 0 ? `<span class="upstream-badge market-badge hk-share">港股×${hkCos.length}</span>` : ''
      ].filter(Boolean).join(' ');

      html += `<tr data-cat="${catId}" class="${isExpanded ? 'is-expanded' : ''}">
        <td>${renderGroupBadge(cat.group)}</td>
        <td><strong>${cat.name}</strong></td>
        <td>${renderSubstageBadge(cat.substage)}</td>
        <td>${marketTags || '<span style="color:var(--ink-mute)">待映射</span>'}</td>
        <td>${renderElasticityBar(cat.elasticity)}</td>
        <td>${cos.length}</td>
        <td style="font-size:10px;color:var(--ink-dim);max-width:260px">${cat.note || ''}</td>
      </tr>`;

      if (isExpanded) {
        html += renderExpandRow(catId);
      }
    }

    tbody.innerHTML = html;

    // 绑定点击展开
    $$('tr[data-cat]', tbody).forEach(row => {
      row.addEventListener('click', (e) => {
        // 忽略徽章点击（可能用于导航）
        if (e.target.classList.contains('upstream-badge')) return;
        const catId = row.dataset.cat;
        state.expandedRow = state.expandedRow === catId ? null : catId;
        renderTable();
      });
    });

    // 绑定展开行内品类徽章点击
    $$('.related-cats .upstream-badge', tbody).forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = badge.dataset.cat;
        // 清除所有筛选，展开该品类
        state.groupFilter = null;
        state.stageFilter = null;
        state.marketFilter = null;
        state.searchQuery = '';
        state.expandedRow = catId;
        syncFilterUI();
        renderAll();
      });
    });
  }

  // ── 表头排序 ────────────────────────────────────────────
  function renderSortIndicator(th) {
    // 清除所有排序指示
    $$('th.sortable').forEach(h => h.removeAttribute('aria-sort'));
    if (th) {
      th.setAttribute('aria-sort', state.sortDir === -1 ? 'descending' : 'ascending');
    }
  }

  function setupSortableHeaders() {
    const thead = $('#upstream-table-head');
    if (!thead) return;

    thead.addEventListener('click', (e) => {
      const th = e.target.closest('th.sortable');
      if (!th) return;
      const key = th.dataset.sort;
      if (!key) return;

      if (state.sortKey === key) {
        state.sortDir *= -1; // toggle direction
      } else {
        state.sortKey = key;
        state.sortDir = key === 'name' ? 1 : -1; // name defaults asc, others desc
      }

      renderSortIndicator(th);
      renderTable();
    });
  }

  // ── 渲染 KPI ────────────────────────────────────────────
  function renderKPIs() {
    const stats = D().getStats();
    const filtered = filteredCategories();

    // KPI 1: 品类数（已映射/总数）
    const kpi1 = $('#upstream-kpi-cats');
    if (kpi1) {
      kpi1.innerHTML = `<span class="upstream-kpi-value">${stats.mappedCategories}</span>
        <span class="upstream-kpi-sub">/ ${stats.totalCategories} 品类</span>`;
    }

    // KPI 2: 公司数
    const kpi2 = $('#upstream-kpi-companies');
    if (kpi2) {
      kpi2.innerHTML = `<span class="upstream-kpi-value">${stats.totalCompanies}</span>
        <span class="upstream-kpi-sub">A股 ${stats.aShare} · 港股 ${stats.hkShare}</span>`;
    }

    // KPI 3: L3 品类数
    const kpi3 = $('#upstream-kpi-l3');
    if (kpi3) {
      kpi3.innerHTML = `<span class="upstream-kpi-value">${stats.l3Categories}</span>
        <span class="upstream-kpi-sub">L3 国产主导 · L2 ${stats.l2Categories} · L1 ${stats.l1Categories}</span>`;
    }

    // KPI 4: 平均弹性
    const kpi4 = $('#upstream-kpi-elasticity');
    if (kpi4) {
      if (stats.avgElasticity !== null) {
        kpi4.innerHTML = `<span class="upstream-kpi-value">${stats.avgElasticity.toFixed(1)}x</span>
          <span class="upstream-kpi-sub">已校准 ${stats.calibratedCount}/${stats.totalCategories} 品类</span>`;
      } else {
        kpi4.innerHTML = `<span class="upstream-kpi-value" style="color:var(--ink-mute)">—</span>
          <span class="upstream-kpi-sub">待 Vibe-Trading 数据校准</span>`;
      }
    }

    // 筛选状态下更新 KPI 副标题
    const filteredStats = {
      l3: filtered.filter(id => D().categories[id].substage === 'L3').length,
      l2: filtered.filter(id => D().categories[id].substage === 'L2').length,
      l1: filtered.filter(id => D().categories[id].substage === 'L1').length
    };

    const kpiFiltered = $('#upstream-kpi-filtered');
    if (kpiFiltered && (state.groupFilter || state.stageFilter || state.marketFilter || state.searchQuery)) {
      kpiFiltered.textContent = `当前筛选: ${filtered.length} 品类 · L3 ${filteredStats.l3} · L2 ${filteredStats.l2} · L1 ${filteredStats.l1}`;
      kpiFiltered.style.display = '';
    } else if (kpiFiltered) {
      kpiFiltered.style.display = 'none';
    }
  }

  // ── 同步筛选 UI ─────────────────────────────────────────
  function syncFilterUI() {
    // Group chips
    $$('.filter-chip[data-group]').forEach(chip => {
      chip.classList.toggle('is-active', chip.dataset.group === state.groupFilter);
    });
    // Stage chips
    $$('.filter-chip[data-stage]').forEach(chip => {
      chip.classList.toggle('is-active', chip.dataset.stage === state.stageFilter);
    });
    // Market chips
    $$('.filter-chip[data-market]').forEach(chip => {
      chip.classList.toggle('is-active', chip.dataset.market === state.marketFilter);
    });
    // Search
    const searchInput = $('#upstream-search');
    if (searchInput) {
      searchInput.value = state.searchQuery;
    }
  }

  // ── 设置筛选事件 ────────────────────────────────────────
  function setupFilters() {
    // Group filter
    $$('.filter-chip[data-group]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.group;
        state.groupFilter = (val === 'all') ? null :
          (state.groupFilter === val ? null : val);
        state.expandedRow = null;
        syncFilterUI();
        renderAll();
      });
    });

    // Stage filter
    $$('.filter-chip[data-stage]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.stage;
        state.stageFilter = (val === 'all') ? null :
          (state.stageFilter === val ? null : val);
        state.expandedRow = null;
        syncFilterUI();
        renderAll();
      });
    });

    // Market filter
    $$('.filter-chip[data-market]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.market;
        state.marketFilter = (val === 'all') ? null :
          (state.marketFilter === val ? null : val);
        state.expandedRow = null;
        syncFilterUI();
        renderAll();
      });
    });

    // Search (debounced)
    const searchInput = $('#upstream-search');
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
    $('#upstream-last-updated').textContent =
      `数据版本 ${D().meta.version} · 更新于 ${D().meta.lastUpdated}`;
  }

  // ── 入口 ────────────────────────────────────────────────
  function initUpstreamView() {
    setupFilters();
    setupSortableHeaders();
    renderAll();
    D().validate();
  }

  // 暴露给 filters.js 调用
  window.initUpstreamView = initUpstreamView;

})();
