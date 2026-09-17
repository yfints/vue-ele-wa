<template>
  <el-dropdown trigger="click">
    <button type="button" class="userDrop flex ac">
      <el-image class="userDropAvatar" :src="avatarUrl" fit="cover" />
      <span class="userDropName">{{ displayName }}</span>
      <el-icon class="userDropArrow"><ArrowDown /></el-icon>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="toggleTheme">
          {{ isDark ? "白天模式" : "夜间模式" }}
        </el-dropdown-item>
        <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";
import { avatarUrl, displayName, logout } from "@/composables/useAuth";
import { isDark, toggleTheme } from "@/composables/useTheme";

const router = useRouter();

function onLogout() {
  logout();
  void router.push("/login/index");
}
</script>
