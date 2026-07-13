/* ============================================================
   src/weekly-data/2026-07-13.js
   单期周报数据（2026-07-13）— 从 reports/weekly-2026-07-13.md 提取
   数据基线：2026-07-10 收盘；动表对比 06/23 收盘
   暴露：window.WEEKLY_DATA['2026-07-13'] = { meta, narrative, sectors, deepDives, flows, recommendations, risks, coverage }
   ============================================================ */
window.WEEKLY_DATA = window.WEEKLY_DATA || {};
window.WEEKLY_DATA['2026-07-13'] = (function () {
  return {
    meta: {
      issue: '2026-07-13',
      period: '2026.6.23 — 2026.7.10',
      periodDays: 13,
      source: 'vibe-trading MCP',
      author: 'Yun.kou',
      upstream: 21, infra: 13, model: 2, apps: 1, embodied: 3
    },
    narrative: {
      headline: '算力基建二次爆发 · 机器人龙头大幅回撤 · 杠杆资金加速撤退',
      beats: [
        { date: '7/3',  tone: 'down', text: '绿的谐波射击之星（开¥490/高¥494/收¥454）— Swarm CRO 标记为最大技术风险' },
        { date: '7/7',  tone: 'down', text: '寒武纪融资余额 240 亿（-8% vs 6/25 高点），杠杆资金撤退中' },
        { date: '7/8',  tone: 'up',   text: '浪潮信息单周 +26% 启动；中科曙光 +15%、金山办公 +13% Swarm 兑现' },
        { date: '7/9',  tone: 'down', text: '寒武纪融资单日 -12.6 亿，杠杆加速撤退' },
        { date: '7/10', tone: 'mixed',text: '浪潮信息收 89.52（两周 +40%）/ 绿的谐波收 405.00（-12.88% Swarm L1 触发）' }
      ],
      catalysts: [
        { event: '浪潮信息单周 +26%、中科曙光 +15% — 算力基建二次爆发', dir: 'up',   date: '7/8-7/10' },
        { event: '绿的谐波射击之星兑现，-12.88% Swarm L1 ¥420 止损触发',   dir: 'down', date: '7/8-7/10' },
        { event: '寒武纪融资余额两周净撤 37 亿（-14.1%）',                  dir: 'down', date: '6/30-7/10' },
        { event: '金山办公 +13.5% 兑现 Swarm T1 +13% 浮盈',                dir: 'up',   date: '7/8-7/10' },
        { event: '科大讯飞 +8.13% 反弹，但 Swarm 维持 NO POSITION',         dir: 'neutral', date: '7/8-7/10' },
        { event: '中际旭创再跌 -2.49% 失守 1,100，距 Swarm 止损 ¥1,040 仅 2% 空间', dir: 'down', date: '7/8-7/10' }
      ]
    },
    sectors: [
      { id: 'upstream', name: '上游·供应链', emoji: '⛰️', tone: 'down',
        summary: '上游继续跑输大盘，北方稀土单周 -10.41% 是本周最弱。',
        picks: [
          { name: '北方稀土', code: '600111.SH', from: 49.95,  to: 42.51, pct: -14.89, tone: 'down', note: '稀土价格承压，本周 -10.41% 加速' },
          { name: '立讯精密', code: '002475.SZ', from: 69.36,  to: 62.14, pct: -10.41, tone: 'down', note: 'AI 连接器逻辑未变，被动跟跌' },
          { name: '深南电路', code: '002916.SZ', from: 426.00, to: 426.00, pct:   0.00, tone: 'neu', note: 'IC 载板需求坚挺，本周企稳' }
        ]
      },
      { id: 'infra', name: '中游·算力基础设施', emoji: '⚡', tone: 'hot',
        summary: '本周最强主线 🟢：浪潮 +26%、曙光 +15% 算力基建二次爆发；光模块继续探底。',
        picks: [
          { name: '浪潮信息', code: '000977.SZ', from: 64.00,   to: 89.52,   pct:  39.87, tone: 'hot', note: 'AI 服务器放量，两周 +40%' },
          { name: '中科曙光', code: '603019.SH', from: 87.06,   to: 107.50,  pct:  23.48, tone: 'hot', note: '算力基建抱团' },
          { name: '海光信息', code: '688041.SH', from: 317.00,  to: 353.00,  pct:  11.36, tone: 'up',  note: '国产 CPU 稳健上行' },
          { name: '澜起科技', code: '688008.SH', from: 258.00,  to: 268.06,  pct:   3.90, tone: 'up',  note: '内存接口芯片跟随板块' },
          { name: '兆易创新', code: '603986.SH', from: 640.99,  to: 612.00,  pct:  -4.52, tone: 'neu', note: 'NOR Flash 震荡' },
          { name: '工业富联', code: '601138.SH', from: 74.10,   to: 66.27,   pct: -10.57, tone: 'down',note: 'AI 服务器代工，被动跟跌' },
          { name: '光迅科技', code: '002281.SZ', from: 266.90,  to: 233.45,  pct: -12.53, tone: 'down',note: '光模块次龙头，未确认底部' },
          { name: '中际旭创', code: '300308.SZ', from: 1310.01, to: 1093.98, pct: -16.49, tone: 'down',note: '光模块龙头继续寻底，距 Swarm 止损 ¥1,040 仅 2%' }
        ]
      },
      { id: 'model', name: '中游·模型与平台', emoji: '🧠', tone: 'mixed',
        summary: '科大讯飞 +8.13% 是 Model 层最强标的，但 Swarm 维持 NO POSITION（扣非失血问题未解决）。',
        picks: [
          { name: '科大讯飞', code: '002230.SZ', from: 42.15, to: 43.09, pct:  2.23, tone: 'up',   note: '反弹 +8.13%，Swarm 维持 NO POSITION' },
          { name: '虹软科技', code: '688088.SH', from: 36.77, to: 35.76, pct: -2.75, tone: 'neu',  note: '车载 AI 视觉震荡' }
        ]
      },
      { id: 'apps', name: '下游·应用与服务', emoji: '📱', tone: 'up',
        summary: '金山办公 +13.50% 是本周唯一 Swarm 建议被市场立刻验证的标的。',
        picks: [
          { name: '金山办公', code: '688111.SH', from: 214.18, to: 233.76, pct:  9.14, tone: 'hot',  note: 'Swarm 做多兑现，T1 +13% 浮盈' }
        ]
      },
      { id: 'embodied', name: '终端·具身与硬件', emoji: '🤖', tone: 'down',
        summary: '龙头回撤：绿的谐波 -12.88% Swarm L1 触发，板块从"普涨"切到"高低切换"。',
        picks: [
          { name: '拓普集团', code: '601689.SH', from: 58.02, to: 57.36, pct: -1.14, tone: 'down',note: '机器人执行器回调' },
          { name: '三花智控', code: '002050.SZ', from: 43.19, to: 43.20, pct:  0.02, tone: 'neu', note: '机器人热管理震荡' },
          { name: '绿的谐波', code: '688017.SH', from: 378.32, to: 405.00, pct: 7.05, tone: 'down',note: 'Swarm L1 ¥420 止损触发 ⚠️' }
        ]
      }
    ],
    deepDives: [
      {
        id: 'cambricon', name: '寒武纪', code: '688256.SH', emblem: '万亿后震荡 · 融资 -14.1%',
        tone: 'caution', tag: '融资撤退',
        facts: {
          revenue:    { y2024: 11.7,   y2025: 65.0,  delta: '+453%' },
          netIncome:  { y2024: -4.5,   y2025: 20.6,  delta: '扭亏为盈' },
          nonGAAP:    { y2024: -8.6,   y2025: 17.7,  delta: '扭亏为盈' },
          eps:        { y2024: -1.09,  y2025: 4.93,  delta: '—' },
          roe:        { y2024: -8.18,  y2025: 26.96, delta: '+35.1pp' }
        },
        margin: [
          { date: '6/30', buy: 35.97, repay: 22.55, net:  13.42, balance: 257.4 },
          { date: '7/3',  buy: 10.92, repay: 17.88, net:  -6.96, balance: 248.7 },
          { date: '7/6',  buy: 14.77, repay: 23.24, net:  -8.48, balance: 240.2 },
          { date: '7/7',  buy: 21.54, repay: 29.97, net:  -8.43, balance: 231.8 },
          { date: '7/8',  buy: 24.42, repay: 19.23, net:   5.19, balance: 237.0 },
          { date: '7/9',  buy: 28.11, repay: 40.72, net: -12.61, balance: 224.4 },
          { date: '7/10', buy: 20.69, repay: 22.37, net:  -1.68, balance: 222.7 }
        ],
        valuation: [
          { metric: '当前股价',  peak: '¥1,388', now: '¥1,400', compress: '+0.86%' },
          { metric: '静态 PE',   peak: '282×',  now: '284×',  compress: '+0.7%' },
          { metric: '2026E PS',  peak: '~7.2×', now: '~7.3×', compress: '+1.4%' },
          { metric: '融资余额变化', peak: '261 亿（6/25）', now: '222.7 亿（7/10）', compress: '-14.1%（两周净撤 37 亿）' }
        ],
        call: {
          verdict: '继续等待', verdictTone: 'caution',
          target: '¥1,250-1,300', hard: '—',
          position: '原 15%，当前轻仓',
          note: '两周累计融资 -37 亿（-14.1%），杠杆资金加速撤退；估值仍需消化期。'
        }
      },
      {
        id: 'innolight', name: '中际旭创', code: '300308.SZ', emblem: '光模块龙头继续寻底',
        tone: 'caution', tag: '逼近 Swarm 止损',
        facts: {
          revenue:   { y2024: 239.0, y2025: 382.0, delta: '+60%' },
          netIncome: { y2024: 51.7,  y2025: 108.0, delta: '+109%' },
          gross:     { y2024: 33.80, y2025: 42.04, delta: '+8.2pp' },
          ocf:       { y2024: 31.6,  y2025: 109.0, delta: '+244%' }
        },
        swarm: {
          bull:  { rel: 3, verdict: 'PE 仅 11.8x 极便宜；H1 业绩预告在 7 月中旬' },
          bear:  { rel: 5, verdict: '距 Swarm 硬止损 ¥1,040 仅 2% 空间 — 7/10 最低触及 1,060' },
          cro:   { rel: 5, verdict: '有条件支持；但 1.6T 周期拐点 + 价格战隐忧' },
          pm:    { rel: 4, verdict: '🟡 缩仓至 1% NAV 或执行硬止损；H1 业绩是核心催化剂' }
        },
        call: {
          verdict: '缩仓·接近止损', verdictTone: 'caution',
          target: '¥1,040（止损）', hard: '4 周窗口',
          position: '1% NAV（原 2% 缩）',
          note: '距 Swarm 硬止损 ¥1,040 仅 2% 空间。H1 业绩是唯一可能的翻盘信号。'
        }
      },
      {
        id: 'haiguang', name: '海光信息', code: '688041.SH', emblem: '国产 CPU 替代稳健',
        tone: 'up', tag: '回调即机会',
        facts: {
          revenue:   { y2024: 91.6, y2025: 143.8, delta: '+57%' },
          netIncome: { y2024: 19.3, y2025: 25.4,  delta: '+32%' },
          roe:       { y2024: 9.92, y2025: 11.87, delta: '+1.95pp' }
        },
        call: {
          verdict: '维持', verdictTone: 'ok',
          target: '—', hard: '—',
          position: '板块配置 30% NAV（与浪潮/曙光）',
          note: '海光是国产 CPU 三标的（浪潮/曙光/海光）中最稳健的；任何回调到 320 以下都应加仓。'
        }
      },
      {
        id: 'leaderdrive', name: '绿的谐波', code: '688017.SH', emblem: 'L1 止损已触发',
        tone: 'caution', tag: '执行 Swarm 三级止损',
        facts: {
          revenue:   { y2024: 3.87, y2025: 5.71, delta: '+47%' },
          netIncome: { y2024: 0.56, y2025: 1.24, delta: '+121%' },
          pe:        { y2024: 0,    y2025: 585,  delta: '估值极端' }
        },
        risk: { volAnnual: '109%', gpdXi: 0.51, note: '极度厚尾；CVaR/VaR = 1.64× — 射击之星兑现' },
        call: {
          verdict: '减仓·L1 触发', verdictTone: 'warn',
          target: '¥420 / ¥370 / ¥340 三级',
          hard: 'L1 ¥420 已击穿 → L2 ¥370 / L3 ¥340',
          position: '1% NAV 以下（已减仓）',
          note: '本周 -12.88% 击穿 L1；执行 Swarm 三级止损规则。等待 L2/L3 观察或板块情绪企稳。'
        }
      },
      {
        id: 'inspur', name: '浪潮信息', code: '000977.SZ', emblem: '两周 +40% 算力基建最强',
        tone: 'hot', tag: '短期过热',
        facts: {
          revenue:   { y2024: 1150, y2025: 1648, delta: '+43%' },
          netIncome: { y2024: 22.9, y2025: 24.1, delta: '+5%' }
        },
        call: {
          verdict: '加码·注意短期过热', verdictTone: 'ok',
          target: '—', hard: '建议等 5-10% 回调再加',
          position: '算力铁三角核心 28% NAV（加码）',
          note: '本周 +25.98% 单周最强；但两周 +40% 已透支 2026 年预期，建议等回调。'
        }
      },
      {
        id: 'iflytek', name: '科大讯飞', code: '002230.SZ', emblem: '维持 NO POSITION',
        tone: 'down', tag: 'Swarm 否决维持 🔴',
        facts: {
          revenue:   { y2024: 233, y2025: 271,  delta: '+16%' },
          nonGAAP:   { y2024: 1.9, y2025: 2.6,  delta: '+37%' },
          nonGAAPR1: { y2024: -2.28, y2025: -4.30, delta: '亏损扩大 88.6%' }
        },
        swarm: {
          bull:  { rel: 3, verdict: '本周 +8.13% 反弹；扣非失血问题需 Q2 验证' },
          bear:  { rel: 5, verdict: 'Q1 2026 扣非亏损扩大 88.6%；核心业务失血未变' },
          cro:   { rel: 5, verdict: '有条件反对 — Kelly -0.026；下行捕获 1.54×' },
          pm:    { rel: 5, verdict: '🔴 维持 NO POSITION；等 Q2 扣非转正' }
        },
        call: {
          verdict: '强烈回避', verdictTone: 'no',
          target: '—', hard: '等 Q2 扣非转正',
          position: '0%',
          note: '本周 +8.13% 反弹是技术性而非基本面反转；扣非失血问题未解决。'
        }
      },
      {
        id: 'kingsoft', name: '金山办公', code: '688111.SH', emblem: 'Swarm 做多兑现 +13.5%',
        tone: 'ok', tag: 'Swarm 验证中 🟢',
        facts: {
          revenue:    { y2024: 50.6, y2025: 58.6, delta: '+15.8%' },
          netIncome:  { y2024: 14.1, y2025: 17.0, delta: '+21%' },
          gross:      { y2024: 85.9, y2025: 86.6, delta: '+0.7pp' }
        },
        valuation: [
          { metric: '股价',     peak: '¥413.75',  now: '¥233.76',  compress: '-43.5%' },
          { metric: '静态 PE',  peak: '104.2×',  now: '58.9×',   compress: '-43.5%' },
          { metric: 'PB',       peak: '~12.7×',  now: '7.16×',   compress: '-43.6%' },
          { metric: 'PEG',      peak: '~4.3×',   now: '~2.5×',   compress: '-42%' }
        ],
        swarm: {
          bull:  { rel: 4, verdict: 'T1 +13% 浮盈兑现；MA60 ¥232 技术面信号变正' },
          bear:  { rel: 4, verdict: 'AI 工具竞争（DeepSeek/Kimi/豆包）护城河侵蚀' },
          cro:   { rel: 4, verdict: '有条件支持 — Q2 营收 +20~25% 增速可持续性' },
          pm:    { rel: 4, verdict: '🟢 推进 T2 1.5% 加仓（Q2 业绩确认后）；T3 1.0% 等 MA60 突破确认' }
        },
        call: {
          verdict: '持有·T2 加仓', verdictTone: 'ok',
          target: '¥278-320（基准）', hard: '¥185',
          position: '4% NAV（已建 T1 1.5%）',
          note: 'T1 @ ¥205-210 已 +13% 浮盈；T2 等 Q2 业绩（8 月中下旬）。MA60 ¥232 已接近。'
        }
      }
    ],
    flows: [
      { ticker: 'AI 服务器',  tone: 'enter', delta: '浪潮 +26% / 中科曙光 +15% / 海光 +3%', note: '算力基建二次爆发；资金从光模块切换到位' },
      { ticker: '应用端',      tone: 'enter', delta: '金山办公 +13.5% 验证 Swarm',            note: 'AI 应用估值修复窗口打开' },
      { ticker: '光模块',      tone: 'leave', delta: '中际旭创 -2.49% / 光迅 +5.31%（弱反弹）', note: '资金持续撤出；下周 H1 业绩是关键' },
      { ticker: '机器人龙头',  tone: 'leave', delta: '绿的谐波 -12.88% Swarm L1 触发',         note: '射击之星兑现；板块从普涨切到高低切换' },
      { ticker: 'AI 芯片',    tone: 'leave', delta: '寒武纪融资余额 -14.1%（两周）',         note: '杠杆资金加速撤退' }
    ],
    recommendations: {
      long: [
        { star: 3, sector: '国产算力铁三角', code: '浪潮+海光+中科曙光', weight: 28, tldr: '浪潮两周 +40%、曙光 +23%、海光 +11%；铁三角加码', tag: '✅ 加码' },
        { star: 3, sector: '金山办公(持有)',  code: '688111.SH',  weight: 4,  tldr: 'T1 +13% 浮盈；T2/T3 加仓窗口打开',           tag: '✅ Swarm 验证中' },
        { star: 3, sector: '腾讯(数据待补)',  code: '0700.HK',    weight: 20, tldr: '上周 +11.1% 至 479.8 创新高；港股科技 AI Agent 主线', tag: '⏳ 数据待补' },
        { star: 2, sector: 'IC 载板/存储',   code: '深南+兆易+澜起', weight: 8,  tldr: '深南企稳 +3.4%；澜起 +5.9% 跟随板块',     tag: '✅ 维持' },
        { star: 2, sector: '寒武纪(等回调)',  code: '688256.SH',  weight: 12, tldr: '等 1,250-1,300；融资 -14% 反映顶部',         tag: '⏳ 维持等待' },
        { star: 1, sector: '机器人/具身',    code: '拓普+三花',   weight: 8,  tldr: '板块从普涨切到高低切换；等 8 月底半年报',  tag: '⚠️ 减仓至 8%' },
        { star: 1, sector: '绿的谐波(止损)',  code: '688017.SH',  weight: 1,  tldr: 'L1 ¥420 已触发；执行三级止损',              tag: '🔴 L1 触发' }
      ],
      avoid: [
        { sector: '科大讯飞(继续回避)',  code: '002230.SZ', tag: '🔴 Swarm 维持', note: '扣非失血未解决；本周 +8.13% 是技术性反弹' },
        { sector: '绿的谐波(追高风险)',  code: '688017.SH', tag: '🔴 L1 触发',    note: 'PE 585x 仍极高；L1 已减仓至 1% NAV 以下' },
        { sector: '中际旭创(接近止损)',  code: '300308.SZ', tag: '⚠️ 紧密跟踪',  note: '距 Swarm 硬止损 ¥1,040 仅 2%；7 月中旬 H1 业绩' },
        { sector: '光模块二线',         code: '光迅+新易盛', tag: '⚠️ 维持回避',  note: '弱反弹未确认底部；资金持续撤出' },
        { sector: '上游稀土/钨',         code: '北方稀土',    tag: '⚠️ 维持回避',  note: '本周 -10.41%；资金未回流' }
      ]
    },
    risks: [
      { tag: '算力基建短期过热', level: 'high', detail: '浪潮两周 +40%、曙光 +23%；建议短期不追高，等 5-10% 回调' },
      { tag: '杠杆资金撤退',     level: 'high', detail: '寒武纪融资余额 -14.1%（37 亿）；加速系统性撤退' },
      { tag: '光模块周期拐点',   level: 'high', detail: '中际旭创两周 -16%；下周 H1 业绩是核心催化剂' },
      { tag: '机器人估值极端',   level: 'mid',  detail: '绿的谐波 PE 585× / PB 24× / GPD ξ=0.51 厚尾；L1 止损触发' },
      { tag: '港股数据盲区',     level: 'mid',  detail: '0700/9988/1810/1024/9880 本周 _unresolved；下周数据恢复后补齐' },
      { tag: 'Swarm 重跑未完成', level: 'mid',  detail: 'MCP 端 start_only 模式被 reap / wait_seconds 模式被 SIGKILL；下周重试' }
    ],
    coverage: {
      upstream: { count: 21, samples: ['600111.SH 北方稀土', '002475.SZ 立讯精密', '002916.SZ 深南电路', '600549.SH 厦门钨业', '688146.SH 中船特气'] },
      infra:    { count: 13, samples: ['688256.SH 寒武纪', '300308.SZ 中际旭创', '688041.SH 海光信息', '000977.SZ 浪潮信息', '603019.SH 中科曙光'] },
      model:    { count:  2, samples: ['002230.SZ 科大讯飞', '688088.SH 虹软科技'] },
      apps:     { count:  1, samples: ['688111.SH 金山办公'] },
      embodied: { count:  3, samples: ['688017.SH 绿的谐波', '002050.SZ 三花智控', '601689.SH 拓普集团'] }
    }
  };
})();
