<template>
  <div class="practiceFinishLayer">
    <div class="practiceFinishMask" @click="emit('close')" />
    <div class="practiceFinish flex col ac" role="dialog" aria-label="练习完成">
      <button type="button" class="practiceFinishClose hand" aria-label="关闭" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />
        </svg>
      </button>

      <svg class="practiceFinishArt" viewBox="0 0 200 200" aria-hidden="true">
        <g transform="translate(0 6)">
          <circle cx="100" cy="100" r="64" fill="#EAF3FE" />
          <circle cx="100" cy="100" r="47" fill="#3891F2" />
          <path
            d="M81 101.5l13.5 14L119.5 86"
            fill="none"
            stroke="#fff"
            stroke-width="8.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect x="86" y="14" width="9" height="17" rx="3" fill="#FFC53D" transform="rotate(-18 90 22)" />
          <rect x="140" y="38" width="9" height="17" rx="3" fill="#FF9F43" transform="rotate(28 144 46)" />
          <rect x="163" y="70" width="9" height="17" rx="3" fill="#FF5FA2" transform="rotate(62 167 78)" />
          <rect x="30" y="52" width="9" height="17" rx="3" fill="#2BD87E" transform="rotate(-52 34 60)" />
          <rect x="46" y="158" width="9" height="17" rx="3" fill="#FF5FA2" transform="rotate(24 50 166)" />
          <rect x="152" y="146" width="9" height="17" rx="3" fill="#FFC53D" transform="rotate(-28 156 154)" />
          <circle cx="44" cy="132" r="5" fill="#4A9BF5" />
          <circle cx="166" cy="126" r="5" fill="#2BD87E" />
        </g>
      </svg>

      <div class="practiceFinishTitle">太棒了！</div>
      <div class="practiceFinishSub">坚持练习，遇见更好的自己</div>

      <div class="practiceFinishStats flex ac">
        <div class="practiceFinishStat practiceFinishStatTime flex ac">
          <img class="practiceFinishStatIcon" src="/clone-assets/practice/finish-clock.png" alt="" />
          <div class="practiceFinishStatInfo flex col">
            <span class="practiceFinishStatLabel">今日练习时长</span>
            <span class="practiceFinishStatValue">{{ duration }}</span>
          </div>
        </div>
        <div class="practiceFinishStat practiceFinishStatCount flex ac">
          <img class="practiceFinishStatIcon" src="/clone-assets/practice/finish-list.png" alt="" />
          <div class="practiceFinishStatInfo flex col">
            <span class="practiceFinishStatLabel">此章题目数量</span>
            <span class="practiceFinishStatValue">{{ count }}道</span>
          </div>
        </div>
      </div>

      <div class="practiceFinishActions flex ac">
        <button type="button" class="practiceFinishBtn practiceFinishBtnPrimary hand" @click="emit('continue')">
          继续练习（空格）
        </button>
        <button type="button" class="practiceFinishBtn practiceFinishBtnGreen hand" @click="emit('next')">
          下一章（回车）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  duration: string;
  count: number;
}>();

const emit = defineEmits<{
  continue: [];
  next: [];
  close: [];
}>();
</script>
