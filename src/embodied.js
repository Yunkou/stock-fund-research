// ============================================================
// embodied.js — AI 终端·具身与硬件 赛道×公司映射数据
// ============================================================
// 平行结构（与 upstream.js 完全一致）：
//   categories: { [trackId]: Track }   ← 8 赛道
//   companies:  { [companyId]: Company } ← 14 公司
//
// 终端视角：L5+ 物理世界 AI 在中国 A/H 股的映射
//   机器人：人形机器人/核心部件/具身芯片/OS/无人机
//   智驾与硬件：智驾ADAS/激光雷达/AI可穿戴
//
// 加载顺序：... → embodied.js → filters.js → embodied-view.js
// 暴露：window.EMBODIED_DATA
// ============================================================

(function () {
  'use strict';

  const categoryGroups = Object.freeze([
    { id: '机器人',     zh: '机器人与具身',   en: 'Robotics & Embodied', tone: 'crimson'  },
    { id: '智驾与硬件', zh: '智能驾驶与AI硬件', en: 'Auto & AI Hardware',  tone: 'amber-2' }
  ]);

  // substage = 量产阶段：
  //   L1 = 研发/样品阶段（实验室验证，未定点）
  //   L2 = 小批量量产/定点（已获车企定点/千台级出货）
  //   L3 = 规模出货（万台+/批量上车，已盈利或接近）

  const categories = {
    // ═══ 机器人 (5) ═══
    humanoid: {
      id: 'humanoid', name: '人形机器人', group: '机器人', substage: 'L2',
      elasticity: 4.20,
      currentOutput: { low: 1, high: 3, unit: '亿美元' },
      target2030: { low: 30, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '优必选/智元（未上市）/宇树；2025 量产元年，单台 BOM 8 万美元',
      companies: ['co_e01', 'co_e02']
    },
    robot_components: {
      id: 'robot_components', name: '机器人核心部件', group: '机器人', substage: 'L2',
      elasticity: 2.95,
      currentOutput: { low: 5, high: 10, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '绿的谐波（减速器）/ 五洲新春（丝杠）/ 双环传动（轴承）',
      companies: ['co_e03', 'co_e04', 'co_e05']
    },
    embodied_ai_chip: {
      id: 'embodied_ai_chip', name: '具身 AI 芯片 / 域控', group: '机器人', substage: 'L1',
      elasticity: 2.75,
      currentOutput: { low: 2, high: 5, unit: '亿美元' },
      target2030: { low: 20, high: 35, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '地平线/黑芝麻/寒武纪；ORIN 域控芯片对标英伟达',
      companies: ['co_e06', 'co_e07', 'co_e08']
    },
    drone_robot: {
      id: 'drone_robot', name: '工业无人机 / 巡检', group: '机器人', substage: 'L3',
      elasticity: 1.65,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 18, high: 35, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '大疆/极飞/纵横；电力巡检/精准农业落地',
      companies: ['co_e09']
    },
    embodied_os: {
      id: 'embodied_os', name: '机器人 OS / 大脑', group: '机器人', substage: 'L1',
      elasticity: 3.10,
      currentOutput: { low: 1, high: 2, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '人形机器人 OS 仍未收敛；港股映射：商汤 绝影/地平线 配套',
      companies: []
    },

    // ═══ 智驾与硬件 (3) ═══
    auto_adas: {
      id: 'auto_adas', name: '智驾 / ADAS', group: '智驾与硬件', substage: 'L3',
      elasticity: 2.10,
      currentOutput: { low: 18, high: 28, unit: '亿美元' },
      target2030: { low: 60, high: 110, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '德赛西威/经纬恒润/中科创达；端到端模型上车（特斯拉 FSD V13）',
      companies: ['co_e10', 'co_e11']
    },
    auto_lidar: {
      id: 'auto_lidar', name: '激光雷达 / 智驾传感器', group: '智驾与硬件', substage: 'L3',
      elasticity: 1.85,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 22, high: 40, unit: '亿美元' },
      moat: 'weak', pricingPower: 'compressing',
      note: '禾赛/速腾/亮道；纯视觉路线（特斯拉 FSD）对激光雷达侧压制',
      companies: ['co_e12']
    },
    smart_hardware: {
      id: 'smart_hardware', name: 'AI 硬件 / 可穿戴', group: '智驾与硬件', substage: 'L2',
      elasticity: 2.30,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 35, high: 65, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '字节 AI 眼镜/小米 AI 音箱/苹果 Intelligence（港股映射）',
      companies: ['co_e13', 'co_e14']
    }
  };

  const companies = {

    // ═══════════════════════════════════════════════════════
    // 机器人 — 人形机器人 (humanoid) L2
    // ═══════════════════════════════════════════════════════
    co_e01: {
      id: 'co_e01', ticker: '9880.HK', name: '优必选', market: '港股',
      substage: 'L2', categories: ['humanoid'],
      financials: { fixedCostRatio: 0.70, aiRevenuePct: 0.90, dol: 3.57 },
      note: 'Walker S2 已量产；2026 Q1 交付 500 台；BOM 8 万美元'
    },
    co_e02: {
      id: 'co_e02', ticker: '603666.SH', name: '亿嘉和', market: 'A股',
      substage: 'L2', categories: ['humanoid'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.50, dol: 2.44 },
      note: '电力巡检机器人+服务机器人；与优必选合作开发通用人形'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人 — 核心部件 (robot_components) L2
    // ═══════════════════════════════════════════════════════
    co_e03: {
      id: 'co_e03', ticker: '688017.SH', name: '绿的谐波', market: 'A股',
      substage: 'L2', categories: ['robot_components'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.40, dol: 2.44 },
      note: '谐波减速器国产龙头；人形机器人旋转关节核心'
    },
    co_e04: {
      id: 'co_e04', ticker: '603667.SH', name: '五洲新春', market: 'A股',
      substage: 'L2', categories: ['robot_components'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.92 },
      note: '滚珠丝杠+直线导轨；人形机器人线性关节核心'
    },
    co_e05: {
      id: 'co_e05', ticker: '002472.SZ', name: '双环传动', market: 'A股',
      substage: 'L2', categories: ['robot_components'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.30, dol: 2.17 },
      note: 'RV 减速器+精密齿轮；谐波竞品；机器人行星减速器配套'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人 — 具身 AI 芯片 (embodied_ai_chip) L1
    // ═══════════════════════════════════════════════════════
    co_e06: {
      id: 'co_e06', ticker: '688256.SH', name: '寒武纪', market: 'A股',
      substage: 'L2', categories: ['embodied_ai_chip'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.95, dol: 1.72 },
      note: '思元 590 推理芯片向具身延伸；推理芯片见 infra tab'
    },
    co_e07: {
      id: 'co_e07', ticker: '9660.HK', name: '地平线机器人-W', market: '港股',
      substage: 'L1', categories: ['embodied_ai_chip', 'auto_adas'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.95, dol: 2.44 },
      note: '征程 5/6 智驾芯片；2025 累计出货 500 万颗；BPU 架构对标 Thor'
    },
    co_e08: {
      id: 'co_e08', ticker: '2533.HK', name: '黑芝麻智能', market: '港股',
      substage: 'L1', categories: ['embodied_ai_chip'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.95, dol: 2.44 },
      note: '华山 A1000 智驾芯片；2026 量产爬坡'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人 — 工业无人机 (drone_robot) L3
    // ═══════════════════════════════════════════════════════
    co_e09: {
      id: 'co_e09', ticker: '002389.SZ', name: '航天彩虹', market: 'A股',
      substage: 'L3', categories: ['drone_robot'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.92 },
      note: '军用+工业无人机双线；电力/油气巡检落地'
    },

    // ═══════════════════════════════════════════════════════
    // 智驾与硬件 — 智驾/ADAS (auto_adas) L3
    // ═══════════════════════════════════════════════════════
    co_e10: {
      id: 'co_e10', ticker: '002920.SZ', name: '德赛西威', market: 'A股',
      substage: 'L3', categories: ['auto_adas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.55, dol: 1.92 },
      note: '智能座舱+智驾域控；与英伟达 Orin/Thor 深度绑定；理想/小鹏主供'
    },
    co_e11: {
      id: 'co_e11', ticker: '688326.SH', name: '经纬恒润', market: 'A股',
      substage: 'L3', categories: ['auto_adas'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.50, dol: 2.17 },
      note: '底盘域控+智能驾驶；东风/一汽/上汽定点'
    },

    // ═══════════════════════════════════════════════════════
    // 智驾与硬件 — 激光雷达 (auto_lidar) L3
    // ═══════════════════════════════════════════════════════
    co_e12: {
      id: 'co_e12', ticker: '02498.HK', name: '速腾聚创', market: '港股',
      substage: 'L3', categories: ['auto_lidar'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.95, dol: 2.78 },
      note: 'M 系列激光雷达；与车企绑定（智己/极氪）'
    },

    // ═══════════════════════════════════════════════════════
    // 智驾与硬件 — AI 硬件/可穿戴 (smart_hardware) L2
    // ═══════════════════════════════════════════════════════
    co_e13: {
      id: 'co_e13', ticker: '1810.HK', name: '小米集团-W', market: '港股',
      substage: 'L2', categories: ['smart_hardware'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.20, dol: 2.17 },
      note: '小米 AI 眼镜 / 超级小爱 / SU7 智驾；HaddoV2 端侧大模型'
    },
    co_e14: {
      id: 'co_e14', ticker: '688608.SH', name: '恒玄科技（C 端硬件）', market: 'A股',
      substage: 'L2', categories: ['smart_hardware'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.80, dol: 1.54 },
      note: 'AI 耳机+智能音箱 SoC 配套；端侧 SoC 见 model-platform tab'
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
      console.error('[EMBODIED_DATA] 数据校验失败:', errors);
    } else if (warnings.length > 0) {
      console.warn('[EMBODIED_DATA] 数据校验警告:', warnings);
    } else {
      console.log('[EMBODIED_DATA] ✓ 数据校验通过 — %d 赛道, %d 公司',
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
  window.EMBODIED_DATA = {
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
      methodology: 'docs/embodied-methodology.md',
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
