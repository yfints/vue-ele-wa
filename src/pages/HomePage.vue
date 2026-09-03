<template>
  <div class="contentBox">
    <div class="home">
      <div class="flex1 homeLeft">
        <div class="leftContent">
          <div class="flex1 flex col">
            <div class="homeNoticeBox mb10 flex ac">
              <img src="/clone-assets/home/notice.svg" class="img36 mr10" alt="" />
              <div class="homeNotice flex1">
                <div class="homeNotice line1">
                  <span class="noticeTitle bold6 size26">{{ noticeText }}</span>
                </div>
              </div>
            </div>

            <div class="homeStats flex1 flex col">
              <div class="flex ac size24">
                <div
                  v-for="(tab, index) in studyTabs"
                  :key="tab.name"
                  class="mr50 hand"
                  :class="studyTab === index ? 'act' : 'opc6'"
                  @click="changeStudyTab(index)"
                >
                  {{ tab.name }}
                </div>
              </div>
              <div class="flex3 mt20 topBox">
                <div class="flex1 box flex ac">
                  <div class="flex1 flex">
                    <div class="tc">
                      <div class="size26 opc6">完成句子数量</div>
                      <div class="mt10 flex ac jc">
                        <div class="size38 bold">{{ studyNum.sentence_num || 0 }}</div>
                        <span class="size28 ml5">个</span>
                      </div>
                    </div>
                  </div>
                  <img src="/clone-assets/home/stat-sentence.svg" class="img88 pic" alt="" />
                </div>
                <div class="flex1 box box1 flex ac">
                  <div class="flex1 flex">
                    <div class="tc">
                      <div class="size26 opc6">完成单词数量</div>
                      <div class="mt10 flex ac jc">
                        <div class="size38 bold">{{ studyNum.word_num || 0 }}</div>
                        <span class="size28 ml5">个</span>
                      </div>
                    </div>
                  </div>
                  <img src="/clone-assets/home/stat-word.svg" class="img88 pic" alt="" />
                </div>
              </div>
              <div class="flex2 mt20 txt">
                <div class="flex1 flex">
                  <div class="flex1 flex col jc ac tag hand">
                    <div class="mb5 size-20">句子错题本</div>
                    <div class="size28">
                      <el-statistic :value="Number(studyCount.error_subject || 0)" />
                    </div>
                  </div>
                  <div class="flex1 flex col jc ac tag ml10 mr10 hand">
                    <div class="mb5 size-20">不熟悉句子</div>
                    <div class="size28">
                      <el-statistic :value="Number(studyCount.strange_word || 0)" />
                    </div>
                  </div>
                  <div class="flex1 flex col jc ac tag hand">
                    <div class="mb5 size-20">已掌握句子</div>
                    <div class="size28">
                      <el-statistic :value="Number(studyCount.exercise_grasp || 0)" />
                    </div>
                  </div>
                </div>
                <div class="flex1 flex box1">
                  <div class="flex1 flex col jc ac tag hand">
                    <div class="mb5 size-20">单词错题本</div>
                    <div class="size28">
                      <el-statistic :value="Number(studyCount.error_word || 0)" />
                    </div>
                  </div>
                  <div class="flex1 flex col jc ac tag ml10 mr10 hand">
                    <div class="mb5 size-20">不熟悉单词</div>
                    <div class="size28">
                      <el-statistic :value="Number(studyCount.word_strange_word || 0)" />
                    </div>
                  </div>
                  <div class="flex1 flex col jc ac tag hand">
                    <div class="mb5 size-20">已掌握单词</div>
                    <div class="size28">
                      <el-statistic :value="Number(studyCount.grasp_word || 0)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="homeTime flex1 flex col">
              <div class="flex ac">
                <img src="/clone-assets/home/time.svg" class="img38 mr10" alt="" />
                <div class="size24">学习时长</div>
              </div>
              <div class="flex1 flex ast mt20">
                <div class="box flex1">
                  <div class="opc6">累计</div>
                  <div class="size24 mt20 tc">{{ formatHowLong(stats.total_seconds) }}</div>
                </div>
                <div class="box flex1 ml20 mr20">
                  <div class="opc6">今日</div>
                  <div class="size24 mt20 tc">{{ formatHowLong(stats.today_seconds) }}</div>
                </div>
                <div class="box flex1">
                  <div class="opc6">本月</div>
                  <div class="size24 mt20 tc">{{ formatHowLong(stats.month_seconds) }}</div>
                </div>
              </div>
              <div class="flex ac mt20">
                <img src="/clone-assets/home/checkin.svg" class="img38 mr10" alt="" />
                <div class="size24">打卡统计</div>
              </div>
              <div class="flex1 flex mt20">
                <div class="box flex1 flex col jc ac">
                  <div class="opc6">当前连续</div>
                  <div class="size28 mt10">
                    <el-statistic :value="Number(stats.current_streak || 0)" />
                  </div>
                </div>
                <div class="box flex1 flex col jc ac ml20 mr20">
                  <div class="opc6">最高连续</div>
                  <div class="size28 mt10">
                    <el-statistic :value="Number(stats.max_streak || 0)" />
                  </div>
                </div>
                <div class="box flex1 flex col jc ac">
                  <div class="opc6">累计打卡</div>
                  <div class="size28 mt10">
                    <el-statistic :value="Number(stats.total_check_in || 0)" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="homeSign flex col jb">
            <div class="flex jb">
              <div class="pt30 tc">
                <div class="size120 bold">{{ signDay }}</div>
                <div class="size24">{{ signMonth }} {{ signWeekday }}</div>
              </div>
              <img src="/clone-assets/home/moon.svg" class="img68 hand" alt="" />
            </div>
            <div>
              <div class="pl20 pr20 flex size24 mb40">
                <div class="flex1 mr10 leftStat">
                  <div>累计{{ Number(stats.total_check_in || 0) }}天</div>
                </div>
                <div class="flex2 rightStat flex ja">
                  <div>累计{{ Number(stats.total_check_in || 0) + 1 }}天</div>
                  <div>累计{{ Number(stats.total_check_in || 0) + 2 }}天</div>
                </div>
              </div>
              <div
                v-if="checkedIn"
                class="signBtn mb40 flex jc ac size24"
              >
                <div class="signProgress" style="width: 100%" />
                <div class="rel">已完成打卡</div>
              </div>
              <div
                v-else-if="signProgress >= 100"
                class="redayBtn mb40 flex jc ac size24 hand"
                @click="doClockIn"
              >
                立即打卡
              </div>
              <div v-else class="signBtn mb40 flex jc ac size24">
                <div class="signProgress" :style="{ width: `${signProgress}%` }" />
                <div class="rel">完成20分钟学习即可打卡</div>
              </div>
              <div class="size26 white bold6 flex ac jc">
                <div class="mr10">已有</div>
                <div class="size30">
                  <el-statistic :value="Number(homeIndex.all_check_in || 0)" />
                </div>
                <div class="ml10">人打卡</div>
              </div>
            </div>
          </div>
        </div>

        <div class="homeChart flex1 flex col">
          <div class="date">
            <div class="flex jb ac">
              <div class="flex ac">
                <div class="img30 mr10">
                  <el-icon :size="22"><Calendar /></el-icon>
                </div>
                <div class="size25 bold mr20">{{ chartMonth }}</div>
              </div>
              <el-button-group>
                <el-button size="small" plain :icon="ArrowLeft" @click="shiftMonth(-1)" />
                <el-button
                  size="small"
                  plain
                  :icon="ArrowRight"
                  :disabled="!canNextMonth"
                  @click="shiftMonth(1)"
                />
              </el-button-group>
            </div>
          </div>
          <div class="flex ast chartList onMenuOpen">
            <el-tooltip
              v-for="item in chartDays"
              :key="item.date"
              :content="formatHowLong(item.time)"
              placement="top"
            >
              <div class="flex1 chartItem flex col pl5 pr5 hand">
                <div class="colLine flex1">
                  <div class="chartLine" :style="{ height: `${item.percentage}%` }" />
                </div>
                <div class="day tc mt10">{{ item.date }}</div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>

      <div class="homeRank">
        <div class="top flex col">
          <div class="gap30" />
          <div class="size40 tc bold6 mb10">今日荣耀榜</div>
          <div class="rankTips size24 flex jc ac">{{ rankTip }}</div>
          <div class="flex jc ae flex1">
            <div v-if="rankSecond" class="rankTop rankTwo">
              <img src="/clone-assets/home/rank-bg1.png" class="rankbg1" alt="" />
              <div class="flex jc">
                <HomePodium :item="rankSecond" place="second" />
              </div>
            </div>
            <div v-if="rankFirst" class="rankTop rankOne">
              <img src="/clone-assets/home/rank-bg1.png" class="rankbg1" alt="" />
              <div class="flex jc">
                <HomePodium :item="rankFirst" place="first" />
              </div>
            </div>
            <div v-if="rankThird" class="rankTop rankTwo">
              <img src="/clone-assets/home/rank-bg1.png" class="rankbg1" alt="" />
              <div class="flex jc">
                <HomePodium :item="rankThird" place="third" />
              </div>
            </div>
          </div>
        </div>
        <div class="rankListBox">
          <div class="rankList">
            <div
              v-for="(item, index) in rankRest"
              :key="index"
              class="rankItem flex jb ac mb20"
            >
              <div class="flex ac">
                <div class="sort flex jc ac">{{ index + 4 }}</div>
                <el-image
                  class="cusAvatar img50 headimg ml20"
                  :src="userAvatar(item.user)"
                  fit="cover"
                />
                <div class="size-22 line1 ml10">{{ userName(item.user) }}</div>
              </div>
              <div class="flex je ac wrap">
                <img
                  v-if="vipImage(item.user)"
                  :src="vipImage(item.user)"
                  class="rankItemVip"
                  alt=""
                />
                <div v-else class="rankItemFreeVip flex jc ac">免费学习卡</div>
                <div class="size-20 ml5" style="text-wrap: nowrap">
                  {{ rankTimeText(item) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft, ArrowRight, Calendar } from "@element-plus/icons-vue";
import {
  clockIn,
  fetchDateHot,
  fetchHomeIndex,
  fetchHomeStats,
  fetchNotices,
  fetchRankList,
  fetchStudyCount,
  fetchStudyNum,
  type DateHotItem,
  type HomeIndex,
  type HomeStats,
  type RankItem,
  type RankUser,
  type StudyCount,
  type StudyNum,
} from "@/api/home";
import {
  currentYearMonth,
  formatHowLong,
  formatRankTime,
  isFutureMonth,
  shiftYearMonth,
} from "@/lib/time";
import HomePodium from "@/components/HomePodium.vue";

const studyTabs = [
  { name: "总计", value: 0 },
  { name: "今天", value: 1 },
  { name: "昨天", value: 2 },
  { name: "本周", value: 3 },
  { name: "本月", value: 4 },
];

const rankTips = [
  "今日榜单无你名，明日勤勉必登峰",
  "今朝努力未达标，明日拼搏必赶超",
  "今日缺席排行榜，明日拼搏创辉煌",
];

const studyTab = ref(0);
const notices = ref<string[]>([]);
const noticeIndex = ref(0);
const studyNum = ref<StudyNum>({});
const studyCount = ref<StudyCount>({});
const stats = ref<HomeStats>({});
const homeIndex = ref<HomeIndex>({});
const chartMonth = ref(currentYearMonth());
const chartDays = ref<{ date: string; time: number; percentage: number }[]>([]);
const rankFirst = ref<RankItem | null>(null);
const rankSecond = ref<RankItem | null>(null);
const rankThird = ref<RankItem | null>(null);
const rankRest = ref<RankItem[]>([]);
const tipIndex = ref(0);
let noticeTimer: number | undefined;
let tipTimer: number | undefined;

const noticeText = computed(
  () => notices.value[noticeIndex.value] || "欢迎来到哇学社",
);
const rankTip = computed(() => rankTips[tipIndex.value]);
const canNextMonth = computed(() => isFutureMonth(shiftYearMonth(chartMonth.value, 1)) === false);
const checkedIn = computed(() => Boolean(homeIndex.value.today_is_check_in));
const signProgress = computed(() => {
  const today = Number(homeIndex.value.today_time || stats.value.today_seconds || 0);
  return Math.min(100, Math.floor((today / 1200) * 10000) / 100);
});

const now = new Date();
const signDay = now.getDate();
const signMonth = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"][now.getMonth()];
const signWeekday = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()];

function userName(user?: RankUser) {
  return user?.nickname || "学员";
}

function userAvatar(user?: RankUser) {
  return user?.avatar || user?.headimg || user?.head_img || "/clone-assets/ico.png";
}

function rankTimeText(item?: RankItem | null) {
  if (item?.total_time) return item.total_time;
  return formatRankTime(Number(item?.time || item?.duration || item?.study_time || 0));
}

function vipImage(user?: RankUser) {
  const id = user?.active_vips?.vip_id;
  if (id === 1) return "/clone-assets/home/tag-p2.png";
  if (id === 2) return "/clone-assets/home/tag-p.png";
  if (id === 3) return "/clone-assets/home/tag-study-m.png";
  return "";
}

async function changeStudyTab(index: number) {
  if (studyTab.value === index) return;
  studyTab.value = index;
  studyNum.value = await fetchStudyNum(studyTabs[index].value);
}

async function loadChart(animate = false) {
  const list = (await fetchDateHot(chartMonth.value)) || [];
  const max = Math.max(...list.map((item: DateHotItem) => item.time || 0), 0);
  const mapped = list.map((item: DateHotItem) => ({
    date: String(item.date || "").slice(-2),
    time: item.time || 0,
    percentage: animate ? 0 : max > 0 ? Number((((item.time || 0) / max) * 100).toFixed(2)) : 0,
  }));
  chartDays.value = mapped;
  if (animate) {
    window.setTimeout(() => {
      chartDays.value = list.map((item: DateHotItem) => ({
        date: String(item.date || "").slice(-2),
        time: item.time || 0,
        percentage: max > 0 ? Number((((item.time || 0) / max) * 100).toFixed(2)) : 0,
      }));
    }, 300);
  }
}

function shiftMonth(delta: number) {
  const next = shiftYearMonth(chartMonth.value, delta);
  if (delta > 0 && isFutureMonth(next)) return;
  chartMonth.value = next;
  void loadChart(true);
}

async function doClockIn() {
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
  const [noticeRes, numRes, countRes, indexRes, statsRes, rankRes] = await Promise.allSettled([
    fetchNotices(),
    fetchStudyNum(0),
    fetchStudyCount(),
    fetchHomeIndex(),
    fetchHomeStats(),
    fetchRankList(),
  ]);
  if (noticeRes.status === "fulfilled") {
    notices.value = (noticeRes.value.list || []).map(
      (item) => item.title || item.content || item.name || "",
    ).filter(Boolean);
  }
  if (numRes.status === "fulfilled") studyNum.value = numRes.value || {};
  if (countRes.status === "fulfilled") studyCount.value = countRes.value || {};
  if (indexRes.status === "fulfilled") homeIndex.value = indexRes.value || {};
  if (statsRes.status === "fulfilled") stats.value = statsRes.value || {};
  if (rankRes.status === "fulfilled") {
    const sort = rankRes.value.sort || [];
    rankFirst.value = sort[0] || null;
    rankSecond.value = sort[1] || null;
    rankThird.value = sort[2] || null;
    rankRest.value = sort.slice(3);
  }
  await loadChart(true);
  noticeTimer = window.setInterval(() => {
    if (notices.value.length > 1) noticeIndex.value = (noticeIndex.value + 1) % notices.value.length;
  }, 4000);
  tipTimer = window.setInterval(() => {
    tipIndex.value = (tipIndex.value + 1) % rankTips.length;
  }, 3000);
});

onUnmounted(() => {
  if (noticeTimer) clearInterval(noticeTimer);
  if (tipTimer) clearInterval(tipTimer);
});
</script>
