<template>
  <div class="headbarWrap">
    <div class="headbar flex jb ac">
      <div class="flex ac mr30">
        <img src="/clone-assets/ico.png" class="img40 hand" alt="" @click="emit('exit')" />
        <div class="ml15">
          <div class="size24 bold flex ac linearTitle line1">
            {{ title }}({{ index + 1 }}/{{ total || 1 }})
          </div>
          <div class="size-20 bold flex ac opc5 line1">{{ courseName }}</div>
        </div>
      </div>

      <div class="flex ac">
        <template v-if="!immersive">
          <div class="flex ac largeScreen">
            <div class="headerItem noBr" @click="emit('setting')">
              <el-icon class="img40 hand"><Setting /></el-icon>
              设置
            </div>
            <div class="headerItem noBr" @click="emit('list')">
              <el-icon class="img40 hand"><Notebook /></el-icon>
              学习内容
            </div>
            <div v-if="showMode" class="headerItem noBr" @click="emit('mode')">
              <el-icon class="img40 hand"><Operation /></el-icon>
              练习模式
            </div>
            <div class="headerItem noBr" @click="emit('pause')">
              <el-icon class="img40 hand"><VideoPause /></el-icon>
              暂停练习
            </div>
            <div class="headerItem noBr" @click="emit('reset')">
              <el-icon class="img40 hand"><RefreshRight /></el-icon>
              重置进度
            </div>
            <div class="headerItem noBr" @click="emit('feedback')">
              <el-icon class="img40 hand"><WarningFilled /></el-icon>
              报告错误
            </div>
          </div>
          <el-dropdown class="smallScreen" trigger="click">
            <el-icon class="img30 hand"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="emit('setting')">设置</el-dropdown-item>
                <el-dropdown-item @click="emit('list')">查看课程学习内容</el-dropdown-item>
                <el-dropdown-item v-if="showMode" @click="emit('mode')">切换练习模式</el-dropdown-item>
                <el-dropdown-item @click="emit('pause')">暂停练习</el-dropdown-item>
                <el-dropdown-item @click="emit('reset')">重置当前课程进度</el-dropdown-item>
                <el-dropdown-item @click="emit('feedback')">报告错误</el-dropdown-item>
                <el-dropdown-item @click="emit('toggleImmersive')">沉浸模式</el-dropdown-item>
                <el-dropdown-item @click="emit('fullscreen')">全屏模式</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <el-tooltip content="沉浸模式" placement="bottom" :disabled="!isDesktop">
          <div class="img35 immersiveHeaderIcon hand ml10" @click="emit('toggleImmersive')">
            <el-icon :size="22">
              <View v-if="immersive" />
              <Hide v-else />
            </el-icon>
          </div>
        </el-tooltip>
        <div v-if="!immersive" class="headerItem noBr largeScreen" @click="emit('fullscreen')">
          <el-icon class="img40 hand"><FullScreen /></el-icon>
          全屏模式
        </div>
        <div class="gameTime flex ac ml10">
          <el-icon class="img30" :class="{ animate__animated: true, animate__swing: swing }">
            <Timer />
          </el-icon>
          <div class="ml10">{{ clock }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FullScreen,
  Hide,
  MoreFilled,
  Notebook,
  Operation,
  RefreshRight,
  Setting,
  Timer,
  VideoPause,
  View,
  WarningFilled,
} from "@element-plus/icons-vue";

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
