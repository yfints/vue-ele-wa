import { computed, ref } from "vue";
import { ElMessageBox } from "element-plus";
import router from "@/router";
import { fetchMyProfile, type UserProfile } from "@/api/user";
import { clearAuth, getToken, setAccount, setToken } from "@/api/token";
import type { LoginResult } from "@/api/auth";
import { localAsset } from "@/data/mall";

/** 当前登录用户资料，个人信息页需要直接读写 */
export const user = ref<UserProfile | null>(null);

export const isLoggedIn = computed(() => Boolean(getToken()));

export const displayName = computed(
  () => user.value?.nickname || user.value?.name || "学员",
);

export const avatarUrl = computed(
  () =>
    localAsset(
      user.value?.headImg || user.value?.avatar || user.value?.headimg || user.value?.head_img || "",
    ) ||
    "/clone-assets/ico.jpg",
);

export const vipId = computed(() => user.value?.active_vips?.vip_id || 0);

export async function fetchMe() {
  if (!getToken()) {
    user.value = null;
    return;
  }
  try {
    user.value = await fetchMyProfile();
  } catch {
    user.value = null;
  }
}

export function applyLogin(data: LoginResult, account: string) {
  setToken(data.token || data.access_token || "");
  setAccount(account);
}

export function logout() {
  clearAuth();
  user.value = null;
}

/** 未登录引导：弹确认框，确认后跳转登录页并携带回跳地址 */
export async function ensureLogin(options?: {
  chapterId?: number | string;
  message?: string;
}) {
  const route = router.currentRoute.value;
  try {
    await ElMessageBox.confirm(
      options?.message || "您还未登录或登录失效，是否前往登录？",
      "提示",
      {
        confirmButtonText: "确认",
        cancelButtonText: "先不登录",
        type: "warning",
        closeOnClickModal: false,
      },
    );
  } catch {
    return false;
  }
  const chapterId = options?.chapterId;
  await router.push({
    path: "/login/index",
    query: {
      redirect: chapterId != null ? `${route.path}?start=${chapterId}` : route.fullPath,
    },
  });
  return true;
}

export function useAuth() {
  return {
    user,
    isLoggedIn,
    displayName,
    avatarUrl,
    vipId,
    fetchMe,
    applyLogin,
    logout,
    ensureLogin,
  };
}
