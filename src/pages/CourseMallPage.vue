<template>
  <div class="contentBox">
    <div class="pl30 pr30 pt30">
      <div class="cates">
        <div class="flex jb ac pb20">
          <div class="flex ac">
            <button
              type="button"
              class="cate gray mr20"
              :class="{ cateAct: categoryId === 0 }"
              @click="categoryId = 0"
            >
              全部
            </button>
            <button
              v-for="category in lessonCategories"
              :key="category.id"
              type="button"
              class="cate gray mr20"
              :class="{ cateAct: categoryId === category.id }"
              @click="categoryId = category.id"
            >
              {{ category.name }}
            </button>
          </div>
<!--          <div class="flex0">
            <el-link type="info" :underline="'hover'" :href="moreCoursesUrl">
              <el-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M192 736h640V128H256a64 64 0 0 0-64 64zm64-672h608a32 32 0 0 1 32 32v672a32 32 0 0 1-32 32H160l-32 57.536V192A128 128 0 0 1 256 64"
                  />
                  <path
                    fill="currentColor"
                    d="M240 800a48 48 0 1 0 0 96h592v-96zm0-64h656v160a64 64 0 0 1-64 64H240a112 112 0 0 1 0-224m144-608v250.88l96-76.8 96 76.8V128zm-64-64h320v381.44a32 32 0 0 1-51.968 24.96L480 384l-108.032 86.4A32 32 0 0 1 320 445.44z"
                  />
                </svg>
              </el-icon>
              想要更多课程？
            </el-link>
          </div>-->
        </div>
      </div>
      <div
        ref="listRef"
        v-loading="loading"
        class="pageScroll listScroll"
        @scroll="onListScroll"
      >
        <el-empty v-if="!loading && !filtered.length" description="暂无课程" />
        <div v-else class="gridContainer">
          <MallCard v-for="lesson in filtered" :key="lesson.id" :lesson="lesson" />
        </div>
        <div v-if="loadingMore" class="tc opc6 size20 pt20 pb10">加载中…</div>
        <div class="opc6 size20 mt30 pb20">共 {{ mallTotal }} 门课，当前展示 {{ filtered.length }} 门</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import MallCard from "@/components/MallCard.vue";
import { toMallLesson, type MallLesson } from "@/data/mall";
import {
  fetchCourseCategories,
  fetchCourses,
  type CourseCategory,
} from "@/api/course";

const moreCoursesUrl = "https://hcn2xg5ch01u.feishu.cn/share/base/form/shrcnxt6O7BuVRjxTvMYoOJHyEh";
const listRef = ref<HTMLElement>();
const categoryId = ref(0);
const lessonCategories = ref<CourseCategory[]>([]);
const filtered = ref<MallLesson[]>([]);
const mallTotal = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const pageSize = 20;
const current = ref(1);
const finished = ref(false);
let requestSeq = 0;

async function loadCategories() {
  try {
    const list = await fetchCourseCategories();
    lessonCategories.value = Array.isArray(list) ? list : [];
  } catch {
    lessonCategories.value = [];
  }
}

async function loadCourses(reset = false) {
  if (!reset && (loading.value || loadingMore.value || finished.value)) return;
  const seq = ++requestSeq;
  if (reset) {
    current.value = 1;
    finished.value = false;
    filtered.value = [];
    mallTotal.value = 0;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }
  try {
    const result = await fetchCourses({
      categoryId: categoryId.value || undefined,
      current: current.value,
      size: pageSize,
    });
    if (seq !== requestSeq) return;
    const records = result?.records || [];
    const items = records.map(toMallLesson);
    if (reset) filtered.value = items;
    else filtered.value.push(...items);
    mallTotal.value = Number(result?.total ?? mallTotal.value);
    if (items.length < pageSize || filtered.value.length >= mallTotal.value) {
      finished.value = true;
    }
    current.value += 1;
  } catch {
    if (reset) {
      filtered.value = [];
      mallTotal.value = 0;
    }
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
    void loadCourses();
  }
}

function ensureFill() {
  const el = listRef.value;
  if (!el || loading.value || loadingMore.value || finished.value) return;
  if (el.scrollHeight <= el.clientHeight) {
    void loadCourses();
  }
}

watch(categoryId, () => {
  listRef.value?.scrollTo({ top: 0 });
  void loadCourses(true);
});

onMounted(() => {
  void loadCategories();
  void loadCourses(true);
});
</script>
