<template>
  <div class="loginPage">
    <div class="loginStage">
      <div class="loginHeroCopy">
        <p class="loginHeroTitle">用英语，<br />打开更大的自己</p>
        <span class="loginHeroBar"></span>
        <p class="loginHeroSub">成人英语学习平台 · 随时随地高效学英语</p>
      </div>
      <div class="loginCard">
        <div class="loginCardInner">
          <div class="loginBrand">
            <img src="/clone-assets/login/logo-englishgo.png" class="loginLogo" alt="Englishgo" />
          </div>
          <h1 class="loginTitle">欢迎登录</h1>

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
            <p v-if="errors.phone" class="fieldError">{{ errors.phone }}</p>

            <div class="loginField" :class="{ isError: Boolean(errors.sms) }">
              <el-icon class="loginFieldIcon"><Lock /></el-icon>
              <el-input
                v-model="sms"
                class="loginInput"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="请输入验证码"
                @blur="touch('sms')"
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
            <p v-if="errors.sms" class="fieldError">{{ errors.sms }}</p>

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
            <p v-if="errors.agreed" class="fieldError">{{ errors.agreed }}</p>

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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Lock, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { loginByPassword, sendSms } from "@/api/auth";
import { applyLogin, fetchMe } from "@/composables/useAuth";
import {
  agreeRules,
  collectFieldErrors,
  phoneRules,
  smsCodeRules,
  validate,
  type FieldBag,
} from "@/lib/rules";

const router = useRouter();
const route = useRoute();
const phone = ref("");
const sms = ref("");
const agreed = ref(false);
const submitting = ref(false);
const cooldown = ref(0);
const errors = ref<Record<string, string>>({});
let timer: number | undefined;

function currentFields(): FieldBag {
  return {
    phone: { value: phone.value, rules: phoneRules },
    sms: { value: sms.value, rules: smsCodeRules },
    agreed: { value: String(agreed.value), rules: agreeRules },
  };
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
      cooldown.value = 60;
      timer = window.setInterval(() => {
        cooldown.value -= 1;
        if (cooldown.value <= 0 && timer) {
          clearInterval(timer);
          timer = undefined;
        }
      }, 1000);
    })
    .catch(() => {
      /* http 拦截器已提示 */
    });
}

function openDoc(name: string) {
  ElMessage.info(`${name}即将上线`);
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
    const data = await loginByPassword(phone.value.trim(), sms.value);
    applyLogin(data, phone.value.trim());
    await fetchMe();
    ElMessage.success("登录成功");
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
