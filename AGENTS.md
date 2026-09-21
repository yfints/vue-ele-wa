# 项目约定（Codex 与 Cursor 共用）

> 与 `.cursor/rules/element-plus.mdc` 保持一致；Codex 会话会自动读这份 `AGENTS.md`，
> 改规则时两边一起改。

## UI 与交互约定

后续开发优先用 **Element Plus** 组件完成页面，不要再手写一套按钮、输入框、弹窗、表格、分页、表单、Tag、Breadcrumb、Message、Dialog。

- 布局/表单：`el-button`、`el-input`、`el-form`、`el-select`、`el-dialog`、`el-drawer`、`el-table`、`el-pagination`、`el-tabs`、`el-tag`、`el-breadcrumb`、`el-message` / `ElMessage`
- 图标：`@element-plus/icons-vue` + `el-icon`
- 夜间模式：保持 `html.dark`，沿用 Element Plus 暗色变量，不要另起一套主题 class
- 只有 Element Plus 没有对应能力时，才用 Tailwind 补间距/布局；不要用 Tailwind 重做已有 EP 组件样式

## 路由与请求

- 站内跳转只用 Vue Router（`RouterLink` / `router.push`），不要 `window.location`
- 接口调用走 `@/api` 的 `get` / `post` / `put` / `patch` / `del`，换地址只改 `.env` 的 `VITE_API_BASE_URL`

```vue
<!-- ✅ -->
<el-button type="primary" @click="router.push('/courseMall/index')">返回</el-button>
<el-input v-model="keyword" placeholder="搜索" clearable />

<!-- ❌ 不要为常见控件再写自定义 div/button/input -->
```

## 例外（历史代码）

按蓝湖设计稿 1:1 复刻的页面里，为了像素级还原设计稿，有一部分仍是自建元素 + `clone.css` 定制的
（例如 `src/components/practice/*`、`src/components/CancelAccountDialog.vue`、
`src/components/ChangePasswordDialog.vue`、`src/components/ForgotPasswordDialog.vue`、
`src/components/practice` 之类）。新增/改动的部分按上面的约定走 Element Plus；
要统一迁移这些老组件，单独开一次任务处理（迁移时必须保持设计稿尺寸不变）。
