import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
import { clearAuth, getToken } from "./token";

/** 开发走 Vite 代理；打包后用 `.env` 的 `VITE_API_BASE_URL` */
export const BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL || "https://api.waxueshe.com";

export interface ApiResult<T = unknown> {
  code: number;
  message?: string;
  msg?: string;
  data: T;
}

function apiMessage(payload: unknown, fallback = "请求失败") {
  if (payload && typeof payload === "object") {
    const data = payload as { message?: string; msg?: string };
    return data.message || data.msg || fallback;
  }
  return fallback;
}

let unauthorizedNotified = false;

function notifyApiError(payload: unknown, code?: number, fallback = "请求失败") {
  if (code === 401) {
    if (unauthorizedNotified) return;
    unauthorizedNotified = true;
  }
  ElMessage.error(apiMessage(payload, fallback));
}

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  config.headers.Authorization = `Bearer ${token}`;
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

    if (code != null && code !== 200) {
      notifyApiError(payload, code);
    } else if (axios.isAxiosError(error) && !config?.skipAuthRedirect) {
      notifyApiError(payload, undefined, error.message || "网络异常，请稍后重试");
    }

    if (status === 401 || code === 401) {
      clearAuth();
      if (!config?.skipAuthRedirect && !router.currentRoute.value.path.startsWith("/login")) {
        void router.push("/login/index");
      }
    }
    return Promise.reject(error);
  },
);

function unwrap<T>(payload: ApiResult<T> | T): T {
  if (payload && typeof payload === "object" && "code" in payload) {
    const result = payload as ApiResult<T>;
    if (result.code !== 200) {
      notifyApiError(result, result.code);
      throw new Error(apiMessage(result));
    }
    unauthorizedNotified = false;
    return result.data;
  }
  return payload as T;
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiResult<T> | T> = await http.request(config);
  return unwrap(response.data);
}

export function get<T>(url: string, params?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "GET", url, params });
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "POST", url, data });
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "PUT", url, data });
}

export function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "PATCH", url, data });
}

export function del<T>(url: string, params?: unknown, config?: AxiosRequestConfig) {
  return request<T>({ ...config, method: "DELETE", url, params });
}

export { clearAuth, getAccount, getToken, setAccount, setToken } from "./token";
