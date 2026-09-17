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
          <img class="phHeroBg" :src="course.hero" alt="" />
          <div class="phHeroInner">
            <div class="phTag">{{ course.tag }}</div>
            <div class="phName">{{ course.title }}</div>
            <div class="phSub">{{ course.subtitle }}</div>
            <div class="phMeta">{{ course.meta }}</div>
            <div class="phChips flex ac">
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
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";

interface PhoneticCourse {
  id: number;
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

const courses: PhoneticCourse[] = [
  {
    id: 1,
    tag: "英式音标",
    title: "英式音标全阶课",
    subtitle: "British Pronunciation · 零基础入门",
    meta: "4章 · 48个音标",
    chips: ["发音示范", "对比练习", "情景单词", "真人发音"],
    learners: 2141,
    progress: 52,
    hero: "/clone-assets/phonetic/hero-british.png",
    fallback: "linear-gradient(90deg, #00c26d 0%, #069a81 100%)",
  },
  {
    id: 2,
    tag: "美式音标",
    title: "美式音标全阶课",
    subtitle: "General American · 地道美式发音",
    meta: "4章 · 48个音标",
    chips: ["发音示范", "连续与阅读", "语调与节奏", "施展表达"],
    learners: 2141,
    progress: 52,
    hero: "/clone-assets/phonetic/hero-american.png",
    fallback: "linear-gradient(90deg, #44b3df 0%, #1667eb 100%)",
  },
];

function chipTone(index: number) {
  return chipTones[index % chipTones.length];
}

function startCourse(course: PhoneticCourse) {
  ElMessage.info(`${course.title}即将上线`);
}
</script>
