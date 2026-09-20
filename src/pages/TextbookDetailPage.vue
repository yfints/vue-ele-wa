<template>
  <div class="contentBox textbookDetailPage">
    <header class="tbdHead flex jb ac">
      <div class="tbdHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="tbdMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="tbdCrumbs flex ac">
          <RouterLink to="/textbook/index" class="tbdCrumb">教材学习</RouterLink>
          <img src="/clone-assets/practice/icon-next.png" class="tbdCrumbSep" alt="" />
          <span class="tbdCrumbCur">课程详情</span>
        </div>
      </div>
      <UserDropdown />
    </header>

    <div class="tbdBody">
      <el-skeleton v-if="loading" animated>
        <template #template>
          <div class="tbdHero tbdSkeletonHero flex ac">
            <el-skeleton-item variant="image" class="tbdSkeletonCover" />
            <div class="flex1">
              <el-skeleton-item variant="text" class="tbdSkeletonTitle" />
              <el-skeleton-item variant="text" class="tbdSkeletonDesc" />
              <div class="tbdTags flex ac">
                <el-skeleton-item variant="button" class="tbdSkeletonTag" />
                <el-skeleton-item variant="button" class="tbdSkeletonTag" />
              </div>
            </div>
          </div>
          <div v-for="n in 2" :key="n" class="tbdUnit tbdSkeletonUnit">
            <el-skeleton-item variant="text" class="tbdSkeletonUnitTitle" />
            <div v-for="m in 2" :key="m" class="tbdLesson flex ac">
              <el-skeleton-item variant="circle" class="tbdSkeletonBadge" />
              <el-skeleton-item variant="text" class="tbdSkeletonLesson" />
            </div>
          </div>
        </template>
      </el-skeleton>

      <template v-else-if="detail">
        <section class="tbdHero flex ac">
          <img class="tbdCover" :src="cover" :alt="title" />
          <div class="tbdInfo flex col">
            <div class="tbdTitle line1">{{ title }}</div>
            <div class="tbdDesc line1">{{ desc || "在情境中学习，培养英语表达能力。" }}</div>
            <div class="tbdTags flex ac">
              <span
                v-for="tag in tags"
                :key="tag.name"
                class="tbdTag"
                :style="{ background: tag.bg, color: tag.color }"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          <img class="tbdDeco" src="/clone-assets/textbook/deco.png" alt="" />
          <button type="button" class="tbdStart hand" @click="startFrom(null)">开始学习</button>
        </section>

        <section v-for="group in groups" :key="group.title" class="tbdUnit">
          <div class="tbdUnitHead">
            <span class="tbdUnitTitle">{{ group.title }}</span>
          </div>
          <div class="tbdLessons flex col">
            <button
              v-for="(lesson, index) in group.lessons"
              :key="String(lesson.id)"
              type="button"
              class="tbdLesson flex ac hand"
              @click="startFrom(lesson)"
            >
              <span class="tbdBadge flex ac jc">{{ lessonNo(lesson, index) }}</span>
              <span class="tbdLessonBody flex ac jb">
                <span class="tbdLessonName line1">{{ lesson.name }}</span>
                <span class="tbdLessonTime">{{ durationText(lesson) }}</span>
              </span>
            </button>
          </div>
        </section>
      </template>

      <div v-else class="tbdEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="tbdEmptyImg" alt="" />
        <div class="tbdEmptyText">暂无教材内容</div>
      </div>
    </div>

    <ModePop ref="modeRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import ModePop from "@/components/ModePop.vue";
import { getToken } from "@/api/token";
import { ensureLogin } from "@/composables/useAuth";
import { saveGameInfo } from "@/composables/useGame";
import {
  CATEGORY_KIND,
  fetchLessonDetails,
  type CourseDetailVo,
  type CourseLessonVo,
  type CourseUnitVo,
} from "@/api/course";
import { localAsset } from "@/data/mall";
import { editionTone, gradeTone } from "@/data/textbook";

interface CardTag {
  name: string;
  bg: string;
  color: string;
}

interface LessonGroup {
  title: string;
  lessons: CourseLessonVo[];
}

const route = useRoute();
const loading = ref(true);
const detail = ref<CourseDetailVo | null>(null);
const modeRef = ref<{ open: () => void } | null>(null);
let starting = false;

const title = computed(() => String(detail.value?.name || "").trim());
const desc = computed(() => String(detail.value?.description || "").trim());
const cover = computed(() => {
  const remote = detail.value?.cover;
  if (remote) return localAsset(String(remote));
  return "/clone-assets/textbook/cover-01.png";
});

/** 年级 / 版本标签 + 单元数，和教材列表卡片保持同一套取数与配色 */
const tags = computed<CardTag[]>(() => {
  const categories = Array.isArray(detail.value?.categories) ? detail.value?.categories || [] : [];
  const list: CardTag[] = [];
  const grade = nameOfKind(categories, CATEGORY_KIND.GRADE);
  const edition = nameOfKind(categories, CATEGORY_KIND.EDITION);
  if (grade) list.push({ name: grade, ...gradeTone });
  if (edition) list.push({ name: edition, ...toneOf(edition) });
  // 单元数读 unitCount（非教材课为 0），再退回 units.length，最后才用 courseNum 兜底
  const units =
    Number(detail.value?.unitCount || 0) ||
    (Array.isArray(detail.value?.units) ? detail.value?.units.length || 0 : 0) ||
    Number(detail.value?.courseNum || 0);
  if (units > 0) list.push({ name: `共${units}单元`, bg: "#EEEEEE", color: "#999999" });
  return list;
});

/**
 * 单元列表：接口给了 units 就直接用（后端已经分好组），
 * 老数据没有 units 时退回「按 lessons 自己分组」，两边都能渲染。
 */
const groups = computed<LessonGroup[]>(() => {
  const units = detail.value?.units;
  if (Array.isArray(units) && units.length) return groupsFromUnits(units);
  return groupLessons(detail.value?.lessons || []);
});

/** 详情页里用到的全部课时（开始学习 / 按 lastLessonId 找续学课时都基于它） */
const allLessons = computed<CourseLessonVo[]>(() =>
  groups.value.flatMap((group) => group.lessons),
);

function groupsFromUnits(units: CourseUnitVo[]): LessonGroup[] {
  return [...units]
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((unit, index) => ({
      title: unitTitle(unit, index),
      lessons: lessonsOfUnit(unit),
    }))
    .filter((group) => group.lessons.length > 0);
}

/** 单元名优先取接口的 unitTitle，其余字段 / 「Unit N」只是兜底 */
function unitTitle(unit: CourseUnitVo, index: number) {
  const name = [
    unit.unitTitle,
    unit.unitLabel,
    unit.unitName,
    unit.unit_name,
    unit.name,
    unit.title,
  ]
    .map((value) => String(value || "").trim())
    .find(Boolean);
  if (name) return name;
  const no = String(unit.unitNo ?? index + 1).trim();
  return `Unit ${no}`;
}

function lessonsOfUnit(unit: CourseUnitVo) {
  const list = unit.lessons || unit.lessonList || unit.lesson_list || [];
  return Array.isArray(list) ? list : [];
}

function nameOfKind(categories: { kind?: number; name?: string }[], kind: number) {
  const matched = categories.find((item) => Number(item.kind) === kind && String(item.name || "").trim());
  return matched ? String(matched.name).trim() : "";
}

function toneOf(name: string) {
  const exact = editionTone[name];
  if (exact) return exact;
  const key = Object.keys(editionTone).find((item) => name.includes(item) || item.includes(name));
  return key ? editionTone[key] : { bg: "#DAECFF", color: "#0056B5" };
}

function durationText(lesson: CourseLessonVo) {
  const minutes = Number(lesson.duration || 0);
  return minutes > 0 ? `${minutes}分钟` : "";
}

/** 课时行序号：接口的 num（单元内从 1 开始），没有才退回数组下标 */
function lessonNo(lesson: CourseLessonVo, index: number) {
  const num = Number(lesson.num);
  return Number.isFinite(num) && num > 0 ? num : index + 1;
}

/**
 * 课时按单元分组：
 * 1) 后端 lessonType 里带单元名的直接按它分组；
 * 2) 课时名以「Unit 1 xxx」开头的，剥掉前缀当组名，行内只留后半段；
 * 3) 都没有就整本作为一组，避免把课时拆散。
 */
function groupLessons(lessons: CourseLessonVo[]): LessonGroup[] {
  const sorted = [...lessons].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const groups: LessonGroup[] = [];
  const byKey = new Map<string, LessonGroup>();
  sorted.forEach((lesson) => {
    const type = String(lesson.lessonType || "").trim();
    const parsed = parseUnitName(String(lesson.name || "").trim());
    const key = type || parsed.unit || "";
    const row: CourseLessonVo = parsed.unit && !type ? { ...lesson, name: parsed.rest } : lesson;
    if (!key) {
      if (!groups.length || groups[0].title !== "全部课时") {
        const fallback: LessonGroup = { title: "全部课时", lessons: [] };
        groups.unshift(fallback);
        byKey.set("全部课时", fallback);
      }
      byKey.get("全部课时")!.lessons.push(row);
      return;
    }
    let group = byKey.get(key);
    if (!group) {
      group = { title: key, lessons: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.lessons.push(row);
  });
  return groups;
}

function parseUnitName(name: string) {
  const matched = name.match(/^(unit\s*\d+)\s*[·:：.\-—\s]\s*(.+)$/i);
  if (!matched) return { unit: "", rest: name };
  return { unit: matched[1].replace(/\s+/g, " ").trim(), rest: matched[2].trim() };
}

async function load() {
  loading.value = true;
  try {
    detail.value = await fetchLessonDetails(String(route.params.id || ""));
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

/** 点「开始学习」或某节课：沿用课程详情页的「继续学习」规则挑课时，再进模式选择 */
async function startFrom(lesson: CourseLessonVo | null) {
  if (starting) return;
  const current = detail.value;
  if (!current) return;
  // 课时来自 units（新接口）或 lessons（老接口），统一用 allLessons
  const lessons = allLessons.value.length ? allLessons.value : current.lessons || [];
  const picked = lesson || pickLesson(current.lastLessonId, lessons);
  if (!picked) {
    ElMessage.info(`${title.value || "该教材"}暂无可用课时`);
    return;
  }
  if (current.access?.allowed === false) {
    ElMessage.info(
      current.access.reason === "NEED_MEMBER" ? "该教材为会员内容，暂无法学习" : "暂无法学习该教材",
    );
    return;
  }
  if (!getToken()) {
    await ensureLogin({ chapterId: picked.id });
    return;
  }
  starting = true;
  try {
    saveGameInfo({
      courseId: String(current.id ?? route.params.id),
      chapterId: String(picked.id),
      gameTitle: String(picked.name || ""),
      courseName: String(current.name || title.value || ""),
      gameType: "Sentence",
      gameMode: "SentenceTranslate",
      userLessonId: current.userLessonId ? String(current.userLessonId) : "",
      source: "textbook",
      startItemId: undefined,
    });
    modeRef.value?.open();
  } finally {
    starting = false;
  }
}

function pickLesson(lastLessonId: number | string | null | undefined, lessons: CourseLessonVo[]) {
  const lastId = lastLessonId == null ? "" : String(lastLessonId);
  return (
    lessons.find((item) => item.lastTime) ||
    (lastId ? lessons.find((item) => String(item.id) === lastId) : undefined) ||
    lessons[0]
  );
}

onMounted(() => {
  void load();
});
</script>
