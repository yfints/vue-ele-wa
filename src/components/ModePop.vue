<template>
  <Teleport to="body">
    <div v-if="visible" class="modePopLayer">
      <div class="modePopMask" @click="close" />

      <div class="modePop" role="dialog" aria-label="选择练习模式">
        <span class="modeGlow modeGlowBlue" aria-hidden="true" />
        <span class="modeGlow modeGlowGreen" aria-hidden="true" />

        <button type="button" class="modePopClose" aria-label="关闭" @click="close">
          <img src="/clone-assets/mode2/close.png" alt="" />
        </button>

        <div class="modePopHead">
          <div class="modePopTitle">选择练习模式</div>
          <div v-if="subtitle" class="modePopSub">{{ subtitle }}</div>
        </div>

        <div class="modePopCards flex jc ac">
          <button
              v-for="(item, index) in modes"
              :key="item.gameMode"
              type="button"
              class="modeCard flex col ac"
              @click="start(index)"
          >
            <img class="modeCardIcon" :src="item.icon" :alt="item.title" />
            <div class="modeCardTitle">{{ item.title }}</div>
            <div class="modeCardDesc">{{ item.desc }}</div>
            <img
                class="modeCardArrow"
                :src="item.arrow"
                alt=""
                @click.stop="start(index)"
            />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { gameSession, saveGameInfo, type GameMode } from "@/composables/useGame";

interface ModeItem {
  title: string;
  desc: string;
  icon: string;
  arrow: string;
  gameMode: GameMode;
  practiceMode: 0 | 1 | 2 | 3;
}

const router = useRouter();
const visible = ref(false);
const active = ref(0);

const modes: ModeItem[] = [
  {
    title: "打字练习",
    desc: "根据中文提示\n输入英语单词",
    icon: "/clone-assets/mode2/icon-typing.png",
    arrow: "/clone-assets/mode2/arrow-typing.png",
    gameMode: "SentenceTypeing",
    practiceMode: 1,
  },
  {
    title: "口语练习",
    desc: "跟读发音\nAI智能识别",
    icon: "/clone-assets/mode2/icon-oral.png",
    arrow: "/clone-assets/mode2/arrow-oral.png",
    gameMode: "SentenceOral",
    practiceMode: 2,
  },
  {
    title: "中译英",
    desc: "根据中文提示\n输入英语单词",
    icon: "/clone-assets/mode2/icon-translate.png",
    arrow: "/clone-assets/mode2/arrow-translate.png",
    gameMode: "SentenceTranslate",
    practiceMode: 3,
  },
  {
    title: "听力模式",
    desc: "听英文发音\n选择正确单词",
    icon: "/clone-assets/mode2/icon-listen.png",
    arrow: "/clone-assets/mode2/arrow-listen.png",
    gameMode: "SentenceListen",
    practiceMode: 0,
  },
];

/** 副标题显示当前课程 / 词书名称 */
const subtitle = computed(
    () => gameSession.value?.courseName || gameSession.value?.gameTitle || "",
);

function open() {
  visible.value = true;
  const current = gameSession.value?.gameMode;
  const index = modes.findIndex((item) => item.gameMode === current);
  active.value = index >= 0 ? index : 0;
}

function close() {
  visible.value = false;
}

/** 点击卡片或右下角箭头：选中该模式并直接开始 */
function start(index: number) {
  active.value = index;
  confirm();
}

function confirm() {
  const item = modes[active.value];
  if (!item) return;
  saveGameInfo({ gameMode: item.gameMode, practiceMode: item.practiceMode });
  visible.value = false;
  void router.push("/gameLoad");
}

defineExpose({ open, close });
</script>
