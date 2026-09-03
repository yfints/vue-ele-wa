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
  msg: string;
  data: T;
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
  (response) => response,
  (error: unknown) => {
    const config = axios.isAxiosError(error) ? error.config : undefined;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401) {
      clearAuth();
      if (!config?.skipAuthRedirect) {
        ElMessage.error("登录已过期，请重新登录");
        if (!router.currentRoute.value.path.startsWith("/login")) {
          void router.push("/login/index");
        }
      }
    } else if (axios.isAxiosError(error) && !config?.skipAuthRedirect) {
      const message =
        (error.response?.data as { msg?: string } | undefined)?.msg ||
        error.message ||
        "网络异常，请稍后重试";
      ElMessage.error(message);
    }
    return Promise.reject(error);
  },
);

function unwrap<T>(payload: ApiResult<T> | T): T {
  if (payload && typeof payload === "object" && "code" in payload) {
    const result = payload as ApiResult<T>;
    if (result.code !== 0) {
      ElMessage.error(result.msg || "请求失败");
      throw new Error(result.msg || "请求失败");
    }
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
