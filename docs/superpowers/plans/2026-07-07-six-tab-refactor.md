# 6-Tab AI 产业链分析框架重构

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 3-tab 报告重构为 6-tab 完整 AI 产业链分析框架。新增「中游·算力基础设施(L3)」「中游·模型与平台(L4)」「终端·具身与硬件(L5+)」，将现有「下游应用链」重构为「下游·应用与服务(L5 数字应用)」。跨 tab 公司两边都保留。

**Architecture:** 每个 tab 一个独立数据文件 + 一个独立视图文件，平行于现有 upstream.js / upstream-view.js 模式。数据文件结构完全一致（categories + companies + 辅助方法 + validate）。视图文件复用 upstream.css 样式系统。filters.js 负责 tab 切换路由。

**Tech Stack:** Vanilla JS (IIFE), HTML5, CSS3. 零外部依赖。Cloudflare Pages 部署。

## Global Constraints

- 不变量：Sankey 812bn 守恒不变；上游 42 品类 68 公司不变
- 数据文件命名：`src/<tab-id>.js`，暴露 `window.<TAB_ID>_DATA`
- 视图文件命名：`src/<tab-id>-view.js`，暴露 `window.init<TabName>View()`
- 样式复用 `src/upstream.css`，仅必要时新增 CSS class
- 跨 tab 公司：同一家公司在多个 tab 出现时，各自独立定义（各自 ID 命名空间），不共享引用
- 键盘快捷键：保留 U(上游)，新增 I(中游·基建)、M(模型平台)、A(应用)、E(具身)
- 不构成投资建议标注保留
- 方法论文档：每个新 tab 一个 `docs/<tab-id>-methodology.md`

---

### Task 1: 创建「中游·算力基础设施」数据文件

**Files:**
- Create: `src/infra.js`

**Interfaces:**
- Produces: `window.INFRA_DATA` with same API surface as `window.UPSTREAM_DATA`
  - `.categories`, `.companies`, `.categoryGroups` (getters)
  - `.meta` (frozen object)
  - `.getCompaniesByCategory(catId)`, `.getCategoriesByCompany(coId)`
  - `.getCompaniesByMarket(market)`, `.getCompaniesBySubstage(stage)`
  - `.getStats()`, `.search(query)`, `.validate()`
  - `.getCategoriesByMoat(level)`, `.getCategoriesByPricing(power)`

**Data to include (from current `downstream.js`):**

7 赛道，分 2 组：

```
组1「算力运营」: cloud_resell, neocloud, inference_chip
组2「数字基建」: ai_idc, smart_network, optical_module, liquid_cooling
```

categoryGroups:
```js
[
  { id: '算力运营', zh: '算力运营', en: 'Compute Operations', tone: 'amber' },
  { id: '数字基建', zh: '数字基建', en: 'Digital Infrastructure', tone: 'slate' }
]
```

substage 语义：L1=建设期(pre-revenue), L2=爬坡期(利用率<50%), L3=成熟运营(利用率>70%)

现有 downstream.js 中赛道和公司数据直接迁移，保持所有字段。moat/pricingPower 字段保留。

- [ ] **Step 1: 创建 `src/infra.js` 完整数据文件**

按 `src/upstream.js` 结构创建，包含：
- categoryGroups (2 组)
- categories (7 赛道，从 downstream.js 迁移)
- companies (涉及的 18 家公司，从 downstream.js 迁移，重新编号为 `co_i01`..`co_i18`)
- 所有辅助方法
- validate() 校验
- window.INFRA_DATA 导出

**验证**：运行 `node -e "const vm=require('vm');const s={window:{},console};vm.createContext(s);vm.runInContext(require('fs').readFileSync('src/infra.js','utf8'),s);const d=s.window.INFRA_DATA;console.log('Tracks:',d.getStats().totalCategories,'Companies:',d.getStats().totalCompanies);console.log(d.validate());"`

期望：`Tracks: 7 Companies: 18`，`valid: true, errors: 0`

---

### Task 2: 创建「中游·模型与平台」数据文件

**Files:**
- Create: `src/model-platform.js`

**Data to include:**

8 赛道，分 2 组：

```
组1「行业模型」: cv_model, speech_model, fin_model, gov_model, auto_model
组2「端侧与工具」: edge_soc, coding_agent, data_analytics
```

categoryGroups:
```js
[
  { id: '行业模型', zh: '行业大模型', en: 'Industry Foundation Models', tone: 'crimson' },
  { id: '端侧与工具', zh: '端侧AI与开发工具', en: 'Edge AI & Dev Tools', tone: 'moss' }
]
```

substage 语义：L1=实验室/研发期, L2=早期商用(ARR 50M-200M), L3=规模商用(ARR>200M)

- [ ] **Step 1: 创建 `src/model-platform.js` 完整数据文件**

迁移 downstream.js 中上述 8 赛道及关联公司（约 13 家公司，注意去重——如科大讯飞在多个赛道），重新编号为 `co_m01`..`co_m13`。

**验证**：期望 `Tracks: 8`，`valid: true`

---

### Task 3: 创建「下游·应用与服务」数据文件

**Files:**
- Create: `src/apps.js`

**Data to include:**

14 赛道，分 2 组：

```
组1「B2B应用」: office_suite, design_creative, crm_erp_ai, collab_suite,
               legal_saas, medical_saas, edu_saas, industrial_ai, security_ai
组2「B2C平台」: short_video, ad_tech, social_comm, consumer_ai_sub, gaming_ai
```

categoryGroups:
```js
[
  { id: 'B2B应用', zh: 'B2B 企业应用', en: 'B2B Applications', tone: 'slate' },
  { id: 'B2C平台', zh: 'B2C 消费平台', en: 'B2C Platforms', tone: 'amber' }
]
```

substage 语义：与当前 downstream.js 相同 (L1=Pre-Revenue, L2=Early Commercial, L3=Scale-Profit)

- [ ] **Step 1: 创建 `src/apps.js` 完整数据文件**

**验证**：期望 `Tracks: 14`，`valid: true`

---

### Task 4: 创建「终端·具身与硬件」数据文件

**Files:**
- Create: `src/embodied.js`

**Data to include:**

8 赛道，分 2 组：

```
组1「机器人」: humanoid, robot_components, embodied_ai_chip, embodied_os, drone_robot
组2「智驾与硬件」: auto_adas, auto_lidar, smart_hardware
```

categoryGroups:
```js
[
  { id: '机器人', zh: '机器人与具身', en: 'Robotics & Embodied', tone: 'crimson' },
  { id: '智驾与硬件', zh: '智能驾驶与AI硬件', en: 'Auto & AI Hardware', tone: 'amber-2' }
]
```

substage 语义：L1=研发/样品, L2=小批量量产/定点, L3=规模出货(万台+)

- [ ] **Step 1: 创建 `src/embodied.js` 完整数据文件**

注意：`auto_model` (智能座舱) 保留在 model-platform.js，但中科创达(co_d28)同时在 auto_model 和 auto_adas 中，两边各自独立定义。

**验证**：期望 `Tracks: 8`，`valid: true`

---

### Task 5: 创建四个新 tab 的视图渲染器

**Files:**
- Create: `src/infra-view.js`
- Create: `src/model-platform-view.js`
- Create: `src/apps-view.js`
- Create: `src/embodied-view.js`

**Interfaces:**
- Each exposes: `window.initInfraView()`, `window.initModelPlatformView()`, `window.initAppsView()`, `window.initEmbodiedView()`
- Each is an IIFE following the exact pattern of `src/downstream-view.js`
- Each maintains its own `state` object (groupFilter, stageFilter, marketFilter, moatFilter, pricingFilter, searchQuery, sortKey, sortDir, expandedRow)
- Each renders into a `<div id="<tab>-view">` with `<table class="upstream-table">`

**Pattern to follow (copy from downstream-view.js, adapt):**
- `const D = () => window.XXX_DATA;`
- `$` / `$$` selectors scoped to the tab's view div
- `renderElasticityBar()`, badge renderers
- `filteredCategories()` → `renderTable()`
- Filter chip event delegation
- Sort click handlers on `<th class="sortable">`
- Search input handler
- Expandable row detail
- KPI counters at top

**Tab-specific adaptations:**

| Tab | 特有筛选 | stageLabel |
|-----|---------|------------|
| infra | moat + pricingPower | L3=成熟运营, L2=爬坡期, L1=建设期 |
| model-platform | moat + pricingPower | L3=规模商用, L2=早期商用, L1=研发期 |
| apps | moat + pricingPower | L3=规模盈利, L2=早起商业, L1=Pre-Rev |
| embodied | moat + pricingPower | L3=规模出货, L2=小批量, L1=研发样品 |

- [ ] **Step 1: 创建 `src/infra-view.js`**
- [ ] **Step 2: 创建 `src/model-platform-view.js`**
- [ ] **Step 3: 创建 `src/apps-view.js`**
- **验证**：每个文件语法检查 `node --check src/xxx-view.js`
- [ ] **Step 4: 创建 `src/embodied-view.js`**

---

### Task 6: 更新 `index.html` — Tab 导航 + 视图容器 + 脚本加载

**Files:**
- Modify: `index.html`

**Changes:**

- [ ] **Step 1: 替换 tab 导航栏 (line 79-83)**

```html
<nav class="view-tabs">
  <button class="view-tab is-active" data-page="sankey">全球利润</button>
  <button class="view-tab" data-page="upstream">上游·材料设备</button>
  <button class="view-tab" data-page="infra">中游·算力基建</button>
  <button class="view-tab" data-page="model-platform">中游·模型平台</button>
  <button class="view-tab" data-page="apps">下游·应用服务</button>
  <button class="view-tab" data-page="embodied">终端·具身硬件</button>
</nav>
```

- [ ] **Step 2: 为 4 个新 tab 添加视图容器 div**

紧接 `</div><!-- #downstream-view -->` 之前（或之后），添加：

```html
<!-- ══════ 中游·算力基础设施 ══════ -->
<div id="infra-view" hidden>
  <!-- KPI row, filter bar, table — 复制 downstream-view 结构 -->
</div>

<!-- ══════ 中游·模型与平台 ══════ -->
<div id="model-platform-view" hidden>
  <!-- 同上结构 -->
</div>

<!-- ══════ 下游·应用与服务 ══════ -->
<div id="apps-view" hidden>
  <!-- 同上结构，替代原 downstream-view -->
</div>

<!-- ══════ 终端·具身与硬件 ══════ -->
<div id="embodied-view" hidden>
  <!-- 同上结构 -->
</div>
```

每个视图容器的具体内容：KPI 行（4 个指标）+ 筛选栏（组别/阶段/护城河/定价权/市场/搜索框）+ 表格容器 + footnote。

- [ ] **Step 3: 更新脚本加载顺序**

```html
<script src="src/data.js"></script>
<script src="src/sankey.js"></script>
<script src="src/upstream.js"></script>
<script src="src/infra.js"></script>
<script src="src/model-platform.js"></script>
<script src="src/apps.js"></script>
<script src="src/embodied.js"></script>
<script src="src/filters.js"></script>
<script src="src/upstream-view.js"></script>
<script src="src/infra-view.js"></script>
<script src="src/model-platform-view.js"></script>
<script src="src/apps-view.js"></script>
<script src="src/embodied-view.js"></script>
```

保留 `downstream.js` 和 `downstream-view.js` 的引用但注释掉（后续 task 清理）。

- [ ] **Step 4: 更新键盘快捷键提示 (line 68-73)**

```html
<div class="kb-hints">
  <kbd>G</kbd> geo &nbsp;<kbd>L</kbd> layer<br>
  <kbd>U</kbd> 上游 &nbsp;<kbd>I</kbd> 基建<br>
  <kbd>M</kbd> 模型 &nbsp;<kbd>A</kbd> 应用<br>
  <kbd>E</kbd> 具身<br>
  <kbd>1</kbd>-<kbd>5</kbd> rank &nbsp;<kbd>Esc</kbd> clear
</div>
```

---

### Task 7: 更新 `filters.js` — Tab 路由 + 键盘快捷键

**Files:**
- Modify: `src/filters.js`

**Changes:**

- [ ] **Step 1: 扩展 VALID_PAGES 常量 (line 17)**

```js
const VALID_PAGES = ['sankey', 'upstream', 'infra', 'model-platform', 'apps', 'embodied'];
```

- [ ] **Step 2: 扩展 `setPage()` 函数中的视图切换逻辑**

```js
function setPage(page) {
  if (!VALID_PAGES.includes(page)) return;
  state.page = page;

  // 隐藏所有视图
  ['sankey', 'upstream', 'infra', 'model-platform', 'apps', 'embodied'].forEach(function(p) {
    var el = document.getElementById(p + '-view');
    if (el) el.hidden = (page !== p);
  });

  // 同步 tab 按钮
  document.querySelectorAll('.view-tab').forEach(function(b) {
    b.classList.toggle('is-active', b.dataset.page === page);
  });

  // 初始化对应视图（幂等）
  var initMap = {
    'upstream':       { fn: window.initUpstreamView,       flag: '_upstreamInitialized' },
    'infra':          { fn: window.initInfraView,          flag: '_infraInitialized' },
    'model-platform': { fn: window.initModelPlatformView,  flag: '_modelPlatformInitialized' },
    'apps':           { fn: window.initAppsView,           flag: '_appsInitialized' },
    'embodied':       { fn: window.initEmbodiedView,       flag: '_embodiedInitialized' }
  };
  var target = initMap[page];
  if (target && target.fn) {
    window[target.flag] = true;
    target.fn();
  }

  savePrefs(state);
}
```

- [ ] **Step 3: 更新键盘快捷键 (line 330-369)**

替换 U/D 快捷键为新的多键映射：

```js
} else if (key === 'u' || key === 'U') {
  setPage(state.page === 'upstream' ? 'sankey' : 'upstream');
} else if (key === 'i' || key === 'I') {
  setPage(state.page === 'infra' ? 'sankey' : 'infra');
} else if (key === 'm' || key === 'M') {
  setPage(state.page === 'model-platform' ? 'sankey' : 'model-platform');
} else if (key === 'a' || key === 'A') {
  setPage(state.page === 'apps' ? 'sankey' : 'apps');
} else if (key === 'e' || key === 'E') {
  setPage(state.page === 'embodied' ? 'sankey' : 'embodied');
}
```

注意：`A` 键可能与输入框冲突——当前已有 `ev.target` 检查（line 332），所以在输入框内不会触发。

---

### Task 8: CSS 调整 — 6-tab 导航栏适配

**Files:**
- Modify: `src/upstream.css` 或 `src/style.css`

**Changes:**

- [ ] **Step 1: 确保 `.view-tabs` 在 6 个 tab 时不会换行或溢出**

检查现有 `.view-tabs` 和 `.view-tab` 样式。如果 tab 按钮过多，可能需要调整 `font-size`、`padding` 或使用 `flex-wrap`。

在 `src/style.css` 中找到 `.view-tabs` 相关样式。当前 3 个 tab，扩展到 6 个后可能需要将 padding 缩小。具体调整：

```css
.view-tab {
  /* 如果原来 padding 较大，微调 */
  padding: 4px 10px;  /* 原来是 6px 14px 之类 */
  font-size: 11px;     /* 原来可能是 12px */
}
```

如果还是放不下，给 `.view-tabs` 加 `flex-wrap: wrap`。

---

### Task 9: 端到端验证 + 清理旧文件

**Files:**
- Remove/Deprecate: `src/downstream.js`, `src/downstream-view.js`

- [ ] **Step 1: 打开 index.html 验证所有 6 个 tab 可切换**

在浏览器中打开 index.html，手动点击每个 tab 验证：
1. Tab 切换正常
2. 每个 tab 的筛选栏显示正确
3. 每个 tab 的表格数据正常渲染
4. 键盘快捷键 U/I/M/A/E 均正常工作
5. 从 Sankey 切换到各 tab 再切回正常

- [ ] **Step 2: 控制台验证数据校验**

打开浏览器控制台，确认每个数据文件的 validate() 自动运行且输出：
```
[INFRA_DATA] ✓ 数据校验通过 — 7 赛道, 18 公司
[MODEL_PLATFORM_DATA] ✓ 数据校验通过 — 8 赛道, 13 公司
[APPS_DATA] ✓ 数据校验通过 — 14 赛道, 24 公司
[EMBODIED_DATA] ✓ 数据校验通过 — 8 赛道, 14 公司
```

- [ ] **Step 3: 移除旧 downstream.js / downstream-view.js 引用**

从 index.html 中删除或注释掉：
```html
<!-- <script src="src/downstream.js"></script> -->
<!-- <script src="src/downstream-view.js"></script> -->
```

旧文件保留在磁盘上作为参考，但不再加载。

---

### Task 10: 更新方法论文档

**Files:**
- Create: `docs/infra-methodology.md`
- Create: `docs/model-platform-methodology.md`
- Create: `docs/apps-methodology.md`
- Create: `docs/embodied-methodology.md`
- Modify: `docs/downstream-methodology.md` → 添加废弃说明指向前 4 个新文档
- Modify: `docs/upstream-methodology.md` → 更新「与现有报告的衔接」章节

- [ ] **Step 1: 创建 4 个新方法论文档**

每个文档结构平行于 `docs/downstream-methodology.md`：
1. 一句话框架
2. 与上游不变量对齐
3. substage 编码语义
4. 决策矩阵（moat × pricingPower）
5. 与主报告的逻辑衔接
6. 数据来源与置信度
7. 赛道清单
8. 守恒关系边界声明
9. 数据校验流程
10. 已知局限

- [ ] **Step 2: 更新 `docs/downstream-methodology.md` 顶部添加废弃声明**

```markdown
> ⚠️ **DEPRECATED (2026-07-07)**: 本文件描述的 37 赛道 × 61 公司下游视图已拆分为 4 个独立 tab。
> 详见：
> - [中游·算力基础设施](infra-methodology.md) — 7 赛道 × 18 公司
> - [中游·模型与平台](model-platform-methodology.md) — 8 赛道 × 13 公司
> - [下游·应用与服务](apps-methodology.md) — 14 赛道 × 24 公司
> - [终端·具身与硬件](embodied-methodology.md) — 8 赛道 × 14 公司
```

- [ ] **Step 3: 更新 `docs/upstream-methodology.md` §9 衔接章节**

在「与现有报告的衔接」表格中新增 4 行对应新 tab。

---

### Task 11: 浏览器端全功能回归测试

- [ ] **Step 1: 启动本地服务器**

```bash
cd /Users/coco/Project/02-2026-stock-fund-research
npx serve . &
```

在浏览器打开 `http://localhost:3000`

- [ ] **Step 2: 执行完整测试清单**

| 测试项 | 验证点 |
|---|---|
| Sankey 默认加载 | 812bn 利润池、80 公司节点 |
| Sankey geo/layer 切换 | 图例切换、焦点线更新 |
| Sankey TopN 切换 | 1/2/3/4/5 键切换 |
| Upstream tab 点击 | 表格渲染、42 品类 |
| Upstream 筛选 | 组别/阶段/市场/搜索均正常工作 |
| Upstream 排序 | 点击表头排序 |
| Infra tab 点击 | 表格渲染、7 赛道、18 公司 |
| Infra 筛选 | 组别/阶段/护城河/定价权/市场 |
| Model-Platform tab | 表格渲染、8 赛道 |
| Apps tab | 表格渲染、14 赛道 |
| Embodied tab | 表格渲染、8 赛道 |
| 跨 tab 公司 | 寒武纪在 infra(推理芯片) 和 embodied(具身芯片) 都出现 |
| 键盘 I/M/A/E | 各自切换 tab |
| 键盘 U | 上游切换 |
| localStorage | 刷新后恢复上次 tab |

- [ ] **Step 3: 修复发现的问题**

---
