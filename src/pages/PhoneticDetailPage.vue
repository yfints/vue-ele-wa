<template>
  <div class="contentBox phoneticDetailPage">
    <header class="phdHead flex jb ac">
      <div class="phdHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="phdMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="phdCrumbs flex ac">
          <RouterLink to="/phonetic/index" class="phdCrumb">音标学习</RouterLink>
          <img src="/clone-assets/practice/icon-next.png" class="phdCrumbSep" alt="" />
          <span class="phdCrumbCur line1">{{ title }}</span>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div class="phdBody">
      <section class="phdCard">
        <div class="phdSummary flex ac">
          <div class="phdTile flex ac jc">{{ codeLabel }}</div>
          <div class="phdSummaryInfo minw0">
            <div class="phdTitle line1">{{ title }}</div>
            <div class="phdSub line1">{{ subtitle }}</div>
          </div>
        </div>
        <div class="phdDivider" />

        <div v-for="group in phoneticGroups" :key="group.name" class="phdGroup">
          <div class="phdGroupHead flex">
            <span class="phdDot" :style="{ background: group.tone }" />
            <div class="phdGroupLabels flex col">
              <span class="phdGroupName">{{ group.name }}</span>
              <span class="phdGroupCount">{{ group.items.length }}个</span>
            </div>
          </div>

          <div class="phdChips flex wrap">
            <button
              v-for="item in group.items"
              :key="item.ipa"
              type="button"
              class="phdChip hand"
              :class="{ 'is-active': item.ipa === activeIpa }"
              @click="toggleItem(item)"
            >
              {{ item.ipa }}
            </button>
          </div>

          <div v-if="active && group.items.includes(active)" class="phdPanel">
            <div class="phdPanelTop flex">
              <div class="phdIpaCard flex col jb">
                <div class="phdIpaText">{{ active.ipa }}</div>
                <div class="phdIpaMeta flex ac">
                  <button
                    type="button"
                    class="phdSpeak flex ac jc hand"
                    aria-label="播放发音"
                    :class="{ 'is-playing': playingKey === `ipa-${active.ipa}` }"
                    @click="speak(active.ipa.replaceAll('/', ''), `ipa-${active.ipa}`)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 9.5h3l4-3.5v12l-4-3.5H4zm11.5-2.2a6.2 6.2 0 0 1 0 9.4m2.6-12a9.6 9.6 0 0 1 0 14.6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <span class="phdIpaType">{{ active.type }}</span>
                </div>
              </div>

              <div class="phdTips flex1 minw0">
                <div class="phdPanelTitle">发音要点</div>
                <ol class="phdTipList">
                  <li v-for="(tip, index) in active.tips" :key="tip">
                    <span class="phdTipIndex">{{ index + 1 }}</span>
                    <span>{{ tip }}</span>
                  </li>
                </ol>
              </div>
            </div>

            <div class="phdSection">
              <div class="phdPanelTitle">例句</div>
              <div class="phdExamples flex wrap">
                <div v-for="sentence in active.sentences" :key="sentence.en" class="phdExample">
                  <div class="phdExampleEn line1">{{ sentence.en }}</div>
                  <div class="phdExampleZh line1">{{ sentence.zh }}</div>
                </div>
              </div>
            </div>

            <div class="phdSection">
              <div class="phdPanelTitle">示例单词</div>
              <div class="phdWords flex wrap">
                <div v-for="word in active.words" :key="word.word" class="phdWord flex ac">
                  <button
                    type="button"
                    class="phdSpeak flex ac jc hand"
                    :aria-label="`播放 ${word.word}`"
                    :class="{ 'is-playing': playingKey === `word-${word.word}` }"
                    @click="speak(word.word, `word-${word.word}`)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 9.5h3l4-3.5v12l-4-3.5H4zm11.5-2.2a6.2 6.2 0 0 1 0 9.4m2.6-12a9.6 9.6 0 0 1 0 14.6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <div class="phdWordText minw0">
                    <div class="phdWordEn line1">{{ word.word }}</div>
                    <div class="phdWordZh line1">{{ word.zh }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import { fetchLessonDetails, type CourseDetailVo } from "@/api/course";
import { PHONETIC_TOTAL, phoneticGroups, type PhoneticItem } from "@/data/phonetics";

const route = useRoute();
const detail = ref<CourseDetailVo | null>(null);
const activeIpa = ref("");
const playingKey = ref("");
let audio: HTMLAudioElement | null = null;

const title = computed(() => String(detail.value?.name || "音标学习").trim());
/** 英式课显示 GB、美式课显示 US（设计稿里是 GB） */
const codeLabel = computed(() => (/美式|american/i.test(title.value) ? "US" : "GB"));
const subtitle = computed(
  () =>
    String(detail.value?.description || "").trim() ||
    `${PHONETIC_TOTAL}个音标 · 点击音标查看卡片详情`,
);
const active = computed<PhoneticItem | null>(
  () =>
    phoneticGroups
      .flatMap((group) => group.items)
      .find((item) => item.ipa === activeIpa.value) || null,
);

/** 点同一个音标收起，点别的音标切换 */
function toggleItem(item: PhoneticItem) {
  activeIpa.value = activeIpa.value === item.ipa ? "" : item.ipa;
}

/** 朗读：走有道发音（英式 type=1），和练习页的 TTS 保持一致 */
function speak(text: string, key: string) {
  const value = String(text || "").trim();
  if (!value) return;
  stopSpeak();
  playingKey.value = key;
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(value)}&type=1`;
  audio = new Audio(url);
  audio.onended = () => {
    playingKey.value = "";
  };
  audio.onerror = () => {
    playingKey.value = "";
  };
  void audio.play().catch(() => {
    playingKey.value = "";
  });
}

function stopSpeak() {
  if (!audio) return;
  audio.pause();
  audio = null;
  playingKey.value = "";
}

onMounted(async () => {
  try {
    detail.value = await fetchLessonDetails(String(route.params.id || ""));
  } catch {
    detail.value = null;
  }
});

onUnmounted(stopSpeak);
</script>
