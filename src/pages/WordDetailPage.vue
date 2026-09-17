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
          <span class="wdhCrumbCur line1">{{ book?.title || "" }}</span>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div class="wdhBody">
      <template v-if="book">
        <section class="wdhCard wdhSummary flex jb">
          <div class="wdhSummaryLeft flex ac">
            <div class="wdhIconBox" :style="{ background: iconGradient }">
              <img class="wdhIcon" :src="book.icon" :alt="book.title" />
            </div>
            <div class="wdhInfo">
              <div class="wdhTitle line1">{{ book.title }}</div>
              <div class="wdhDesc line1">{{ book.desc }}</div>
              <div class="wdhTags flex ac">
                <span v-for="tag in book.tags" :key="tag" class="wdhTag">{{ tag }}</span>
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

          <div class="wdhTableWrap">
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
                class="wdhRow"
                :class="{ wdhRowActive: playingId === row.id }"
              >
                <div class="wdhCell wdhCellIndex">{{ row.id }}</div>
                <div class="wdhCell wdhCellMain wdhWord">{{ row.word }}</div>
                <div class="wdhCell wdhCellMain">{{ row.phonetic }}</div>
                <div class="wdhCell wdhCellMain">{{ row.meaning }}</div>
                <div class="wdhCell wdhCellMain">
                  <button
                    type="button"
                    class="wdhSpeak"
                    :class="{ wdhSpeakAct: playingId === row.id }"
                    :aria-label="`播放 ${row.word}`"
                    @click="playWord(row)"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import { wordBooks, wordRows, type WordRow } from "@/data/words";

const route = useRoute();
const router = useRouter();

const PAGE_SIZE = 10;
const page = ref(1);
const playingId = ref<number | null>(null);
const collectedIds = ref<number[]>([]);
let audioEl: HTMLAudioElement | null = null;

const bookId = computed(() => String(route.params.id || ""));
const book = computed(() => wordBooks.find((item) => String(item.id) === bookId.value));
const progress = computed(() => Number(book.value?.learned || 0));
const iconGradient = computed(
  () => `linear-gradient(180deg, ${book.value?.tone || "#E2E3FE"} 0%, #ffffff 100%)`,
);
const totalPages = computed(() => Math.max(1, Math.ceil(wordRows.length / PAGE_SIZE)));
const pageRows = computed(() =>
  wordRows.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);
const collected = computed(() => {
  const id = Number(book.value?.id);
  return Number.isFinite(id) && collectedIds.value.includes(id);
});

function backToList() {
  void router.push("/words/index");
}

function startStudy() {
  ElMessage.info(`${book.value?.title || "该词书"}即将上线`);
}

function toggleCollect() {
  const id = Number(book.value?.id);
  if (!Number.isFinite(id)) return;
  collectedIds.value = collected.value
    ? collectedIds.value.filter((item) => item !== id)
    : [...collectedIds.value, id];
}

/** 发音：优先用在线发音（有道词典），失败回退浏览器朗读 */
function playWord(row: WordRow) {
  playingId.value = row.id;
  stopAudio();
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(row.word)}&type=2`;
  audioEl = new Audio(url);
  audioEl.onended = () => {
    if (playingId.value === row.id) playingId.value = null;
  };
  audioEl.onerror = () => speakFallback(row.word, row.id);
  void audioEl.play().catch(() => speakFallback(row.word, row.id));
}

function speakFallback(text: string, rowId: number) {
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
</script>
