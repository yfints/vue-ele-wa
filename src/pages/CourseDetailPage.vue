<template>
  <div v-if="!lesson" class="contentBox">
    <div class="pl30 pr30">
      <div class="size28 mt30">没有找到这门课</div>
      <el-link type="info" class="mt30" @click="goMall">返回课程广场</el-link>
    </div>
  </div>
  <div v-else class="contentBox">
    <div class="pl30 pr30 detailScroll">
      <div class="lessonDetail">
        <div class="top flex ast mb30">
          <img src="/clone-assets/detail-deco.png" class="logo" alt="" />
          <el-image class="goodsimg mr20" :src="localAsset(lesson.image)" fit="cover" />
          <div class="flex1 flex col jb rel">
            <div class="flex jb ac">
              <div class="flex1">
                <div class="size28 mb10">{{ lesson.name }}</div>
                <div class="size20 gray">{{ lesson.describe }}</div>
              </div>
              <div class="flex ac wrap" />
            </div>
            <div class="size20 gray">共 {{ courseCount }} 个课程</div>
          </div>
        </div>
        <el-row :gutter="10">
          <el-col
            v-for="(course, index) in courses"
            :key="course.id"
            :xs="24"
            :sm="24"
            :md="24"
            :lg="6"
            :xl="6"
            class="mb30"
          >
            <div class="card hand" @click="openPractice(course)">
              <div class="flex ac">
                <div class="size26 line1 flex1 mr20 bold6">{{ course.name }}</div>
                <el-tag type="info" size="small" effect="plain" round>暂未练习</el-tag>
              </div>
              <div class="flex jb ac mt50">
                <div class="flex ac size-18">
                  <div class="flex ac mr20">
                    <div class="img20 mr5">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div>练习时长：0分钟</div>
                  </div>
                </div>
                <div class="size30 opc6">#{{ index + 1 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { Clock } from "@element-plus/icons-vue";
import { fetchLessonDetails } from "@/api/course";
import { getToken } from "@/api/token";
import ModePop from "@/components/ModePop.vue";
import { saveGameInfo } from "@/composables/useGame";
import {
  getLessonDetails,
  getMallLesson,
  localAsset,
  type LessonCourse,
  type LessonDetails,
} from "@/data/mall";

const route = useRoute();
const router = useRouter();
const modeRef = ref<{ open: () => void } | null>(null);
const lesson = ref<LessonDetails | undefined>();
const courseId = computed(() => String(route.params.courseId || ""));
const courses = computed(() => lesson.value?.lesson_courses ?? []);
const courseCount = computed(
  () => lesson.value?.course_published_count ?? courses.value.length,
);

function goMall() {
  void router.push("/courseMall/index");
}

function toLessonDetails(source?: {
  id?: number | string;
  name?: string;
  describe?: string;
  image?: string;
  course_published_count?: number;
  user_lesson_id?: number;
  lesson_courses?: Array<{ id: number; name: string; describe?: string }>;
  lesson_course?: Array<{ id: number; name: string; describe?: string }>;
}): LessonDetails | undefined {
  if (!source) return undefined;
  const list = (source.lesson_courses || source.lesson_course || []).map((item) => ({
    id: item.id,
    name: item.name,
    describe: item.describe || item.name,
  }));
  if (!source.id && !source.name && !list.length) return undefined;
  const base = getMallLesson(source.id || courseId.value);
  return {
    ...(base || ({} as LessonDetails)),
    ...source,
    id: Number(source.id || courseId.value),
    lesson_courses: list,
  } as LessonDetails;
}

async function load() {
  const local =
    getLessonDetails(courseId.value) || toLessonDetails(getMallLesson(courseId.value));
  try {
    const remote = await fetchLessonDetails(courseId.value);
    const mapped = toLessonDetails(remote);
    if (mapped?.id) {
      lesson.value = {
        ...local,
        ...mapped,
        lesson_courses: mapped.lesson_courses.length
          ? mapped.lesson_courses
          : local?.lesson_courses || [],
      };
      return;
    }
  } catch {
    /* 走本地课纲 */
  }
  lesson.value = local;
}

function startPractice(course: LessonCourse) {
  if (!lesson.value) return;
  const userLessonId = lesson.value.user_lesson_id;
  saveGameInfo({
    courseId: String(lesson.value.id),
    chapterId: String(course.id),
    gameTitle: course.name,
    courseName: lesson.value.name,
    gameType: "Sentence",
    gameMode: "SentenceTranslate",
    userLessonId: userLessonId && userLessonId !== 0 ? String(userLessonId) : "",
  });
  modeRef.value?.open();
}

async function askLogin(chapterId: number) {
  try {
    await ElMessageBox.confirm("您还未登录或登录失效，是否前往登录？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "先不登录",
      type: "warning",
      closeOnClickModal: false,
    });
    await router.push({
      path: "/login/index",
      query: { redirect: `${route.path}?start=${chapterId}` },
    });
  } catch {
    /* 先不登录 */
  }
}

function openPractice(course: LessonCourse) {
  if (!getToken()) {
    void askLogin(course.id);
    return;
  }
  startPractice(course);
}

async function maybeResumeStart() {
  const startId = String(route.query.start || "");
  if (!startId || !getToken()) return;
  const course = courses.value.find((item) => String(item.id) === startId);
  if (course) startPractice(course);
  const query = { ...route.query };
  delete query.start;
  await router.replace({ path: route.path, query });
}

watch(
  courseId,
  async () => {
    await load();
    await maybeResumeStart();
  },
  { immediate: true },
);
</script>
