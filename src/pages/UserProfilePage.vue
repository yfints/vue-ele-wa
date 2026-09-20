<template>
  <div class="contentBox profilePage">
    <header class="pfHead flex jb ac">
      <div class="pfHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="pfMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="pfPageTitle">个人信息</div>
      </div>
      <UserDropdown />
    </header>

    <div class="pfBody">
      <section class="pfCard">
        <div class="pfBlock">
          <div class="pfBlockTitle">个人信息</div>
          <div class="pfDivider" />

          <div class="pfRow">
            <span class="pfLabel">头像</span>
            <div class="pfField">
              <button
                type="button"
                class="pfAvatarBtn hand"
                :disabled="uploading"
                :aria-label="uploading ? '头像上传中' : '更换头像'"
                @click="pickAvatar"
              >
                <img class="pfAvatar" :src="avatarSrc" alt="头像" @error="avatarFailed = true" />
                <span class="pfAvatarMask">{{ uploading ? "上传中…" : "更换头像" }}</span>
              </button>
              <input
                ref="fileInputRef"
                class="pfFileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                @change="onAvatarChange"
              />
            </div>
          </div>

          <div class="pfRow">
            <span class="pfLabel">ID</span>
            <div class="pfField">
              <input class="pfInput is-readonly" :value="userId" readonly />
            </div>
          </div>

          <div class="pfRow">
            <span class="pfLabel">手机号</span>
            <div class="pfField">
              <input class="pfInput is-readonly" :value="phone" readonly />
            </div>
          </div>

          <div class="pfRow">
            <span class="pfLabel">用户名称</span>
            <div class="pfField">
              <input v-model="form.nickname" class="pfInput" maxlength="20" placeholder="请输入用户名称" />
            </div>
          </div>

          <div class="pfRow">
            <span class="pfLabel">签名</span>
            <div class="pfField">
              <input v-model="form.signature" class="pfInput" maxlength="30" placeholder="请输入签名" />
            </div>
          </div>

          <div class="pfRow">
            <span class="pfLabel">微信号</span>
            <div class="pfField">
              <input v-model="form.wechatId" class="pfInput" maxlength="30" placeholder="请输入微信号" />
            </div>
          </div>

          <button type="button" class="pfSubmit hand" :disabled="saving" @click="submit">
            {{ saving ? "保存中…" : "提交" }}
          </button>
        </div>

        <div class="pfBlock">
          <div class="pfBlockTitle">安全设置</div>
          <div class="pfDivider" />
          <div class="pfLinkRow">
            <span class="pfLabel">修改密码</span>
            <button type="button" class="pfLink hand" @click="passwordOpen = true">
              去修改
              <img class="pfLinkArrow" src="/clone-assets/practice/icon-next.png" alt="" />
            </button>
          </div>
          <div class="pfLinkRow">
            <span class="pfLabel">注销账号</span>
            <button type="button" class="pfLink pfLinkDanger hand" @click="cancelOpen = true">
              注销账号
              <img class="pfLinkArrow" src="/clone-assets/practice/icon-next.png" alt="" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- 注销成功：设计稿是顶部居中的蓝色 toast -->
    <Transition name="pfToast">
      <div v-if="toastText" class="pfToast flex ac jc" role="status">
        <svg class="pfToastIcon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#fff" />
          <path
            d="M7.6 12.4l2.9 2.9 5.9-6"
            fill="none"
            stroke="#0056b5"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ toastText }}</span>
      </div>
    </Transition>

    <ChangePasswordDialog v-model="passwordOpen" :phone="phone" @done="onPasswordDone" />
    <CancelAccountDialog v-model="cancelOpen" @done="onAccountCanceled" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import CancelAccountDialog from "@/components/CancelAccountDialog.vue";
import ChangePasswordDialog from "@/components/ChangePasswordDialog.vue";
import { DEFAULT_AVATAR, avatarUrl, fetchMe, logout, user } from "@/composables/useAuth";
import { getToken } from "@/api/token";
import { updateMyProfile, uploadFile } from "@/api/user";

const router = useRouter();
const saving = ref(false);
const uploading = ref(false);
const passwordOpen = ref(false);
const cancelOpen = ref(false);
const toastText = ref("");
let toastTimer: number | undefined;
const fileInputRef = ref<HTMLInputElement>();
/** 选好待提交的头像文件 + 本地预览（点「提交」才上传） */
const pendingAvatar = ref<File | null>(null);
const avatarPreview = ref("");
/** 头像地址失效时退回默认图，别显示成裂图 */
const avatarFailed = ref(false);
const form = reactive({ nickname: "", signature: "", wechatId: "" });

const userId = computed(() => String(user.value?.userId ?? ""));
const phone = computed(() => String(user.value?.phone ?? ""));
const shownAvatar = computed(() => avatarPreview.value || avatarUrl.value);
const avatarSrc = computed(() => (avatarFailed.value ? DEFAULT_AVATAR : shownAvatar.value));

watch(shownAvatar, () => {
  avatarFailed.value = false;
});

watch(
  user,
  (value) => {
    if (!value) return;
    form.nickname = String(value.nickname || value.name || "");
    form.signature = String(value.signature || "");
    form.wechatId = String(value.wechatId || "");
  },
  { immediate: true },
);

async function submit() {
  if (saving.value) return;
  const nickname = form.nickname.trim();
  if (!nickname) {
    ElMessage.warning("用户名称不能为空");
    return;
  }
  saving.value = true;
  try {
    // 头像：提交时才真正上传（选图阶段只做本地预览）
    const extra: { headImg?: string } = {};
    if (pendingAvatar.value) {
      uploading.value = true;
      try {
        const path = String((await uploadFile(pendingAvatar.value, 512)) || "");
        if (!path) throw new Error("上传失败");
        extra.headImg = path;
      } finally {
        uploading.value = false;
      }
    }
    await updateMyProfile({
      nickname,
      // 接口约定：签名 / 微信号传 null 表示清空
      signature: form.signature.trim() || null,
      wechatId: form.wechatId.trim() || null,
      ...extra,
    });
    await fetchMe();
    if (extra.headImg && !String(user.value?.headImg || "").includes(extra.headImg)) {
      // 拉完最新资料再确认头像有没有真的落库，避免「看着成功了、刷新就没了」
      ElMessage.warning("头像保存失败，请重试");
      return;
    }
    clearPendingAvatar();
    ElMessage.success("保存成功");
  } catch {
    /* http 层已提示 */
  } finally {
    saving.value = false;
  }
}

function pickAvatar() {
  if (uploading.value || saving.value) return;
  fileInputRef.value?.click();
}

/** 选图只做本地预览，不传服务端；点「提交」时才上传并保存 */
function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  // 清空 value，保证同一张图再选一次还能触发 change
  input.value = "";
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    ElMessage.warning("请选择图片文件");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning("图片请控制在 5MB 以内");
    return;
  }
  releasePreview();
  pendingAvatar.value = file;
  avatarPreview.value = URL.createObjectURL(file);
}

/** 清掉待提交的图片与本地预览（提交成功 / 离开页面时调用） */
function clearPendingAvatar() {
  pendingAvatar.value = null;
  releasePreview();
}

function releasePreview() {
  if (avatarPreview.value.startsWith("blob:")) URL.revokeObjectURL(avatarPreview.value);
  avatarPreview.value = "";
}
/** 顶部蓝色 toast（设计稿：注销成功后弹一下） */
function showToast(text: string) {
  toastText.value = text;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastText.value = "";
    toastTimer = undefined;
  }, 2200);
}

function onPasswordDone() {
  showToast("密码修改成功");
}

function onAccountCanceled() {
  // 设计稿：注销成功先在个人信息页弹 toast，再回登录页
  showToast("注销成功");
  window.setTimeout(() => {
    logout();
    void router.push("/login/index");
  }, 1000);
}

onMounted(() => {
  if (getToken()) void fetchMe();
});

onUnmounted(() => {
  releasePreview();
  if (toastTimer) window.clearTimeout(toastTimer);
});
</script>
