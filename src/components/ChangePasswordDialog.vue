<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fpLayer flex ac jc">
      <div class="fpMask" @click="close" />
      <div class="fpCard" role="dialog" aria-modal="true" aria-label="修改密码">
        <img class="fpShield" src="/clone-assets/login/forgot-shield.png" alt="" />
        <div class="fpTitle">修改密码</div>
        <div class="fpDesc">为保证账号安全，请先验证手机号再设置新密码</div>

        <div class="fpRow flex ac">
          <span class="fpLabel">手机号</span>
          <input class="cpPhone" :value="maskedPhone" readonly />
        </div>

        <div class="fpRow flex ac">
          <span class="fpLabel">验证码</span>
          <el-input v-model="code" class="fpInput" maxlength="6" placeholder="请输入验证码" />
          <el-button class="fpSmsBtn" type="primary" :disabled="cooldown > 0" @click="sendCode">
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

        <div class="fpRow flex ac">
          <span class="fpLabel">确认新密码</span>
          <el-input
            v-model="repeat"
            class="fpInput"
            type="password"
            maxlength="20"
            placeholder="请输入新密码（至少8位）"
            show-password
          />
        </div>

        <div class="fpActions flex jc">
          <button type="button" class="fpBtn" @click="close">取消</button>
          <button
            type="button"
            class="fpBtn fpBtnPrimary"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? "提交中..." : "确认修改" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { sendSms } from "@/api/auth";
import { setToken } from "@/api/token";
import { changeMyPassword } from "@/api/user";
import {
  collectFieldErrors,
  minLength,
  noWhitespace,
  required,
  smsCodeRules,
  type FieldBag,
} from "@/lib/rules";

const props = defineProps<{
  modelValue: boolean;
  /** 当前登录手机号（设计稿里只读展示，中间四位打码） */
  phone?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /** 修改成功 */
  done: [];
}>();

const code = ref("");
const newPassword = ref("");
const repeat = ref("");
const submitting = ref(false);
const cooldown = ref(0);
let timer: number | undefined;

const maskedPhone = computed(() => {
  const value = String(props.phone || "").trim();
  return /^\d{11}$/.test(value) ? `${value.slice(0, 3)}****${value.slice(7)}` : value;
});

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    code.value = "";
    newPassword.value = "";
    repeat.value = "";
    submitting.value = false;
  },
);

function close() {
  emit("update:modelValue", false);
}

function fields(): FieldBag {
  return {
    code: { value: code.value, rules: smsCodeRules },
    newPassword: {
      value: newPassword.value,
      rules: [
        required("请输入新密码"),
        noWhitespace("密码不能包含空格"),
        minLength(8, "密码至少 8 位"),
      ],
    },
    repeat: { value: repeat.value, rules: [required("请再次输入新密码")] },
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
  const phone = String(props.phone || "").trim();
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning("当前账号手机号有误，请重新登录后再试");
    return;
  }
  sendSms(phone)
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
  if (!nextErrors.repeat && repeat.value !== newPassword.value) {
    nextErrors.repeat = "两次输入的新密码不一致";
  }
  const first = Object.values(nextErrors)[0];
  if (first) {
    ElMessage.warning(first);
    return;
  }
  submitting.value = true;
  try {
    const data = await changeMyPassword({
      newPassword: newPassword.value,
      code: code.value.trim(),
    });
    // 改密后旧 token 立即失效，必须把新 token 存下来
    const token = data?.token || data?.access_token;
    if (token) setToken(token);
    emit("update:modelValue", false);
    emit("done");
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
