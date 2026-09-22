<template>
  <div class="contentBox planPage">
    <header class="spHead flex jb ac">
      <div class="spHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="spMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="spTitle">学习计划</div>
      </div>
      <UserDropdown />
    </header>

    <div ref="bodyRef" class="planBody" @scroll="onScroll">
      <!-- 三张统计卡（设计稿：120 高、圆角 12、间距 10） -->
      <div class="spStats">
        <div v-for="card in statCards" :key="card.key" class="spStat flex ac">
          <span class="spStatIcon" :class="card.iconClass">
            <img :src="card.icon" :class="card.imgClass" alt="" />
          </span>
          <div class="spStatText">
            <div class="spStatNum" :class="card.tone">{{ card.value }}</div>
            <div class="spStatLabel">{{ card.label }}</div>
          </div>
        </div>
      </div>

      <!-- 页签卡：白底 40 高，激活项蓝色文字 + 下划线 -->
      <div class="spTabsCard">
        <el-tabs v-model="tab" class="spTabs">
          <el-tab-pane v-for="item in TABS" :key="item.name" :label="item.label" :name="item.name" />
        </el-tabs>
      </div>

      <el-skeleton v-if="loading" animated>
        <template #template>
          <div class="spList">
            <div v-for="n in 4" :key="n" class="spRow flex ac">
              <el-skeleton-item variant="image" class="spSkeletonCover" />
              <div class="spInfo flex col">
                <el-skeleton-item variant="text" class="spSkeletonName" />
                <el-skeleton-item variant="text" class="spSkeletonMeta" />
                <el-skeleton-item variant="text" class="spSkeletonBar" />
              </div>
              <el-skeleton-item variant="button" class="spSkeletonBtn" />
            </div>
          </div>
        </template>
      </el-skeleton>

      <div v-else-if="rows.length" class="spList">
        <div
          v-for="item in rows"
          :key="item.courseId"
          class="spRow flex ac hand"
          @click="openCourse(item)"
        >
          <el-image class="spCover" :src="localAsset(item.cover) || undefined" fit="cover" lazy>
            <template #error>
              <div class="spCoverFallback flex ac jc">
                <el-icon class="img40"><Picture /></el-icon>
              </div>
            </template>
          </el-image>

          <div class="spInfo flex col">
            <div class="spName line1">{{ item.name }}</div>
            <div class="spMeta line1">
              <span>课程：共{{ item.totalCount }}{{ unitText(item) }}</span>
              <i class="spMetaSep">｜</i>
              <span>最近学习：{{ studyTimeText(item.lastStudyTime) }}</span>
            </div>
            <el-progress
              class="spBar"
              :percentage="item.progress"
              :stroke-width="10"
              :show-text="false"
              color="#00c26d"
            />
            <div class="spFoot">
              已学{{ item.doneCount }}/{{ item.totalCount }}{{ unitText(item) }} {{ item.progress }}%
            </div>
          </div>

          <el-button
            class="spBtn"
            :class="item.status === 2 ? 'spBtnReview' : 'spBtnGo'"
            @click.stop="openCourse(item)"
          >
            {{ item.status === 2 ? "复习" : "继续学习" }}
          </el-button>
        </div>

        <!-- 数据全部渲染完 + 到底了：底部提示 -->
        <div v-if="showEnd" class="listEnd flex ac jc">已经到底了</div>
      </div>

      <div v-else class="spEmpty flex col ac jc">
        <img class="spEmptyImg" src="/clone-assets/collect/empty.png" alt="" />
        <div class="spEmptyText">{{ emptyText }}</div>
        <el-button v-if="loggedIn" class="mt20" type="primary" plain @click="goMall">
          去课程广场
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Picture } from "@element-plus/icons-vue";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  fetchLessonDetails,
  fetchStudyPlanLessons,
  fetchStudyPlanList,
  fetchStudyPlanSummary,
  unwrapLegacyStudyPlanList,
  unwrapStudyPlanList,
  type StudyPlanRow,
  type StudyPlanSummary,
} from "@/api/course";
import { fetchHomeStats } from "@/api/home";
import { getToken } from "@/api/token";
import { ensureLogin, isLoggedIn } from "@/composables/useAuth";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import { localAsset } from "@/data/mall";
import { formatDurationParts, formatStudyTime } from "@/lib/time";

type TabName = "all" | "doing" | "done";

const TABS: { name: TabName; label: string }[] = [
  { name: "all", label: "全部" },
  { name: "doing", label: "进行中" },
  { name: "done", label: "已完成" },
];

const router = useRouter();
const tab = ref<TabName>("all");
const bodyRef = ref<HTMLElement>();
/** 当前页签的列表（status 由服务端过滤；旧接口兜底时前端过滤） */
const rows = ref<StudyPlanRow[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const finished = ref(false);
const summary = ref<StudyPlanSummary>({ studyingCount: 0, doneCount: 0, totalSeconds: 0 });
const loggedIn = isLoggedIn;

const pageSize = 30;
let current = 1;
let requestSeq = 0;

/** 页签 → 接口 status：全部=不传、进行中=1、已完成=2 */
const statusParam = computed(() => (tab.value === "doing" ? 1 : tab.value === "done" ? 2 : undefined));

/** 单词集课的数量单位是「词」，其余是「课时」 */
function unitText(item: StudyPlanRow) {
  return item.wordCourse ? "词" : "课时";
}

/** 「最近学习」文案；从未学过显示「还未开始」 */
function studyTimeText(value: string | null) {
  return formatStudyTime(value) || "还未开始";
}

/** 总学习时长：汇总接口直接给秒数，前端格式化成 5h（不足 1 小时显示分钟） */
const studyTimeLabel = computed(() => {
  const { hours, minutes } = formatDurationParts(summary.value.totalSeconds);
  return hours > 0 ? `${hours}h` : `${minutes}m`;
});

const statCards = computed(() => [
  {
    key: "studying",
    label: "在学项目",
    value: String(summary.value.studyingCount),
    tone: "isBlue",
    icon: "/clone-assets/plan/icon-project.png",
    iconClass: "spStatIconBlue",
    imgClass: "spStatImgBlue",
  },
  {
    key: "finished",
    label: "已完成",
    value: String(summary.value.doneCount),
    tone: "isGreen",
    icon: "/clone-assets/plan/icon-done.png",
    iconClass: "spStatIconGreen",
    imgClass: "spStatImgGreen",
  },
  {
    key: "duration",
    label: "总学习时长",
    value: studyTimeLabel.value,
    tone: "isOrange",
    icon: "/clone-assets/plan/icon-time.png",
    iconClass: "spStatIconOrange",
    imgClass: "spStatImgOrange",
  },
]);

/** 列表到底且数据都渲染完了，底部给一句提示 */
const showEnd = computed(
  () => !loading.value && !loadingMore.value && finished.value && rows.value.length > 0,
);

const emptyText = computed(() => {
  if (!loggedIn.value) return "登录后可以查看你的学习计划";
  if (tab.value === "done") return "还没有学完的课程，继续加油";
  if (tab.value === "doing") return "没有进行中的课程，去课程广场挑一门吧";
  return "这里空空的，还没有加入学习计划";
});

function goMall() {
  void router.push("/courseMall/index");
}

/**
 * 点整行 / 点按钮都进课程详情，并按接口文档带上起点：
 * - 进行中（status=1）：从课程详情的 lastLessonId（最近练的那一章）接着学
 * - 已完成（status=2）：从第一章开始复习
 * 详情拿不到就退化成直接进详情页，不挡跳转。
 */
async function openCourse(item: StudyPlanRow) {
  // 会员课且当前不是会员：按项目里既有的处理方式提示，不跳转
  if (item.access?.allowed === false) {
    ElMessage.info(
      item.access.reason === "NEED_MEMBER" ? "该课程为会员内容，暂无法学习" : "暂无法学习该课程",
    );
    return;
  }
  if (item.wordCourse) {
    // 单词集课走单词库详情（续学落点由单词轨的 lastId/lastPage 决定）
    void router.push(`/words/${item.courseId}`);
    return;
  }
  try {
    const detail = await fetchLessonDetails(item.courseId);
    const lessons = detail?.lessons || [];
    const start = item.status === 2 ? lessons[0]?.id : (detail?.lastLessonId ?? lessons[0]?.id);
    if (start) {
      void router.push(`/courseMall/${item.courseId}?start=${String(start)}`);
      return;
    }
  } catch {
    /* 详情拿不到就直接进详情页 */
  }
  void router.push(`/courseMall/${item.courseId}`);
}

/** 新接口 404（后端还没部署）时的兜底：旧的句子轨接口一次取完，再按页签本地过滤 */
async function loadLegacyRows() {
  const collected: StudyPlanRow[] = [];
  let page = 1;
  while (page <= 20) {
    const result = unwrapLegacyStudyPlanList(
      await fetchStudyPlanLessons({ page, limit: 50 }),
    );
    if (!result.items.length) break;
    collected.push(...result.items);
    if (result.total != null && collected.length >= result.total) break;
    if (result.items.length < 50) break;
    page += 1;
  }
  return collected;
}

/** 统计卡：优先新汇总接口；接口不在时用旧口径兜底 */
async function loadSummary() {
  try {
    summary.value = await fetchStudyPlanSummary({ silent: true });
  } catch {
    try {
      const [legacy, stats] = await Promise.all([
        loadLegacyRows(),
        fetchHomeStats().catch(() => null),
      ]);
      summary.value = {
        studyingCount: legacy.length,
        doneCount: legacy.filter((row) => row.status === 2).length,
        totalSeconds: Number(stats?.total_seconds ?? 0) || 0,
      };
    } catch {
      /* 旧的也拿不到就保持 0，列表那边会给出提示 */
    }
  }
}

async function loadList(reset = false) {
  if (!getToken()) {
    rows.value = [];
    finished.value = true;
    loading.value = false;
    loadingMore.value = false;
    return;
  }
  if (!reset && (loading.value || loadingMore.value || finished.value)) return;
  const seq = ++requestSeq;
  if (reset) {
    current = 1;
    finished.value = false;
    rows.value = [];
    loading.value = true;
  } else {
    loadingMore.value = true;
  }
  try {
    const result = await fetchStudyPlanList(
      { status: statusParam.value, page: current, limit: pageSize },
      { silent: true },
    );
    if (seq !== requestSeq) return;
    const page = unwrapStudyPlanList(result);
    rows.value = reset ? page.items : [...rows.value, ...page.items];
    if (page.items.length < pageSize || (page.total != null && rows.value.length >= page.total)) {
      finished.value = true;
    }
    current += 1;
  } catch {
    if (seq !== requestSeq) return;
    // 新接口还没上线 → 退回旧的句子轨接口（前端按 status 过滤），一次取完
    if (reset) {
      try {
        const legacy = await loadLegacyRows();
        if (seq !== requestSeq) return;
        const status = statusParam.value;
        rows.value = status ? legacy.filter((row) => row.status === status) : legacy;
      } catch {
        rows.value = [];
      }
    }
    finished.value = true;
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
      loadingMore.value = false;
      ensureFill();
    }
  }
}

function onScroll() {
  const el = bodyRef.value;
  if (!el || loading.value || loadingMore.value || finished.value) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
    void loadList();
  }
}

function ensureFill() {
  const el = bodyRef.value;
  if (!el || loading.value || loadingMore.value || finished.value) return;
  if (el.scrollHeight <= el.clientHeight) void loadList();
}

/** 切换页签：回到顶部 + 按 status 重新拉列表（汇总卡不受页签影响，不用重拉） */
watch(tab, () => {
  bodyRef.value?.scrollTo({ top: 0 });
  void loadList(true).then(ensureFill);
});

async function boot() {
  if (!getToken()) {
    rows.value = [];
    loading.value = false;
    await ensureLogin();
    if (!getToken()) return;
  }
  await Promise.all([loadList(true), loadSummary()]);
}

onMounted(() => {
  void boot();
});
</script>
