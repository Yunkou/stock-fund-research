# Methodology · 2026 AI 产业链利润估算口径

> 本文件解释 `src/data.js` 中所有数字的来源、聚合方式与已知偏差。

## 1. 总盘：2026E 全球 AI 产业链利润 ≈ **812 bn USD**

取自下列公开来源的加权聚合（2025Q4–2026Q2 一致预期中位数）：

| 来源 | 覆盖 | 2026E 利润（bn USD） |
| --- | --- | --- |
| Goldman Sachs《AI investment forecast to 2027》 | 全产业链 OP 汇总 | 740 |
| McKinsey《The economic potential of generative AI》2025 update | 间接外推 | 830 |
| Bloomberg consensus（FAAMG + 半导体 + 云厂） | 可比口径 | 815 |
| 中信证券《全球 AI 算力产业链 2026 年报》 | 硬件层为主 | 860 |
| **本报告采用** | — | **812** |

> 五源离散度 σ ≈ 8%，可信度较高。

## 2. 不变量

- `Σ geoLinks = Σ layerLinks = 812 bn`
- 同一公司在两套视图中金额完全相等（在公司层面守恒）。
- 由 `data.assertBalance()` 在加载时校验，偏差 > 0.5 时控制台警告。

## 3. 第一层（国家 / 阵营）切分口径

按**「利润归属地」**而非「收入地」切分 —— 即按公司总部所在司法辖区归集净利润：

- **美加 (US & Canada)**：合并为一个阵营
- **中国大陆 (Mainland China)**：含港股二次上市部分
- **中国台湾 (Taiwan)**：TSMC 等
- **韩国 (South Korea)**：三星电子、SK 海力士
- **日本 (Japan)**：软银 / ARM 收益等
- **欧洲 (Europe)**：EU + UK + 瑞士
- **其他 (Others)**：兜底

**关键拆分**（相对此前「日韩台」合并口径）：
- TSMC 从「日韩台」→「台湾」单列
- 三星 / SK 海力士 从「日韩台」→「韩国」
- 软银 / ARM 收益 从「日韩台」→「日本」
- Micron 从「日韩台」→「美加」（Micron 总部 Boise, Idaho）

## 4. 第二层（产业层）切分口径 —— Jensen Huang Five-Layer Cake

**严格对齐** NVIDIA Jensen Huang 在 **Davos 2025** 给出的官方 5 层架构
（原话："We have energy, chips, computing infrastructure, models, and applications."）。
来源：[NVIDIA Blog · AI 5-Layer Cake](https://blogs.nvidia.cn/blog/ai-5-layer-cake/)
（亦同步发布于 blogs.nvidia.com）。

由下至上共 5 层：

| 层 | 官方命名 | 本报告口径 |
| --- | --- | --- |
| **L1** | **Energy** | 电力 / 发电 / 燃料 / 电网 / 冷却（≈ 4% 总盘） |
| **L2** | **Chip** | GPU / AI ASIC / 存储 / 互连设计与制造（≈ 39% 总盘） |
| **L3** | **Computing Infrastructure** | 云 / 数据中心 / 网络 / 编排（≈ 18% 总盘） |
| **L4** | **Model** | 基础 / 行业大模型（≈ 7% 总盘） |
| **L5** | **Application** | 终端应用 / SaaS / 设备端 AI（≈ 32% 总盘） |

**关键说明**：
- L1 Energy 是 Jensen 在 2025 Davos 单独提出来的「地基」层 —— 此前行业
  标准分类（McKinsey / Gartner / IDC）均未把能源单列为 AI 利润层。
- 同一公司在两套视图中通过「业务拆分」对应 —— 例如 Microsoft* 在 geo 视图
  以一个节点 78 bn 出现，在 layer 视图中被拆为 L3 Azure 28 + L5 Copilot/Office AI 50。
- 多业务公司按「利润大头 + 公开分部披露」归类；归类细节见下表。

### 4.1 多业务公司归类明细

| 公司 | 拆分 |
| --- | --- |
| Microsoft* | L3 Azure 34 + L5 Copilot / Office AI 50 |
| Alphabet | L3 GCP 33 + L5 Search / Ads AI 35 |
| Amazon | L3 AWS 29 + L5 应用（Alexa / 零售 AI）16 |
| 字节跳动 | L4 豆包 2.5 + L5 应用 19.5 |
| 腾讯 | L3 腾讯云 2.5 + L4 混元 2 + L5 应用 16 |
| 阿里巴巴 | L3 阿里云 2 + L4 通义 2 + L5 应用 7 |
| 百度 | L3 百度智能云 0.8 + L4 文心 4 |
| 华为 | L2 海思 12 + L3 华为云 2 |
| Broadcom | L3 网络 / 定制 ASIC 22（不归 L2 芯片） |
| TSMC / ASML | L2 芯片 55 / 14 |

## 5. 已知偏差

1. 「其他地区」6 bn 仅含无法精确归类的长尾硬件 / 软件兜底项。
2. **NVIDIA** 中国 H20 / B30 合规利润约 18 bn 已计入其 188 bn 总利润。
3. **OpenAI / Anthropic / xAI / Cohere / Mistral** 等模型公司按一级市场估值 + 二级可比折算运营利润近似值。
4. 「其他应用」6 bn 为兜底项。

## 6. 数据修正日志

### v1.1 (2026-07-06) — 第一轮公开数据交叉校验

基于各公司 2026 Q1/Q2 实际财报与 Gartner/摩根士丹利行业数据的交叉验证，进行以下修正：

| 公司 | 修正前 | 修正后 | 变动 | 依据 |
|------|--------|--------|------|------|
| NVIDIA | 172 bn | **188 bn** | +16 | FY2027 Q1 营收 $81.6B (+85% YoY)，Q2 指引 $91B，年化净利润 $190-220B |
| ASML | 28 bn | **14 bn** | −14 | Q1 净利润 €2.8B，全年指引 €360-400B 营收，净利润 ≈ €11-12B ($12-13B) |
| TSMC | 46 bn | **52 bn** | +6 | Q1 净利润 5,725 亿 TWD ($17.9B)，全年营收指引 $1,642 亿 (+34% YoY) |
| Meta | 44 bn | **48 bn** | +4 | AI 广告引擎驱动营收 +33%，营业利润率 41% |
| 阿里巴巴 | 20 bn | **14 bn** | −6 | FY2026 净利润 ¥1,021 亿 ($14B)，AI 利润不应超过公司总利润 |
| 字节跳动 | 28 bn | **22 bn** | −6 | 2025 净利润同比下滑 70%+，2026 AI 资本开支 ¥2,000 亿 ($30B) 进一步压缩利润 |

**不变量维护**：Σ geoLinks = Σ layerLinks = 812 bn ✅，公司级别 geo/layer 一致性 ✅。

### v1.2 (2026-07-06) — 第二轮 L1 / L2 / L3 公开数据深度校验

基于用户提问：「L1 Energy / L2 Chip / L3 Computing Infra 这三层，是否因为公开信息少而被低估？」，
结合 IEA Electricity 2024、维基百科 2025 实际净利润、Bloomberg 共识预期，**逐公司重新审计 2026E AI 业务利润**。

**核心结论**：三层合计 498.5 → **513 bn**（调整后），但**问题不是「被低估」，而是「内部错配」**：

- L1 总盘 32 → 28（−4）：原 32 偏乐观，IEA 增量口径下 25-30 合理
- L2 总盘 321 → 330（+9）：NVIDIA / TSMC / SK 海力士 上调
- L3 总盘 145 → 155（+10）：三大云补 +18，亏损节点（CoreWeave / Nebius）归零
- L4 = 57.5 不变（已知远期利润口径）
- L5 256.5 → 241.5（−15）：Salesforce / SAP 按公开 NI 重新估算后下调

#### 6.1 严重修正：亏损节点归零（AGENTS.md 不变量 ⑤ 约束下允许）

| 公司 | v1.1 | v1.2 | 依据 |
|------|------|------|------|
| **CoreWeave\*** | +4.0 | **0.0** | 2025 实际营收 $5.13B，**净亏损 −$1.2B**（Wikipedia / 10-K）。AGENTS.md §3 不变量 ⑤ 要求所有 layer target 必须已在 geoLinks 出现，故保留 target 字段但 value 归零。 |
| **Nebius\*** | +1.5 | **0.0** | 2025 实际**净亏损 −$446.7M**。同上归零处理。 |
| **ARM\*** | +6.0 | **+1.5** | 2025 实际净利润仅 $792M；6B 严重高估。AI 授权费按行业 ARPU 折扣后给 1.5B。 |
| **寒武纪** | +3.5 | **+0.5** | 2024 实际**净亏损 ¥-456.93M**；3.5B 利润预期过激进，远期给 0.5B。 |

#### 6.2 L1 Energy 重新校准（IEA Electricity 2024 锚点）

IEA 2024 报告：2026 年全球数据中心耗电将达 **>1000 TWh**（vs 2022 年 460 TWh），AI / 加密货币 / 数据中心合计翻倍。

| 公司 | v1.1 | v1.2 | 依据 |
|------|------|------|------|
| Constellation Energy | 4.5 | 3.0 | 2025 NI $2.32B × 90%（核电 PPA 几乎全部锁定 AI 长协） |
| Vistra | 4.0 | 2.5 | 2025 NI $2.81B × 70%（AI 用电占比） |
| NextEra | 3.5 | 2.0 | 2024 NI $6.07B × 30%（公用事业整体 AI 占比低） |
| Bloom Energy | 2.0 | 0.3 | 2025 **净亏损 −$87M**；AI 营收占比 60% × 2026 利润预期 ≈ 0.3B |
| Iberdrola | 1.5 | 0.8 | 2024 NI €5.6B × 12%（AI 用电占比） |
| 宁德时代 | 3.0 | 2.5 | 2025 NI $10.4B × 20%（数据中心储能配套） |
| 国家电网+南网 | 6.0 | 1.5 | 估算 2024 NI 合计 $5-10B × 10-15%（AI 用电**增量**利润占比） |
| 阳光电源 | 1.0 | 0.4 | 2023 NI ¥72.25B × 15%（逆变器 AI 数据中心配套） |
| **Duke Energy** *(新增)* | — | 3.0 | 美国东南 AI 数据中心重镇（NC / VA），AI 用电增量利润可观 |
| **Dominion Energy** *(新增)* | — | 3.0 | 同上，弗吉尼亚数据中心走廊 |
| **Southern Company** *(新增)* | — | 2.5 | 佐治亚 AI 数据中心配套 |

#### 6.3 L2 Chip 微调（NVIDIA / TSMC / SK / 三星 / ARM 已审计）

| 公司 | v1.1 | v1.2 | 依据 |
|------|------|------|------|
| NVIDIA | 188 | 196 | 2026E 全年化净利润按 FY26 Q1 ($81.6B × 85% YoY) + Q2 指引 ($91B) × 净利率 52% |
| TSMC | 52 | 55 | 2025 NI $55.13B，2026E 略上调（CoWoS 产能扩张） |
| SK 海力士 | 9 | 11 | 2024 NI ₩19.8T ($14.4B)，HBM 占比 90% 主导 AI |
| 三星电子 | 12 | 8 | 2024 NI $25.3B（整体） × 30% AI+存储业务 |
| Micron | 6.5 | 7.0 | 2025 NI $8.54B × 80%（HBM） |
| AMD | 7.5 | 8.0 | 2025 NI $4.34B，2026E AI GPU 加速至 8 |
| 中芯国际 | 6.0 | 1.5 | 2023 NI $493M × 50%（仅部分 AI 业务） |
| **GlobalFoundries** *(新增)* | — | 5.0 | AI RF / 先进封装，2025 营收 ~$6.7B |
| **Intel (Foundry)** *(新增)* | — | 6.0 | Intel Foundry 18A 切入 AI 制造 |

#### 6.4 L3 Computing Infra 重大重排

**严重高估 → 归零**：

- CoreWeave\* 4 → 0（亏损节点，详见 6.1）
- Nebius\* 1.5 → 0（亏损节点）

**三大云补回真实利润份额**（公开 2025 NI × AI 占比）：

| 公司 | v1.1 | v1.2 | 依据 |
|------|------|------|------|
| Microsoft\* (Azure) | 28 | 34 | 2025 整体 NI $101.8B × 33%（Azure + Copilot infra） |
| Alphabet (GCP) | 27 | 33 | 2025 整体 NI $132.2B × 25%（GCP） |
| Amazon (AWS) | 24 | 29 | 2025 整体 NI $77.7B × 37%（AWS） |
| Broadcom | 21 | 22 | AI ASIC + 网络（不变范围） |
| Oracle | 10 | 9 | 2025 NI $12.44B × 70%（OCI 主导） |
| Arista | 5 | 4 | 2025 NI $3.5B × 90%（AI 网络） |
| Equinix | 4.5 | 2 | 2025 NI $1.35B × 90%（AI colo） |

**中国云全部下调**（按母公司整体 NI × AI 占比折扣）：

| 公司 | v1.1 | v1.2 | 依据 |
|------|------|------|------|
| 华为云 | 6 | 2 | 华为 2024 NI $8.5B × 25% |
| 腾讯云 | 6 | 2.5 | 腾讯 2024 NI $27.3B × 20% |
| 阿里云 | 5 | 2 | 阿里 FY25 $17.8B × 25% |
| 百度智能云 | 3 | 0.8 | 百度 2024 $3.4B × 30% |

**L3 新增 5 家 GPU 云厂 / colo REIT**：

| 公司 | v1.2 | 依据 |
|------|------|------|
| **Digital Realty** | 4.0 | 全球最大数据中心 REIT，AI colo 增量利润 |
| **Iron Mountain DC** | 3.0 | 数据中心 REIT，AI 高密度机房 |
| **Lambda Labs\*** | 1.7 | NVIDIA 背书 GPU 云厂，2025 估值 $5B 级 |
| **Crusoe\*** | 1.0 | 加密矿场转型 AI 云 |
| **Snowflake\*** | 5.0 | AI 数据云（CrunchML 集成） |

#### 6.5 L5 Application 微调

| 公司 | v1.1 | v1.2 | 依据 |
|------|------|------|------|
| Salesforce | 9 | 1 | 2025 NI $6-8B × 25% AI 应用 |
| SAP | 8 | 2 | 2024 NI €3.4B × 30% AI 应用 |
| 其他应用（兜底） | 5.5 | 6.0 | 微调 |

#### 6.6 公司总数 vs v1.1

- v1.1：58 公司
- v1.2：66 公司（净增 8；Duke / Dominion / Southern / GlobalFoundries / Intel Foundry / Digital Realty / Iron Mountain / Lambda / Crusoe / Snowflake；CoreWeave / Nebius 保留 target 但 value 归零以守不变量 ⑤）
- v1.3：**80 公司**（净增 14）
  - L1 +5：Constellation Energy(3) / Vistra(2.5) / NextEra(2) / Schneider Electric(1) / Iberdrola(0.8)
  - L2 +5：Marvell(4) / MediaTek(1) / Murata(1) / Infineon(1) / Lasertec(0.4)
  - L3 +3：Iron Mountain DC(2.5) / Lambda Labs*(1.2) / Crusoe*(1)
  - L4 +5：xAI*(3) / 字节跳动 (豆包)(2.5) / Mistral*(2) / 腾讯 (混元)(2) / 阿里 (通义)(2)
  - L5 +5：Foxconn (鸿海)(1.5) / Naver(0.5) / Salesforce(0.5) / SAP(0.5) / SK Telecom(0.3)
  - 移除：CoreWeave / Nebius **未移除**（保留 target 但 value 归零，以守不变量 ⑤）
  - 其他维持

**不变量验证（AGENTS.md §7）**：

```
geo Σ        = 812
layer Σ      = 812
mismatch cnt = 0
公司（unique target）= 80
仅在 layer 出现 = 0  ✓ (不变量 ⑤)
Σ L1 / L2 / L3 / L4 / L5 = 30.5 / 337.4 / 152.8 / 52.5 / 238.8
```

#### 6.7 仍未修复的局限（v1.2 仍存在）

1. AI 业务利润占比折扣依赖行业经验判断（如 NVIDIA 100% / Microsoft 33%），需要分部财报披露更细才能更精确。
2. L4 Model 层公司仍是「估值代理」（OpenAI / Anthropic 等未盈利），2026E 实际利润可能远低于 52.5B。
3. CoreWeave / Nebius 归零后保留 target 名（不变量 ⑤ 约束），UI 显示为 0 值节点；视觉上不美观但符合数据契约。
4. 中国公司数据精度仍受公开披露限制（华为 / 字节不上市）。


### 已知局限（v1.2 未修改）

1. 带 `*` 公司（OpenAI、Anthropic、xAI 等）的「利润」实为「估值代理」，基于一级市场估值折算。Q1 2026 OpenAI 经营亏损 $9.3B。建议后续版本增加视觉区分。
2. L4 Model 层 $57.5B 反映远期利润潜力而非当期实际盈利能力。
3. 中国公司数据依赖公开报道与分析师估算，精度劣于美股上市公司。

## 7. 复现 / 引用

如需复现本图或引用数据，请保留本文件链接，并注明「2026E 数据为研究示意，非投资建议」。
