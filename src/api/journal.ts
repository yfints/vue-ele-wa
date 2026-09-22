import { get, post } from "./http";

/**
 * 学习手帐（笔记簿）
 * - `GET  /journal/strange`  不熟悉
 * - `GET  /journal/mastered` 已掌握（累计答对达到阈值后自动迁入）
 * - `POST /journal/strange`  标记不熟悉
 * - `POST /journal/mastered` 标记已掌握
 * - `POST /journal/remove`   批量移除（列表页「全部清除」）
 */

export type JournalState = "strange" | "mastered";

/** 内容类型（接口口径）：1=单词 2=短句 */
export const JOURNAL_ITEM_TYPE = { WORD: 1, SENTENCE: 2 } as const;

/** 移除时传的目标状态：1=错题 2=不熟悉 3=已掌握 */
export function journalTypeOf(state: JournalState) {
  return state === "mastered" ? 3 : 2;
}

export interface JournalItem {
  /** 内容项 ID（lesson_item.id） */
  itemId: number | string;
  /** 1=单词 2=短句 */
  itemType: number;
  /** 内容：单词=目标词，短句=完整句 */
  content: string;
  /** 中文：单词=释义，短句=中文翻译 */
  contentCn: string;
  phonetic: string;
  partOfSpeech: string;
  courseId?: number | string | null;
  courseName: string;
  lessonId?: number | string | null;
  lessonName: string;
  errorNum: number;
  practiceNum: number;
  lastTime: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function textOf(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function normalizeJournalItem(row: unknown): JournalItem | null {
  const raw = asRecord(row);
  if (!raw) return null;
  const itemId = raw.itemId ?? raw.id ?? raw.item_id;
  if (itemId == null || itemId === "") return null;
  return {
    itemId: itemId as number | string,
    itemType: Number(raw.itemType ?? raw.item_type ?? 0) || 0,
    content: textOf(raw.content),
    contentCn: textOf(raw.contentCn ?? raw.content_cn),
    phonetic: textOf(raw.phonetic),
    partOfSpeech: textOf(raw.partOfSpeech ?? raw.part_of_speech),
    courseId: (raw.courseId ?? raw.course_id ?? null) as number | string | null,
    courseName: textOf(raw.courseName ?? raw.course_name),
    lessonId: (raw.lessonId ?? raw.lesson_id ?? null) as number | string | null,
    lessonName: textOf(raw.lessonName ?? raw.lesson_name),
    errorNum: Number(raw.errorNum ?? raw.error_num ?? 0) || 0,
    practiceNum: Number(raw.practiceNum ?? raw.practice_num ?? 0) || 0,
    lastTime: textOf(raw.lastTime ?? raw.last_time),
  };
}

/** 分页结构兼容：records / data / list / rows，或者直接返回数组 */
export function unwrapJournalPage(data: unknown): { items: JournalItem[]; total?: number } {
  const obj = asRecord(data);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(obj?.records)
      ? obj?.records
      : Array.isArray(obj?.data)
        ? obj?.data
        : Array.isArray(obj?.list)
          ? obj?.list
          : Array.isArray(obj?.rows)
            ? obj?.rows
            : [];
  const items = list.map(normalizeJournalItem).filter((item): item is JournalItem => Boolean(item));
  const total = obj?.total ?? obj?.count;
  return { items, total: total == null ? undefined : Number(total) };
}

export function fetchJournalList(params: {
  state: JournalState;
  /** 1=单词 2=短句，不传=两种都返回 */
  itemType?: number;
  keyword?: string;
  /** 1=最近命中优先（默认） 2=错误次数倒序 */
  sortType?: number;
  page?: number;
  limit?: number;
}) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 50;
  return get(
    `/journal/${params.state}`,
    {
      page,
      limit,
      current: page,
      size: limit,
      itemType: params.itemType ?? 0,
      keyword: params.keyword || "",
      sortType: params.sortType ?? 1,
    },
    { skipAuthRedirect: true },
  );
}

/** 标记不熟悉（会从错题本/已掌握移出） */
export function markJournalStrange(itemId: string | number) {
  return post("/journal/strange", { itemId }, { skipAuthRedirect: true });
}

/** 标记已掌握 */
export function markJournalMastered(itemId: string | number) {
  return post("/journal/mastered", { itemId }, { skipAuthRedirect: true });
}

/** 批量移除（journalType：1=错题 2=不熟悉 3=已掌握） */
export function removeJournalItems(journalType: number, itemIds: (string | number)[]) {
  return post("/journal/remove", { journalType, itemIds }, { skipAuthRedirect: true });
}
