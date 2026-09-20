import { post } from "./http";

export interface LoginResult {
  user_id?: number;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  /** 后端新加的字段：用户信息 + 是否是新号 + 是否已设置登录密码 */
  userId?: number | string;
  phone?: string;
  name?: string;
  avatar?: string | null;
  isNewUser?: boolean;
  /** false 表示账号还没设过密码（验证码登录自动建号就是这种），需要先设置密码再进站 */
  passwordSet?: boolean;
}

/** 验证码登录：手机号 + 短信验证码 */
export function loginBySms(phone: string, code: string) {
  return post<LoginResult>("/auth/login", {
    phone,
    code,
    client: "pc",
  });
}

/** 密码登录：手机号 + 密码（未设置过密码的账号会提示先用验证码登录去设置） */
export function loginByPassword(phone: string, password: string) {
  return post<LoginResult>("/auth/login", {
    phone,
    password,
    client: "pc",
  });
}

/** 注册：手机号 + 验证码 + 设置密码，成功即返回登录态 */
export function registerAccount(params: { phone: string; code: string; password: string }) {
  return post<LoginResult>("/auth/register", params);
}

/** 忘记密码：手机号 + 验证码 + 新密码 */
export function resetPassword(params: { phone: string; code: string; newPassword: string }) {
  return post("/auth/password/forgot", params);
}

export function sendSms(phone: string) {
  return post("/auth/sms/send", { phone, scene: "login" });
}
