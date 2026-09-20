<template>
  <div class="contentBox cdPage">
    <div class="cdBody">
      <!-- 骨架屏：与真实卡片同尺寸 -->
      <el-skeleton v-if="loading" animated>
        <template #template>
          <section class="cdHead flex">
            <el-skeleton-item variant="image" class="cdSkeletonCover" />
            <div class="cdInfo flex col">
              <el-skeleton-item variant="text" class="cdSkeletonTitle" />
              <el-skeleton-item variant="text" class="cdSkeletonDesc" />
              <div class="cdTags flex ac">
                <el-skeleton-item variant="button" class="cdSkeletonTag" />
                <el-skeleton-item variant="button" class="cdSkeletonTag" />
              </div>
              <el-skeleton-item variant="text" class="cdSkeletonBar" />
            </div>
          </section>
          <section class="cdLessons">
            <h2 class="cdLessonsTitle">课时列表</h2>
            <ul class="cdList">
              <li v-for="n in 8" :key="n" class="cdLesson flex ac">
                <el-skeleton-item variant="circle" class="cdSkeletonNo" />
                <el-skeleton-item variant="text" class="cdSkeletonLesson" />
              </li>
            </ul>
          </section>
        </template>
      </el-skeleton>

      <template v-else-if="detail">
        <section class="cdHead flex">
          <div class="cdCover">
            <el-image class="cdCoverImg" :src="cover" fit="cover" />
          </div>
          <div class="cdInfo flex col">
            <h1 class="cdTitle line1">{{ detail.name }}</h1>
            <p v-if="detail.description" class="cdDesc line1">{{ detail.description }}</p>
            <div v-if="tags.length" class="cdTags flex ac wrap">
              <span v-for="tag in tags" :key="tag" class="cdTag">{{ tag }}</span>
            </div>
            <div class="cdProgress flex ac">
              <div class="cdBar">
                <div class="cdBarFill" :style="{ width: `${percent}%` }" />
              </div>
              <span class="cdProgressText">已{{ doneCount }}/{{ totalCount }}课时</span>
            </div>
          </div>
          <button
            type="button"
            class="cdCollect flex ac jc"
            :class="{ 'is-on': detail.isCollect }"
            @click="toggleFav"
          >
            <svg class="cdHeart" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.1 4.9 13.3A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 7.1 6.2z" />
            </svg>
            {{ detail.isCollect ? "已收藏" : "加入收藏" }}
          </button>
        </section>

        <section class="cdLessons">
          <h2 class="cdLessonsTitle">课时列表</h2>
          <ul v-if="lessonRows.length" class="cdList">
            <li
              v-for="row in lessonRows"
              :key="row.id"
              class="cdLesson flex ac hand"
              @click="openPractice(row.lesson)"
            >
              <span class="cdLessonNo flex ac jc">{{ row.no }}</span>
              <span class="cdLessonName line1">{{ row.main }}</span>
              <span v-if="row.sub" class="cdLessonSub line1">{{ row.sub }}</span>
            </li>
          </ul>
          <div v-else class="cdEmpty">暂无课时</div>
        </section>
      </template>

      <div v-else class="cdMissing flex col ac jc">
        <img src="/clone-assets/nodata.png" class="cdMissingImg" alt="" />
        <div class="cdMissingText">没有找到这门课程</div>
        <el-button class="mt20" type="primary" round @click="goMall">返回课程广场</el-button>
      </div>
    </div>
    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  categoryNames,
  fetchLessonDetails,
  studyPlanLesson,
  toggleCollect,
  type CourseDetailVo,
  type CourseLessonVo,
} from "@/api/course";
import { getToken } from "@/api/token";
import ModePop from "@/components/ModePop.vue";
import { ensureLogin } from "@/composables/useAuth";
import { saveGameInfo } from "@/composables/useGame";
import { setPageCrumb } from "@/composables/usePageCrumb";
import { localAsset } from "@/data/mall";

const ACCESS_LABELS: Record<string, string> = {
  NEED_MEMBER: "会员课程",
  NEED_LOGIN: "需登录后学习",
  NEED_BUY: "需购买后学习",
};

const route = useRoute();
const router = useRouter();
const modeRef = ref<{ open: () => void } | null>(null);
const starting = ref(false);
const detail = ref<CourseDetailVo | undefined>();
const loading = ref(false);
let requestSeq = 0;

const courseId = computed(() => String(route.params.courseId || route.params.id || ""));
const isMine = computed(() => Boolean(detail.value?.isHave || detail.value?.userLessonId));
const cover = computed(() => localAsset(detail.value?.cover || "") || "/clone-assets/ico.png");
const lessons = computed<CourseLessonVo[]>(() => detail.value?.lessons || []);
/** 头部标签：课程分类（接口 categories，按数组顺序渲染） */
const tags = computed(() => categoryNames(detail.value).slice(0, 3));
/** 「已学 x/y 课时」：列表接口不下发进度，详情接口的 progress 才是准的 */
const totalCount = computed(
  () =>
    Number(detail.value?.progress?.total) ||
    Number(detail.value?.courseNum) ||
    lessons.value.length,
);
const doneCount = computed(() => Number(detail.value?.progress?.doneCount) || 0);
const percent = computed(() => {
  const raw = Number(detail.value?.progress?.percentage);
  if (Number.isFinite(raw) && raw > 0) return Math.min(100, Math.max(0, Math.round(raw)));
  return totalCount.value ? Math.round((doneCount.value / totalCount.value) * 100) : 0;
});
const access = computed(() => {
  const info = detail.value?.access;
  return {
    allowed: info?.allowed !== false,
    text: info?.reason ? ACCESS_LABELS[info.reason] || info.reason : "",
  };
});
/**
 * 课时行：设计稿一行是「序号 + 中文名 + 英文名」。
 * 接口只保证有 name（历史上会把中英文塞在一个字段里，用 › 或空格分隔），
 * 有 description 时优先用它当第二段。
 */
const lessonRows = computed(() =>
  lessons.value.map((lesson, index) => {
    const { main, sub } = splitLessonName(lesson.name);
    const description = String(lesson.description || "").trim();
    return {
      id: lesson.id,
      no: index + 1,
      lesson,
      main,
      sub: description && description !== main ? description : sub,
    };
  }),
);

function splitLessonName(name?: string) {
  const text = String(name || "").trim();
  const byMark = text.match(/^(.+?)\s*[›>]\s*(.+)$/);
  if (byMark) return { main: byMark[1].trim(), sub: byMark[2].trim() };
  const bySpace = text.match(/^([^A-Za-z0-9]+?)\s+([A-Za-z0-9][\s\S]*)$/);
  if (bySpace) return { main: bySpace[1].trim(), sub: bySpace[2].trim() };
  return { main: text, sub: "" };
}

function goMall() {
  void router.push("/courseMall/index");
}

function isValidDetail(data?: CourseDetailVo): data is CourseDetailVo {
  return Boolean(data && (data.id || data.name || data.lessons?.length));
}

async function load() {
  const seq = ++requestSeq;
  detail.value = undefined;
  loading.value = true;
  try {
    const data = await fetchLessonDetails(courseId.value);
    if (seq !== requestSeq) return;
    detail.value = isValidDetail(data) ? data : undefined;
    setPageCrumb(detail.value?.name);
  } catch {
    if (seq === requestSeq) {
      detail.value = undefined;
      setPageCrumb("");
    }
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
      await maybeResumeStart();
    }
  }
}

async function confirmBox(message: string, title = "提示") {
  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
      closeOnClickModal: false,
    });
    return true;
  } catch {
    return false;
  }
}

function startPractice(course?: CourseLessonVo) {
  const current = detail.value;
  if (!course || !current) return;
  saveGameInfo({
    courseId: String(current.id),
    chapterId: String(course.id),
    gameTitle: course.name,
    courseName: current.name || "",
    gameType: "Sentence",
    gameMode: "SentenceTranslate",
    userLessonId: current.userLessonId ? String(current.userLessonId) : "",
    source: "course",
  });
  modeRef.value?.open();
}

async function openPractice(course?: CourseLessonVo) {
  if (!course || starting.value) return;
  if (!getToken()) {
    await ensureLogin({ chapterId: course.id });
    return;
  }
  if (!access.value.allowed) {
    ElMessage.info(access.value.text ? `该课程为${access.value.text}，暂无法学习` : "暂无法学习该课程");
    return;
  }
  if (!isMine.value) {
    starting.value = true;
    try {
      const data = await studyPlanLesson(courseId.value);
      if (detail.value) {
        detail.value.isHave = true;
        if (data?.userLessonId != null) detail.value.userLessonId = data.userLessonId;
        if (data?.userWordId != null) detail.value.userWordId = data.userWordId;
      }
    } catch {
      return;
    } finally {
      starting.value = false;
    }
  }
  startPractice(course);
}

async function setCollect(next: boolean) {
  const current = detail.value;
  if (!current || (next && current.isCollect)) return;
  if (!getToken()) {
    await ensureLogin();
    return;
  }
  if (!next && !(await confirmBox("确定要取消收藏吗？"))) return;
  try {
    await toggleCollect(current.id);
    current.isCollect = next;
    ElMessage.success(next ? "已添加到我的收藏" : "已取消收藏");
  } catch {
    /* unwrap 已提示 */
  }
}

/** 头部按钮：未收藏 → 加入收藏；已收藏 → 再点取消 */
function toggleFav() {
  void setCollect(!detail.value?.isCollect);
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

watch(
  courseId,
  () => {
    void load();
  },
  { immediate: true },
);

onUnmounted(() => setPageCrumb(""));
</script>
