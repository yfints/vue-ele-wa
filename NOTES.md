# Englishgo课程广场 · 克隆笔记

## 源信息
- 原站 URL: https://www.waxueshe.com/courseMall/index
- 课程详情: https://www.waxueshe.com/courseMall/1653 （课 id=1653「零基础日常口语表达900句」）
- 源码仓库: 未找到公开仓库（GitHub 检索无Englishgo前端源码）
- 原作者: Englishgo / waxueshe.com
- 许可证: 专有（未声明开源许可，默认保留所有权利）
- 致谢要求: 仅本地学习复刻；未经许可不得公开重新部署或商用

## 技术栈
- 原站: Vue 3 + Vite + Element Plus + Vant 图标，构建版本 `v0.0.141`
- 克隆: React 19 + Vite 7 + React Router 7（保留仓库原有工程，不用 Vue）
- Node: 当前环境 Vite 7 / TypeScript 5.9
- 数据: `RECON/network/fixtures` 里的课程广场 / 分类 API，落到 `src/data/*.json`

## 复刻前预判
- 复杂度等级: L3（内容 SPA 展示层）+ L6（登录 / 练习 / 支付等业务边界）
- 推荐模式: 忠实复刻课程广场前端
- 可高保真的部分: 侧栏、顶栏、分类条、课程卡片网格、封面/头像/色值/rem 布局、搜索与分类筛选
- 需要近似或替代的部分: 顶栏汉堡图标（原站内联 PNG，已落地 `public/clone-assets/menu.png`）；课时卡点击不进入原站练习引擎
- 不克隆的部分: 登录、支付、学习卡、练习游戏、真实后端 API、侧栏除课程广场外的业务页；课时详情仅收录 1653 的 `lesson_details` fixture
- 主要风险: 品牌与课程封面版权；API 只抓到第一页 50 门（total 252）；像素级 diff 受字体栅格和原站无语义 DOM 影响

## 跑起来
```bash
npm install
npm run dev
```
打开 http://localhost:5173/courseMall/index
课程详情：http://localhost:5173/courseMall/1653

生产构建：
```bash
npm run build
npm run preview
```

## 改了什么（对照原版）
- 未嵌入 Google Analytics / 像素脚本（原站课程广场页也未在侦察里抓到 gtag）
- 用 React 重建 Vue 页面结构，class 名与 rem 值从原站 CSS 抽出（`assets/css/www.waxueshe.com/`）
- API 改为本地 JSON，不再请求 `www.waxueshe.com` / `res.waxueshe.com` 运行时接口
- 封面、头像、Logo、侧栏图标、vant-icon / puhui2 字体自托管在 `public/`
- 课程卡片点击进入 `/courseMall/:id`；1653 按原站课时网格展示，练习引擎不接入
- 侧栏非课程广场项仅作视觉占位，无对应业务路由

## 原站 vs 克隆站
| 模块 | 原站表现 | 克隆实现 | 差异 / 取舍 | 证据 |
|---|---|---|---|---|
| 首屏 | 侧栏 + 顶栏 + 分类 + 6 列卡片（1440） | 同布局、同梯度激活色、同封面 | 顶栏「微信群」原 1440 截图未见，已去掉 | `RECON/screenshots/original-1440.png` vs `clone-1440.png` |
| 导航 | Vue 侧栏，课程广场渐变高亮 | 同文案/图标/高亮；汉堡可折叠侧栏 | 其它菜单不跳转业务页 | `src/components/Sidebar.tsx` |
| 核心动效 | 卡片 hover 渐变 + 封面 scale 1.1；分类 hover 渐变 | 照抄原站 scoped CSS | 无 Lenis / scroll-snap（原站 `htmlScrollBehavior: auto`） | `src/clone.css` `.mallCard:hover` |
| 内容区块 | `/api/v2/lesson_mall` 第一页 50 门 | 同批 fixtures | total=252，未做翻页无限加载 | `src/data/lesson-mall.json` |
| 课程详情 1653 | 头部横幅 + 4 列课时卡（lg≥1200） | 同 class/rem/封面/15 课单元 | 点击课时不进入练习游戏（L6） | `src/pages/CourseDetailPage.tsx`、`src/data/lesson-details-1653.json` |
| 移动端 | ≤575 侧栏滑出，分类横滑 | 同断点；390 截图已采 | 未接原站 App 下载/登录弹层 | `RECON/screenshots/clone-390.png` |

## 复刻评分
- 源证据: 4/5（运行时侦察 + 真 CSS + API fixtures；无 GitHub 源码）
- 结构保真: 4/5（信息架构与网格断点对齐；原站 recon 把 Vue 自定义节点计成 0 button，自动分不可信）
- 视觉保真: 3/5（人工对照布局/色/图接近；`visual-diff` 像素分 2/5、差异率 17%，含字体栅格与截图高度裁切）
- 动效/交互: 4/5（hover、筛选、搜索、侧栏折叠已做；无登录弹窗）
- 响应式: 4/5（1440 / 768 / 390 均已截图，console 0 error）
- 功能完整: 2/5（展示与本地筛选可用；练习/登录/支付不克隆）
- 内容替换: 1/5（忠实复刻，品牌与课程内容均为原站）
- 法务/部署风险: 2/5（专有品牌与用户课程封面，仅限本地学习）
- 总评: 课程广场展示层可本地高保真预览；不能当原站业务系统，也不能直接上线。

## 替换地图（要换什么改哪）
- 文字 → `index.html` 标题/描述；`src/components/Sidebar.tsx` 菜单；`src/pages/CourseMallPage.tsx` 分类与「想要更多课程？」
- 图片/媒体 → `public/clone-assets/`（logo、ico、covers、icons）
- 配色 → `src/clone.css` `:root`（`--el-color-primary: #4162ff`、`--bg-container: #f9fafb` 等）
- 字体 → `public/fonts/fonts.css`（vant-icon、puhui2）；正文栈与原站一致为 Inter 系统栈（原站未加载 Inter webfont）
- 课程数据 → `src/data/lesson-mall.json`、`lesson-categories.json`、`lesson-details-1653.json`、`asset-map.json`
- 详情横幅/装饰图 → `public/clone-assets/detail-banner.png`、`detail-deco.png`

## 部署前须替换清单（版权）
- 品牌名「Englishgo」、Logo、favicon、吉祥物头像
- 全部课程封面与用户头像（`public/clone-assets/covers/`）
- 侧栏功能图标
- 飞书表单外链 `https://hcn2xg5ch01u.feishu.cn/share/base/form/shrcnxt6O7BuVRjxTvMYoOJHyEh`

## 验证
- [x] 本地跑通、console 0 error（`RECON/clone-summary.md`）
- [x] 截图对照原站（`RECON/screenshots/` original / clone / visual-diff）
- [ ] `route-crawl.mjs`（本页为单路由展示，未做全站爬取）
- [ ] `interaction-probe.mjs`（已用浏览器手工点分类、搜索、进详情）
- [x] `visual-diff.mjs`（`RECON/visual-diff-1440.json`，visualScore 2）
- [x] `audit-clone.mjs --recon --strict`（保真硬门槛通过；品牌残留是忠实复刻预期）
- 验证不了的点: 原站登录后的「已拥有/收藏」、练习游戏、支付；无限滚动后续页课程；合成 PointerEvent 未测拖拽（本页无 canvas 拖拽）
