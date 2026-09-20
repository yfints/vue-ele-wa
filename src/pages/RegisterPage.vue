<template>
  <div class="loginPage registerPage">
    <div class="loginStage">
      <div class="loginHeroCopy">
        <p class="loginHeroTitle">用英语，<br />打开更大的自己</p>
        <span class="loginHeroBar"></span>
        <p class="loginHeroSub">成人英语学习平台·随时随地高效学英语</p>
      </div>

      <div class="loginCard">
        <div class="loginCardInner">
          <div class="registerHead flex ac">
            <button type="button" class="registerBack flex ac hand" @click="goLogin">
              <svg class="registerBackIcon" viewBox="0 0 24 24" aria-hidden="true">
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
            <div class="registerTitle">
              <span class="registerWave" aria-hidden="true">👋</span>
              欢迎注册账号
            </div>
          </div>

          <el-form class="loginForm registerForm" @submit.prevent="submit">
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

            <div class="loginField" :class="{ isError: Boolean(errors.code) }">
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
            <p class="fieldError">{{ errors.code || "" }}</p>

            <div class="loginField" :class="{ isError: Boolean(errors.password) }">
              <el-icon class="loginFieldIcon"><Lock /></el-icon>
              <el-input
                v-model="password"
                class="loginInput"
                type="password"
                maxlength="20"
                placeholder="设置密码，6-20位字母、数字或字符"
                show-password
                @blur="touch('password')"
              />
            </div>
            <p class="fieldError">{{ errors.password || "" }}</p>

            <div class="loginField" :class="{ isError: Boolean(errors.repeat) }">
              <el-icon class="loginFieldIcon"><Lock /></el-icon>
              <el-input
                v-model="repeat"
                class="loginInput"
                type="password"
                maxlength="20"
                placeholder="确认密码"
                show-password
                @blur="touch('repeat')"
              />
            </div>
            <p class="fieldError">{{ errors.repeat || "" }}</p>

            <el-button
              class="loginSubmit registerSubmit"
              type="primary"
              native-type="submit"
              :loading="submitting"
              :disabled="submitting"
            >
              {{ submitting ? "注册中..." : "注册" }}
            </el-button>

            <el-checkbox v-model="agreed" class="loginAgree registerAgree">
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
          </el-form>

          <div class="loginRegisterRow registerLoginRow">
            已有账号？
            <RouterLink to="/login/index" class="loginLink">返回登录</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Lock, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { registerAccount, sendSms } from "@/api/auth";
import { applyLogin, fetchMe } from "@/composables/useAuth";
import {
  agreeRules,
  collectFieldErrors,
  noWhitespace,
  phoneRules,
  required,
  smsCodeRules,
  validate,
  type FieldBag,
} from "@/lib/rules";

const router = useRouter();
const route = useRoute();
const phone = ref("");
const code = ref("");
const password = ref("");
const repeat = ref("");
const agreed = ref(false);
const submitting = ref(false);
const cooldown = ref(0);
const errors = ref<Record<string, string>>({});
let timer: number | undefined;

/** 注册密码按设计稿：6–20 位字母、数字或字符 */
const registerPasswordRules = [
  required("请设置密码"),
  noWhitespace("密码不能包含空格"),
  { id: "length", message: "密码长度 6–20 位", test: (v: string) => v.trim().length >= 6 && v.trim().length <= 20 },
];

function fields(): FieldBag {
  return {
    phone: { value: phone.value, rules: phoneRules },
    code: { value: code.value, rules: smsCodeRules },
    password: { value: password.value, rules: registerPasswordRules },
    repeat: { value: repeat.value, rules: [required("请再次输入密码")] },
    agreed: { value: String(agreed.value), rules: agreeRules },
  };
}

function touch(field: string) {
  const item = fields()[field];
  if (!item) return;
  let message = validate(item.value, item.rules);
  if (!message && field === "repeat" && repeat.value !== password.value) {
    message = "两次输入的密码不一致";
  }
  if (message) errors.value = { ...errors.value, [field]: message };
  else {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
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

function goLogin() {
  void router.push({ path: "/login/index", query: route.query });
}

async function submit() {
  if (submitting.value) return;
  const nextErrors = collectFieldErrors(fields());
  if (!nextErrors.repeat && repeat.value !== password.value) {
    nextErrors.repeat = "两次输入的密码不一致";
  }
  errors.value = nextErrors;
  const first = Object.values(nextErrors)[0];
  if (first) {
    ElMessage.warning(first);
    return;
  }
  submitting.value = true;
  try {
    const account = phone.value.trim();
    const data = await registerAccount({
      phone: account,
      code: code.value.trim(),
      password: password.value,
    });
    applyLogin(data, account);
    await fetchMe();
    ElMessage.success("注册成功");
    const redirect = route.query.redirect;
    const target =
      typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
        ? redirect
        : "/home/index";
    await router.push(target);
  } catch {
    /* unwrap 已提示 */
  } finally {
    submitting.value = false;
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
