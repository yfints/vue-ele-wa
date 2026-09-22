import { get, post } from "./http";

/**
 * 会员中心 / 会员支付（C 端）
 * - `GET  /member/center`      开通会员页聚合数据（未登录也能调，此时 isMember 恒 false）
 * - `GET  /member/my`          我的会员
 * - `POST /member/orders`      下单（金额服务端现算，请求体里没有金额）
 * - `GET  /member/orders/{id}` 查单（前端轮询支付结果）
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function textOf(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

/** 套餐里的一条权益：included 0=不包含（前端画 ×） 1=包含（画 ✓） */
export interface MemberBenefit {
  name: string;
  included: number;
}

/** 上架套餐（B 端配置，按 sortOrder 降序下发，前端不要再排） */
export interface MemberPlan {
  id: string;
  name: string;
  /** 会员时长（天） */
  days: number;
  /** 售价（分） */
  priceCent: number;
  /** 售价展示串（元），整数元时没有小数位 */
  priceText: string;
  /** 折合每月（分） */
  pricePerMonthCent: number;
  /** 折合每月展示串（元） */
  pricePerMonthText: string;
  /** 相比按月购买省下的（分），0 = 不比（月卡就是 0） */
  savingCent: number;
  savingText: string;
  /** 角标文案（推荐 / 限时），空 = 不显示 */
  tag: string;
  /** 是否默认高亮：0 否 1 是 */
  isDefault: number;
  sortOrder: number;
  benefits: MemberBenefit[];
}

export interface MemberCenter {
  isMember: boolean;
  /** 会员到期时间（非会员为 null） */
  expireAt: string | null;
  /** B 端配的默认高亮档 */
  defaultPlanId: string;
  plans: MemberPlan[];
}

function normalizePlan(row: unknown): MemberPlan | null {
  const raw = asRecord(row);
  if (!raw) return null;
  const id = raw.id;
  if (id == null || id === "") return null;
  const benefits = Array.isArray(raw.benefits)
    ? raw.benefits
        .map((item) => {
          const benefit = asRecord(item);
          if (!benefit) return null;
          return {
            name: textOf(benefit.name),
            included: Number(benefit.included ?? 0) || 0,
          };
        })
        .filter((item): item is MemberBenefit => Boolean(item))
    : [];
  return {
    id: String(id),
    name: textOf(raw.name),
    days: Number(raw.days ?? 0) || 0,
    priceCent: Number(raw.priceCent ?? 0) || 0,
    priceText: textOf(raw.priceText),
    pricePerMonthCent: Number(raw.pricePerMonthCent ?? 0) || 0,
    pricePerMonthText: textOf(raw.pricePerMonthText),
    savingCent: Number(raw.savingCent ?? 0) || 0,
    savingText: textOf(raw.savingText),
    tag: textOf(raw.tag),
    isDefault: Number(raw.isDefault ?? 0) || 0,
    sortOrder: Number(raw.sortOrder ?? 0) || 0,
    benefits,
  };
}

export async function fetchMemberCenter(): Promise<MemberCenter> {
  const raw = ((await get<Record<string, unknown>>("/member/center", undefined, {
    // 未登录也要能浏览套餐，别因为 401 把人踢去登录页
    skipAuthRedirect: true,
  })) || {}) as Record<string, unknown>;
  const plans = Array.isArray(raw.plans)
    ? raw.plans.map(normalizePlan).filter((plan): plan is MemberPlan => Boolean(plan))
    : [];
  return {
    isMember: raw.isMember === true,
    expireAt: (raw.expireAt as string | null) ?? null,
    defaultPlanId: textOf(raw.defaultPlanId),
    plans,
  };
}

/** 我的会员：非会员返回 isMember=false、remainDays=0，不报错 */
export interface MyMember {
  isMember: boolean;
  expireAt: string | null;
  remainDays: number;
  totalDays: number;
}

export async function fetchMyMember(): Promise<MyMember> {
  const raw = ((await get<Record<string, unknown>>("/member/my", undefined, {
    skipAuthRedirect: true,
  })) || {}) as Record<string, unknown>;
  return {
    isMember: raw.isMember === true,
    expireAt: (raw.expireAt as string | null) ?? null,
    remainDays: Number(raw.remainDays ?? 0) || 0,
    totalDays: Number(raw.totalDays ?? 0) || 0,
  };
}

/** 下单结果：codeUrl 是二维码**内容**（微信 Native），payUrl 是收银台链接（支付宝） */
export interface MemberOrder {
  orderId: string;
  outTradeNo: string;
  /** 1=微信 2=支付宝 */
  payChannel: number;
  amountCent: number;
  amountText: string;
  /** 二维码内容链接（不是图片地址） */
  codeUrl: string;
  /** 收银台跳转链接 */
  payUrl: string;
  /** 订单超时时间（前端倒计时） */
  expireAt: string;
  /** true = 已是会员，本次在原到期时间上顺延（文案用「续费」） */
  isRenew: boolean;
  currentExpireAt: string | null;
}

export async function createMemberOrder(
  planId: string | number,
  payChannel: 1 | 2,
  config?: { silent?: boolean },
): Promise<MemberOrder> {
  const raw = ((await post<Record<string, unknown>>(
    "/member/orders",
    { planId, payChannel },
    config,
  )) || {}) as Record<string, unknown>;
  return {
    orderId: textOf(raw.orderId),
    outTradeNo: textOf(raw.outTradeNo),
    payChannel: Number(raw.payChannel ?? 0) || 0,
    amountCent: Number(raw.amountCent ?? 0) || 0,
    amountText: textOf(raw.amountText),
    codeUrl: textOf(raw.codeUrl),
    payUrl: textOf(raw.payUrl),
    expireAt: textOf(raw.expireAt),
    isRenew: raw.isRenew === true,
    currentExpireAt: (raw.currentExpireAt as string | null) ?? null,
  };
}

/** 查单结果：只用 paid 判断是否支付成功即可 */
export interface MemberOrderStatus {
  orderId: string;
  /** 1 待支付 2 已支付 3 已关闭 4 已退款 */
  status: number;
  statusLabel: string;
  paid: boolean;
  amountText: string;
  planName: string;
  payChannel: number;
  paidAt: string | null;
  expireAt: string;
  memberExpireAt: string | null;
}

export async function fetchMemberOrder(
  orderId: string | number,
  config?: { silent?: boolean },
): Promise<MemberOrderStatus> {
  const raw = ((await get<Record<string, unknown>>(`/member/orders/${orderId}`, undefined, {
    skipAuthRedirect: true,
    ...config,
  })) || {}) as Record<string, unknown>;
  return {
    orderId: textOf(raw.orderId),
    status: Number(raw.status ?? 0) || 0,
    statusLabel: textOf(raw.statusLabel),
    paid: raw.paid === true,
    amountText: textOf(raw.amountText),
    planName: textOf(raw.planName),
    payChannel: Number(raw.payChannel ?? 0) || 0,
    paidAt: (raw.paidAt as string | null) ?? null,
    expireAt: textOf(raw.expireAt),
    memberExpireAt: (raw.memberExpireAt as string | null) ?? null,
  };
}
