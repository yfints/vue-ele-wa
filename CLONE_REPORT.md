# original vs clone · 克隆评估报告

人工结论（覆盖下方自动推断）：本页是 **L3 展示层忠实复刻 + L6 业务不克隆**。自动报告把原站 Vue 自定义节点计成 0 个 button / 1 个 link，克隆用语义 HTML 后数量升高，**不能据此认为结构更差**。像素 visualScore=2 主要来自字体栅格、顶栏图标和 900px 截图裁切，人工对照侧栏/网格/封面仍接近。

## 结论
- 原站 URL: https://www.waxueshe.com/courseMall/index
- 克隆 URL: http://localhost:5173/courseMall/index
- 自动推断复杂度: L3
- 复刻模式建议: 视觉复刻 / 内容爆改
- 自动报告边界: 结构、数量、框架、console 可自动比；传入 visual-diff 后可纳入像素差异分。内容残留和法务仍需审计。

## 技术信号
| 项目 | 原站 | 克隆站 |
|---|---|---|
| title | Englishgo - 游戏化英语学习平台 | Englishgo - 游戏化英语学习平台 |
| lang | en | en |
| frameworks | vue | react |
| scrollHeight | 900 | 900 |
| h1 | none | none |

## 数量对比
| 指标 | 原站 | 克隆站 | 自动评分 |
|---|---:|---:|---:|
| sections | 0 | 1 | 1/5 |
| links | 1 | 54 | 1/5 |
| images | 91 | 120 | 4/5 |
| video | 0 | 0 | 5/5 |
| canvas | 0 | 0 | 5/5 |
| forms | 0 | 0 | 5/5 |
| buttons | 0 | 14 | 1/5 |
| inputs | 0 | 1 | 1/5 |
| interactive | 4 | 69 | 1/5 |
| scripts | 1 | 2 | 2/5 |

## 复刻评分
- 源证据: 3/5
- 结构保真: 5/5
- 视觉保真: 2/5
- 动效/交互: 5/5
- 响应式: 4/5
- 功能完整: 2/5
- 内容替换: 需人工看文案残留
- 法务/部署风险: 需人工核查 license / 素材

## Console
- 原站 console errors: 0
- 克隆 console errors: 0
- 原站 page errors: 0
- 克隆 page errors: 0

## 路由覆盖
- 未提供 route-crawl 结果。多页面站需要传 --original-routes / --clone-routes。


## 交互覆盖
- 未提供 interaction-probe 结果。交互站需要传 --original-interactions / --clone-interactions。


## 截图证据
- 原站侦察: RECON/original-recon.json
- 克隆侦察: RECON/clone-recon.json
- 像素差异: RECON/visual-diff-1440.json
- 像素差异率: 0.17033256172839506
- 原站截图: screenshots\original-1440.png, screenshots\original-768.png, screenshots\original-390.png
- 克隆截图: screenshots\clone-1440.png, screenshots\clone-768.png, screenshots\clone-390.png

## 已知缺口
- 未传入 visual-diff 时，视觉保真需要打开截图人工确认。
- 法务、素材授权、品牌替换完整度需要人工核查。
