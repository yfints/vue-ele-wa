<template>
  <div class="contentBox wordDetailPage">
    <header class="wdhHead flex jb ac">
      <div class="wdhHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="wdhMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="wdhCrumbs flex ac">
          <RouterLink to="/words/index" class="wdhCrumb">单词库</RouterLink>
          <img src="/clone-assets/words/crumb.svg" class="wdhCrumbSep" alt="" />
          <span class="wdhCrumbCur line1">{{ detail?.name || "" }}</span>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div class="wdhBody">
      <div v-if="loading" v-loading="loading" class="wdhLoading" />

      <template v-else-if="detail">
        <section class="wdhCard wdhSummary flex jb">
          <div class="wdhSummaryLeft flex ac">
            <div class="wdhIconBox" :style="{ background: iconGradient }">
              <img class="wdhIcon" :src="icon" :alt="detail.name" />
            </div>
            <div class="wdhInfo">
              <div class="wdhTitle line1">{{ detail.name }}</div>
              <div class="wdhDesc line1">{{ detail.description }}</div>
              <div class="wdhTags flex ac">
                <span v-for="tag in tags" :key="tag" class="wdhTag">{{ tag }}</span>
              </div>
              <div class="wdhProgress flex ac">
                <div class="wdhBar">
                  <div class="wdhBarFill" :style="{ width: `${progress}%` }" />
                </div>
                <span class="wdhLearned">已学{{ progress }}%</span>
              </div>
            </div>
          </div>

          <div class="wdhActions flex ac">
            <button type="button" class="wdhStart" @click="startStudy">开始学习</button>
            <button
              type="button"
              class="wdhCollect"
              :class="{ wdhCollectAct: collected }"
              @click="toggleCollect"
            >
              <svg class="wdhHeart" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 20.1 4.9 13.3A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 7.1 6.2z"
                />
              </svg>
              {{ collected ? "已收藏" : "加入收藏" }}
            </button>
          </div>
        </section>

        <section class="wdhCard wdhList">
          <div class="wdhListTitle">单词列表</div>

          <div v-loading="loadingWords" class="wdhTableWrap">
            <div class="wdhTable">
              <div class="wdhRow wdhThead">
                <div class="wdhCell wdhCellIndex">#</div>
                <div class="wdhCell wdhCellMain">单词</div>
                <div class="wdhCell wdhCellMain">音标</div>
                <div class="wdhCell wdhCellMain">释意</div>
                <div class="wdhCell wdhCellMain">发音</div>
              </div>

              <div
                v-for="row in pageRows"
                :key="row.id"
                class="wdhRow wdhRowClickable"
                :class="{ wdhRowActive: playingId === row.id }"
                :title="`练习「${row.word}」`"
                @click="startPractice(row)"
              >
                <div class="wdhCell wdhCellIndex">{{ row.no }}</div>
                <div class="wdhCell wdhCellMain wdhWord">{{ row.word }}</div>
                <div class="wdhCell wdhCellMain">{{ row.phonetic }}</div>
                <div class="wdhCell wdhCellMain">{{ row.meaning }}</div>
                <div class="wdhCell wdhCellMain">
                  <button
                    type="button"
                    class="wdhSpeak"
                    :class="{ wdhSpeakAct: playingId === row.id }"
                    :aria-label="`播放 ${row.word}`"
                    @click.stop="playWord(row)"
                  >
                    <svg class="wdhSpeaker" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11 5.2 6.8 8.4H3.6v7.2h3.2L11 18.8z" />
                      <path
                        class="wdhSpeakerWave"
                        d="M15.2 8.6a4.6 4.6 0 0 1 0 6.8M17.6 6.2a8 8 0 0 1 0 11.6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="wdhPager flex jc ac">
            <button
              type="button"
              class="wdhPageBtn"
              :disabled="page === 1"
              @click="page -= 1"
            >
              <img src="/clone-assets/words/prev.svg" class="wdhPageArrow" alt="上一页" />
            </button>
            <button
              v-for="n in totalPages"
              :key="n"
              type="button"
              class="wdhPageBtn"
              :class="{ wdhPageAct: page === n }"
              @click="page = n"
            >
              {{ n }}
            </button>
            <button
              type="button"
              class="wdhPageBtn"
              :disabled="page === totalPages"
              @click="page += 1"
            >
              <img src="/clone-assets/words/next.svg" class="wdhPageArrow" alt="下一页" />
            </button>
          </div>
        </section>
      </template>

      <div v-else class="wdhEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="wdhEmptyImg" alt="" />
        <div class="wdhEmptyText">词书不存在或已下架</div>
        <button type="button" class="wdhStart mt20" @click="backToList">返回单词库</button>
      </div>
    </div>

    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import ModePop from "@/components/ModePop.vue";
import {
  fetchLessonDetails,
  fetchCollectLessons,
  toggleCollect as toggleCourseCollect,
  unwrapCollectPage,
} from "@/api/course";
import {
  fetchWordSetDetail,
  fetchWordSetWords,
  unwrapWordPage,
  type WordItem,
  type WordSetDetail,
} from "@/api/words";
import { getToken } from "@/api/token";
import { ensureLogin } from "@/composables/useAuth";
import { saveGameInfo } from "@/composables/useGame";
import { localAsset } from "@/data/mall";
import { wordIcon, wordTone } from "@/data/words";

/** 表格行：接口数据 + 当前页内的序号 */
interface WordRow extends WordItem {
  no: number;
}

const route = useRoute();
const router = useRouter();

const PAGE_SIZE = 10;
const page = ref(1);
const playingId = ref<string | number | null>(null);
const detail = ref<WordSetDetail | null>(null);
const words = ref<WordItem[]>([]);
const total = ref(0);
const loading = ref(true);
const loadingWords = ref(false);
const collected = ref(false);
/** 词书里的课时 id：练习的 lessonId 用的是它，不是词书（course）id */
const lesson = ref<{ id: string; name: string } | null>(null);
/** 会员判定，false 时不允许进入练习 */
const access = ref<{ allowed?: boolean; reason?: string } | null>(null);
const modeRef = ref<{ open: () => void } | null>(null);
let starting = false;
let audioEl: HTMLAudioElement | null = null;
let wordSeq = 0;

const bookId = computed(() => String(route.params.id || ""));
const tone = computed(() => wordTone(0));
const icon = computed(() => wordIcon(0));
const iconGradient = computed(
  () => `linear-gradient(180deg, ${tone.value} 0%, #ffffff 100%)`,
);
const progress = computed(() => {
  const wordCount = Number(detail.value?.wordCount ?? 0) || 0;
  const learnedNum = Number(detail.value?.learnedNum ?? 0) || 0;
  if (!wordCount) return 0;
  return Math.min(100, Math.round((learnedNum / wordCount) * 100));
});
const tags = computed(() => {
  const list: string[] = [];
  const categoryName = String(detail.value?.categoryName || "").trim();
  if (categoryName) list.push(categoryName);
  const wordCount = Number(detail.value?.wordCount ?? 0) || 0;
  if (wordCount > 0) list.push(`共${wordCount}词`);
  return list;
});
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
const pageRows = computed<WordRow[]>(() =>
  words.value.map((item, index) => ({ ...item, no: (page.value - 1) * PAGE_SIZE + index + 1 })),
);

function backToList() {
  void router.push("/words/index");
}

function startStudy() {
  void startPractice();
}

/**
 * 点表格某一行（或「开始学习」）进入练习：
 * 先存好本词书的课时信息，再弹出 ModePop 选模式，选完由它跳 /gameLoad。
 */
async function startPractice(row?: WordRow) {
  if (starting) return;
  const current = detail.value;
  if (!current) return;
  if (!getToken()) {
    await ensureLogin();
    return;
  }
  if (!lesson.value) {
    ElMessage.info("该词书暂无可用课时");
    return;
  }
  if (access.value?.allowed === false) {
    ElMessage.info(access.value.reason === "NEED_MEMBER" ? "该词书为会员内容，暂无法学习" : "暂无法学习该词书");
    return;
  }
  starting = true;
  try {
    saveGameInfo({
      courseId: bookId.value,
      chapterId: String(lesson.value.id),
      gameTitle: lesson.value.name,
      courseName: String(current.name || ""),
      gameType: "Word",
      gameMode: "SentenceTranslate",
      userLessonId: "",
      startItemId: row ? String(row.id) : undefined,
    });
    modeRef.value?.open();
  } finally {
    starting = false;
  }
}

/** 词书的课时与会员判定（课程详情接口下发），练习要用课时的 id */
async function loadCourseExtra() {
  try {
    const data = await fetchLessonDetails(bookId.value);
    const first = (data?.lessons || [])[0];
    lesson.value = first ? { id: String(first.id), name: String(first.name || "") } : null;
    access.value = data?.access ?? null;
  } catch {
    lesson.value = null;
    access.value = null;
  }
}

async function loadCollectState() {
  if (!getToken()) {
    collected.value = false;
    return;
  }
  try {
    const data = await fetchCollectLessons({ type: 1, page: 1, limit: 100 });
    collected.value = unwrapCollectPage(data).items.some(
      (item) => String(item.courseId) === bookId.value,
    );
  } catch {
    collected.value = false;
  }
}

async function toggleCollect() {
  if (!getToken()) {
    ElMessage.warning("请先登录");
    return;
  }
  try {
    // 单词收藏夹是 type=1
    await toggleCourseCollect(bookId.value, 1);
    collected.value = !collected.value;
    ElMessage.success(collected.value ? "收藏成功" : "已取消收藏");
  } catch {
    /* unwrap 已提示 */
  }
}

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await fetchWordSetDetail(bookId.value);
  } catch {
    // 词书不存在 / 未上线时后端返回 400，这里落成空状态
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadWords() {
  const seq = ++wordSeq;
  loadingWords.value = true;
  try {
    const data = await fetchWordSetWords(bookId.value, { page: page.value, limit: PAGE_SIZE });
    if (seq !== wordSeq) return;
    const result = unwrapWordPage(data);
    words.value = result.records;
    total.value = result.total ?? result.records.length;
  } catch {
    if (seq === wordSeq) {
      words.value = [];
      total.value = 0;
    }
  } finally {
    if (seq === wordSeq) loadingWords.value = false;
  }
}

/** 发音：接口给了音频就播它，否则用在线发音，再失败回退浏览器朗读 */
function playWord(row: WordRow) {
  playingId.value = row.id;
  stopAudio();
  const remote = localAsset(row.audio || "");
  const url = remote || `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(row.word)}&type=2`;
  audioEl = new Audio(url);
  audioEl.onended = () => {
    if (playingId.value === row.id) playingId.value = null;
  };
  audioEl.onerror = () => speakFallback(row.word, row.id);
  void audioEl.play().catch(() => speakFallback(row.word, row.id));
}

function speakFallback(text: string, rowId: string | number) {
  const synth = window.speechSynthesis;
  if (!synth) {
    playingId.value = null;
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  const clear = () => {
    if (playingId.value === rowId) playingId.value = null;
  };
  utter.onend = clear;
  utter.onerror = clear;
  synth.cancel();
  synth.speak(utter);
}

function stopAudio() {
  if (audioEl) {
    audioEl.onended = null;
    audioEl.onerror = null;
    audioEl.pause();
    audioEl = null;
  }
  window.speechSynthesis?.cancel();
}

onUnmounted(() => {
  stopAudio();
});

watch(page, () => {
  void loadWords();
});

watch(bookId, async () => {
  page.value = 1;
  await Promise.all([loadDetail(), loadCourseExtra(), loadCollectState()]);
  await loadWords();
});

onMounted(async () => {
  await Promise.all([loadDetail(), loadCourseExtra(), loadCollectState()]);
  await loadWords();
});
</script>
