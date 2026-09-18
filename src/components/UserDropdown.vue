<template>
  <div class="userDropWrap flex ac">
    <el-image
      class="userDropAvatar hand"
      :src="avatarUrl"
      fit="cover"
      alt="个人信息"
      @click.stop="openProfile"
    />
    <el-dropdown trigger="click">
      <button type="button" class="userDrop flex ac">
        <span class="userDropName">{{ displayName }}</span>
        <el-icon class="userDropArrow"><ArrowDown /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openProfile">个人信息</el-dropdown-item>
<!--          <el-dropdown-item @click="toggleTheme">
            {{ isDark ? "白天模式" : "夜间模式" }}
          </el-dropdown-item>-->
          <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";
import { avatarUrl, displayName, logout } from "@/composables/useAuth";

const router = useRouter();

function onLogout() {
  logout();
  void router.push("/login/index");
}

/** 点头像进个人信息页 */
function openProfile() {
  void router.push("/user/profile");
}
</script>
