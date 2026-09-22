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

    <div class="planBody">
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
          :key="item.id"
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
              <span>课程：共{{ lessonCount(item) }}课时</span>
              <i v-if="item.lastStudyTime" class="spMetaSep">｜</i>
              <span v-if="item.lastStudyTime">最近学习：{{ item.lastStudyTime }}</span>
            </div>
            <el-progress
              class="spBar"
              :percentage="item.progress"
              :stroke-width="10"
              :show-text="false"
              color="#00c26d"
            />
            <div class="spFoot">
              已学{{ item.courseDoneCount }}/{{ item.courseCount }}课时 {{ item.progress }}%
            </div>
          </div>

          <el-button
            class="spBtn"
            :class="isDone(item) ? 'spBtnReview' : 'spBtnGo'"
            @click.stop="openCourse(item)"
          >
            {{ isDone(item) ? "复习" : "继续学习" }}
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
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Picture } from "@element-plus/icons-vue";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  fetchStudyPlanLessons,
  unwrapStudyPlanLessons,
  type StudyPlanLessonItem,
} from "@/api/course";
import { fetchHomeStats } from "@/api/home";
import { getToken } from "@/api/token";
import { ensureLogin, isLoggedIn } from "@/composables/useAuth";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import { localAsset } from "@/data/mall";
import { formatDurationParts } from "@/lib/time";

type TabName = "all" | "doing" | "done";

const TABS: { name: TabName; label: string }[] = [
  { name: "all", label: "全部" },
  { name: "doing", label: "进行中" },
  { name: "done", label: "已完成" },
];

const router = useRouter();
const tab = ref<TabName>("all");
const items = ref<StudyPlanLessonItem[]>([]);
const loading = ref(true);
const totalSeconds = ref(0);
const loggedIn = isLoggedIn;

let requestSeq = 0;

/** 已完成：章节全部学完（进度 100%） */
function isDone(item: StudyPlanLessonItem) {
  return item.courseCount > 0 && item.progress >= 100;
}

/** 副标题里的课时数：优先课程卡片的 courseNum，退化到章节总数 */
function lessonCount(item: StudyPlanLessonItem) {
  return item.courseNum || item.courseCount || 0;
}

const doneCount = computed(() => items.value.filter(isDone).length);

/** 总学习时长：口径与首页「累计学习时长」一致（/index/user_count） */
const studyTimeText = computed(() => {
  const { hours, minutes } = formatDurationParts(totalSeconds.value);
  return hours > 0 ? `${hours}h` : `${minutes}m`;
});

const statCards = computed(() => [
  {
    key: "studying",
    label: "在学项目",
    value: String(items.value.length),
    tone: "isBlue",
    icon: "/clone-assets/plan/icon-project.png",
    iconClass: "spStatIconBlue",
    imgClass: "spStatImgBlue",
  },
  {
    key: "finished",
    label: "已完成",
    value: String(doneCount.value),
    tone: "isGreen",
    icon: "/clone-assets/plan/icon-done.png",
    iconClass: "spStatIconGreen",
    imgClass: "spStatImgGreen",
  },
  {
    key: "duration",
    label: "总学习时长",
    value: studyTimeText.value,
    tone: "isOrange",
    icon: "/clone-assets/plan/icon-time.png",
    iconClass: "spStatIconOrange",
    imgClass: "spStatImgOrange",
  },
]);

const rows = computed(() =>
  items.value.filter((item) => {
    if (tab.value === "done") return isDone(item);
    if (tab.value === "doing") return !isDone(item);
    return true;
  }),
);

/** 列表到底且数据都渲染完了（学习计划一次把分页取完），底部给一句提示 */
const showEnd = computed(() => !loading.value && rows.value.length > 0);

const emptyText = computed(() => {
  if (!loggedIn.value) return "登录后可以查看你的学习计划";
  if (tab.value === "done") return "还没有学完的课程，继续加油";
  if (tab.value === "doing") return "没有进行中的课程，去课程广场挑一门吧";
  return "这里空空的，还没有加入学习计划";
});

function goMall() {
  void router.push("/courseMall/index");
}

function openCourse(item: StudyPlanLessonItem) {
  void router.push(`/courseMall/${item.courseId}`);
}

const pageSize = 50;

async function loadList() {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const first = unwrapStudyPlanLessons(await fetchStudyPlanLessons({ page: 1, limit: pageSize }));
    if (seq !== requestSeq) return;
    items.value = first.items;
    const total = first.total;
    // 统计卡要准确，剩余分页在首屏之后顺序补齐（学习计划条数很少）
    let page = 2;
    while ((total == null || items.value.length < total) && page <= 20) {
      const next = unwrapStudyPlanLessons(
        await fetchStudyPlanLessons({ page, limit: pageSize }),
      );
      if (seq !== requestSeq) return;
      if (!next.items.length) break;
      items.value.push(...next.items);
      page += 1;
    }
  } catch {
    if (seq === requestSeq) items.value = [];
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}

async function loadDuration() {
  try {
    const stats = await fetchHomeStats();
    totalSeconds.value = Number(stats.total_seconds) || 0;
  } catch {
    totalSeconds.value = 0;
  }
}

async function boot() {
  if (!getToken()) {
    items.value = [];
    loading.value = false;
    await ensureLogin();
    if (!getToken()) return;
  }
  await Promise.all([loadList(), loadDuration()]);
}

onMounted(() => {
  void boot();
});
</script>
