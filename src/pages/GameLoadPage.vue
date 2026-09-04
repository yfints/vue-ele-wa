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
import { fetchExercisePage, fetchGameTime, startGame } from "@/api/game";
import { getToken } from "@/api/token";
import { gameIndex, gameList, gameSession, gameTime, resetGameData, saveGameInfo } from "@/composables/useGame";
import { demoSentences } from "@/data/game-demo";
import { mapSentences } from "@/lib/mapSentences";

const router = useRouter();
const progress = ref(0);
const showFoot = ref(true);
let timer: number | undefined;
let cancelled = false;

async function loadRemote() {
  const session = gameSession.value;
  if (!session || !getToken()) return false;
  try {
    await fetchGameTime().then((data) => {
      gameTime.value = typeof data === "number" ? data : Number(data?.time || 0);
    });
    await startGame(session.courseId, session.chapterId);
    const page = await fetchExercisePage({
      lesson_id: session.courseId,
      lesson_course_id: session.chapterId,
      limit: 10,
    });
    const list = mapSentences(page?.sentences || []);
    if (list.length) {
      gameList.value = list;
      gameIndex.value = 0;
      return true;
    }
  } catch {
    /* 走本地预览 */
  }
  return false;
}

onMounted(async () => {
  if (!gameSession.value?.chapterId) {
    ElMessage.warning("请先选择课程");
    await router.replace("/courseMall/index");
    return;
  }
  resetGameData();
  saveGameInfo();
  timer = window.setInterval(() => {
    if (progress.value < 92) progress.value += Math.max(1, Math.round((92 - progress.value) / 8));
  }, 120);
  const ok = await loadRemote();
  if (!ok) gameList.value = demoSentences.map((item) => ({ ...item }));
  if (cancelled) return;
  progress.value = 100;
  window.setTimeout(() => {
    if (!cancelled) void router.replace("/game");
  }, 1000);
});

onUnmounted(() => {
  cancelled = true;
  if (timer) clearInterval(timer);
});
</script>
