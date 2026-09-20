import mallPayload from "./lesson-mall.json";
import categoryPayload from "./lesson-categories.json";
import assetMap from "./asset-map.json";
import lessonDetails1653 from "./lesson-details-1653.json";

export interface Founder {
  name: string;
  head_img: string;
}

export interface MallLesson {
  id: number | string;
  name: string;
  describe: string;
  image: string;
  /** 课程分类标签（接口 categories，按数组顺序渲染） */
  categories?: { id: number | string; kind?: number; name?: string }[];
  lesson_category_id: number | string;
  status: number;
  heat: number;
  created_at: number;
  course_num: number;
  course_published_count: number;
  human_num: number;
  is_have: number;
  is_collect: number;
  user_lesson_id: number | string;
  founder?: Founder;
  /** 1=免费 2=会员 */
  courseType?: number;
  /** 课时数（课程广场卡片显示「已学 x/y 课时」的分母） */
  courseNum?: number;
  /** 已学百分比（老字段） */
  percentage?: number;
  /** 进度汇总：列表接口不一定下发，读到就用 */
  progress?: { doneCount?: number; total?: number; percentage?: number } | number;
  /** 是否已收藏（接口 isCollect） */
  isCollect?: boolean;
}

export interface LessonCategory {
  id: number;
  name: string;
  updated_at: string;
}

export const mallLessons = mallPayload.data.list as MallLesson[];
export const mallTotal = mallPayload.data.total as number;
export const lessonCategories = categoryPayload.data as LessonCategory[];

export function localAsset(url: string) {
  if (!url) return "";
  const mapped = (assetMap as Record<string, string>)[url];
  if (mapped) return mapped;
  const remote = url.match(/^https?:\/\/res\.waxueshe\.com(\/.*)$/i);
  if (remote) {
    return import.meta.env.DEV ? `/res-cdn${remote[1]}` : url;
  }
  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("/clone-assets") ||
    url.startsWith("/res-cdn")
  ) {
    return url;
  }
  const origin = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://test-jiaopei.zrgy-bbg.com" : "")
  ).replace(/\/$/, "");
  if (!origin) return url;
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export function toMallLesson(course: {
  id: number | string;
  name?: string;
  cover?: string;
  image?: string;
  description?: string;
  describe?: string;
  categoryId?: number | string;
  lesson_category_id?: number | string;
  courseType?: number;
  courseNum?: number;
  course_num?: number;
  heat?: number;
  humanNum?: number;
  human_num?: number;
  isHave?: boolean;
  is_have?: number;
  userLessonId?: number | string | null;
  user_lesson_id?: number | string | null;
  percentage?: number;
  progress?: { doneCount?: number; total?: number; percentage?: number } | number;
  isCollect?: boolean;
  categories?: { id: number | string; kind?: number; name?: string }[];
}): MallLesson {
  return {
    id: String(course.id),
    name: course.name || "",
    describe: course.description || course.describe || "",
    image: course.cover || course.image || "",
    categories: Array.isArray(course.categories) ? course.categories : [],
    lesson_category_id: String(course.categoryId ?? course.lesson_category_id ?? 0),
    status: 1,
    heat: Number(course.heat || 0) || 0,
    created_at: 0,
    course_num: 0,
    course_published_count: 0,
    human_num: Number(course.humanNum ?? course.human_num ?? 0) || 0,
    is_have: course.isHave === true || Number(course.is_have || 0) ? 1 : 0,
    is_collect: 0,
    user_lesson_id: course.userLessonId ?? course.user_lesson_id ?? 0,
    founder: { name: "", head_img: "" },
    courseType: course.courseType,
    courseNum: Number(course.courseNum ?? course.course_num ?? 0) || 0,
    percentage: course.percentage,
    progress: course.progress,
    isCollect: course.isCollect === true,
  };
}

export function getMallLesson(id: string | number) {
  return mallLessons.find((item) => String(item.id) === String(id));
}

export interface LessonCourse {
  id: number | string;
  name: string;
  describe: string;
  last_time?: number;
  time_seconds?: number | string;
  done_num?: number;
}

export interface LessonDetails extends MallLesson {
  lesson_courses: LessonCourse[];
}

const detailsById: Record<string, LessonDetails> = {
  "1653": lessonDetails1653.data.lessons_details as LessonDetails,
};

export function getLessonDetails(id: string | number) {
  return detailsById[String(id)];
}

export interface MyLessonCourse {
  id: number | string;
  name: string;
  describe?: string;
  last_time?: number;
  time_seconds?: number | string;
  done_num?: number;
}

export interface MyLessonDetails {
  id: number | string;
  name?: string;
  describe?: string;
  image?: string;
  is_collect?: number;
  course_done_count?: number;
  course_count?: number;
  time_seconds?: number | string;
  recent_study_time?: string;
  percentage?: number;
  related_word_lessons?: { id: number | string; name?: string }[];
  lesson_course?: MyLessonCourse[];
  lesson_courses?: MyLessonCourse[];
}

export function toMyLessonDetails(lesson: LessonDetails, _userLessonId?: string | number): MyLessonDetails {
  const courses: MyLessonCourse[] = (lesson.lesson_courses || []).map((course, index) => ({
    id: course.id,
    name: course.name,
    describe: course.describe,
    last_time: index === 0 ? 1 : 0,
    time_seconds: 0,
    done_num: 0,
  }));
  return {
    id: lesson.id,
    name: lesson.name,
    describe: lesson.describe,
    image: lesson.image,
    is_collect: lesson.is_collect,
    course_done_count: 0,
    course_count: lesson.course_published_count || courses.length,
    time_seconds: 0,
    recent_study_time: "",
    percentage: 0,
    related_word_lessons: [],
    lesson_course: courses,
    lesson_courses: courses,
  };
}

/** 未登录时用 1653 课纲做本地预览，避免详情页空白 */
export function getDemoMyLessonDetails(userLessonId?: string | number) {
  const source = detailsById["1653"];
  return source ? toMyLessonDetails(source, userLessonId) : undefined;
}
