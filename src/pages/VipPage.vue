<template>
  <div class="contentBox vipPage">
    <header class="vpHead flex jb ac">
      <div class="vpHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="vpMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="vpTitle">开通会员</div>
      </div>
      <UserDropdown />
    </header>

    <div class="vpBody">
      <!-- 顶部横幅：插画背景 + 文案（背景图把设计稿的文案擦掉了） -->
      <section class="vpHero">
        <div class="vpHeroTitle">开通会员</div>
        <div class="vpHeroSub">解锁全部课程，畅学英语</div>
      </section>

      <!-- 会员权益 -->
      <section class="vpCard">
        <div class="vpCardTitle flex ac">
          <span class="vpCrown" aria-hidden="true" />
          会员权益
        </div>
        <div class="vpBenefits">
          <div v-for="item in BENEFITS" :key="item.name" class="vpBenefit flex ac">
            <img  class="vpBenefitIcon flex ac jc" :src="item.icon" :style="{ width: item.width + 'px' }" alt="" />
            <div class="vpBenefitText">
              <div class="vpBenefitName">{{ item.name }}</div>
              <div class="vpBenefitDesc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 选择套餐 -->
      <section class="vpCard">
        <div class="vpCardTitle flex ac">
          <span class="vpCrown" aria-hidden="true" />
          选择套餐
        </div>

        <!-- 已是会员：显示有效期（接口 /member/center 下发），按钮文案变「续费」 -->
        <div v-if="isMember" class="vpMemberLine">
          当前会员有效期至 {{ memberExpireText }}，续费后将在原到期时间上顺延
        </div>

        <el-skeleton v-if="plansLoading" animated>
          <template #template>
            <div class="vpPlans">
              <div v-for="n in 3" :key="n" class="vpPlan">
                <div class="vpPlanBody flex col ac">
                  <el-skeleton-item variant="text" class="vpSkeletonName" />
                  <el-skeleton-item variant="text" class="vpSkeletonPrice" />
                  <el-skeleton-item variant="button" class="vpSkeletonBtn" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>

        <div v-else-if="plans.length" class="vpPlans">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="vpPlan"
            :class="{ vpPlanRec: plan.isDefault === 1 }"
          >
            <div v-if="ribbonOf(plan)" class="vpRibbon">{{ ribbonOf(plan) }}</div>
            <span v-if="plan.savingCent > 0" class="vpSave">省¥{{ plan.savingText }}</span>
            <div class="vpPlanBody">
              <div class="vpPlanName">{{ plan.name }}</div>
              <div class="vpPlanPrice">
                <span class="vpYuan">¥</span>
                <span class="vpNum">{{ plan.priceText }}</span>
                <span class="vpUnit">/{{ unitOf(plan) }}</span>
              </div>
              <div class="vpPlanSub">{{ perMonthOf(plan) }}</div>
              <el-button class="vpBtn" @click="openPay(plan)">
                {{ isMember ? "续费" : "立即开通" }}
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="vpPlansEmpty flex col ac jc">
          <div class="vpPlansEmptyText">套餐加载失败，请稍后重试</div>
          <el-button class="mt10" type="primary" plain size="small" @click="loadPlans">重新加载</el-button>
        </div>

        <div class="vpPay flex col ac">
          <div class="vpPayTip flex ac jc">
            <span>使用</span>
            <img class="vpPayIcon" src="/clone-assets/vip/wechat.png" alt="微信" />
            <span>微信/</span>
            <img class="vpPayIcon" src="/clone-assets/vip/alipay.png" alt="支付宝" />
            <span>支付宝扫码支付</span>
          </div>
        </div>
      </section>
    </div>

    <!--
      支付弹窗：点「立即开通」先用 /member/orders 下单，再按订单渠道把 codeUrl / payUrl
      画成二维码，轮询 /member/orders/{id} 到已支付为止。
    -->
    <el-dialog
      v-model="payOpen"
      title="扫码支付"
      width="420px"
      :close-on-click-modal="false"
      append-to-body
      @closed="resetPay"
    >
      <div class="vpPayBox flex col ac">
        <div class="vpPayName">
          {{ payPlan?.name || "" }}
          <span v-if="isRenew" class="vpPayRenewTag">续费</span>
        </div>
        <div class="vpPayAmount">¥{{ payOrder?.amountText || payPlan?.priceText || "" }}</div>

        <el-radio-group
          v-model="payChannel"
          class="vpPayChannel"
          :disabled="payCreating"
          @change="onChannelChange"
        >
          <el-radio-button :value="1">微信支付</el-radio-button>
          <el-radio-button :value="2">支付宝</el-radio-button>
        </el-radio-group>

        <div class="vpQrBox flex ac jc">
          <img v-if="qrUrl" class="vpQrImg" :src="qrUrl" alt="支付二维码" />
          <div v-else class="vpQrLoading">{{ payError || "二维码生成中…" }}</div>
        </div>

        <div class="vpPayText">
          {{ payError || `请使用${payChannel === 2 ? "支付宝" : "微信"}扫一扫完成支付` }}
        </div>
        <div v-if="payRemain" class="vpPayRemain">支付剩余时间 {{ payRemain }}</div>
        <a v-if="alipayUrl" class="vpPayLink" :href="alipayUrl" target="_blank" rel="noopener">
          在浏览器打开支付宝收银台
        </a>
      </div>
      <template #footer>
        <el-button @click="payOpen = false">取消支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  createMemberOrder,
  fetchMemberCenter,
  fetchMemberOrder,
  type MemberOrder,
  type MemberPlan,
} from "@/api/member";
import { ensureLogin, isLoggedIn } from "@/composables/useAuth";
import { isPhone, toggleMenu } from "@/composables/useLayout";
import { toQrDataUrl } from "@/lib/qrcode";

interface Benefit {
  icon: string;
  /** 图标按设计稿原始尺寸渲染 */
  width: number;
  name: string;
  desc: string;
}

const BENEFITS: Benefit[] = [
  { icon: "/clone-assets/vip/icon-course.png", width: 42, name: "全部课程免费学", desc: "解锁所有课程内容" },
  { icon: "/clone-assets/vip/icon-word.png", width: 42, name: "全部单词免费学", desc: "海量单词任你学" },
  { icon: "/clone-assets/vip/icon-exclusive.png", width: 42, name: "专属会员课程", desc: "会员专属精品课" },
  { icon: "/clone-assets/vip/icon-report.png", width: 42, name: "学习报告详细分析", desc: "深度分析学习数据" },
  { icon: "/clone-assets/vip/icon-journal.png", width: 42, name: "学习手帐复习", desc: "不熟悉/已掌握内容不限量归档学习" },
  { icon: "/clone-assets/vip/icon-service.png", width: 42, name: "专属客服支持", desc: "一对一问题解答" },
];

/** 套餐（/member/center 下发，B 端配的顺序，前端不再排） */
const plans = ref<MemberPlan[]>([]);
const plansLoading = ref(true);
const isMember = ref(false);
const memberExpireAt = ref<string | null>(null);

const memberExpireText = computed(() => String(memberExpireAt.value || "").slice(0, 10));

async function loadPlans() {
  plansLoading.value = true;
  try {
    const center = await fetchMemberCenter();
    plans.value = center.plans;
    isMember.value = center.isMember;
    memberExpireAt.value = center.expireAt;
  } catch {
    plans.value = [];
  } finally {
    plansLoading.value = false;
  }
}

/** 角标：B 端配了 tag 用 tag；默认高亮档没配 tag 时退回设计稿的「推荐购买」 */
function ribbonOf(plan: MemberPlan) {
  return String(plan.tag || "").trim() || (plan.isDefault === 1 ? "推荐购买" : "");
}

/** 折合月单价：只有真比月卡便宜才显示（月卡自己不比，跟设计稿一致） */
function perMonthOf(plan: MemberPlan) {
  if (!plan.pricePerMonthText) return "";
  if (plan.pricePerMonthCent <= 0 || plan.pricePerMonthCent >= plan.priceCent) return "";
  return `¥${plan.pricePerMonthText}/月`;
}

/** 价格单位按套餐天数推（月卡/季卡/年卡这种名字也认） */
function unitOf(plan: MemberPlan) {
  const byName: Record<string, string> = { 月卡: "月", 季卡: "季", 年卡: "年", 半年卡: "半年" };
  if (byName[plan.name]) return byName[plan.name];
  if (plan.days >= 360) return "年";
  if (plan.days >= 170) return "半年";
  if (plan.days >= 85) return "季";
  if (plan.days >= 25) return "月";
  return `${plan.days}天`;
}

/* ---------------- 支付：下单 → 二维码 → 轮询 ---------------- */

const payOpen = ref(false);
const payPlan = ref<MemberPlan | null>(null);
/** 1=微信（Native 扫码） 2=支付宝（电脑网站支付） */
const payChannel = ref<1 | 2>(1);
const payOrder = ref<MemberOrder | null>(null);
const payCreating = ref(false);
const payError = ref("");
const qrUrl = ref("");
const payRemain = ref("");
const isRenew = ref(false);
let pollTimer: number | undefined;
let countdownTimer: number | undefined;

/** 支付宝收银台链接（微信只有二维码内容） */
const alipayUrl = computed(() =>
  payOrder.value?.payChannel === 2 ? payOrder.value.payUrl : "",
);

function errorText(error: unknown, fallback: string) {
  const value = error as {
    message?: string;
    response?: { data?: { message?: string; msg?: string } };
  };
  return value?.response?.data?.message || value?.response?.data?.msg || value?.message || fallback;
}

async function openPay(plan: MemberPlan) {
  if (!isLoggedIn.value) {
    await ensureLogin();
    return;
  }
  payPlan.value = plan;
  payChannel.value = 1;
  payOpen.value = true;
  await createOrder();
}

/** 下单（同套餐的待支付单后端会复用，所以切渠道重下单是安全的） */
async function createOrder() {
  const plan = payPlan.value;
  if (!plan || payCreating.value) return;
  payCreating.value = true;
  payError.value = "";
  qrUrl.value = "";
  payRemain.value = "";
  stopPolling();
  stopCountdown();
  try {
    const order = await createMemberOrder(plan.id, payChannel.value, { silent: true });
    payOrder.value = order;
    isRenew.value = order.isRenew;
    // 后端复用了另一个渠道的待支付单时，以订单实际渠道为准
    if (order.payChannel === 1 || order.payChannel === 2) payChannel.value = order.payChannel;
    const content =
      order.payChannel === 2 ? order.payUrl || order.codeUrl : order.codeUrl || order.payUrl;
    qrUrl.value = toQrDataUrl(content);
    if (!qrUrl.value) payError.value = "二维码生成失败，请重新下单";
    startCountdown(order.expireAt);
    if (!payError.value) startPolling();
  } catch (error) {
    payOrder.value = null;
    payError.value = errorText(error, "下单失败，请稍后重试");
  } finally {
    payCreating.value = false;
  }
}

function onChannelChange() {
  void createOrder();
}

function startPolling() {
  stopPolling();
  pollTimer = window.setInterval(() => void checkPaid(), 3000);
}

async function checkPaid() {
  const order = payOrder.value;
  if (!order) return;
  try {
    const status = await fetchMemberOrder(order.orderId, { silent: true });
    if (status.paid) {
      stopPolling();
      stopCountdown();
      ElMessage.success(
        status.memberExpireAt
          ? `会员开通成功，有效期至 ${String(status.memberExpireAt).slice(0, 10)}`
          : "会员开通成功",
      );
      payOpen.value = false;
      void loadPlans();
      return;
    }
    if (status.status === 3 || status.status === 4) {
      stopPolling();
      stopCountdown();
      payError.value = status.statusLabel || "订单已关闭，请重新下单";
    }
  } catch {
    /* 轮询失败不打扰用户，下一轮再查 */
  }
}

function startCountdown(expireAt: string) {
  stopCountdown();
  const end = new Date(String(expireAt).replace(/-/g, "/")).getTime();
  if (!Number.isFinite(end) || end <= Date.now()) return;
  const tick = () => {
    const left = end - Date.now();
    if (left <= 0) {
      payRemain.value = "";
      stopCountdown();
      stopPolling();
      payError.value = "订单已超时，请重新下单";
      return;
    }
    const total = Math.floor(left / 1000);
    payRemain.value = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };
  tick();
  countdownTimer = window.setInterval(tick, 1000);
}

function stopPolling() {
  if (pollTimer) window.clearInterval(pollTimer);
  pollTimer = undefined;
}

function stopCountdown() {
  if (countdownTimer) window.clearInterval(countdownTimer);
  countdownTimer = undefined;
}

/** 关弹窗：停掉轮询，订单留着（后端会复用未过期的待支付单） */
function resetPay() {
  stopPolling();
  stopCountdown();
  payOrder.value = null;
  qrUrl.value = "";
  payError.value = "";
  payRemain.value = "";
}

onMounted(() => {
  void loadPlans();
});

onUnmounted(() => {
  stopPolling();
  stopCountdown();
});
</script>
