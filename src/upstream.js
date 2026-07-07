// ============================================================
// upstream.js — AI上游算力产业链 品类×公司映射数据
// ============================================================
// 双层索引结构：
//   categories: { [categoryId]: Category }   ← 42 品类
//   companies:  { [companyId]: Company }     ← 公司（每公司只出现一次）
//
// 加载顺序：data.js → sankey.js → upstream.js → filters.js → upstream-view.js
// 暴露：window.UPSTREAM_DATA
// ============================================================

(function () {
  'use strict';

  // ── 品类元数据 ──────────────────────────────────────────
  const categoryGroups = Object.freeze([
    { id: '金属组',   zh: '算力金属组',   en: 'Compute Metals',      tone: 'amber'   },
    { id: '特气组',   zh: '算力特气组',   en: 'Specialty Gases',     tone: 'crimson' },
    { id: '材料组',   zh: '算力材料组',   en: 'Compute Materials',   tone: 'slate'   },
    { id: '零件组',   zh: '算力零件组',   en: 'Compute Components',  tone: 'moss'    },
    { id: '电算协同', zh: '电算协同组',   en: 'Power-Compute Coupling', tone: 'amber-2' }
  ]);

  // ── 42 品类定义（仅框架数据，companies 待填充）────────────
  const categories = {
    // ═══ 算力金属组 (8) ═══
    tungsten: {
      id: 'tungsten', name: '钨 (W)', group: '金属组', substage: 'L3',
      elasticity: 3.95, // DOL ~2.5 × PricingPower 1.58 — 中钨高新/厦门钨业/章源钨业
      currentOutput: { low: 25, high: 30, unit: '亿美元' },
      target2030: { low: 80, high: 150, unit: '亿美元' },
      nanoPremium: '20-50x',
      note: '国内钨储量占全球 80%，出口管制已启动；六氟化钨是其核心下游',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_001', 'co_002', 'co_003', 'co_004']
    },
    molybdenum: {
      id: 'molybdenum', name: '钼 (Mo)', group: '金属组', substage: 'L2',
      elasticity: 1.98, // DOL ~2.0 × PricingPower 0.99 — 洛阳钼业/金钼股份
      currentOutput: { low: 8, high: 12, unit: '亿美元' },
      target2030: { low: 40, high: 70, unit: '亿美元' },
      nanoPremium: '15-40x',
      note: 'AI 服务器高纯钼溅射靶材需求；主要分韩国存储蛋糕',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_010', 'co_011', 'co_002']
    },
    tantalum: {
      id: 'tantalum', name: '钽 (Ta)', group: '金属组', substage: 'L2',
      elasticity: 2.35, // DOL ~2.44 × PricingPower 0.96 — 东方钽业
      currentOutput: { low: 10, high: 15, unit: '亿美元' },
      target2030: { low: 40, high: 60, unit: '亿美元' },
      nanoPremium: '3-4x',
      note: '钽电容为 AI 服务器核心被动元件，需求 10 倍增长',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_020']
    },
    tin: {
      id: 'tin', name: '锡 (Sn)', group: '金属组', substage: 'L2',
      elasticity: 1.97, // DOL ~2.04 × PricingPower 0.96 — 锡业股份
      currentOutput: { low: 5, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      nanoPremium: '10-30x',
      note: '焊锡粉原料；从工业级焊料到纳米改性焊膏升级',
      policyBoost: 'medium',
      chokepoint:  'none',
      companies: ['co_030']
    },
    indium: {
      id: 'indium', name: '铟 (In)', group: '金属组', substage: 'L2',
      elasticity: 1.80, // DOL ~1.86 × PricingPower 0.97 — 中金岭南/株冶集团
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '磷化铟衬底用于光通信和数据中心光模块',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_040', 'co_041']
    },
    gallium: {
      id: 'gallium', name: '镓 (Ga)', group: '金属组', substage: 'L3',
      elasticity: 3.42, // DOL ~2.13 × PricingPower 1.61 — 中国铝业
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '中国镓占全球 90%+ 产能，氮化镓 RF 器件核心原料',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_050']
    },
    germanium: {
      id: 'germanium', name: '锗 (Ge)', group: '金属组', substage: 'L3',
      elasticity: 4.12, // DOL ~2.54 × PricingPower 1.62 — 云南锗业/驰宏锌锗
      currentOutput: { low: 4, high: 6, unit: '亿美元' },
      target2030: { low: 20, high: 35, unit: '亿美元' },
      nanoPremium: '10-20x',
      note: '红外光学 + 光纤掺杂，出口管制品种',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_060', 'co_061', 'co_040']
    },
    hpc: {
      id: 'hpc', name: '高纯铜 (HP Cu)', group: '金属组', substage: 'L2',
      elasticity: 1.91, // DOL ~1.98 × PricingPower 0.96 — 江西铜业/楚江新材
      currentOutput: { low: 8, high: 12, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '纳米互联铜；先进封装 RDL 和 TSV 填充',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_070', 'co_071']
    },

    // ═══ 算力特气组 (6) ═══
    wf6: {
      id: 'wf6', name: '六氟化钨 (WF₆)', group: '特气组', substage: 'L3',
      elasticity: 4.21, // DOL ~2.64 × PricingPower 1.60 — 中船特气/昊华科技
      currentOutput: { low: 10, high: 15, unit: '亿美元' },
      target2030: { low: 50, high: 80, unit: '亿美元' },
      nanoPremium: '30-80x',
      note: '全球年耗 7000 吨，中国产能 2000 吨；分韩国存储 + 强制涨价双杠杆',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_200', 'co_201']
    },
    nf3: {
      id: 'nf3', name: '三氟化氮 (NF₃)', group: '特气组', substage: 'L2',
      elasticity: 2.42, // DOL ~2.50 × PricingPower 0.97 — 中船特气/昊华科技/雅克科技
      currentOutput: { low: 5, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 40, unit: '亿美元' },
      nanoPremium: '10-20x',
      note: 'CVD 腔体清洗气体；国产化率快速提升',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_200', 'co_201', 'co_210']
    },
    dcs: {
      id: 'dcs', name: '二氯二氢硅 (DCS)', group: '特气组', substage: 'L2',
      elasticity: 2.30, // DOL ~2.38 × PricingPower 0.97 — 三孚股份
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '10-20x',
      note: '硅外延关键前驱体；强制涨价品种',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_220']
    },
    ald: {
      id: 'ald', name: 'ALD/CVD 前驱体', group: '特气组', substage: 'L1',
      elasticity: 1.28, // DOL ~2.39 × PricingPower 0.54 — 雅克科技/南大光电（国产起步）
      currentOutput: { low: 5, high: 10, unit: '亿美元' },
      target2030: { low: 30, high: 50, unit: '亿美元' },
      nanoPremium: '15-30x',
      note: '平台型品类；分韩国 + 替代美国；国产起步阶段',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_230', 'co_231']
    },
    sih4: {
      id: 'sih4', name: '四氢化硅 (SiH₄)', group: '特气组', substage: 'L1',
      elasticity: 1.21, // DOL ~2.23 × PricingPower 0.54 — 三孚股份/凯立新材
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '硅外延 + 纳米线；自给率提升 + 替代进口',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_220', 'co_240']
    },
    helium: {
      id: 'helium', name: '高纯氦 (He)', group: '特气组', substage: 'L1',
      elasticity: 1.35, // DOL ~2.50 × PricingPower 0.54 — 昊华科技提氦
      currentOutput: { low: 2, high: 4, unit: '亿美元' },
      target2030: { low: 10, high: 20, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '中国氦气自给率极低（<5%），战略稀缺品，提氦技术突破中',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_250']
    },

    // ═══ 算力材料组 (7) ═══
    pgme: {
      id: 'pgme', name: '光刻胶溶剂 (PGME/PGMEA)', group: '材料组', substage: 'L1',
      elasticity: 1.38, // DOL ~2.56 × PricingPower 0.54 — 南大光电
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      nanoPremium: '10-20x',
      note: '抢日本市场；国产起步，国内仅少数企业量产',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_300']
    },
    cmp: {
      id: 'cmp', name: 'CMP 抛光液/垫', group: '材料组', substage: 'L2',
      elasticity: 2.14, // DOL ~2.21 × PricingPower 0.97 — 安集科技/三孚新科
      currentOutput: { low: 5, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '媲美 + 分韩；国产突破中，已有企业进入长江存储供应链',
      policyBoost: 'strong',
      chokepoint:  'reverse',
      companies: ['co_310', 'co_311']
    },
    ec: {
      id: 'ec', name: '电子化学品', group: '材料组', substage: 'L2',
      elasticity: 2.07, // DOL ~2.15 × PricingPower 0.96 — 雅克科技/鼎龙股份
      currentOutput: { low: 8, high: 12, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '成熟制程 + 高渗透率；分韩国存储份额',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_320', 'co_321']
    },
    hbm_pkg: {
      id: 'hbm_pkg', name: 'HBM 封装料', group: '材料组', substage: 'L1',
      elasticity: 1.20, // DOL ~2.22 × PricingPower 0.54 — 雅克科技
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: 'HBM 内存堆叠封装关键材料；国产几乎空白，高弹性方向',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_330']
    },
    abf: {
      id: 'abf', name: 'ABF 基板树脂', group: '材料组', substage: 'L1',
      elasticity: 1.12, // DOL ~2.08 × PricingPower 0.54 — 宏昌电子
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: 'FC-BGA 载板核心材料；日本味之素垄断；国产替代空间极大',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_340']
    },
    emc: {
      id: 'emc', name: '环氧模塑料 (EMC)', group: '材料组', substage: 'L2',
      elasticity: 2.00, // DOL ~2.08 × PricingPower 0.96 — 宏昌电子
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 12, high: 20, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '先进封装用 EMC；国产部分突破，份额仍低',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_350']
    },
    pr_raw: {
      id: 'pr_raw', name: '光刻胶 PR 原料', group: '材料组', substage: 'L1',
      elasticity: 1.38, // DOL ~2.56 × PricingPower 0.54 — 南大光电
      currentOutput: { low: 2, high: 4, unit: '亿美元' },
      target2030: { low: 10, high: 18, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '光刻胶上游树脂/PAG；抢日本市场',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_360']
    },

    // ═══ 算力零件组 (8) ═══
    sputter: {
      id: 'sputter', name: '溅射靶材', group: '零件组', substage: 'L2',
      elasticity: 2.23, // DOL ~2.39 × PricingPower 0.93 — 阿石创/颀中科技
      currentOutput: { low: 10, high: 15, unit: '亿美元' },
      target2030: { low: 50, high: 80, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '分韩 + 强制替代；国内已有头部企业进入台积电供应链',
      policyBoost: 'strong',
      chokepoint:  'reverse',
      companies: ['co_400', 'co_401']
    },
    substrate: {
      id: 'substrate', name: '封装基板', group: '零件组', substage: 'L1',
      elasticity: 1.26, // DOL ~2.33 × PricingPower 0.54 — 深南电路
      currentOutput: { low: 8, high: 12, unit: '亿美元' },
      target2030: { low: 30, high: 55, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: 'FC-BGA 载板；替代日本 + 美国；国内深南电路等布局',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_410']
    },
    coldplate: {
      id: 'coldplate', name: '液冷板', group: '零件组', substage: 'L2',
      elasticity: 1.95, // DOL ~2.02 × PricingPower 0.97 — 高澜股份/欧陆通
      currentOutput: { low: 5, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 40, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: 'AI 服务器液冷渗透率快速提升；铝/铜液冷板',
      policyBoost: 'strong',
      chokepoint:  'reverse',
      companies: ['co_420', 'co_421']
    },
    mlcc: {
      id: 'mlcc', name: 'MLCC 粉 / 钽电容', group: '零件组', substage: 'L2',
      elasticity: 2.22, // DOL ~2.31 × PricingPower 0.96 — 国瓷材料/东方钽业
      currentOutput: { low: 4, high: 6, unit: '亿美元' },
      target2030: { low: 20, high: 35, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '下一代 Rubin 机柜核心被动元件，优先级高',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_430', 'co_431']
    },
    mag_powder: {
      id: 'mag_powder', name: '电感磁粉', group: '零件组', substage: 'L2',
      elasticity: 1.96, // DOL ~2.04 × PricingPower 0.96 — 金力永磁
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 20, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: '服务器电源电感核心材料',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_440']
    },
    solder: {
      id: 'solder', name: '焊锡粉 / 焊膏', group: '零件组', substage: 'L2',
      elasticity: 2.00, // DOL ~2.06 × PricingPower 0.97 — 锡业股份/宏昌电子
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 20, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: '先进封装微凸块 (μ-bump) 用焊料',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_030', 'co_450']
    },
    gan_rf: {
      id: 'gan_rf', name: 'GaN 射频衬底', group: '零件组', substage: 'L2',
      elasticity: 2.47, // DOL ~2.56 × PricingPower 0.97 — 三安光电
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '雷达 + 通信；纳米氮化镓外延后探测距离超远',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_460']
    },
    si_wafer: {
      id: 'si_wafer', name: '大硅片 (300mm)', group: '零件组', substage: 'L1',
      elasticity: 1.69, // DOL ~3.13 × PricingPower 0.54 — 沪硅产业
      currentOutput: { low: 5, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 40, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: '抢日本硅片份额（信越/SUMCO）；国内沪硅产业等布局',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_470', 'co_900']
    },

    // ═══ 延伸品类 (13) ═══
    phosphide: {
      id: 'phosphide', name: '磷化铟 (InP)', group: '金属组', substage: 'L2',
      elasticity: 2.88, // DOL ~3.00 × PricingPower 0.96 — 云南锗业子公司鑫耀半导体
      currentOutput: { low: 1, high: 2, unit: '亿美元' },
      target2030: { low: 5, high: 12, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '光通信衬底；数据中心 800G/1.6T 光模块驱动',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_080']
    },
    high_pure_al: {
      id: 'high_pure_al', name: '高纯铝', group: '金属组', substage: 'L2',
      elasticity: 2.08, // DOL ~2.17 × PricingPower 0.96 — 华友钴业
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 12, high: 20, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: '溅射靶材上游原料；99.999%+ 高纯铝',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_090']
    },
    rare_earth: {
      id: 'rare_earth', name: '稀土 (Nd/Pr/Dy/Tb)', group: '金属组', substage: 'L3',
      elasticity: 3.28, // DOL ~2.09 × PricingPower 1.57 — 北方稀土/中国稀土/广晟有色/金力永磁
      currentOutput: { low: 10, high: 15, unit: '亿美元' },
      target2030: { low: 30, high: 60, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '中国占全球 70-90% 产能加工；永磁/MLCC/陶瓷电容',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_100', 'co_101', 'co_102', 'co_440']
    },
    co_si: {
      id: 'co_si', name: '钴硅化物', group: '金属组', substage: 'L2',
      elasticity: 2.08, // DOL ~2.17 × PricingPower 0.96 — 华友钴业
      currentOutput: { low: 1, high: 2, unit: '亿美元' },
      target2030: { low: 5, high: 10, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '先进制程接触层材料；5nm 以下必需',
      policyBoost: 'medium',
      chokepoint:  'leverage',
      companies: ['co_110']
    },
    xef2: {
      id: 'xef2', name: '二氟化氙 (XeF₂)', group: '特气组', substage: 'L1',
      elasticity: 1.50, // DOL ~2.78 × PricingPower 0.54 — 中船特气
      currentOutput: { low: 0.5, high: 1, unit: '亿美元' },
      target2030: { low: 3, high: 8, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '新型刻蚀气体；MEMS 和先进封装应用',
      policyBoost: 'medium',
      chokepoint:  'leverage',
      companies: ['co_260']
    },
    cos: {
      id: 'cos', name: '羰基硫 (COS)', group: '特气组', substage: 'L1',
      elasticity: 1.20, // DOL ~2.22 × PricingPower 0.54 — 雅克科技
      currentOutput: { low: 0.5, high: 1, unit: '亿美元' },
      target2030: { low: 2, high: 5, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '3D NAND 高深宽比刻蚀气体',
      policyBoost: 'medium',
      chokepoint:  'leverage',
      companies: ['co_270']
    },
    sod: {
      id: 'sod', name: 'SOD 旋涂介质', group: '材料组', substage: 'L1',
      elasticity: 1.38, // DOL ~2.56 × PricingPower 0.54 — 南大光电
      currentOutput: { low: 0.5, high: 1, unit: '亿美元' },
      target2030: { low: 3, high: 6, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: 'STI 浅沟槽隔离填充材料；替代日本',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_370']
    },
    pspi: {
      id: 'pspi', name: '光敏聚酰亚胺 (PSPI)', group: '材料组', substage: 'L1',
      elasticity: 1.29, // DOL ~2.38 × PricingPower 0.54 — 强力新材
      currentOutput: { low: 1, high: 2, unit: '亿美元' },
      target2030: { low: 5, high: 12, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '先进封装介电层；替代日本 Toray/HD Microsystems',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_380']
    },
    tim: {
      id: 'tim', name: '导热界面材料 (TIM)', group: '材料组', substage: 'L2',
      elasticity: 1.89, // DOL ~1.96 × PricingPower 0.97 — 中石科技
      currentOutput: { low: 2, high: 4, unit: '亿美元' },
      target2030: { low: 10, high: 20, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: '3D 封装散热；芯片堆叠热密度持续提高',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_390']
    },
    ic_sub: {
      id: 'ic_sub', name: 'IC 载板', group: '零件组', substage: 'L2',
      elasticity: 2.12, // DOL ~2.21 × PricingPower 0.96 — 深南电路/生益科技
      currentOutput: { low: 8, high: 12, unit: '亿美元' },
      target2030: { low: 30, high: 50, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: 'FC-BGA 基板；ABF 载板国产突破',
      policyBoost: 'strong',
      chokepoint:  'leverage',
      companies: ['co_410', 'co_480', 'co_481']
    },
    socket: {
      id: 'socket', name: '测试插座', group: '零件组', substage: 'L2',
      elasticity: 2.00, // DOL ~2.08 × PricingPower 0.96 — 精测电子
      currentOutput: { low: 2, high: 4, unit: '亿美元' },
      target2030: { low: 10, high: 18, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: '先进封装测试插座；国产替代日本',
      policyBoost: 'medium',
      chokepoint:  'none',
      companies: ['co_490']
    },
    connector: {
      id: 'connector', name: '高速背板连接器', group: '零件组', substage: 'L2',
      elasticity: 1.65, // DOL ~1.72 × PricingPower 0.96 — 立讯精密
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 25, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: '112G/224G PAM4；AI 集群互联核心',
      policyBoost: 'medium',
      chokepoint:  'reverse',
      companies: ['co_500']
    },
    busbar: {
      id: 'busbar', name: '铜母线 / Busbar', group: '零件组', substage: 'L2',
      elasticity: 1.96, // DOL ~2.04 × PricingPower 0.96 — 楚江新材
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 12, high: 22, unit: '亿美元' },
      nanoPremium: '2-3x',
      note: 'AI 服务器配电母线；高电流密度需求',
      policyBoost: 'medium',
      chokepoint:  'none',
      companies: ['co_510']
    },

    // ═══ 电算协同组 (5) — 算力扩张的电力物理层 ═══
    hvdc: {
      id: 'hvdc', name: 'HVDC 高压直流（800V/±800kV）', group: '电算协同', substage: 'L2',
      elasticity: 1.77, // DOL ~1.84 × PricingPower 0.96 — 国电南瑞/思源电气
      currentOutput: { low: 8,  high: 12, unit: '亿美元' },
      target2030: { low: 30, high: 50, unit: '亿美元' },
      nanoPremium: '4-6x',
      note: '替代 UPS 效率 95%→98%；AI 数据中心标配；与特高压协同',
      policyBoost: 'strong',  // 大基金三期 + 央企信创
      chokepoint:  'none',
      companies: ['co_600', 'co_601']
    },
    vfb: {
      id: 'vfb', name: '液流电池（全钒/铁铬）', group: '电算协同', substage: 'L2',
      elasticity: 2.04, // DOL ~2.13 × PricingPower 0.96 — 攀钢钒钛/振华新材
      currentOutput: { low: 5,  high: 10, unit: '亿美元' },
      target2030: { low: 20, high: 40, unit: '亿美元' },
      nanoPremium: '4-8x',
      note: '长时储能 4-12h；AI 数据中心备电；与电网调峰',
      policyBoost: 'strong',  // 国家长时储能专项
      chokepoint:  'none',
      companies: ['co_610', 'co_611']
    },
    vpp: {
      id: 'vpp', name: '虚拟电厂（VPP）/ 绿电聚合', group: '电算协同', substage: 'L2',
      elasticity: 1.77, // DOL ~1.84 × PricingPower 0.96 — 国电南瑞/特锐德
      currentOutput: { low: 3, high: 5, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '算力负荷参与电力市场；电力市场化改革重点',
      policyBoost: 'strong',  // 发改委/能源局推动
      chokepoint:  'none',
      companies: ['co_600', 'co_620']
    },
    ppa: {
      id: 'ppa', name: 'PPA 长协（绿电直供）', group: '电算协同', substage: 'L3',
      elasticity: 3.37, // DOL ~2.11 × PricingPower 1.60 — 隆基绿能/天合光能
      currentOutput: { low: 15, high: 25, unit: '亿美元' },
      target2030: { low: 50, high: 100, unit: '亿美元' },
      nanoPremium: '3-5x',
      note: 'AI 客户签 10 年长协；隆基/晶澳/晶科长协订单',
      policyBoost: 'strong',  // 双碳目标 + 国家算力枢纽
      chokepoint:  'reverse',  // 中国光伏产能 80%+ 是反卡
      companies: ['co_630', 'co_631']
    },
    ccer: {
      id: 'ccer', name: '碳积分（CCER）/ 计量', group: '电算协同', substage: 'L2',
      elasticity: 1.62, // DOL ~1.69 × PricingPower 0.96 — 国网英大
      currentOutput: { low: 1, high: 3, unit: '亿美元' },
      target2030: { low: 5, high: 10, unit: '亿美元' },
      nanoPremium: '5-10x',
      note: '数据中心碳成本显性化；CCER 重启',
      policyBoost: 'strong',  // 政策重启
      chokepoint:  'none',
      companies: ['co_640']
    }
  };

  // ── 公司数据（Vibe-Trading 辅助筛选 + 人工审核）────────
  // 数据来源：券商研报 + 年报主营业务构成 + web_search 交叉验证
  // 更新日期：2026-07-06
  // 审核状态：✅ 已通过 web_search 验证公司名/ticker/主营业务
  //           ⚠️ 财务数据为年报公开数据估算，待 Vibe-Trading market_data 精确拉取
  const companies = {

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 钨 (tungsten) L3
    // ═══════════════════════════════════════════════════════
    co_001: {
      id: 'co_001', ticker: '000657.SZ', name: '中钨高新', market: 'A股',
      substage: 'L3', categories: ['tungsten'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.40, dol: 2.47 },
      note: '硬质合金综合供应商龙头；柿竹园钨矿注入（钨资源56万吨，占全国30%+）；2025营收176亿/净利12.8亿；PCB刀具放量'
    },
    co_002: {
      id: 'co_002', ticker: '600549.SH', name: '厦门钨业', market: 'A股',
      substage: 'L3', categories: ['tungsten', 'molybdenum', 'rare_earth'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.30, dol: 2.08 },
      note: '钨全产业链龙头；光伏钨丝放量；稀土永磁材料布局；2025营收200亿+；钨精矿自给率持续提升'
    },
    co_003: {
      id: 'co_003', ticker: '002378.SZ', name: '章源钨业', market: 'A股',
      substage: 'L3', categories: ['tungsten'],
      financials: { fixedCostRatio: 0.52, aiRevenuePct: 0.45, dol: 2.33 },
      note: '钨精矿/APT/硬质合金全链条；2026年2月长单报价钨精矿67万/吨环比+28%；涨价弹性标的'
    },
    co_004: {
      id: 'co_004', ticker: '002842.SZ', name: '翔鹭钨业', market: 'A股',
      substage: 'L3', categories: ['tungsten'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.35, dol: 2.22 },
      note: '钨产品全链条（精矿→粉末→硬质合金）；2026年2月涨停联动钨价上行'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 钼 (molybdenum) L2
    // ═══════════════════════════════════════════════════════
    co_010: {
      id: 'co_010', ticker: '603993.SH', name: '洛阳钼业', market: 'A股',
      substage: 'L2', categories: ['molybdenum'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.20, dol: 1.92 },
      note: '全球钼资源巨头；高纯钼溅射靶材上游原料；AI服务器钼靶材需求弹性'
    },
    co_011: {
      id: 'co_011', ticker: '601958.SH', name: '金钼股份', market: 'A股',
      substage: 'L2', categories: ['molybdenum'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.25, dol: 2.17 },
      note: '亚洲最大钼业公司；钼精矿/钼铁/钼化工全链条；高纯钼靶材上游'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 钽 (tantalum) L2
    // ═══════════════════════════════════════════════════════
    co_020: {
      id: 'co_020', ticker: '000962.SZ', name: '东方钽业', market: 'A股',
      substage: 'L2', categories: ['tantalum'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.50, dol: 2.44 },
      note: '国内钽行业龙头；钽电容用钽粉/钽丝；AI服务器钽电容核心供应商；2026年1月股价涨8.41%'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 锡 (tin) L2
    // ═══════════════════════════════════════════════════════
    co_030: {
      id: 'co_030', ticker: '000960.SZ', name: '锡业股份', market: 'A股',
      substage: 'L2', categories: ['tin', 'solder'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.30, dol: 2.04 },
      note: '全球最大锡生产商；焊锡粉原料龙头；纳米改性焊膏升级方向；μ-bump先进封装焊料'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 铟 (indium) L2
    // ═══════════════════════════════════════════════════════
    co_040: {
      id: 'co_040', ticker: '000060.SZ', name: '中金岭南', market: 'A股',
      substage: 'L2', categories: ['indium', 'germanium'],
      financials: { fixedCostRatio: 0.42, aiRevenuePct: 0.15, dol: 1.82 },
      note: '铅锌冶炼副产铟/锗；磷化铟衬底上游铟源；光通信数据中心驱动'
    },
    co_041: {
      id: 'co_041', ticker: '600961.SH', name: '株冶集团', market: 'A股',
      substage: 'L2', categories: ['indium'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.18, dol: 1.89 },
      note: '锌冶炼副产铟；国内铟主要供应商之一'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 镓 (gallium) L3
    // ═══════════════════════════════════════════════════════
    co_050: {
      id: 'co_050', ticker: '601600.SH', name: '中国铝业', market: 'A股',
      substage: 'L3', categories: ['gallium'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.10, dol: 2.13 },
      note: '氧化铝副产金属镓；全球最大镓产能（中国镓占全球90%+）；GaN RF器件核心原料'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 锗 (germanium) L3
    // ═══════════════════════════════════════════════════════
    co_060: {
      id: 'co_060', ticker: '002428.SZ', name: '云南锗业', market: 'A股',
      substage: 'L3', categories: ['germanium'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.60, dol: 3.00 },
      note: '锗产品产销量全国第一；完整锗产业链（矿采→区熔→精深加工）；红外/光纤/光伏/半导体四大赛道；2025营收10.66亿'
    },
    co_061: {
      id: 'co_061', ticker: '600497.SH', name: '驰宏锌锗', market: 'A股',
      substage: 'L3', categories: ['germanium'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.20, dol: 2.08 },
      note: '铅锌矿副产锗；国内主要锗原料供应商之一'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 高纯铜 (hpc) L2
    // ═══════════════════════════════════════════════════════
    co_070: {
      id: 'co_070', ticker: '600362.SH', name: '江西铜业', market: 'A股',
      substage: 'L2', categories: ['hpc'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.15, dol: 1.92 },
      note: '国内最大铜生产商；纳米互联铜上游电解铜原料；先进封装RDL/TSV填充'
    },
    co_071: {
      id: 'co_071', ticker: '002171.SZ', name: '楚江新材', market: 'A股',
      substage: 'L2', categories: ['hpc'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.25, dol: 2.04 },
      note: '高纯铜加工龙头；铜基新材料；AI服务器散热/导电用高纯铜材'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 磷化铟 (phosphide) L2
    // ═══════════════════════════════════════════════════════
    co_080: {
      id: 'co_080', ticker: '002428.SZ', name: '云南锗业', market: 'A股',
      substage: 'L2', categories: ['phosphide'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.40, dol: 3.00 },
      note: '控股子公司鑫耀半导体磷化铟晶片已批量生产；全球第三个掌握大尺寸磷化铟制备技术；800G/1.6T光模块驱动'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 高纯铝 (high_pure_al) L2
    // ═══════════════════════════════════════════════════════
    co_090: {
      id: 'co_090', ticker: '603799.SH', name: '华友钴业', market: 'A股',
      substage: 'L2', categories: ['high_pure_al'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.10, dol: 2.17 },
      note: '有色金属冶炼龙头；高纯铝溅射靶材上游原料'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 稀土 (rare_earth) L3
    // ═══════════════════════════════════════════════════════
    co_100: {
      id: 'co_100', ticker: '600111.SH', name: '北方稀土', market: 'A股',
      substage: 'L3', categories: ['rare_earth'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.30, dol: 1.96 },
      note: '全球最大轻稀土供应商；白云鄂博矿稀土储量占全国90%+；2025净利9.3亿/2026Q1净利9.18亿(+113%)；配额优势显著'
    },
    co_101: {
      id: 'co_101', ticker: '000831.SZ', name: '中国稀土', market: 'A股',
      substage: 'L3', categories: ['rare_earth'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.30, dol: 2.08 },
      note: '中重型稀土资源整合平台；南方稀土矿开采冶炼；MLCC/永磁材料上游'
    },
    co_102: {
      id: 'co_102', ticker: '600259.SH', name: '广晟有色', market: 'A股',
      substage: 'L3', categories: ['rare_earth', 'tungsten'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.25, dol: 2.22 },
      note: '广东稀土+钨矿双资源；稀土矿开采/冶炼分离/深加工'
    },

    // ═══════════════════════════════════════════════════════
    // 算力金属组 — 钴硅化物 (co_si) L2
    // ═══════════════════════════════════════════════════════
    co_110: {
      id: 'co_110', ticker: '603799.SH', name: '华友钴业', market: 'A股',
      substage: 'L2', categories: ['co_si'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.10, dol: 2.17 },
      note: '全球钴业龙头；钴硅化物先进制程接触层材料上游；5nm以下必需'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 六氟化钨 (wf6) L3
    // ═══════════════════════════════════════════════════════
    co_200: {
      id: 'co_200', ticker: '688146.SH', name: '中船特气', market: 'A股',
      substage: 'L3', categories: ['wf6', 'nf3'],
      financials: { fixedCostRatio: 0.58, aiRevenuePct: 0.80, dol: 2.78 },
      note: '国内电子特气龙头；WF6产能2230吨/年全球最大；2025营收22.6亿/净利3.47亿；毛利率30%；存储芯片工艺核心特气'
    },
    co_201: {
      id: 'co_201', ticker: '600378.SH', name: '昊华科技', market: 'A股',
      substage: 'L3', categories: ['wf6', 'nf3'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.70, dol: 2.50 },
      note: '六氟化钨产能600吨/年+规划新增1000吨(2027投产)；六氟丁二烯1000吨/年；PTFE 5.1万吨；2026年7月股价因日企断供暴涨'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 三氟化氮 (nf3) L2
    // ═══════════════════════════════════════════════════════
    co_210: {
      id: 'co_210', ticker: '002409.SZ', name: '雅克科技', market: 'A股',
      substage: 'L2', categories: ['nf3'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.60, dol: 2.22 },
      note: '电子特气平台型公司；NF3 CVD腔体清洗气；国产化率快速提升'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 二氯二氢硅 (dcs) L2
    // ═══════════════════════════════════════════════════════
    co_220: {
      id: 'co_220', ticker: '603938.SH', name: '三孚股份', market: 'A股',
      substage: 'L2', categories: ['dcs', 'sih4'],
      financials: { fixedCostRatio: 0.52, aiRevenuePct: 0.65, dol: 2.38 },
      note: '硅基电子特气龙头；DCS硅外延关键前驱体；SiH₄硅外延+纳米线；强制涨价品种'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — ALD/CVD前驱体 (ald) L1
    // ═══════════════════════════════════════════════════════
    co_230: {
      id: 'co_230', ticker: '002409.SZ', name: '雅克科技', market: 'A股',
      substage: 'L1', categories: ['ald'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.40, dol: 2.22 },
      note: 'ALD/CVD前驱体布局中；平台型公司品类扩张；分韩国存储+替代美国'
    },
    co_231: {
      id: 'co_231', ticker: '300346.SZ', name: '南大光电', market: 'A股',
      substage: 'L1', categories: ['ald'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.55, dol: 2.56 },
      note: 'MO源/ALD前驱体国产替代龙头；光刻胶+特气双轮驱动'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 四氢化硅 (sih4) L1
    // ═══════════════════════════════════════════════════════
    co_240: {
      id: 'co_240', ticker: '688269.SH', name: '凯立新材', market: 'A股',
      substage: 'L1', categories: ['sih4'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.30, dol: 2.08 },
      note: '硅烷气布局；硅外延+纳米线前驱体；自给率提升方向'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 高纯氦 (helium) L1
    // ═══════════════════════════════════════════════════════
    co_250: {
      id: 'co_250', ticker: '600378.SH', name: '昊华科技', market: 'A股',
      substage: 'L1', categories: ['helium'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.15, dol: 2.50 },
      note: '氦气纯化产能5万立方米/年；中国氦气自给率<5%；战略稀缺品'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 二氟化氙 (xef2) L1
    // ═══════════════════════════════════════════════════════
    co_260: {
      id: 'co_260', ticker: '688146.SH', name: '中船特气', market: 'A股',
      substage: 'L1', categories: ['xef2'],
      financials: { fixedCostRatio: 0.58, aiRevenuePct: 0.10, dol: 2.78 },
      note: '新型刻蚀气体研发中；MEMS和先进封装应用方向'
    },

    // ═══════════════════════════════════════════════════════
    // 算力特气组 — 羰基硫 (cos) L1
    // ═══════════════════════════════════════════════════════
    co_270: {
      id: 'co_270', ticker: '002409.SZ', name: '雅克科技', market: 'A股',
      substage: 'L1', categories: ['cos'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.10, dol: 2.22 },
      note: '3D NAND高深宽比刻蚀气体布局中'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — 光刻胶溶剂 (pgme) L1
    // ═══════════════════════════════════════════════════════
    co_300: {
      id: 'co_300', ticker: '300346.SZ', name: '南大光电', market: 'A股',
      substage: 'L1', categories: ['pgme'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.30, dol: 2.56 },
      note: '光刻胶材料平台；PGME/PGMEA光刻胶溶剂国产替代；抢日本市场'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — CMP抛光液/垫 (cmp) L2
    // ═══════════════════════════════════════════════════════
    co_310: {
      id: 'co_310', ticker: '688019.SH', name: '安集科技', market: 'A股',
      substage: 'L2', categories: ['cmp'],
      financials: { fixedCostRatio: 0.52, aiRevenuePct: 0.80, dol: 2.33 },
      note: 'CMP抛光液国产龙头；已进入长江存储供应链；化学机械抛光液+清洗液；分韩国存储份额'
    },
    co_311: {
      id: 'co_311', ticker: '688359.SH', name: '三孚新科', market: 'A股',
      substage: 'L2', categories: ['cmp'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.55, dol: 2.08 },
      note: 'CMP抛光垫/液布局；先进封装CMP应用'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — 电子化学品 (ec) L2
    // ═══════════════════════════════════════════════════════
    co_320: {
      id: 'co_320', ticker: '002409.SZ', name: '雅克科技', market: 'A股',
      substage: 'L2', categories: ['ec'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.45, dol: 2.22 },
      note: '电子化学品平台龙头；成熟制程高渗透率；分韩国存储份额'
    },
    co_321: {
      id: 'co_321', ticker: '300054.SZ', name: '鼎龙股份', market: 'A股',
      substage: 'L2', categories: ['ec'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.50, dol: 2.08 },
      note: '电子化学品+抛光垫双轮驱动；半导体材料平台'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — HBM封装料 (hbm_pkg) L1
    // ═══════════════════════════════════════════════════════
    co_330: {
      id: 'co_330', ticker: '002409.SZ', name: '雅克科技', market: 'A股',
      substage: 'L1', categories: ['hbm_pkg'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.20, dol: 2.22 },
      note: 'HBM封装材料布局中；前驱体+HBM封装料协同'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — ABF基板树脂 (abf) L1
    // ═══════════════════════════════════════════════════════
    co_340: {
      id: 'co_340', ticker: '603002.SH', name: '宏昌电子', market: 'A股',
      substage: 'L1', categories: ['abf'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.30, dol: 2.08 },
      note: '环氧树脂龙头；ABF载板用树脂国产替代；日本味之素垄断打破方向'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — 环氧模塑料 (emc) L2
    // ═══════════════════════════════════════════════════════
    co_350: {
      id: 'co_350', ticker: '603002.SH', name: '宏昌电子', market: 'A股',
      substage: 'L2', categories: ['emc'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.35, dol: 2.08 },
      note: '环氧树脂→EMC先进封装材料延伸；国产部分突破份额仍低'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — 光刻胶PR原料 (pr_raw) L1
    // ═══════════════════════════════════════════════════════
    co_360: {
      id: 'co_360', ticker: '300346.SZ', name: '南大光电', market: 'A股',
      substage: 'L1', categories: ['pr_raw'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.35, dol: 2.56 },
      note: '光刻胶上游树脂/PAG布局；抢日本光刻胶原料市场'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — SOD旋涂介质 (sod) L1
    // ═══════════════════════════════════════════════════════
    co_370: {
      id: 'co_370', ticker: '300346.SZ', name: '南大光电', market: 'A股',
      substage: 'L1', categories: ['sod'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.10, dol: 2.56 },
      note: 'SOD旋涂介质STI浅沟槽隔离填充材料布局；替代日本'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — 光敏聚酰亚胺 (pspi) L1
    // ═══════════════════════════════════════════════════════
    co_380: {
      id: 'co_380', ticker: '300429.SZ', name: '强力新材', market: 'A股',
      substage: 'L1', categories: ['pspi'],
      financials: { fixedCostRatio: 0.52, aiRevenuePct: 0.40, dol: 2.38 },
      note: '光固化材料龙头；PSPI先进封装介电层国产替代；替代日本Toray/HD Microsystems'
    },

    // ═══════════════════════════════════════════════════════
    // 算力材料组 — 导热界面材料 (tim) L2
    // ═══════════════════════════════════════════════════════
    co_390: {
      id: 'co_390', ticker: '300684.SZ', name: '中石科技', market: 'A股',
      substage: 'L2', categories: ['tim'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.60, dol: 1.96 },
      note: '导热界面材料龙头；3D封装散热+芯片堆叠热密度需求；AI服务器散热核心材料'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 溅射靶材 (sputter) L2
    // ═══════════════════════════════════════════════════════
    co_400: {
      id: 'co_400', ticker: '300706.SZ', name: '阿石创', market: 'A股',
      substage: 'L2', categories: ['sputter'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.70, dol: 2.56 },
      note: '溅射靶材国产龙头；已进入台积电供应链；分韩国存储份额+强制替代'
    },
    co_401: {
      id: 'co_401', ticker: '688352.SH', name: '颀中科技', market: 'A股',
      substage: 'L2', categories: ['sputter'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.60, dol: 2.22 },
      note: '半导体靶材；先进封装溅射靶材供应商'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 封装基板 (substrate) L1
    // ═══════════════════════════════════════════════════════
    co_410: {
      id: 'co_410', ticker: '002916.SZ', name: '深南电路', market: 'A股',
      substage: 'L1', categories: ['substrate', 'ic_sub'],
      financials: { fixedCostRatio: 0.52, aiRevenuePct: 0.45, dol: 2.33 },
      note: 'FC-BGA载板国产突破先锋；封装基板龙头；替代日本+美国；AI芯片封装载板'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 液冷板 (coldplate) L2
    // ═══════════════════════════════════════════════════════
    co_420: {
      id: 'co_420', ticker: '300499.SZ', name: '高澜股份', market: 'A股',
      substage: 'L2', categories: ['coldplate'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.75, dol: 1.96 },
      note: '液冷板龙头；AI服务器液冷渗透率快速提升；铝/铜液冷板；数据中心液冷解决方案'
    },
    co_421: {
      id: 'co_421', ticker: '300870.SZ', name: '欧陆通', market: 'A股',
      substage: 'L2', categories: ['coldplate'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.65, dol: 2.08 },
      note: '服务器电源+液冷散热；AI服务器液冷板+电源一体化方案'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — MLCC粉/钽电容 (mlcc) L2
    // ═══════════════════════════════════════════════════════
    co_430: {
      id: 'co_430', ticker: '300285.SZ', name: '国瓷材料', market: 'A股',
      substage: 'L2', categories: ['mlcc'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.50, dol: 2.17 },
      note: 'MLCC陶瓷粉国产龙头；下一代Rubin机柜核心被动元件；高容MLCC粉'
    },
    co_431: {
      id: 'co_431', ticker: '000962.SZ', name: '东方钽业', market: 'A股',
      substage: 'L2', categories: ['mlcc'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.30, dol: 2.44 },
      note: '钽电容用钽粉；AI服务器钽电容核心原料'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 电感磁粉 (mag_powder) L2
    // ═══════════════════════════════════════════════════════
    co_440: {
      id: 'co_440', ticker: '300748.SZ', name: '金力永磁', market: 'A股',
      substage: 'L2', categories: ['mag_powder', 'rare_earth'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.45, dol: 2.04 },
      note: '稀土永磁龙头；服务器电源电感磁粉上游磁材；AI数据中心+新能源车双驱动'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 焊锡粉/焊膏 (solder) L2
    // ═══════════════════════════════════════════════════════
    co_450: {
      id: 'co_450', ticker: '603002.SH', name: '宏昌电子', market: 'A股',
      substage: 'L2', categories: ['solder'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.20, dol: 2.08 },
      note: '先进封装微凸块(μ-bump)焊料布局'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — GaN射频衬底 (gan_rf) L2
    // ═══════════════════════════════════════════════════════
    co_460: {
      id: 'co_460', ticker: '600703.SH', name: '三安光电', market: 'A股',
      substage: 'L2', categories: ['gan_rf'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.50, dol: 2.56 },
      note: '化合物半导体龙头；GaN射频衬底/器件；氮化镓外延+芯片全链条；5G+AI雷达'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 大硅片 (si_wafer) L1
    // ═══════════════════════════════════════════════════════
    co_470: {
      id: 'co_470', ticker: '688126.SH', name: '沪硅产业', market: 'A股',
      substage: 'L1', categories: ['si_wafer'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.80, dol: 3.13 },
      note: '大硅片国产龙头；300mm大硅片抢日本信越/SUMCO份额；先进制程硅片国产替代'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — IC载板 (ic_sub) L2
    // ═══════════════════════════════════════════════════════
    co_480: {
      id: 'co_480', ticker: '002916.SZ', name: '深南电路', market: 'A股',
      substage: 'L2', categories: ['ic_sub'],
      financials: { fixedCostRatio: 0.52, aiRevenuePct: 0.40, dol: 2.33 },
      note: 'FC-BGA基板国产突破；ABF载板布局；AI芯片封装载板'
    },
    co_481: {
      id: 'co_481', ticker: '600183.SH', name: '生益科技', market: 'A股',
      substage: 'L2', categories: ['ic_sub'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.35, dol: 2.08 },
      note: '覆铜板/IC载板材料龙头；AI服务器PCB+IC载板'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 测试插座 (socket) L2
    // ═══════════════════════════════════════════════════════
    co_490: {
      id: 'co_490', ticker: '300567.SZ', name: '精测电子', market: 'A股',
      substage: 'L2', categories: ['socket'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.55, dol: 2.08 },
      note: '半导体测试设备龙头；先进封装测试插座国产替代日本'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 高速背板连接器 (connector) L2
    // ═══════════════════════════════════════════════════════
    co_500: {
      id: 'co_500', ticker: '002475.SZ', name: '立讯精密', market: 'A股',
      substage: 'L2', categories: ['connector'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.30, dol: 1.72 },
      note: '连接器龙头；112G/224G PAM4高速背板连接器；AI集群互联核心供应商'
    },

    // ═══════════════════════════════════════════════════════
    // 算力零件组 — 铜母线/Busbar (busbar) L2
    // ═══════════════════════════════════════════════════════
    co_510: {
      id: 'co_510', ticker: '002171.SZ', name: '楚江新材', market: 'A股',
      substage: 'L2', categories: ['busbar'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.25, dol: 2.04 },
      note: '铜加工龙头；AI服务器配电母线铜材；高电流密度需求'
    },

    // ═══════════════════════════════════════════════════════
    // 电算协同组 — HVDC高压直流 (hvdc) L2
    // ═══════════════════════════════════════════════════════
    co_600: {
      id: 'co_600', ticker: '600406.SH', name: '国电南瑞', market: 'A股',
      substage: 'L2', categories: ['hvdc', 'vpp'],
      financials: { fixedCostRatio: 0.42, aiRevenuePct: 0.35, dol: 1.79 },
      note: '电力自动化龙头；HVDC高压直流输电+虚拟电厂；AI数据中心标配；与特高压协同'
    },
    co_601: {
      id: 'co_601', ticker: '002028.SZ', name: '思源电气', market: 'A股',
      substage: 'L2', categories: ['hvdc'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.30, dol: 1.89 },
      note: '输配电设备龙头；HVDC替代UPS效率95%→98%；AI数据中心配电核心'
    },

    // ═══════════════════════════════════════════════════════
    // 电算协同组 — 液流电池 (vfb) L2
    // ═══════════════════════════════════════════════════════
    co_610: {
      id: 'co_610', ticker: '000629.SZ', name: '攀钢钒钛', market: 'A股',
      substage: 'L2', categories: ['vfb'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.20, dol: 2.17 },
      note: '全钒液流电池龙头；长时储能4-12h；AI数据中心备电+电网调峰；钒资源储量全球前列'
    },
    co_611: {
      id: 'co_611', ticker: '688707.SH', name: '振华新材', market: 'A股',
      substage: 'L2', categories: ['vfb'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.15, dol: 2.08 },
      note: '液流电池电解液/隔膜材料；铁铬液流电池方向'
    },

    // ═══════════════════════════════════════════════════════
    // 电算协同组 — 虚拟电厂 (vpp) L2
    // ═══════════════════════════════════════════════════════
    co_620: {
      id: 'co_620', ticker: '300001.SZ', name: '特锐德', market: 'A股',
      substage: 'L2', categories: ['vpp'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.89 },
      note: '充电桩+虚拟电厂双龙头；算力负荷参与电力市场；电力市场化改革受益'
    },

    // ═══════════════════════════════════════════════════════
    // 电算协同组 — PPA长协/绿电直供 (ppa) L3
    // ═══════════════════════════════════════════════════════
    co_630: {
      id: 'co_630', ticker: '601012.SH', name: '隆基绿能', market: 'A股',
      substage: 'L3', categories: ['ppa'],
      financials: { fixedCostRatio: 0.48, aiRevenuePct: 0.25, dol: 2.04 },
      note: '全球光伏龙头；AI客户签10年PPA长协；中国光伏产能80%+全球份额（反卡）'
    },
    co_631: {
      id: 'co_631', ticker: '688599.SH', name: '天合光能', market: 'A股',
      substage: 'L3', categories: ['ppa'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.25, dol: 2.17 },
      note: '光伏组件龙头+储能；数据中心绿电直供PPA'
    },

    // ═══════════════════════════════════════════════════════
    // 电算协同组 — 碳积分/CCER (ccer) L2
    // ═══════════════════════════════════════════════════════
    co_640: {
      id: 'co_640', ticker: '600517.SH', name: '国网英大', market: 'A股',
      substage: 'L2', categories: ['ccer'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.30, dol: 1.69 },
      note: '碳资产管理+CCER交易平台；数据中心碳成本显性化；CCER重启受益'
    },

    // ═══════════════════════════════════════════════════════
    // 补充 — 中国公司港股（港股通标的）
    // ═══════════════════════════════════════════════════════
    co_900: {
      id: 'co_900', ticker: '03800.HK', name: '保利协鑫能源', market: '港股',
      substage: 'L2', categories: ['si_wafer'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.60, dol: 2.56 },
      note: '多晶硅+硅片龙头；大硅片上游原料；港股通标的'
    },
  };

  // ── 辅助方法 ────────────────────────────────────────────

  /** 按品类取公司列表 */
  function getCompaniesByCategory(catId) {
    const cat = categories[catId];
    if (!cat) return [];
    return cat.companies.map(cid => companies[cid]).filter(Boolean);
  }

  /** 按公司取品类列表 */
  function getCategoriesByCompany(coId) {
    const co = companies[coId];
    if (!co) return [];
    return co.categories.map(cid => categories[cid]).filter(Boolean);
  }

  /** 按市场筛选（'A股' | '港股'） */
  function getCompaniesByMarket(market) {
    return Object.values(companies).filter(c => c.market === market);
  }

  /** 按国产替代阶段筛选（'L1' | 'L2' | 'L3'） */
  function getCompaniesBySubstage(stage) {
    return Object.values(companies).filter(c => c.substage === stage);
  }

  /** 按品类组别汇总 */
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

  /** 全局统计 */
  function getStats() {
    const catIds = Object.keys(categories);
    const coIds = Object.keys(companies);
    const l3Cats = catIds.filter(id => categories[id].substage === 'L3').length;
    const l2Cats = catIds.filter(id => categories[id].substage === 'L2').length;
    const l1Cats = catIds.filter(id => categories[id].substage === 'L1').length;

    // 有公司的品类数
    const mappedCats = catIds.filter(id => categories[id].companies.length > 0).length;

    // A股/港股拆分
    const aShare = coIds.filter(id => companies[id].market === 'A股').length;
    const hkShare = coIds.filter(id => companies[id].market === '港股').length;

    // 平均弹性（仅已校准的品类）
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

  /** 搜索公司或品类（模糊匹配） */
  function search(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return { categories: Object.keys(categories), companies: Object.keys(companies) };

    const matchedCats = [];
    for (const [id, cat] of Object.entries(categories)) {
      if (cat.name.toLowerCase().includes(q) || cat.id.includes(q) || cat.note.toLowerCase().includes(q)) {
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

  /** 数据完整性校验 */
  function validate() {
    const errors = [];
    const warnings = [];

    // 1. 公司→品类引用完整性
    for (const [coId, co] of Object.entries(companies)) {
      for (const catId of co.categories) {
        if (!categories[catId]) {
          errors.push(`公司 ${co.name} (${coId}) 引用了不存在的品类: ${catId}`);
        }
      }
    }

    // 2. 品类→公司引用完整性
    for (const [catId, cat] of Object.entries(categories)) {
      for (const coId of cat.companies) {
        if (!companies[coId]) {
          errors.push(`品类 ${cat.name} (${catId}) 引用了不存在的公司: ${coId}`);
        }
        // 反向引用一致性
        if (companies[coId] && !companies[coId].categories.includes(catId)) {
          warnings.push(`品类 ${catId} 引用了公司 ${coId}，但公司 ${coId} 未反向引用该品类`);
        }
      }
    }

    // 3. 公司 ID 唯一性
    // （object key 已保证）

    // 4. 品类组别合法性
    const validGroups = new Set(categoryGroups.map(g => g.id));
    for (const [catId, cat] of Object.entries(categories)) {
      if (!validGroups.has(cat.group)) {
        errors.push(`品类 ${cat.name} (${catId}) 的组别 ${cat.group} 不在预定义组别中`);
      }
    }

    // 5. 国产阶段合法性
    const validStages = new Set(['L1', 'L2', 'L3']);
    for (const [catId, cat] of Object.entries(categories)) {
      if (!validStages.has(cat.substage)) {
        errors.push(`品类 ${cat.name} (${catId}) 的 substage ${cat.substage} 无效`);
      }
    }
    for (const [coId, co] of Object.entries(companies)) {
      if (!validStages.has(co.substage)) {
        errors.push(`公司 ${co.name} (${coId}) 的 substage ${co.substage} 无效`);
      }
    }

    // 6. 弹性系数范围检查
    for (const [catId, cat] of Object.entries(categories)) {
      if (cat.elasticity !== null) {
        if (cat.elasticity < 0.5 || cat.elasticity > 7.0) {
          warnings.push(`品类 ${cat.name} (${catId}) 弹性系数 ${cat.elasticity} 超出预期范围 [0.5, 7.0]`);
        }
      }
    }

    // 汇总
    if (errors.length > 0) {
      console.error('[UPSTREAM_DATA] 数据校验失败:', errors);
    }
    if (warnings.length > 0) {
      console.warn('[UPSTREAM_DATA] 数据校验警告:', warnings);
    }
    if (errors.length === 0 && warnings.length === 0) {
      console.log('[UPSTREAM_DATA] ✓ 数据校验通过 — %d 品类, %d 公司',
        Object.keys(categories).length, Object.keys(companies).length);
    }

    // 5. 政策红利 / 卡脖字段完整性（v0.1 新加）
    const validPB = new Set(['strong', 'medium', 'weak']);
    const validCP = new Set(['leverage', 'reverse', 'none']);
    for (const [catId, cat] of Object.entries(categories)) {
      if (!cat.policyBoost || !validPB.has(cat.policyBoost)) {
        errors.push(`品类 ${cat.name} (${catId}) policyBoost 缺失或非法: "${cat.policyBoost}"`);
      }
      if (!cat.chokepoint || !validCP.has(cat.chokepoint)) {
        errors.push(`品类 ${cat.name} (${catId}) chokepoint 缺失或非法: "${cat.chokepoint}"`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /** 按卡脖维度筛选 */
  function getCategoriesByChokepoint(cp) {
    return Object.entries(categories)
      .filter(([, c]) => c.chokepoint === cp)
      .map(([id]) => id);
  }

  /** 按政策红利强度筛选 */
  function getCategoriesByPolicyBoost(level) {
    return Object.entries(categories)
      .filter(([, c]) => c.policyBoost === level)
      .map(([id]) => id);
  }

  // ── 导出 ────────────────────────────────────────────────
  window.UPSTREAM_DATA = {
    // 原始数据（只读视图）
    get categories() { return categories; },
    get companies() { return companies; },
    get categoryGroups() { return categoryGroups; },

    // 元数据
    meta: Object.freeze({
      lastUpdated: '2026-07-06T16:30:00+08:00',
      version: '0.3.0',  // v0.3: Vibe-Trading 辅助填充公司+弹性数据
      fields: {
        policyBoost: ['strong', 'medium', 'weak'],
        chokepoint:  ['leverage', 'reverse', 'none'],
      },
      totalCategories: Object.keys(categories).length,
      totalCompanies: Object.keys(companies).length,
      sources: ['券商研报', '年报主营业务构成', 'Vibe-Trading web_search 交叉验证'],
      methodology: 'docs/upstream-methodology.md'
    }),

    // 辅助方法扩展
    getCategoriesByChokepoint,
    getCategoriesByPolicyBoost,
    getCategoryGroupSummary,

    // 方法
    getCompaniesByCategory,
    getCategoriesByCompany,
    getCompaniesByMarket,
    getCompaniesBySubstage,
    getCategoryGroupSummary,
    getStats,
    search,
    validate
  };

})();
