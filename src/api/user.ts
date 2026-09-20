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
  /**
   * 头像地址（/upload 返回的相对路径）。
   * 注意：接口文档里 /user/profile 目前只写了昵称/签名/微信号三个字段，
   * 后端补上 headImg 之前，这一项不会落库。
   */
  headImg?: string;
}

export function updateMyProfile(payload: UserProfileUpdate) {
  return post("/user/profile", payload);
}

/**
 * 上传文件（multipart，字段名 file），返回 /uploads 相对路径。
 * 头像场景用默认 maxSide=512，封面这类需要更清晰的显式传大一点的值。
 */
export function uploadFile(file: File, maxSide = 512) {
  const form = new FormData();
  form.append("file", file);
  return post<string>(`/upload?maxSide=${maxSide}`, form);
}

/** 注销账号：逻辑删除，注销后手机号不可再注册 */
export function cancelMyAccount() {
  return post("/user/cancel");
}

/**
 * 修改密码（需登录）：验证码 + 新密码。
 * 接口会返回一套**新的 token**（旧 token 立刻失效），所以调用方必须把 token 覆盖掉。
 */
export interface PasswordChangeResult {
  user_id?: number;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export function changeMyPassword(payload: { newPassword: string; code?: string }) {
  return post<PasswordChangeResult>("/user/password", payload);
}
