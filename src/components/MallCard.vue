<template>
  <RouterLink :to="detailTo" class="mallCard hand mb20">
    <div class="imgBox">
      <el-image class="cardimg" :src="localAsset(lesson.image)" fit="cover" />
      <div class="cardtag">用户共享</div>
    </div>
    <div class="line2 size20 mt10 courseName">{{ lesson.name }}</div>
    <div v-if="tags.length" class="mallTags flex ac wrap mt10">
      <span v-for="tag in tags" :key="tag.id" class="mallTag">{{ tag.name }}</span>
    </div>
    <div class="flex jb ac mt10 size14">
      <div class="flex ac flex1">
        <img
          :src="localAsset(lesson.founder?.head_img || '') || '/clone-assets/ico.png'"
          class="img25 avatar circle"
          alt=""
        />
        <div class="ml5 line1 name opc6">{{ lesson.founder?.name || "官方" }}</div>
      </div>
      <div v-if="lesson.heat" class="flex ac opc6">
        <strong>
          <i class="van-badge__wrapper van-icon van-icon-fire-o" />
        </strong>
        <div class="ml5">{{ lesson.heat }}</div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { localAsset, type MallLesson } from "@/data/mall";

const props = defineProps<{
  lesson: MallLesson;
}>();

const detailTo = computed(() => `/courseMall/${props.lesson.id}`);
/** 课程分类标签：接口 categories（按数组顺序，最多展示 3 个） */
const tags = computed(() =>
  (props.lesson.categories || [])
    .filter((item) => String(item?.name || "").trim())
    .slice(0, 3),
);
</script>
