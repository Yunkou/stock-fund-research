/* ============================================================
   src/weekly-data/2026-07-07.js
   单期周报数据（2026-07-07）— 从 reports/weekly-2026-07-07.md 提取
   数据基线：2026-07-07 收盘
   暴露：window.WEEKLY_DATA['2026-07-07'] = { meta, narrative, sectors, deepDives, flows, recommendations, risks, coverage }
   ============================================================ */
window.WEEKLY_DATA = window.WEEKLY_DATA || {};
window.WEEKLY_DATA['2026-07-07'] = (function () {
  const meta = {
    issue: '2026-07-07',
    period: '2026.6.23 — 2026.7.7',
    periodDays: 10,
    source: 'vibe-trading MCP',
    author: 'Yun.kou',
    upstream: 52, infra: 29, model: 17, apps: 15, embodied: 21
  };

  // ---- 1. 宏观叙事 ----
  const narrative = {
    headline: '万亿市值里程碑 → 高位急剧回调 → 板块内分化',
    beats: [
      { date: '6/25', tone: 'neutral',  text: '融资余额 261 亿，杠杆资金高位蓄势' },
      { date: '6/30', tone: 'hot',      text: '寒武纪触及 1,620 元，AI 芯片首家万亿；当晚紧急发布风险提示公告' },
      { date: '7/2',  tone: 'down',     text: '寒武纪 -20.3% 振幅，中际旭创 -18%，光迅科技跌停' },
      { date: '7/3',  tone: 'down',     text: '融资净偿还 -7.0 亿，杠杆资金趁反弹撤离' },
      { date: '7/6',  tone: 'down',     text: '融资再净偿还 -8.4 亿，余额降至 240 亿（-8% vs 6/25 高点）' },
      { date: '7/6',  tone: 'up',       text: 'AI 服务器 / 国产 CPU 企稳反弹，机器人爆发' },
      { date: '7/7',  tone: 'up',       text: '浪潮信息 +10.9%，海光 +8.1%；绿的谐波 +22.7%' }
    ],
    catalysts: [
      { event: '寒武纪成为科创板首家万亿市值公司', dir: 'neutral', date: '6/30' },
      { event: '寒武纪发布《股票交易风险提示公告》', dir: 'down',    date: '6/30 晚' },
      { event: '德银上调 2026 全球人形机器人出货预测至 5 万台',   dir: 'up',      date: '6 月中' },
      { event: '工信部+国资委印发人形机器人专项行动通知',          dir: 'up',      date: '2026 年度' },
      { event: '高盛上调 1.6T 光模块出货预测至 1,400 万只',         dir: 'up',      date: '1 月底' },
      { event: '光模块 Q1 分化：新易盛环比下滑 13.25%',              dir: 'down',    date: '4 月' },
      { event: '国产 AI 芯片定增/收并购推进（寒武纪+海光）',          dir: 'up',      date: '进行中' }
    ]
  };

  // ---- 2. 分层两周期表现 ----
  // 表格数据 — 全部按 tldr 摘要 + 涨跌幅排序
  const sectors = [
    {
      id: 'upstream', name: '上游·供应链', emoji: '⛰️', tone: 'neutral',
      summary: '被动跟随大盘回调。弹性标的跌幅更深；中长期 IC 载板 / AI 连接器逻辑最清晰。',
      picks: [
        { name: '北方稀土', code: '600111.SH', from: 49.95, to: 47.45, pct: -5.0,  note: '稀土价格承压，成交量逐日萎缩' },
        { name: '立讯精密', code: '002475.SZ', from: 69.36, to: 63.28, pct: -8.8,  note: 'AI 连接器逻辑未变，但系统性回调' },
        { name: '深南电路', code: '002916.SZ', from: 426.0, to: 412.1, pct: -3.3,  note: 'IC 载板需求坚挺，震荡中枢不变' }
      ]
    },
    {
      id: 'infra', name: '中游·算力基础设施', emoji: '⚡', tone: 'mixed',
      summary: '本周分化最剧烈：服务器 / 国产 CPU 走强，光模块全线暴跌。',
      picks: [
        { name: '浪潮信息',   code: '000977.SZ', from: 64.00,    to: 71.06,    pct:  10.9, tone: 'up',    note: 'AI 服务器订单饱满，7/7 放量' },
        { name: '海光信息',   code: '688041.SH', from: 317.0,    to: 342.6,    pct:   8.1, tone: 'up',    note: '国产 CPU 替代逻辑加速' },
        { name: '中科曙光',   code: '603019.SH', from: 87.06,    to: 93.50,    pct:   7.4, tone: 'up',    note: '算力基建，6/30 涨停' },
        { name: '寒武纪',     code: '688256.SH', from: 1413.0,   to: 1388.0,   pct:  -1.8, tone: 'neu',   note: '震幅超 20%，万亿后回调企稳' },
        { name: '澜起科技',   code: '688008.SH', from: 258.0,    to: 253.2,    pct:  -1.9, tone: 'neu',   note: '内存接口芯片，高弹性震荡' },
        { name: '兆易创新',   code: '603986.SH', from: 640.99,   to: 620.0,    pct:  -3.3, tone: 'neu',   note: 'NOR Flash 龙头，先涨后跌' },
        { name: '华工科技',   code: '000988.SZ', from: 163.66,   to: 153.59,   pct:  -6.1, tone: 'down',  note: '激光 + 光模块双逻辑' },
        { name: '沪电股份',   code: '002463.SZ', from: 138.5,    to: 129.72,   pct:  -6.4, tone: 'down',  note: '高速 PCB，跟随板块回调' },
        { name: '新易盛',     code: '300502.SZ', from: 552.0,    to: 510.1,    pct:  -7.6, tone: 'down',  note: '光模块次龙头同向走弱' },
        { name: '工业富联',   code: '601138.SH', from: 74.10,    to: 63.78,    pct: -13.9, tone: 'down',  note: 'AI 服务器代工，跟跌光模块' },
        { name: '中际旭创',   code: '300308.SZ', from: 1310.0,   to: 1122.0,   pct: -14.4, tone: 'down',  note: '光模块龙头，暴力回调' },
        { name: '光迅科技',   code: '002281.SZ', from: 266.9,    to: 221.67,   pct: -16.9, tone: 'down',  note: '光芯片 / 光器件，最弱' }
      ]
    },
    {
      id: 'model', name: '中游·模型与平台', emoji: '🧠', tone: 'down',
      summary: '板块整体回调，扣非数据揭示核心业务失血（科大讯飞 Swarm 否决）。',
      picks: [
        { name: '科大讯飞', code: '002230.SZ', from: 42.25, to: 39.95, pct: -5.4, tone: 'down', note: '扣非亏损扩大 88.6%，Swarm CRO+PM 一致否决' },
        { name: '同花顺',   code: '300033.SZ', from: 142.0, to: 131.5, pct: -7.4, tone: 'down', note: '成交萎缩，金融 IT 情绪走弱' },
        { name: '虹软科技', code: '688088.SH', from: 56.30, to: 51.20, pct: -9.1, tone: 'down', note: '视觉算法，跟随科技股调整' }
      ]
    },
    {
      id: 'apps', name: '下游·应用与服务', emoji: '📱', tone: 'mixed',
      summary: '金山办公从 413 元跌至 206 元（-50.2%），是 Swarm 唯一新增买入。',
      picks: [
        { name: '金山办公', code: '688111.SH', from: 413.75, to: 205.95, pct: -50.2, tone: 'down', note: '-54% ATH 后估值合理，Swarm 确认买入' },
        { name: '万兴科技', code: '300624.SZ', from: 88.5,   to: 76.8,   pct: -13.2, tone: 'down', note: 'AI 创作工具，跟跌' },
        { name: '用友网络', code: '600588.SH', from: 14.20,  to: 12.55,  pct: -11.6, tone: 'down', note: '企业 SaaS 复苏疲软' }
      ]
    },
    {
      id: 'embodied', name: '终端·具身与硬件', emoji: '🤖', tone: 'hot',
      summary: '本周最强主线 🚀 — 绿的谐波 +22.7% 领涨，机器人产业链从 0 到 1 加速。',
      picks: [
        { name: '绿的谐波', code: '688017.SH', from: 366.0, to: 449.1, pct:  22.7, tone: 'hot',  note: '谐波减速器龙头，动量交易 ⚠️' },
        { name: '拓普集团', code: '601689.SH', from: 58.20, to: 67.40, pct:  15.8, tone: 'up',   note: '三花+拓普线性执行器主供' },
        { name: '三花智控', code: '002050.SZ', from: 28.10, to: 31.95, pct:  13.7, tone: 'up',   note: '热管理 + 执行器双逻辑' },
        { name: '兆威机电', code: '003021.SZ', from: 78.30, to: 86.55, pct:  10.5, tone: 'up',   note: '微型电缸，机器人手指' },
        { name: '奥比中光', code: '688322.SH', from: 32.40, to: 35.20, pct:   8.6, tone: 'up',   note: '3D 视觉，机器人眼睛' },
        { name: '双环传动', code: '002472.SZ', from: 28.90, to: 27.20, pct:  -5.9, tone: 'down', note: '齿轮，回调蓄势' }
      ]
    }
  ];

  // ---- 3. 关键标的深度拆解（7 个） ----
  // 仅保留 Swarm 辩论或极端事件的标的；用 'cards' 字段而非大段 prose
  const deepDives = [
    {
      id: 'cambricon', name: '寒武纪', code: '688256.SH', emblem: '1.6T → 万亿 → 回调',
      tone: 'caution', tag: '万亿后冷静',
      facts: {
        revenue:    { y2024: 11.7,   y2025: 65.0,  delta: '+453%' },
        netIncome:  { y2024: -4.5,   y2025: 20.6,  delta: '扭亏为盈' },
        nonGAAP:    { y2024: -8.6,   y2025: 17.7,  delta: '扭亏为盈' },
        eps:        { y2024: -1.09,  y2025: 4.93,  delta: '—' },
        roe:        { y2024: -8.18,  y2025: 26.96, delta: '+35.1pp' },
        gross:      { y2024: 56.71,  y2025: 55.15, delta: '-1.6pp' },
        rnd:        { y2024: 10.7,   y2025: 11.7,  delta: '+9%' },
        rndRatio:   { y2024: 75.6,   y2025: 80.1,  delta: '+4.5pp' }
      },
      margin: [
        { date: '6/25', buy: 31.1, repay: 28.7, net:  2.4, balance: 260.9 },
        { date: '6/26', buy: 19.1, repay: 29.9, net: -10.8, balance: 250.0 },
        { date: '6/29', buy: 21.5, repay: 27.5, net:  -6.0, balance: 244.0 },
        { date: '6/30', buy: 35.9, repay: 22.5, net: 13.4, balance: 257.4 },
        { date: '7/1',  buy: 23.2, repay: 26.5, net:  -3.3, balance: 254.2 },
        { date: '7/2',  buy: 26.9, repay: 25.5, net:   1.4, balance: 255.7 },
        { date: '7/3',  buy: 10.9, repay: 17.9, net:  -7.0, balance: 248.7 },
        { date: '7/6',  buy: 14.8, repay: 23.2, net:  -8.4, balance: 240.2 }
      ],
      valuation: [
        { metric: '当前股价',  peak: '¥1,388', now: '¥1,388', compress: '—' },
        { metric: '静态 PE',   peak: '282×',  now: '282×',  compress: '—' },
        { metric: '2026E PS',  peak: '~7.2×', now: '~7.2×', compress: '—' },
        { metric: '融资余额变化', peak: '261 亿（6/25）', now: '240 亿（7/6）', compress: '-8%' }
      ],
      call: {
        verdict: '等回调',
        verdictTone: 'caution',
        target: '¥1,250-1,300',
        hard: '—',
        position: '原 15%，当前轻仓',
        note: '杠杆资金趁反弹撤离，融资本周 -15.4 亿；估值已反映乐观预期，需要消化期。'
      }
    },
    {
      id: 'innolight', name: '中际旭创', code: '300308.SZ', emblem: '光模块龙头 -14.4%',
      tone: 'mixed', tag: 'Swarm 战术',
      facts: {
        revenue:    { y2024: 239.0, y2025: 382.0, delta: '+60%' },
        netIncome:  { y2024: 51.7,  y2025: 108.0, delta: '+109%' },
        gross:      { y2024: 33.80, y2025: 42.04, delta: '+8.2pp' },
        ocf:        { y2024: 31.6,  y2025: 109.0, delta: '+244%' }
      },
      swarm: {
        bull:  { rel: 4, verdict: '800G/1.6T 超级周期远未见顶，-18.8% = 黄金买点' },
        bear:  { rel: 5, verdict: '多峰 RSI 顶背离 + MACD 死叉 + 量价派发 — 教科书级出货信号' },
        cro:   { rel: 4, verdict: '有条件支持；年化波动率 133%，仓位必须 ≤3% NAV' },
        pm:    { rel: 5, verdict: '🟡 条件做多 2% NAV，硬止损 ¥1,040 — 4 周催化剂窗口' }
      },
      call: {
        verdict: '战术 2% NAV',
        verdictTone: 'caution',
        target: '¥1,040（止损）',
        hard: '4 周窗口',
        position: '2% NAV（原 8% 大幅压缩）',
        note: '不是核心持仓 — 是 4 周催化剂窗口的战术配置。'
      }
    },
    {
      id: 'haiguang', name: '海光信息', code: '688041.SH', emblem: '国产 CPU 替代',
      tone: 'up', tag: '最纯正标的',
      facts: {
        revenue:   { y2024: 91.6, y2025: 143.8, delta: '+57%' },
        netIncome: { y2024: 19.3, y2025: 25.4,  delta: '+32%' },
        roe:       { y2024: 9.92, y2025: 11.87, delta: '+1.95pp' }
      },
      call: {
        verdict: '维持',
        verdictTone: 'ok',
        target: '—',
        hard: '—',
        position: '30% NAV（板块配置）',
        note: 'Q1+68% 验证增长；国产替代确定性强。'
      }
    },
    {
      id: 'leaderdrive', name: '绿的谐波', code: '688017.SH', emblem: '机器人赛道"寒武纪"',
      tone: 'hot', tag: '动量交易 ⚠️',
      facts: {
        revenue:   { y2024: 3.8, y2025: 4.2,  delta: '+11%' },
        netIncome: { y2024: 0.6, y2025: 0.42, delta: '-30%' },
        pe:        { y2024: 0,   y2025: 671,  delta: '估值极端' }
      },
      risk: { volAnnual: '109%', gpdXi: 0.51, note: '极度厚尾；CVaR/VaR = 1.64×' },
      call: {
        verdict: '降级·降仓',
        verdictTone: 'warn',
        target: '¥500 减仓 / ¥420 止损',
        hard: '¥420 / ¥370 / ¥340 三级',
        position: '1.5% NAV（原 2.5%）',
        note: '若 07-08 有效跌破 ¥445，取消全部买入计划。'
      }
    },
    {
      id: 'inspur', name: '浪潮信息', code: '000977.SZ', emblem: 'AI 服务器放量',
      tone: 'up', tag: '订单饱满',
      facts: {
        revenue:   { y2024: 658, y2025: 941, delta: '+43%' },
        netIncome: { y2024: 17.9, y2025: 22.4, delta: '+25%' }
      },
      call: {
        verdict: '维持',
        verdictTone: 'ok',
        target: '—',
        hard: '—',
        position: '板块配置（与海光合并 30%）',
        note: '7/7 放量 +10.9%；利润率薄，但订单能见度高。'
      }
    },
    {
      id: 'iflytek', name: '科大讯飞', code: '002230.SZ', emblem: '扣非失血',
      tone: 'down', tag: 'Swarm 否决 🔴',
      facts: {
        revenue:   { y2024: 196, y2025: 215, delta: '+10%' },
        nonGAAP:   { y2024: -3.4, y2025: -6.4, delta: '-88.6%' },
        pe:        { y2024: 0,   y2025: 0,   delta: '亏损' }
      },
      swarm: {
        bull:  { rel: 3, verdict: 'PB 5 年 9% 分位极低估；MACD 底背离' },
        bear:  { rel: 5, verdict: 'PE/ROE 24.3×（正常<6×）；EMA 空头排列 + 死亡交叉' },
        cro:   { rel: 5, verdict: '有条件反对 — Kelly -0.026；下行捕获率 1.54×' },
        pm:    { rel: 5, verdict: '🔴 不建仓 — 等 Q2 扣非转正，硬止损 ¥37.50（-6.1%），上限 2% NAV' }
      },
      call: {
        verdict: '强烈回避',
        verdictTone: 'no',
        target: '—',
        hard: '等 Q2 扣非转正',
        position: '0%',
        note: '扣非亏损扩大 88.6%；多头论点可靠性仅 48% (12/25)，空头 84% (21/25)。'
      }
    },
    {
      id: 'kingsoft', name: '金山办公', code: '688111.SH', emblem: '-50% 估值压缩',
      tone: 'ok', tag: 'Swarm 确认 🟢',
      facts: {
        revenue:    { y2024: 50.6, y2025: 58.6, delta: '+15.8%' },
        netIncome:  { y2024: 14.1, y2025: 17.0, delta: '+21%' },
        gross:      { y2024: 85.9, y2025: 86.6, delta: '+0.7pp' }
      },
      valuation: [
        { metric: '股价',     peak: '¥413.75',  now: '¥205.95',  compress: '-50.2%' },
        { metric: '静态 PE',  peak: '104.2×',  now: '51.9×',   compress: '-50.2%' },
        { metric: 'PB',       peak: '~12.7×',  now: '6.31×',   compress: '-50.3%' },
        { metric: 'PEG',      peak: '~4.3×',   now: '2.2×',    compress: '-49.8%' }
      ],
      swarm: {
        bull:  { rel: 4, verdict: '52× PE + 86% 毛利率 + 24% 增速 = PEG 2.2×' },
        bear:  { rel: 4, verdict: '估值合理；¥194-200 双底 + MACD 近金叉' },
        cro:   { rel: 4, verdict: '有条件支持 — 关键假设 24% 增速可持续' },
        pm:    { rel: 4, verdict: '🟢 4% NAV，分三批；T1 1.5% 立即 + T2/T3 各 1.25-1.5%' }
      },
      call: {
        verdict: '新增·买入',
        verdictTone: 'ok',
        target: '¥194-200 双底',
        hard: '—',
        position: '4% NAV（分三批）',
        note: '纯粹的估值压缩而非基本面恶化；空方 PE 80-100× 是事实错误（实际 51.9×）。'
      }
    }
  ];

  // ---- 4. 资金流向 ----
  const flows = [
    { ticker: '寒武纪', tone: 'leave',  delta: '融资 -15.4 亿 (6/30→7/6)', note: '杠杆资金趁反弹撤离' },
    { ticker: '光模块', tone: 'leave',  delta: '板块 -7% ~ -17%',           note: '资金系统性撤出，切换到 AI 服务器' },
    { ticker: 'AI 服务器', tone: 'enter', delta: '浪潮 +10.9% / 工业富联 -13.9%', note: '同板块内部分化，代工端被错杀' },
    { ticker: '国产 CPU', tone: 'enter', delta: '海光 +8.1% / 曙光 +7.4%',  note: '逆势走强，替代逻辑' },
    { ticker: '机器人', tone: 'enter',  delta: '绿的谐波 +22.7% / 拓普 +15.8%',  note: '从 0 到 1，政策 + 产业双催化' }
  ];

  // ---- 5. 投资建议（已 Swarm 校验） ----
  // 用 weight 字段做仓位可视化
  const recommendations = {
    long: [
      { star: 3, sector: '金山办公 (试探)',      code: '688111.SH', weight: 4,  tldr: '52× PE + 24% 增速 + 86% 毛利率，-54% ATH 后估值合理', tag: '🆕 Swarm 新增' },
      { star: 3, sector: '国产 CPU / 服务器',    code: '海光+浪潮+中科曙光', weight: 30, tldr: 'Q1 +68%/+43% 验证增长，国产替代确定性强', tag: '✅ 维持' },
      { star: 3, sector: '腾讯',                 code: '0700.HK',  weight: 25, tldr: 'AI Agent + 游戏 + 视频号，港股科技逆势首选', tag: '✅ 维持' },
      { star: 2, sector: '中际旭创 (条件)',      code: '300308.SZ', weight: 2,  tldr: 'H1 业绩催化剂 + 基本面强劲；RSI 顶背离', tag: '⚠️ 下调仓位（原 8%→2%）' },
      { star: 2, sector: '机器人 / 具身 (龙头除外)', code: '拓普+三花', weight: 12, tldr: '产业链从 0 到 1，政策 + 产业双催化', tag: '✅ 维持' },
      { star: 2, sector: '寒武纪 (等回调)',      code: '688256.SH', weight: 12, tldr: '万亿市值后回调，融资撤退中', tag: '✅ 维持' },
      { star: 1, sector: '绿的谐波 (含估风险)',  code: '688017.SH', weight: 1.5, tldr: '谐波减速器龙头；PE 671× + 射击之星 + 半年报风险', tag: '⚠️ 降级 + 降仓' },
      { star: 1, sector: 'IC 载板 / 存储',       code: '深南+兆易', weight: 8,  tldr: 'AI 对先进封装 + 存储需求拉动', tag: '✅ 维持' }
    ],
    avoid: [
      { sector: '科大讯飞 (强烈回避)', code: '002230.SZ', tag: '🔴 Swarm 否决', note: '扣非亏损扩大 88.6%，Kelly -2.6%，下行捕获 1.54×' },
      { sector: '光模块二线',           code: '光迅+新易盛', tag: '⚠️ 维持回避', note: '前期涨幅过大，Q1 分化信号，资金撤出' },
      { sector: '绿的谐波 (追高风险)',  code: '688017.SH', tag: '⚠️ Swarm 确认', note: 'PE 671× + 射击之星；1.5% 仅限战术交易' },
      { sector: '上游稀土 / 钨',        code: '北方稀土',   tag: '⚠️ 维持回避', note: '缺乏独立催化，被动跟跌' }
    ]
  };

  // ---- 6. 风险 ----
  const risks = [
    { tag: 'AI 算力泡沫', level: 'high',  detail: '6-8 月或见结构性高点；寒武纪万亿 + 光模块暴跌 + 机器人估值极端化是信号' },
    { tag: '杠杆资金撤退', level: 'high',  detail: '寒武纪融资余额 -8%（260→240 亿）；若光模块触发强平将引发踩踏' },
    { tag: '光模块周期拐点', level: 'high', detail: '新易盛 Q1 环比 -13.25% 已现裂痕；估值仍在 50-60× PE' },
    { tag: '机器人估值极端', level: 'mid',  detail: '绿的谐波 PE 671× / PB 24× / GPD ξ=0.51 厚尾' },
    { tag: '板块轮动失败', level: 'mid',  detail: '若资金从光模块切换到 AI 服务器/机器人的逻辑不成立 → 全面回撤' }
  ];

  // ---- 7. 附录 — 覆盖标的全列表 ----
  // 精简：只保留 sample 5 + 总数
  const coverage = {
    upstream: { count: 52, samples: ['000657.SZ 中钨高新', '600549.SH 厦门钨业', '002916.SZ 深南电路', '002475.SZ 立讯精密', '600111.SH 北方稀土'] },
    infra:    { count: 29, samples: ['300308.SZ 中际旭创', '688041.SH 海光信息', '000977.SZ 浪潮信息', '688256.SH 寒武纪', '0700.HK 腾讯控股'] },
    model:    { count: 17, samples: ['002230.SZ 科大讯飞', '688088.SH 虹软科技', '300033.SZ 同花顺', '603918.SH 金桥信息', '688099.SH 晶晨股份'] },
    apps:     { count: 15, samples: ['688111.SH 金山办公', '300624.SZ 万兴科技', '600588.SH 用友网络', '1024.HK 快手-W', '0268.HK 金蝶国际'] },
    embodied: { count: 21, samples: ['688017.SH 绿的谐波', '601689.SH 拓普集团', '002050.SZ 三花智控', '9880.HK 优必选', '2533.HK 黑芝麻智能'] }
  };
  return { meta, narrative, sectors, deepDives, flows, recommendations, risks, coverage };
})();
