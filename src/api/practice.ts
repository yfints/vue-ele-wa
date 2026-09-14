import { get, post } from "./http";

export type PracticeMode = 0 | 1 | 2 | 3;

export interface PracticeSettings {
  autoPlay?: boolean;
  playCount?: number;
  hintLevel?: number;
  caseSensitive?: boolean;
  punctuationSensitive?: boolean;
  evalModel?: string;
  translateType?: number;
  showAnalysis?: boolean;
  seconds?: number;
}

export interface PracticeItem {
  id?: number | string;
  kind?: string;
  itemType?: number;
  mode?: number;
  modeKey?: string;
  index?: number;
  itemId?: number | string;
  sort?: number;
  content?: string;
  audio?: string | null;
  pic?: string | null;
  phoneticHint?: string;
  settings?: PracticeSettings;
}

export interface PracticeWord {
  surface?: string;
  display?: string;
  chinese?: string;
  pos?: string;
  phoneticUk?: string;
  phoneticUs?: string;
}

export interface PracticeClause {
  clauseIndex?: number;
  type?: string;
  explanation?: string;
}

export interface PracticeSentence {
  sentenceId?: number | string;
  lessonId?: number | string;
  itemType?: number;
  content?: string;
  chinese?: string;
  explanation?: string;
  pic?: string | null;
  audio?: string | null;
  words?: PracticeWord[];
  clauses?: PracticeClause[];
  practices?: PracticeItem[];
}

export interface PracticeMeta {
  lessonId?: number | string;
  page?: number;
  limit?: number;
  itemTotal?: number;
  exerciseTotal?: number;
  hasMore?: boolean;
  progressIndex?: number;
  typingSeconds?: number;
  translateSeconds?: number;
}

export interface PracticePayload {
  meta?: PracticeMeta;
  sentences?: PracticeSentence[];
}

export interface PracticeResult {
  result?: "correct" | "wrong" | string;
  expected?: string;
  nextIndex?: number;
  finished?: boolean;
}

export function fetchLessonPractice(
  lessonId: string | number,
  params?: { page?: number; limit?: number },
) {
  return get<PracticePayload>(`/lessons/${lessonId}/practice`, {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });
}

export async function fetchAllLessonPractice(lessonId: string | number) {
  const sentences: PracticeSentence[] = [];
  let page = 1;
  let meta: PracticeMeta = {};
  for (;;) {
    const data = await fetchLessonPractice(lessonId, { page, limit: 10 });
    sentences.push(...(data?.sentences || []));
    meta = data?.meta || {};
    if (!meta.hasMore) break;
    page += 1;
    if (page > 50) break;
  }
  return { meta, sentences };
}

export function submitPractice(body: {
  lessonId: string | number;
  itemId: string | number;
  mode: number;
  answer: string;
}) {
  return post<PracticeResult>("/practice/submit", body);
}

export function submitSpeech(params: {
  lessonId: string | number;
  itemId: string | number;
  audio: Blob;
  filename?: string;
}) {
  const fd = new FormData();
  fd.append("audio", params.audio, params.filename || "say.webm");
  fd.append("lessonId", String(params.lessonId));
  fd.append("itemId", String(params.itemId));
  return post<PracticeResult>("/practice/submit-speech", fd, {
    params: { lessonId: params.lessonId, itemId: params.itemId },
  });
}

export function syncLessonProgress(
  lessonId: string | number,
  body: { progressIndex: number; status?: 0 | 1 },
) {
  return post(`/lessons/${lessonId}/progress`, body);
}

export function sendStudyHeartbeat(body: {
  lessonId?: string | number;
  source: 1 | 2 | 3 | 4;
  seconds: number;
  sentenceCount?: number;
  wordCount?: number;
}) {
  return post("/study/heartbeat", body);
}
