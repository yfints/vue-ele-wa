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
                <img class="pfAvatar" :src="shownAvatar" alt="头像" />
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
            <span class="pfLabel">注销账号</span>
            <button type="button" class="pfLink pfLinkDanger hand" @click="cancelAccount">
              注销账号
              <img class="pfLinkArrow" src="/clone-assets/practice/icon-next.png" alt="" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import UserDropdown from "@/components/UserDropdown.vue";
import { avatarUrl, fetchMe, logout, user } from "@/composables/useAuth";
import { getToken } from "@/api/token";
import { cancelMyAccount, updateMyProfile, uploadFile } from "@/api/user";
import { localAsset } from "@/data/mall";

const router = useRouter();
const saving = ref(false);
const uploading = ref(false);
const fileInputRef = ref<HTMLInputElement>();
/** 上传后的本地预览，拉完最新资料就清掉，最终以服务端为准 */
const avatarPreview = ref("");
const form = reactive({ nickname: "", signature: "", wechatId: "" });

const userId = computed(() => String(user.value?.userId ?? ""));
const phone = computed(() => String(user.value?.phone ?? ""));
const shownAvatar = computed(() => avatarPreview.value || avatarUrl.value);

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
  saving.value = true;
  try {
    if (!(await saveProfile())) return;
    await fetchMe();
    ElMessage.success("保存成功");
  } catch {
    /* http 层已提示 */
  } finally {
    saving.value = false;
  }
}

/**
 * 保存资料：昵称 / 签名 / 微信号是必带项，头像作为可选项一起提交。
 * 返回昵称校验是否通过（头像是否落库由调用方拉完最新资料后判断）。
 */
async function saveProfile(extra: { headImg?: string } = {}) {
  const nickname = form.nickname.trim();
  if (!nickname) {
    ElMessage.warning("用户名称不能为空");
    return false;
  }
  await updateMyProfile({
    nickname,
    // 接口约定：签名 / 微信号传 null 表示清空
    signature: form.signature.trim() || null,
    wechatId: form.wechatId.trim() || null,
    ...extra,
  });
  return true;
}

function pickAvatar() {
  if (uploading.value) return;
  fileInputRef.value?.click();
}

/** 选图 → /upload（最长边 512）→ 随资料一起提交头像地址 */
async function onAvatarChange(event: Event) {
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
  uploading.value = true;
  try {
    const path = String((await uploadFile(file, 512)) || "");
    if (!path) throw new Error("上传失败");
    avatarPreview.value = localAsset(path);
    await saveProfile({ headImg: path });
    await fetchMe();
    // 拉完最新资料再判断头像有没有真的落库，避免"看着成功了、刷新就没了"
    const saved = String(user.value?.headImg || "").includes(path);
    avatarPreview.value = "";
    if (saved) ElMessage.success("头像已更新");
    else ElMessage.warning("头像已上传，但接口未保存该字段（/user/profile 需支持 headImg）");
  } catch {
    avatarPreview.value = "";
    /* http 层已提示 */
  } finally {
    uploading.value = false;
  }
}

async function cancelAccount() {
  try {
    await ElMessageBox.confirm(
      "注销后账号不可恢复，该手机号也无法再次注册，确定要注销吗？",
      "注销账号",
      {
        confirmButtonText: "确认注销",
        cancelButtonText: "再想想",
        type: "warning",
        closeOnClickModal: false,
      },
    );
  } catch {
    return;
  }
  try {
    await cancelMyAccount();
    logout();
    ElMessage.success("账号已注销");
    await router.push("/login/index");
  } catch {
    /* http 层已提示 */
  }
}

onMounted(() => {
  if (getToken()) void fetchMe();
});
</script>
