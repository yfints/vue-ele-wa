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

export function fetchNotices() {
  return get<NoticeResult>("/api/v2/index/notice", { page: 1, limit: 5 });
}

export function fetchStudyNum(type: number) {
  return get<StudyNum>("/api/v2/index/study_num", { type });
}

export function fetchStudyCount() {
  return get<StudyCount>("/api/v2/index/count");
}

export function fetchHomeIndex() {
  return get<HomeIndex>("/api/v2/index/index");
}

export async function fetchHomeStats() {
  const raw = (await get<HomeStats>("/api/v2/index/user_count")) || {};
  return {
    current_streak: Number(raw.current_streak || 0),
    max_streak: Number(raw.max_streak || 0),
    total_check_in: Number(raw.total_check_in || 0),
    total_seconds: Number(raw.total_seconds || 0),
    today_seconds: Number(raw.today_seconds || 0),
    month_seconds: Number(raw.month_seconds || 0),
  } satisfies HomeStats;
}

export function fetchDateHot(date: string) {
  return get<DateHotItem[]>("/api/v2/index/date_hot", { date });
}

export function fetchRankList() {
  return get<RankList>("/api/v2/rank/list", { type: 4, limit: 50 });
}

export function clockIn() {
  return post("/api/v2/game/clock_in");
}
