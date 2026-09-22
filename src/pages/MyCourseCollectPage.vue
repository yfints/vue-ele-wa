<template>
  <div class="contentBox collectPage">
    <header class="cfHead flex jb ac">
      <div class="cfHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="cfMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <!-- 设计稿：顶部两个胶囊页签（收藏的课程 / 收藏的单词库），没有面包屑 -->
        <el-tabs v-model="tab" class="cfTabs" @tab-change="onTabChange">
          <el-tab-pane v-for="item in TABS" :key="item.name" :label="item.label" :name="item.name" />
        </el-tabs>
      </div>
      <UserDropdown />
    </header>

    <div ref="listRef" class="pageScroll cfBody" @scroll="onListScroll">
      <el-skeleton v-if="loading" animated>
        <template #template>
          <div class="cfRow flex ac" v-for="n in 4" :key="n">
            <el-skeleton-item variant="image" class="cfSkeletonCover" />
            <div class="cfInfo flex col flex1">
              <el-skeleton-item variant="text" class="cfSkeletonName" />
              <el-skeleton-item variant="text" class="cfSkeletonDesc" />
            </div>
            <el-skeleton-item variant="button" class="cfSkeletonBtn" />
            <el-skeleton-item variant="button" class="cfSkeletonBtn" />
          </div>
        </template>
      </el-skeleton>

      <div v-else-if="items.length" class="cfList">
        <div
          v-for="item in items"
          :key="item.id"
          class="cfRow flex ac hand"
          @click="openDetail(item)"
        >
          <el-image class="cfCover" :src="localAsset(item.image) || undefined" fit="cover" lazy>
            <template #error>
              <div class="cfCoverFallback flex ac jc">
                <el-icon class="img40"><Picture /></el-icon>
              </div>
            </template>
          </el-image>

          <div class="cfInfo flex col flex1">
            <div class="cfName line1">{{ item.name }}</div>
            <div class="cfDesc line1">{{ rowDesc(item) }}</div>
          </div>

          <el-button class="cfBtn cfBtnPrimary" @click.stop="openDetail(item)">开始学习</el-button>
          <el-button class="cfBtn cfBtnFav" @click.stop="remove(item)">
            <svg class="cfHeart" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.1 4.9 13.3A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 7.1 6.2z" />
            </svg>
            取消收藏
          </el-button>
        </div>
      </div>

      <div v-else class="cfEmpty flex col ac jc">
        <img class="cfEmptyImg" src="/clone-assets/collect/empty.png" alt="" />
        <div class="cfEmptyText">这里空空的，什么都还没有收藏</div>
      </div>

      <div v-if="loadingMore" class="tc opc6 size20 pt20 pb10">加载中…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Picture } from "@element-plus/icons-vue";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  fetchCollectLessons,
  toggleCollect,
  unwrapCollectPage,
  type CollectLessonItem,
} from "@/api/course";
import { getToken } from "@/api/token";
import { ensureLogin } from "@/composables/useAuth";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import { localAsset } from "@/data/mall";

type TabName = "sentence" | "word";

const TABS: { name: TabName; label: string }[] = [
  { name: "sentence", label: "收藏的课程" },
  { name: "word", label: "收藏的单词库" },
];

const route = useRoute();
const router = useRouter();

const kind = computed<TabName>(() => (route.path.includes("/myCourse/word") ? "word" : "sentence"));
const tab = ref<TabName>(kind.value);
/** 收藏接口的 type：0=课程 1=单词集 */
const collectType = computed(() => (kind.value === "word" ? 1 : 0));

const listRef = ref<HTMLElement>();
const items = ref<CollectLessonItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const pageSize = 50;
const current = ref(1);
const finished = ref(false);
let requestSeq = 0;

/** 副标题：接口给了简介就用简介，字数少的单词集退化成「共 N 个单词」 */
function rowDesc(item: CollectLessonItem) {
  const desc = String(item.description || "").trim();
  if (desc) return desc;
  if (kind.value === "word") {
    return item.wordCount ? `共 ${item.wordCount} 个单词` : "单词集";
  }
  return item.courseNum ? `共 ${item.courseNum} 课时` : "课程";
}

function onTabChange(name: string | number) {
  const next = name as TabName;
  if (next === kind.value) return;
  void router.push(next === "word" ? "/myCourse/word" : "/myCourse/sentence");
}

function openDetail(item: CollectLessonItem) {
  void router.push(kind.value === "word" ? `/words/${item.courseId}` : `/courseMall/${item.courseId}`);
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

/** 取消收藏：设计稿就是一个按钮，点了直接取消并给反馈（要再收藏回课程详情/单词库即可） */
async function remove(item: CollectLessonItem) {
  try {
    await toggleCollect(item.courseId, collectType.value);
    items.value = items.value.filter((row) => String(row.courseId) !== String(item.courseId));
    ElMessage.success("已取消收藏");
  } catch {
    /* http 层已提示 */
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
  kind,
  (value) => {
    tab.value = value;
    void loadList(true);
  },
  { immediate: false },
);

onMounted(() => {
  void boot();
});
</script>
