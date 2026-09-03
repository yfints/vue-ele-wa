<template>
  <RouterLink :to="detailTo" class="mallCard hand mb20">
    <div class="imgBox">
      <el-image class="cardimg" :src="localAsset(lesson.image)" fit="cover" />
      <div class="cardtag">用户共享</div>
    </div>
    <div class="line2 size20 mt10 courseName">{{ lesson.name }}</div>
    <div class="flex jb ac mt10 size14">
      <div class="flex ac flex1">
        <img :src="localAsset(lesson.founder.head_img)" class="img25 avatar circle" alt="" />
        <div class="ml5 line1 name opc6">{{ lesson.founder.name }}</div>
      </div>
      <div class="flex ac opc6">
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

const detailTo = computed(() =>
  props.lesson.is_have && props.lesson.user_lesson_id
    ? `/courseMall/detail/${props.lesson.user_lesson_id}`
    : `/courseMall/${props.lesson.id}`,
);
</script>
