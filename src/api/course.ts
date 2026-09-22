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
  /** 单元内序号（教材课，从 1 开始，不要用 sortOrder 代替） */
  num?: number;
  lessonType?: number | string | null;
  duration?: number;
  description?: string | null;
  sortOrder?: number;
  wordCount?: number;
  timeSeconds?: number;
  doneNum?: number;
  status?: number;
  lastStudyTime?: string | null;
  lastTime?: boolean;
  /** 课时所属单元（教材课） */
  unitNo?: number | string;
  unitName?: string;
  unitLabel?: string;
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
  categories?: CourseCategoryRef[];
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
  /** 教材按「单元」下发的课时分组（新接口字段，优先用它渲染详情页） */
  units?: CourseUnitVo[];
  /** 教材单元数（非教材课为 0） */
  unitCount?: number;
  /** 音标课的读音分组（对应 C 端音标详情页的卡片数据） */
  phoneticGroups?: CoursePhoneticGroupVo[];
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
  /**
   * 分类类型：1=课程分类 2=教材-年级 3=教材-版本 4=单词集分类
   * 5=音标类型 6=新概念。接口已拍平，children 恒为 []、parentId 恒为 "0"
   */
  kind?: number;
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

/**
 * 音标课读音分组。后端字段名可能与前端约定不完全一致，
 * 页面侧做了兼容解析（见 PhoneticDetailPage 的 normalizeGroups）。
 */
export interface CoursePhoneticGroupVo {
  id?: number | string;
  name?: string;
  title?: string;
  label?: string;
  groupName?: string;
  group_name?: string;
  tone?: string;
  color?: string;
  items?: CoursePhoneticItemVo[];
  [key: string]: unknown;
}

export interface CoursePhoneticItemVo {
  id?: number | string;
  ipa?: string;
  symbol?: string;
  phonetic?: string;
  text?: string;
  content?: string;
  type?: string;
  typeLabel?: string;
  type_label?: string;
  label?: string;
  description?: string;
  tips?: unknown[];
  points?: unknown[];
  sentences?: unknown[];
  examples?: unknown[];
  words?: unknown[];
  samples?: unknown[];
  [key: string]: unknown;
}

/** 教材单元：名称字段后端可能用 unitName / name / title，前端做兼容 */
export interface CourseUnitVo {
  id?: number | string;
  unitNo?: number | string;
  /** 单元展示名（接口字段） */
  unitTitle?: string;
  /** 兼容字段：部分接口用过 unitLabel */
  unitLabel?: string;
  unitName?: string;
  unit_name?: string;
  name?: string;
  title?: string;
  sortOrder?: number;
  lessons?: CourseLessonVo[];
  lessonList?: CourseLessonVo[];
  lesson_list?: CourseLessonVo[];
}

/** 分类类型（对应接口的 kind 字段） */
export const CATEGORY_KIND = {
  /** 课程分类：课程广场 Tab / 课程卡 chip */
  COURSE: 1,
  /** 教材-年级：教材页第一级 Tab */
  GRADE: 2,
  /** 教材-版本：教材页第二级 Tab */
  EDITION: 3,
  /** 单词集分类：单词库 Tab */
  WORD: 4,
  /** 音标类型：英式 / 美式 */
  PHONETIC: 5,
  /** 新概念系列 */
  NEW_CONCEPT: 6,
} as const;

/** 课程/教材上挂的分类，形如 { id: "202", kind: 2, name: "三年级" } */
export interface CourseCategoryRef {
  id: number | string;
  kind?: number;
  name?: string;
}

export interface CourseVo {
  id: number | string;
  categoryId?: number | string;
  categoryName?: string;
  category_name?: string;
  categories?: CourseCategoryRef[];
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
  /** 单词数：单词库的单词集卡片用 */
  wordCount?: number;
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
 * @param params.kind 分类类型（见 CATEGORY_KIND）：单词库传 4、音标传 5、新概念传 6
 */
export function fetchCourseCategories(params?: { type?: number; kind?: number }) {
  return get<CourseCategory[]>("/course/categories", params, {
    skipAuthRedirect: true,
  });
}

export function fetchCourses(params?: {
  categoryId?: number | string;
  courseType?: number | string;
  /** 课程类型筛选：0=课程广场 1=教材同步 3=音标 */
  type?: number | string;
  /** 教材页第一级：年级分类 id */
  gradeCategoryId?: number | string;
  /** 教材页第二级：版本分类 id（与 gradeCategoryId 之间是 AND） */
  versionCategoryId?: number | string;
  keyword?: string;
  page?: number;
  limit?: number;
  current?: number;
  size?: number;
}) {
  return get<CoursePage>("/courses", params, { skipAuthRedirect: true });
}

/** 课程卡 / 详情卡的分类标签：按接口数组顺序渲染，前端不再排序 */
export function categoryNames(item: { categories?: CourseCategoryRef[] } | null | undefined) {
  const list = item?.categories;
  if (!Array.isArray(list)) return [];
  return list.map((category) => String(category?.name ?? "").trim()).filter(Boolean);
}

/** 分页结构兼容：records / list / rows，或者直接返回数组 */
export function unwrapCoursePage(data: unknown): { records: CourseVo[]; total?: number } {
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
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 50;
  // 后端分页参数两套都认（page/limit 与 current/size），一起传更稳
  return get(
    "/study-plan/lessons",
    { page, limit, current: page, size: limit },
    { skipAuthRedirect: true },
  );
}

export function topStudyPlanLesson(body: { userLessonId?: string | number; courseId?: string | number; isTop: boolean }) {
  return post("/study-plan/lessons/top", body);
}

/** 学习计划里的一条课程（`/study-plan/lessons` 的 records[]） */
export interface StudyPlanLessonItem {
  /** 学习计划记录 ID（user_course.id） */
  id: number | string;
  courseId: number | string;
  name: string;
  cover: string;
  description: string;
  /** 课时数（课程卡片的 courseNum，列表副标题用） */
  courseNum: number;
  /** 已完成章节数 */
  courseDoneCount: number;
  /** 章节总数 */
  courseCount: number;
  /** 进度百分比 0~100 */
  progress: number;
  /** 是否置顶：1=置顶 */
  isTop: number;
  categories: CourseCategoryRef[];
  /** 最近学习时间（接口暂未下发时为空字符串） */
  lastStudyTime: string;
}

/** 学习计划条目：接口把课程信息放在 lesson 里，进度在记录上，这里拍平成一层 */
export function normalizeStudyPlanLesson(row: unknown): StudyPlanLessonItem | null {
  const raw = asRecord(row);
  if (!raw) return null;
  const lesson = asRecord(raw.lesson) || asRecord(raw.course) || raw;
  const courseId = lesson.id ?? raw.courseId ?? raw.lessonId;
  if (courseId == null || courseId === "") return null;

  const courseCount = Number(raw.courseCount ?? lesson.courseCount ?? 0) || 0;
  const courseDoneCount = Number(raw.courseDoneCount ?? lesson.doneNum ?? 0) || 0;
  const rawProgress = Number(lesson.progress ?? lesson.percentage ?? NaN);
  const progress = Number.isFinite(rawProgress)
    ? Math.max(0, Math.min(100, Math.round(rawProgress)))
    : courseCount > 0
      ? Math.round((courseDoneCount / courseCount) * 100)
      : 0;

  return {
    id: (raw.id as number | string | undefined) ?? (courseId as number | string),
    courseId: courseId as number | string,
    name: textOf(lesson.name),
    cover: textOf(lesson.cover || lesson.image),
    description: textOf(lesson.description || lesson.describe),
    courseNum: Number(lesson.courseNum ?? lesson.course_num ?? 0) || 0,
    courseDoneCount,
    courseCount,
    progress,
    isTop: Number(raw.isTop ?? 0) || 0,
    categories: Array.isArray(lesson.categories) ? (lesson.categories as CourseCategoryRef[]) : [],
    lastStudyTime: textOf(
      raw.lastStudyTime || raw.lastStudyTimeText || lesson.lastStudyTime || lesson.lastStudyTimeText,
    ),
  };
}

/** 分页结构兼容：records / data / list / rows，或者直接返回数组 */
export function unwrapStudyPlanLessons(data: unknown): {
  items: StudyPlanLessonItem[];
  total?: number;
} {
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
  const items = list
    .map(normalizeStudyPlanLesson)
    .filter((item): item is StudyPlanLessonItem => Boolean(item));
  const total = obj?.total ?? obj?.count;
  return { items, total: total == null ? undefined : Number(total) };
}

export interface CollectLessonItem {
  id: number | string;
  courseId: number | string;
  name: string;
  image: string;
  /** 课程/单词集简介（列表页副标题） */
  description: string;
  heat: number;
  /** 1=免费 2=会员 */
  courseType: number;
  /** 课时数（单词集是单词集里的课时数） */
  courseNum: number;
  /** 单词集的单词数 */
  wordCount: number;
  /** 学习进度百分比 */
  progress: number;
  /** 分类标签（接口 categories） */
  categories: CourseCategoryRef[];
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
  const categories = Array.isArray(detail.categories)
    ? (detail.categories as CourseCategoryRef[])
    : [];
  return {
    id: (raw.id as number | string | undefined) ?? (courseId as number | string),
    courseId: courseId as number | string,
    name: textOf(detail.name),
    image: textOf(detail.image || detail.cover),
    description: textOf(detail.description || detail.describe),
    heat: Number(detail.heat ?? 0) || 0,
    courseType: Number(detail.courseType ?? 0) || 0,
    courseNum: Number(detail.courseNum ?? detail.course_num ?? 0) || 0,
    wordCount: Number(detail.wordCount ?? detail.word_count ?? 0) || 0,
    progress: Number(detail.progress ?? detail.percentage ?? 0) || 0,
    categories,
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
