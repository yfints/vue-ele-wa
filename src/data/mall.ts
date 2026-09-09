import mallPayload from "./lesson-mall.json";
import categoryPayload from "./lesson-categories.json";
import assetMap from "./asset-map.json";
import lessonDetails1653 from "./lesson-details-1653.json";

export interface Founder {
  name: string;
  head_img: string;
}

export interface MallLesson {
  id: number;
  name: string;
  describe: string;
  image: string;
  lesson_category_id: number;
  status: number;
  heat: number;
  created_at: number;
  course_num: number;
  course_published_count: number;
  human_num: number;
  is_have: number;
  is_collect: number;
  user_lesson_id: number;
  founder?: Founder;
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
  id: number;
  name?: string;
  cover?: string;
  image?: string;
  description?: string;
  describe?: string;
  categoryId?: number;
  lesson_category_id?: number;
}): MallLesson {
  return {
    id: Number(course.id),
    name: course.name || "",
    describe: course.description || course.describe || "",
    image: course.cover || course.image || "",
    lesson_category_id: Number(course.categoryId ?? course.lesson_category_id ?? 0),
    status: 1,
    heat: 0,
    created_at: 0,
    course_num: 0,
    course_published_count: 0,
    human_num: 0,
    is_have: 0,
    is_collect: 0,
    user_lesson_id: 0,
    founder: { name: "", head_img: "" },
  };
}

export function getMallLesson(id: string | number) {
  return mallLessons.find((item) => String(item.id) === String(id));
}

export interface LessonCourse {
  id: number;
  name: string;
  describe: string;
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
  id: number;
  name: string;
  describe?: string;
  last_time?: number;
  time_seconds?: number | string;
  done_num?: number;
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
  related_word_lessons?: { id: number; name?: string }[];
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
