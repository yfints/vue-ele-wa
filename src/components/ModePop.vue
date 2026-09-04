<template>
  <Teleport to="body">
    <div v-if="visible" class="searchLayer">
      <div class="van-overlay vanPopupMask" />
      <div class="van-popup van-popup--center" role="dialog">
        <div class="galssPop popL">
          <div class="galssHead flex jb ac">
            <div class="size30 white">选择练习模式</div>
            <button type="button" class="img60 hand searchClose" aria-label="关闭" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
                <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <div class="pt40 pr40 pb40 pl40 white">
            <el-carousel
              ref="carouselRef"
              type="card"
              height="230px"
              :autoplay="false"
              arrow="never"
              indicator-position="none"
              @change="onChange"
            >
              <el-carousel-item v-for="(item, index) in modes" :key="item.gameMode">
                <div
                  class="modeCard flex col je ac"
                  :class="active === index ? 'hoverCard' : 'defCard'"
                  :style="{ backgroundImage: `url(${item.bg})` }"
                  @click="select(index)"
                >
                  <div class="mask" />
                  <div class="tag">{{ item.tag }}</div>
                  <div class="size28 bold6 rel mb10">{{ item.title }}</div>
                  <div class="size-18 tc rel pl10 pr10 desc">{{ item.desc }}</div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="flex ast galssBot">
            <div class="flex1 pl40 pb40 pt20 pr20">
              <div class="flex jc ac hand cancelBtn" @click="close">取消</div>
            </div>
            <div class="galssLine" />
            <div class="flex1 pr40 pb40 pt20 pl20">
              <div class="flex jc ac hand confirmBtn" @click="confirm">开始练习</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import type { CarouselInstance } from "element-plus";
import { gameSession, saveGameInfo, type GameMode } from "@/composables/useGame";

interface ModeItem {
  title: string;
  tag: string;
  desc: string;
  bg: string;
  gameMode: GameMode;
}

const router = useRouter();
const visible = ref(false);
const active = ref(0);
const carouselRef = ref<CarouselInstance>();

const modes = computed<ModeItem[]>(() => [
  {
    title: "中译英模式",
    tag: "新手推荐",
    desc: "看到中文提示，尝试用英文表达。练习运用所学词汇和语法",
    bg: "/clone-assets/mode/translate.png",
    gameMode: "SentenceTranslate",
  },
  {
    title: "听力模式",
    tag: "泛听神器",
    desc: "播放英语音频，让你沉浸在语言环境中。培养语感，熟悉发音",
    bg: "/clone-assets/mode/listen.png",
    gameMode: "SentenceListen",
  },
  {
    title: "打字练习",
    tag: "输入强化",
    desc: "在练题过程中提升打字速度与拼写准确率",
    bg: "/clone-assets/mode/typing.png",
    gameMode: "SentenceTypeing",
  },
  {
    title: "口语练习",
    tag: "口语矫正",
    desc: "跟读句子并练习发音，让口语表达更自然流畅",
    bg: "/clone-assets/mode/oral.png",
    gameMode: "SentenceOral",
  },
]);

async function open() {
  visible.value = true;
  const current = gameSession.value?.gameMode;
  const index = Math.max(
    0,
    modes.value.findIndex((item) => item.gameMode === current),
  );
  active.value = index;
  await nextTick();
  if (index > 0) carouselRef.value?.setActiveItem(index);
}

function close() {
  visible.value = false;
}

function onChange(index: number) {
  active.value = index;
}

function select(index: number) {
  if (index === active.value) {
    confirm();
    return;
  }
  active.value = index;
  carouselRef.value?.setActiveItem(index);
}

function confirm() {
  const item = modes.value[active.value];
  if (!item) return;
  saveGameInfo({ gameMode: item.gameMode });
  visible.value = false;
  void router.push("/gameLoad");
}

defineExpose({ open, close });
</script>
