<template>
  <div class="contentBox phoneticPage">
    <header class="phHead flex jb ac">
      <div class="phHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="phMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="phPageTitle">音标练习</div>
      </div>
      <UserDropdown />
    </header>

    <div class="phBody flex">
      <article v-for="course in courses" :key="course.id" class="phCard flex col">
        <div class="phHero" :style="{ background: course.fallback }">
          <img v-if="course.hero" class="phHeroBg" :src="course.hero" alt="" />
          <div class="phHeroInner">
            <div class="phTag">{{ course.tag }}</div>
            <div class="phName">{{ course.title }}</div>
            <div class="phSub">{{ course.subtitle }}</div>
            <div v-if="course.meta" class="phMeta">{{ course.meta }}</div>
            <div v-if="course.chips.length" class="phChips flex ac">
              <span
                v-for="(chip, index) in course.chips"
                :key="chip"
                class="phChip"
                :style="{ background: chipTone(index).bg, color: chipTone(index).color }"
              >
                {{ chip }}
              </span>
            </div>
          </div>
        </div>

        <div class="phFoot flex jb ac">
          <div class="phLearn flex ac">
            <img class="phLearnIcon" src="/clone-assets/phonetic/people.png" alt="" />
            <span class="phLearnText">已有{{ course.learners }}人学习</span>
            <div class="phBar">
              <div class="phBarFill" :style="{ width: `${course.progress}%` }" />
            </div>
          </div>
          <button type="button" class="phStart" @click="startCourse(course)">开始学习</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import { fetchCourseCategories, type CourseCategory } from "@/api/course";

interface PhoneticCard {
  id: number | string;
  tag: string;
  title: string;
  subtitle: string;
  meta: string;
  chips: string[];
  learners: number;
  progress: number;
  hero: string;
  fallback: string;
}

/** 标签配色取自设计稿，四个位置循环使用 */
const chipTones = [
  { bg: "#DAECFF", color: "#0056B5" },
  { bg: "#DCFFDA", color: "#038C23" },
  { bg: "#FFF3DA", color: "#B24A0E" },
  { bg: "#ECE2FF", color: "#5C3FC6" },
];

const HERO_BRITISH = "/clone-assets/phonetic/hero-british.png";
const HERO_AMERICAN = "/clone-assets/phonetic/hero-american.png";
const TONE_BRITISH = "linear-gradient(90deg, #00c26d 0%, #069a81 100%)";
const TONE_AMERICAN = "linear-gradient(90deg, #44b3df 0%, #1667eb 100%)";

/**
 * 设计稿里的两张卡。
 * /course/categories?type=3 只保证给出分类（id/name），像副标题、章节数这些还没接口，
 * 所以这里按分类名兜底，接口以后补了字段会自动覆盖。
 */
const presets: PhoneticCard[] = [
  {
    id: "british",
    tag: "英式音标",
    title: "英式音标全阶课",
    subtitle: "British Pronunciation · 零基础入门",
    meta: "4章 · 48个音标",
    chips: ["发音示范", "对比练习", "情景单词", "真人发音"],
    learners: 2141,
    progress: 52,
    hero: HERO_BRITISH,
    fallback: TONE_BRITISH,
  },
  {
    id: "american",
    tag: "美式音标",
    title: "美式音标全阶课",
    subtitle: "General American · 地道美式发音",
    meta: "4章 · 48个音标",
    chips: ["发音示范", "连续与阅读", "语调与节奏", "施展表达"],
    learners: 2141,
    progress: 52,
    hero: HERO_AMERICAN,
    fallback: TONE_AMERICAN,
  },
];

const categories = ref<CourseCategory[]>([]);

/** 有分类数据就按接口渲染，没有（或请求失败）就退回设计稿的两张卡 */
const courses = computed<PhoneticCard[]>(() =>
  categories.value.length
    ? categories.value.map((item, index) => toCard(item, index))
    : presets,
);

function toCard(category: CourseCategory, index: number): PhoneticCard {
  const name = String(category.name || "").trim();
  const preset = presets.find(
    (item) => Boolean(name) && (item.tag.includes(name) || name.includes(item.tag)),
  );
  const american = preset ? preset.tag.includes("美式") : /美式|american/i.test(name);
  return {
    id: category.id ?? `category-${index}`,
    tag: name || preset?.tag || "音标",
    title: preset?.title || name || "音标课程",
    subtitle: text(category.description || category.describe) || preset?.subtitle || "",
    meta: metaOf(category) || preset?.meta || "",
    chips: preset?.chips || [],
    learners: pickNumber(category.humanNum ?? category.human_num, preset?.learners ?? 0),
    progress: pickNumber(category.percentage, preset?.progress ?? 0),
    hero: preset?.hero || (american ? HERO_AMERICAN : HERO_BRITISH),
    fallback: preset?.fallback || (american ? TONE_AMERICAN : TONE_BRITISH),
  };
}

function metaOf(category: CourseCategory) {
  const chapters = pickNumber(category.courseNum ?? category.course_num, 0);
  return chapters > 0 ? `${chapters}章` : "";
}

function pickNumber(value: unknown, fallback: number) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function chipTone(index: number) {
  return chipTones[index % chipTones.length];
}

function startCourse(course: PhoneticCard) {
  ElMessage.info(`${course.title}即将上线`);
}

onMounted(async () => {
  try {
    // type=3 音标分类（0=课程广场 1=教材同步 3=音标）
    const list = await fetchCourseCategories({ type: 3 });
    categories.value = Array.isArray(list) ? list : [];
  } catch {
    categories.value = [];
  }
});
</script>
