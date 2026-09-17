<template>
  <div class="contentBox textbookPage">
    <header class="tbHead flex jb ac">
      <div class="tbHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="tbMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <el-skeleton v-if="loadingCats" class="tbGrades flex ac" animated>
          <template #template>
            <el-skeleton-item v-for="n in 6" :key="n" variant="button" class="tbSkeletonTab" />
          </template>
        </el-skeleton>
        <div v-else class="tbGrades flex ac">
          <button
            v-for="item in gradeTabs"
            :key="item.id"
            type="button"
            class="tbGrade"
            :class="{ tbGradeAct: isActive(gradeId, item.id) }"
            @click="gradeId = item.id"
          >
            {{ item.name }}
          </button>
        </div>
      </div>

      <UserDropdown />
    </header>

    <el-skeleton v-if="loadingCats" class="tbEditions flex ac" animated>
      <template #template>
        <el-skeleton-item v-for="n in 6" :key="n" variant="button" class="tbSkeletonTab" />
      </template>
    </el-skeleton>
    <div v-else-if="editionTabs.length" class="tbEditions flex ac">
      <button
        v-for="item in editionTabs"
        :key="item.id"
        type="button"
        class="tbEdition"
        :class="{ tbEditionAct: isActive(editionId, item.id) }"
        @click="editionId = item.id"
      >
        {{ item.name }}
        <span class="tbEditionBar" />
      </button>
    </div>

    <div class="tbBody">
      <el-skeleton v-if="loadingList" animated>
        <template #template>
          <div class="tbGrid">
            <div v-for="n in 10" :key="n" class="tbCard tbSkeletonCard">
              <el-skeleton-item variant="image" class="tbSkeletonCover" />
              <div class="tbInfo">
                <el-skeleton-item variant="text" class="tbSkeletonLine tbSkeletonLineTitle" />
                <el-skeleton-item variant="text" class="tbSkeletonLine tbSkeletonLineDesc" />
                <div class="tbTags flex ac">
                  <el-skeleton-item variant="button" class="tbSkeletonTag" />
                  <el-skeleton-item variant="button" class="tbSkeletonTag" />
                  <el-skeleton-item variant="button" class="tbSkeletonTagWide" />
                </div>
                <el-skeleton-item variant="text" class="tbSkeletonBar" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      <div v-else-if="books.length" class="tbGrid">
        <article
          v-for="book in books"
          :key="book.id"
          class="tbCard hand"
          @click="openBook(book)"
        >
          <img class="tbCover" :src="book.cover" :alt="book.title" />
          <div class="tbInfo">
            <div class="tbTitle line1">{{ book.title }}</div>
            <div class="tbDesc line1">{{ book.desc }}</div>
            <div class="tbTags flex ac">
              <span
                v-for="tag in book.tags"
                :key="tag.name"
                class="tbTag"
                :style="{ background: tag.bg, color: tag.color }"
              >
                {{ tag.name }}
              </span>
              <span v-if="book.units > 0" class="tbTag tbTagUnit">{{ book.unitText }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="tbEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="tbEmptyImg" alt="" />
        <div class="tbEmptyText">该条件下暂无教材</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  CATEGORY_KIND,
  fetchCourseCategories,
  fetchCourses,
  unwrapCoursePage,
  type CourseCategory,
  type CourseVo,
} from "@/api/course";
import { localAsset } from "@/data/mall";
import { editionTone, gradeTone } from "@/data/textbook";

/**
 * 教材页数据全部来自接口（接口已把分类拍平，children 恒为 []）：
 *  - /course/categories?type=1 → 按 kind 分成两行：2=年级、3=版本
 *  - /courses?type=1&gradeCategoryId=&versionCategoryId= → 当前年级 + 版本下的教材
 */
interface TabItem {
  id: number | string;
  name: string;
}

interface CardTag {
  name: string;
  bg: string;
  color: string;
}

interface TextbookCard {
  id: number | string;
  title: string;
  desc: string;
  tags: CardTag[];
  units: number;
  unitText: string;
  cover: string;
}

const gradeCats = ref<CourseCategory[]>([]);
const editionCats = ref<CourseCategory[]>([]);
const gradeId = ref<number | string>("");
const editionId = ref<number | string>("");
const books = ref<TextbookCard[]>([]);
/** 分类接口返回前显示骨架屏，避免先闪一帧空状态 */
const loadingCats = ref(true);
const loadingList = ref(true);
/** 首屏（分类 + 第一份列表）加载完成前不响应 watch，避免重复请求 */
let inited = false;
let requestSeq = 0;

const gradeTabs = computed<TabItem[]>(() =>
  gradeCats.value.map((item) => ({ id: item.id, name: String(item.name || "").trim() })),
);
const editionTabs = computed<TabItem[]>(() =>
  editionCats.value.map((item) => ({ id: item.id, name: String(item.name || "").trim() })),
);

/** id 一律按字符串比较（后端把 Long 序列化成了字符串） */
function isActive(current: number | string, id: number | string) {
  return String(current) === String(id);
}

function toCard(course: CourseVo, index: number): TextbookCard {
  const categories = Array.isArray(course.categories) ? course.categories : [];
  // 标签优先用卡片自带的 categories，接口没给就退回当前选中的年级 / 版本
  const gradeName = nameOfKind(categories, CATEGORY_KIND.GRADE) || tabName(gradeTabs.value, gradeId.value);
  const editionName =
    nameOfKind(categories, CATEGORY_KIND.EDITION) || tabName(editionTabs.value, editionId.value);
  const tags: CardTag[] = [];
  if (gradeName) tags.push({ name: gradeName, ...gradeTone });
  if (editionName) tags.push({ name: editionName, ...toneOf(editionName) });

  const courseNum = pickNumber(course.courseNum, 0);
  return {
    id: course.id ?? `card-${index}`,
    title: String(course.name || "").trim(),
    desc: String(course.description ?? course.describe ?? "").trim(),
    tags,
    units: courseNum,
    unitText: `共${courseNum}课`,
    cover: coverOf(course, index),
  };
}

function nameOfKind(categories: { kind?: number; name?: string }[], kind: number) {
  const matched = categories.find(
    (item) => Number(item.kind) === kind && String(item.name || "").trim(),
  );
  return matched ? String(matched.name).trim() : "";
}

/** 当前选中的 Tab 名，用于卡片没有 categories 的情况 */
function tabName(tabs: TabItem[], id: number | string) {
  return tabs.find((item) => isActive(id, item.id))?.name ?? "";
}

/** 卡片封面：接口给了就用；没给就从设计稿封面里按下标轮着用 */
function coverOf(course: CourseVo, index: number) {
  const remote = course.cover || course.image;
  if (remote) return localAsset(String(remote));
  return `/clone-assets/textbook/cover-${String((index % 10) + 1).padStart(2, "0")}.png`;
}

function pickNumber(value: unknown, fallback: number) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/** 版本标签配色：先精确匹配，再包含匹配（接口给的是「人教版PEP」这类名字），最后按名字散列取色 */
function toneOf(name: string) {
  const exact = editionTone[name];
  if (exact) return exact;
  const key = Object.keys(editionTone).find((item) => name.includes(item) || item.includes(name));
  if (key) return editionTone[key];
  return tagPalette[hash(name) % tagPalette.length];
}

const tagPalette = [
  { bg: "#DAECFF", color: "#0056B5" },
  { bg: "#DCFFDA", color: "#038C23" },
  { bg: "#FFE9E9", color: "#8C0303" },
  { bg: "#F6E9FF", color: "#17038C" },
];

function hash(text: string) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) % 9973;
  return value;
}

function openBook(book: TextbookCard) {
  ElMessage.info(`${book.title}即将上线`);
}

async function loadCategories() {
  loadingCats.value = true;
  try {
    const raw = await fetchCourseCategories({ type: 1 });
    const list = Array.isArray(raw) ? raw : [];
    gradeCats.value = list.filter((item) => Number(item.kind) === CATEGORY_KIND.GRADE);
    editionCats.value = list.filter((item) => Number(item.kind) === CATEGORY_KIND.EDITION);
  } catch {
    gradeCats.value = [];
    editionCats.value = [];
  } finally {
    loadingCats.value = false;
  }
  if (!gradeTabs.value.some((item) => isActive(gradeId.value, item.id))) {
    gradeId.value = gradeTabs.value[0]?.id ?? "";
  }
  if (!editionTabs.value.some((item) => isActive(editionId.value, item.id))) {
    editionId.value = editionTabs.value[0]?.id ?? "";
  }
}

async function loadBooks() {
  const seq = ++requestSeq;
  loadingList.value = true;
  try {
    const page = await fetchCourses({
      type: 1,
      gradeCategoryId: gradeId.value === "" ? undefined : gradeId.value,
      versionCategoryId: editionId.value === "" ? undefined : editionId.value,
      page: 1,
      limit: 100,
    });
    if (seq !== requestSeq) return;
    books.value = unwrapCoursePage(page).records.map(toCard);
  } catch {
    if (seq === requestSeq) books.value = [];
  } finally {
    if (seq === requestSeq) loadingList.value = false;
  }
}

watch([gradeId, editionId], () => {
  if (inited) void loadBooks();
});

onMounted(async () => {
  await loadCategories();
  await loadBooks();
  inited = true;
});
</script>
