<template>
  <div class="contentBox dashPage" style="padding-top: 0;padding-left: 0;padding-right: 0;">
    <header class="dashHead" style="background: white;height: 60px;">
      <div class="dashTabs" style="padding-left: 20px;">
        <el-button
          v-for="tab in studyTabs"
          :key="tab.value"
          :type="studyTab === tab.value ? 'primary' : 'default'"
          round
          @click="changeStudyTab(tab.value)"
        >
          {{ tab.name }}
        </el-button>
      </div>
      <el-dropdown trigger="click">
        <button type="button" class="dashUser">
          <el-image class="dashUserAvatar" :src="avatarUrl" fit="cover" />
          <span class="dashUserName">{{ displayName }}</span>
          <el-icon><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="toggleTheme">
              {{ isDark ? "白天模式" : "夜间模式" }}
            </el-dropdown-item>
            <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </header>

    <div style="padding-top: 16px;padding-left: 24px;padding-right: 24px;">
      <section class="  dashCards" >
        <article v-for="card in metricCards" :key="card.label" class="dashCard" :class="card.tone">
          <div class="dashCardBody">
            <div class="dashCardLabel">{{ card.label }}</div>
            <div class="dashCardValue">{{ card.value }}</div>
            <el-button class="dashCardArrow" circle>
              <el-icon><Right /></el-icon>
            </el-button>
          </div>
          <img :src="card.icon" class="dashCardIcon" alt="" />
        </article>
      </section>

      <section class="dashStatsRow">
        <div class="dashPanel">
          <div class="dashPanelTitle">
            <el-icon class="dashPanelIcon isBlue"><Histogram /></el-icon>
            学习时长
          </div>
          <div class="dashDuration">
            <div v-for="item in durationCards" :key="item.label" class="dashDurationItem">
              <div class="dashDurationNum">
                <span>{{ item.hours }}</span>
                <small>小时</small>
                <span>{{ pad2(item.minutes) }}</span>
                <small>分</small>
              </div>
              <div class="dashDurationLabel">{{ item.label }}</div>
            </div>
          </div>
        </div>
        <div class="dashPanel">
          <div class="dashPanelTitle">
            <el-icon class="dashPanelIcon isCyan"><Opportunity /></el-icon>
            打卡统计
          </div>
          <div class="dashCheckStats">
            <div class="dashCheckStat">
              <div class="dashCheckNum">{{ Number(checkInStat.currentStreak || 0) }}<small>天</small></div>
              <div class="dashDurationLabel">连续打卡</div>
            </div>
            <div class="dashCheckStat">
              <div class="dashCheckNum">{{ Number(checkInStat.maxStreak || 0) }}<small>天</small></div>
              <div class="dashDurationLabel">最高连续打卡</div>
            </div>
            <div class="dashCheckStat">
              <div class="dashCheckNum">{{ Number(checkInStat.totalCheckIn || 0) }}<small>天</small></div>
              <div class="dashDurationLabel">累计打卡</div>
            </div>
          </div>
        </div>
      </section>

      <section class="dashCheckin">
        <img src="/clone-assets/home/checkin-hero.png" class="dashCheckinHero" alt="" />
        <div class="dashPanelTitle">
          <el-icon class="dashPanelIcon isBlue"><Calendar /></el-icon>
          今日打卡
        </div>
        <div class="dashCheckinMain">
          <div class="dashCheckinDate">
            <div class="dashCheckinMonth">{{ signMonth }}</div>
            <div class="dashCheckinDay">{{ pad2(signDay) }}</div>
            <div class="dashCheckinHint">学习打卡</div>
          </div>
          <div class="dashCheckinInfo">
            <div class="dashCheckinLine">
              <el-icon class="isOk"><CircleCheckFilled /></el-icon>
              <span>完成 <em>20分钟</em> 学习即可打卡</span>
            </div>
            <div class="dashCheckinLine">
              <el-icon class="isBlue"><User /></el-icon>
              <span>
              已有
              <em>{{ Number(homeIndex.all_check_in || 0).toLocaleString() }}</em>
              人打卡
            </span>
            </div>
            <div class="dashCheckinLine">
              <el-icon class="isGold"><Trophy /></el-icon>
              <span>
              累计打卡
              <em>{{ Number(checkInStat.totalCheckIn || 0) }}</em>
              天
            </span>
            </div>
            <el-button
                class="dashCheckinBtn"
                type="primary"
                :disabled="checkedIn || signProgress < 100"
                @click="doClockIn"
            >
              {{ checkedIn ? "已打卡" : "今日打卡" }}
            </el-button>
          </div>
        </div>
      </section>

      <section class="dashChart">
        <div class="dashPanelTitle">
          <el-icon class="dashPanelIcon isBlue"><Timer /></el-icon>
          每日学习时长
        </div>
        <div class="dashChartBody">
          <div class="dashChartAxis">
            <span
              v-for="tick in chartTicks"
              :key="tick.value"
              class="dashChartTick"
              :style="{ top: `${tick.pos}%` }"
            >{{ tick.value }}min</span>
          </div>
          <div class="dashChartBars">
            <el-tooltip
                v-for="item in weekDays"
                :key="item.label"
                :content="`${item.minutes}min`"
                placement="top"
            >
              <div class="dashChartCol">
                <div class="dashChartTrack">
                  <div
                      v-if="item.minutes > 0 && item.peak"
                      class="dashChartTip"
                      :style="{ bottom: `calc(${item.percent}% + 6px)` }"
                  >
                    {{ item.minutes }}min
                  </div>
                  <div
                      class="dashChartBar"
                      :class="{ isToday: item.isToday, isPeak: item.peak }"
                      :style="{ height: `${item.percent}%` }"
                  />
                </div>
                <div class="dashChartLabel">{{ item.label }}</div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </section>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ArrowDown,
  Right,
  Calendar,
  CircleCheckFilled,
  Histogram,
  Opportunity,
  Timer,
  Trophy,
  User,
} from "@element-plus/icons-vue";
import {
  clockIn,
  fetchCheckInStatInfo,
  fetchDateHot,
  fetchHomeIndex,
  fetchHomeStats,
  fetchStudyCount,
  fetchStudyNum,
  type HomeIndex,
  type HomeStats,
  type StudyCount,
  type StudyNum,
} from "@/api/home";
import { avatarUrl, displayName, logout } from "@/composables/useAuth";
import { isDark, toggleTheme } from "@/composables/useTheme";
import { currentYearMonth, formatDurationParts } from "@/lib/time";

const studyTabs = [
  { name: "今天", value: 1 },
  { name: "昨天", value: 2 },
  { name: "本周", value: 3 },
  { name: "本月", value: 4 },
];

const router = useRouter();
const studyTab = ref(1);
const studyNum = ref<StudyNum>({});
const studyCount = ref<StudyCount>({});
const stats = ref<HomeStats>({});
const homeIndex = ref<HomeIndex>({});
const checkInStat = ref<{ currentStreak?: number; maxStreak?: number; totalCheckIn?: number }>({});
const weekDays = ref<
  { label: string; minutes: number; percent: number; isToday: boolean; peak: boolean }[]
>([]);

const checkedIn = computed(() => Boolean(homeIndex.value.today_is_check_in));
const signProgress = computed(() => {
  const today = Number(homeIndex.value.today_time || stats.value.today_seconds || 0);
  return Math.min(100, Math.floor((today / 1200) * 10000) / 100);
});

const now = new Date();
const signDay = now.getDate();
const signMonth = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"][now.getMonth()];

const metricCards = computed(() => [
  {
    label: "完成句子数",
    value: Number(studyNum.value.sentence_num || 0),
    icon: "/clone-assets/home/card-sentence.png",
    tone: "purple",
  },
  {
    label: "完成单词数",
    value: Number(studyNum.value.word_num || 0),
    icon: "/clone-assets/home/card-word.png",
    tone: "mint",
  },
  {
    label: "不熟悉句子",
    value: Number(studyCount.value.strange_word || 0),
    icon: "/clone-assets/home/card-strange-sentence.png",
    tone: "pink",
  },
  {
    label: "已掌握句子",
    value: Number(studyCount.value.exercise_grasp || 0),
    icon: "/clone-assets/home/card-grasp-sentence.png",
    tone: "green",
  },
  {
    label: "不熟悉单词",
    value: Number(studyCount.value.word_strange_word || 0),
    icon: "/clone-assets/home/card-strange-word.png",
    tone: "orange",
  },
  {
    label: "已掌握单词",
    value: Number(studyCount.value.grasp_word || 0),
    icon: "/clone-assets/home/card-grasp-word.png",
    tone: "blue",
  },
]);

const durationCards = computed(() => [
  { label: "累计学习时长", ...formatDurationParts(stats.value.total_seconds) },
  { label: "今日学习时长", ...formatDurationParts(stats.value.today_seconds) },
  { label: "本月学习时长", ...formatDurationParts(stats.value.month_seconds) },
]);

function chartTop(list: { minutes: number }[]) {
  return Math.ceil(Math.max(...list.map((item) => item.minutes), 0) / 10) * 10;
}

const chartTicks = computed(() => {
  const top = chartTop(weekDays.value);
  if (!top) return [{ value: 0, pos: 100 }];
  return [top, Math.round(top * 0.75), Math.round(top * 0.5), Math.round(top * 0.25), 0].map((value, index) => ({
    value,
    pos: index * 25,
  }));
});

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function onLogout() {
  logout();
  void router.push("/login/index");
}

async function changeStudyTab(value: number) {
  if (studyTab.value === value) return;
  studyTab.value = value;
  studyNum.value = await fetchStudyNum(value);
}

async function loadWeekChart() {
  const month = currentYearMonth();
  const list = (await fetchDateHot(month)) || [];
  const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
  const mapped = labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    const hit = list.find((item) => {
      const raw = String(item.date || "").slice(0, 10);
      return raw === key || raw === key.slice(5);
    });
    const minutes = Math.round(Number(hit?.time || 0) / 60);
    return {
      label,
      minutes,
      percent: 0,
      isToday: date.toDateString() === today.toDateString(),
      peak: false,
    };
  });
  const top = chartTop(mapped);
  const peakIndex = mapped.reduce((best, item, index) => (item.minutes > mapped[best].minutes ? index : best), 0);
  weekDays.value = mapped.map((item, index) => ({
    ...item,
    percent: top > 0 ? Math.max(item.minutes > 0 ? 8 : 0, Math.round((item.minutes / top) * 100)) : 0,
    peak: index === peakIndex && mapped[peakIndex].minutes > 0,
  }));
}

async function doClockIn() {
  if (checkedIn.value || signProgress.value < 100) return;
  try {
    await clockIn();
    ElMessage.success("打卡成功");
    homeIndex.value = await fetchHomeIndex();
    stats.value = await fetchHomeStats();
  } catch {
    /* unwrap 已提示 */
  }
}

onMounted(async () => {
  const [numRes, countRes, indexRes, statsRes, checkinRes] = await Promise.allSettled([
    fetchStudyNum(1),
    fetchStudyCount(),
    fetchHomeIndex(),
    fetchHomeStats(),
    fetchCheckInStatInfo(),
  ]);
  if (numRes.status === "fulfilled") studyNum.value = numRes.value || {};
  if (countRes.status === "fulfilled") studyCount.value = countRes.value || {};
  if (indexRes.status === "fulfilled") homeIndex.value = indexRes.value || {};
  if (statsRes.status === "fulfilled") stats.value = statsRes.value || {};
  if (checkinRes.status === "fulfilled") checkInStat.value = checkinRes.value || {};
  await loadWeekChart();
});
</script>
