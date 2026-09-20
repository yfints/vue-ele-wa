<template>
  <RouterLink :to="detailTo" class="cmCard hand">
    <div class="cmCover">
      <el-image class="cmCoverImg" :src="localAsset(lesson.image)" fit="cover" />
      <button
        type="button"
        class="cmFav flex ac jc"
        :aria-label="faved ? '取消收藏' : '收藏'"
        @click.stop.prevent="emit('collect', lesson)"
      >
        <svg class="cmHeart" :class="{ 'is-active': faved }" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.1 4.9 13.3A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 7.1 6.2z" />
        </svg>
      </button>
    </div>

    <div class="cmInfo">
      <div class="cmTitle line1">{{ lesson.name }}</div>
      <div v-if="tags.length" class="cmTags flex ac wrap">
        <span v-for="tag in tags" :key="tag" class="cmTag">{{ tag }}</span>
      </div>
      <template v-if="showProgress">
        <div class="cmBar">
          <div class="cmBarFill" :style="{ width: `${percent}%` }" />
        </div>
        <div class="cmLearned">已学{{ done }}/{{ total }}课时</div>
      </template>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { localAsset, type MallLesson } from "@/data/mall";

const props = defineProps<{
  lesson: MallLesson;
  /** 是否已收藏 */
  faved?: boolean;
}>();

const emit = defineEmits<{ collect: [lesson: MallLesson] }>();

const detailTo = computed(() => `/courseMall/${props.lesson.id}`);

/** 标签：课程分类（kind=1）+ 免费 / 会员，最多三个（同名去重，接口若已下发「免费」就不再加） */
const tags = computed(() => {
  const list = (props.lesson.categories || [])
    .map((item) => String(item?.name || "").trim())
    .filter(Boolean);
  const access = Number(props.lesson.courseType) === 2 ? "会员" : "免费";
  if (!list.includes(access)) list.push(access);
  return Array.from(new Set(list)).slice(0, 3);
});

const progressInfo = computed(() => {
  const raw = props.lesson.progress;
  if (raw && typeof raw === "object") return raw;
  const percentage = Number(props.lesson.percentage);
  if (Number.isFinite(percentage)) return { percentage };
  return null;
});

const total = computed(() => {
  const raw = progressInfo.value;
  const fromApi = Number(raw && "total" in raw ? raw.total : 0);
  return fromApi || Number(props.lesson.courseNum || 0);
});

/**
 * 进度条：设计稿每张卡片都有（含「已学 0/15 课时」），
 * 列表接口不下发进度时按 0 展示，课时数取 courseNum；连课时数都没有才隐藏。
 */
const showProgress = computed(() => total.value > 0);

const percent = computed(() => {
  const raw = progressInfo.value;
  const value = Number(raw && "percentage" in raw ? raw.percentage : 0) || 0;
  return Math.min(100, Math.max(0, Math.round(value)));
});

const done = computed(() => {
  const raw = progressInfo.value;
  const fromApi = Number(raw && "doneCount" in raw ? raw.doneCount : 0);
  if (fromApi) return fromApi;
  if (!total.value) return 0;
  return Math.round((percent.value / 100) * total.value);
});
</script>
