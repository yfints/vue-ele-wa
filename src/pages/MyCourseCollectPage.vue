<template>
  <div class="contentBox collectPage">
    <div class="pl30 pr30 pt30">
      <div class="flex pl20 headTab">
        <div
          class="size28 bold mr46"
          :class="kind === 'sentence' ? 'act' : 'opc6 hand'"
          @click="goTab('sentence')"
        >
          句子
        </div>
        <div
          class="size28 bold mr46"
          :class="kind === 'word' ? 'act' : 'opc6 hand'"
          @click="goTab('word')"
        >
          单词
        </div>
      </div>
      <div
        ref="listRef"
        v-loading="loading"
        class="pageScroll listScroll"
        @scroll="onListScroll"
      >
        <div v-if="!loading && !items.length" class="flex col ac collectEmpty">
          <img src="/clone-assets/nodata.png" class="nodata" alt="" />
          <div class="flex jc pt100">
            <div class="nodataBtn hand" @click="goMall">{{ emptyCta }}</div>
          </div>
        </div>
        <div v-else class="gridContainer">
          <div
            v-for="item in items"
            :key="item.id"
            class="collectCard hand mb20"
            @click="openDetail(item)"
          >
            <div class="delBox flex jc ac gray ani img50" @click.stop="askRemove(item)">
              <el-icon class="img30"><Delete /></el-icon>
            </div>
            <div class="imgBox">
              <el-image
                class="cardimg"
                :src="localAsset(item.image) || undefined"
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="cardimgFallback" />
                </template>
              </el-image>
              <div class="cardtag">用户共享</div>
            </div>
            <div class="line1 size20 mt10">{{ item.name }}</div>
            <div class="flex jb ac mt10 size14">
              <div class="flex ac flex1">
                <img
                  :src="localAsset(item.founderAvatar) || '/clone-assets/ico.png'"
                  class="img25 avatar circle"
                  alt=""
                />
                <div class="ml5 line1 name opc6">{{ item.founderName || "官方" }}</div>
              </div>
              <div v-if="item.heat" class="flex ac opc6">
                <strong>
                  <i class="van-badge__wrapper van-icon van-icon-fire-o" />
                </strong>
                <div class="ml5">{{ item.heat }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="loadingMore" class="tc opc6 size20 pt20 pb10">加载中…</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  fetchCollectLessons,
  toggleCollect,
  unwrapCollectPage,
  type CollectLessonItem,
} from "@/api/course";
import { getToken } from "@/api/token";
import { ensureLogin } from "@/composables/useAuth";
import { localAsset } from "@/data/mall";

const route = useRoute();
const router = useRouter();

const kind = computed(() => (route.path.includes("/myCourse/word") ? "word" : "sentence"));
const collectType = computed(() => (kind.value === "word" ? 1 : 0));
const emptyCta = computed(() =>
  kind.value === "word" ? "去收藏单词课程包" : "去收藏句子课程包",
);

const listRef = ref<HTMLElement>();
const items = ref<CollectLessonItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const pageSize = 50;
const current = ref(1);
const finished = ref(false);
let requestSeq = 0;

function goTab(next: "sentence" | "word") {
  if (kind.value === next) return;
  void router.push(next === "word" ? "/myCourse/word" : "/myCourse/sentence");
}

function goMall() {
  void router.push("/courseMall/index");
}

function openDetail(item: CollectLessonItem) {
  if(kind.value==="word"){
    void router.push(`/words/${item.courseId}`);
    return;
  }
  void router.push(`/courseMall/${item.courseId}`);
}

async function loadList(reset = false) {
  if (!getToken()) {
    items.value = [];
    finished.value = true;
    loading.value = false;
    loadingMore.value = false;
    return;
  }
  if (!reset && (loading.value || loadingMore.value || finished.value)) return;
  const seq = ++requestSeq;
  if (reset) {
    current.value = 1;
    finished.value = false;
    items.value = [];
    loading.value = true;
  } else {
    loadingMore.value = true;
  }
  try {
    const result = unwrapCollectPage(
      await fetchCollectLessons({
        type: collectType.value,
        page: current.value,
        limit: pageSize,
      }),
    );
    if (seq !== requestSeq) return;
    if (reset) items.value = result.items;
    else items.value.push(...result.items);
    if (result.items.length < pageSize || (result.total != null && items.value.length >= result.total)) {
      finished.value = true;
    }
    current.value += 1;
  } catch {
    if (reset) items.value = [];
    finished.value = true;
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
      loadingMore.value = false;
      ensureFill();
    }
  }
}

function onListScroll() {
  const el = listRef.value;
  if (!el || loading.value || loadingMore.value || finished.value) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
    void loadList();
  }
}

function ensureFill() {
  const el = listRef.value;
  if (!el || loading.value || loadingMore.value || finished.value) return;
  if (el.scrollHeight <= el.clientHeight) {
    void loadList();
  }
}

async function askRemove(item: CollectLessonItem) {
  try {
    await ElMessageBox.confirm("确定要取消收藏吗？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
      closeOnClickModal: false,
    });
  } catch {
    return;
  }
  try {
    await toggleCollect(item.courseId, collectType.value);
    ElMessage.success("移除成功");
    items.value = items.value.filter((row) => String(row.courseId) !== String(item.courseId));
  } catch {
    /* unwrap 已提示 */
  }
}

async function boot() {
  if (!getToken()) {
    items.value = [];
    finished.value = true;
    await ensureLogin();
    if (!getToken()) return;
  }
  await loadList(true);
}

watch(
  () => kind.value,
  () => {
    void loadList(true);
  },
);

onMounted(() => {
  void boot();
});
</script>
