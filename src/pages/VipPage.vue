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
        <div class="vpPlans">
          <div
            v-for="plan in PLANS"
            :key="plan.id"
            class="vpPlan"
            :class="{ vpPlanRec: plan.recommend }"
          >
            <div v-if="plan.recommend" class="vpRibbon">推荐购买</div>
            <span v-if="plan.save" class="vpSave">{{ plan.save }}</span>
            <div class="vpPlanBody">
              <div class="vpPlanName">{{ plan.name }}</div>
              <div class="vpPlanPrice">
                <span class="vpYuan">¥</span>
                <span class="vpNum">{{ plan.price }}</span>
                <span class="vpUnit">/{{ plan.unit }}</span>
              </div>
              <div class="vpPlanSub">{{ plan.per }}</div>
              <el-button class="vpBtn" @click="open(plan)">立即开通</el-button>
            </div>
          </div>
        </div>

        <div class="vpPay flex col ac">
          <img class="vpQr" src="/clone-assets/vip/pay-qr.png" alt="扫码支付" />
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
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import UserDropdown from "@/components/UserDropdown.vue";
import { isPhone, toggleMenu } from "@/composables/useLayout";

interface Benefit {
  icon: string;
  /** 图标按设计稿原始尺寸渲染 */
  width: number;
  name: string;
  desc: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  /** 价格单位：/月、/季（设计稿口径） */
  unit: string;
  /** 折算价（月度没有这一行） */
  per: string;
  /** 优惠角标 */
  save: string;
  recommend?: boolean;
}

const BENEFITS: Benefit[] = [
  { icon: "/clone-assets/vip/icon-course.png", width: 42, name: "全部课程免费学", desc: "解锁所有课程内容" },
  { icon: "/clone-assets/vip/icon-word.png", width: 42, name: "全部单词免费学", desc: "海量单词任你学" },
  { icon: "/clone-assets/vip/icon-exclusive.png", width: 42, name: "专属会员课程", desc: "会员专属精品课" },
  { icon: "/clone-assets/vip/icon-report.png", width: 42, name: "学习报告详细分析", desc: "深度分析学习数据" },
  { icon: "/clone-assets/vip/icon-journal.png", width: 42, name: "学习手帐复习", desc: "不熟悉/已掌握内容不限量归档学习" },
  { icon: "/clone-assets/vip/icon-service.png", width: 42, name: "专属客服支持", desc: "一对一问题解答" },
];

/**
 * 套餐价格先按设计稿写死（月度 29、季度 69、年度 198）。
 * 后端目前没有会员/下单接口（v2 文档里 MembershipPort 还没接），
 * 接上以后换成接口下发即可，页面结构不用动。
 */
const PLANS: Plan[] = [
  { id: "month", name: "月度会员", price: 29, unit: "月", per: "", save: "" },
  { id: "quarter", name: "季度会员", price: 69, unit: "季", per: "¥23/月", save: "省¥18", recommend: true },
  { id: "year", name: "年度会员", price: 198, unit: "月", per: "¥16.5/月", save: "省¥150" },
];

function open(plan: Plan) {
  // 还没有下单/支付接口，先给个明确反馈（后端就绪后换成下单 + 二维码轮询）
  ElMessage.info(`${plan.name}支付功能即将上线，敬请期待`);
}
</script>
