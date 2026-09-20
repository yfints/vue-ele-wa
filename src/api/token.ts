export const TOKEN_KEY = "TOKEN";
export const ACCOUNT_KEY = "ACCOUNT";

/**
 * 只在内存里暂存的 token（不落 localStorage）。
 * 「验证码登录自动建号、还没设置密码」时用它发设置密码的请求，
 * 密码设置成功后再 promotePendingToken() 正式存起来 —— 中途关页面就等于没登录过。
 */
let pendingToken = "";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

/** 请求头用：正式 token 优先，其次临时 token */
export function getAuthToken() {
  return getToken() || pendingToken;
}

export function setPendingToken(token: string) {
  pendingToken = String(token || "");
}

export function clearPendingToken() {
  pendingToken = "";
}

/** 设置密码成功后把临时 token 落盘（已经有正式 token 就不覆盖） */
export function promotePendingToken() {
  if (!pendingToken) return;
  try {
    if (!localStorage.getItem(TOKEN_KEY)) localStorage.setItem(TOKEN_KEY, pendingToken);
  } catch {
    /* 隐私模式下写不了就算了 */
  }
  pendingToken = "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAccount() {
  try {
    return localStorage.getItem(ACCOUNT_KEY) || "";
  } catch {
    return "";
  }
}

export function setAccount(account: string) {
  localStorage.setItem(ACCOUNT_KEY, account);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
  pendingToken = "";
}
