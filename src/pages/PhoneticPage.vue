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
            <div v-if="course.meta" class="phMeta">{{ course.meta }} •‌ 48个音标</div>
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
              <div class="phBarFill" :style="{ width: `${course.learners}%` }" />
            </div>
          </div>
          <button type="button" class="phStart" @click="startCourse(course)">开始学习</button>
        </div>
      </article>

      <div v-if="!loading && !courses.length" class="phEmpty flex col ac jc">
        <img src="/clone-assets/nodata.png" class="phEmptyImg" alt="" />
        <div class="phEmptyText">暂无音标课程</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import { fetchCourses, unwrapCoursePage, type CourseVo } from "@/api/course";
import { localAsset } from "@/data/mall";

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
 * 卡片底部的能力标签：暂时按设计稿写死（英式 / 美式各一组）。
 * 后续接口补上 tags 字段后，改成读 course.tags 即可。
 */
const FIXED_CHIPS = {
  british: ["发音示范", "对比练习", "情景单词", "真人发音"],
  american: ["发音示范", "连续与阅读", "语调与节奏", "施展表达"],
};

/** 音标课程列表，数据来自 /courses?type=3 */
const courseList = ref<CourseVo[]>([]);
const loading = ref(true);

const courses = computed<PhoneticCard[]>(() =>
  courseList.value.map((item, index) => toCard(item, index)),
);

function toCard(course: CourseVo, index: number): PhoneticCard {
  const name = String(course.name || "").trim();
  const american = /美式|american/i.test(name);
  const cover = text(course.cover || course.image);
  return {
    id: course.id ?? `course-${index}`,
    tag: tagOf(course, name),
    title: name || "音标课程",
    subtitle: text(course.description || course.describe),
    meta: metaOf(course),
    chips: chipsFor(name, index),
    learners: pickNumber(course.humanNum ?? course.human_num, 0),
    progress: pickNumber(course.percentage ?? course.progress, 0),
    hero: cover ? localAsset(cover) : american ? HERO_AMERICAN : HERO_BRITISH,
    fallback: american ? TONE_AMERICAN : TONE_BRITISH,
  };
}

/** 写死的标签：名字里带美式/英式就按名字，否则两张卡轮换设计稿的两组标签 */
function chipsFor(name: string, index: number) {
  if (/美式|american/i.test(name)) return FIXED_CHIPS.american;
  if (/英式|british/i.test(name)) return FIXED_CHIPS.british;
  return index % 2 === 1 ? FIXED_CHIPS.american : FIXED_CHIPS.british;
}

/** 卡片左上角的小标签：优先用分类名，没有就把课程名里的「全阶课 / 课程」等后缀去掉 */
function tagOf(course: CourseVo, name: string) {
  const category = text(course.categoryName || course.category_name);
  if (category) return category;
  return name.replace(/(全阶课|精品课|系统课|课程|课)$/u, "").trim() || name || "音标";
}

function metaOf(course: CourseVo) {
  const chapters = pickNumber(course.courseNum ?? course.course_num, 0);
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
    // type=3 音标课程（0=课程广场 1=教材同步 3=音标）
    const page = await fetchCourses({
      page: 0,
      limit: 0,
      type: 3,
      categoryId: "",
      courseType: "",
      keyword: "",
    });
    courseList.value = unwrapCoursePage(page).records ?? [];
  } catch {
    courseList.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
