# 🎓 K12 Vocab Master (K12 全学段单词大师)

> **v1.8.0 — 离线单词发音 + 错词本体验优化**  
> 一款面向 K12 全学段（小学/初中/高中）的极简英语单词记忆应用。  
> 三学段完整词库（小学420+ / 初中1600 / 高考3817）；  
> 纯前端、零后端、零 AI、零拼写负担；  
> SM2 间隔重复 + 错词本（词义/拼写双维度）+ 单元闯关 + 勋章激励 + 数据周报 + 备份导入。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4.svg)
![Tests](https://img.shields.io/badge/tests-77%20passed-brightgreen.svg)
![Stages](https://img.shields.io/badge/K12-3%20stages-blueviolet.svg)

## ✨ v1.7 核心特性

### 🎯 全学段适配（小学 / 初中 / 高中）
- 顶部一键切换学段，词库/进度/错词本/打卡完全独立
- 小学（课标 420+ 词）→ 初中（中考考纲 100 词种子）→ 高中（高考 3817 词）
- 学段间数据零污染，重置只影响当前学段

### 🧠 SM2 间隔重复（轻量自研，二档反馈）
- 反馈简化为认识 / 不认识二档：减少学生"模糊 vs 不认识"的决策疲劳
- 认识 → 推进 SM2 进度；不认识 → 重置进度并扣 EF（-0.25）
- 首页「立即学习」自动合并到期词 + 新词，每批 15 张
- EF 系数下限 1.3、上限 3.0，永久纯前端运行

### 📓 错词本（词义 / 拼写双维度）
- **词义维度**（默认）：卡片复习答错自动收录，连续答对达标 → 毕业出本
- **拼写维度**（独立 SRS）：拼写训练答错时**不连累**词义 SM2 进度
- 顶部 Tab 一键切换"错词本 / 已攻克"，默认错词本
- 薄弱优先排序：综合分 = 错次×2 + 近 7/30 天复习权重 + 拼写待练权重
- 进度可视化：点式进度环 + "再答对 N 次出本"副文案，目标一目了然
- 首页联动：错词本卡片展示"N 个该巩固了 · 共 M 个"
- 已攻克沉淀：每攻克一词自动归档，按学段累计 N 个，永久可见

### 🗺️ 单元闯关系统
- 每学段按 50 词/单元切分（如高中分 70+ 单元）
- 完成当前单元 80% 自动解锁下一关
- 锁定→进行→通关 三态可视化

### 🏆 7 类成就勋章
- 入门萌新 / 词汇进阶 (100/500 词) / 全词掌握 / 90% 正确率 / 连续打卡 7/30 天
- 全部基于当前数据自动检测，零人工授予

### 📝 测验双模式
- **日常模式**：20 题四选一 + 评分等级评语
- **冲刺模式**：限时 60s，看能答对几题

### 🖼️ 单词配图
- 学习卡片 / 词典列表 / 错词本集成约 900 张词库 webp 小图（均 ≤ 20kB）
- 懒加载、失败回落、无图时自动隐藏；点击放大查看

### 🔥 趣味辅助（不跑偏）
- 单词助记（词根/谐音/场景联想）
- 易混词自动配对（按 `confusionGroupId` + 编辑距离自动形近），支持字符级差异高亮，并提供多维筛选（难度区间 / 差异字符数 / 上次复习间隔）
- 周报评语（按 streak + accuracy 自动产出）

### 🔮 专注模式
- 顶栏 toggle → 隐藏侧边栏 / 隐藏装饰 / 仅留学习卡
- 设备感知默认：手机端默认开启沉浸式学习
- 切换持久化到 LocalStorage

### 📦 数据备份
- 一键导出全学段数据为 JSON
- 导入恢复换设备无缝衔接
- 安卓端落盘到公共 Download 目录，重装/换机不丢数据
- 设置 → 数据备份 入口

---

## ✨ v1.0 仍保留的特性

### 📚 完整词库
- 收录 K12 三学段词库（小学420+ / 初中100 / 高考3817），每个词包含：音标、中文释义、助记（部分）、易混词组 ID
- 双向搜索（英文 / 中文）

### 📖 全能词典
- 英文/中文模糊搜索
- 无限滚动加载
- 列表内一键标记掌握

### 📱 多设备响应式
- 手机端底部固定导航栏
- iPad 端可折叠侧边栏
- 桌面端宽屏固定侧边栏

### 💾 数据持久化
- 自动保存到 LocalStorage
- 多标签页同步
- 一键重置本学段

---

## 🧠 核心设计原则

> 这是一款**给高中生用**的 App，严格遵守以下不可妥协的约束：

1. **无拼写负担** — 原生不引入拼写/默写/手写/输入模式，只做「互译卡片 + 四选一」
2. **零沉迷诱导** — 没有金币、段位、社交排行、闯关剧情
3. **纯前端部署** — LocalStorage 存储，无需数据库/服务器
4. **轻量化** — 不堆砌 AI、复杂特效；启动快、运行流畅
5. **零学习摩擦** — 二档反馈（认识/不认识）够用，不引入五档评分

---

## 🛠️ 技术栈 (Tech Stack)

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 18.3.1 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.7.3 | 类型安全 |
| [Vite](https://vitejs.dev/) | 6.0.11 | 构建工具 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | 样式框架 |
| [Vitest](https://vitest.dev/) | 3.0.4 | 单元测试 |
| [ESLint](https://eslint.org/) | 9.19.0 | 代码检查 |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | 0.21.1 | PWA 离线 |
| [@capacitor/android](https://capacitorjs.com/) | 8.1.0 | Android 打包 |

### 项目结构（v2.0 后）

```
src/
├── data/                       # 三学段词库
│   ├── primary.ts              # 小学 50 词种子
│   ├── junior.ts               # 初中 100 词种子
│   └── senior.ts               # 高中 3817 词（复用 data_chunk1/2/3）
├── utils/                      # 纯函数工具集
│   ├── parser.ts               # 词汇解析
│   ├── array.ts                # 数组工具
│   ├── quiz.ts                 # 测验生成
│   ├── sm2.ts                  # SM2 算法
│   ├── units.ts                # 闯关单元
│   ├── streak.ts               # 打卡与连续
│   ├── achievements.ts         # 成就检测
│   ├── confusion.ts            # 易混词配对
│   ├── weekly.ts               # 周报摘要
│   ├── backup.ts               # 数据备份
│   └── index.ts                # barrel
├── hooks/
│   ├── useLocalStorage.ts      # 修复了 key 变化监听
│   ├── useStage.ts             # 学段切换 + 数据隔离 + 全部业务状态
│   ├── useDebounce.ts
│   └── useVirtualList.ts
├── components/
│   ├── Dashboard/              # 首页仪表盘
│   ├── StudyMode/              # 学习模式（二档反馈）
│   ├── QuizMode/               # 测验 + QuizEntry（双模式选择）
│   ├── SpellingMode/           # 拼写训练（错词点选式）
│   ├── WordImage/              # 单词配图组件（懒加载/失败回落）
│   ├── BatchCompleteView.tsx   # 学习批次完成页
│   ├── WordList/               # 词典 + MistakesView（错词本 Tab）
│   ├── WordList/GraduatedSection.tsx # 已攻克词条展示
│   ├── UnitsView.tsx           # 闯关单元网格
│   ├── AchievementsView.tsx    # 勋章墙
│   ├── StatsView.tsx           # 数据周报
│   ├── ConfusionView.tsx       # 易混词对比
│   ├── SettingsView.tsx        # 备份/导入/导出
│   ├── StageSwitcher.tsx       # 学段下拉切换
│   ├── ErrorBoundary.tsx
│   └── Icons.tsx
├── types.ts                    # 全局类型（Stage / SrsState / BackupBundle / ...）
├── data.ts                     # 词库聚合 barrel（含 WORDS_BY_STAGE / STAGE_META）
├── App.tsx                     # 主应用 + 路由 + 全局绑定
└── test-setup.ts
```

---

## 🚀 快速开始

环境要求：
- Node.js >= 18.0.0
- npm >= 9.0.0

```bash
npm install
npm run dev          # 启动 http://localhost:5173
npm run build        # 生产构建
npm run typecheck    # tsc --noEmit
npm test             # 单元测试
npm run test:coverage
npm run lint
```

---

## 🧪 测试

```bash
npm test
```

v2.0 测试覆盖（**65 个测试用例 / 9 个测试文件**）：
- ✅ SM2 算法 (`sm2.test.ts`) — 15 例
- ✅ 闯关单元 (`units.test.ts`) — 7 例
- ✅ 成就检测 (`achievements.test.ts`) — 9 例
- ✅ 打卡与连续 (`streak.test.ts`) — 8 例
- ✅ 周报摘要 (`weekly.test.ts`) — 5 例
- ✅ 易混词配对 (`confusion.test.ts`) — 5 例
- ✅ 数据备份 (`backup.test.ts`) — 4 例
- ✅ 词库多学段 (`stages.test.ts`) — 6 例
- ✅ 学段隔离 Hook (`useStage.test.ts`) — 6 例

---

## 🗂️ 数据模型（v2.0 扩展字段）

```ts
interface Word {
  id: string;
  english: string;
  phonetic: string;
  chinese: string;
  stage?: 'primary' | 'junior' | 'senior';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  mnemonic?: string;            // 词根/谐音/联想
  exampleSentence?: string;    // 校园化例句
  confusionGroupId?: string;    // 易混词配对
}
```

数据字段均为可选，老词库无字段时优雅降级。

---

## �️ 数据存储

所有学习数据按学段隔离：

```
vocab-senior-learned / -srs / -mistakes
vocab-junior-learned / -srs / -mistakes
vocab-primary-learned / -srs / -mistakes
vocab-current-stage
vocab-study-days
vocab-focus-mode
```

---

## 📱 Android PWA 打包

项目已集成 `@capacitor/android`，可打包为 APK：

```bash
# 1. 构建 web 资源
npm run build

# 2. 同步到 android 工程（dist → android/app/src/main/assets/public，并刷新插件）
npx cap sync android

# 3. 用 Android Studio 打开 / 直连设备调试
npx cap open android        # 打开 Android Studio
# 或：
npx cap run android         # 直连真机/模拟器安装并启动

# 4. 直接产出 release APK（命令行）
cd android
.\gradlew assembleRelease   # 产物：android/app/build/outputs/apk/release/k12-release.apk
```

---

## 📝 更新日志

### v1.7.0 (2026-08-30) — 错词本双维度改造 + 学习模式二档反馈
- ✨ 错词本新增**拼写维度**独立 SRS：`SrsState.spelling` 子状态 + `submitSpelling`，拼写训练答错**不再连累词义 SM2 进度**
- ✨ 错词本顶部新增 Tab 切换「错词本 / 已攻克」，默认错词本；已攻克词条展示完整音标/释义/WordImage
- ✨ 错词本"已攻克沉淀"：每攻克一词自动归档，按学段累计 N 个，永久可见
- ✨ 错词本薄弱优先排序：综合分 = 错次×2 + 近 7/30 天复习权重 + 拼写待练权重
- ✨ 错词本进度可视化：点式 ProgressDots + "再答对 N 次出本"副文案
- ✨ 首页联动：Dashboard 错词本卡片展示"N 个该巩固了 · 共 M 个"
- ✨ 单词配图接入学习模式 / 词典 / 错词本视图，约 900 张词库 webp 小图
- ✨ 学习模式反馈收为**二档**（认识/不认识）：移除与 unknown 等价的"模糊"档，减少决策疲劳
- ✨ 学习批次内段内打散：到期词/新词各自分组随机，避免连续简单词或连续生词
- 🔧 Android `versionName` 1.6.0 → 1.7.0（`versionCode` 8 → 9）

### v1.6.0 (2026-08-29) — 易混词筛选增强 + 答题反馈可配置
- ✨ 易混词视图新增三组筛选维度：难度区间、差异字符数、上次复习间隔
- ✨ 易错词拼写训练改点选字母交互：字母小写、按音节分段提示、核对后手动进入下一题
- ✨ 专注模式改为设备感知默认：手机端默认开启沉浸式学习
- ✨ 页面切换滚动位置记忆
- ✨ 答题反馈时长可配置
- 🔧 Android `versionName` 1.5.0 → 1.6.0（`versionCode` 7 → 8）

### v1.5.0 (2026-08-29) — 数据备份升级
- ✨ 数据备份升级为全量快照并在安卓端落盘到公共 Download 目录，重装/换机不丢数据

### v1.4.0 (2026-08-29) — 学习追踪与仪表盘增强
- ✨ 新增"今日已复习"快照与视图
- ✨ Dashboard 显示今日巩固 + 今日新学激励

### v1.3.0 (2026-08-29) — 答题反馈时长配置 + Sprint 反馈期冻结
- ✨ 答题反馈时长可配置

### v2.0.1 (2026-08-29) — 易混词筛选增强
- ✨ 易混词视图新增三组筛选维度：难度区间（1-2★ / 2-3★ / 3-4★ / 4-5★）、差异字符数（1 / 2 / 3+ 处）、上次复习间隔（从未 / 本周 / 一月内 / 超过 30 天）
- ✨ 卡片头部新增"差异处数 / 难度 ★ / 复习状态"标签，复习状态按临近遗忘程度着色（绿→黄→红→灰）
- ✨ `ConfusionGroup` 扩展元信息字段：`diffCount` / `difficultyRange` / `daysSinceReview`，由 `groupConfusionPairs(words, { srsMap })` 计算
- 🗑️ 移除 v1.0 → v2.0 老格式数据迁移逻辑（`gaokao-learned` 自动迁入 senior 已废弃）
- 🔧 Android `versionName` 1.1.0 → 1.3.0（`versionCode` 2 → 4）

### v2.0.0 (2026-08-28) — 全量二次开发
- ✨ 三学段适配（小学/初中/高中），数据完全隔离
- ✨ SM2 间隔重复算法（三档反馈）
- ✨ 易错生词本 + 专项复习
- ✨ 单元闯关系统（80% 阈值解锁）
- ✨ 7 类成就勋章
- ✨ 数据周报 + 4 类进度可视化
- ✨ 测验双模式（日常/冲刺 60s）
- ✨ 易混词自动配对
- ✨ 单词助记 + 场景化例句
- ✨ 专注模式 toggle
- ✨ 数据备份/导入/导出
- 🐛 修复 `useLocalStorage` 不响应 key 变化的 bug（关键）

### v1.0.0 (2025-02-14) — 初始版本
- 高考 3817 词库
- 学习模式 + 测验 + 词典
- 响应式 PWA

---

## 🙏 致谢 / Acknowledgements

本项目基于以下开源版本二次开发：

| 项目 | 仓库地址 | 说明 |
|------|---------|------|
| 初版 gaokao-vocab (v1.0) | <https://github.com/Jimmy-xuzimo/gaokao-vocab> | 原作者：Jimmy Xu · MIT License · 高考 3817 词库起点 |

感谢原作者 **Jimmy Xu** 提供的高质量高考词库与初始工程结构。
本项目在保留其核心设计与数据结构的基础上，新增了 K12 全学段、SM2 算法、错词本双维度、单词配图等模块。

---

## 📄 许可证

MIT License © 2025-2026
