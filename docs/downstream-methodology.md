# Methodology · 2026 AI 下游应用链 赛道×公司映射口径

> ⚠️ **DEPRECATED (2026-07-07)**: 本文件描述的 37 赛道 × 61 公司下游视图已拆分为 4 个独立 tab。详见：
> - [中游·算力基础设施](infra-methodology.md) — 7 赛道 × 15 公司
> - [中游·模型与平台](model-platform-methodology.md) — 8 赛道 × 15 公司
> - [下游·应用与服务](apps-methodology.md) — 14 赛道 × 18 公司
> - [终端·具身与硬件](embodied-methodology.md) — 8 赛道 × 14 公司
>
> 本文件及 `src/downstream.js` 保留在磁盘上作为历史参考，不再被 index.html 加载。

> 本文件解释 `src/downstream.js` 中所有数据字段的口径、来源与已知局限。
> 与 [`upstream-methodology.md`](upstream-methodology.md) 完全平行，但视角相反：
> **上游回答「谁能从利润重构中受益」（材料/设备/电算协同）→ 下游回答「钱流向哪里、谁接盘」（应用/SaaS/机器人/具身）**。

---

## 1. 一句话框架

**沿 Jensen Five-Layer Cake 的 L5 之后，把利润流向下游的 6 个分组、37 个赛道、61 家公司重新归类**

| 上游视角 | 下游视角 |
|---|---|
| L1 Energy / L2 Chip（材料层） | L6-L7-L8（应用层） |
| 中国卡谁脖子 / 谁卡中国脖子 | 谁在应用层锁客户 / 谁被 L4 模型压价 |
| 「国产替代阶段」L1/L2/L3 | 「商业化阶段」L1/L2/L3 |

---

## 2. 与上游不变量对齐

| 上游字段 | 下游字段 | 取值 | 含义 |
|---|---|---|---|
| `categoryGroups[]` | `categoryGroups[]` | 5 / **6** 组 | 多了"机器人具身"（上游未触及具身） |
| `categories` | `categories` | 47 品类 | **37 赛道**（少且更聚焦毛利） |
| `companies` | `companies` | 68 公司 | **61 公司**（去掉"同公司多线"冗余） |
| `policyBoost` | **`moat`** | strong/medium/weak | **护城河**：模型/数据/客户锁定 |
| `chokepoint` | **`pricingPower`** | expanding/flat/compressing | **定价权趋势**：同质化 vs 差异化 |
| `substage: L1/L2/L3` | `substage: L1/L2/L3` | **含义不同** | 下游 = 商业化阶段 |
| `elasticity` | `elasticity` | DOL × PricingPower | 系数范围 1.5-4.2 |

---

## 3. substage 编码语义（关键差异 ⚠️）

下游和上游**共用 L1/L2/L3 三个编码**，但**含义完全不同**。`validate()` 只校验编码合法性，不校验语义——必须靠方法论守住。

| 编码 | **上游语义**（国产替代阶段） | **下游语义**（商业化阶段） |
|---|---|---|
| **L1** | 实验室/小批量 | **Pre-Revenue**（仅 PO/POC；ARR<50M USD） |
| **L2** | 量产但份额<30% | **Early Commercial**（首批 ARR 50-200M；毛利>30%） |
| **L3** | 主导>50% | **Scale-Profit**（ARR>200M；毛利>50%；已盈利或接近） |

**判读示例**：
- 上游 `WF6 substage=L3` = 「中国六氟化钨全球份额 >50%」
- 下游 `humanoid substage=L2` = 「优必选已量产 Walker S2 但年 ARR 仅 50-100M、尚未规模盈利」
- 下游 `office_suite substage=L3` = 「WPS AI 订阅价已提价至 268 元/年，ARR 占比 60%+」

---

## 4. moat × pricingPower 决策矩阵

将「护城河强度」与「定价权趋势」叠加看投资逻辑：

|  | **pricingPower = expanding** | **pricingPower = flat** | **pricingPower = compressing** |
|---|---|---|---|
| **moat = strong** | 🟢 优质型扩张<br>（legal_saas, speech_model） | 🟡 高利润存量<br>（office_suite, ad_tech, retail） | 🟠 风险存量<br>（consumer_ai_sub 早期） |
| **moat = medium** | 🟢 受益型扩张<br>（coding_agent, auto_adas） | 🟡 高粘性同质化<br>（crm_erp_ai, security_ai） | 🟠 厮杀红海<br>（smart_hardware） |
| **moat = weak** | 🔴 高弹性存量<br>（optical_module, inference_chip） | 🔴 出局风险<br>（ad_tech 长尾） | 🔴 纯 commodity<br>（auto_lidar, neocloud） |

---

## 5. 与主报告（index.html）的逻辑衔接

```
[L3 Infra] ─── 812 bn 总盘入口 ──────┬── L4 Model ─→ Sponsor-Subsidy Flow（OpenAI* 补贴 Anthropic*）
                                       │
                                       └─ L5 Application（32% 总盘，~260 bn）
                                             │
                                             ├── 改写 L5 → 进入下游分组
                                             │
        ┌────────────────────┬───────────┴────────┬──────────────┬─────────────┬─────────────┐
        │ L6 云与算力分发    │ L7 行业大模型组     │ L7 办公与创作 │ L7 行业 SaaS│ L8 C 端平台 │ L8 机器人具身 │
        │ (7 赛道)           │ (6 赛道)            │ (6 赛道)     │ (6 赛道)   │ (6 赛道)   │ (6 赛道)    │
        └────────────────────┴─────────────┬──────┴──────────────┴─────────────┴─────────────┘
                                            ▼
                                      在 A/H 股市场的接盘方
                                      （37 赛道 × 61 公司清单）
```

**核心问题**：主报告只回答"谁在赚 AI 的钱"——**下游回答"钱流出应用层后，谁能把钱稳在自己账户里"**。

---

## 6. 数据来源与置信度

| 数据点 | 来源 | 置信度 |
|---|---|---|
| 公司 ticker / 主营业务 | 券商研报 + 年报「主营业务构成」+ Vibe-Trading web_search 交叉验证 | **高** ✅ |
| 弹性系数（DOL × Pricing） | 下游等价估算（非年报拆分） | **中** ⚠️ 待回测 |
| `moat` 字段 | 行业经验判断 + 客户切换成本测算 | **中** ⚠️ 季度复核 |
| `pricingPower` 字段 | 公开 token 价格走势 + SaaS 提价记录 | **中** ⚠️ 按月更新 |
| 当前产出（currentOutput） | 公开年报 + 券商行业研究汇总 | **中** ⚠️ |
| 2030 目标 | 公开研报对赛道 5 年 CAGR 推算 | **低** ⚠️ |

---

## 7. 已建立的赛道路由

`src/downstream.js` 中 `categories` 维护 **37 个赛道**，按 6 个分组：

### 7.1 云与算力分发组（7 赛道 · 18 公司）
| ID | 名称 | 关键公司 |
|---|---|---|
| cloud_resell | 云转售 / 模型 API 分发 | 阿里、腾讯、用友 |
| neocloud | Neocloud / GPU 时租 | 光环新网、科华数据 |
| inference_chip | 推理专用芯片 | 寒武纪 |
| ai_idc | AI 数据中心 / 智算 IDC | 网宿、数据港、梦网 |
| smart_network | AI 智算网络 / 交换机 | 中际旭创、沪电股份 |
| optical_module | 800G/1.6T 光模块 | 中际旭创、新易盛、天孚 |
| liquid_cooling | 液冷 / 数据中心散热 | 英维克、曙光数创 |

### 7.2 行业大模型组（6 赛道 · 9 公司）
| ID | 名称 | 关键公司 |
|---|---|---|
| cv_model | 视觉大模型 / 多模态 | 科大讯飞、虹软 |
| speech_model | 语音大模型 / 翻译 | 科大讯飞（语音线） |
| fin_model | 金融 / 投研大模型 | 同花顺、恒生电子 |
| gov_model | 政务 / 法务大模型 | 金桥信息、太极股份 |
| auto_model | 智能座舱 / 端侧大模型 | 中科创达、虹软 |
| edge_soc | 端侧 AI SoC | 恒玄、瑞芯微、全志 |

### 7.3 办公与创作 SaaS 组（6 赛道 · 7 公司）
| ID | 名称 | 关键公司 |
|---|---|---|
| office_suite | 办公套件 / AI 助理 | 金山办公 |
| coding_agent | Coding Agent / DevOps | 福昕、科大讯飞 |
| design_creative | 设计 / 多模态创作 | 美图、万兴 |
| data_analytics | AI 商业智能 / BI | 普元信息 |
| crm_erp_ai | CRM / ERP AI 嵌入 | 金蝶国际、用友 |
| collab_suite | 协作 / 通信 AI | 科大讯飞（听见） |

### 7.4 行业垂直 SaaS 组（6 赛道 · 8 公司）
| ID | 名称 | 关键公司 |
|---|---|---|
| legal_saas | 法律科技 SaaS | 金桥信息（法律） |
| medical_saas | 医疗 AI SaaS / CDSS | 卫宁健康 |
| edu_saas | 教育 AI / 自适应学习 | 科大讯飞（教育） |
| industrial_ai | 工业 AI / 视觉检测 | 劲拓股份 |
| security_ai | 网络安全 AI | 深信服 |
| auto_adas | 智驾 / ADAS | 德赛西威、经纬恒润 |

### 7.5 消费与内容平台组（6 赛道 · 10 公司）
| ID | 名称 | 关键公司 |
|---|---|---|
| short_video | 短视频 / 内容平台 | 快手 |
| ad_tech | 广告 / 营销 AI | 蓝色光标、利欧股份 |
| social_comm | 社交 / 通信 AI | 知乎 |
| consumer_ai_sub | C 端 AI 订阅 / Pro 版 | 美图、万兴 |
| gaming_ai | 游戏 / 虚拟人 AI | 腾讯（游戏） |
| smart_hardware | AI 硬件 / 可穿戴 | 小米、恒玄 |

### 7.6 机器人与具身智能组（6 赛道 · 9 公司）
| ID | 名称 | 关键公司 |
|---|---|---|
| humanoid | 人形机器人 | 优必选、亿嘉和 |
| robot_components | 机器人核心部件 | 绿的谐波、五洲新春、双环传动 |
| auto_lidar | 激光雷达 / 智驾传感器 | 速腾聚创 |
| embodied_ai_chip | 具身 AI 芯片 / 域控 | 寒武纪、地平线、黑芝麻 |
| drone_robot | 工业无人机 / 巡检 | 航天彩虹 |
| embodied_os | 机器人 OS / 大脑 | （暂无 A/H 直上市公司） |

---

## 8. 与主报告守恒关系的边界声明 ⚠️

**关键点**：下游视图**没有与主报告共享 Σ=812 不变量**，原因：

1. **下游的"利润"是"流速"，不是"池子存量"**——主报告 812 是 2026E 利润池，下游 37 个赛道产出是边际增速与赛道规模，不是从 812 切出来的二次分配。
2. **OpenAI* / Anthropic* 等代理节点未传导**——主报告用 `proxyCompanies` 折算了 L4 层；下游视图不再二次折算下游应用层（避免双重估值代理）。
3. **下游是"受益型分析"，不是"守恒型分析"**——上游 L1/L2 材料的弹性 = "能从 812 里切多少"，下游的弹性 = "从切出的部分能把毛利率拉高多少"。

如果你要做"全栈守恒"，需要单独的 `src/cashflow.js` 做 L1→L8 的合并模型——超出当前版本范围。

---

## 9. 数据校验流程

```bash
# 启动时自检（控制台）
node -e "
const vm = require('vm');
const sb = { window:{}, console };
vm.createContext(sb);
vm.runInContext(require('fs').readFileSync('src/downstream.js','utf8'), sb);
const D = sb.window.DOWNSTREAM_DATA;
console.log('Tracks:', D.getStats().totalCategories);
console.log('Companies:', D.getStats().totalCompanies);
console.log(D.validate());
"

# 端到端（同步检查 upstream）
node -e "
const vm = require('vm');
const sb = { window:{}, console };
vm.createContext(sb);
vm.runInContext(require('fs').readFileSync('src/upstream.js','utf8'), sb);
vm.runInContext(require('fs').readFileSync('src/downstream.js','utf8'), sb);
console.log('UPSTREAM:', Object.keys(sb.window.UPSTREAM_DATA.categories).length, 'cats');
console.log('DOWNSTREAM:', Object.keys(sb.window.DOWNSTREAM_DATA.categories).length, 'cats');
"
```

**期望输出**：
- `Tracks: 37 | Companies: 61`
- `Valid: true | Errors: 0 | Warnings: 0`
- `moat` 分布 ≈ 9 strong / 24 medium / 4 weak
- `pricingPower` 分布 ≈ 19 expanding / 14 flat / 4 compressing

---

## 10. 已知局限

1. **下游赛道弹性系数没有上游 DOL 那种年报拆分精确度**——DOL 部分是估算（订阅型 SaaS 近似），PricingPower 是按公开价格走势标定。
2. **`moat` 与 `pricingPower` 含主观判断**——每季度人工调整。
3. **A 股映射存在「同公司多线」现象**（如科大讯飞横跨 4 个赛道）——目前采用一公司一次 + 注释指向方式；如需更精确，应拆出"事业部分线"。
4. **`embodied_os` 赛道暂无 A/H 直接上市公司**——不阻断 `validate()`，但需要候补或合入 `embodied_ai_chip`。
5. **部分券商覆盖弱**——`co_d63 劲拓股份`、`co_d109 航天彩虹` 等标的的 AI 业务占比可能偏低，请按 `aiRevenuePct` 字段自行评估。
6. **不构成投资建议**——本框架是研究工具，弹性系数、护城河、定价权判断均不代表未来股价表现。

---

## 11. 与现有报告的衔接

| 视图 | 数据文件 | 主回答 |
|---|---|---|
| 主桑基图（index.html） | `src/data.js` | 谁在赚 AI 的钱（**守恒**，Σ=812） |
| 上游供应链（upstream view） | `src/upstream.js` | 谁能从利润重构中受益（**材料/设备/电算协同**） |
| **下游应用链（本文档）** | `src/downstream.js` | 钱流出应用层后，谁能接住（**应用/SaaS/机器人**） |

切换 tab 即可在三个视角间跳转，三个数据文件各自独立，互不依赖。
