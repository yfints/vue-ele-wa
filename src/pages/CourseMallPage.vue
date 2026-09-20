<template>
  <div class="contentBox courseMallPage">
    <header class="cmHead flex jb ac">
      <div class="cmHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="cmMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="cmTabs flex ac">
          <button
            type="button"
            class="cmTab"
            :class="{ cmTabAct: categoryId === 0 }"
            @click="categoryId = 0"
          >
            全部
          </button>
          <button
            v-for="category in lessonCategories"
            :key="category.id"
            type="button"
            class="cmTab"
            :class="{ cmTabAct: categoryId === category.id }"
            @click="categoryId = category.id"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div ref="listRef" class="pageScroll cmBody" @scroll="onListScroll">
      <el-skeleton v-if="loading" animated>
        <template #template>
          <div class="cmGrid">
            <div v-for="n in 10" :key="n" class="cmCard">
              <el-skeleton-item variant="image" class="cmSkeletonCover" />
              <div class="cmInfo">
                <el-skeleton-item variant="text" class="cmSkeletonTitle" />
                <div class="cmTags flex ac">
                  <el-skeleton-item variant="button" class="cmSkeletonTag" />
                  <el-skeleton-item variant="button" class="cmSkeletonTag" />
                </div>
                <el-skeleton-item variant="text" class="cmSkeletonBar" />
                <el-skeleton-item variant="text" class="cmSkeletonLearned" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>

      <div v-else-if="filtered.length" class="cmGrid">
        <MallCard
          v-for="lesson in filtered"
          :key="lesson.id"
          :lesson="lesson"
          :faved="isFav(lesson.id)"
          @collect="toggleFav"
        />
      </div>

      <div v-else class="cmEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="cmEmptyImg" alt="" />
        <div class="cmEmptyText">暂无课程</div>
      </div>

      <div v-if="loadingMore" class="tc opc6 size20 pt20 pb10">加载中…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import MallCard from "@/components/MallCard.vue";
import UserDropdown from "@/components/UserDropdown.vue";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import { isLoggedIn, ensureLogin } from "@/composables/useAuth";
import { getToken } from "@/api/token";
import { toMallLesson, type MallLesson } from "@/data/mall";
import {
  fetchLessonDetails,
  fetchCollectLessons,
  fetchCourseCategories,
  fetchCourses,
  toggleCollect,
  unwrapCollectPage,
  unwrapCoursePage,
  type CourseCategory,
} from "@/api/course";

const listRef = ref<HTMLElement>();
const categoryId = ref<number | string>(0);
const lessonCategories = ref<CourseCategory[]>([]);
const filtered = ref<MallLesson[]>([]);
const mallTotal = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const pageSize = 20;
const current = ref(1);
const finished = ref(false);
/** 收藏的课程 id（课程广场是 type=0 的收藏夹） */
const favIds = ref<string[]>([]);
let requestSeq = 0;

async function loadCategories() {
  try {
    const list = await fetchCourseCategories({type:0});
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
      // 课程广场用 type=0 取分类，列表同样按 type=0 过滤
      type: 0,
      categoryId: categoryId.value === 0 ? undefined : categoryId.value,
      page: current.value,
      limit: pageSize,
      current: current.value,
      size: pageSize,
    });
    if (seq !== requestSeq) return;
    const records = unwrapCoursePage(result).records;
    const items = records.map(toMallLesson);
    if (reset) filtered.value = items;
    else filtered.value.push(...items);
    // 注意：必须从 filtered（响应式代理）里取卡片再改，直接改 items 里的原始对象不会触发更新
    void hydrateProgress();
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

function isFav(id: number | string) {
  return favIds.value.includes(String(id));
}

/** 已经问过进度接口的课程 id（含查不到结果的，避免重复请求） */
const progressAsked = new Set<string>();

/**
 * 课程广场的卡片要显示「已学 x/y 课时」，但列表接口不下发 progress，
 * 只有课程详情接口有。这里只对「已加入学习计划」的课程补一次详情，
 * 其余课程按 0 进度展示（和设计稿里「已学 0/15 课时」一致）。
 */
async function hydrateProgress() {
  const targets = filtered.value.filter((item) => {
    const id = String(item.id);
    if (progressAsked.has(id)) return false;
    if (item.progress && typeof item.progress === "object") return false;
    return Boolean(item.is_have) || Boolean(item.user_lesson_id);
  });
  targets.forEach((item) => progressAsked.add(String(item.id)));
  if (!targets.length) return;

  const queue = [...targets];
  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) break;
      try {
        const detail = await fetchLessonDetails(item.id);
        if (detail?.progress) item.progress = detail.progress;
        if (Number(detail?.courseNum)) item.courseNum = Number(detail?.courseNum);
      } catch {
        /* 详情拿不到就按 0 进度展示，不影响列表 */
      }
    }
  });
  await Promise.all(workers);
}

/** 页面加载时拉一次已收藏课程（未登录跳过） */
async function loadFavs() {
  if (!getToken()) {
    favIds.value = [];
    return;
  }
  try {
    const data = await fetchCollectLessons({ type: 0, page: 1, limit: 100 });
    favIds.value = unwrapCollectPage(data).items.map((item) => String(item.courseId));
  } catch {
    favIds.value = [];
  }
}

/** 卡片上的爱心：切换收藏（未登录先引导登录） */
async function toggleFav(lesson: MallLesson) {
  if (!isLoggedIn.value) {
    await ensureLogin();
    return;
  }
  const id = String(lesson.id);
  const faved = favIds.value.includes(id);
  try {
    await toggleCollect(id, 0);
    favIds.value = faved
      ? favIds.value.filter((item) => item !== id)
      : [...favIds.value, id];
    ElMessage.success(faved ? "已取消收藏" : "已加入收藏");
  } catch {
    /* http 层已提示 */
  }
}

watch(categoryId, () => {
  listRef.value?.scrollTo({ top: 0 });
  void loadCourses(true);
});

onMounted(() => {
  void loadCategories();
  void loadCourses(true);
  void loadFavs();
});
</script>
