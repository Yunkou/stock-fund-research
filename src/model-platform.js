// ============================================================
// model-platform.js — AI 中游·模型与平台 赛道×公司映射数据
// ============================================================
// 平行结构（与 upstream.js 完全一致）：
//   categories: { [trackId]: Track }   ← 8 赛道
//   companies:  { [companyId]: Company } ← 15 公司
//
// 中游视角：L4 Model + AI 开发工具平台 在中国 A/H 股的映射
//   行业大模型：视觉/语音/金融/政务/智能座舱
//   端侧与工具：端侧 SoC、Coding Agent、数据平台
//
// 加载顺序：... → model-platform.js → filters.js → model-platform-view.js
// 暴露：window.MODEL_PLATFORM_DATA
// ============================================================

(function () {
  'use strict';

  const categoryGroups = Object.freeze([
    { id: '行业模型', zh: '行业大模型', en: 'Industry Foundation Models', tone: 'crimson' },
    { id: '端侧与工具', zh: '端侧AI与开发工具', en: 'Edge AI & Dev Tools', tone: 'moss'    }
  ]);

  // substage = 商业化阶段：
  //   L1 = 研发期（实验室/中试，未商用）
  //   L2 = 早期商用（首批客户，ARR 50M-200M）
  //   L3 = 规模商用（ARR>200M，多行业落地）

  const categories = {
    // ═══ 行业大模型 (5) ═══
    cv_model: {
      id: 'cv_model', name: '视觉大模型 / 多模态', group: '行业模型', substage: 'L2',
      elasticity: 1.95,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 25, high: 50, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '商汤/云从/依图；城市场景与金融场景落地',
      companies: ['co_m01', 'co_m02']
    },
    speech_model: {
      id: 'speech_model', name: '语音大模型 / 翻译', group: '行业模型', substage: 'L3',
      elasticity: 2.20,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 30, high: 60, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '科大讯飞；语音+翻译+教育 AI 闭环；学习机毛利率 50%+',
      companies: ['co_m03']
    },
    fin_model: {
      id: 'fin_model', name: '金融 / 投研大模型', group: '行业模型', substage: 'L2',
      elasticity: 2.45,
      currentOutput: { low: 4, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 50, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '同花顺 i 问财 / 东方财富 Choice；恒生电子/金桥信息布局',
      companies: ['co_m04', 'co_m05']
    },
    gov_model: {
      id: 'gov_model', name: '政务 / 法务大模型', group: '行业模型', substage: 'L2',
      elasticity: 1.80,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 20, high: 40, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '金桥信息（法律）/ 太极股份（政务）；私有化部署为主',
      companies: ['co_m06', 'co_m07']
    },
    auto_model: {
      id: 'auto_model', name: '智能座舱 / 端侧大模型', group: '行业模型', substage: 'L2',
      elasticity: 2.85,
      currentOutput: { low: 12, high: 20, unit: '亿美元' },
      target2030: { low: 50, high: 90, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '中科创达/虹软/恒玄；高通 8295 / 联发科天玑座舱平台',
      companies: ['co_m08', 'co_m09']
    },

    // ═══ 端侧与工具 (3) ═══
    edge_soc: {
      id: 'edge_soc', name: '端侧 AI SoC', group: '端侧与工具', substage: 'L2',
      elasticity: 2.55,
      currentOutput: { low: 9, high: 14, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '恒玄/瑞芯微/全志/晶晨；耳机/音箱/AI 眼镜 SoC',
      companies: ['co_m10', 'co_m11', 'co_m12']
    },
    coding_agent: {
      id: 'coding_agent', name: 'Coding Agent / DevOps', group: '端侧与工具', substage: 'L2',
      elasticity: 3.20,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 35, high: 70, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '腾讯/字节/阿里内部 Coding Agent；福昕/泛微等加入赛道',
      companies: ['co_m13', 'co_m14']
    },
    data_analytics: {
      id: 'data_analytics', name: 'AI 商业智能 / BI', group: '端侧与工具', substage: 'L2',
      elasticity: 1.90,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 18, high: 35, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '帆软/永洪；ChatBI 让业务人员自助取数',
      companies: ['co_m15']
    }
  };

  const companies = {

    // ═══════════════════════════════════════════════════════
    // 行业模型 — 视觉大模型 / 多模态 (cv_model) L2
    // ═══════════════════════════════════════════════════════
    co_m01: {
      id: 'co_m01', ticker: '002230.SZ', name: '科大讯飞', market: 'A股',
      substage: 'L3', categories: ['cv_model', 'speech_model'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.65, dol: 1.92 },
      note: '星火大模型+教育 AI 双闭环；学习机毛利率 50%+'
    },
    co_m02: {
      id: 'co_m02', ticker: '688088.SH', name: '虹软科技', market: 'A股',
      substage: 'L2', categories: ['cv_model', 'auto_model'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.85, dol: 1.72 },
      note: '视觉算法+手机 AI/车载视觉龙头；端侧计算机视觉'
    },

    // ═══════════════════════════════════════════════════════
    // 行业模型 — 语音大模型 / 翻译 (speech_model) L3
    // ═══════════════════════════════════════════════════════
    co_m03: {
      id: 'co_m03', ticker: '002230.SZ', name: '科大讯飞（语音线）', market: 'A股',
      substage: 'L3', categories: ['speech_model'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.45, dol: 1.92 },
      note: '同 co_m01；本条专指讯飞语音翻译线'
    },

    // ═══════════════════════════════════════════════════════
    // 行业模型 — 金融 / 投研大模型 (fin_model) L2
    // ═══════════════════════════════════════════════════════
    co_m04: {
      id: 'co_m04', ticker: '300033.SZ', name: '同花顺', market: 'A股',
      substage: 'L2', categories: ['fin_model'],
      financials: { fixedCostRatio: 0.30, aiRevenuePct: 0.40, dol: 1.45 },
      note: 'i 问财 + 研报 AI 摘要；券商接入费 + 个人订阅双轮'
    },
    co_m05: {
      id: 'co_m05', ticker: '600570.SH', name: '恒生电子', market: 'A股',
      substage: 'L2', categories: ['fin_model'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.30, dol: 2.17 },
      note: 'LightGPT 金融大模型；券商核心系统供应商；投顾 AI 中台'
    },

    // ═══════════════════════════════════════════════════════
    // 行业模型 — 政务 / 法务大模型 (gov_model) L2
    // ═══════════════════════════════════════════════════════
    co_m06: {
      id: 'co_m06', ticker: '603918.SH', name: '金桥信息', market: 'A股',
      substage: 'L2', categories: ['gov_model'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.50, dol: 1.92 },
      note: '法院/律所 SaaS + 浩律 AI 法律大模型'
    },
    co_m07: {
      id: 'co_m07', ticker: '002368.SZ', name: '太极股份', market: 'A股',
      substage: 'L2', categories: ['gov_model'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.25, dol: 1.92 },
      note: '政务云+大模型私有化部署；发改委/国资委系统集成'
    },

    // ═══════════════════════════════════════════════════════
    // 行业模型 — 智能座舱 / 端侧大模型 (auto_model) L2
    // ═══════════════════════════════════════════════════════
    co_m08: {
      id: 'co_m08', ticker: '300496.SZ', name: '中科创达', market: 'A股',
      substage: 'L2', categories: ['auto_model'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.70, dol: 2.17 },
      note: '智能座舱 OS 龙头；高通/联发科深度合作；魔方大模型上车'
    },
    co_m09: {
      id: 'co_m09', ticker: '688088.SH', name: '虹软科技（车载线）', market: 'A股',
      substage: 'L2', categories: ['auto_model'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.60, dol: 1.72 },
      note: '同 co_m02；本条专指车载视觉/座舱监控'
    },

    // ═══════════════════════════════════════════════════════
    // 端侧与工具 — 端侧 AI SoC (edge_soc) L2
    // ═══════════════════════════════════════════════════════
    co_m10: {
      id: 'co_m10', ticker: '688608.SH', name: '恒玄科技', market: 'A股',
      substage: 'L2', categories: ['edge_soc'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.85, dol: 1.54 },
      note: 'AI 耳机 SoC 龙头；BES2800 系列供货华为/小米；BLE+AI 集成'
    },
    co_m11: {
      id: 'co_m11', ticker: '603893.SH', name: '瑞芯微', market: 'A股',
      substage: 'L2', categories: ['edge_soc'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.70, dol: 1.72 },
      note: 'RK3588 端侧 AI；AI 玩具/视觉门锁/工业 HMI'
    },
    co_m12: {
      id: 'co_m12', ticker: '300458.SZ', name: '全志科技', market: 'A股',
      substage: 'L2', categories: ['edge_soc'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.55, dol: 1.92 },
      note: 'T 系列 SoC；AI 词典笔/智能音箱/学习机'
    },

    // ═══════════════════════════════════════════════════════
    // 端侧与工具 — Coding Agent (coding_agent) L2
    // ═══════════════════════════════════════════════════════
    co_m13: {
      id: 'co_m13', ticker: '603189.SH', name: '福昕软件', market: 'A股',
      substage: 'L2', categories: ['coding_agent'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.30, dol: 2.17 },
      note: 'PDF + AI 文档协同；福昕 AI 助手；订阅+API 双轨'
    },
    co_m14: {
      id: 'co_m14', ticker: '002230.SZ', name: '科大讯飞（办公 Coding）', market: 'A股',
      substage: 'L2', categories: ['coding_agent'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.15, dol: 1.92 },
      note: '星火代码助手；与 vscode/jetbrains 集成'
    },

    // ═══════════════════════════════════════════════════════
    // 端侧与工具 — AI 商业智能 / BI (data_analytics) L2
    // ═══════════════════════════════════════════════════════
    co_m15: {
      id: 'co_m15', ticker: '688066.SH', name: '普元信息', market: 'A股',
      substage: 'L2', categories: ['data_analytics'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.35, dol: 2.17 },
      note: 'ChatBI+指标平台；金融/运营商企业级 BI 替代帆软'
    }
  };

  // ── 辅助方法 ────────────────────────────────────────────

  function getCompaniesByCategory(catId) {
    const cat = categories[catId];
    if (!cat) return [];
    return cat.companies.map(cid => companies[cid]).filter(Boolean);
  }

  function getCategoriesByCompany(coId) {
    const co = companies[coId];
    if (!co) return [];
    return co.categories.map(cid => categories[cid]).filter(Boolean);
  }

  function getCompaniesByMarket(market) {
    return Object.values(companies).filter(c => c.market === market);
  }

  function getCompaniesBySubstage(stage) {
    return Object.values(companies).filter(c => c.substage === stage);
  }

  function getCategoryGroupSummary() {
    const summary = {};
    for (const g of categoryGroups) {
      summary[g.id] = { zh: g.zh, en: g.en, tone: g.tone, count: 0, categories: [] };
    }
    for (const [id, cat] of Object.entries(categories)) {
      if (summary[cat.group]) {
        summary[cat.group].count++;
        summary[cat.group].categories.push(id);
      }
    }
    return summary;
  }

  function getStats() {
    const catIds = Object.keys(categories);
    const coIds = Object.keys(companies);
    const l3Cats = catIds.filter(id => categories[id].substage === 'L3').length;
    const l2Cats = catIds.filter(id => categories[id].substage === 'L2').length;
    const l1Cats = catIds.filter(id => categories[id].substage === 'L1').length;
    const mappedCats = catIds.filter(id => categories[id].companies.length > 0).length;
    const aShare = coIds.filter(id => companies[id].market === 'A股').length;
    const hkShare = coIds.filter(id => companies[id].market === '港股').length;

    const calibrated = catIds
      .map(id => categories[id].elasticity)
      .filter(e => e !== null && e > 0);
    const avgElasticity = calibrated.length > 0
      ? calibrated.reduce((s, e) => s + e, 0) / calibrated.length
      : null;

    return {
      totalCategories: catIds.length,
      mappedCategories: mappedCats,
      totalCompanies: coIds.length,
      aShare, hkShare,
      l3Categories: l3Cats, l2Categories: l2Cats, l1Categories: l1Cats,
      avgElasticity,
      calibratedCount: calibrated.length,
      groups: getCategoryGroupSummary()
    };
  }

  function search(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return { categories: Object.keys(categories), companies: Object.keys(companies) };
    const matchedCats = [];
    for (const [id, cat] of Object.entries(categories)) {
      if (cat.name.toLowerCase().includes(q) || cat.id.includes(q) || (cat.note && cat.note.toLowerCase().includes(q))) {
        matchedCats.push(id);
      }
    }
    const matchedCos = [];
    for (const [id, co] of Object.entries(companies)) {
      if (co.name.toLowerCase().includes(q) || co.ticker.toLowerCase().includes(q) || (co.note && co.note.toLowerCase().includes(q))) {
        matchedCos.push(id);
      }
    }
    return { categories: matchedCats, companies: matchedCos };
  }

  function validate() {
    const errors = [];
    const warnings = [];

    for (const [coId, co] of Object.entries(companies)) {
      for (const catId of co.categories) {
        if (!categories[catId]) {
          errors.push(`公司 ${co.name} (${coId}) 引用了不存在的赛道: ${catId}`);
        }
      }
    }
    for (const [catId, cat] of Object.entries(categories)) {
      for (const coId of cat.companies) {
        if (!companies[coId]) {
          errors.push(`赛道 ${cat.name} (${catId}) 引用了不存在的公司: ${coId}`);
        }
        if (companies[coId] && !companies[coId].categories.includes(catId)) {
          warnings.push(`赛道 ${catId} 引用了公司 ${coId}，但公司 ${coId} 未反向引用该赛道`);
        }
      }
    }

    const validGroups = new Set(categoryGroups.map(g => g.id));
    for (const [catId, cat] of Object.entries(categories)) {
      if (!validGroups.has(cat.group)) {
        errors.push(`赛道 ${cat.name} (${catId}) 的组别 ${cat.group} 不在预定义组别中`);
      }
    }

    const validStages = new Set(['L1', 'L2', 'L3']);
    for (const [catId, cat] of Object.entries(categories)) {
      if (!validStages.has(cat.substage)) {
        errors.push(`赛道 ${cat.name} (${catId}) substage ${cat.substage} 无效`);
      }
    }
    for (const [coId, co] of Object.entries(companies)) {
      if (!validStages.has(co.substage)) {
        errors.push(`公司 ${co.name} (${coId}) substage ${co.substage} 无效`);
      }
    }

    for (const [catId, cat] of Object.entries(categories)) {
      if (cat.elasticity !== null && cat.elasticity !== undefined) {
        if (cat.elasticity < 0.5 || cat.elasticity > 7.0) {
          warnings.push(`赛道 ${cat.name} (${catId}) 弹性 ${cat.elasticity} 超出 [0.5, 7.0] 范围`);
        }
      }
    }

    const validMoat = new Set(['strong', 'medium', 'weak']);
    const validPricing = new Set(['expanding', 'flat', 'compressing']);
    for (const [catId, cat] of Object.entries(categories)) {
      if (!cat.moat || !validMoat.has(cat.moat)) {
        errors.push(`赛道 ${cat.name} (${catId}) moat 缺失或非法: "${cat.moat}"`);
      }
      if (!cat.pricingPower || !validPricing.has(cat.pricingPower)) {
        errors.push(`赛道 ${cat.name} (${catId}) pricingPower 缺失或非法: "${cat.pricingPower}"`);
      }
    }

    if (errors.length > 0) {
      console.error('[MODEL_PLATFORM_DATA] 数据校验失败:', errors);
    } else if (warnings.length > 0) {
      console.warn('[MODEL_PLATFORM_DATA] 数据校验警告:', warnings);
    } else {
      console.log('[MODEL_PLATFORM_DATA] ✓ 数据校验通过 — %d 赛道, %d 公司',
        Object.keys(categories).length, Object.keys(companies).length);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  function getCategoriesByMoat(level) {
    return Object.entries(categories).filter(([, c]) => c.moat === level).map(([id]) => id);
  }

  function getCategoriesByPricing(power) {
    return Object.entries(categories).filter(([, c]) => c.pricingPower === power).map(([id]) => id);
  }

  // ── 导出 ────────────────────────────────────────────────
  window.MODEL_PLATFORM_DATA = {
    get categories() { return categories; },
    get companies() { return companies; },
    get categoryGroups() { return categoryGroups; },

    meta: Object.freeze({
      lastUpdated: '2026-07-07T10:00:00+08:00',
      version: '0.1.0',
      fields: {
        moat:         ['strong', 'medium', 'weak'],
        pricingPower: ['expanding', 'flat', 'compressing'],
      },
      totalCategories: Object.keys(categories).length,
      totalCompanies: Object.keys(companies).length,
      sources: ['券商研报', '公司年报主营业务', 'Vibe-Trading web_search 交叉验证'],
      methodology: 'docs/model-platform-methodology.md',
      parallelTo: 'src/upstream.js'
    }),

    getCategoriesByMoat,
    getCategoriesByPricing,
    getCategoryGroupSummary,

    getCompaniesByCategory,
    getCategoriesByCompany,
    getCompaniesByMarket,
    getCompaniesBySubstage,
    getStats,
    search,
    validate
  };

})();
