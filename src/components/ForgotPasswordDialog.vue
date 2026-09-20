<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fpLayer flex ac jc">
      <div class="fpMask" @click="close" />
      <div class="fpCard" role="dialog" aria-modal="true" aria-label="忘记密码">
        <img class="fpShield" src="/clone-assets/login/forgot-shield.png" alt="" />
        <div class="fpTitle">忘记密码</div>
        <div class="fpDesc">输入手机号获取验证码，即可重置密码</div>

        <div class="fpRow flex ac">
          <span class="fpLabel">手机号</span>
          <el-input
            v-model="phone"
            class="fpInput"
            type="tel"
            inputmode="numeric"
            maxlength="11"
            placeholder="请输入注册手机号"
          />
        </div>

        <div class="fpRow flex ac">
          <span class="fpLabel">验证码</span>
          <el-input v-model="code" class="fpInput" maxlength="6" placeholder="请输入验证码" />
          <el-button
            class="fpSmsBtn"
            type="primary"
            :disabled="cooldown > 0"
            @click="sendCode"
          >
            {{ cooldown > 0 ? `${cooldown}s` : "获取验证码" }}
          </el-button>
        </div>

        <div class="fpRow flex ac">
          <span class="fpLabel">新密码</span>
          <el-input
            v-model="newPassword"
            class="fpInput"
            type="password"
            maxlength="20"
            placeholder="请输入新密码（至少8位）"
            show-password
          />
        </div>

        <div class="fpActions flex jc">
          <button type="button" class="fpBtn" @click="close">返回登录</button>
          <button
            type="button"
            class="fpBtn fpBtnPrimary"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? "提交中..." : "确认重置" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { resetPassword, sendSms } from "@/api/auth";
import {
  collectFieldErrors,
  minLength,
  noWhitespace,
  phoneRules,
  required,
  smsCodeRules,
  validate,
  type FieldBag,
} from "@/lib/rules";

const props = defineProps<{
  modelValue: boolean;
  /** 登录页已填的手机号，打开弹窗时带过来 */
  phone?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /** 重置成功，把手机号回传给登录页 */
  done: [phone: string];
}>();

const phone = ref("");
const code = ref("");
const newPassword = ref("");
const submitting = ref(false);
const cooldown = ref(0);
const errors = ref<Record<string, string>>({});
let timer: number | undefined;

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    phone.value = String(props.phone || "").trim();
    code.value = "";
    newPassword.value = "";
    errors.value = {};
  },
);

function close() {
  emit("update:modelValue", false);
}

function fields(): FieldBag {
  return {
    phone: { value: phone.value, rules: phoneRules },
    code: { value: code.value, rules: smsCodeRules },
    newPassword: {
      value: newPassword.value,
      rules: [required("请输入新密码"), noWhitespace("密码不能包含空格"), minLength(8, "密码至少8-32位，且包含字母和数字")],
    },
  };
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

async function submit() {
  if (submitting.value) return;
  const nextErrors = collectFieldErrors(fields());
  errors.value = nextErrors;
  const first = Object.values(nextErrors)[0];
  if (first) {
    ElMessage.warning(first);
    return;
  }
  submitting.value = true;
  try {
    await resetPassword({
      phone: phone.value.trim(),
      code: code.value.trim(),
      newPassword: newPassword.value,
    });
    ElMessage.success("密码已重置，请用新密码登录");
    emit("done", phone.value.trim());
    close();
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
