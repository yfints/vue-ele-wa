<template>
  <div v-if="!lesson" class="contentBox">
    <div v-if="isMine" v-loading="true" class="pl30 pr30 detailScroll" />
    <div v-else class="pl30 pr30">
      <div class="size28 mt30">没有找到这门课</div>
      <el-link type="info" class="mt30" @click="goMall">返回课程广场</el-link>
    </div>
  </div>
  <div v-else class="contentBox">
    <div class="pl30 pr30 detailScroll">
      <div :class="isMine ? 'myLessonDetail' : 'lessonDetail'">
        <div class="top flex ast" :class="{ mb30: !isMine }">
          <img
            :src="isMine ? '/clone-assets/my-detail-deco.png' : '/clone-assets/detail-deco.png'"
            class="logo"
            alt=""
          />
          <el-image class="goodsimg mr20" :src="cover" fit="cover" lazy />
          <div class="flex1 flex col jb rel">
            <div class="flex jb ac">
              <div class="flex1">
                <div class="size28 mb10">{{ lesson.name }}</div>
                <div class="size20 gray">{{ lesson.describe }}</div>
              </div>
              <div class="flex ac wrap">
                <template v-if="isMine">
                  <el-button
                    v-if="relatedWordId"
                    type="primary"
                    class="mr20"
                    :icon="Switch"
                    plain
                    round
                    @click="switchWordLesson"
                  >
                    切换到单词课程
                  </el-button>
                  <el-tooltip
                    v-if="!isPhone"
                    effect="light"
                    :content="continueCourse?.name"
                    placement="bottom"
                  >
                    <el-button
                      type="primary"
                      :icon="VideoPlay"
                      round
                      class="flex ac"
                      @click="openPractice(continueCourse)"
                    >
                      继续学习
                    </el-button>
                  </el-tooltip>
                  <el-button
                    v-if="lesson.is_collect"
                    type="warning"
                    :icon="Star"
                    round
                    @click="askUncollect"
                  >
                    已收藏
                  </el-button>
                  <el-button v-else type="warning" :icon="Star" plain round @click="collect">
                    收藏
                  </el-button>
                </template>
              </div>
            </div>
            <div class="flex jb ac">
              <div class="size20 gray">
                <template v-if="isMine">
                  {{ lesson.course_done_count ?? "" }} / {{ lesson.course_count ?? "" }}课程
                </template>
                <template v-else>共 {{ courseCount }} 个课程</template>
              </div>
              <el-button
                v-if="isMine && isPhone"
                type="danger"
                round
                :icon="Delete"
                size="small"
                plain
                @click="removeLesson"
              >
                删除课程
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="isMine" class="box themeCard flex ac wrap mb30">
          <el-tag type="success" round>学习：{{ studyTimeText }}</el-tag>
          <el-tag round class="ml20 mr20">最近：{{ lesson.recent_study_time || "未开始" }}</el-tag>
          <div class="progress">
            <el-progress :percentage="Number(lesson.percentage || 0)" :stroke-width="15" />
          </div>
          <el-button
            v-if="!isPhone"
            type="danger"
            round
            :icon="Delete"
            size="small"
            plain
            @click="removeLesson"
          >
            删除课程
          </el-button>
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
            <div
              class="card hand"
              :class="{ act: isMine && course.last_time == 1 }"
              @click="openPractice(course)"
            >
              <div class="flex ac">
                <div class="size26 line1 flex1 mr20 bold6">{{ course.name }}</div>
                <template v-if="isMine">
                  <el-tag v-if="course.last_time == 1" type="primary" size="small" effect="light" round>
                    最近练习
                  </el-tag>
                  <template v-else>
                    <el-tag
                      v-if="course.time_seconds && Number(course.done_num) > 0"
                      type="success"
                      size="small"
                      effect="plain"
                      round
                    >
                      已完成练习
                    </el-tag>
                    <el-tag
                      v-else-if="course.time_seconds"
                      type="primary"
                      size="small"
                      effect="plain"
                      round
                    >
                      待完成练习
                    </el-tag>
                    <el-tag v-else type="info" size="small" effect="plain" round>暂未练习</el-tag>
                  </template>
                </template>
                <el-tag v-else type="info" size="small" effect="plain" round>暂未练习</el-tag>
              </div>
              <div class="flex jb ac mt50">
                <div class="flex ac size-18">
                  <div
                    class="flex ac mr20"
                    :class="{ mainColor: isMine && course.time_seconds && course.last_time != 1 }"
                  >
                    <div class="img20 mr5">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div>练习时长：{{ isMine ? formatPracticeMinutes(course.time_seconds) : "0分钟" }}</div>
                  </div>
                  <div v-if="isMine" :class="{ green: Number(course.done_num) > 0 && course.last_time != 1 }">
                    ✓ 已完成{{ course.done_num || 0 }}次
                  </div>
                </div>
                <div class="size30 opc6">#{{ index + 1 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-empty v-if="isMine && courses.length === 0" description="暂无课程" />
        <div class="gap30" />
      </div>
    </div>
    <div v-if="isMine" class="safeArea phone" />
    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Clock, Delete, Star, Switch, VideoPlay } from "@element-plus/icons-vue";
import {
  deleteMyLesson,
  fetchLessonDetails,
  fetchMyLessonDetails,
  toggleCollect,
} from "@/api/course";
import { getToken } from "@/api/token";
import ModePop from "@/components/ModePop.vue";
import { isPhone } from "@/composables/useLayout";
import { saveGameInfo } from "@/composables/useGame";
import {
  getDemoMyLessonDetails,
  getLessonDetails,
  getMallLesson,
  localAsset,
  type LessonCourse,
  type LessonDetails,
  type MyLessonCourse,
  type MyLessonDetails,
} from "@/data/mall";
import { formatPracticeMinutes } from "@/lib/time";

/** 广场详情与“我的课程”详情共用的视图模型 */
type DetailLesson = LessonDetails & Partial<MyLessonDetails>;
type DetailCourse = LessonCourse | MyLessonCourse;

const route = useRoute();
const router = useRouter();
const modeRef = ref<{ open: () => void } | null>(null);
const lesson = ref<DetailLesson | undefined>();
const usingDemo = ref(false);

const courseId = computed(() => String(route.params.courseId || ""));
const mineId = computed(() => String(route.params.id || ""));
const isMine = computed(() => Boolean(mineId.value));
const cover = computed(() => (lesson.value?.image ? localAsset(lesson.value.image) : ""));
const courses = computed<DetailCourse[]>(
  () => lesson.value?.lesson_course || lesson.value?.lesson_courses || [],
);
const courseCount = computed(
  () => lesson.value?.course_published_count ?? courses.value.length,
);
const relatedWordId = computed(() => lesson.value?.related_word_lessons?.[0]?.id);
const continueCourse = computed(
  () => courses.value.find((item) => item.last_time == 1) || courses.value[0],
);
const studyTimeText = computed(() => {
  const value = lesson.value?.time_seconds;
  if (value == null || value === "") return "0分钟";
  if (typeof value === "string" && /[^\d.]/.test(value)) return value;
  return formatPracticeMinutes(value);
});

function goMall() {
  void router.push("/courseMall/index");
}

function toLessonDetails(source?: {
  id?: number | string;
  name?: string;
  describe?: string;
  image?: string;
  course_published_count?: number;
  user_lesson_id?: number | string;
  lesson_courses?: Array<{ id: number | string; name: string; describe?: string }>;
  lesson_course?: Array<{ id: number | string; name: string; describe?: string }>;
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
    id: String(source.id || courseId.value),
    lesson_courses: list,
  } as LessonDetails;
}

async function loadMine() {
  if (getToken()) {
    try {
      const data = await fetchMyLessonDetails(mineId.value);
      if (data && (data.name || data.lesson_course || data.lesson_courses)) {
        usingDemo.value = false;
        lesson.value = data as DetailLesson;
        return;
      }
    } catch {
      /* 走登录提示 + 本地预览 */
    }
  }
  usingDemo.value = true;
  lesson.value = getDemoMyLessonDetails(mineId.value) as DetailLesson | undefined;
  void askLogin();
}

async function loadPublic() {
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

async function load() {
  lesson.value = undefined;
  if (isMine.value) await loadMine();
  else await loadPublic();
}

function startPractice(course?: DetailCourse) {
  if (!course || !lesson.value) return;
  const userLessonId = lesson.value.user_lesson_id;
  saveGameInfo({
    courseId: String(lesson.value.id),
    chapterId: String(course.id),
    gameTitle: course.name,
    courseName: lesson.value.name,
    gameType: "Sentence",
    gameMode: "SentenceTranslate",
    userLessonId: isMine.value
      ? mineId.value
      : userLessonId && userLessonId !== 0
        ? String(userLessonId)
        : "",
  });
  modeRef.value?.open();
}

async function askLogin(chapterId?: number | string) {
  try {
    await ElMessageBox.confirm("您还未登录或登录失效，是否前往登录？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "先不登录",
      type: "warning",
      closeOnClickModal: false,
    });
    await router.push({
      path: "/login/index",
      query: {
        redirect: chapterId != null ? `${route.path}?start=${chapterId}` : route.fullPath,
      },
    });
  } catch {
    /* 先不登录 */
  }
}

function openPractice(course?: DetailCourse) {
  if (!course) return;
  if (!isMine.value && !getToken()) {
    void askLogin(course.id);
    return;
  }
  startPractice(course);
}

function switchWordLesson() {
  ElMessage.info("本地预览不接入单词课程");
}

async function collect() {
  if (!lesson.value) return;
  try {
    if (getToken() && !usingDemo.value) await toggleCollect(lesson.value.id);
    lesson.value.is_collect = 1;
    ElMessage.success("已添加到我的收藏");
  } catch {
    /* unwrap 已提示 */
  }
}

async function askUncollect() {
  try {
    await ElMessageBox.confirm("确定要取消收藏吗？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  if (!lesson.value) return;
  try {
    if (getToken() && !usingDemo.value) await toggleCollect(lesson.value.id);
    lesson.value.is_collect = 0;
    ElMessage.success("已取消收藏");
  } catch {
    /* unwrap 已提示 */
  }
}

async function removeLesson() {
  try {
    await ElMessageBox.confirm("确定要删除此课程包吗?此操作不可恢复。", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  try {
    if (getToken() && !usingDemo.value) await deleteMyLesson(mineId.value);
    ElMessage.success("删除成功");
    await router.push("/courseMall/index");
  } catch {
    /* unwrap 已提示 */
  }
}

async function maybeResumeStart() {
  if (isMine.value) return;
  const startId = String(route.query.start || "");
  if (!startId || !getToken()) return;
  const course = courses.value.find((item) => String(item.id) === startId);
  if (course) startPractice(course);
  const query = { ...route.query };
  delete query.start;
  await router.replace({ path: route.path, query });
}

watch(
  () => (isMine.value ? `mine:${mineId.value}` : `course:${courseId.value}`),
  async () => {
    await load();
    await maybeResumeStart();
  },
  { immediate: true },
);
</script>
