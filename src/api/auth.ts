import { post } from "./http";

export interface LoginResult {
  user_id?: number;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export function loginByPassword(phone: string, password: string) {
  return post<LoginResult>("/api/v2/auth/login", {
    phone,
    password,
    client: "pc",
  });
}
