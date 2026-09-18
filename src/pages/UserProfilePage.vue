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
              <img class="pfAvatar" :src="avatarUrl" alt="头像" />
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
            <button type="button" class="pfLink hand" @click="changePassword">
              去修改
              <img class="pfLinkArrow" src="/clone-assets/practice/icon-next.png" alt="" />
            </button>
          </div>

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
import { cancelMyAccount, updateMyProfile } from "@/api/user";

const router = useRouter();
const saving = ref(false);
const form = reactive({ nickname: "", signature: "", wechatId: "" });

const userId = computed(() => String(user.value?.userId ?? ""));
const phone = computed(() => String(user.value?.phone ?? ""));

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
    await updateMyProfile({
      nickname,
      // 接口约定：签名 / 微信号传 null 表示清空
      signature: form.signature.trim() || null,
      wechatId: form.wechatId.trim() || null,
    });
    await fetchMe();
    ElMessage.success("保存成功");
  } catch {
    /* http 层已提示 */
  } finally {
    saving.value = false;
  }
}

function changePassword() {
  // 当前账号是短信验证码登录，后端没有单独的改密接口
  ElMessage.info("当前账号使用验证码登录，无需修改密码");
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
