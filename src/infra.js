// ============================================================
// infra.js — AI 中游·算力基础设施 赛道×公司映射数据
// ============================================================
// 平行结构（与 upstream.js 完全一致）：
//   categories: { [trackId]: Track }   ← 7 赛道
//   companies:  { [companyId]: Company } ← 15 公司
//
// 中游视角：L3 Computing Infrastructure 在中国 A/H 股的映射
//   算力运营：云转售、GPU 时租、推理芯片
//   数字基建：智算 IDC、智算网络、光模块、液冷
//
// 加载顺序：data.js → sankey.js → upstream.js → infra.js → ...
//          → filters.js → infra-view.js
// 暴露：window.INFRA_DATA
// ============================================================

(function () {
  'use strict';

  // ── 赛道分组 ─────────────────────────────────────────────
  const categoryGroups = Object.freeze([
    { id: '算力运营', zh: '算力运营', en: 'Compute Operations', tone: 'amber'    },
    { id: '数字基建', zh: '数字基建', en: 'Digital Infrastructure', tone: 'slate'   }
  ]);

  // 注：substage 在中游算力基础设施 = 「运营成熟度」：
  //   L1 = 建设期（在建/预收，利用率<30%）
  //   L2 = 爬坡期（部分投产，利用率 30-70%）
  //   L3 = 成熟运营（满载/接近满载，利用率>70%）

  const categories = {
    // ═══ 算力运营 (3) ═══
    cloud_resell: {
      id: 'cloud_resell', name: '云转售 / 模型 API 分发', group: '算力运营', substage: 'L3',
      elasticity: 1.85,
      currentOutput: { low: 35, high: 50, unit: '亿美元' },
      target2030: { low: 90, high: 140, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '云厂商把 L4 模型 OpenAI/Anthropic 通过 Bedrock/Vertex 包装；纯 API 转售毛利 5-15%',
      companies: ['co_i01', 'co_i02', 'co_i03']
    },
    neocloud: {
      id: 'neocloud', name: 'Neocloud / GPU 时租', group: '算力运营', substage: 'L2',
      elasticity: 3.20,
      currentOutput: { low: 8, high: 15, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'weak', pricingPower: 'compressing',
      note: 'CoreWeave* / Lambda* / Crusoe* 模式；H100 时租从 $8/hr 跌至 $2.5/hr',
      companies: ['co_i04', 'co_i05']
    },
    inference_chip: {
      id: 'inference_chip', name: '推理专用芯片', group: '算力运营', substage: 'L2',
      elasticity: 2.85,
      currentOutput: { low: 12, high: 20, unit: '亿美元' },
      target2030: { low: 60, high: 100, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '训练：推理 ≈ 30:70；推理芯片抢 NVIDIA 份额的窗口期',
      companies: ['co_i06']
    },

    // ═══ 数字基建 (4) ═══
    ai_idc: {
      id: 'ai_idc', name: 'AI 数据中心 / 智算 IDC', group: '数字基建', substage: 'L3',
      elasticity: 1.72,
      currentOutput: { low: 20, high: 35, unit: '亿美元' },
      target2030: { low: 70, high: 110, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '机柜租赁：从 4.4kW 升至 30-100kW 单柜，PUE 1.2 以下',
      companies: ['co_i07', 'co_i08', 'co_i09']
    },
    smart_network: {
      id: 'smart_network', name: 'AI 智算网络 / 交换机', group: '数字基建', substage: 'L3',
      elasticity: 1.65,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      moat: 'weak', pricingPower: 'compressing',
      note: '51.2T 交换机 + 800G 光模块；AI 集群 SD-DC 渗透',
      companies: ['co_i10', 'co_i11']
    },
    optical_module: {
      id: 'optical_module', name: '800G/1.6T 光模块', group: '数字基建', substage: 'L2',
      elasticity: 2.95,
      currentOutput: { low: 18, high: 28, unit: '亿美元' },
      target2030: { low: 70, high: 120, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: 'GPU:800G 光模块 ≈ 1:8；中际旭创/新易盛已进入 GB200 供应链',
      companies: ['co_i12', 'co_i13']
    },
    liquid_cooling: {
      id: 'liquid_cooling', name: '液冷 / 数据中心散热', group: '数字基建', substage: 'L3',
      elasticity: 2.45,
      currentOutput: { low: 10, high: 16, unit: '亿美元' },
      target2030: { low: 35, high: 55, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: 'GB200 全液冷；英维克/曙光数创；风冷向冷板+浸没式切换',
      companies: ['co_i14', 'co_i15']
    }
  };

  // ── 公司数据（从 downstream.js 迁移）────────────────────
  const companies = {

    // ═══════════════════════════════════════════════════════
    // 算力运营 — 云转售 / API 分发 (cloud_resell) L3
    // ═══════════════════════════════════════════════════════
    co_i01: {
      id: 'co_i01', ticker: '9988.HK', name: '阿里巴巴-W', market: '港股',
      substage: 'L3', categories: ['cloud_resell'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.18, dol: 2.50 },
      note: '阿里云 + 通义大模型 API；FY2026 云业务 AI 收入预计 +80%；云转售毛利 15-20%'
    },
    co_i02: {
      id: 'co_i02', ticker: '0700.HK', name: '腾讯控股', market: '港股',
      substage: 'L3', categories: ['cloud_resell'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.10, dol: 1.92 },
      note: '腾讯云 + 混元大模型；微信生态内分销；2026 资本开支 +30% 用于 GPU 采购'
    },
    co_i03: {
      id: 'co_i03', ticker: '600588.SH', name: '用友网络', market: 'A股',
      substage: 'L3', categories: ['cloud_resell'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.35, dol: 2.17 },
      note: 'BIP 平台+企业大模型 Yonyou BIP AI；私有化部署+模型转售分仓'
    },

    // ═══════════════════════════════════════════════════════
    // 算力运营 — Neocloud / GPU 时租 (neocloud) L2
    // ═══════════════════════════════════════════════════════
    co_i04: {
      id: 'co_i04', ticker: '300383.SZ', name: '光环新网', market: 'A股',
      substage: 'L2', categories: ['neocloud', 'ai_idc'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.40, dol: 2.78 },
      note: '从 IDC 转型智算+GPU 时租；与商汤/字节绑定；房山数据中心扩容'
    },
    co_i05: {
      id: 'co_i05', ticker: '002335.SZ', name: '科华数据', market: 'A股',
      substage: 'L2', categories: ['neocloud'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.30, dol: 2.44 },
      note: 'UPS+IDC+智算云；与火山引擎合作 GPU 时租；H100 上架率领先'
    },

    // ═══════════════════════════════════════════════════════
    // 算力运营 — 推理专用芯片 (inference_chip) L2
    // ═══════════════════════════════════════════════════════
    co_i06: {
      id: 'co_i06', ticker: '688256.SH', name: '寒武纪', market: 'A股',
      substage: 'L2', categories: ['inference_chip'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.95, dol: 1.72 },
      note: '思元 590 推理芯片抢 NVIDIA 份额；2025 营收 65 亿同比 +560%'
    },

    // ═══════════════════════════════════════════════════════
    // 数字基建 — AI 数据中心 / 智算 IDC (ai_idc) L3
    // ═══════════════════════════════════════════════════════
    co_i07: {
      id: 'co_i07', ticker: '300017.SZ', name: '网宿科技', market: 'A股',
      substage: 'L3', categories: ['ai_idc'],
      financials: { fixedCostRatio: 0.65, aiRevenuePct: 0.25, dol: 3.13 },
      note: 'CDN 转型智算 IDC；上海嘉定 AI 智算中心 1024 卡 H800 集群'
    },
    co_i08: {
      id: 'co_i08', ticker: '603881.SH', name: '数据港', market: 'A股',
      substage: 'L3', categories: ['ai_idc'],
      financials: { fixedCostRatio: 0.70, aiRevenuePct: 0.50, dol: 3.57 },
      note: '阿里巴巴定制 IDC；张北/南通/深圳数据中心；签约年限 8-10 年'
    },
    co_i09: {
      id: 'co_i09', ticker: '002123.SZ', name: '梦网科技', market: 'A股',
      substage: 'L3', categories: ['ai_idc'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.20, dol: 2.44 },
      note: '智算云服务+鸿蒙生态；吉林/贵州数据中心'
    },

    // ═══════════════════════════════════════════════════════
    // 数字基建 — AI 智算网络 / 交换机 (smart_network) L3
    // ═══════════════════════════════════════════════════════
    co_i10: {
      id: 'co_i10', ticker: '300308.SZ', name: '中际旭创', market: 'A股',
      substage: 'L3', categories: ['smart_network', 'optical_module'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.85, dol: 2.17 },
      note: '800G/1.6T 光模块全球龙头；GB200 NVL72 核心供应商'
    },
    co_i11: {
      id: 'co_i11', ticker: '002463.SZ', name: '沪电股份', market: 'A股',
      substage: 'L3', categories: ['smart_network'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.70, dol: 2.44 },
      note: '高端 PCB（112G/224G PAM4）；AI 交换机/服务器主板供应'
    },

    // ═══════════════════════════════════════════════════════
    // 数字基建 — 800G/1.6T 光模块 (optical_module) L2
    // ═══════════════════════════════════════════════════════
    co_i12: {
      id: 'co_i12', ticker: '300502.SZ', name: '新易盛', market: 'A股',
      substage: 'L2', categories: ['optical_module'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.90, dol: 1.92 },
      note: '800G 光模块批量出货；与 NVIDIA GB200 配套；2026 营收预计翻倍'
    },
    co_i13: {
      id: 'co_i13', ticker: '300394.SZ', name: '天孚通信', market: 'A股',
      substage: 'L2', categories: ['optical_module'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.75, dol: 1.72 },
      note: '光器件无源平台；CPO/LPO 路线卡位'
    },

    // ═══════════════════════════════════════════════════════
    // 数字基建 — 液冷 / 数据中心散热 (liquid_cooling) L3
    // ═══════════════════════════════════════════════════════
    co_i14: {
      id: 'co_i14', ticker: '002837.SZ', name: '英维克', market: 'A股',
      substage: 'L3', categories: ['liquid_cooling'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.55, dol: 1.72 },
      note: '精密空调+液冷全栈；GB200 全液冷 CDN 核心供应商'
    },
    co_i15: {
      id: 'co_i15', ticker: '603803.SH', name: '曙光数创', market: 'A股',
      substage: 'L3', categories: ['liquid_cooling'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.85, dol: 1.92 },
      note: '中科曙光子公司；浸没式液冷领先；与字节/腾讯签长约'
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
      console.error('[INFRA_DATA] 数据校验失败:', errors);
    } else if (warnings.length > 0) {
      console.warn('[INFRA_DATA] 数据校验警告:', warnings);
    } else {
      console.log('[INFRA_DATA] ✓ 数据校验通过 — %d 赛道, %d 公司',
        Object.keys(categories).length, Object.keys(companies).length);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  function getCategoriesByMoat(level) {
    return Object.entries(categories)
      .filter(([, c]) => c.moat === level)
      .map(([id]) => id);
  }

  function getCategoriesByPricing(power) {
    return Object.entries(categories)
      .filter(([, c]) => c.pricingPower === power)
      .map(([id]) => id);
  }

  // ── 导出 ────────────────────────────────────────────────
  window.INFRA_DATA = {
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
      methodology: 'docs/infra-methodology.md',
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
