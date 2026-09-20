import { post } from "./http";

export interface LoginResult {
  user_id?: number;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
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
