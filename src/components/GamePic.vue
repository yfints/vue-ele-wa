<template>
  <div v-if="src" class="sentencePic flex jc flex0 mb30">
    <img
      class="sentenceCover animate__animated animate__jackInTheBox"
      :src="src"
      alt=""
      draggable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { localAsset } from "@/data/mall";

const props = defineProps<{
  pic?: string;
}>();

const src = computed(() => (props.pic ? localAsset(props.pic) : ""));
</script>
