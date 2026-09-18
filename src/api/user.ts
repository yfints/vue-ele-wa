import { get, post } from "./http";

export interface ActiveVip {
  vip_id?: number;
}

export interface UserProfile {
  /** 用户 ID（雪花 Long，序列化为字符串） */
  userId?: number | string;
  /** 邀请码，未生成时为 null */
  invitationCode?: string | null;
  /** 头像 URL */
  headImg?: string | null;
  /** 昵称 */
  nickname?: string;
  /** 手机号（登录账号） */
  phone?: string;
  /** 签名 */
  signature?: string | null;
  /** 微信号 */
  wechatId?: string | null;
  /** 注册时间 */
  createdAt?: string;
  /** 以下为历史兼容字段 */
  name?: string;
  avatar?: string;
  headimg?: string;
  head_img?: string;
  active_vips?: ActiveVip;
  user?: UserProfile;
}

export async function fetchMyProfile() {
  const data = await get<UserProfile>("/user/my");
  return data?.user ?? data;
}

/** 修改个人信息：昵称 / 签名 / 微信号全量提交，签名与微信号传 null 表示清空 */
export interface UserProfileUpdate {
  nickname: string;
  signature: string | null;
  wechatId: string | null;
}

export function updateMyProfile(payload: UserProfileUpdate) {
  return post("/user/profile", payload);
}

/** 注销账号：逻辑删除，注销后手机号不可再注册 */
export function cancelMyAccount() {
  return post("/user/cancel");
}
