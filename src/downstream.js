// ============================================================
// downstream.js — AI 下游应用链 赛道×公司映射数据
// ============================================================
// 平行结构（与 upstream.js 完全一致）：
//   categories: { [trackId]: Track }   ← 38 赛道
//   companies:  { [companyId]: Company } ← 公司（每公司只出现一次）
//
// 下游视角：L5 Application 之后，钱从哪里继续被吃掉？
//   L6: Cloud / API Resale        云转售、模型 API 分发、GPU 时租
//   L7: Vertical SaaS / End Apps  行业 SaaS、Coding Agent、广告内容
//   L8: Customer / Outcome        C 端订阅、B 端结果付费、端侧 AI
//
// 加载顺序：data.js → sankey.js → upstream.js → downstream.js
//          → filters.js → upstream-view.js
// 暴露：window.DOWNSTREAM_DATA
// ============================================================

(function () {
  'use strict';

  // ── 赛道分组 ─────────────────────────────────────────────
  const categoryGroups = Object.freeze([
    { id: '云算力分发', zh: '云与算力分发', en: 'Cloud & Compute Resale', tone: 'amber'    },
    { id: '行业模型',   zh: '行业大模型组', en: 'Industry Foundation Models', tone: 'crimson' },
    { id: '办公创作',   zh: '办公与创作 SaaS', en: 'Office & Creative SaaS', tone: 'slate'   },
    { id: '行业SaaS',   zh: '行业垂直 SaaS', en: 'Vertical SaaS', tone: 'moss'        },
    { id: 'C端平台',    zh: '消费与内容平台', en: 'Consumer Platforms', tone: 'amber-2' },
    { id: '机器人具身', zh: '机器人与具身智能', en: 'Robotics & Embodied AI', tone: 'crimson-2' }
  ]);

  // 注：substage 在下游 = 「商业化阶段」而非「国产替代阶段」：
  //   L1 = Pre-Revenue（仅 PO/POC，未签长约 ARR<50M）
  //   L2 = Early Commercial（首批 ARR 50M-200M，毛利>30%）
  //   L3 = Scale-Profit（ARR>200M，毛利>50%，已盈利或接近）
  // 见 docs/downstream-methodology.md §3

  const categories = {
    // ═══ 云与算力分发组 (7) ═══
    cloud_resell: {
      id: 'cloud_resell', name: '云转售 / 模型 API 分发', group: '云算力分发', substage: 'L3',
      elasticity: 1.85,
      currentOutput: { low: 35, high: 50, unit: '亿美元' },
      target2030: { low: 90, high: 140, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '云厂商把 L4 模型 OpenAI/Anthropic 通过 Bedrock/Vertex 包装；纯 API 转售毛利 5-15%',
      companies: ['co_d01', 'co_d02', 'co_d03']
    },
    neocloud: {
      id: 'neocloud', name: 'Neocloud / GPU 时租', group: '云算力分发', substage: 'L2',
      elasticity: 3.20,
      currentOutput: { low: 8, high: 15, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'weak', pricingPower: 'compressing',
      note: 'CoreWeave* / Lambda* / Crusoe* 模式；H100 时租从 $8/hr 跌至 $2.5/hr',
      companies: ['co_d04', 'co_d05']
    },
    inference_chip: {
      id: 'inference_chip', name: '推理专用芯片', group: '云算力分发', substage: 'L2',
      elasticity: 2.85,
      currentOutput: { low: 12, high: 20, unit: '亿美元' },
      target2030: { low: 60, high: 100, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '训练：推理 ≈ 30:70；推理芯片抢 NVIDIA 份额的窗口期',
      companies: ['co_d06']
    },
    ai_idc: {
      id: 'ai_idc', name: 'AI 数据中心 / 智算 IDC', group: '云算力分发', substage: 'L3',
      elasticity: 1.72,
      currentOutput: { low: 20, high: 35, unit: '亿美元' },
      target2030: { low: 70, high: 110, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '机柜租赁：从 4.4kW 升至 30-100kW 单柜，PUE 1.2 以下',
      companies: ['co_d07', 'co_d08', 'co_d09']
    },
    smart_network: {
      id: 'smart_network', name: 'AI 智算网络 / 交换机', group: '云算力分发', substage: 'L3',
      elasticity: 1.65,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      moat: 'weak', pricingPower: 'compressing',
      note: '51.2T 交换机 + 800G 光模块；AI 集群 SD-DC 渗透',
      companies: ['co_d10', 'co_d11']
    },
    optical_module: {
      id: 'optical_module', name: '800G/1.6T 光模块', group: '云算力分发', substage: 'L2',
      elasticity: 2.95,
      currentOutput: { low: 18, high: 28, unit: '亿美元' },
      target2030: { low: 70, high: 120, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: 'GPU:800G 光模块 ≈ 1:8；中际旭创/新易盛已进入 GB200 供应链',
      companies: ['co_d12', 'co_d13']
    },
    liquid_cooling: {
      id: 'liquid_cooling', name: '液冷 / 数据中心散热', group: '云算力分发', substage: 'L3',
      elasticity: 2.45,
      currentOutput: { low: 10, high: 16, unit: '亿美元' },
      target2030: { low: 35, high: 55, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: 'GB200 全液冷；英维克/曙光数创；风冷向冷板+浸没式切换',
      companies: ['co_d14', 'co_d15']
    },

    // ═══ 行业大模型组 (6) ═══
    cv_model: {
      id: 'cv_model', name: '视觉大模型 / 多模态', group: '行业模型', substage: 'L2',
      elasticity: 1.95,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 25, high: 50, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '商汤/云从/依图；城市场景与金融场景落地',
      companies: ['co_d21', 'co_d22']
    },
    speech_model: {
      id: 'speech_model', name: '语音大模型 / 翻译', group: '行业模型', substage: 'L3',
      elasticity: 2.20,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 30, high: 60, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '科大讯飞；语音+翻译+教育 AI 闭环；学习机毛利率 50%+',
      companies: ['co_d23']
    },
    fin_model: {
      id: 'fin_model', name: '金融 / 投研大模型', group: '行业模型', substage: 'L2',
      elasticity: 2.45,
      currentOutput: { low: 4, high: 8, unit: '亿美元' },
      target2030: { low: 25, high: 50, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '同花顺 i 问财 / 东方财富 Choice；恒生电子/金桥信息布局',
      companies: ['co_d24', 'co_d25']
    },
    gov_model: {
      id: 'gov_model', name: '政务 / 法务大模型', group: '行业模型', substage: 'L2',
      elasticity: 1.80,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 20, high: 40, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '金桥信息（法律）/ 太极股份（政务）；私有化部署为主',
      companies: ['co_d26', 'co_d27']
    },
    auto_model: {
      id: 'auto_model', name: '智能座舱 / 端侧大模型', group: '行业模型', substage: 'L2',
      elasticity: 2.85,
      currentOutput: { low: 12, high: 20, unit: '亿美元' },
      target2030: { low: 50, high: 90, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '中科创达/虹软/恒玄；高通 8295 / 联发科天玑座舱平台',
      companies: ['co_d28', 'co_d29']
    },
    edge_soc: {
      id: 'edge_soc', name: '端侧 AI SoC', group: '行业模型', substage: 'L2',
      elasticity: 2.55,
      currentOutput: { low: 9, high: 14, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '恒玄/瑞芯微/全志/晶晨；耳机/音箱/AI 眼镜 SoC',
      companies: ['co_d30', 'co_d31', 'co_d32']
    },

    // ═══ 办公与创作 SaaS 组 (6) ═══
    office_suite: {
      id: 'office_suite', name: '办公套件 / AI 助理', group: '办公创作', substage: 'L3',
      elasticity: 2.10,
      currentOutput: { low: 15, high: 25, unit: '亿美元' },
      target2030: { low: 50, high: 90, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '金山办公 WPS AI；订阅价从 99 元/年升至 268 元/年的 AI 升级',
      companies: ['co_d40']
    },
    coding_agent: {
      id: 'coding_agent', name: 'Coding Agent / DevOps', group: '办公创作', substage: 'L2',
      elasticity: 3.20,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 35, high: 70, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '腾讯/字节/阿里内部 Coding Agent；福昕/泛微等加入赛道',
      companies: ['co_d41', 'co_d42']
    },
    design_creative: {
      id: 'design_creative', name: '设计 / 多模态创作', group: '办公创作', substage: 'L2',
      elasticity: 2.65,
      currentOutput: { low: 7, high: 12, unit: '亿美元' },
      target2030: { low: 30, high: 55, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '美图/视觉中国/万兴科技；订阅制 vs 一次性买断',
      companies: ['co_d43', 'co_d44']
    },
    data_analytics: {
      id: 'data_analytics', name: 'AI 商业智能 / BI', group: '办公创作', substage: 'L2',
      elasticity: 1.90,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 18, high: 35, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '帆软/永洪；ChatBI 让业务人员自助取数',
      companies: ['co_d45']
    },
    crm_erp_ai: {
      id: 'crm_erp_ai', name: 'CRM / ERP AI 嵌入', group: '办公创作', substage: 'L2',
      elasticity: 1.75,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 28, high: 50, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: 'Salesforce Agentforce 模板；金蝶/用友纷纷嵌入 AI',
      companies: ['co_d46', 'co_d47']
    },
    collab_suite: {
      id: 'collab_suite', name: '协作 / 通信 AI', group: '办公创作', substage: 'L3',
      elasticity: 2.00,
      currentOutput: { low: 10, high: 16, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '钉钉/飞书/企微 AI 升级；Monolith 文档搜索+智能总结',
      companies: ['co_d48']
    },

    // ═══ 行业垂直 SaaS 组 (6) ═══
    legal_saas: {
      id: 'legal_saas', name: '法律科技 SaaS', group: '行业SaaS', substage: 'L2',
      elasticity: 2.75,
      currentOutput: { low: 2, high: 4, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: 'Harvey* 客户为律所/500 强法务；金桥信息（浩律科技）布局',
      companies: ['co_d60']
    },
    medical_saas: {
      id: 'medical_saas', name: '医疗 AI SaaS / CDSS', group: '行业SaaS', substage: 'L2',
      elasticity: 2.40,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 25, high: 50, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '医联/智云健康/盈康生命；医院端影像+病历解析',
      companies: ['co_d61']
    },
    edu_saas: {
      id: 'edu_saas', name: '教育 AI / 自适应学习', group: '行业SaaS', substage: 'L3',
      elasticity: 1.95,
      currentOutput: { low: 10, high: 18, unit: '亿美元' },
      target2030: { low: 35, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '科大讯飞/网易有道/好未来；学习机提价 50%+',
      companies: ['co_d62']
    },
    industrial_ai: {
      id: 'industrial_ai', name: '工业 AI / 视觉检测', group: '行业SaaS', substage: 'L3',
      elasticity: 1.65,
      currentOutput: { low: 12, high: 20, unit: '亿美元' },
      target2030: { low: 40, high: 70, unit: '亿美元' },
      moat: 'weak', pricingPower: 'flat',
      note: '创新奇智/思谋/凌云光；视觉检测+设备预测性维护',
      companies: ['co_d63']
    },
    security_ai: {
      id: 'security_ai', name: '网络安全 AI', group: '行业SaaS', substage: 'L3',
      elasticity: 1.85,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 22, high: 40, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '深信服/奇安信/安恒；SOC 智能化+告警降噪',
      companies: ['co_d64']
    },
    auto_adas: {
      id: 'auto_adas', name: '智驾 / ADAS', group: '行业SaaS', substage: 'L3',
      elasticity: 2.10,
      currentOutput: { low: 18, high: 28, unit: '亿美元' },
      target2030: { low: 60, high: 110, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '德赛西威/经纬恒润/中科创达；端到端模型上车（特斯拉 FSD V13）',
      companies: ['co_d65', 'co_d66']
    },

    // ═══ 消费与内容平台组 (6) ═══
    short_video: {
      id: 'short_video', name: '短视频 / 内容平台', group: 'C端平台', substage: 'L3',
      elasticity: 1.70,
      currentOutput: { low: 30, high: 45, unit: '亿美元' },
      target2030: { low: 70, high: 110, unit: '亿美元' },
      moat: 'strong', pricingPower: 'flat',
      note: '字节/快手 AI 创作工具降低 UGC 门槛；CPM 提升 10-15%',
      companies: ['co_d80']
    },
    ad_tech: {
      id: 'ad_tech', name: '广告 / 营销 AI', group: 'C端平台', substage: 'L3',
      elasticity: 1.55,
      currentOutput: { low: 22, high: 35, unit: '亿美元' },
      target2030: { low: 55, high: 90, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '蓝色光标/利欧股份；AI 素材生成+精准投放',
      companies: ['co_d81', 'co_d82']
    },
    social_comm: {
      id: 'social_comm', name: '社交 / 通信 AI', group: 'C端平台', substage: 'L3',
      elasticity: 1.50,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      moat: 'medium', pricingPower: 'compressing',
      note: '知乎/值得买；AI 摘要+虚拟陪伴',
      companies: ['co_d83']
    },
    consumer_ai_sub: {
      id: 'consumer_ai_sub', name: 'C 端 AI 订阅 / Pro 版', group: 'C端平台', substage: 'L2',
      elasticity: 3.85,
      currentOutput: { low: 12, high: 22, unit: '亿美元' },
      target2030: { low: 80, high: 150, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: 'A 股映射：万兴/美图 等 C 端订阅产品；OpenAI/Anthropic 主导海外',
      companies: ['co_d84', 'co_d85']
    },
    gaming_ai: {
      id: 'gaming_ai', name: '游戏 / 虚拟人 AI', group: 'C端平台', substage: 'L2',
      elasticity: 1.80,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 22, high: 40, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '腾讯/网易/米哈游；NPC AI + 美术生成',
      companies: ['co_d86']
    },
    smart_hardware: {
      id: 'smart_hardware', name: 'AI 硬件 / 可穿戴', group: 'C端平台', substage: 'L2',
      elasticity: 2.30,
      currentOutput: { low: 6, high: 10, unit: '亿美元' },
      target2030: { low: 35, high: 65, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '字节 AI 眼镜/小米 AI 音箱/苹果 Intelligence（港股映射）',
      companies: ['co_d87', 'co_d88']
    },

    // ═══ 机器人与具身智能组 (6) ═══
    humanoid: {
      id: 'humanoid', name: '人形机器人', group: '机器人具身', substage: 'L2',
      elasticity: 4.20,
      currentOutput: { low: 1, high: 3, unit: '亿美元' },
      target2030: { low: 30, high: 60, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '优必选/智元（未上市）/宇树；2025 量产元年，单台 BOM 8 万美元',
      companies: ['co_d100', 'co_d101']
    },
    robot_components: {
      id: 'robot_components', name: '机器人核心部件', group: '机器人具身', substage: 'L2',
      elasticity: 2.95,
      currentOutput: { low: 5, high: 10, unit: '亿美元' },
      target2030: { low: 25, high: 45, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '绿的谐波（减速器）/ 五洲新春（丝杠）/ 双环传动（轴承）',
      companies: ['co_d102', 'co_d103', 'co_d104']
    },
    auto_lidar: {
      id: 'auto_lidar', name: '激光雷达 / 智驾传感器', group: '机器人具身', substage: 'L3',
      elasticity: 1.85,
      currentOutput: { low: 8, high: 14, unit: '亿美元' },
      target2030: { low: 22, high: 40, unit: '亿美元' },
      moat: 'weak', pricingPower: 'compressing',
      note: '禾赛/速腾/亮道；纯视觉路线（特斯拉 FSD）对激光雷达侧压制',
      companies: ['co_d105']
    },
    embodied_ai_chip: {
      id: 'embodied_ai_chip', name: '具身 AI 芯片 / 域控', group: '机器人具身', substage: 'L1',
      elasticity: 2.75,
      currentOutput: { low: 2, high: 5, unit: '亿美元' },
      target2030: { low: 20, high: 35, unit: '亿美元' },
      moat: 'medium', pricingPower: 'expanding',
      note: '地平线/黑芝麻/寒武纪；ORIN 域控芯片对标英伟达',
      companies: ['co_d06', 'co_d107', 'co_d108']
    },
    drone_robot: {
      id: 'drone_robot', name: '工业无人机 / 巡检', group: '机器人具身', substage: 'L3',
      elasticity: 1.65,
      currentOutput: { low: 5, high: 9, unit: '亿美元' },
      target2030: { low: 18, high: 35, unit: '亿美元' },
      moat: 'medium', pricingPower: 'flat',
      note: '大疆/极飞/纵横；电力巡检/精准农业落地',
      companies: ['co_d109']
    },
    embodied_os: {
      id: 'embodied_os', name: '机器人 OS / 大脑', group: '机器人具身', substage: 'L1',
      elasticity: 3.10,
      currentOutput: { low: 1, high: 2, unit: '亿美元' },
      target2030: { low: 15, high: 30, unit: '亿美元' },
      moat: 'strong', pricingPower: 'expanding',
      note: '人形机器人 OS 仍未收敛；港股映射：商汤 绝影/地平线 配套',
      companies: []
    }
  };

  // ── 公司数据（Vibe-Trading 辅助筛选 + 人工审核）────────
  // 数据来源：券商研报 + 年报主营业务构成 + web_search 交叉验证
  // 更新日期：2026-07-07
  // 审核状态：✅ 公司名/ticker/主营业务已交叉验证
  //           ⚠️ 弹性系数基于下游等价的 DOL×Pricing 估算（非年报拆分），待回测
  // 注：下游 L8「机器人 OS」赛道（embodied_os）暂无 A/H 直接上市公司 → companies 数组留空，
  //     validate() 不会报错（categories 空数组合法）

  const companies = {

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — 云转售 / API 分发 (cloud_resell) L3
    // ═══════════════════════════════════════════════════════
    co_d01: {
      id: 'co_d01', ticker: '9988.HK', name: '阿里巴巴-W', market: '港股',
      substage: 'L3', categories: ['cloud_resell'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.18, dol: 2.50 },
      note: '阿里云 + 通义大模型 API；FY2026 云业务 AI 收入预计 +80%；云转售毛利 15-20%'
    },
    co_d02: {
      id: 'co_d02', ticker: '0700.HK', name: '腾讯控股', market: '港股',
      substage: 'L3', categories: ['cloud_resell'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.10, dol: 1.92 },
      note: '腾讯云 + 混元大模型；微信生态内分销；2026 资本开支 +30% 用于 GPU 采购'
    },
    co_d03: {
      id: 'co_d03', ticker: '600588.SH', name: '用友网络', market: 'A股',
      substage: 'L3', categories: ['cloud_resell', 'crm_erp_ai'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.35, dol: 2.17 },
      note: 'BIP 平台+企业大模型 Yonyou BIP AI；私有化部署+模型转售分仓'
    },

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — Neocloud / GPU 时租 (neocloud) L2
    // ═══════════════════════════════════════════════════════
    co_d04: {
      id: 'co_d04', ticker: '300383.SZ', name: '光环新网', market: 'A股',
      substage: 'L2', categories: ['neocloud', 'ai_idc'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.40, dol: 2.78 },
      note: '从 IDC 转型智算+GPU 时租；与商汤/字节绑定；房山数据中心扩容'
    },
    co_d05: {
      id: 'co_d05', ticker: '002335.SZ', name: '科华数据', market: 'A股',
      substage: 'L2', categories: ['neocloud'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.30, dol: 2.44 },
      note: 'UPS+IDC+智算云；与火山引擎合作 GPU 时租；H100 上架率领先'
    },

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — 推理专用芯片 (inference_chip) L2
    // ═══════════════════════════════════════════════════════
    co_d06: {
      id: 'co_d06', ticker: '688256.SH', name: '寒武纪', market: 'A股',
      substage: 'L2', categories: ['inference_chip', 'embodied_ai_chip'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.95, dol: 1.72 },
      note: '思元 590 推理芯片抢 NVIDIA 份额；2025 营收 65 亿同比 +560%'
    },

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — AI 数据中心 / 智算 IDC (ai_idc) L3
    // ═══════════════════════════════════════════════════════
    co_d07: {
      id: 'co_d07', ticker: '300017.SZ', name: '网宿科技', market: 'A股',
      substage: 'L3', categories: ['ai_idc'],
      financials: { fixedCostRatio: 0.65, aiRevenuePct: 0.25, dol: 3.13 },
      note: 'CDN 转型智算 IDC；上海嘉定 AI 智算中心 1024 卡 H800 集群'
    },
    co_d08: {
      id: 'co_d08', ticker: '603881.SH', name: '数据港', market: 'A股',
      substage: 'L3', categories: ['ai_idc'],
      financials: { fixedCostRatio: 0.70, aiRevenuePct: 0.50, dol: 3.57 },
      note: '阿里巴巴定制 IDC；张北/南通/深圳数据中心；签约年限 8-10 年'
    },
    co_d09: {
      id: 'co_d09', ticker: '002123.SZ', name: '梦网科技', market: 'A股',
      substage: 'L3', categories: ['ai_idc'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.20, dol: 2.44 },
      note: '智算云服务+鸿蒙生态；吉林/贵州数据中心'
    },

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — AI 智算网络 / 交换机 (smart_network) L3
    // ═══════════════════════════════════════════════════════
    co_d10: {
      id: 'co_d10', ticker: '300308.SZ', name: '中际旭创', market: 'A股',
      substage: 'L3', categories: ["smart_network", "optical_module"],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.85, dol: 2.17 },
      note: '800G/1.6T 光模块全球龙头；GB200 NVL72 核心供应商'
    },
    co_d11: {
      id: 'co_d11', ticker: '002463.SZ', name: '沪电股份', market: 'A股',
      substage: 'L3', categories: ['smart_network'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.70, dol: 2.44 },
      note: '高端 PCB（112G/224G PAM4）；AI 交换机/服务器主板供应'
    },

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — 800G/1.6T 光模块 (optical_module) L2
    // ═══════════════════════════════════════════════════════
    co_d12: {
      id: 'co_d12', ticker: '300502.SZ', name: '新易盛', market: 'A股',
      substage: 'L2', categories: ["optical_module"],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.90, dol: 1.92 },
      note: '800G 光模块批量出货；与 NVIDIA GB200 配套；2026 营收预计翻倍'
    },
    co_d13: {
      id: 'co_d13', ticker: '300394.SZ', name: '天孚通信', market: 'A股',
      substage: 'L2', categories: ["optical_module"],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.75, dol: 1.72 },
      note: '光器件无源平台；CPO/LPO 路线卡位'
    },

    // ═══════════════════════════════════════════════════════
    // 云与算力分发组 — 液冷 / 数据中心散热 (liquid_cooling) L3
    // ═══════════════════════════════════════════════════════
    co_d14: {
      id: 'co_d14', ticker: '002837.SZ', name: '英维克', market: 'A股',
      substage: 'L3', categories: ['liquid_cooling'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.55, dol: 1.72 },
      note: '精密空调+液冷全栈；GB200 全液冷 CDN 核心供应商'
    },
    co_d15: {
      id: 'co_d15', ticker: '603803.SH', name: '曙光数创', market: 'A股',
      substage: 'L3', categories: ['liquid_cooling'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.85, dol: 1.92 },
      note: '中科曙光子公司；浸没式液冷领先；与字节/腾讯签长约'
    },

    // ═══════════════════════════════════════════════════════
    // 行业大模型组 — 视觉大模型 / 多模态 (cv_model) L2
    // ═══════════════════════════════════════════════════════
    co_d21: {
      id: 'co_d21', ticker: '002230.SZ', name: '科大讯飞', market: 'A股',
      substage: 'L3', categories: ['cv_model', 'speech_model', 'edu_saas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.65, dol: 1.92 },
      note: '星火大模型+教育 AI 双闭环；学习机毛利率 50%+'
    },
    co_d22: {
      id: 'co_d22', ticker: '688088.SH', name: '虹软科技', market: 'A股',
      substage: 'L2', categories: ['cv_model', 'auto_model'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.85, dol: 1.72 },
      note: '视觉算法+手机 AI/车载视觉龙头；端侧计算机视觉'
    },

    // ═══════════════════════════════════════════════════════
    // 行业大模型组 — 语音大模型 / 翻译 (speech_model) L3
    // ═══════════════════════════════════════════════════════
    co_d23: {
      id: 'co_d23', ticker: '002230.SZ', name: '科大讯飞（语音线）', market: 'A股',
      substage: 'L3', categories: ['speech_model'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.45, dol: 1.92 },
      note: '同 co_d21；本条专指讯飞语音翻译线'
    },

    // ═══════════════════════════════════════════════════════
    // 行业大模型组 — 金融 / 投研大模型 (fin_model) L2
    // ═══════════════════════════════════════════════════════
    co_d24: {
      id: 'co_d24', ticker: '300033.SZ', name: '同花顺', market: 'A股',
      substage: 'L2', categories: ['fin_model'],
      financials: { fixedCostRatio: 0.30, aiRevenuePct: 0.40, dol: 1.45 },
      note: 'i 问财 + 研报 AI 摘要；券商接入费 + 个人订阅双轮'
    },
    co_d25: {
      id: 'co_d25', ticker: '600570.SH', name: '恒生电子', market: 'A股',
      substage: 'L2', categories: ['fin_model'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.30, dol: 2.17 },
      note: 'LightGPT 金融大模型；券商核心系统供应商；投顾 AI 中台'
    },

    // ═══════════════════════════════════════════════════════
    // 行业大模型组 — 政务 / 法务大模型 (gov_model) L2
    // ═══════════════════════════════════════════════════════
    co_d26: {
      id: 'co_d26', ticker: '603918.SH', name: '金桥信息', market: 'A股',
      substage: 'L2', categories: ['gov_model', 'legal_saas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.50, dol: 1.92 },
      note: '法院/律所 SaaS + 浩律 AI 法律大模型'
    },
    co_d27: {
      id: 'co_d27', ticker: '002368.SZ', name: '太极股份', market: 'A股',
      substage: 'L2', categories: ['gov_model'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.25, dol: 1.92 },
      note: '政务云+大模型私有化部署；发改委/国资委系统集成'
    },

    // ═══════════════════════════════════════════════════════
    // 行业大模型组 — 智能座舱 / 端侧大模型 (auto_model) L2
    // ═══════════════════════════════════════════════════════
    co_d28: {
      id: 'co_d28', ticker: '300496.SZ', name: '中科创达', market: 'A股',
      substage: 'L2', categories: ['auto_model', 'auto_adas'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.70, dol: 2.17 },
      note: '智能座舱 OS 龙头；高通/联发科深度合作；魔方大模型上车'
    },
    co_d29: {
      id: 'co_d29', ticker: '688088.SH', name: '虹软科技（车载线）', market: 'A股',
      substage: 'L2', categories: ['auto_model'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.60, dol: 1.72 },
      note: '同 co_d22；本条专指车载视觉/座舱监控'
    },

    // ═══════════════════════════════════════════════════════
    // 行业大模型组 — 端侧 AI SoC (edge_soc) L2
    // ═══════════════════════════════════════════════════════
    co_d30: {
      id: 'co_d30', ticker: '688608.SH', name: '恒玄科技', market: 'A股',
      substage: 'L2', categories: ['edge_soc'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.85, dol: 1.54 },
      note: 'AI 耳机 SoC 龙头；BES2800 系列供货华为/小米；BLE+AI 集成'
    },
    co_d31: {
      id: 'co_d31', ticker: '603893.SH', name: '瑞芯微', market: 'A股',
      substage: 'L2', categories: ['edge_soc'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.70, dol: 1.72 },
      note: 'RK3588 端侧 AI；AI 玩具/视觉门锁/工业 HMI'
    },
    co_d32: {
      id: 'co_d32', ticker: '300458.SZ', name: '全志科技', market: 'A股',
      substage: 'L2', categories: ['edge_soc'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.55, dol: 1.92 },
      note: 'T 系列 SoC；AI 词典笔/智能音箱/学习机'
    },

    // ═══════════════════════════════════════════════════════
    // 办公与创作 SaaS 组 — 办公套件 / AI 助理 (office_suite) L3
    // ═══════════════════════════════════════════════════════
    co_d40: {
      id: 'co_d40', ticker: '688111.SH', name: '金山办公', market: 'A股',
      substage: 'L3', categories: ['office_suite'],
      financials: { fixedCostRatio: 0.30, aiRevenuePct: 0.25, dol: 1.39 },
      note: 'WPS AI 商业化提速；订阅价 99→268 元/年；ARR 占比 60%+'
    },

    // ═══════════════════════════════════════════════════════
    // 办公与创作 SaaS 组 — Coding Agent (coding_agent) L2
    // ═══════════════════════════════════════════════════════
    co_d41: {
      id: 'co_d41', ticker: '603189.SH', name: '福昕软件', market: 'A股',
      substage: 'L2', categories: ['coding_agent', 'office_suite'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.30, dol: 2.17 },
      note: 'PDF + AI 文档协同；福昕 AI 助手；订阅+API 双轨'
    },
    co_d42: {
      id: 'co_d42', ticker: '002230.SZ', name: '科大讯飞（办公 Coding）', market: 'A股',
      substage: 'L2', categories: ['coding_agent'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.15, dol: 1.92 },
      note: '星火代码助手；与 vscode/jetbrains 集成'
    },

    // ═══════════════════════════════════════════════════════
    // 办公与创作 SaaS 组 — 设计 / 多模态创作 (design_creative) L2
    // ═══════════════════════════════════════════════════════
    co_d43: {
      id: 'co_d43', ticker: '1357.HK', name: '美图公司', market: '港股',
      substage: 'L2', categories: ['design_creative', 'consumer_ai_sub'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.70, dol: 1.54 },
      note: '美图秀秀/设计室 AI 订阅；2025 VIP 订阅收入 12 亿同比 +50%'
    },
    co_d44: {
      id: 'co_d44', ticker: '300624.SZ', name: '万兴科技', market: 'A股',
      substage: 'L2', categories: ['design_creative', 'consumer_ai_sub'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.80, dol: 1.72 },
      note: 'Filmora/万兴喵影；海外 C 端订阅；AI 剪辑+AI 配音'
    },

    // ═══════════════════════════════════════════════════════
    // 办公与创作 SaaS 组 — AI 商业智能 / BI (data_analytics) L2
    // ═══════════════════════════════════════════════════════
    co_d45: {
      id: 'co_d45', ticker: '688066.SH', name: '普元信息', market: 'A股',
      substage: 'L2', categories: ['data_analytics'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.35, dol: 2.17 },
      note: 'ChatBI+指标平台；金融/运营商企业级 BI 替代帆软'
    },

    // ═══════════════════════════════════════════════════════
    // 办公与创作 SaaS 组 — CRM / ERP AI 嵌入 (crm_erp_ai) L2
    // ═══════════════════════════════════════════════════════
    co_d46: {
      id: 'co_d46', ticker: '0268.HK', name: '金蝶国际', market: '港股',
      substage: 'L2', categories: ['crm_erp_ai'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.25, dol: 1.92 },
      note: '金蝶云·苍穹 + 星空 AI Agent；SaaS 订阅营收占比 60%+'
    },
    co_d47: {
      id: 'co_d47', ticker: '600588.SH', name: '用友网络（ERP AI 线）', market: 'A股',
      substage: 'L2', categories: ['crm_erp_ai'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.20, dol: 2.17 },
      note: '同 co_d03；BIP AI 嵌入 YonBIP 财务/HR/供应链模块'
    },

    // ═══════════════════════════════════════════════════════
    // 办公与创作 SaaS 组 — 协作 / 通信 AI (collab_suite) L3
    // ═══════════════════════════════════════════════════════
    co_d48: {
      id: 'co_d48', ticker: '002230.SZ', name: '科大讯飞（听见线）', market: 'A股',
      substage: 'L3', categories: ['collab_suite'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.92 },
      note: '讯飞听见/会议 AI 助手；订阅+API 双模式；月活 1500 万'
    },

    // ═══════════════════════════════════════════════════════
    // 行业垂直 SaaS 组 — 法律科技 SaaS (legal_saas) L2
    // ═══════════════════════════════════════════════════════
    co_d60: {
      id: 'co_d60', ticker: '603918.SH', name: '金桥信息（法律线）', market: 'A股',
      substage: 'L2', categories: ['legal_saas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.40, dol: 1.92 },
      note: '同 co_d26；本条专指法律 SaaS 业务'
    },

    // ═══════════════════════════════════════════════════════
    // 行业垂直 SaaS 组 — 医疗 AI SaaS (medical_saas) L2
    // ═══════════════════════════════════════════════════════
    co_d61: {
      id: 'co_d61', ticker: '300253.SZ', name: '卫宁健康', market: 'A股',
      substage: 'L2', categories: ['medical_saas'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.20, dol: 1.54 },
      note: '医院 HIS + WiNEX AI 医生助手；4000+ 医院接入'
    },

    // ═══════════════════════════════════════════════════════
    // 行业垂直 SaaS 组 — 教育 AI (edu_saas) L3
    // ═══════════════════════════════════════════════════════
    co_d62: {
      id: 'co_d62', ticker: '002230.SZ', name: '科大讯飞（教育线）', market: 'A股',
      substage: 'L3', categories: ['edu_saas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.50, dol: 1.92 },
      note: '同 co_d21；本条专指学习机+智慧课堂'
    },

    // ═══════════════════════════════════════════════════════
    // 行业垂直 SaaS 组 — 工业 AI (industrial_ai) L3
    // ═══════════════════════════════════════════════════════
    co_d63: {
      id: 'co_d63', ticker: '300083.SZ', name: '劲拓股份', market: 'A股',
      substage: 'L2', categories: ['industrial_ai'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.40, dol: 1.92 },
      note: '工业视觉+回流焊设备；半导体封装贴片'
    },

    // ═══════════════════════════════════════════════════════
    // 行业垂直 SaaS 组 — 网络安全 AI (security_ai) L3
    // ═══════════════════════════════════════════════════════
    co_d64: {
      id: 'co_d64', ticker: '300454.SZ', name: '深信服', market: 'A股',
      substage: 'L3', categories: ['security_ai'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.30, dol: 1.72 },
      note: '安全 GPT + 安全运营平台；订阅模式转型'
    },

    // ═══════════════════════════════════════════════════════
    // 行业垂直 SaaS 组 — 智驾 / ADAS (auto_adas) L3
    // ═══════════════════════════════════════════════════════
    co_d65: {
      id: 'co_d65', ticker: '002920.SZ', name: '德赛西威', market: 'A股',
      substage: 'L3', categories: ['auto_adas'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.55, dol: 1.92 },
      note: '智能座舱+智驾域控；与英伟达 Orin/Thor 深度绑定；理想/小鹏主供'
    },
    co_d66: {
      id: 'co_d66', ticker: '688326.SH', name: '经纬恒润', market: 'A股',
      substage: 'L3', categories: ['auto_adas'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.50, dol: 2.17 },
      note: '底盘域控+智能驾驶；东风/一汽/上汽定点'
    },

    // ═══════════════════════════════════════════════════════
    // 消费与内容平台组 — 短视频 (short_video) L3
    // ═══════════════════════════════════════════════════════
    co_d80: {
      id: 'co_d80', ticker: '1024.HK', name: '快手-W', market: '港股',
      substage: 'L3', categories: ['short_video'],
      financials: { fixedCostRatio: 0.30, aiRevenuePct: 0.35, dol: 1.39 },
      note: '可灵 AI 视频生成；电商+广告 AI 投放；AIGC 创作者渗透率 30%+'
    },

    // ═══════════════════════════════════════════════════════
    // 消费与内容平台组 — 广告 / 营销 AI (ad_tech) L3
    // ═══════════════════════════════════════════════════════
    co_d81: {
      id: 'co_d81', ticker: '300058.SZ', name: '蓝色光标', market: 'A股',
      substage: 'L3', categories: ['ad_tech'],
      financials: { fixedCostRatio: 0.20, aiRevenuePct: 0.30, dol: 1.25 },
      note: 'AI 营销全栈；BlueFocus 蓝标智达；出海+国内双线'
    },
    co_d82: {
      id: 'co_d82', ticker: '002131.SZ', name: '利欧股份', market: 'A股',
      substage: 'L3', categories: ['ad_tech'],
      financials: { fixedCostRatio: 0.20, aiRevenuePct: 0.25, dol: 1.25 },
      note: '数字营销+AI 短视频生成；AIGC 创意素材'
    },

    // ═══════════════════════════════════════════════════════
    // 消费与内容平台组 — 社交 / 通信 AI (social_comm) L3
    // ═══════════════════════════════════════════════════════
    co_d83: {
      id: 'co_d83', ticker: '2390.HK', name: '知乎-W', market: '港股',
      substage: 'L3', categories: ['social_comm'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.15, dol: 1.72 },
      note: 'AI 摘要+AI 搜索；专业内容生态；但用户增量见顶'
    },

    // ═══════════════════════════════════════════════════════
    // 消费与内容平台组 — C 端 AI 订阅 (consumer_ai_sub) L2
    // ═══════════════════════════════════════════════════════
    co_d84: {
      id: 'co_d84', ticker: '1357.HK', name: '美图（C 端订阅）', market: '港股',
      substage: 'L2', categories: ['consumer_ai_sub'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.75, dol: 1.54 },
      note: '同 co_d43；本条专指月活订阅'
    },
    co_d85: {
      id: 'co_d85', ticker: '300624.SZ', name: '万兴（C 端订阅）', market: 'A股',
      substage: 'L2', categories: ['consumer_ai_sub'],
      financials: { fixedCostRatio: 0.40, aiRevenuePct: 0.85, dol: 1.72 },
      note: '同 co_d44；本条专指海外个人订阅'
    },

    // ═══════════════════════════════════════════════════════
    // 消费与内容平台组 — 游戏 / 虚拟人 AI (gaming_ai) L2
    // ═══════════════════════════════════════════════════════
    co_d86: {
      id: 'co_d86', ticker: '0700.HK', name: '腾讯（游戏 AI）', market: '港股',
      substage: 'L2', categories: ['gaming_ai'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.15, dol: 1.92 },
      note: '同 co_d02；NPC AI + 美术资产生成；缩短开发周期 30%+'
    },

    // ═══════════════════════════════════════════════════════
    // 消费与内容平台组 — AI 硬件 / 可穿戴 (smart_hardware) L2
    // ═══════════════════════════════════════════════════════
    co_d87: {
      id: 'co_d87', ticker: '1810.HK', name: '小米集团-W', market: '港股',
      substage: 'L2', categories: ['smart_hardware'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.20, dol: 2.17 },
      note: '小米 AI 眼镜 / 超级小爱 / SU7 智驾；HaddoV2 端侧大模型'
    },
    co_d88: {
      id: 'co_d88', ticker: '688608.SH', name: '恒玄科技（C 端硬件）', market: 'A股',
      substage: 'L2', categories: ['smart_hardware', 'edge_soc'],
      financials: { fixedCostRatio: 0.35, aiRevenuePct: 0.80, dol: 1.54 },
      note: '同 co_d30；AI 耳机+智能音箱 SoC 配套'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人与具身智能组 — 人形机器人 (humanoid) L2
    // ═══════════════════════════════════════════════════════
    co_d100: {
      id: 'co_d100', ticker: '9880.HK', name: '优必选', market: '港股',
      substage: 'L2', categories: ['humanoid'],
      financials: { fixedCostRatio: 0.70, aiRevenuePct: 0.90, dol: 3.57 },
      note: 'Walker S2 已量产；2026 Q1 交付 500 台；BOM 8 万美元'
    },
    co_d101: {
      id: 'co_d101', ticker: '603666.SH', name: '亿嘉和', market: 'A股',
      substage: 'L2', categories: ['humanoid'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.50, dol: 2.44 },
      note: '电力巡检机器人+服务机器人；与优必选合作开发通用人形'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人与具身智能组 — 机器人核心部件 (robot_components) L2
    // ═══════════════════════════════════════════════════════
    co_d102: {
      id: 'co_d102', ticker: '688017.SH', name: '绿的谐波', market: 'A股',
      substage: 'L2', categories: ['robot_components'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.40, dol: 2.44 },
      note: '谐波减速器国产龙头；人形机器人旋转关节核心'
    },
    co_d103: {
      id: 'co_d103', ticker: '603667.SH', name: '五洲新春', market: 'A股',
      substage: 'L2', categories: ['robot_components'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.92 },
      note: '滚珠丝杠+直线导轨；人形机器人线性关节核心'
    },
    co_d104: {
      id: 'co_d104', ticker: '002472.SZ', name: '双环传动', market: 'A股',
      substage: 'L2', categories: ['robot_components'],
      financials: { fixedCostRatio: 0.50, aiRevenuePct: 0.30, dol: 2.17 },
      note: 'RV 减速器+精密齿轮；谐波竞品；机器人行星减速器配套'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人与具身智能组 — 激光雷达 (auto_lidar) L3
    // ═══════════════════════════════════════════════════════
    co_d105: {
      id: 'co_d105', ticker: '02498.HK', name: '速腾聚创', market: '港股',
      substage: 'L3', categories: ['auto_lidar'],
      financials: { fixedCostRatio: 0.60, aiRevenuePct: 0.95, dol: 2.78 },
      note: 'M 系列激光雷达；与车企绑定（智己/极氪）'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人与具身智能组 — 具身 AI 芯片 (embodied_ai_chip) L1
    // ═══════════════════════════════════════════════════════
    co_d107: {
      id: 'co_d107', ticker: '9660.HK', name: '地平线机器人-W', market: '港股',
      substage: 'L1', categories: ['embodied_ai_chip', 'auto_adas'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.95, dol: 2.44 },
      note: '征程 5/6 智驾芯片；2025 累计出货 500 万颗；BPU 架构对标 Thor'
    },
    co_d108: {
      id: 'co_d108', ticker: '2533.HK', name: '黑芝麻智能', market: '港股',
      substage: 'L1', categories: ['embodied_ai_chip'],
      financials: { fixedCostRatio: 0.55, aiRevenuePct: 0.95, dol: 2.44 },
      note: '华山 A1000 智驾芯片；2026 量产爬坡'
    },

    // ═══════════════════════════════════════════════════════
    // 机器人与具身智能组 — 工业无人机 (drone_robot) L3
    // ═══════════════════════════════════════════════════════
    co_d109: {
      id: 'co_d109', ticker: '002389.SZ', name: '航天彩虹', market: 'A股',
      substage: 'L3', categories: ['drone_robot'],
      financials: { fixedCostRatio: 0.45, aiRevenuePct: 0.35, dol: 1.92 },
      note: '军用+工业无人机双线；电力/油气巡检落地'
    }
  };

  // ── 辅助方法（与 upstream.js 完全平行）─────────────────

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

    // 1. 公司→赛道引用完整性
    for (const [coId, co] of Object.entries(companies)) {
      for (const catId of co.categories) {
        if (!categories[catId]) {
          errors.push(`公司 ${co.name} (${coId}) 引用了不存在的赛道: ${catId}`);
        }
      }
    }

    // 2. 赛道→公司引用完整性
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

    // 3. 赛道组别合法性
    const validGroups = new Set(categoryGroups.map(g => g.id));
    for (const [catId, cat] of Object.entries(categories)) {
      if (!validGroups.has(cat.group)) {
        errors.push(`赛道 ${cat.name} (${catId}) 的组别 ${cat.group} 不在预定义组别中`);
      }
    }

    // 4. 商业化阶段合法性（与上游共用 L1/L2/L3 编码）
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

    // 5. 弹性系数范围检查
    for (const [catId, cat] of Object.entries(categories)) {
      if (cat.elasticity !== null && cat.elasticity !== undefined) {
        if (cat.elasticity < 0.5 || cat.elasticity > 7.0) {
          warnings.push(`赛道 ${cat.name} (${catId}) 弹性 ${cat.elasticity} 超出 [0.5, 7.0] 范围`);
        }
      }
    }

    // 6. 护城河 / 定价权字段完整性（与上游 policyBoost/chokepoint 平行的下游字段）
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
      console.error('[DOWNSTREAM_DATA] 数据校验失败:', errors);
    } else if (warnings.length > 0) {
      console.warn('[DOWNSTREAM_DATA] 数据校验警告:', warnings);
    } else {
      console.log('[DOWNSTREAM_DATA] ✓ 数据校验通过 — %d 赛道, %d 公司',
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
  window.DOWNSTREAM_DATA = {
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
      methodology: 'docs/downstream-methodology.md',
      parallelTo: 'src/upstream.js'
    }),

    getCategoriesByMoat,
    getCategoriesByPricing,
    getCategoryGroupSummary,

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
