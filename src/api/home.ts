import { get, post } from "./http";

export interface NoticeItem {
  id?: number;
  title?: string;
  content?: string;
  name?: string;
}

export interface NoticeResult {
  list?: NoticeItem[];
}

export interface StudyNum {
  sentence_num?: number | string;
  word_num?: number | string;
}

export interface StudyCount {
  error_subject?: number | string;
  strange_word?: number | string;
  exercise_grasp?: number | string;
  error_word?: number | string;
  word_strange_word?: number | string;
  grasp_word?: number | string;
}

export interface HomeIndex {
  all_check_in?: number;
  today_is_check_in?: number | boolean;
  today_time?: number;
}

export interface HomeStats {
  current_streak?: number;
  max_streak?: number;
  total_check_in?: number;
  total_seconds?: number;
  today_seconds?: number;
  month_seconds?: number;
}

export interface DateHotItem {
  date: string;
  time?: number;
}

export interface RankUser {
  nickname?: string;
  avatar?: string;
  headimg?: string;
  head_img?: string;
  active_vips?: { vip_id?: number };
}

export interface RankItem {
  user?: RankUser;
  time?: number;
  duration?: number;
  study_time?: number;
  total_time?: string;
}

export interface RankList {
  sort?: RankItem[];
}

type RawPayload = Record<string, unknown>;

function pickValue(raw: RawPayload, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function pickNumber(raw: RawPayload, ...keys: string[]): number {
  const value = Number(pickValue(raw, ...keys));
  return Number.isFinite(value) ? value : 0;
}

function pickBoolean(raw: RawPayload, ...keys: string[]): boolean {
  const value = pickValue(raw, ...keys);
  return value === true || value === 1 || value === "1" || value === "true";
}

export function fetchNotices() {
  return get<NoticeResult>("/index/notice", { page: 1, limit: 5 });
}

/** /index/study_num 返回 sentenceNum / wordNum（驼峰），这里同时兼容下划线 */
export async function fetchStudyNum(type: number): Promise<StudyNum> {
  const raw = ((await get<RawPayload>("/index/study_num", { type })) || {}) as RawPayload;
  return {
    sentence_num: pickNumber(raw, "sentenceNum", "sentence_num"),
    word_num: pickNumber(raw, "wordNum", "word_num"),
  };
}

export function fetchStudyCount() {
  return get<StudyCount>("/index/count");
}

/** /index/index 返回 todayIsCheckIn / todayCheckInCount / todayTime（驼峰） */
export async function fetchHomeIndex(): Promise<HomeIndex> {
  const raw = ((await get<RawPayload>("/index/index")) || {}) as RawPayload;
  return {
    all_check_in: pickNumber(raw, "todayCheckInCount", "today_check_in_count", "allCheckIn"),
    today_is_check_in: pickBoolean(raw, "todayIsCheckIn", "today_is_check_in"),
    today_time: pickNumber(raw, "todayTime", "today_time"),
  };
}

/** /index/user_count 返回 totalSeconds / todaySeconds / monthSeconds（驼峰），对应首页「学习时长」 */
export async function fetchHomeStats(): Promise<HomeStats> {
  const raw = ((await get<RawPayload>("/index/user_count")) || {}) as RawPayload;
  return {
    current_streak: pickNumber(raw, "currentStreak", "current_streak"),
    max_streak: pickNumber(raw, "maxStreak", "max_streak"),
    total_check_in: pickNumber(raw, "totalCheckIn", "total_check_in"),
    total_seconds: pickNumber(raw, "totalSeconds", "total_seconds"),
    today_seconds: pickNumber(raw, "todaySeconds", "today_seconds"),
    month_seconds: pickNumber(raw, "monthSeconds", "month_seconds"),
  };
}

export function fetchDateHot(date: string) {
  return get<DateHotItem[]>("/index/date_hot", { date });
}

export function fetchRankList() {
  return get<RankList>("/rank/list", { type: 4, limit: 50 });
}

export function clockIn() {
  return post("/dashboard/today_checkin");
}

/** 打卡统计卡片（/dashboard/checkin_stat_info，驼峰结构直接渲染） */
export interface CheckInStatVo {
  currentStreak?: number;
  maxStreak?: number;
  totalCheckIn?: number;
}

export function fetchCheckInStatInfo() {
  return get<CheckInStatVo>("/dashboard/checkin_stat_info");
}
