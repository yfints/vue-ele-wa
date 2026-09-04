<template>
  <div class="rankBox flex col ac">
    <img v-if="vipSrc" :src="vipSrc" class="rankVip" alt="" />
    <div v-else class="rankFree flex jc ac">免费学习卡</div>
    <el-image class="cusAvatar rankAvatar" :src="avatar" fit="cover" />
    <img src="/clone-assets/home/rank-bg.png" class="rankbg" alt="" />
    <div class="rankTime">{{ timeText }}</div>
    <div class="rankSort">
      <span class="rankName line1">{{ name }}</span>
      <img v-if="medal" :src="medal" class="rankIcon" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RankItem } from "@/api/home";
import { formatRankTime } from "@/lib/time";
import { localAsset } from "@/data/mall";

const props = defineProps<{
  item: RankItem;
  place: "first" | "second" | "third";
}>();

const user = computed(() => props.item.user);
const name = computed(() => user.value?.nickname || "学员");
const avatar = computed(
  () => localAsset(user.value?.avatar || user.value?.headimg || user.value?.head_img || "") || "/clone-assets/ico.png",
);
const timeText = computed(() => props.item.total_time || formatRankTime(Number(props.item.time || props.item.duration || props.item.study_time || 0)));
const vipSrc = computed(() => {
  const id = user.value?.active_vips?.vip_id;
  if (id === 1) return "/clone-assets/home/tag-p2.png";
  if (id === 2) return "/clone-assets/home/tag-p.png";
  if (id === 3) return "/clone-assets/home/tag-study-m.png";
  return "";
});
const medal = computed(() => {
  if (props.place === "second") return "/clone-assets/home/rank2.png";
  return "";
});
</script>
