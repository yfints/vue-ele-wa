<template>
  <div class="loadGame flex jc ac">
    <img src="/clone-assets/ico.png" class="imgStart animate__animated animate__jackInTheBox" alt="" />
  </div>
  <div v-if="showFoot" class="loadFoot flex col jc ac">
    <div class="progress flex ac animate__animated animate__zoomIn">
      <div class="loadBar">
        <div class="loadBarFill" :style="{ width: `${progress}%` }" />
      </div>
    </div>
    <div class="mt30 loadTip">课程加载中（{{ progress }} %）...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { fetchAllLessonPractice } from "@/api/practice";
import { getToken } from "@/api/token";
import {
  gameIndex,
  gameList,
  gameSession,
  gameBackPath,
  resetGameData,
  saveGameInfo,
  MODE_TO_PRACTICE,
} from "@/composables/useGame";
import { pickPractices } from "@/lib/mapPractices";

const router = useRouter();
const progress = ref(0);
const showFoot = ref(true);
let timer: number | undefined;
let cancelled = false;

async function loadRemote() {
  const session = gameSession.value;
  if (!session?.chapterId) return false;
  if (!getToken()) {
    ElMessage.warning("请先登录");
    return false;
  }
  const payload = await fetchAllLessonPractice(session.chapterId);
  const mode = session.practiceMode ?? MODE_TO_PRACTICE[session.gameMode] ?? 3;
  const list = pickPractices(payload.sentences, mode);
  if (!list.length) {
    ElMessage.warning("该模式暂无练习题");
    return false;
  }
  const cursor = Number(payload.meta?.progressIndex || 0);
  const start = list.findIndex((item) => Number(item.index) >= cursor);
  gameList.value = list;
  gameIndex.value = start >= 0 ? start : 0;
  saveGameInfo({ practiceMode: mode });
  return true;
}

onMounted(async () => {
  if (!gameSession.value?.chapterId) {
    ElMessage.warning("请先选择课程");
    await router.replace(gameBackPath());
    return;
  }
  resetGameData();
  saveGameInfo();
  timer = window.setInterval(() => {
    if (progress.value < 92) progress.value += Math.max(1, Math.round((92 - progress.value) / 8));
  }, 120);
  let ok = false;
  try {
    ok = await loadRemote();
  } catch {
    ok = false;
  }
  if (cancelled) return;
  if (!ok) {
    await router.replace(gameBackPath());
    return;
  }
  progress.value = 100;
  window.setTimeout(() => {
    if (!cancelled) void router.replace("/game");
  }, 600);
});

onUnmounted(() => {
  cancelled = true;
  if (timer) clearInterval(timer);
});
</script>
