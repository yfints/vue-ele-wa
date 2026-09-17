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
        <div class="tbGrades flex ac">
          <button
            v-for="item in gradeTabs"
            :key="item"
            type="button"
            class="tbGrade"
            :class="{ tbGradeAct: grade === item }"
            @click="grade = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <UserDropdown />
    </header>

    <div class="tbEditions flex ac" v-if="editionTabs.length">
      <button
        v-for="item in editionTabs"
        :key="item"
        type="button"
        class="tbEdition"
        :class="{ tbEditionAct: edition === item }"
        @click="edition = item"
      >
        {{ item }}
        <span class="tbEditionBar" />
      </button>
    </div>

    <div class="tbBody">
      <div v-if="visibleList.length" class="tbGrid">
        <article
          v-for="book in visibleList"
          :key="book.id"
          class="tbCard hand"
          @click="openBook(book)"
        >
          <img class="tbCover" :src="book.cover" :alt="book.title" />
          <div class="tbInfo">
            <div class="tbTitle line1">{{ book.title }}</div>
            <div class="tbDesc line1">{{ book.desc }}</div>
            <div class="tbTags flex ac">
              <span class="tbTag" :style="{ background: gradeTone.bg, color: gradeTone.color }">
                {{ book.grade }}
              </span>
              <span
                class="tbTag"
                :style="{ background: toneOf(book.edition).bg, color: toneOf(book.edition).color }"
              >
                {{ book.edition }}
              </span>
            <span v-if="book.units > 0" class="tbTag tbTagUnit">共{{ book.units }}单元</span>
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
import { fetchCourseCategories, type CourseCategory } from "@/api/course";
import { localAsset } from "@/data/mall";
import {
  editionTone,
  gradeTone,
  textbookEditions,
  textbookGrades,
  textbookList,
  type TextbookItem,
} from "@/data/textbook";

/**
 * 教材分类树：/course/categories?type=1（教材同步）返回的结构是
 * 顶层 = 年级，children = 该年级下的版本（人教版 / 外研版 …）。
 * 空数组表示接口没拿到数据（含未登录 401），此时退回设计稿的静态列表。
 */
interface CategoryNode extends CourseCategory {
  children?: CategoryNode[];
  /** 卡片节点上可能带的字段 */
  grade?: string;
  edition?: string;
  version?: string;
  unitNum?: number;
  unit_num?: number;
  pic?: string;
}

const grade = ref("");
const edition = ref("");
const categoryTree = ref<CategoryNode[]>([]);

/** 年级行：顶层分类名 */
const gradeNames = computed(() => {
  const names = categoryTree.value.map((node) => String(node.name || "").trim()).filter(Boolean);
  return names.length ? names : textbookGrades.filter((name) => name !== "全部");
});

/** 版本行：接口的 children 字段；「全部」年级时取所有年级的 children 并集 */
const editionNames = computed(() => {
  const tree = categoryTree.value;
  if (!tree.length) return textbookEditions.filter((name) => name !== "全部版本");

  const parents = grade.value
    ? tree.filter((node) => nameMatched(String(node.name || ""), grade.value))
    : tree;
  const names: string[] = [];
  for (const parent of parents) {
    for (const child of parent.children || []) {
      const name = String(child.name || "").trim();
      if (!name || name === "全部版本" || names.includes(name)) continue;
      // 没有第三层（教材）的版本不展示，例如数据里的「新概念英语」
      if (!child.children || !child.children.length) continue;
      names.push(name);
    }
  }
  if (names.length) return names;

  // 兜底：接口给的是扁平列表（全都没有 children）时按名称判别
  const hasChildren = tree.some((node) => (node.children || []).length > 0);
  if (!hasChildren) {
    const flat = tree
      .map((node) => String(node.name || "").trim())
      .filter((name) => name && name !== "全部" && name !== "全部版本" && !isGradeName(name));
    if (flat.length) return flat;
  }
  return [];
});

/** 年级行不再带「全部」，默认选中第一个年级 */
const gradeTabs = computed(() => gradeNames.value);
/** 版本行也不带「全部版本」，默认选中当前年级的第一个版本 */
const editionTabs = computed(() => editionNames.value);

/**
 * 卡片数据 = 树的第三层：年级.children（版本）→ children（教材）。
 * 版本下没有第三层时，就把版本本身当一张卡片兜底。
 */
const apiCards = computed<TextbookItem[]>(() => {
  const tree = categoryTree.value;
  if (!tree.length) return [];
  const out: TextbookItem[] = [];
  for (const gradeNode of tree) {
    const gradeName = String(gradeNode.name || "").trim();
    for (const editionNode of gradeNode.children || []) {
      const editionName = String(editionNode.name || "").trim();
      // 只渲染第三层教材；没有 children 的节点（例如「新概念英语」）直接跳过，不当作卡片
      for (const item of editionNode.children || []) {
        out.push(toCard(item, gradeName, editionName, out.length));
      }
    }
  }
  return out;
});

/** 接口没卡片数据时，用设计稿的本地列表兜底 */
const sourceList = computed(() => (apiCards.value.length ? apiCards.value : textbookList));

const visibleList = computed(() =>
  sourceList.value.filter(
    (book) => nameMatched(book.grade, grade.value) && nameMatched(book.edition, edition.value),
  ),
);

function toCard(
  node: CategoryNode,
  gradeName: string,
  editionName: string,
  index: number,
): TextbookItem {
  const name = String(node.name || "").trim();
  return {
    id: node.id ?? `card-${index}`,
    title: name || [editionName, gradeName].filter(Boolean).join("・"),
    desc: String(node.description ?? node.describe ?? "").trim(),
    grade: String(node.grade || gradeName),
    edition: String(node.edition || node.version || editionName),
    units: pickNumber(node.courseNum ?? node.course_num ?? node.unitNum ?? node.unit_num, 0),
    cover: coverOf(node, gradeName, editionName, index),
  };
}

/** 卡片封面：接口有图就用接口的，没有就从设计稿封面里按「版本+年级」挑一张，再不行按下标轮着用 */
function coverOf(
  node: CategoryNode,
  gradeName: string,
  editionName: string,
  index: number,
) {
  const remote = node.cover || node.image || node.icon || node.pic;
  if (remote) return localAsset(remote);
  const matched = textbookList.find(
    (book) => book.title.includes(editionName) && book.title.includes(gradeName),
  );
  if (matched) return matched.cover;
  return textbookList[index % textbookList.length].cover;
}

function pickNumber(value: unknown, fallback: number) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/** 分类名可能带后缀（例如「人教版2024」「三年级上册」），先精确匹配再退化成包含匹配 */
function nameMatched(target: string, selected: string) {
  if (!selected) return true;
  if (target === selected) return true;
  return selected.includes(target) || target.includes(selected);
}

/** 简单判别：「…年级 / 高一二三」算年级，用于扁平列表兜底 */
function isGradeName(name: string) {
  return /(年级|^高[一二三]$|^初[一二三]$)/.test(name);
}

function toneOf(name: string) {
  return editionTone[name] || gradeTone;
}

function openBook(book: TextbookItem) {
  ElMessage.info(`${book.title}即将上线`);
}

/** 年级列表就绪（或变了）时，默认选中第一个 */
watch(
  gradeNames,
  (names) => {
    if (names.length && !names.includes(grade.value)) grade.value = names[0];
  },
  { immediate: true },
);

/** 版本列表就绪（或随年级变化）时，默认选中第一个；原来选的还在就保留 */
watch(
  editionNames,
  (names) => {
    if (names.length && !names.includes(edition.value)) edition.value = names[0];
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    const raw = await fetchCourseCategories({ type: 1 });
    categoryTree.value = toTree(raw);
  } catch {
    categoryTree.value = [];
  }
});

/** 接口可能直接返回数组，也可能包一层（例如 { records: [...] }） */
function toTree(raw: unknown): CategoryNode[] {
  if (Array.isArray(raw)) return raw as CategoryNode[];
  if (raw && typeof raw === "object") {
    for (const value of Object.values(raw as Record<string, unknown>)) {
      if (Array.isArray(value)) return value as CategoryNode[];
    }
  }
  return [];
}
</script>
