// src/data.js
// 2026E 全球 AI 产业链利润分配 —— 桑基图数据
// 单位：十亿美元（USD bn），所有数字为研究示意，详见 docs/methodology.md
//
// 产业分层口径（严格对齐 Jensen Huang @ Davos 2025 "Five-Layer Cake of AI"）：
//   L1 Energy             电力 / 发电 / 燃料 / 电网 / 冷却
//   L2 Chip               GPU / AI ASIC / 存储 / 互连 设计与制造
//   L3 Computing Infra    云 / 数据中心 / 网络 / 编排平台
//   L4 Model              基础 / 行业大模型
//   L5 Application        终端应用 / SaaS / 设备端 AI
//
// 不变量：Σ = 812（两套视图共用同一组公司 target，金额按业务层拆分，
//          故同一公司在两套视图中总额相等）。

window.AI_PROFIT_DATA = (function () {

  // ===== 第一组切分：国家 / 阵营 → 公司（业务）====================
  // target 与 layer 视图完全对齐；同一公司可按业务被拆分到多个 link
  const geoLinks = [
    // ---------- US & Canada ----------
    { source: 'US & Canada', target: 'NVIDIA',               value: 196.0 },
    { source: 'US & Canada', target: 'Microsoft*',           value:  34.0 }, // Azure
    { source: 'US & Canada', target: 'Microsoft*',           value:  50.0 }, // Copilot / Office AI
    { source: 'US & Canada', target: 'Alphabet',             value:  33.0 }, // GCP
    { source: 'US & Canada', target: 'Alphabet',             value:  35.0 }, // Search / Ads AI
    { source: 'US & Canada', target: 'Amazon',               value:  29.0 }, // AWS
    { source: 'US & Canada', target: 'Amazon',               value:  16.0 }, // 应用
    { source: 'US & Canada', target: 'Meta',                 value:  48.0 },
    { source: 'US & Canada', target: 'Apple',                value:  16.0 },
    { source: 'US & Canada', target: 'OpenAI*',              value:  26.0 },
    { source: 'US & Canada', target: 'Anthropic*',           value:  10.0 },
    { source: 'US & Canada', target: 'xAI*',                 value:   3.0 },
    { source: 'US & Canada', target: 'Cohere*',              value:   1.0 },
    { source: 'US & Canada', target: 'Broadcom',             value:  22.0 },
    { source: 'US & Canada', target: 'AMD',                  value:   7.5 },
    { source: 'US & Canada', target: 'Marvell',              value:   4.0 },
    { source: 'US & Canada', target: 'Oracle',               value:   8.0 },
    { source: 'US & Canada', target: 'Arista',               value:   4.0 },
    { source: 'US & Canada', target: 'Equinix',              value:   1.5 },
    { source: 'US & Canada', target: 'Salesforce',           value:   0.5 },
    { source: 'US & Canada', target: 'Micron',               value:   7.0 },
    { source: 'US & Canada', target: 'GlobalFoundries',      value:   5.0 },
    { source: 'US & Canada', target: 'Intel (Foundry)',      value:   6.0 },
    { source: 'US & Canada', target: 'GE Vernova',           value:   5.0 },
    { source: 'US & Canada', target: 'Constellation Energy', value:   3.0 },
    { source: 'US & Canada', target: 'Vistra',               value:   2.5 },
    { source: 'US & Canada', target: 'NextEra',              value:   2.0 },
    { source: 'US & Canada', target: 'Duke Energy',          value:   3.0 },
    { source: 'US & Canada', target: 'Dominion Energy',      value:   3.0 },
    { source: 'US & Canada', target: 'Southern Company',     value:   2.5 },
    { source: 'US & Canada', target: 'Bloom Energy',         value:   0.3 },
    { source: 'US & Canada', target: 'Vertiv',               value:   1.5 },
    { source: 'US & Canada', target: 'Digital Realty',       value:   3.5 },
    { source: 'US & Canada', target: 'Iron Mountain DC',     value:   2.5 },
    { source: 'US & Canada', target: 'Lambda Labs*',         value:   1.2 },
    { source: 'US & Canada', target: 'Crusoe*',              value:   1.0 },
    { source: 'US & Canada', target: 'Snowflake*',           value:   4.0 },

    // ---------- Mainland China (中国大陆) ----------
    { source: 'Mainland China', target: '字节跳动',                  value:  19.5 },
    { source: 'Mainland China', target: '字节跳动 (豆包)',            value:   2.5 },
    { source: 'Mainland China', target: '腾讯',                      value:  16.0 },
    { source: 'Mainland China', target: '腾讯云',                     value:   2.5 },
    { source: 'Mainland China', target: '腾讯 (混元)',                 value:   2.0 },
    { source: 'Mainland China', target: '阿里巴巴',                   value:   7.0 },
    { source: 'Mainland China', target: '阿里云',                     value:   2.0 },
    { source: 'Mainland China', target: '阿里 (通义)',                 value:   2.0 },
    { source: 'Mainland China', target: '百度 (文心)',                 value:   4.0 },
    { source: 'Mainland China', target: '百度智能云',                  value:   0.8 },
    { source: 'Mainland China', target: '华为海思 (华为)',              value:  12.0 },
    { source: 'Mainland China', target: '华为云',                     value:   2.0 },
    { source: 'Mainland China', target: '中芯国际',                    value:   1.5 },
    { source: 'Mainland China', target: '寒武纪',                     value:   0.5 },
    { source: 'Mainland China', target: '联想',                       value:   5.0 },
    { source: 'Mainland China', target: '小米',                       value:   6.5 },
    { source: 'Mainland China', target: '快手',                       value:   4.0 },
    { source: 'Mainland China', target: '商汤',                       value:   2.5 },
    { source: 'Mainland China', target: '国家电网+南方电网',            value:   1.5 },
    { source: 'Mainland China', target: '宁德时代',                   value:   2.5 },
    { source: 'Mainland China', target: '阳光电源',                   value:   0.4 },
    { source: 'Mainland China', target: '北方华创 (NAURA)',            value:   0.5 },

    // ---------- Europe ----------
    { source: 'Europe', target: 'ASML',                     value:  14.0 },
    { source: 'Europe', target: 'SAP',                      value:   0.5 },
    { source: 'Europe', target: 'ARM*',                     value:   1.5 },
    { source: 'Europe', target: 'Mistral*',                 value:   2.0 },
    { source: 'Europe', target: '诺基亚',                    value:   3.0 },
    { source: 'Europe', target: 'Iberdrola',                value:   0.8 },
    { source: 'Europe', target: 'Infineon',                 value:   1.0 },
    { source: 'Europe', target: 'Schneider Electric',       value:   1.0 },

    // ---------- Taiwan (中国台湾) ----------
    { source: 'Taiwan', target: 'TSMC',                       value:  55.0 },
    { source: 'Taiwan', target: 'Foxconn (鸿海)',             value:   1.5 },
    { source: 'Taiwan', target: 'MediaTek',                  value:   1.0 },
    { source: 'Taiwan', target: 'Delta Electronics',          value:   1.5 },

    // ---------- South Korea (韩国) ----------
    { source: 'South Korea', target: '三星电子',              value:   8.0 },
    { source: 'South Korea', target: 'SK 海力士',             value:  11.0 },
    { source: 'South Korea', target: 'Naver',                value:   0.5 },
    { source: 'South Korea', target: 'SK Telecom',           value:   0.3 },

    // ---------- Japan (日本) ----------
    { source: 'Japan', target: '软银 / ARM 收益',            value:   3.5 },
    { source: 'Japan', target: 'Tokyo Electron',             value:   2.0 },
    { source: 'Japan', target: 'Lasertec',                  value:   0.4 },
    { source: 'Japan', target: 'Murata Manufacturing',       value:   1.0 },
    { source: 'Japan', target: 'Shin-Etsu Chemical',        value:   1.5 },
    { source: 'Japan', target: 'Kioxia',                    value:   0.5 },
    { source: 'Japan', target: 'Advantest',                 value:   0.5 },

    // ---------- Others ----------
    { source: 'Others', target: '其他应用',                   value:   5.3 },
  ];
  // ===== 第二组切分：NVIDIA Five-Layer Cake → 公司 =================
  const layerLinks = [
    // -------- L1 Energy 电力 / 电网 / 冷却 ≈ 30.5 bn --------
    { source: 'L1 Energy', target: 'GE Vernova',            value:  5.0 },
    { source: 'L1 Energy', target: 'Constellation Energy',  value:  3.0 },
    { source: 'L1 Energy', target: 'Duke Energy',           value:  3.0 },
    { source: 'L1 Energy', target: 'Dominion Energy',       value:  3.0 },
    { source: 'L1 Energy', target: 'Vistra',                value:  2.5 },
    { source: 'L1 Energy', target: '宁德时代',                value:  2.5 },
    { source: 'L1 Energy', target: 'Southern Company',      value:  2.5 },
    { source: 'L1 Energy', target: 'NextEra',               value:  2.0 },
    { source: 'L1 Energy', target: 'Delta Electronics',     value:  1.5 },
    { source: 'L1 Energy', target: 'Vertiv',                value:  1.5 },
    { source: 'L1 Energy', target: '国家电网+南方电网',        value:  1.5 },
    { source: 'L1 Energy', target: 'Schneider Electric',    value:  1.0 },
    { source: 'L1 Energy', target: 'Iberdrola',             value:  0.8 },
    { source: 'L1 Energy', target: '阳光电源',                value:  0.4 },
    { source: 'L1 Energy', target: 'Bloom Energy',          value:  0.3 },

    // -------- L2 Chip 芯片设计 & 制造 ≈ 337.4 bn --------
    { source: 'L2 Chip', target: 'NVIDIA',                  value: 196.0 },
    { source: 'L2 Chip', target: 'TSMC',                    value:  55.0 },
    { source: 'L2 Chip', target: 'ASML',                    value:  14.0 },
    { source: 'L2 Chip', target: '华为海思 (华为)',            value:  12.0 },
    { source: 'L2 Chip', target: 'SK 海力士',                value:  11.0 },
    { source: 'L2 Chip', target: 'AMD',                     value:   7.5 },
    { source: 'L2 Chip', target: '三星电子',                  value:   8.0 },
    { source: 'L2 Chip', target: 'Micron',                  value:   7.0 },
    { source: 'L2 Chip', target: 'Intel (Foundry)',         value:   6.0 },
    { source: 'L2 Chip', target: 'GlobalFoundries',         value:   5.0 },
    { source: 'L2 Chip', target: 'Marvell',                 value:   4.0 },
    { source: 'L2 Chip', target: 'Tokyo Electron',          value:   2.0 },
    { source: 'L2 Chip', target: '中芯国际',                 value:   1.5 },
    { source: 'L2 Chip', target: 'ARM*',                    value:   1.5 },
    { source: 'L2 Chip', target: 'Shin-Etsu Chemical',      value:   1.5 },
    { source: 'L2 Chip', target: 'MediaTek',                value:   1.0 },
    { source: 'L2 Chip', target: 'Murata Manufacturing',     value:   1.0 },
    { source: 'L2 Chip', target: 'Infineon',                value:   1.0 },
    { source: 'L2 Chip', target: '寒武纪',                   value:   0.5 },
    { source: 'L2 Chip', target: 'Kioxia',                  value:   0.5 },
    { source: 'L2 Chip', target: 'Advantest',               value:   0.5 },
    { source: 'L2 Chip', target: '北方华创 (NAURA)',          value:   0.5 },
    { source: 'L2 Chip', target: 'Lasertec',                value:   0.4 },

    // -------- L3 Computing Infra 云 / 网络 ≈ 152.8 bn --------
    { source: 'L3 Computing Infra', target: 'Microsoft*',   value: 34.0 },
    { source: 'L3 Computing Infra', target: 'Alphabet',     value: 33.0 },
    { source: 'L3 Computing Infra', target: 'Amazon',       value: 29.0 },
    { source: 'L3 Computing Infra', target: 'Broadcom',     value: 22.0 },
    { source: 'L3 Computing Infra', target: 'Oracle',       value:  8.0 },
    { source: 'L3 Computing Infra', target: 'Snowflake*',   value:  4.0 },
    { source: 'L3 Computing Infra', target: 'Arista',       value:  4.0 },
    { source: 'L3 Computing Infra', target: 'Digital Realty', value: 3.5 },
    { source: 'L3 Computing Infra', target: 'Iron Mountain DC', value: 2.5 },
    { source: 'L3 Computing Infra', target: '腾讯云',         value:  2.5 },
    { source: 'L3 Computing Infra', target: 'Equinix',      value:  1.5 },
    { source: 'L3 Computing Infra', target: '华为云',         value:  2.0 },
    { source: 'L3 Computing Infra', target: '阿里云',         value:  2.0 },
    { source: 'L3 Computing Infra', target: 'Foxconn (鸿海)', value:  1.5 },
    { source: 'L3 Computing Infra', target: 'Lambda Labs*', value:  1.2 },
    { source: 'L3 Computing Infra', target: 'Crusoe*',      value:  1.0 },
    { source: 'L3 Computing Infra', target: '百度智能云',      value:  0.8 },
    { source: 'L3 Computing Infra', target: 'SK Telecom',   value:  0.3 },

    // -------- L4 Model 基础模型 ≈ 52.5 bn --------
    { source: 'L4 Model', target: 'OpenAI*',                value: 26.0 },
    { source: 'L4 Model', target: 'Anthropic*',             value: 10.0 },
    { source: 'L4 Model', target: '百度 (文心)',              value:  4.0 },
    { source: 'L4 Model', target: 'xAI*',                   value:  3.0 },
    { source: 'L4 Model', target: '字节跳动 (豆包)',          value:  2.5 },
    { source: 'L4 Model', target: '阿里 (通义)',              value:  2.0 },
    { source: 'L4 Model', target: '腾讯 (混元)',              value:  2.0 },
    { source: 'L4 Model', target: 'Mistral*',               value:  2.0 },
    { source: 'L4 Model', target: 'Cohere*',                value:  1.0 },

    // -------- L5 Application 应用 ≈ 238.8 bn --------
    { source: 'L5 Application', target: 'Microsoft*',       value: 50.0 },
    { source: 'L5 Application', target: 'Meta',              value: 48.0 },
    { source: 'L5 Application', target: 'Alphabet',         value: 35.0 },
    { source: 'L5 Application', target: '字节跳动',           value: 19.5 },
    { source: 'L5 Application', target: 'Apple',            value: 16.0 },
    { source: 'L5 Application', target: 'Amazon',           value: 16.0 },
    { source: 'L5 Application', target: '腾讯',              value: 16.0 },
    { source: 'L5 Application', target: '阿里巴巴',           value:  7.0 },
    { source: 'L5 Application', target: '小米',              value:  6.5 },
    { source: 'L5 Application', target: '其他应用',           value:  5.3 },
    { source: 'L5 Application', target: '联想',              value:  5.0 },
    { source: 'L5 Application', target: '快手',              value:  4.0 },
    { source: 'L5 Application', target: '软银 / ARM 收益',    value:  3.5 },
    { source: 'L5 Application', target: '诺基亚',             value:  3.0 },
    { source: 'L5 Application', target: '商汤',              value:  2.5 },
    { source: 'L5 Application', target: 'Naver',            value:  0.5 },
    { source: 'L5 Application', target: 'Salesforce',       value:  0.5 },
    { source: 'L5 Application', target: 'SAP',              value:  0.5 },
  ];

  // ===== 国家阵营元数据 ===========================================
  const geoGroups = [
    { id: 'US & Canada',    label: 'US & Canada',     zh: '美加',     tone: 'amber'   },
    { id: 'Mainland China', label: 'Mainland China',  zh: '中国大陆', tone: 'crimson' },
    { id: 'Taiwan',         label: 'Taiwan',          zh: '中国台湾', tone: 'moss'    },
    { id: 'South Korea',    label: 'South Korea',     zh: '韩国',     tone: 'moss-2'  },
    { id: 'Japan',          label: 'Japan',           zh: '日本',     tone: 'moss-3'  },
    { id: 'Europe',         label: 'Europe',          zh: '欧洲',     tone: 'slate'   },
    { id: 'Others',         label: 'Others',          zh: '其他',     tone: 'ash'     },
  ];

  // ===== NVIDIA Five-Layer Cake 元数据 ============================
  const layerGroups = [
    { id: 'L1 Energy',           zh: 'L1 · Energy',           en: 'Energy',                   tone: 'ash'     },
    { id: 'L2 Chip',             zh: 'L2 · Chip',             en: 'Chip',                     tone: 'amber'   },
    { id: 'L3 Computing Infra',  zh: 'L3 · Computing Infra',  en: 'Computing Infrastructure', tone: 'slate'   },
    { id: 'L4 Model',            zh: 'L4 · Model',            en: 'Model',                    tone: 'crimson' },
    { id: 'L5 Application',      zh: 'L5 · Application',      en: 'Application',              tone: 'moss'    },
  ];

  // ===== 头条 =====================================================
  // ⚠️ 此对象由 assertBalance() 自动校验，修改数据后请检查 console
  const headlines = {
    totalBn: 812,
    concentration: {
      top1:  { name: 'NVIDIA', share: 0.241 },
      top3:  { names: ['NVIDIA', 'Microsoft*', 'Alphabet'], share: 0.429 },
      top10: { share: 0.714 },
    },
    geo: geoGroups,
    layerCake: {
      source: 'NVIDIA Jensen Huang @ Davos 2025 · "Five-Layer Cake of AI"',
      layers: layerGroups,
    },
  };

  // ===== 估值代理集合 ============================================
  // 区分「真实盈利公司」与「估值代理公司」（未盈利，按一级市场估值折算）。
  // 渲染器会对 proxy 节点加视觉区分（虚线描边 + 降透明度）。
  // 注意：带 * 的 Microsoft* / ARM* / Snowflake* 仍属「已上市+真实盈利」，未列入此处。
  const proxyCompanies = Object.freeze(new Set([
    'OpenAI*',
    'Anthropic*',
    'xAI*',
    'Cohere*',
    'Lambda Labs*',
    'Crusoe*',
    'Mistral*',
  ]));
  function isProxy(name) { return proxyCompanies.has(name); }

  // ----- 开发期 sanity check -----
  function layerTotals() {
    const out = {};
    layerLinks.forEach((l) => { out[l.source] = (out[l.source] || 0) + l.value; });
    return out;
  }
  function geoTotals() {
    const out = {};
    geoLinks.forEach((l) => { out[l.source] = (out[l.source] || 0) + l.value; });
    return out;
  }
  function companyTotals() {
    const g = {}, L = {};
    geoLinks.forEach((l) => { g[l.target] = (g[l.target] || 0) + l.value; });
    layerLinks.forEach((l) => { L[l.target] = (L[l.target] || 0) + l.value; });
    const all = new Set([...Object.keys(g), ...Object.keys(L)]);
    const out = {};
    all.forEach((k) => { out[k] = { geo: g[k] || 0, layer: L[k] || 0 }; });
    return out;
  }
  function assertBalance() {
    const g = geoLinks.reduce((s, l) => s + l.value, 0);
    const L = layerLinks.reduce((s, l) => s + l.value, 0);
    const TOL = 1e-6;
    let ok = true;

    // ① Σ geo = Σ layer = 812
    if (Math.abs(g - L) > TOL) {
      console.warn(`[data] ❌ geo Σ=${g} ≠ layer Σ=${L} (Δ=${Math.abs(g-L).toFixed(2)})`);
      ok = false;
    }
    if (Math.abs(g - 812) > 0.06) {
      console.warn(`[data] ❌ total Σ=${g.toFixed(4)} 偏离目标 812 超过 0.06`);
      ok = false;
    }

    // ② 跨视图公司总额一致
    const coTotals = companyTotals();
    const coMismatches = Object.entries(coTotals).filter(([, v]) => Math.abs(v.geo - v.layer) > TOL);
    if (coMismatches.length > 0) {
      console.warn(`[data] ❌ ${coMismatches.length} companies have geo≠layer:`);
      coMismatches.forEach(([n, v]) => console.warn(`  ${n}: geo=${v.geo} layer=${v.layer}`));
      ok = false;
    }

    // ③ 不变量 ⑤：layer target 必须在 geo 中出现
    const geoTargets = new Set(geoLinks.map(l => l.target));
    const layerTargets = new Set(layerLinks.map(l => l.target));
    const layerOnly = [...layerTargets].filter(t => !geoTargets.has(t));
    if (layerOnly.length > 0) {
      console.warn(`[data] ❌ ${layerOnly.length} targets in layer but NOT in geo:`, layerOnly.join(', '));
      ok = false;
    }
    const geoOnly = [...geoTargets].filter(t => !layerTargets.has(t));
    if (geoOnly.length > 0) {
      console.warn(`[data] ❌ ${geoOnly.length} targets in geo but NOT in layer:`, geoOnly.join(', '));
      ok = false;
    }

    // ④ headlines vs 实际计算值
    const allCos = Object.entries(coTotals)
      .map(([name, v]) => ({ name, total: v.geo }))
      .sort((a, b) => b.total - a.total);
    const totalAll = allCos.reduce((s, c) => s + c.total, 0);
    const actualTop1 = allCos[0];
    const actualTop3 = allCos.slice(0, 3);
    const actualTop10 = allCos.slice(0, 10);

    if (headlines.concentration.top1.name !== actualTop1.name) {
      console.warn(`[data] ❌ headlines.top1 "${headlines.concentration.top1.name}" ≠ actual "${actualTop1.name}"`);
      ok = false;
    }
    const actualTop1Share = actualTop1.total / totalAll;
    if (Math.abs(headlines.concentration.top1.share - actualTop1Share) > 0.006) {
      console.warn(`[data] ❌ headlines.top1.share ${headlines.concentration.top1.share} ≠ actual ${actualTop1Share.toFixed(3)}`);
      ok = false;
    }
    const actualTop3Share = actualTop3.reduce((s, c) => s + c.total, 0) / totalAll;
    if (Math.abs(headlines.concentration.top3.share - actualTop3Share) > 0.006) {
      console.warn(`[data] ❌ headlines.top3.share ${headlines.concentration.top3.share} ≠ actual ${actualTop3Share.toFixed(3)}`);
      ok = false;
    }
    const hTop3Names = headlines.concentration.top3.names.join(',');
    const aTop3Names = actualTop3.map(c => c.name).join(',');
    if (hTop3Names !== aTop3Names) {
      console.warn(`[data] ❌ headlines.top3.names [${hTop3Names}] ≠ actual [${aTop3Names}]`);
      ok = false;
    }
    const actualTop10Share = actualTop10.reduce((s, c) => s + c.total, 0) / totalAll;
    if (Math.abs(headlines.concentration.top10.share - actualTop10Share) > 0.006) {
      console.warn(`[data] ❌ headlines.top10.share ${headlines.concentration.top10.share} ≠ actual ${actualTop10Share.toFixed(3)}`);
      ok = false;
    }

    // ⑤ 公司数量
    const uniqueTargets = new Set([...geoTargets, ...layerTargets]);
    console.log(`[data] companies: ${uniqueTargets.size} | geo sources: ${geoTargets.size} | layer sources: ${layerTargets.size}`);

    // ⑥ geo group 覆盖
    const geoGroupIds = new Set(geoGroups.map(g => g.id));
    const actualGeoSources = new Set(geoLinks.map(l => l.source));
    geoGroupIds.forEach(id => {
      if (!actualGeoSources.has(id)) {
        console.warn(`[data] ❌ geoGroup "${id}" has no links in geoLinks`);
        ok = false;
      }
    });

    // ⑦ proxyCompanies 校验：带 * 的公司必须被显式归类
    const starred = new Set();
    geoLinks.forEach(l => { if (/\*$/.test(l.target)) starred.add(l.target); });
    layerLinks.forEach(l => { if (/\*$/.test(l.target)) starred.add(l.target); });
    const unclassified = [...starred].filter(n => !proxyCompanies.has(n));
    if (unclassified.length > 0) {
      console.warn(`[data] ⚠️ ${unclassified.length} starred companies not in proxyCompanies (treated as realized):`, unclassified.join(', '));
    }

    if (ok) console.log('[data] ✅ all assertions passed');
  }
  assertBalance();

  return {
    geoLinks, layerLinks,
    geoGroups, layerGroups,
    headlines,
    proxyCompanies, isProxy,
    layerTotals, geoTotals, companyTotals,
    assertBalance,
  };
})();
