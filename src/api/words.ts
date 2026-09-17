import { get } from "./http";

/** 单词集详情：课程绑定了「单词集分类」（kind=4）时才算单词集 */
export interface WordSetDetail {
  id: number | string;
  name?: string;
  cover?: string | null;
  description?: string | null;
  categoryId?: number | string;
  categoryName?: string;
  /** 1=免费 2=会员 */
  courseType?: number;
  /** 单词集全部课时下的单词条数 */
  wordCount?: number;
  /** 我已学单词数（未加入为 0） */
  learnedNum?: number;
  /** 是否已加入我的单词学习计划 */
  joined?: boolean;
  userWordId?: number | string | null;
}

/** 单词集里的一个单词（只含展示字段） */
export interface WordItem {
  id: number | string;
  word: string;
  phonetic?: string;
  /** 词性，形如 n. / v. / adj. */
  partOfSpeech?: string;
  meaning?: string;
  audio?: string | null;
  image?: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

/** 分页结构兼容：records / list / rows，或者直接返回数组 */
export function unwrapWordPage(data: unknown): { records: WordItem[]; total?: number } {
  const obj = asRecord(data);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(obj?.records)
      ? obj.records
      : Array.isArray(obj?.list)
        ? obj.list
        : Array.isArray(obj?.rows)
          ? obj.rows
          : [];
  const total = Number(obj?.total ?? obj?.count);
  return {
    records: list as WordItem[],
    total: Number.isFinite(total) ? total : undefined,
  };
}

/** 单词集详情，非单词集或未上线后端返回 400 */
export function fetchWordSetDetail(id: string | number) {
  return get<WordSetDetail>(`/word-sets/${id}`, undefined, { skipAuthRedirect: true });
}

/** 单词集里的单词分页，跨该单词集全部课时按题序返回 */
export function fetchWordSetWords(
  id: string | number,
  params?: { page?: number; limit?: number },
) {
  return get<{ records?: WordItem[]; total?: number | string; current?: number | string; size?: number | string }>(
    `/word-sets/${id}/words`,
    { page: params?.page ?? 1, limit: params?.limit ?? 10 },
    { skipAuthRedirect: true },
  );
}
