// ============================================================
// apps.js — AI 下游·应用与服务 赛道×公司映射数据
// ============================================================
// 平行结构（与 upstream.js 完全一致）：
//   categories: { [trackId]: Track }   ← 14 赛道
//   companies:  { [companyId]: Company } ← 25 公司
//
// 下游视角：L5 Application 的数字应用部分
//   B2B 企业应用：办公/创作/CRM/协作/法律/医疗/教育/工业/安全
//   B2C 消费平台：短视频/广告/社交/C端订阅/游戏
//
// 加载顺序：... → apps.js → filters.js → apps-view.js
// 暴露：window.APPS_DATA
// ============================================================

(function () {
  'use strict';

  const categoryGroups = Object.freeze([
    { id: 'B2B应用', zh: 'B2B 企业应用', en: 'B2B Applications', tone: 'slate' },
    { id: 'B2C平台', zh: 'B2C 消费平台', en: 'B2C Platforms', tone: 'amber' }
  ]);

  // substage = 商业化阶段（与下游方法论一致）：
  //   L1 = Pre-Revenue（仅 PO/POC，ARR<50M USD）
  //   L2 = Early Commercial（首批 ARR 50-200M，毛利>30%）
  //   L3 = Scale-Profit（ARR>200M，毛利>50%，已盈利或接近）

  const categories = {
    // ═══ B2B 企业应用 (9) ═══
    office_suite: {
      id: 'office_suite', name: '办公套件 / AI 助理', group: 'B2B应用', substage: 'L3',
      elasticity: 2.10,
      currentOutput: { low: 15, high: 25, unit: '亿美元' },
      target2030: { low: 50, high: 90, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '金山办公 WPS AI；订阅价从 99 元/年升至 268 元/年的 AI 升级',
      companies: ['co_a01']
    },
    design_creative: {
      id: 'design_creative', name: '设计 / 多模态创作', group: 'B2B应用', substage: 'L2',
      elasticity: 2.65,
      currentOutput: { low: 7, high: 12, unit: '亿美元' },
      target2030: { low: 30, high: 55, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '美图/视觉中国/万兴科技；订阅制 vs 一次性买断',
      companies: ['co_a02', 'co_a03']
    },
    crm_erp_ai: {
      id: 'crm_erp_ai', name: 'CRM / ERP AI 嵌入', group: 'B2B应用', substage: 'L2',
      elasticity: 1.75,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 28, high: 50, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: 'Salesforce Agentforce 模板；金蝶/用友纷纷嵌入 AI',
      companies: ['co_a04', 'co_a05']
    },
    collab_suite: {
      id: 'collab_suite', name: '协作 / 通信 AI', group: 'B2B应用', substage: 'L3',
      elasticity: 2.00,
      currentOutput: { low: 10, high: 16, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '钉钉/飞书/企微 AI 升级；Monolith 文档搜索+智能总结',
      companies: ['co_a06']
    },
    legal_saas: {
      id: 'legal_saas', name: '法律科技 SaaS', group: 'B2B应用', substage: 'L2',
      elasticity: 2.75,
      currentOutput: { low: 2, high: 4, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: 'Harvey* 客户为律所/500 强法务；金桥信息（浩律科技）布局',
      companies: ['co_a07']
    },
    medical_saas: {
      id: 'medical_saas', name: '医疗 AI SaaS / CDSS', group: 'B2B应用', substage: 'L2',
      elasticity: 2.40,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 25, high: 50, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '医联/智云健康/盈康生命；医院端影像+病历解析',
      companies: ['co_a08']
    },
    edu_saas: {
      id: 'edu_saas', name: '教育 AI / 自适应学习', group: 'B2B应用', substage: 'L3',
      elasticity: 1.95,
      currentOutput: { low: 10, high: 18, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '科大讯飞/网易有道/好未来；学习机提价 50%+',
      companies: ['co_a09']
    },
    industrial_ai: {
      id: 'industrial_ai', name: '工业 AI / 视觉检测', group: 'B2B应用', substage: 'L3',
      elasticity: 1.65,
      currentOutput: { low: 12, high: 20, unit: '亿美元' },
      target2030: { low: 40, high: 70, unit: '亿美元' },
      moat: 'weak', pricingPower: 'flat',
      note: '创新奇智/思谋/凌云光；视觉检测+设备预测性维护',
      companies: ['co_a10']
    },
    security_ai: {
      id: 'security_ai', name: '网络安全 AI', group: 'B2B应用', substage: 'L3',
      elasticity: 1.85,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 22, high: 40, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '深信服/奇安信/安恒；SOC 智能化+告警降噪',
      companies: ['co_a11']
    },

    // ═══ B2C 消费平台 (5) ═══
    short_video: {
      id: 'short_video', name: '短视频 / 内容平台', group: 'B2C平台', substage: 'L3',
      elasticity: 1.70,
      currentOutput: { low: 30, high: 45, unit: '亿美元' },
      target2030: { low: 70, high: 110, unit: '亿美元' },
      moat: 'strong', pricingPower: 'flat',
      note: '字节/快手 AI 创作工具降低 UGC 门槛；CPM 提升 10-15%',
      companies: ['co_a20']
    },
    ad_tech: {
      id: 'ad_tech', name: '广告 / 营销 AI', group: 'B2C平台', substage: 'L3',
      elasticity: 1.55,
      currentOutput: { low: 22, high: 35, unit: '亿美元' },
      target2030: { low: 55, high: 90, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '蓝色光标/利欧股份；AI 素材生成+精准投放',
      companies: ['co_a21', 'co_a22']
    },
    social_comm: {
      id: 'social_comm', name: '社交 / 通信 AI', group: 'B2C平台', substage: 'L3',
      elasticity: 1.50,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      moat: 'medium', pricingPower: 'compressing',
      note: '知乎/值得买；AI 摘要+虚拟陪伴',
      companies: ['co_a23']
    },
    consumer_ai_sub: {
      id: 'consumer_ai_sub', name: 'C 端 AI 订阅 / Pro 版', group: 'B2C平台', substage: 'L2',
      elasticity: 3.85,
      currentOutput: { low: 12, high: 22, unit: '亿美元' },
      target2030: { low: 80, high: 150, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: 'A 股映射：万兴/美图 等 C 端订阅产品；OpenAI/Anthropic 主导海外',
      companies: ['co_a24', 'co_a25']
    },
    gaming_ai: {
      id: 'gaming_ai', name: '游戏 / 虚拟人 AI', group: 'B2C平台', substage: 'L2',
      elasticity: 1.80,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 22, high: 40, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '腾讯/网易/米哈游；NPC AI + 美术生成',
      companies: ['co_a26']
    }
  };

  const companies = {

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 办公套件 (office_suite) L3
    // ═══════════════════════════════════════════════════════
    co_a01: {
      id: 'co_a01', ticker: '688111.SH', name: '金山办公', market: 'A股',
      substage: 'L3', categories: ['office_suite'],
      financials: { fixedCostRatio: 0.30, aiRevenuePct: 0.25, dol: 1.39 },
      note: 'WPS AI 商业化提速；订阅价 99→268 元/年；ARR 占比 60%+'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 设计/多模态创作 (design_creative) L2
    // ═══════════════════════════════════════════════════════
    co_a02: {
      id: 'co_a02', ticker: '1357.HK', name: '美图公司', market: '港股',
      substage: 'L2', categories: ['design_creative', 'consumer_ai_sub'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.70, dol: 1.54 },
      note: '美图秀秀/设计室 AI 订阅；2025 VIP 订阅收入 12 亿同比 +50%'
    },
    co_a03: {
      id: 'co_a03', ticker: '300624.SZ', name: '万兴科技', market: 'A股',
      substage: 'L2', categories: ['design_creative', 'consumer_ai_sub'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.80, dol: 1.72 },
      note: 'Filmora/万兴喵影；海外 C 端订阅；AI 剪辑+AI 配音'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — CRM/ERP AI (crm_erp_ai) L2
    // ═══════════════════════════════════════════════════════
    co_a04: {
      id: 'co_a04', ticker: '0268.HK', name: '金蝶国际', market: '港股',
      substage: 'L2', categories: ['crm_erp_ai'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.25, dol: 1.92 },
      note: '金蝶云·苍穹 + 星空 AI Agent；SaaS 订阅营收占比 60%+'
    },
    co_a05: {
      id: 'co_a05', ticker: '600588.SH', name: '用友网络（ERP AI 线）', market: 'A股',
      substage: 'L2', categories: ['crm_erp_ai'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.20, dol: 2.17 },
      note: 'BIP AI 嵌入 YonBIP 财务/HR/供应链模块；云转售见 infra tab'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 协作/通信 AI (collab_suite) L3
    // ═══════════════════════════════════════════════════════
    co_a06: {
      id: 'co_a06', ticker: '002230.SZ', name: '科大讯飞（听见线）', market: 'A股',
      substage: 'L3', categories: ['collab_suite'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.92 },
      note: '讯飞听见/会议 AI 助手；订阅+API 双模式；月活 1500 万'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 法律科技 SaaS (legal_saas) L2
    // ═══════════════════════════════════════════════════════
    co_a07: {
      id: 'co_a07', ticker: '603918.SH', name: '金桥信息（法律线）', market: 'A股',
      substage: 'L2', categories: ['legal_saas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.40, dol: 1.92 },
      note: '法院/律所 SaaS + 浩律 AI 法律大模型；政务模型见 model-platform tab'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 医疗 AI SaaS (medical_saas) L2
    // ═══════════════════════════════════════════════════════
    co_a08: {
      id: 'co_a08', ticker: '300253.SZ', name: '卫宁健康', market: 'A股',
      substage: 'L2', categories: ['medical_saas'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.20, dol: 1.54 },
      note: '医院 HIS + WiNEX AI 医生助手；4000+ 医院接入'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 教育 AI (edu_saas) L3
    // ═══════════════════════════════════════════════════════
    co_a09: {
      id: 'co_a09', ticker: '002230.SZ', name: '科大讯飞（教育线）', market: 'A股',
      substage: 'L3', categories: ['edu_saas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.50, dol: 1.92 },
      note: '学习机+智慧课堂；星火大模型见 model-platform tab'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 工业 AI (industrial_ai) L3
    // ═══════════════════════════════════════════════════════
    co_a10: {
      id: 'co_a10', ticker: '300083.SZ', name: '劲拓股份', market: 'A股',
      substage: 'L2', categories: ['industrial_ai'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.40, dol: 1.92 },
      note: '工业视觉+回流焊设备；半导体封装贴片'
    },

    // ═══════════════════════════════════════════════════════
    // B2B应用 — 网络安全 AI (security_ai) L3
    // ═══════════════════════════════════════════════════════
    co_a11: {
      id: 'co_a11', ticker: '300454.SZ', name: '深信服', market: 'A股',
      substage: 'L3', categories: ['security_ai'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.30, dol: 1.72 },
      note: '安全 GPT + 安全运营平台；订阅模式转型'
    },

    // ═══════════════════════════════════════════════════════
    // B2C平台 — 短视频 (short_video) L3
    // ═══════════════════════════════════════════════════════
    co_a20: {
      id: 'co_a20', ticker: '1024.HK', name: '快手-W', market: '港股',
      substage: 'L3', categories: ['short_video'],
      financials: { fixedCostRatio: 0.30, aiRevenuePct: 0.35, dol: 1.39 },
      note: '可灵 AI 视频生成；电商+广告 AI 投放；AIGC 创作者渗透率 30%+'
    },

    // ═══════════════════════════════════════════════════════
    // B2C平台 — 广告/营销 AI (ad_tech) L3
    // ═══════════════════════════════════════════════════════
    co_a21: {
      id: 'co_a21', ticker: '300058.SZ', name: '蓝色光标', market: 'A股',
      substage: 'L3', categories: ['ad_tech'],
      financials: { fixedCostRatio: 0.20, aiRevenuePct: 0.30, dol: 1.25 },
      note: 'AI 营销全栈；BlueFocus 蓝标智达；出海+国内双线'
    },
    co_a22: {
      id: 'co_a22', ticker: '002131.SZ', name: '利欧股份', market: 'A股',
      substage: 'L3', categories: ['ad_tech'],
      financials: { fixedCostRatio: 0.20, aiRevenuePct: 0.25, dol: 1.25 },
      note: '数字营销+AI 短视频生成；AIGC 创意素材'
    },

    // ═══════════════════════════════════════════════════════
    // B2C平台 — 社交/通信 AI (social_comm) L3
    // ═══════════════════════════════════════════════════════
    co_a23: {
      id: 'co_a23', ticker: '2390.HK', name: '知乎-W', market: '港股',
      substage: 'L3', categories: ['social_comm'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.15, dol: 1.72 },
      note: 'AI 摘要+AI 搜索；专业内容生态；但用户增量见顶'
    },

    // ═══════════════════════════════════════════════════════
    // B2C平台 — C端 AI 订阅 (consumer_ai_sub) L2
    // ═══════════════════════════════════════════════════════
    co_a24: {
      id: 'co_a24', ticker: '1357.HK', name: '美图（C 端订阅）', market: '港股',
      substage: 'L2', categories: ['consumer_ai_sub'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.75, dol: 1.54 },
      note: '同 co_a02；本条专指月活订阅'
    },
    co_a25: {
      id: 'co_a25', ticker: '300624.SZ', name: '万兴（C 端订阅）', market: 'A股',
      substage: 'L2', categories: ['consumer_ai_sub'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.85, dol: 1.72 },
      note: '同 co_a03；本条专指海外个人订阅'
    },

    // ═══════════════════════════════════════════════════════
    // B2C平台 — 游戏/虚拟人 AI (gaming_ai) L2
    // ═══════════════════════════════════════════════════════
    co_a26: {
      id: 'co_a26', ticker: '0700.HK', name: '腾讯（游戏 AI）', market: '港股',
      substage: 'L2', categories: ['gaming_ai'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.15, dol: 1.92 },
      note: 'NPC AI + 美术资产生成；缩短开发周期 30%+；云业务见 infra tab'
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
      console.error('[APPS_DATA] 数据校验失败:', errors);
    } else if (warnings.length > 0) {
      console.warn('[APPS_DATA] 数据校验警告:', warnings);
    } else {
      console.log('[APPS_DATA] ✓ 数据校验通过 — %d 赛道, %d 公司',
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
  window.APPS_DATA = {
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
      methodology: 'docs/apps-methodology.md',
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
