/**
 * 教材学习（教材练习）列表数据。
 * 目前后端还没有教材相关接口，先用设计稿里的数据占位，
 * 后续接口就绪后只要替换 `textbookList` 的数据来源即可。
 */

export interface TextbookItem {
  id: number;
  /** 卡片标题，例如「人教版・三年级上册」 */
  title: string;
  /** 一句话简介 */
  desc: string;
  /** 年级标签 */
  grade: string;
  /** 版本标签 */
  edition: string;
  /** 单元数 */
  units: number;
  /** 封面图（设计稿裁切） */
  cover: string;
}

export const textbookGrades = [
  "全部",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "高一",
  "高二",
  "高三",
];

export const textbookEditions = [
  "全部版本",
  "人教版",
  "外研版",
  "北师大版",
  "苏教版",
  "沪教版",
  "冀教版",
];

/** 版本标签配色，取自设计稿 */
export const editionTone: Record<string, { bg: string; color: string }> = {
  人教版: { bg: "#DAFCFF", color: "#0382A9" },
  外研版: { bg: "#DCFFDA", color: "#038C23" },
  北师大版: { bg: "#FFE9E9", color: "#8C0303" },
  苏教版: { bg: "#F6E9FF", color: "#17038C" },
  沪教版: { bg: "#FFF4E9", color: "#784E00" },
  冀教版: { bg: "#DAFFF7", color: "#279689" },
};

export const gradeTone = { bg: "#DAECFF", color: "#0056B5" };

const INTEREST_DESC = "从兴趣出发，打好英语启蒙基础。";
const CONTEXT_DESC = "在情境中学习，培养英语表达能力。";

export const textbookList: TextbookItem[] = [
  {
    id: 1,
    title: "人教版・三年级上册",
    desc: INTEREST_DESC,
    grade: "三年级",
    edition: "人教版",
    units: 8,
    cover: "/clone-assets/textbook/cover-01.png",
  },
  {
    id: 2,
    title: "外研版・三年级上册",
    desc: CONTEXT_DESC,
    grade: "三年级",
    edition: "外研版",
    units: 8,
    cover: "/clone-assets/textbook/cover-02.png",
  },
  {
    id: 3,
    title: "北师大版・三年级上册",
    desc: CONTEXT_DESC,
    grade: "三年级",
    edition: "北师大版",
    units: 8,
    cover: "/clone-assets/textbook/cover-03.png",
  },
  {
    id: 4,
    title: "苏教版・三年级上册",
    desc: CONTEXT_DESC,
    grade: "三年级",
    edition: "苏教版",
    units: 8,
    cover: "/clone-assets/textbook/cover-04.png",
  },
  {
    id: 5,
    title: "沪教版・三年级上册",
    desc: CONTEXT_DESC,
    grade: "三年级",
    edition: "沪教版",
    units: 8,
    cover: "/clone-assets/textbook/cover-05.png",
  },
  {
    id: 6,
    title: "冀教版・三年级上册",
    desc: INTEREST_DESC,
    grade: "三年级",
    edition: "冀教版",
    units: 8,
    cover: "/clone-assets/textbook/cover-06.png",
  },
  {
    id: 7,
    title: "外研版・二年级上册",
    desc: CONTEXT_DESC,
    grade: "二年级",
    edition: "外研版",
    units: 8,
    cover: "/clone-assets/textbook/cover-07.png",
  },
  {
    id: 8,
    title: "外研版・一年级上册",
    desc: CONTEXT_DESC,
    grade: "一年级",
    edition: "外研版",
    units: 8,
    cover: "/clone-assets/textbook/cover-08.png",
  },
  {
    id: 9,
    title: "苏教版・四年级上册",
    desc: CONTEXT_DESC,
    grade: "四年级",
    edition: "苏教版",
    units: 8,
    cover: "/clone-assets/textbook/cover-09.png",
  },
  {
    id: 10,
    title: "沪教版・三年级上册",
    desc: CONTEXT_DESC,
    grade: "三年级",
    edition: "沪教版",
    units: 8,
    cover: "/clone-assets/textbook/cover-10.png",
  },
];
