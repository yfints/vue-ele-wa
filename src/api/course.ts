import { del, get, post } from "./http";

export interface MyLessonCourse {
  id: number | string;
  name: string;
  describe?: string;
  last_time?: number;
  time_seconds?: number | string;
  done_num?: number;
}

export interface RelatedWordLesson {
  id: number | string;
  name?: string;
}

export interface MyLessonDetails {
  id: number | string;
  name?: string;
  describe?: string;
  image?: string;
  is_collect?: number;
  course_done_count?: number;
  course_count?: number;
  course_published_count?: number;
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
    "/game/my_lesson_details",
    { id },
    { skipAuthRedirect: true },
  );
  return unwrapLesson(data);
}

/** `/courses/:id` 返回的课程课时 */
export interface CourseLessonVo {
  id: number | string;
  name: string;
  lessonType?: number | string | null;
  duration?: number;
  sortOrder?: number;
  wordCount?: number;
  timeSeconds?: number;
  doneNum?: number;
  status?: number;
  lastStudyTime?: string | null;
  lastTime?: boolean;
}

export interface CourseProgressVo {
  doneCount?: number;
  total?: number;
  percentage?: number;
}

/** 课程详情接口数据（驼峰结构，直接渲染，不做二次转换） */
export interface CourseDetailVo {
  id: number | string;
  categoryId?: number | string;
  name?: string;
  cover?: string | null;
  description?: string | null;
  courseType?: number;
  heat?: number;
  humanNum?: number;
  courseNum?: number;
  isHave?: boolean;
  userLessonId?: number | string | null;
  userWordId?: number | string | null;
  isCollect?: boolean;
  access?: { allowed?: boolean; reason?: string };
  lessons?: CourseLessonVo[];
  progress?: CourseProgressVo;
  timeSeconds?: number;
  lastLessonId?: number | string | null;
  lastStudyTime?: string | null;
}

export async function fetchLessonDetails(id: string | number) {
  return get<CourseDetailVo>(`/courses/${id}`, undefined, { skipAuthRedirect: true });
}

export function toggleCollect(courseId: string | number) {
  return post("/collect/toggle", { courseId: courseId, type: 0 }, { skipAuthRedirect: true });
}

export function deleteMyLesson(userLessonId: string | number) {
  return post("/lessons/my/delete", { user_lesson_id: userLessonId });
}

export interface CourseCategory {
  id: number | string;
  name: string;
  sortOrder?: number;
}

export interface CourseVo {
  id: number | string;
  categoryId?: number | string;
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
  return get<CourseCategory[]>("/course/categories", undefined, {
    skipAuthRedirect: true,
  });
}

export function fetchCourses(params?: {
  categoryId?: number | string;
  courseType?: number;
  keyword?: string;
  current?: number;
  size?: number;
}) {
  return get<CoursePage>("/courses", params, { skipAuthRedirect: true });
}

export function studyPlanLesson(courseId: string | number) {
  return post<{ userLessonId?: number | string; userWordId?: number | string }>(
    "/study-plan/lessons",
    { courseId: courseId, type: 0 },
    { skipAuthRedirect: true },
  );
}

export function removeStudyPlanLesson(userLessonId: string | number) {
  return del(`/study-plan/lessons/${userLessonId}`, undefined, { skipAuthRedirect: true });
}

export function fetchStudyPlanLessons(params?: { page?: number; limit?: number }) {
  return get("/study-plan/lessons", params);
}

export function topStudyPlanLesson(body: { userLessonId?: string | number; courseId?: string | number; isTop: boolean }) {
  return post("/study-plan/lessons/top", body);
}

export function fetchCollectLessons(params?: { type?: number; page?: number; limit?: number }) {
  return get("/collect/lessons", params);
}

export function addStudyPlanWords(courseId: string | number) {
  return post("/study-plan/words", { courseId });
}

export function fetchWordPractice(courseId: string | number) {
  return get("/study-plan/word-practice", { courseId });
}

export function learnStudyPlanWord(body: { courseId: string | number; itemId: string | number }) {
  return post("/study-plan/words/learn", body);
}

export function fetchStudyPlanWords(params?: { page?: number; limit?: number }) {
  return get("/study-plan/words", params);
}

export function topStudyPlanWord(body: { userWordId?: string | number; courseId?: string | number; isTop: boolean }) {
  return post("/study-plan/words/top", body);
}

export function removeStudyPlanWords(userWordId: string | number) {
  return del(`/study-plan/words/${userWordId}`);
}

export const removeStudyPlanWord = removeStudyPlanLesson;
