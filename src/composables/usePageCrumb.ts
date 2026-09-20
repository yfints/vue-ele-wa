import { ref } from "vue";

/**
 * 顶部面包屑的最后一段。
 * 默认取路由 meta.title（比如「课程详情」），详情页加载完数据后可以换成具体名字
 * （设计稿里是「课程广场 › 零基础入门：26个字母与发音」）。离开页面记得清空。
 */
export const pageCrumb = ref("");

export function setPageCrumb(label?: string) {
  pageCrumb.value = label ? String(label) : "";
}
