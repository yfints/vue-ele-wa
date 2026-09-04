import { get, post } from "./http";

export interface GameStartMeta {
  sentenceTotal?: number;
  nextCursor?: string;
}

export interface GameStartResult {
  meta?: GameStartMeta;
  sentences?: GameSentenceItem[];
}

export interface GameSentenceItem {
  id?: number;
  sentence_id?: number;
  chinese?: string;
  english?: string;
  content?: string;
  translate?: string;
  translation?: string;
  audio?: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  part_of_speech?: string;
  practices?: Array<{
    id?: number;
    chinese?: string;
    english?: string;
    content?: string;
    translate?: string;
    audio?: string;
    phonetic_uk?: string;
    phonetic_us?: string;
    part_of_speech?: string;
  }>;
}

function toLessonId(value: string | number) {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(id)) {
    throw new Error("invalid lesson id");
  }
  return id;
}

export function startGame(lessonId: string | number, lessonCourseId: string | number) {
  return post<GameStartResult>(
    "/api/v2/game/start",
    {
      lesson_id: toLessonId(lessonId),
      lesson_course_id: toLessonId(lessonCourseId),
    },
    { skipAuthRedirect: true },
  );
}

export function fetchExercisePage(params: {
  lesson_id: string | number;
  lesson_course_id: string | number;
  limit: number;
  cursor?: string;
}) {
  return get<{ sentences?: GameSentenceItem[]; meta?: { nextCursor?: string } }>(
    "/api/v2/game/exercise_page",
    {
      ...params,
      lesson_id: toLessonId(params.lesson_id),
      lesson_course_id: toLessonId(params.lesson_course_id),
    },
    { skipAuthRedirect: true },
  );
}

export function fetchGameTime() {
  return get<number | { time?: number }>("/api/v2/game/time", undefined, { skipAuthRedirect: true });
}
