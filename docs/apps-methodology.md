# Methodology · AI 下游·应用与服务 A/H 股映射

> 本文件定义「下游·应用与服务」视图中所有赛道筛选、公司映射、弹性系数计算的完整方法论。
> 覆盖 Jensen L5 Application 的数字应用部分（B2B SaaS + B2C 平台）在中国 A/H 股的映射。

---

## 1. 一句话框架

**L5 Application 的数字应用映射：谁能把 AI 功能变成可持续的订阅收入和用户粘性？**

---

## 2. substage 编码语义

| 编码 | 语义（商业化阶段） |
|---|---|
| **L1** | Pre-Revenue（仅 PO/POC，ARR<50M USD） |
| **L2** | Early Commercial（首批 ARR 50-200M，毛利>30%） |
| **L3** | Scale-Profit（ARR>200M，毛利>50%，已盈利或接近） |

---

## 3. 赛道分组

### B2B 企业应用（9 赛道）
| ID | 名称 | 阶段 | 弹性 | 关键公司 |
|---|---|---|---|---|
| office_suite | 办公套件 / AI 助理 | L3 | 2.10 | 金山办公 |
| design_creative | 设计 / 多模态创作 | L2 | 2.65 | 美图、万兴 |
| crm_erp_ai | CRM / ERP AI 嵌入 | L2 | 1.75 | 金蝶、用友 |
| collab_suite | 协作 / 通信 AI | L3 | 2.00 | 科大讯飞（听见） |
| legal_saas | 法律科技 SaaS | L2 | 2.75 | 金桥信息 |
| medical_saas | 医疗 AI SaaS / CDSS | L2 | 2.40 | 卫宁健康 |
| edu_saas | 教育 AI / 自适应学习 | L3 | 1.95 | 科大讯飞（教育） |
| industrial_ai | 工业 AI / 视觉检测 | L3 | 1.65 | 劲拓股份 |
| security_ai | 网络安全 AI | L3 | 1.85 | 深信服 |

### B2C 消费平台（5 赛道）
| ID | 名称 | 阶段 | 弹性 | 关键公司 |
|---|---|---|---|---|
| short_video | 短视频 / 内容平台 | L3 | 1.70 | 快手 |
| ad_tech | 广告 / 营销 AI | L3 | 1.55 | 蓝色光标、利欧股份 |
| social_comm | 社交 / 通信 AI | L3 | 1.50 | 知乎 |
| consumer_ai_sub | C 端 AI 订阅 / Pro 版 | L2 | 3.85 | 美图、万兴 |
| gaming_ai | 游戏 / 虚拟人 AI | L2 | 1.80 | 腾讯（游戏） |

---

## 4. 投资逻辑

- **B2B 企业应用**：高切换成本 + 订阅制 ARR。核心指标是 NDR（净留存率）和 ARR 增速。
- **B2C 消费平台**：用户规模 + 品牌。核心指标是 DAU、付费转化率和 ARPU。

---

## 5. moat × pricingPower 决策矩阵

| | pricingPower=expanding | pricingPower=flat | pricingPower=compressing |
|---|---|---|---|
| **moat=strong** | 🟢 办公套件/法律 SaaS/C端订阅 | 🟡 短视频 | 🟠 — |
| **moat=medium** | 🟢 设计/医疗 SaaS | 🟡 CRM/协作/教育/广告/游戏 | 🟠 社交 |
| **moat=weak** | 🔴 — | 🔴 工业 AI | 🔴 — |

---

## 6. 与其他 tab 的衔接

- 中游·模型平台（model-platform tab）的模型/工具 → 本 tab 的 SaaS 产品
- 本 tab 是数字世界的终点；物理世界的延伸见 终端·具身硬件 tab
- 跨 tab 公司：科大讯飞在 model-platform（模型）、apps（教育/协作）均出现
- 美图/万兴在 apps tab 的 B2B（设计工具）和 B2C（消费者订阅）均出现

---

## 7. 数据来源与置信度

| 数据点 | 来源 | 置信度 |
|---|---|---|
| 公司 ticker / 主营业务 | 券商研报 + 年报 | **高** |
| 弹性系数 | DOL × PricingPower 下游等价估算 | **中** |
| moat / pricingPower | 公开价格走势 + SaaS 提价记录 | **中** |

---

## 8. 已知局限

1. B2C 部分公司 AI 业务占比偏低（如知乎的 AI 摘要仅占营收 15%）
2. 多业务公司（腾讯/科大讯飞）财务数据未按赛道拆分
3. `gaming_ai` 赛道 A 股缺乏纯正标的
4. 不构成投资建议
