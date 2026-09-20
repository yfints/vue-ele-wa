<template>
  <Teleport to="body">
    <div v-if="modelValue" class="caLayer flex ac jc">
      <div class="caMask" @click="close" />
      <div class="caCard" role="dialog" aria-modal="true" aria-label="注销账户">
        <span class="caIcon flex ac jc" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="24" fill="#F5222D" />
            <path d="M24 11.5v15" stroke="#fff" stroke-width="4" stroke-linecap="round" />
            <circle cx="24" cy="33.5" r="2.4" fill="#fff" />
          </svg>
        </span>

        <div class="caTitle">注销账户操作不可逆，请谨慎操作！</div>

        <input
          v-model="confirmText"
          class="caInput"
          type="text"
          maxlength="10"
          placeholder='请输入"确认注销"以确认操作'
          autocomplete="off"
        />

        <div class="caActions flex">
          <button type="button" class="caBtn" @click="close">取消</button>
          <button
            type="button"
            class="caBtn caBtnPrimary"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? "注销中…" : "注销账户" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { cancelMyAccount } from "@/api/user";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /** 注销成功（父级负责清登录态 + 跳登录页 + 弹 toast） */
  done: [];
}>();

/** 设计稿要求手动输入「确认注销」才能点按钮 */
const CONFIRM_TEXT = "确认注销";
const confirmText = ref("");
const submitting = ref(false);

const canSubmit = computed(() => confirmText.value.trim() === CONFIRM_TEXT);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    confirmText.value = "";
    submitting.value = false;
  },
);

function close() {
  if (submitting.value) return;
  emit("update:modelValue", false);
}

async function submit() {
  if (submitting.value) return;
  // 设计稿里按钮一直是可点的蓝色，这里点的时候再校验输入
  if (!canSubmit.value) {
    ElMessage.warning('请输入"确认注销"以确认操作');
    return;
  }
  submitting.value = true;
  try {
    await cancelMyAccount();
    emit("update:modelValue", false);
    emit("done");
  } catch (error) {
    // 后端对已注销 / 失效 token 会报错，这里把原文提示出来
    const message = error instanceof Error && error.message ? error.message : "注销失败，请稍后重试";
    ElMessage.error(message);
  } finally {
    submitting.value = false;
  }
}
</script>
