# 微信小程序版改造方案

> 分支：`feature/weapp` · 基准：App 端（React + Vite + Capacitor） · 技术底座：Taro（React 语法）+ 微信小程序
> 日期：2026-09-06 · 状态：整理修订版（含有道移除决策）

---

## 1. 目标与结论

把现有「K12 单词学习」App 复刻为微信小程序。**结论：可行，成功率高** —— App 的核心增值在纯业务逻辑（SRS 复习调度、错词判定、词根词缀、例句发音、按学段词库），这些与平台无关可整体复用；需要重写的只有「表现层」与「平台 API 壳」。

**核心策略：不是复制现有 App 再改，而是"共享心脏、各自穿衣"。** 抽出零平台依赖的 `core` 包，App 端与小程序的 UI 各自实现，业务逻辑共用一份。

**当前关键状态（已完成两件前置事项）**：
- ✅ 单词发音已移除第二方有道接口，CDN 补齐至 **100% 覆盖（3740/3740）**，发音零第三方依赖；
- ✅ 音频 / 配图已全部 CDN 化，APK 仅 4.74 MB。

---

## 2. 现状盘点（基于当前 `src/`）

### 2.0 内容与 CDN 资产清单

| 资产 | 数量 / 规模 | CDN 路径 | 备注 |
|---|---|---|---|
| 词库：高中/初中/小学 | 3 学段，去重 3740 词 | 不入包（APP 内按学段 chunk） | 数据在 `src/data/*.ts` |
| 单词发音 | 3740 个 opus | `/audio/{word}.opus`（~9.7MB） | 100% 覆盖，无第三方依赖 |
| 例句音频 | 3261 个 mp3 | `/audio/sentences/`（~64MB） | 约 480 词无真人例句（源数据限制） |
| 单词配图 | 907 张 webp | `/images/{key}.webp` | 其余词无配图，App 自动隐藏 |

### 2.1 可整体复用（纯逻辑，零容器依赖）→ 进 `core`

| 模块 | 说明 |
|---|---|
| `utils/sm2.ts` | SRS 复习调度（含 consecutiveWrong 轰炸机制） |
| `utils/wordKey.ts` | 稳定词条标识 `w:english\|chinese` |
| `utils/affix.ts` | 词根前缀后缀分解（配色分三部分） |
| `utils/confusion.ts` | 易混词近邻检测（deletion-signature 索引 + 编辑距离复核） |
| `utils/parser.ts` | 词库 / 词条解析 |
| `utils/units.ts` `weekly.ts` `streak.ts` `syllables.ts` `array.ts` `diff.ts` `colors.ts` | 单元、周维度、连续天数、音节、通用工具 |
| `utils/challenge.ts` `utils/quiz.ts` `utils/achievements.ts` | 挑战 / 测验 / 成就逻辑（落地时核对是否仅依赖 core 内 storage 抽象） |
| `types.ts` `data.ts` | 类型与数据模型、wordKey 生成 |
| `data/senior.ts` `junior.ts` `primary.ts` | 词库数据源（例句已做繁转简） |
| `data/sentenceAudioMap.json` | 例句音频→文本/中文/文件路径映射 |
| `config/cdn.ts` `utils/wordImage.ts` | 纯函数：CDN 资源路径 / 配图 URL 生成 |

### 2.2 平台相关 → 定义「抽象层」，双端各实现一份

App 端与小程序共用同一套**接口约定**，各自实现：

| 抽象接口 | App 端实现（Web/Capacitor） | 小程序端实现 |
|---|---|---|
| `storage` | `localStorage` | `wx.setStorageSync`（接口对齐，调用方无感） |
| `audio.playWord(word)` / `playSentence(word)` | `new Audio()` + CDN URL | `wx.createInnerAudioContext`，URL 不变仍走 CDN |
| `feedbackSound` | Web Audio API 合成 | `wx.createInnerAudioContext` 短资源 / 静默降级 |
| `scroll/layout` | `window.scrollTo` | `wx.pageScrollTo` |
| `backup` | Capacitor `Filesystem` 导入导出 | `wx.cloud` 云存储 / 剪贴板 JSON |
| `fineInput/gesture` | `useEdgeSwipe`/`useVirtualList` | 小程序手势、`scroll-view`/列表 |

> 抽象层不追求 App 端大改，只需定义接口边界；调用方（core 与页面 Hooks）面向接口编程。

### 2.3 需重写（表现层 React 页面）→ Taro 页面

首页 `Dashboard`、学习 `StudyMode`、拼写 `SpellingMode`、测验 `QuizMode`、词典 `WordList`、复习 `MistakesView`、已掌握 `LearnedView`、易混 `ConfusionView`、统计 `StatsView`、成就 `AchievementsView`、设置 `SettingsView`、单元 `UnitsView`、今日已复习 `TodayReviewedView`、`StageSwitcher`、`BatchCompleteView` 等。

> 若做 MVP，仅「首页 + 学习 + 词典 + 复习」4 条核心链路优先落地。

---

## 3. 目标架构（monorepo）

```
k12-vocab/
├─ package.json                 # npm workspace 根
├─ .env.production              # 双端共用 VITE_CDN_BASE（App 用；小程序读同一域名做白名单）
├─ packages/
│  ├─ core/                     # 纯业务逻辑（2.1 全部），双端共用
│  │  ├─ src/srs / parser / affix / confusion / cdn / wordKey / storage(接口)
│  ├─ app/                      # 现有 Capacitor 安卓端迁入（React + Vite + Tailwind）
│  └─ weapp/                    # 新建 Taro 小程序端
│     ├─ src/pages/  home / study / dict / review / ...
│     ├─ src/components/        # Taro 视图组件
│     ├─ src/platform/          # storage / audio / scroll 抽象层实现
│     └─ project.config.json / appid 配置 / 分包 subpackages
└─ docs/weapp-migration-plan.md # 本文档
```

**为什么拆两工程又抽 `core`**：App（Capacitor）与小程序（无 DOM、`wx.*`）技术底座不同，构建/发布互相牵制，必须拆；但 SRS/错词/成就等状态逻辑必须单一来源，抽 `core` 保证两端行为一致、避免漂移。

---

## 4. 小程序专属落地要点

### 4.1 包体积与分包（硬约束）
- 主包限 2MB / 总体 20MB；小程序代码包有独立限制。
- 词库 chunk（`data-senior` 未压缩 ~990KB）**必须拆子包 + 学段懒加载**，不可进首包。
- 音频/图片全部走 CDN（现状已达标），坚决不入包。

### 4.2 CDN 与域名合规
- 微信公众平台 → 开发 → 开发管理 → **服务器域名**加白名单（`request` + `downloadFile`）：
  `https://k12-vocab-assets-1259535198.cos.ap-beijing.myqcloud.com`
- 域名已 ICP 备案；图片用 `<image>`、音频用 `wx.createInnerAudioContext`，均走 CDN URL。

### 4.3 审核合规红线（写进行为规范）
| 红线 | 说明 |
|---|---|
| **类目** | 报「**工具-效率**」（避免「教育」被索办学许可等资质） |
| **匿名可用** | 无强制注册/登录（本地存储天然满足） |
| **无支付** | 无虚拟支付，规避小程序禁虚拟商品付款红线 |
| **无"下 App"引导** | 页面不得出现引导跳 App 的文案/按钮（拆端时 UI 禁令） |
| **版权口径** | 发音**零第三方依赖**（CDN 本地，已移除有道）；例句来自 Tatoeba（CC BY）、中文翻译自备，上传材料需说明 CC BY |
| **仓库可见性** | 建议 GitHub 转私有，保护词库与源码 |

---

## 5. 分阶段实施计划（含验收标准）

| 阶段 | 内容 | 验收标准 | 预估 |
|---|---|---|---|
| **P0 准备与合规** | 注册小程序号/AppID、企业主体、选"工具"类目、CDN 域名白名单、确认例句 CC BY 口径 | 开发工具能真机预览、白名单生效 | 0.5–1 周 |
| **P1 monorepo 重构** | 建 `packages/core` + `packages/app`；把 2.1 抽入 core；App 依赖 core；storage/audio 抽象层落地 | App 端功能回归通过、构建 APK 正常 | 1–1.5 周 |
| **P2 小程序骨架 + 核心链路** | Taro 脚手架；storage/audio/scroll 小程序实现；「首页/学习/词典/复习」 | 4 核心链路真机可用、发音/配图从 CDN 加载正常 | 1.5–2 周 |
| **P3 扩展能力** | 拼写/测验/易混/统计/成就/设置/单元；分包与学段懒加载 | 功能对齐 App；分包体积达标 | 1–1.5 周 |
| **P4 提审前检查** | 包体积达标、域名就绪、无引导/支付、真机全流程、提审材料 | 提交审核 | 0.5 周 |

> 全量约 **4.5–6.5 人·周**；MVP（4 核心链路）约 **2.5–3.5 人·周**。

---

## 6. 风险与决策点

| 风险/待定点 | 等级 | 应对 |
|---|---|---|
| 发音接口商用争议 | **已解除** | 已移除有道，CDN 100% 本地覆盖 |
| 例句版权（Tatoeba CC BY） | 低 | 材料注明 CC BY 及来源即可，无商用限制 |
| 「教育」类幕后资质 | 中 | 定死「工具-效率」类目 |
| 词库分包后加载策略 | 低 | 按学段分包 + 首次进入按需请求 |
| 双端行为一致性 | 中 | 单一 `core` 保证；P1 用测试覆盖核心状态机（SRS/错词体） |
| 个人 vs 企业主体 | 中 | 学习工具建议企业主体；个人主体类目受限 |
| 包体积超标 | 中 | P2 起持续 `分包` + CDN，每阶段验主包体积 |
| 仓库公开与否 | 低 | 后台转私有 |

---

## 7. 需要你拍板的决策点

1. **范围**：MVP（4 核心链路先上线）还是全量对齐 App？
2. **抽象层改动范围**：P1 是否允许对 App 端 `src/hooks` 做「面向接口」的小重构（一把到位，后续省事）？
3. **Taro 选型**：确认用 Taro 3（React 语法，与现有技术栈最贴近）。
4. **词库分包粒度**：按学段拆 3 个子包（推荐）还是更细。

## 8. 建议的下一步

1. 确认上述决策点 → 更新本方案为定稿。
2. 启动 **P1**：在 `feature/weapp` 分支建 `packages/` 目录、抽 `core`、现有 `src/` 迁入 `packages/app`，App 端回归。
3. P0 账号/域名/类目/版权确认可与 P1 并行。