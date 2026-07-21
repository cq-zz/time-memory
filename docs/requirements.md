# Timemory 需求整理（V2 迭代）

> 依据 2026-07-21 口述需求整理，参照旧项目 `C:\Resource\timemory` 的字段与逻辑。
> 现状基线：管家页改造已完成（心情签到、功能模块、币种/年份/类别弹窗、数据管理）；物品模块（app/durable）已存在；数据层 db.js/db.web.js + zustand stores 已就绪。

---

## 补充需求（2026-07-21 追加）

1. **物品模块也参照旧项目字段实现**：durable 并入 P2 作为第一个重做模块——字段对齐旧项目（db 表已基本一致，补 `updated_at`），静态 `src/data/durables.js` 全部替换为 SQLite 查询；类别选择器接类别管理数据（19 内置 + 自定义），获得方式扩到 6 种，`repair_record` 按旧项目 JSON 结构 `{expenses:[],incomes:[],transferAmount}` 读写。
2. **存储架构（已满足，无需改动）**：类别管理、心情记录与业务模块共用同一套平台分流存储——移动端 SQLite（db.js）、web 端 AsyncStorage（db.web.js），由 `import './db'` 的 Metro 平台解析自动切换。仅 db.web.js 直接接触 AsyncStorage。
3. **清除所有 mock 数据，全部对接本地存储，无数据显示 "--"**：贯穿规则。每做一个模块即清掉对应 mock；首页/管家/提醒页写死数字依赖资产/账单/预算等模块数据，于 P5 统一接真实数据并补 "--" 兜底（此前底层数据尚不存在）。

---

## 需求 1：五个业务模块路由（资产 / 计划 / 重要日子 / 日记 / 账单）

### 1.1 通用约定

- 每个模块三个页面：**列表 index.js + 新增/编辑 form.js + 详情 [id].js**，归入模块文件夹（与现有 `app/durable/` 一致）。
- 列表入口统一从**管家页功能模块卡片**点击进入（FeatureGrid 补 href：`/asset`、`/schedule`、`/important-date`、`/diary`、`/bills`）。
- 字段与旧项目一致；UI 按当前项目设计体系重做（Ionicons、Work Sans、theme tokens、英文文案→后续 i18n）。
- 公共复用：ImageUploadField（图片）、WheelPicker（日期/时间）、YearMonthPicker（列表年月筛选）、ConfirmModal（删除确认）、ImagePreviewModal（图片预览）。

### 1.2 资产 asset（`app/asset/`）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| name | 文本 | 是 | — | 资产名称 |
| image | 图片 | 否 | — | ImageUploadField |
| category | 枚举 | 是 | other | 资产类别（类别管理数据，含自定义） |
| acquisition_method | 枚举 | 是 | purchase | purchase/gift/reward/inherit/homemade/other |
| status | 枚举 | 是 | active | active / disposed |
| purchase_date | 日期 | 是 | — | WheelPicker level=date |
| purchase_price | 金额 | 是 | 0 | ≥0 |
| current_price | 金额 | 是 | 0 | 当前估值，≥0 |
| expiry_date | 日期 | 否 | — | 失效日期 |
| currency | 文本 | — | 全局币种 | |
| notes | 多行 | 否 | — | |

- 列表：顶部统计卡（active 资产 current_price 合计，万/亿、K/M/B 缩写）+ 搜索 + 状态筛选（all/active/disposed）+ 卡片（类别、获得方式、状态徽章、购买价、当前价高亮、陪伴时长、右图）；按 purchase_date 倒序。
- 详情：Hero 图（可预览）+ 当前估值大字 + 陪伴时长（active=购买日至今，disposed=购买日至 expiry_date）+ 底栏删除/编辑。
- 旧项目有 repair_record 收支双向同步账单逻辑（见待确认 Q2）。

### 1.3 计划 schedule（`app/schedule/`）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| title | 文本 | 是 | — | 计划名称 |
| image | 图片 | 否 | — | |
| priority | 枚举 | 否 | medium | high/medium/low |
| status | 枚举 | 否 | not_started | not_started/in_progress/done/incomplete |
| start_date | 日期时间 | 是 | — | WheelPicker level=minute |
| end_date | 日期时间 | 否 | — | |
| reminder_enabled | 开关 | 否 | 1 | |
| checklist | JSON | 否 | [] | [{id,text,done}]（旧项目无编辑 UI，见 Q3） |
| notes | 多行 | 否 | — | |

- 列表：YearMonthPicker + 搜索 + 状态筛选；卡片左边框按优先级着色，状态 pill 点击循环切换（not_started→in_progress→done→not_started），提醒 Switch；end_date 过期且未完成自动标 incomplete。
- 详情：剩余时间（daysUntil，过期红/今日橙）+ 快捷状态切换按钮组 + 提醒开关。

### 1.4 重要日子 important-date（`app/important-date/`）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| name | 文本 | 是 | — | |
| image | 图片 | 否 | — | |
| date | 日期 | 是 | — | 目标日期 |
| type | 枚举 | 否 | birthday | birthday/anniversary/remembrance/other |
| priority | 枚举 | 否 | medium | high/medium/low |
| reminder_type | 枚举 | 否 | annual | annual（每年）/ once（一次性） |
| reminder_enabled | 开关 | 否 | 1 | |
| reminder_days_before | 数字 | 否 | 1 | 提前 N 天（0–365，仅提醒开启时显示） |
| notes | 多行 | 否 | — | |

> ⚠️ 当前 constant.js 的 `IMPORTANT_DATE_TYPES`（once/annual）映射错了字段——旧项目 `type` 是生日/纪念/缅怀/其他，`reminder_type` 才是 annual/once。需修正常量并扩展 db schema（新增 priority、reminder_type、reminder_days_before 列）。

- 列表：搜索 + 类型筛选；卡片含类型徽章、优先级、倒计时（按 daysUntil 升序）、周年数（annual 显示 yearsPassed+1）。
- annual 下次日期=今年/明年同月同日；once 直接算目标日。

### 1.5 日记 diary（`app/diary/`）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| title | 文本 | 是 | — | maxLength 20 |
| image | 图片 | 否 | — | |
| date | 日期 | 是 | — | 不能晚于今天 |
| weather | 枚举 | 否 | — | WEATHER_OPTIONS 16 种（chip 可取消） |
| content | 多行 | 是 | — | 正文 |
| is_private | 0/1 | 否 | 0 | **私密标记，仅已设密码时显示勾选框**（见需求 4） |

> ⚠️ 当前 db schema 缺 `is_private` 列，需扩展。私密验证用 `is_private` 布尔字段，不是 type 枚举。

- 列表：YearMonthPicker 筛选；行式卡片（左侧 6 色循环竖条 + 图标/缩略图 + 标题 + 日期 + 天气 emoji）；按 date 倒序。**点击私密日记且已设密码 → 弹密码验证框，通过才跳详情**（验证在列表页入口，详情页不校验；未设密码时私密日记直接打开）。

### 1.6 账单 bills（`app/bills/`）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| bill_type | 枚举 | 是 | expense | expense/income 切换按钮 |
| name | 文本 | 是 | — | |
| amount | 金额 | 是 | 0 | >0，两位小数 |
| category | 枚举 | 否 | food | 账单类别（类别管理数据，含自定义） |
| consumption_date | 日期时间 | 否 | — | |
| receipt_image | 图片 | 否 | — | 小票 |
| source / source_id | 文本 | 否 | '' | 记账对象关联（物品/资产） |
| currency | 文本 | — | 全局币种 | |
| notes | 多行 | 否 | — | |

- 列表：YearMonthPicker + 搜索 + 类别筛选；顶部汇总（总支出/总收入、日均/月均、环比同比）；可展开图表区（类别环形图 + 月度趋势柱线图）；**按日分组**（日期头 + 当日合计 + 记录行，金额带 +/- 着色）。
- 新增表单含"记账对象"选择器（Modal 列出 in_use 物品 + active 资产）。
- 旧项目双向同步：选中对象写 source/source_id 并回写对象 repair_record（见 Q2）。

---

## 需求 2：类别管理改为页面（替换当前 CategoryModal）

### 2.1 路由（参照旧项目，按当前路由偏好收敛）

- `app/settings/categories/index.js` — 物品类别列表
- `app/settings/categories/bill.js` — 账单类别列表
- `app/settings/categories/asset.js` — 资产类别列表
- `app/settings/categories/form.js?type=item|bill|asset[&key=xxx]` — 新增/编辑表单（旧项目是 3 个独立表单页，合并为 1 个带 type 参数的 form.js）

管家页 CATEGORY MANAGEMENT 三行改为 `router.push` 到上述列表页；**删除 CategoryModal.js 及其在 ManagementSections 的引用**。

### 2.2 权限规则（核心）

| 操作 | 内置（默认）类别 | 自定义类别 |
|---|---|---|
| 启用/禁用 Switch | ✅ | ✅ |
| 编辑（改名/改图标） | ❌ 不显示编辑按钮，表单页禁止进入 | ✅ |
| 删除 | ❌ | ✅（删除前检查占用，占用中则提示"记录将归入 Other"，确认后把相关数据 category 改为 other 再删） |

- 列表行：圆形图标 + 名称 + 「默认」徽章（仅内置）+ Switch + 编辑按钮（仅自定义）；右下角 FAB 新增。
- 表单页：名称（maxLength 20，必填，查重：不得与自定义重名、不得与内置显示名相同）+ 图标网格选择器（ICON_SELECTOR_OPTIONS 60 个）+ 启用开关（仅编辑模式）；编辑模式底栏含红色删除按钮。

### 2.3 数据与联动

- 复用现有 categories store（custom/disabled 持久化于 settings 键），**需新增 `updateCustom(type, key, {name, icon, enabled})`**（当前 store 只有增删和内置开关）。
- 物品/资产/账单新增表单的类别选择器 = `getMergedCategories` 中 enabled 的项（内置过滤 other + 自定义 + other 垫底），图标/标签解析内置走常量、自定义走 name/icon。

---

## 需求 3：年度收支计划页面（Annual Budget 改为路由跳转）

- 管家页功能模块 Annual Budget 卡片：`router.push('/budget')`（替换当前 BudgetModal；BudgetModal.js 可移除）。
- 路由：`app/budget/index.js`（列表）+ `app/budget/form.js`（新增/编辑，?id= 编辑）。
- **新增数据表 budgets**（当前 db 没有）：`id, year TEXT NOT NULL, expense_budget REAL, income_target REAL, currency, created_at, updated_at` —— 每年一条记录。
- 列表页：年份卡片（年份徽章 + 删除 + 支出预算红行/收入目标绿行，金额带币种符号）；点卡片编辑；FAB 新增；空态。
- 表单页：年份 WheelPicker（level=year，范围取 Year Range 设置，新增时查重 → "该年份已有预算"）+ 支出预算（必填 >0）+ 收入目标（必填 >0）；金额两位小数。
- 联动：首页 BudgetCard 读当年预算（fetchBudgetByYear）+ 当年账单汇总算剩余/超支。
- FeatureGrid 的 budget 统计行同步改为读真实预算数据。

---

## 需求 4：我的页面

### 4.1 头像预览

- 顶部头像点击 → ImagePreviewModal 预览大图（⚠️ 与旧项目不同：旧项目点头像开编辑弹窗，**按你的要求改为预览**）；无头像时点击无效或提示。

### 4.2 个人设置弹窗

- 入口：个人设置行（及昵称行）点击弹出 Modal。
- 内容：头像上传（**复用现有 ImageUploadField**，相机/相册/URL 三源）+ 昵称 TextInput（maxLength 20）。
- 保存 → 写入新建的 **profile store**（zustand，持久化 settings 键 `profile.nickname` / `profile.avatar`），**所有显示头像/昵称的地方同步更新**：HomeHeader（首页+管家共用）、RemindersHeader、ProfileHero/ProfileHeader。
- 无昵称缺省值："时光伙伴"（i18n common.newUser）。

### 4.3 Security 弹窗（私密密码）

- 入口：SettingGroups 新增 Security 行，右侧文案随状态显示「设置密码 / 修改密码」。
- **未设密码**：密码 + 确认密码两个字段。
- **已设密码**：原密码 + 新密码 + 确认密码三个字段，原密码 verify 通过才可保存。
- 校验：新密码非空、长度 ≥6（旧项目代码是 ≥4 但文案写 6，见 Q5）、两次一致、已设时原密码正确。
- 存储：SHA256 哈希（**需安装 expo-crypto**）存 settings 键，不存明文；工具函数移植 `utils/password.js`（setPassword/verifyPassword/hasPassword/clearPassword）。
- 两种形态均显示重要提示："请妥善保管此密码，忘记后不可找回，只能重置。"
- 生效：日记勾选私密（is_private）后，列表点击需验证密码方可进详情（见 1.5）。

### 4.4 重置密码

- 仅已设密码时，在 Security 行下方显示「重置密码」行。
- 点击 → ConfirmModal 确认（"重置后所有私密日记将不再受密码保护"）→ clearPassword；日记 is_private 标记保留，但因无密码不再触发验证（同旧项目）。

---

## 需求 5：首页真实数据 + 心情柱图

### 5.1 各卡片接真实数据（当前全部硬编码）

| 组件 | 数据来源 |
|---|---|
| HomeHeader | profile store（头像/昵称） |
| StatsGrid | 各表 count：durables 总数、schedules 进行中、assets 总数、计划完成率 |
| AssetBalanceCard | 在用物品购买价 + active 资产现值合计（按全局币种） |
| BudgetCard | 当年 budgets 记录 + 当年 bills 汇总 → 剩余/超支 |
| TrendsCard | bills 月度趋势（近 6 个月收入/支出） |
| MonthlyRecordsCard | 当月 bills 汇总（支出/收入金额+笔数，环比） |
| CategoryBreakdown | bills 按类别收支分解（环形图，类别标签走类别管理） |
| RemindersTimeline | 提醒聚合服务前 5 条（见需求 6） |
| MoodTrend | 见 5.2 |

- 数据加载在页面 focus 时刷新；监听数据重置事件刷新。

### 5.2 心情记录改柱图（替换当前假数据 MoodTrend）

- 数据：`useMoodStore` records 取**近 7 天**（已有数据层，直接可用）。
- 柱图：7 根柱，高度 = score/5（无记录显示灰色矮柱）；**柱色按得分映射**：5→#4AA868、4→#6BAA90、3→#E8B830、2→#F28B50、1→#D94452。
- x 轴：每柱下方显示日期（M/D）+ **心情表情** + 得分。
- **图例**：5 个色块 + 分数 5/4/3/2/1 说明。
- 附加：7 天平均分文案 + 本周打卡 N 天；空数据态。

---

## 需求 6：REMIND SETTINGS（管家页）+ 提醒聚合

### 6.1 管家页提醒设置（替换当前 3 个空 RemindRow）

参照旧项目：内联**步进器行**（− 数值 +），原地修改提前提醒天数并持久化（settings 键）：

| 模块 | 默认 | 范围 | 说明 |
|---|---|---|---|
| 计划开始提醒 | 1 天 | 0–7 | 按 end_date 计算 |
| 物品过期提醒 | 2 天 | 0–7 | 按 expiry_date（in_use） |
| 资产失效提醒 | 30 天 | 0–365 | 按 expiry_date（active） |

（重要日子不用全局天数，用每条记录自带的 reminder_days_before。）

### 6.2 提醒聚合服务（支撑提醒 tab + 首页时间线）

- 新建 `src/store/reminders.js` 或 `src/utils/reminder.js`：聚合四路数据（schedules 未完成+reminder_enabled、durables in_use+expiry、assets active+expiry、important_dates reminder_enabled 按 annual/once 算下次日期），过滤 daysLeft ≤ 配置天数（过期始终显示），排序（过期优先→剩余天数→优先级→模块序）。
- reminders tab（RemindersHeader/Search/ReminderList 当前静态）与首页 RemindersTimeline 共用此服务；点击按模块跳各自详情页。
- 旧项目无系统推送（未用 expo-notifications），纯应用内实时计算——保持一致。

---

## 需求 7：国际化（参照旧项目）

- 安装 `i18next` + `react-i18next` + `expo-localization`。
- 新建 `src/i18n/index.js`（initReactI18next，fallback en，escapeValue:false）+ `src/i18n/locales/en.js`、`zh-CN.js`（可从旧项目迁移，按新页面调整键）。
- 启动加载：`_layout.js` 调 loadSavedLanguage()（读 settings 的 language，无则 expo-localization 检测系统语言）。
- 语言切换：profile SettingGroups 的 Language 行（当前无 onPress）接 setLanguage()。
- ⚠️ 语言 code：当前 settings store 用 `zh`，旧项目用 `zh-CN`——建议统一改为 `zh-CN` 以复用旧翻译文件（见 Q1）。
- 范围：全部页面文案走 `t()`（现有 ~40 个组件的硬编码英文 + 所有新页面）。建议新页面从编写起就用 t()，存量组件随各阶段顺手迁移，最后统一收尾。

---

## 数据层变更清单（db.js schema，db.web.js 通用无需改）

1. `important_dates` 增列：`priority TEXT`、`reminder_type TEXT DEFAULT 'annual'`、`reminder_days_before INTEGER DEFAULT 1`、`updated_at TEXT`；`type` 语义改为 birthday/anniversary/remembrance/other。
2. `diaries` 增列：`is_private INTEGER DEFAULT 0`、`updated_at TEXT`。
3. 新增 `budgets` 表：`id PK, year TEXT NOT NULL, expense_budget REAL DEFAULT 0, income_target REAL DEFAULT 0, currency TEXT, created_at, updated_at`。
4. 其余表补 `updated_at`（assets 已有；schedules/bills 补）。
5. constant.js 修正：`IMPORTANT_DATE_TYPES` 改为生日/纪念/缅怀/其他；新增 `REMINDER_TYPES`（annual/once）；`SCHEDULE_PRIORITIES` 可复用于 important-date。
6. 新增依赖：`expo-crypto`（密码哈希）、`i18next`、`react-i18next`、`expo-localization`。

---

## 待确认事项

1. **语言 code**：统一改为 `zh-CN`（复用旧项目翻译文件）还是保持 `zh`？（建议 zh-CN）
2. **账单 ↔ 物品/资产 repair_record 双向同步**：旧项目选中记账对象会把账单回写进对象 repair_record 的收支列表（资产购买价也自动同步成账单）。完整移植较复杂，是否第一版就完整移植？（建议：先做 source/source_id 关联展示，repair_record 回写放后续）
3. **计划 checklist**：旧项目只有数据层无编辑 UI，是否需要补 checklist 编辑交互？（建议：第一版不做，保持与旧项目一致）
4. **密码长度规则**：旧项目代码 ≥4、文案写 ≥6，采用哪个？（建议 ≥6）
5. **i18n 节奏**：基础设施先行、新页面直接 t()、存量最后收尾——是否认可？

---

## 建议实施阶段

- **P0 基础设施**：schema 扩展 + constant 修正 + 安装依赖 + i18n 基建与 locale 迁移 + profile store + password 工具。
- **P1 类别管理页面化**：三个列表页 + form.js + store 补 updateCustom + 删除 CategoryModal。
- **P2 六个业务模块**：durable（重做对齐旧项目）→ asset → schedule → important-date → diary → bills（各含列表/表单/详情，diary 含私密勾选；全程无 mock、接 SQLite、空数据显示 "--"）。
- **P3 年度收支计划**：budgets 表 + 列表/表单页 + FeatureGrid 跳转改造。
- **P4 我的页面**：头像预览 + 资料弹窗 + Security + 重置密码 + 日记私密验证闭环。
- **P5 首页真实数据 + 心情柱图 + 提醒体系**：REMIND SETTINGS 步进器 + 提醒聚合服务 + reminders tab + 首页 9 卡接数据。
- **P6 i18n 收尾**：存量组件文案全量替换 + 双语校验。
