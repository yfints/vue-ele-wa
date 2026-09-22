import { ref } from "vue";

/**
 * 侧边栏「一级栏目」的归属。
 *
 * 详情页（课程详情 / 单词集详情 / 教材详情 / 音标详情）在侧边栏里没有自己的入口，
 * 直接按路径高亮会出现「从我的收藏点进课程详情，左边却跳到课程广场」这种串台。
 * 所以：进入一级页面时记下当前栏目，进详情页时沿用记下的那个栏目。
 *
 * 只在内存里记 —— 直接输网址或刷新详情页时没有来源，就按详情页自己的归属兜底。
 */
export const navSection = ref("");

/** 详情页路径（这些页面沿用进入前的栏目） */
const DETAIL_PATTERNS = [
  /^\/courseMall\/(?!index$)[^/]+$/,
  /^\/words\/(?!index$)[^/]+$/,
  /^\/textbook\/(?!index$)[^/]+$/,
  /^\/phonetic\/(?!index$)[^/]+$/,
];

export function isDetailPath(path: string) {
  return DETAIL_PATTERNS.some((pattern) => pattern.test(path));
}

/** 路径 -> 一级栏目 key（一个栏目可能对应多条路由，例如我的收藏有句子/单词库两个页签） */
export function navSectionKey(path: string) {
  if (path.startsWith("/home")) return "home";
  if (path.startsWith("/courseMall") || path.startsWith("/courses")) return "courseMall";
  if (path.startsWith("/myCourse")) return "myCourse";
  if (path.startsWith("/textbook")) return "textbook";
  if (path.startsWith("/phonetic")) return "phonetic";
  if (path.startsWith("/words")) return "words";
  if (path.startsWith("/studyPlan")) return "studyPlan";
  if (path.startsWith("/journal")) return "journal";
  if (path.startsWith("/vip")) return "vip";
  return "";
}

/** 路由变化时记录栏目：一级页面才更新，详情页保持来源 */
export function rememberNavSection(path: string) {
  if (isDetailPath(path)) return;
  const key = navSectionKey(path);
  if (key) navSection.value = key;
}
