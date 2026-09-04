<template>
  <div class="contentBox">
    <div class="pl30 pr30 detailScroll">
      <div class="myLessonDetail">
        <div class="top flex ast">
          <img src="/clone-assets/my-detail-deco.png" class="logo" alt="" />
          <el-image class="goodsimg mr20" :src="cover" fit="cover" lazy />
          <div class="flex1 flex col jb rel">
            <div class="flex jb ac">
              <div class="flex1">
                <div class="size28 mb10">{{ lesson?.name }}</div>
                <div class="size20 gray">{{ lesson?.describe }}</div>
              </div>
              <div class="flex ac wrap">
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
                  <el-button type="primary" :icon="VideoPlay" round class="flex ac" @click="openPractice(continueCourse)">
                    继续学习
                  </el-button>
                </el-tooltip>
                <el-button
                  v-if="lesson?.is_collect"
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
              </div>
            </div>
            <div class="flex jb ac">
              <div class="size20 gray">
                {{ lesson?.course_done_count ?? "" }} / {{ lesson?.course_count ?? "" }}课程
              </div>
              <el-button
                v-if="isPhone"
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

        <div v-if="lesson" class="box themeCard flex ac wrap mb30">
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
            <div class="card hand" :class="{ act: course.last_time == 1 }" @click="openPractice(course)">
              <div class="flex ac">
                <div class="size26 line1 flex1 mr20 bold6">{{ course.name }}</div>
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
              </div>
              <div class="flex jb ac mt50">
                <div class="flex ac size-18">
                  <div
                    class="flex ac mr20"
                    :class="{ mainColor: course.time_seconds && course.last_time != 1 }"
                  >
                    <div class="img20 mr5">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div>练习时长：{{ formatPracticeMinutes(course.time_seconds) }}</div>
                  </div>
                  <div :class="{ green: Number(course.done_num) > 0 && course.last_time != 1 }">
                    ✓ 已完成{{ course.done_num || 0 }}次
                  </div>
                </div>
                <div class="size30 opc6">#{{ index + 1 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-empty v-if="lesson && courses.length === 0" description="暂无课程" />
        <div class="gap30" />
      </div>
    </div>
    <div class="safeArea phone" />
    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Clock, Delete, Star, Switch, VideoPlay } from "@element-plus/icons-vue";
import { deleteMyLesson, fetchMyLessonDetails, toggleCollect } from "@/api/course";
import { getToken } from "@/api/token";
import { isPhone } from "@/composables/useLayout";
import { getDemoMyLessonDetails, localAsset, type MyLessonCourse, type MyLessonDetails } from "@/data/mall";
import { formatPracticeMinutes } from "@/lib/time";
import ModePop from "@/components/ModePop.vue";
import { saveGameInfo } from "@/composables/useGame";

const route = useRoute();
const router = useRouter();
const lesson = ref<MyLessonDetails | undefined>();
const usingDemo = ref(false);
const modeRef = ref<{ open: () => void } | null>(null);

const userLessonId = computed(() => String(route.params.id || ""));
const cover = computed(() => (lesson.value?.image ? localAsset(lesson.value.image) : ""));
const courses = computed(() => lesson.value?.lesson_course || lesson.value?.lesson_courses || []);
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

function openPractice(course?: MyLessonCourse) {
  if (!course || !lesson.value) return;
  saveGameInfo({
    courseId: String(lesson.value.id),
    chapterId: String(course.id),
    gameTitle: course.name,
    courseName: lesson.value.name,
    gameType: "Sentence",
    gameMode: "SentenceTranslate",
    userLessonId: userLessonId.value,
  });
  modeRef.value?.open();
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
    if (getToken() && !usingDemo.value) await deleteMyLesson(userLessonId.value);
    ElMessage.success("删除成功");
    await router.push("/courseMall/index");
  } catch {
    /* unwrap 已提示 */
  }
}

async function askLogin() {
  try {
    await ElMessageBox.confirm("您还未登录或登录失效，是否前往登录？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "先不登录",
      type: "warning",
      closeOnClickModal: false,
    });
    await router.push("/login/index");
  } catch {
    /* 先不登录 */
  }
}

onMounted(async () => {
  if (getToken()) {
    try {
      const data = await fetchMyLessonDetails(userLessonId.value);
      if (data && (data.name || data.lesson_course || data.lesson_courses)) {
        lesson.value = data;
        return;
      }
    } catch {
      /* 走登录提示 + 本地预览 */
    }
  }
  usingDemo.value = true;
  lesson.value = getDemoMyLessonDetails(userLessonId.value);
  await askLogin();
});
</script>
