<template>
  <div class="oralFinishLayer">
    <div class="oralFinishMask" @click="emit('close')" />
    <div class="oralFinish flex col ac" role="dialog" aria-label="练习完成">
      <button type="button" class="oralFinishClose hand" aria-label="关闭" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />
        </svg>
      </button>

      <svg class="oralFinishArt" viewBox="0 0 200 200" aria-hidden="true">
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

      <div class="oralFinishTitle">太棒了！</div>
      <div class="oralFinishSub">坚持练习，遇见更好的自己</div>

      <div class="oralFinishStats flex ac">
        <div class="oralFinishStat oralFinishStatTime flex ac">
          <img class="oralFinishStatIcon" src="/clone-assets/oral/finish-clock.png" alt="" />
          <div class="oralFinishStatInfo flex col">
            <span class="oralFinishStatLabel">今日练习时长</span>
            <span class="oralFinishStatValue">{{ duration }}</span>
          </div>
        </div>
        <div class="oralFinishStat oralFinishStatCount flex ac">
          <img class="oralFinishStatIcon" src="/clone-assets/oral/finish-list.png" alt="" />
          <div class="oralFinishStatInfo flex col">
            <span class="oralFinishStatLabel">此章题目数量</span>
            <span class="oralFinishStatValue">{{ count }}道</span>
          </div>
        </div>
      </div>

      <div class="oralFinishActions flex ac">
        <button type="button" class="oralFinishBtn oralFinishBtnPrimary hand" @click="emit('continue')">
          继续练习（空格）
        </button>
        <button type="button" class="oralFinishBtn oralFinishBtnGreen hand" @click="emit('next')">
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
