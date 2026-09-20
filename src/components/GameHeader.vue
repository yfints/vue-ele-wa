<template>
  <div class="headbarWrap">
    <header class="headbar flex jb ac">
      <!-- 左：logo + 返回，和练习页（口语 / 听力 / 中译英 / 打字）保持一致 -->
      <div class="headbarLeft flex ac minw0">
        <button type="button" class="headbarLogo hand" aria-label="退出练习" @click="emit('exit')">
          <img src="/clone-assets/home/logo-englishgo.png" alt="Englishgo" />
        </button>
        <button type="button" class="practiceBack flex ac hand" aria-label="返回" @click="emit('exit')">
          <svg class="practiceBackIcon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 3.5 8 12l7 8.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>返回</span>
        </button>
      </div>

      <UserDropdown />

<!--      <div class="flex ac">
        <template v-if="!immersive">
          <div class="flex ac largeScreen animate__animated animate__fadeInRight ani5">
            <div class="headerItem noBr" @click="emit('setting')">
              <img src="/clone-assets/game/setting.png" class="img40 hand" alt="" />
              设置
            </div>
            <div class="headerItem noBr" @click="emit('list')">
              <img src="/clone-assets/game/list.png" class="img40 hand" alt="" />
              学习内容
            </div>
            <div v-if="showMode" class="headerItem noBr" @click="emit('mode')">
              <img src="/clone-assets/game/mode.png" class="img40 hand" alt="" />
              练习模式
            </div>
            <div class="headerItem noBr" @click="emit('pause')">
              <img src="/clone-assets/game/pause.svg" class="img40 hand" alt="" />
              暂停练习
            </div>
            <div class="headerItem noBr" @click="emit('reset')">
              <img src="/clone-assets/game/reset.png" class="img40 hand" alt="" />
              重置进度
            </div>
            <div class="headerItem noBr" @click="emit('feedback')">
              <img src="/clone-assets/game/feedback.png" class="img40 hand" alt="" />
              报告错误
            </div>
          </div>
          <el-dropdown class="smallScreen" trigger="click">
            <el-icon class="img30 hand"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="emit('setting')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/setting.png" class="img30" alt="" />
                    <div class="size24 ml20">设置</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="emit('list')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/list.png" class="img30" alt="" />
                    <div class="size24 ml20">查看课程学习内容</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item v-if="showMode" @click="emit('mode')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/mode.png" class="img30" alt="" />
                    <div class="size24 ml20">切换练习模式</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="emit('pause')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/pause.svg" class="img30" alt="" />
                    <div class="size24 ml20">暂停练习</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="emit('reset')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/reset.png" class="img30" alt="" />
                    <div class="size24 ml20">重置当前课程进度</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="emit('feedback')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/feedback.png" class="img30" alt="" />
                    <div class="size24 ml20">报告错误</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="emit('toggleImmersive')">
                  <div class="flex ac pt10 pb10">
                    <el-icon class="img30"><View v-if="immersive" /><Hide v-else /></el-icon>
                    <div class="size24 ml20">沉浸模式</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item @click="emit('fullscreen')">
                  <div class="flex ac pt10 pb10">
                    <img src="/clone-assets/game/fullscreen.png" class="img30" alt="" />
                    <div class="size24 ml20">全屏模式</div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <el-tooltip content="沉浸模式" placement="bottom" :disabled="!isDesktop" popper-class="immersive-mode-popper">
          <div class="img35 immersiveHeaderIcon hand ml10" @click="emit('toggleImmersive')">
            <el-icon :size="22">
              <View v-if="immersive" />
              <Hide v-else />
            </el-icon>
          </div>
        </el-tooltip>
        <el-tooltip v-if="!immersive" content="全屏模式" placement="bottom" :disabled="!isDesktop">
          <img
            src="/clone-assets/game/fullscreen.png"
            class="img40 hand ml20 largeScreen"
            alt=""
            @click="emit('fullscreen')"
          />
        </el-tooltip>
        <div class="tag timeTag size24 flex ac ml10">
          <img
            src="/clone-assets/home/time.svg"
            class="img30"
            :class="{ animate__animated: true, animate__swing: swing }"
            alt=""
          />
          <div class="ml10">{{ clock }}</div>
        </div>
      </div>-->
    </header>
    <div class="headbarPlaceholder" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import UserDropdown from "@/components/UserDropdown.vue";

defineProps<{
  title: string;
  courseName: string;
  index: number;
  total: number;
  clock: string;
  immersive: boolean;
  showMode: boolean;
  isDesktop: boolean;
  swing: boolean;
}>();

const emit = defineEmits<{
  exit: [];
  setting: [];
  list: [];
  mode: [];
  pause: [];
  reset: [];
  feedback: [];
  toggleImmersive: [];
  fullscreen: [];
}>();
</script>
