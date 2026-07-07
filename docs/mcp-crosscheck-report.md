[1/3] loading src/data.js via node sandbox ...
      geo Σ = 812.0000  layer Σ = 812.0000  companies = 80
[2/3] running internal assertions ...
      Σ diff = 0.000000 (≤0.06: True)
      company mismatches = 0
[3/3] opening vibe-trading-mcp stdio + pulling external snapshot ...
# vibe-trading-mcp × data.js 交叉校验报告

生成脚本：`scripts/mcp-crosscheck.py`

## 1. 内部不变量（src/data.js）

- geo Σ  = 812.0000 USD bn
- layer Σ = 812.0000 USD bn
- 绝对差 = 0.000000（容差 ≤ 0.06）→ **✅ PASS**
- 公司切分守恒 mismatches = **0**（目标：0）
- 公司总数 = 80
- proxyCompanies（7 家）= Anthropic*, Cohere*, Crusoe*, Lambda Labs*, Mistral*, OpenAI*, xAI*

## 2. 外部量级合理性（vibe-trading-mcp · eastmoney 源）

data.js 数字是 **2026E 利润分配**（按业务线切分），MCP 给的是 **最近一期已实现 op income / net profit**（同币种），用于数量级 sanity check。

| Company | data.js 分配 (USD bn) | MCP 最近期 | op_income (native) | net_profit (native) | yoy_op / yoy_net |
|---|---:|---|---:|---:|---|
| NVIDIA | 196.0 | 2026-03-31 USD | 81,615,000,000 | 58,321,000,000 | 85.2% / 210.6% |
| Microsoft* | 84.0 | 2025-06-30 USD | 158,946,000,000 | 66,205,000,000 | 17.5% / 35.7% |
| Alphabet | 68.0 | 2025-12-31 USD | 402,836,000,000 | 132,170,000,000 | 15.1% / 32.0% |
| TSMC | 55.0 | 2025-12-31 TWD | 1,046,090,000,000 | 505,744,000,000 | 20.5% / 35.0% |
| Meta | 48.0 | 2025-12-31 USD | 200,966,000,000 | 60,458,000,000 | 22.2% / -3.1% |
| Amazon | 45.0 | 2025-12-31 USD | 716,924,000,000 | 77,670,000,000 | 12.4% / 31.1% |
| Broadcom | 22.0 | 2026-06-30 USD | 41,498,000,000 | 16,659,000,000 | 38.7% / 59.1% |
| ASML | 14.0 | 2025-12-31 EUR | 32,667,300,000 | 9,609,400,000 | 15.6% / 26.9% |

## 3. 已知 MCP 数据盲区

- `.KS` / `.T` / `.TW` 标的（KR/JP/TW 原股）走 `auto` source 时落在 tushare 但 token 未配置 → `_unresolved`。
  本次只能通过美股 ADR（TSM.US / MU.US / TOELY 等）覆盖；原股股价无法直接拉取。
- eastmoney 美股财务数据存在 1~2 个月延迟，且对 Microsoft / NVDA 等 fiscal year ≠ calendar year 的公司，
  `STD_REPORT_DATE` 是最近一次季报日期而非 FY 截止日 —— 比对时要注意「最近单季 vs 全年」的口径切换。

## 4. 校验结论

- 内部不变量：**✅ 全部通过**
- 外部量级：data.js 中前 8 大美股标的的 2026E 分配均落在 MCP 已实现 op income / net profit 同量级（差异主要来自口径：项目是分配利润，含代理公司；MCP 是报表口径）。

> 复现命令：`python3 scripts/mcp-crosscheck.py`

