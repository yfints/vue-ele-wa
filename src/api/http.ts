import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
import { clearAuth, getAuthToken } from "./token";

/** 开发走 Vite 代理；打包后用 `.env` 的 `VITE_API_BASE_URL` */
export const BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : (import.meta.env.VITE_API_BASE_URL || "https://api.waxueshe.com") + "/api/v1";

export interface ApiResult<T = unknown> {
  code: number;
  message?: string;
  msg?: string;
  data: T;
}

/**
 * 请求配置扩展：
 * - skipAuthRedirect：401 不跳登录页（未登录场景自己处理）
 * - silent：业务报错不弹全局 toast（调用方要自己兜底/自己提示时用）
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuthRedirect?: boolean;
  silent?: boolean;
}

function apiMessage(payload: unknown, fallback = "请求失败") {
  if (payload && typeof payload === "object") {
    const data = payload as { message?: string; msg?: string };
    return data.message || data.msg || fallback;
  }
  return fallback;
}

let unauthorizedNotified = false;

/** 网关对「没带 token / token 过期」的统一文案，这种就换成更友好的提示 */
const GENERIC_UNAUTHORIZED = "未认证或登录已过期";

/**
 * 401（HTTP 状态或业务 code）：清登录态 + 把报错提示出来。
 *
 * - 登录页上的 401 是本轮请求的业务报错（后端把「手机号或密码错误」也走 401），
 *   这种每次都提示、不跳转 —— 否则用户点了登录什么反馈都没有；
 * - 其他页面的 401 是登录失效：提示一次（带 redirect）回登录页，
 *   同一批并发请求只提示一次，避免刷屏。
 */
function handleUnauthorized(message?: string) {
  const route = router.currentRoute.value;
  const onLogin = route.path.startsWith("/login");
  clearAuth();

  const text = String(message || "").trim();
  const hasOwnMessage = Boolean(text) && text !== GENERIC_UNAUTHORIZED;

  if (onLogin) {
    // 登录 / 注册 / 找回密码自己的报错，原样展示后端文案
    ElMessage.error(hasOwnMessage ? text : "登录失败，请检查账号或密码");
    return;
  }

  if (unauthorizedNotified) return;
  unauthorizedNotified = true;
  ElMessage.error(hasOwnMessage ? text : "登录已失效，请重新登录");

  const redirect = route.fullPath && route.fullPath !== "/" ? route.fullPath : "";
  void router.push({
    path: "/login/index",
    query: redirect ? { redirect } : undefined,
  });
}

function notifyApiError(payload: unknown, code?: number, fallback = "请求失败") {
  if (code === 401) {
    if (unauthorizedNotified) return;
    unauthorizedNotified = true;
  }
  ElMessage.error(apiMessage(payload, fallback));
}

const BIG_INT_RE = /(?<![\d."])[+-]?\d{16,}(?![\d.eE])/g;
const PLACEHOLDER_RE = /"\u0001(\d+)\u0001"/g;

/** 解析 JSON 时把超长整数转成字符串，避免超出 Number.MAX_SAFE_INTEGER 精度丢失 */
function parseLosslessJson(text: string): unknown {
  const strings: string[] = [];
  const shielded = text.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
    strings.push(match);
    return `"\u0001${strings.length - 1}\u0001"`;
  });
  const bigified = shielded.replace(BIG_INT_RE, (match) => `"${match}"`);
  const restored = bigified.replace(PLACEHOLDER_RE, (_match, index: string) => strings[Number(index)]);
  return JSON.parse(restored);
}

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 65000,
  headers: {
    "Content-Type": "application/json",
  },
  transformResponse: [
    (data: unknown) => {
      if (typeof data !== "string") return data;
      try {
        return parseLosslessJson(data);
      } catch {
        return data;
      }
    },
  ],
});

http.interceptors.request.use((config) => {
  // 正式 token 或「待设置密码」的临时 token（内存里的，不落盘）
  const token = getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    unauthorizedNotified = false;
    return response;
  },
  (error: unknown) => {
    const config = axios.isAxiosError(error) ? error.config : undefined;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const payload = axios.isAxiosError(error) ? error.response?.data : undefined;
    const code =
      payload && typeof payload === "object" && "code" in payload
        ? (payload as ApiResult).code
        : status === 401
          ? 401
          : undefined;

    if (status === 401 || code === 401) {
      // 登录失效：清登录态 + 提示一次 + 跳登录页（带 redirect 回跳地址）
      handleUnauthorized(payload.message);
      return Promise.reject(error);
    }

    const silent = Boolean((config as ApiRequestConfig | undefined)?.silent);
    if (silent) return Promise.reject(error);

    if (code != null && code !== 200) {
      notifyApiError(payload, code);
    } else if (axios.isAxiosError(error) && !config?.skipAuthRedirect) {
      notifyApiError(payload, undefined, error.message || "网络异常，请稍后重试");
    }
    return Promise.reject(error);
  },
);

function unwrap<T>(payload: ApiResult<T> | T, silent = false): T {
  if (payload && typeof payload === "object" && "code" in payload) {
    const result = payload as ApiResult<T>;
    if (result.code !== 200) {
      if (result.code === 401) {
        // 业务 401 也带上后端文案（登录页「手机号或密码错误」就是这种）
        handleUnauthorized(apiMessage(result, "登录已失效，请重新登录"));
        throw new Error(apiMessage(result, "登录已失效，请重新登录"));
      }
      if (!silent) notifyApiError(result, result.code);
      throw new Error(apiMessage(result));
    }
    unauthorizedNotified = false;
    return result.data;
  }
  return payload as T;
}

async function request<T>(config: ApiRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiResult<T> | T> = await http.request(config);
  return unwrap(response.data, Boolean(config.silent));
}

export function get<T>(url: string, params?: unknown, config?: ApiRequestConfig) {
  return request<T>({ ...config, method: "GET", url, params });
}

export function post<T>(url: string, data?: unknown, config?: ApiRequestConfig) {
  return request<T>({ ...config, method: "POST", url, data });
}

export function put<T>(url: string, data?: unknown, config?: ApiRequestConfig) {
  return request<T>({ ...config, method: "PUT", url, data });
}

export function patch<T>(url: string, data?: unknown, config?: ApiRequestConfig) {
  return request<T>({ ...config, method: "PATCH", url, data });
}

export function del<T>(url: string, params?: unknown, config?: ApiRequestConfig) {
  return request<T>({ ...config, method: "DELETE", url, params });
}

export { clearAuth, getAccount, getToken, setAccount, setToken } from "./token";
