<template>
  <div class="loginPage">
    <div class="loginStage">
      <div class="loginHeroCopy">
        <p class="loginHeroTitle">用英语，<br />打开更大的自己</p>
        <span class="loginHeroBar"></span>
        <p class="loginHeroSub">成人英语学习平台·随时随地高效学英语</p>
      </div>

      <div class="loginCard">
        <div class="loginCardInner">
          <div class="loginBrand">
            <img src="/clone-assets/login/logo-englishgo.png" class="loginLogo" alt="Englishgo" />
          </div>

          <div class="loginTabs flex ac jc">
            <button
              v-for="item in TABS"
              :key="item.key"
              type="button"
              class="loginTab"
              :class="{ 'is-on': tab === item.key }"
              @click="switchTab(item.key)"
            >
              {{ item.label }}
            </button>
          </div>

          <el-form class="loginForm" @submit.prevent="submit">
            <div class="loginField" :class="{ isError: Boolean(errors.phone) }">
              <el-icon class="loginFieldIcon"><User /></el-icon>
              <el-input
                v-model="phone"
                class="loginInput"
                type="tel"
                inputmode="numeric"
                maxlength="11"
                placeholder="请输入手机号"
                @blur="touch('phone')"
              />
            </div>
            <p class="fieldError">{{ errors.phone || "" }}</p>

            <div v-if="tab === 'sms'" class="loginField" :class="{ isError: Boolean(errors.code) }">
              <el-icon class="loginFieldIcon"><Lock /></el-icon>
              <el-input
                v-model="code"
                class="loginInput"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="请输入验证码"
                @blur="touch('code')"
              />
              <el-button
                class="loginSmsBtn"
                type="primary"
                :disabled="cooldown > 0"
                @click="sendCode"
              >
                {{ cooldown > 0 ? `${cooldown}s` : "获取验证码" }}
              </el-button>
            </div>
            <div v-else class="loginField" :class="{ isError: Boolean(errors.password) }">
              <el-icon class="loginFieldIcon"><Lock /></el-icon>
              <el-input
                v-model="password"
                class="loginInput"
                type="password"
                maxlength="20"
                placeholder="请输入密码"
                show-password
                @blur="touch('password')"
              />
            </div>
            <p class="fieldError">{{ (tab === "sms" ? errors.code : errors.password) || "" }}</p>

            <div v-if="tab === 'pwd'" class="loginForgot flex je">
              <button type="button" class="loginLinkBtn" @click="forgotOpen = true">
                忘记密码？
              </button>
            </div>

            <el-checkbox v-model="agreed" class="loginAgree">
              我已阅读并同意
              <el-link type="primary" :underline="false" @click.stop.prevent="openDoc('用户协议')">
                《用户协议》
              </el-link>
              和
              <el-link type="primary" :underline="false" @click.stop.prevent="openDoc('隐私协议')">
                《隐私协议》
              </el-link>
            </el-checkbox>
            <p class="fieldError">{{ errors.agreed || "" }}</p>

            <el-button
              class="loginSubmit"
              type="primary"
              native-type="submit"
              :loading="submitting"
              :disabled="submitting"
            >
              {{ submitting ? "登录中..." : "登录" }}
            </el-button>
          </el-form>

          <div class="loginThird flex ac jc">
            <span class="loginThirdLine" />
            <span class="loginThirdText">第三方登录</span>
            <span class="loginThirdLine" />
          </div>

          <div class="loginThirdBody flex jc">
            <button type="button" class="loginWechat hand" aria-label="微信登录" @click="wechatLogin">
              <img src="/clone-assets/login/wechat.png" alt="" />
            </button>
          </div>

          <div class="loginRegisterRow">
            还没有账号？
            <RouterLink to="/login/register" class="loginLink">立即注册</RouterLink>
          </div>
        </div>
      </div>
    </div>

    <ForgotPasswordDialog v-model="forgotOpen" :phone="phone" @done="onResetDone" />
    <!-- 登录返回 passwordSet=false（验证码登录自动建号）：先设置密码再进站 -->
    <ChangePasswordDialog
      v-model="setPasswordOpen"
      mode="set"
      :phone="phone"
      @done="onSetPasswordDone"
      @cancel="onSetPasswordCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Lock, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { loginByPassword, loginBySms, sendSms } from "@/api/auth";
import { promotePendingToken, setAccount, setPendingToken } from "@/api/token";
import ChangePasswordDialog from "@/components/ChangePasswordDialog.vue";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog.vue";
import { applyLogin, fetchMe, logout } from "@/composables/useAuth";
import {
  agreeRules,
  collectFieldErrors,
  phoneRules,
  required,
  smsCodeRules,
  validate,
  type FieldBag,
} from "@/lib/rules";

type LoginTab = "sms" | "pwd";

const TABS: { key: LoginTab; label: string }[] = [
  { key: "sms", label: "验证码登录" },
  { key: "pwd", label: "密码登录" },
];

const router = useRouter();
const route = useRoute();
const tab = ref<LoginTab>("sms");
const phone = ref("");
const code = ref("");
const password = ref("");
const agreed = ref(false);
const submitting = ref(false);
const cooldown = ref(0);
const forgotOpen = ref(false);
/** 登录返回 passwordSet=false 时先弹「设置密码」，设置完再进站 */
const setPasswordOpen = ref(false);
const pendingTarget = ref("/home/index");
/** 待设置密码的账号（登录成功但 token 还没落盘时先记着，设置完再写 ACCOUNT） */
const pendingAccount = ref("");
const errors = ref<Record<string, string>>({});
let timer: number | undefined;

const redirect = computed(() => {
  const value = route.query.redirect;
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/home/index";
});

function currentFields(): FieldBag {
  const bag: FieldBag = {
    phone: { value: phone.value, rules: phoneRules },
    agreed: { value: String(agreed.value), rules: agreeRules },
  };
  if (tab.value === "sms") {
    bag.code = { value: code.value, rules: smsCodeRules };
  } else {
    // 密码登录只校验非空：老账号的密码不一定是现在的 8–20 位规则
    bag.password = { value: password.value, rules: [required("请输入密码")] };
  }
  return bag;
}

function touch(field: string) {
  const item = currentFields()[field];
  if (!item) return;
  const message = validate(item.value, item.rules);
  if (message) errors.value = { ...errors.value, [field]: message };
  else {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
}

function switchTab(next: LoginTab) {
  if (tab.value === next) return;
  tab.value = next;
  errors.value = {};
}

function startCooldown() {
  cooldown.value = 60;
  timer = window.setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }, 1000);
}

function sendCode() {
  if (cooldown.value > 0) return;
  const message = validate(phone.value, phoneRules);
  if (message) {
    errors.value = { ...errors.value, phone: message };
    ElMessage.warning(message);
    return;
  }
  sendSms(phone.value)
    .then(() => {
      ElMessage.success("验证码已发送");
      startCooldown();
    })
    .catch(() => {
      /* http 拦截器已提示 */
    });
}

function openDoc(name: string) {
  ElMessage.info(`${name}即将上线`);
}

function wechatLogin() {
  ElMessage.info("微信登录即将上线");
}

async function submit() {
  if (submitting.value) return;
  const nextErrors = collectFieldErrors(currentFields());
  errors.value = nextErrors;
  const first = Object.values(nextErrors)[0];
  if (first) {
    ElMessage.warning(first);
    return;
  }
  submitting.value = true;
  try {
    const account = phone.value.trim();
    const data =
      tab.value === "sms"
        ? await loginBySms(account, code.value.trim())
        : await loginByPassword(account, password.value);
    if (data?.passwordSet === false) {
      // 还没设过密码（验证码登录自动建号就是这种）：token 只放内存、不落盘，设置成功后再存
      setPendingToken(data.token || data.access_token || "");
      pendingAccount.value = account;
      ElMessage.success("登录成功，请先设置登录密码");
      pendingTarget.value = redirect.value;
      setPasswordOpen.value = true;
      return;
    }
    applyLogin(data, account);
    await fetchMe();
    ElMessage.success("登录成功");
    await router.push(redirect.value);
  } catch {
    /* unwrap 已提示 */
  } finally {
    submitting.value = false;
  }
}

/** 重置密码成功后：回到密码登录并带上手机号 */
function onResetDone(account: string) {
  tab.value = "pwd";
  phone.value = account;
  errors.value = {};
}

/** 首次设置密码完成 → 再进站 */
async function onSetPasswordDone() {
  // 设置密码的响应里带新 token（弹窗里已存）；万一没带，就把临时 token 转正
  promotePendingToken();
  if (pendingAccount.value) setAccount(pendingAccount.value);
  await fetchMe();
  ElMessage.success("密码设置成功");
  await router.push(pendingTarget.value || "/home/index");
}

/** 首次设置密码点「退出登录」：不留半登录状态 */
function onSetPasswordCancel() {
  logout();
  ElMessage.info("已退出登录，登录后可继续设置密码");
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
