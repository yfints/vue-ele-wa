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

    <div class="wdBody">
      <el-skeleton v-if="loading" animated>
        <template #template>
          <div class="wdGrid">
            <div v-for="n in 10" :key="n" class="wdCard">
              <el-skeleton-item variant="image" class="wdSkeletonCover" />
              <div class="wdInfo">
                <el-skeleton-item variant="text" class="wdSkeletonTitle" />
                <el-skeleton-item variant="text" class="wdSkeletonDesc" />
                <div class="wdTags flex ac">
                  <el-skeleton-item variant="button" class="wdSkeletonTag" />
                  <el-skeleton-item variant="button" class="wdSkeletonTag" />
                </div>
                <div class="wdProgress flex ac jb">
                  <el-skeleton-item variant="text" class="wdSkeletonBar" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>

      <div v-else-if="cards.length" class="wdGrid">
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

      <div v-else class="wdEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="wdEmptyImg" alt="" />
        <div class="wdEmptyText">该分类下暂无词库</div>
      </div>

      <!-- 数据全部渲染完 + 到底了：底部提示 -->
      <div v-if="showEnd" class="listEnd flex ac jc">已经到底了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  CATEGORY_KIND,
  fetchCollectLessons,
  fetchCourseCategories,
  fetchCourses,
  toggleCollect,
  unwrapCollectPage,
  unwrapCoursePage,
  type CourseCategory,
  type CourseVo,
} from "@/api/course";
import { getToken } from "@/api/token";
import { wordIcon, wordTone } from "@/data/words";

/**
 * 单词库数据全部来自接口：
 *  - /course/categories?kind=4 → 顶部「单词集分类」Tab
 *  - /courses?categoryId=      → 该分类下的单词集（课程列表接口没有 kind 参数，只能按分类 id 过滤）
 *  - /collect/lessons?type=1   → 单词收藏夹，用来点亮卡片上的爱心
 * 卡片上的「已学 x%」直接取课程卡片的 progress 字段。
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

/** 列表一次取完，加载完且有条目就提示到底 */
const showEnd = computed(() => !loading.value && cards.value.length > 0);

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
    learned: learnedOf(course),
    tone: wordTone(index),
    icon: course.cover || wordIcon(index),
  };
}

/** 已学百分比由接口的 progress 下发 */
function learnedOf(course: CourseVo) {
  const value = Number(course.progress ?? course.percentage ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function isFav(id: string) {
  return favIds.value.includes(String(id));
}

function openBook(book: WordSetCard) {
  void router.push(`/words/${book.id}`);
}

async function loadCategoryTab() {
  try {
    // 单词库分类：/course/categories?type=4（kind=4）
    const raw = await fetchCourseCategories({ type: 4, kind: CATEGORY_KIND.WORD });
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

/**
 * 单词集列表：GET /courses?type=4&categoryId=<分类 id 或 0>
 * categoryId=0 就是「全部」（服务端把 0 当不过滤），卡片自带 wordCount / learnedNum / progress。
 */
async function fetchWordSets(id: string) {
  const page = await fetchCourses({
    type: 4,
    categoryId: id || 0,
    page: 1,
    limit: 100,
  });
  return unwrapCoursePage(page).records;
}

async function loadList() {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const records = await fetchWordSets(categoryId.value);
    if (seq !== requestSeq) return;
    cards.value = records.map(toCard);
  } catch {
    if (seq === requestSeq) cards.value = [];
  } finally {
    if (seq === requestSeq) loading.value = false;
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
  await loadCollect();
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
