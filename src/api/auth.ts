import { post } from "./http";

export interface LoginResult {
  user_id?: number;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export function loginByPassword(phone: string, code: string) {
  return post<LoginResult>("/auth/login", {
    phone,
    code,
    client: "pc",
  });
}

export function sendSms(phone: string) {
  return post("/auth/sms/send", { phone, scene: "login" });
}
