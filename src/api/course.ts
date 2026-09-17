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

export function toggleCollect(courseId: string | number, type = 0) {
  return post("/collect/toggle", { courseId, type }, { skipAuthRedirect: true });
}

export function deleteMyLesson(userLessonId: string | number) {
  return post("/lessons/my/delete", { user_lesson_id: userLessonId });
}

export interface CourseCategory {
  id: number | string;
  name: string;
  sortOrder?: number;
  /** 以下字段后端可能会带上，读取时统一做兼容 */
  cover?: string;
  image?: string;
  icon?: string;
  description?: string;
  describe?: string;
  courseNum?: number;
  course_num?: number;
  humanNum?: number;
  human_num?: number;
  percentage?: number;
}

export interface CourseVo {
  id: number | string;
  categoryId?: number | string;
  categoryName?: string;
  category_name?: string;
  name?: string;
  cover?: string;
  image?: string;
  description?: string;
  describe?: string;
  courseType?: number;
  sortOrder?: number;
  heat?: number;
  humanNum?: number;
  human_num?: number;
  courseNum?: number;
  course_num?: number;
  percentage?: number;
  progress?: number;
  tags?: string[] | string;
  access?: { allowed?: boolean; reason?: string };
}

export interface CoursePage {
  records?: CourseVo[];
  total?: number;
  current?: number;
  size?: number;
}

/**
 * 课程分类。
 * @param params.type 0=课程广场 1=教材同步 3=音标；不传=全部上线分类（平铺）
 */
export function fetchCourseCategories(params?: { type?: number }) {
  return get<CourseCategory[]>("/course/categories", params, {
    skipAuthRedirect: true,
  });
}

export function fetchCourses(params?: {
  categoryId?: number | string;
  courseType?: number | string;
  /** 课程类型筛选：0=课程广场 1=教材同步 3=音标 */
  type?: number | string;
  keyword?: string;
  page?: number;
  limit?: number;
  current?: number;
  size?: number;
}) {
  return get<CoursePage>("/courses", params, { skipAuthRedirect: true });
}

/** 分页结构兼容：records / list / rows，或者直接返回数组 */
export function unwrapCoursePage(data: unknown): CoursePage {
  const obj = asRecord(data);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(obj?.records)
      ? obj?.records
      : Array.isArray(obj?.list)
        ? obj?.list
        : Array.isArray(obj?.rows)
          ? obj?.rows
          : [];
  const total = obj?.total ?? obj?.count;
  return {
    records: list as CourseVo[],
    total: total == null ? undefined : Number(total),
  };
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

export interface CollectLessonItem {
  id: number | string;
  courseId: number | string;
  name: string;
  image: string;
  heat: number;
  isHave: boolean;
  userLessonId?: number | string | null;
  founderName: string;
  founderAvatar: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function textOf(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function normalizeCollectItem(row: unknown): CollectLessonItem | null {
  const raw = asRecord(row);
  if (!raw) return null;
  const detail = asRecord(raw.detail) || asRecord(raw.course) || raw;
  const founder = asRecord(detail.founder) || {};
  const courseId = detail.id ?? raw.courseId ?? raw.lesson_id ?? raw.lessonId;
  if (courseId == null || courseId === "") return null;
  return {
    id: (raw.id as number | string | undefined) ?? (courseId as number | string),
    courseId: courseId as number | string,
    name: textOf(detail.name),
    image: textOf(detail.image || detail.cover),
    heat: Number(detail.heat ?? 0) || 0,
    isHave: detail.is_have == 1 || detail.isHave === true,
    userLessonId: (detail.user_lesson_id ?? detail.userLessonId) as number | string | null | undefined,
    founderName: textOf(founder.nickname || founder.name),
    founderAvatar: textOf(founder.head_img || founder.avatar || founder.headImg),
  };
}

export function unwrapCollectPage(data: unknown): { items: CollectLessonItem[]; total?: number } {
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
  const items = list.map(normalizeCollectItem).filter((item): item is CollectLessonItem => Boolean(item));
  const total = obj?.total ?? obj?.count;
  return { items, total: total == null ? undefined : Number(total) };
}

export function fetchCollectLessons(params?: {
  type?: number;
  page?: number;
  limit?: number;
  current?: number;
  size?: number;
}) {
  const page = params?.page ?? params?.current ?? 1;
  const limit = params?.limit ?? params?.size ?? 50;
  return get(
    "/collect/lessons",
    {
      type: params?.type ?? 0,
      page,
      limit,
      current: page,
      size: limit,
    },
    { skipAuthRedirect: true },
  );
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
