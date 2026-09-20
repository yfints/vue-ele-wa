import type { FormItemRule } from "element-plus";

export interface FieldRule {
  id: string;
  message: string;
  test: (value: string) => boolean;
}

export const PATTERNS = {
  /** 中国大陆 11 位手机号 */
  phone: /^1[3-9]\d{9}$/,
  /** 常见邮箱格式 */
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** 8–20 位，须含字母和数字，允许常见符号 */
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,20}$/,
  /** 6 位数字验证码 */
  smsCode: /^\d{6}$/,
} as const;

/** 与配置里 allowed_email_providers=gmail,outlook 对齐，可后续扩展 */
export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
] as const;

export function required(message: string): FieldRule {
  return {
    id: "required",
    message,
    test: (value) => value.trim().length > 0,
  };
}

export function pattern(re: RegExp, message: string, id = "pattern"): FieldRule {
  return {
    id,
    message,
    test: (value) => re.test(value.trim()),
  };
}

export function minLength(min: number, message: string): FieldRule {
  return {
    id: "minLength",
    message,
    test: (value) => value.trim().length >= min,
  };
}

export function maxLength(max: number, message: string): FieldRule {
  return {
    id: "maxLength",
    message,
    test: (value) => value.trim().length <= max,
  };
}

export function noWhitespace(message = "不能包含空格"): FieldRule {
  return {
    id: "noWhitespace",
    message,
    test: (value) => !/\s/.test(value),
  };
}

export function emailDomain(
  domains: readonly string[] = ALLOWED_EMAIL_DOMAINS,
  message = "请使用 Gmail 或 Outlook 邮箱",
): FieldRule {
  const allowed = new Set(domains.map((item) => item.toLowerCase()));
  return {
    id: "emailDomain",
    message,
    test: (value) => {
      const domain = value.trim().split("@")[1]?.toLowerCase();
      return Boolean(domain && allowed.has(domain));
    },
  };
}

export const phoneRules: FieldRule[] = [
  required("请输入手机号"),
  pattern(PATTERNS.phone, "请输入正确的 11 位手机号", "phone"),
];

export const emailRules: FieldRule[] = [
  required("请输入邮箱"),
  pattern(PATTERNS.email, "请输入正确的邮箱格式", "email"),
  emailDomain(),
];

export const passwordRules: FieldRule[] = [
  required("请输入密码"),
  noWhitespace("密码不能包含空格"),
  minLength(8, "密码至少 8 位"),
  maxLength(20, "密码最多 20 位"),
  pattern(PATTERNS.password, "密码须含字母和数字，长度 8–20 位", "password"),
];

export const smsCodeRules: FieldRule[] = [
  required("请输入验证码"),
  pattern(PATTERNS.smsCode, "请输入 6 位数字验证码", "smsCode"),
];

export const agreeRules: FieldRule[] = [
  {
    id: "agreed",
    message: "请先阅读并同意用户协议",
    test: (value) => value === "true" || value === "1",
  },
];

/** 返回第一条失败信息，全部通过则返回 null */
export function validate(value: string, rules: FieldRule[]): string | null {
  for (const rule of rules) {
    if (!rule.test(value ?? "")) return rule.message;
  }
  return null;
}

export function validateAll(value: string, rules: FieldRule[]): string[] {
  return rules.filter((rule) => !rule.test(value ?? "")).map((rule) => rule.message);
}

export function isValid(value: string, rules: FieldRule[]): boolean {
  return validate(value, rules) === null;
}

export type FieldBag = Record<string, { value: string; rules: FieldRule[] }>;

/** 按字段顺序校验，返回 { field, message }；全部通过返回 null */
export function validateFields(fields: FieldBag): { field: string; message: string } | null {
  for (const [field, item] of Object.entries(fields)) {
    const message = validate(item.value, item.rules);
    if (message) return { field, message };
  }
  return null;
}

export function collectFieldErrors(fields: FieldBag): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, item] of Object.entries(fields)) {
    const message = validate(item.value, item.rules);
    if (message) errors[field] = message;
  }
  return errors;
}

/** 转成 Element Plus 表单规则，后续 el-form 可直接用 */
export function toElementPlusRules(
  rules: FieldRule[],
  trigger: FormItemRule["trigger"] = ["blur", "change"],
): FormItemRule[] {
  return rules.map((rule) => ({
    trigger,
    validator: (_item, value, callback) => {
      if (!rule.test(String(value ?? ""))) callback(new Error(rule.message));
      else callback();
    },
  }));
}

export const elementPlusRules = {
  phone: toElementPlusRules(phoneRules),
  email: toElementPlusRules(emailRules),
  password: toElementPlusRules(passwordRules),
  smsCode: toElementPlusRules(smsCodeRules),
};
