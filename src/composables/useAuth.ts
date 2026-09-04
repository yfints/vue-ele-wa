import { computed, ref } from "vue";
import { fetchMyProfile, type UserProfile } from "@/api/user";
import { clearAuth, getToken, setAccount, setToken } from "@/api/token";
import type { LoginResult } from "@/api/auth";
import { localAsset } from "@/data/mall";

const user = ref<UserProfile | null>(null);

export const isLoggedIn = computed(() => Boolean(getToken()));

export const displayName = computed(
  () => user.value?.nickname || user.value?.name || "学员",
);

export const avatarUrl = computed(
  () =>
    localAsset(user.value?.avatar || user.value?.headimg || user.value?.head_img || "") ||
    "/clone-assets/ico.png",
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
  };
}
