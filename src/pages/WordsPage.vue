<template>
  <div class="contentBox wordsPage">
    <header class="wdHead flex jb ac">
      <div class="wdHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="wdMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="wdTabs flex ac">
          <button
            v-for="item in tabs"
            :key="item.id"
            type="button"
            class="wdTab"
            :class="{ wdTabAct: isActive(categoryId, item.id) }"
            @click="categoryId = item.id"
          >
            {{ item.name }}
          </button>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div v-loading="loading" class="wdBody">
      <div v-if="cards.length" class="wdGrid">
        <article
          v-for="book in cards"
          :key="book.id"
          class="wdCard"
          @click="openBook(book)"
        >
          <div class="wdCover" :style="{ '--wd-tone': book.tone }">
            <img class="wdIcon" :src="book.icon" :alt="book.title" />
            <button
              type="button"
              class="wdFav"
              :aria-label="isFav(book.id) ? '取消收藏' : '收藏'"
              @click.stop="toggleFav(book)"
            >
              <img
                :src="isFav(book.id) ? '/clone-assets/words/heart-active.svg' : '/clone-assets/words/heart.svg'"
                alt=""
              />
            </button>
          </div>
          <div class="wdInfo">
            <div class="wdTitle line1">{{ book.title }}</div>
            <div class="wdDesc line1">{{ book.desc }}</div>
            <div class="wdTags flex ac">
              <span v-for="tag in book.tags" :key="tag" class="wdTag">{{ tag }}</span>
            </div>
            <div class="wdProgress flex ac jb">
              <div class="wdBar">
                <div class="wdBarFill" :style="{ width: `${book.learned}%` }" />
              </div>
              <span class="wdLearned">已学{{ book.learned }}%</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else-if="!loading" class="wdEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="wdEmptyImg" alt="" />
        <div class="wdEmptyText">该分类下暂无词库</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  CATEGORY_KIND,
  fetchCollectLessons,
  fetchCourseCategories,
  fetchCourses,
  fetchStudyPlanWords,
  toggleCollect,
  unwrapCollectPage,
  unwrapCoursePage,
  type CourseCategory,
  type CourseVo,
} from "@/api/course";
import { unwrapWordPlan } from "@/api/words";
import { getToken } from "@/api/token";
import { wordIcon, wordTone } from "@/data/words";

/**
 * 单词库数据全部来自接口：
 *  - /course/categories?kind=4 → 顶部「单词集分类」Tab
 *  - /courses?categoryId=      → 该分类下的单词集（课程列表接口没有 kind 参数，只能按分类 id 过滤）
 *  - /study-plan/words         → 我加入的单词计划，用来算卡片上的「已学 x%」
 *  - /collect/lessons?type=1   → 单词收藏夹，用来点亮卡片上的爱心
 */
interface TabItem {
  id: string;
  name: string;
}

interface WordSetCard {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  learned: number;
  tone: string;
  icon: string;
}

/** 「全部」用空 id 表示 */
const ALL = "";
const tabs = ref<TabItem[]>([{ id: ALL, name: "全部" }]);
const categoryId = ref<string>(ALL);
const cards = ref<WordSetCard[]>([]);
const loading = ref(true);
const favIds = ref<string[]>([]);
/** courseId → 已学百分比 */
const progressMap = ref<Record<string, number>>({});

/** 分类接口返回的分类，用于「全部」时逐个分类取列表 */
const wordCategories = ref<CourseCategory[]>([]);
let inited = false;
let requestSeq = 0;

const router = useRouter();

/** id 一律按字符串比较（后端把 Long 序列化成字符串） */
function isActive(current: string, id: string) {
  return String(current) === String(id);
}

function toCard(course: CourseVo, index: number): WordSetCard {
  const categories = Array.isArray(course.categories) ? course.categories : [];
  const tagNames = categories
    .map((item) => String(item.name || "").trim())
    .filter(Boolean);
  const tags = tagNames.slice(0, 1);
  return {
    id: String(course.id),
    title: String(course.name || "").trim(),
    desc: String(course.description ?? course.describe ?? "").trim(),
    tags,
    learned: progressMap.value[String(course.id)] ?? 0,
    tone: wordTone(index),
    icon: course.cover || wordIcon(index),
  };
}

function isFav(id: string) {
  return favIds.value.includes(String(id));
}

function openBook(book: WordSetCard) {
  void router.push(`/words/${book.id}`);
}

async function loadCategoryTab() {
  try {
    const raw = await fetchCourseCategories({ kind: CATEGORY_KIND.WORD });
    const list = Array.isArray(raw) ? raw : [];
    // 接口已按 kind 过滤；万一是老接口把全部平铺返回，再兜一层按 kind 过滤
    const hasKind = list.some((item) => item.kind !== undefined && item.kind !== null);
    wordCategories.value = hasKind
      ? list.filter((item) => Number(item.kind) === CATEGORY_KIND.WORD)
      : list;
  } catch {
    wordCategories.value = [];
  }
  tabs.value = [
    { id: ALL, name: "全部" },
    ...wordCategories.value.map((item) => ({
      id: String(item.id),
      name: String(item.name || "").trim(),
    })),
  ];
}

/** 单个分类下的单词集 */
async function fetchByCategory(id: string) {
  const page = await fetchCourses({
    categoryId: id,
    page: 1,
    limit: 100,
  });
  return unwrapCoursePage(page).records;
}

/**
 * 课程列表接口没有 kind 参数，「全部」就按 kind=4 的分类逐个取再合并去重；
 * 分类没取到时退回扫描课程列表，按卡片的 kind=4 标签过滤。
 */
async function fetchAll() {
  if (wordCategories.value.length) {
    const groups = await Promise.all(
      wordCategories.value.map((item) => fetchByCategory(String(item.id))),
    );
    const merged = new Map<string, CourseVo>();
    groups.flat().forEach((course) => {
      if (course?.id != null) merged.set(String(course.id), course);
    });
    return [...merged.values()];
  }
  const page = await fetchCourses({ page: 1, limit: 100 });
  return unwrapCoursePage(page).records.filter((course) =>
    (course.categories || []).some((item) => Number(item.kind) === CATEGORY_KIND.WORD),
  );
}

async function loadList() {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const records = categoryId.value ? await fetchByCategory(categoryId.value) : await fetchAll();
    if (seq !== requestSeq) return;
    cards.value = records.map(toCard);
  } catch {
    if (seq === requestSeq) cards.value = [];
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}

/** 我加入的单词计划：算出每个单词集的已学进度 */
async function loadProgress() {
  if (!getToken()) {
    progressMap.value = {};
    return;
  }
  try {
    const data = await fetchStudyPlanWords({ page: 1, limit: 100 });
    const map: Record<string, number> = {};
    unwrapWordPlan(data).forEach((entry) => {
      const total = Number(entry.wordCount ?? 0) || 0;
      const learned = Number(entry.learnedWordCount ?? 0) || 0;
      if (total > 0 && entry.lessonId != null) {
        map[String(entry.lessonId)] = Math.min(100, Math.round((learned / total) * 100));
      }
    });
    progressMap.value = map;
  } catch {
    progressMap.value = {};
  }
}

/** 单词收藏夹：收藏 / 取消收藏走 type=1 */
async function loadCollect() {
  if (!getToken()) {
    favIds.value = [];
    return;
  }
  try {
    const data = await fetchCollectLessons({ type: 1, page: 1, limit: 100 });
    favIds.value = unwrapCollectPage(data).items.map((item) => String(item.courseId));
  } catch {
    favIds.value = [];
  }
}

async function toggleFav(book: WordSetCard) {
  if (!getToken()) {
    ElMessage.warning("请先登录");
    return;
  }
  try {
    await toggleCollect(book.id, 1);
    favIds.value = isFav(book.id)
      ? favIds.value.filter((id) => id !== book.id)
      : [...favIds.value, book.id];
  } catch {
    /* unwrap 已提示 */
  }
}

async function refresh() {
  await Promise.all([loadProgress(), loadCollect()]);
  await loadList();
}

watch(categoryId, () => {
  if (inited) void loadList();
});

onMounted(async () => {
  await loadCategoryTab();
  await refresh();
  inited = true;
});
</script>
