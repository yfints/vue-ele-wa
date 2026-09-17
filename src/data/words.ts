/**
 * 单词库的视觉资源。
 * 列表和详情数据都来自接口（`/course/categories?kind=4` + `/courses?categoryId=` + `/word-sets/*`），
 * 这里只保留接口没下发的设计稿资源：封面渐变色与封面插画。
 */

/** 封面顶部渐变色，按卡片下标循环使用 */
export const wordTones = [
  "#E2E3FE",
  "#FEE2F0",
  "#FAE1D0",
  "#CEE5FF",
  "#FAE9C2",
  "#CAF1D3",
  "#FFCECE",
  "#DAECFF",
];

/** 封面插画（/clone-assets/words/icon-01.png … icon-12.png） */
export const wordIconCount = 12;

export function wordTone(index: number) {
  return wordTones[index % wordTones.length];
}

export function wordIcon(index: number) {
  return `/clone-assets/words/icon-${String((index % wordIconCount) + 1).padStart(2, "0")}.png`;
}
