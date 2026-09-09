import { get, post } from "./http";

export interface MyLessonCourse {
  id: number;
  name: string;
  describe?: string;
  last_time?: number;
  time_seconds?: number | string;
  done_num?: number;
}

export interface RelatedWordLesson {
  id: number;
  name?: string;
}

export interface MyLessonDetails {
  id: number;
  name?: string;
  describe?: string;
  image?: string;
  is_collect?: number;
  course_done_count?: number;
  course_count?: number;
  time_seconds?: number | string;
  recent_study_time?: string;
  percentage?: number;
  related_word_lessons?: RelatedWordLesson[];
  lesson_course?: MyLessonCourse[];
  lesson_courses?: MyLessonCourse[];
}

function unwrapLesson(data: unknown): MyLessonDetails | undefined {
  if (!data || typeof data !== "object") return undefined;
  const payload = data as MyLessonDetails & { lessons_details?: MyLessonDetails };
  if (payload.lessons_details) return payload.lessons_details;
  return payload;
}

export async function fetchMyLessonDetails(id: string | number) {
  const data = await get<unknown>(
    "/api/v2/game/my_lesson_details",
    { id },
    { skipAuthRedirect: true },
  );
  return unwrapLesson(data);
}

export async function fetchLessonDetails(id: string | number) {
  const data = await get<unknown>(
    "/api/v1/courses/"+id,
    { id },
    { skipAuthRedirect: true },
  );
  return unwrapLesson(data);
}

export function toggleCollect(lessonId: string | number) {
  return post("/api/v2/collect/toggle", { lesson_id: lessonId, type: 0 }, { skipAuthRedirect: true });
}

export function deleteMyLesson(userLessonId: string | number) {
  return post("/api/v2/lessons/my/delete", { user_lesson_id: userLessonId });
}

export interface CourseCategory {
  id: number;
  name: string;
  sortOrder?: number;
}

export interface CourseVo {
  id: number;
  categoryId?: number;
  name?: string;
  cover?: string;
  description?: string;
  courseType?: number;
  sortOrder?: number;
  access?: { allowed?: boolean; reason?: string };
}

export interface CoursePage {
  records?: CourseVo[];
  total?: number;
  current?: number;
  size?: number;
}

export function fetchCourseCategories() {
  return get<CourseCategory[]>("/api/v1/course/categories", undefined, {
    skipAuthRedirect: true,
  });
}

export function fetchCourses(params?: {
  categoryId?: number;
  courseType?: number;
  keyword?: string;
  current?: number;
  size?: number;
}) {
  return get<CoursePage>("/api/v1/courses", params, { skipAuthRedirect: true });
}
