<template>
  <div class="contentBox">
    <div v-loading="loading" class="pl30 pr30 detailScroll">
      <div v-if="!loading && !detail">
        <div class="size28 mt30">没有找到这门课</div>
        <el-link type="info" class="mt30" @click="goMall">返回课程广场</el-link>
      </div>
      <div v-else-if="detail" :class="isMine ? 'myLessonDetail' : 'lessonDetail'">
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
                <div class="size28 mb10">{{ detail.name }}</div>
                <div class="size20 gray">{{ detail.description }}</div>
              </div>
              <div class="flex ac wrap">
                <el-tag v-if="accessText" type="warning" round class="mr20">{{ accessText }}</el-tag>
                <el-tooltip
                  v-if="!isPhone"
                  effect="light"
                  :content="continueLesson?.name"
                  placement="bottom"
                >
                  <el-button
                    type="primary"
                    :icon="VideoPlay"
                    round
                    class="flex ac"
                    @click="openPractice(continueLesson)"
                  >
                    {{ isMine ? "继续学习" : "开始学习" }}
                  </el-button>
                </el-tooltip>
                <el-button v-if="detail.isCollect" type="warning" :icon="Star" round @click="askUncollect">
                  已收藏
                </el-button>
                <el-button v-else type="warning" :icon="Star" plain round @click="collect">
                  收藏
                </el-button>
              </div>
            </div>
            <div class="flex jb ac">
              <div class="size20 gray">
                <template v-if="isMine">
                  {{ progress.doneCount ?? 0 }} / {{ progress.total ?? lessons.length }} 课程
                </template>
                <template v-else>
                  共 {{ detail.courseNum ?? lessons.length }} 个课程
                  <template v-if="detail.humanNum"> · {{ detail.humanNum }} 人已学</template>
                  <template v-if="detail.heat"> · 热度 {{ detail.heat }}</template>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isMine" class="box themeCard flex ac wrap mb30">
          <el-tag type="success" round>学习：{{ studyTimeText }}</el-tag>
          <el-tag round class="ml20 mr20">最近：{{ detail.lastStudyTime || "未开始" }}</el-tag>
          <div class="progress">
            <el-progress :percentage="Number(progress.percentage || 0)" :stroke-width="15" />
          </div>
        </div>

        <el-row :gutter="10">
          <el-col
            v-for="(course, index) in lessons"
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
              :class="{ act: isMine && course.lastTime }"
              @click="openPractice(course)"
            >
              <div class="flex ac">
                <div class="size26 line1 flex1 mr20 bold6">{{ course.name }}</div>
                <template v-if="isMine">
                  <el-tag v-if="course.lastTime" type="primary" size="small" effect="light" round>
                    最近练习
                  </el-tag>
                  <template v-else>
                    <el-tag
                      v-if="course.timeSeconds && Number(course.doneNum) > 0"
                      type="success"
                      size="small"
                      effect="plain"
                      round
                    >
                      已完成练习
                    </el-tag>
                    <el-tag
                      v-else-if="course.timeSeconds"
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
                    :class="{ mainColor: isMine && course.timeSeconds && !course.lastTime }"
                  >
                    <div class="img20 mr5">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div>练习时长：{{ formatPracticeMinutes(course.timeSeconds) }}</div>
                  </div>
                  <div v-if="isMine" :class="{ green: Number(course.doneNum) > 0 && !course.lastTime }">
                    ✓ 已完成{{ course.doneNum || 0 }}次
                  </div>
                  <div v-if="course.wordCount" class="ml20 opc6">{{ course.wordCount }} 词</div>
                </div>
                <div class="size30 opc6">#{{ index + 1 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-empty v-if="lessons.length === 0" description="暂无课程" />
        <div class="gap30" />
      </div>
    </div>
    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Clock, Star, VideoPlay } from "@element-plus/icons-vue";
import {
  fetchLessonDetails,
  toggleCollect,
  type CourseDetailVo,
  type CourseLessonVo,
} from "@/api/course";
import { getToken } from "@/api/token";
import ModePop from "@/components/ModePop.vue";
import { isPhone } from "@/composables/useLayout";
import { saveGameInfo } from "@/composables/useGame";
import { localAsset } from "@/data/mall";
import { formatPracticeMinutes } from "@/lib/time";

const route = useRoute();
const router = useRouter();
const modeRef = ref<{ open: () => void } | null>(null);
const detail = ref<CourseDetailVo | undefined>();
const loading = ref(false);

const courseId = computed(() => String(route.params.courseId || route.params.id || ""));
const isMine = computed(() => Boolean(detail.value?.isHave || detail.value?.userLessonId));
const cover = computed(() => localAsset(detail.value?.cover || "") || "/clone-assets/ico.png");
const lessons = computed<CourseLessonVo[]>(() => detail.value?.lessons || []);
const progress = computed(() => ({
  doneCount: 0,
  total: lessons.value.length,
  percentage: 0,
  ...(detail.value?.progress || {}),
}));
const accessAllowed = computed(() => detail.value?.access?.allowed !== false);
const accessText = computed(() => {
  const reason = detail.value?.access?.reason;
  if (!reason) return "";
  const labels: Record<string, string> = {
    NEED_MEMBER: "会员课程",
    NEED_LOGIN: "需登录后学习",
    NEED_BUY: "需购买后学习",
  };
  return labels[reason] || reason;
});
const continueLesson = computed<CourseLessonVo | undefined>(() => {
  const list = lessons.value;
  return (
    list.find((item) => item.lastTime) ||
    (detail.value?.lastLessonId
      ? list.find((item) => String(item.id) === String(detail.value?.lastLessonId))
      : undefined) ||
    list[0]
  );
});
const studyTimeText = computed(() => formatPracticeMinutes(detail.value?.timeSeconds));

function goMall() {
  void router.push("/courseMall/index");
}

async function load() {
  detail.value = undefined;
  loading.value = true;
  try {
    const data = await fetchLessonDetails(courseId.value);
    if (data?.id || data?.name || data?.lessons?.length) detail.value = data;
  } catch {
    detail.value = undefined;
  } finally {
    loading.value = false;
  }
  await maybeResumeStart();
}

function startPractice(course?: CourseLessonVo) {
  if (!course || !detail.value) return;
  if (!accessAllowed.value) {
    if (!getToken()) {
      void askLogin(course.id);
      return;
    }
    ElMessage.info(accessText.value ? `该课程为${accessText.value}，暂无法学习` : "暂无法学习该课程");
    return;
  }
  const userLessonId = detail.value.userLessonId;
  saveGameInfo({
    courseId: String(detail.value.id),
    chapterId: String(course.id),
    gameTitle: course.name,
    courseName: detail.value.name || "",
    gameType: "Sentence",
    gameMode: "SentenceTranslate",
    userLessonId: userLessonId ? String(userLessonId) : "",
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

function openPractice(course?: CourseLessonVo) {
  if (!course) return;
  if (!getToken()) {
    void askLogin(course.id);
    return;
  }
  startPractice(course);
}

async function collect() {
  if (!detail.value) return;
  if (!getToken()) {
    await askLogin();
    return;
  }
  try {
    await toggleCollect(detail.value.id);
    detail.value.isCollect = true;
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
  if (!detail.value) return;
  try {
    await toggleCollect(detail.value.id);
    detail.value.isCollect = false;
    ElMessage.success("已取消收藏");
  } catch {
    /* unwrap 已提示 */
  }
}

async function maybeResumeStart() {
  const startId = String(route.query.start || "");
  if (!startId || !getToken()) return;
  const course = lessons.value.find((item) => String(item.id) === startId);
  if (course) startPractice(course);
  const query = { ...route.query };
  delete query.start;
  await router.replace({ path: route.path, query });
}

watch(courseId, () => {
  void load();
}, { immediate: true });
</script>
